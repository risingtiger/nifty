import { str, ServerInstanceT, ServerMainsT } from "./defs.js"

import express from "express";

import bodyParser from 'body-parser'
import cors from "cors";

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
import Logger from "./logger.js"
import Emailing from "./emailing.js"


declare var INSTANCE:ServerInstanceT // for LSP only


//{--index_instance.js--} 


const STATIC_PREFIX = "static_";
const APPVERSION=0; 


const VAR_NODE_ENV        = process.env.NODE_ENV || 'dev';
const VAR_PORT            = process.env["NIFTY_INSTANCE_"+INSTANCE.INSTANCEID.toUpperCase()+"_PORT"] || process.env.PORT;
const VAR_OFFLINEDATE_DIR = VAR_NODE_ENV === "dev" && process.env.NIFTY_OFFLINEDATA_DIR

const app = express()

let db:any = null;

let sheets:any = {};
//let pubsub:any;
//let pubsub_local:any;




app.use(bodyParser.json())





/*
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
*/


app.get("/favicon.ico", (_req:any, res:any) => {
	res.sendFile(process.cwd() + "/" + STATIC_PREFIX + (VAR_NODE_ENV === "dev" ? "dev/" : "dist/") + '/media/pwticons/favicon.ico')
})
app.get("/apple-touch-icon.png", (_req:any, res:any) => {
	res.sendFile(process.cwd() + "/" +  STATIC_PREFIX + (VAR_NODE_ENV === "dev" ? "dev/" : "dist/") + '/media/pwticons/apple-touch-icon.png')
})
app.get("/apple-touch-icon-precomposed.png", (_req:any, res:any) => {
	res.sendFile(process.cwd() + "/" +  STATIC_PREFIX + (VAR_NODE_ENV === "dev" ? "dev/" : "dist/") + '/media/pwticons/apple-touch-icon-precomposed.png')
})

app.get([
    '/app.webmanifest', 
    '/assets/*file',
    '/sw.js'
], assets_general)





app.post('/api/refresh_auth', refresh_auth)



app.post('/api/firestore_retrieve', firestore_retrieve)
app.post('/api/firestore_add', firestore_add)
app.post('/api/firestore_patch', firestore_patch)
app.post('/api/firestore_delete', firestore_delete)
app.post('/api/firestore_get_batch', firestore_get_batch)



app.post('/api/influxdb_retrieve_series', influxdb_retrieve_series)

app.post('/api/influxdb_retrieve_points', influxdb_retrieve_points)

app.post('/api/influxdb_retrieve_medians', influxdb_retrieve_medians)



//app.get("/api/sse_add_listener", cors({ origin: ['https://purewater.web.app'] }), sse_add_listener)
app.options("/sse_add_listener", cors());
app.get("/sse_add_listener",     cors(), sse_add_listener)




app.post("/api/logger/save", logger_save)
app.get("/api/logger/get",   logger_get)



app.get("/api/notifications_add_subscription", notifications_add_subscription)
app.get("/api/notifications_remove_subscription", notifications_remove_subscription)




app.get(['/index.html','/','/entry/*file'], entry)




app.get('/v/*restofpath', htmlstr)









async function assets_general(req:any, res:any) {
	const fileurl = req.url
    FileRequest.runit(fileurl, res, VAR_NODE_ENV, STATIC_PREFIX);
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

    const result:any = await Firestore.Add(db, SSE, req.body.path, req.body.newdocs)

    if (result.err) {
        res.status(400).send(null)
    } else {
        res.status(200).send(1)
    }
}




async function firestore_patch(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const r = await Firestore.Patch(db, SSE, req.body.pathstrs, req.body.datas, req.body.oldtses)

    res.status(200).send(JSON.stringify(r))
}




async function firestore_delete(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const result = await Firestore.Delete(db, SSE, req.body.path)

    if (result === null) {
        res.status(400).send(null)
    } else {
        res.status(200).send(1)
    }
}




async function firestore_get_batch(req:any, res:any) {

    if (! await validate_request(res, req)) return 

    const results = await Firestore.GetBatch(db, req.body.paths, req.body.tses, req.body.runid)

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




async function logger_save(req:any, res:any) {

	Logger.Save(
		db, 
		req.body.user_email, 
		req.body.device, 
		req.body.browser, 
		req.body.logs)

	res.status(200).send("")
}




async function logger_get(req:any, res:any) {

	const logs = await Logger.Get(db, req.query.user_email)
	res.status(200).send(logs)
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




async function entry(req:any, res:any) {

	//res.set('Cache-Control', 'private, max-age=300');
    const htmlstr = await Entry.runit(req, res, STATIC_PREFIX, VAR_NODE_ENV)
    res.status(200).send(htmlstr)
}




async function htmlstr(_req:any, res:any) {

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

	else {

		const port_num = VAR_NODE_ENV === "dev" ? Number(VAR_PORT) : Number(VAR_PORT)+1

		app.listen( port_num, () => {
			console.info(`HTTP App version ( ${APPVERSION} ) listening on port ${(port_num)}`);
		})
    } 

}



function validate_request(res:any, req:any) {   return new Promise((promiseres)=> {

	if ( (VAR_NODE_ENV === "dev" && VAR_OFFLINEDATE_DIR) || APPVERSION===0 ) {
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

	let servermains:ServerMainsT = {
		app, 
		db, 
		appversion:APPVERSION, 
		sheets, 
		notifications:Notifications, 
		firestore:Firestore, 
		influxdb:InfluxDB, 
		emailing:Emailing,
		sse:SSE,
		validate_request
	}

    INSTANCE.Set_Server_Mains(servermains)
    INSTANCE.Set_Routes()

    startit()
}




(process.openStdin()).addListener("data", async (a:any) => {

	let data = (Buffer.from(a, 'base64').toString()).trim();

	if (data == "start") {
		bootstrapit()
	}
})




bootstrapit()




export default app
