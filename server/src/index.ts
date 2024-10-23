

declare var INSTANCE:INSTANCE_T // for LSP only

import { str, INSTANCE_T, ServerMainsT } from "./defs_server.js"

import fs from "fs";
import https from 'https';
import express from "express";
import bodyParser from 'body-parser'

import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
//import { google as googleapis } from "googleapis";
//import { PubSub }     from "@google-cloud/pubsub";
//import { authenticate } from "@google-cloud/local-auth";

import zlib from 'node:zlib'

import { Firestore } from "./firestore.js"
import { InfluxDB } from "./influxdb.js"
import SSE from "./sse.js"
import Notifications from "./notifications.js"
import FileRequest from "./filerequest.js"
import Entry from "./entry.js"
import HTMLStr from "./htmlstr.js"


//{--index_instance.js--} 


const STATIC_PREFIX = "static_";
const APPVERSION=0; 


const VAR_NODE_ENV = process.env.NODE_ENV || 'dev';
const VAR_PORT = process.env.NIFTY_PORT || process.env.PORT;
const VAR_OFFLINEDATE_DIR = VAR_NODE_ENV === "dev" && process.env.NIFTY_OFFLINEDATA_DIR
const VAR_USE_LOCAL_HTTPS = VAR_NODE_ENV !== "dev" ? true : process.env.NIFTY_USE_LOCAL_HTTPS ? true : false;

const app = express()

let db:any = null;

let sheets:any = {};
//let pubsub:any;
//let pubsub_local:any;




app.use(bodyParser.json())




app.get([
    '/app*.webmanifest$', 
    '/assets/*\.js$',
    '/assets/*\.css$', 
    '/assets/media/*\.ico', 
    '/assets/media/*\.png', 
    '/assets/media/*\.gif', 
    '/assets/media/*\.jpg', 
    '/assets/media/*\.svg', 
    '/assets/media/*\.woff2',
    '/sw*.js$'
], assets_general)




app.get('/api/latest_app_version', latest_app_version)

app.post('/api/refresh_auth', refresh_auth)



app.post('/api/firestore_retrieve', firestore_retrieve)

app.post('/api/firestore_add', firestore_add)

app.post('/api/firestore_patch', firestore_patch)



app.post('/api/influxdb_retrieve_series', influxdb_retrieve_series)

app.post('/api/influxdb_retrieve_points', influxdb_retrieve_points)

app.post('/api/influxdb_retrieve_medians', influxdb_retrieve_medians)



app.get("/api/sse_add_listener", sse_add_listener)



app.get("/api/notifications_add_subscription", notifications_add_subscription)
app.get("/api/notifications_remove_subscription", notifications_remove_subscription)
app.post("/api/notifications_send_msg", notifications_send_msg)




app.get(['/index.html','/','/entry/*'], entry)




app.get('/v', htmlstr)









async function assets_general(req:any, res:any) {
	const fileurl = req.url
    FileRequest.runit(fileurl, res, VAR_NODE_ENV, STATIC_PREFIX);
}




async function latest_app_version(_req:any, res:any) {
	res.status(200).send(APPVERSION.toString())
}




async function refresh_auth(req:any, res:any) {

    const url = `https://securetoken.googleapis.com/v1/token?key=${INSTANCE.IDENTITY_PLATFORM_API}`
     
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${req.body.refresh_token}`
    })
    .then(async (result:any) => {
        const data = await result.json()
        res.status(200).send(JSON.stringify(data))
    })
    .catch((err:any) => {
        res.status(401).send(err)
    })
}




async function firestore_retrieve(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const results = await Firestore.Retrieve(db, req.body.paths, req.body.opts)

    const jsoned = JSON.stringify(results)
    zlib.brotliCompress(jsoned, {
        params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        },

    }, (_err:any, result:any) => {
        res.set('Content-Encoding', 'br');
        res.status(200).send(result)
    })
}




async function firestore_add(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const return_data = { result: "", err: "" }

    const result:any = await Firestore.Add(db, req.body.path, req.body.newdocs)

    if (result.err) {
        return_data.err = "not ok"
        res.status(400).send(JSON.stringify(return_data))
    } else {
        res.status(200).send(JSON.stringify(result))
    }
}




async function firestore_patch(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const return_data = { result: "", err: "" }

    await Firestore.Patch(db, req.body.paths, req.body.data, req.body.opts)

    return_data.result = "ok"
    res.status(200).send(JSON.stringify(return_data))
}




async function influxdb_retrieve_series(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const rb = req.body

    const results = await InfluxDB.Retrieve_Series(rb.bucket, rb.begins, rb.ends, rb.msrs, rb.fields, rb.tags, rb.intrv, rb.priors)

    const jsoned = JSON.stringify(results)
    zlib.brotliCompress(jsoned, {
        params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        },

    }, (_err:any, result:any) => {
        res.set('Content-Encoding', 'br');
        res.status(200).send(result)
    })
}




async function influxdb_retrieve_points(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const rb = req.body

    const results = await InfluxDB.Retrieve_Points(rb.bucket, rb.begins, rb.ends, rb.msrs, rb.fields, rb.tags)

    const jsoned = JSON.stringify(results)
    zlib.brotliCompress(jsoned, {
        params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        },

    }, (_err:any, result:any) => {
        res.set('Content-Encoding', 'br');
        res.status(200).send(result)
    })
}




async function influxdb_retrieve_medians(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const rb = req.body

    const results = await InfluxDB.Retrieve_Medians(rb.bucket, rb.begins, rb.ends, rb.dur_amounts, rb.dur_units, rb.msrs, rb.fields, rb.tags, rb.aggregate_fn)

    const jsoned = JSON.stringify(results)
    zlib.brotliCompress(jsoned, {
        params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
        },

    }, (_err:any, result:any) => {
        res.set('Content-Encoding', 'br');
        res.status(200).send(result)
    })
}




async function sse_add_listener(req:any, res:any) {

    SSE.Add_Listener(req, res)
}




async function notifications_add_subscription(req:any, res:any) {

    if (! await validate_request(res, req)) return 


    const user_email:str = req.query.user_email as string
    const fcm_token:str = req.query.fcm_token as string

    await Notifications.Add_Subscription(db, fcm_token, user_email)

    res.status(200).send(JSON.stringify({message:"saved"}))
}




async function notifications_remove_subscription(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const user_email:str = req.query.user_email as string

    await Notifications.Remove_Subscription(db, user_email)

    res.status(200).send(JSON.stringify({message:"saved"}))
}




async function notifications_send_msg(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    await Notifications.Send_Msg(db, req.body.title, req.body.body, req.body.tags)

    res.status(200).send(JSON.stringify({message:"msg send"}))
}




async function entry(req:any, res:any) {

	//res.set('Cache-Control', 'private, max-age=300');
    const htmlstr = await Entry.runit(req, res, STATIC_PREFIX, VAR_NODE_ENV)
    res.status(200).send(htmlstr)
}




async function htmlstr(req:any, res:any) {

	debugger
	//res.set('Cache-Control', 'private, max-age=300');
	res.set('Content-Type', 'text/html; charset=UTF-8');
	res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')

    const htmlstr = await HTMLStr.runit(STATIC_PREFIX, VAR_NODE_ENV)
    res.status(200).send(htmlstr)
}





// END ROUTES












async function init() { return new Promise(async (res, _rej)=> {

    if ( (VAR_NODE_ENV === "dev" || VAR_NODE_ENV === "dist") && !VAR_OFFLINEDATE_DIR)  {

		/*
		const googleauth = new googleapis.auth.GoogleAuth({
			//keyFile: INSTANCE.SHEETS_KEYJSONFILE,
			keyFile: '/Users/dave/.ssh/xenfinancesheets_key.json',
			scopes: ['https://www.googleapis.com/auth/spreadsheets'],
		})
		let google_auth:any = await googleauth.getClient();
		sheets = googleapis.sheets({version: 'v4', auth: google_auth});
		*/

		initializeApp({   credential: cert(INSTANCE.KEYJSONFILE)   })
		db = getFirestore();
    } 

    else if (VAR_NODE_ENV === 'gcloud') { 

        /*
        const googleauth = new googleapis.auth.GoogleAuth({
            keyFile: process.cwd() + '/sheets_key.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })
        let google_auth:any = await googleauth.getClient();
        sheets = googleapis.sheets({version: 'v4', auth: google_auth});
        */

        initializeApp()
        db = getFirestore();

    } else {
		//
	}

    res(1)
})}


async function startit() {

    if (VAR_NODE_ENV === 'gcloud') {

        app.listen( Number(VAR_PORT), () => {
            console.info(`HTTPS App listening on port ${(VAR_PORT)}`);
        })
    }

	else if ( VAR_USE_LOCAL_HTTPS )  {

		const https_options = {
			key: fs.readFileSync("/Users/dave/.ssh/localhost-key.pem"),
			cert: fs.readFileSync("/Users/dave/.ssh/localhost.pem")
		}
		
		https.createServer(https_options, app).listen( Number(VAR_PORT), () => {
			console.info(`HTTPS App version ( ${APPVERSION} ) listening on port ${(VAR_PORT)}`);
		})
	}

	else {

		app.listen( Number(VAR_PORT), () => {
			console.info(`HTTP App version ( ${APPVERSION} ) listening on port ${(VAR_PORT)}`);
		})
    } 

}



function validate_request(res:any, req:any) {   return new Promise((promiseres)=> {

	if (VAR_NODE_ENV === "dev" && VAR_OFFLINEDATE_DIR) {
		promiseres(true)
	}

	else {
		const appversion = Number(req.headers.appversion)
		
		if (appversion !== APPVERSION) {
			res.status(410).send("appversion is not valid")
			promiseres(false)
			return false
		}
		

		const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);

		getAuth()

		.verifyIdToken(id_token)

		.then((_decodedToken) => {
			promiseres(true)
		})

		.catch((_error) => {
			res.status(401).send("id_token is not valid")
			promiseres(false)
		})
	}

})}




async function bootstrapit() {

    await init()

	let servermains:ServerMainsT = {app, db, appversion:APPVERSION, sheets, notifications:Notifications, firestore:Firestore, influxdb:InfluxDB, validate_request}
    INSTANCE.Set_Server_Mains(servermains)
    INSTANCE.Set_Routes()

    startit()
}

bootstrapit()




export default app





