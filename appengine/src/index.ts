

type str = string; type int = number; //type bool = boolean;



'use strict';




import http2 from 'http2';
import http2Express from 'http2-express-bridge'
import fetch from 'node-fetch';
import url_util from 'url'
import fs from "fs";
import * as path_util from "path";
import express from "express";
import { PubSub }     from "@google-cloud/pubsub";
import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
import { SecretManagerServiceClient }  from "@google-cloud/secret-manager";
import DeviceDetector from "node-device-detector";
import bodyParser from 'body-parser'
import zlib from 'node:zlib'
import { Firestore } from "./firestore.js"
import { InfluxDB } from "./influxdb.js"
import { Admin_Firestore_Update_Collection_Docs, Admin_Firestore_Misc_Get }  from "./admin_firestore.js"
import { SSEvents } from "./sse.js"
import { WebPush_Add_Subscription, WebPush_Send_Msg  } from "./messaging.js"
// @ts-ignore
import { Init, projectId, keyFilename, identity_platform_api } from "../appengine/src/index_extend.js"


//import { google as googleapis } from "googleapis";
//import { authenticate } from "@google-cloud/local-auth";


const app = http2Express(express)

const APPVERSION = 0; 
const env = process.env.NODE_ENV === "dev" ? "dev" : "dist";
const run_ssl = process.env.NO_SSL ? false : true;

let secrets_client:any;
//let google_sheets:any;
//let google_auth:any;

let db:any;

let pubsub:any;
let pubsubSubscriptionForLocalUse:any;

//const GSHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
//const GSHEETS_TOKEN_PATH = path.join(process.cwd(), 'token.json');
//const GSHEETS_CREDENTIALS_PATH:str = '/Users/dave/.ssh/g_sheets_credentials.json';


app.use(bodyParser.json())

const detector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false,
})

async function initit() {
    if (process.platform === 'darwin') {

        secrets_client = new SecretManagerServiceClient({
            projectId,
            keyFilename
        });

        //const googleauth = new googleapis.auth.GoogleAuth({
        //    keyFile: keyFilename,
        //    scopes: GSHEETS_SCOPES,
        //})
        //google_auth = await googleauth.getClient();
        //google_sheets = googleapis.sheets({version: 'v4', auth: google_auth});

        initializeApp({   credential: cert(keyFilename)   })
        db = getFirestore();
    } 

    else { 

        //const googleauth = new googleapis.auth.GoogleAuth({
        //    scopes: GSHEETS_SCOPES,
        //})
        //google_auth = await googleauth.getClient();
        //google_sheets = googleapis.sheets({version: 'v4', auth: google_auth});

        secrets_client = new SecretManagerServiceClient()
        initializeApp()
        db = getFirestore();
    }


    Init(app, db, Firestore, secrets_client, APPVERSION)
}

initit()




app.get(['/','/index.html'], async (_req, res) => {

    const full_url = process.cwd() + `/static_${env}/` + (`index${env==='dev' ? '' : '-v'+APPVERSION}.html`)

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')

    res.sendFile(full_url)
})




app.get('/app*.webmanifest$', async (req, res) => {

    process_file_request(req.url, res);
})




app.get('/assets/*\.css$', async (req, res) => {

    process_file_request(req.url, res)
})




app.get(['/assets/media/*\.ico', '/assets/media/*\.png', '/assets/media/*\.gif', '/assets/media/*\.jpg', '/assets/media/*\.svg', '/assets/media/*\.woff2'], async (req, res) => {

    process_file_request(req.url, res);
})




app.get(['/assets/*\.js$', '/sw*.js$'], async (req, res) => {
    
    process_file_request(req.url, res)
})




app.post('/api/firestore_refresh_auth', async (req, res) => {

    const url = `https://securetoken.googleapis.com/v1/token?key=${identity_platform_api}`
     
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${req.body.refresh_token}`
    })
    .then(async (result:any) => {
        const data = await result.json()
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(data))
    })
    .catch((err:any) => {
        res.status(401).send(err)
    })
})




app.post('/api/firestore_retrieve', async (req, res) => {

    const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);

    Firestore.Retrieve(db, req.body.paths, req.body.opts, id_token)

    .then((results:any)=> {

        const jsoned = JSON.stringify(results)
        zlib.brotliCompress(jsoned, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
                [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            },

        }, (_err:any, result:any) => {
            res.set('Content-Encoding', 'br');
            res.setHeader('Appversion', APPVERSION);
            res.status(200).send(result)
        })
    })

    .catch((err:str)=> {
        res.status(401).send(err)
    })
})




app.post('/api/firestore_add', async (req, res) => {

    const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);

    const return_data = {
        result: "",
        err: null,
    }

    Firestore.Add(db, req.body.path, req.body.newdocs, id_token, projectId).then((result:any)=> {

        if (result.ok) {
            return_data.result = "ok"
            res.setHeader('Appversion', APPVERSION);
            res.status(200).send(JSON.stringify(return_data))
        } else {
            return_data.err = "not ok"
            res.status(400).send(JSON.stringify(return_data))
        }

    }).catch((err:str)=> {
        return_data.err = err
        res.status(400).send(JSON.stringify(return_data))
    })
})




app.post('/api/firestore_patch', async (req, res) => {

    const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);

    const return_data = {
        result: "",
        err: null,
    }

    Firestore.Patch(db, req.body.path, req.body.mask, req.body.data, id_token, projectId).then((result:any)=> {

        if (result.ok) {
            return_data.result = "ok"
            res.setHeader('Appversion', APPVERSION);
            res.status(200).send(JSON.stringify(return_data))
        } else {
            return_data.err = "not ok"
            res.status(400).send(JSON.stringify(return_data))
        }

    }).catch((err:str)=> {
        return_data.err = err
        res.status(400).send(JSON.stringify(return_data))
    })
})




app.post('/api/influxdb_retrieve_series', async (req, res) => {

    const rb = req.body

    InfluxDB.Retrieve_Series(rb.bucket, rb.begins, rb.ends, rb.msrs, rb.fields, rb.tags, rb.intrv, rb.priors).then((results:any)=> {

        const jsoned = JSON.stringify(results)
        zlib.brotliCompress(jsoned, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
                [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            },

        }, (_err:any, result:any) => {
            res.set('Content-Encoding', 'br');
            res.setHeader('Appversion', APPVERSION);
            res.status(200).send(result)
        })

    }).catch((err:str)=> {
        res.status(401).send(err)
    })
})




app.post('/api/influxdb_retrieve_points', async (req, res) => {

    const rb = req.body

    InfluxDB.Retrieve_Points(rb.bucket, rb.begins, rb.ends, rb.msrs, rb.fields, rb.tags).then((results:any)=> {

        const jsoned = JSON.stringify(results)
        zlib.brotliCompress(jsoned, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
                [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            },

        }, (_err:any, result:any) => {
            res.set('Content-Encoding', 'br');
            res.setHeader('Appversion', APPVERSION);
            res.status(200).send(result)
        })

    }).catch((err:str)=> {
        res.status(401).send(err)
    })
})




app.post('/api/influxdb_retrieve_medians', async (req, res) => {

    const rb = req.body

    InfluxDB.Retrieve_Medians(rb.bucket, rb.begins, rb.ends, rb.dur_amounts, rb.dur_units, rb.msrs, rb.fields, rb.tags, rb.aggregate_fn).then((results:any)=> {

        const jsoned = JSON.stringify(results)
        zlib.brotliCompress(jsoned, {
            params: {
                [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
                [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            },

        }, (_err:any, result:any) => {
            res.set('Content-Encoding', 'br');
            res.setHeader('Appversion', APPVERSION);
            res.status(200).send(result)
        })

    }).catch((err:str)=> {
        res.status(401).send(err)
    })
})




app.get('/api/admin_firestore_update_collection_docs', async (_req:any, res:any) => {

    const results = await Admin_Firestore_Update_Collection_Docs(db).catch((err:str)=> res.status(400).send(err))

    res.setHeader('Appversion', APPVERSION);
    res.status(200).send(JSON.stringify(results))
})




app.get('/api/admin_firestore_misc_get', async (_req:any, res:any) => {

    const results = await Admin_Firestore_Misc_Get(db).catch((err:str)=> res.status(400).send(err))

    res.setHeader('Appversion', APPVERSION);
    res.status(200).send(JSON.stringify(results))
})




app.get("/api/listen_begin", (req, res) => {
    SSEvents.Begin(req, res)
})




app.get("/api/listen_test_trigger", (_req, res) => {
    SSEvents.TriggerUpdate(SSEvents.SSE_Triggers.FIRESTORE, ["machines/vprViTeUk9uHmTIzkkiH/statuses"])

    res.setHeader('Appversion', APPVERSION)
    res.status(200).send(JSON.stringify({message:"triggered"}))
})




app.get("/api/webpush_add_subscription", async (req, res) => {

    res.setHeader('Appversion', APPVERSION)

    const user_email:str = req.query.user_email as string
    const fcm_token:str = req.query.fcm_token as string

    const detect_device = detector.detect(req.headers['user-agent'])

    await WebPush_Add_Subscription(db, fcm_token, user_email, detect_device)

    .then(()=> res.status(200).send(JSON.stringify({message:"saved"})))

    .catch((err:str)=> error_catch_all(res, err, 400, "failed to save token"))
})




app.post("/api/webpush_send_msg", async (req, res) => {

    res.setHeader('Appversion', APPVERSION)

    await WebPush_Send_Msg(db, req.body.title, req.body.body, req.body.tags)

    .then((_r)=> { res.status(200).send(JSON.stringify({message:"msg send"})); })

    .catch((err:str)=> error_catch_all(res, err, 400, "failed to send msg"))
})




if (process.platform === 'darwin') {

    if (run_ssl) {
        const https_options = {
            key: fs.readFileSync(process.cwd() + "/localhost-key.pem"),
            cert: fs.readFileSync(process.cwd() + "/localhost.pem")
        }
        
        const s = http2.createSecureServer(https_options, app)
        
        s.listen( Number(process.env.PORT), () => {
            console.info(`HTTPS App version ( ${APPVERSION} ) listening on port ${(process.env.PORT)}`);
        })

    } else {
        app.listen( Number(process.env.PORT), () => {
            console.info(`App version ( ${APPVERSION} ) listening on port ${(process.env.PORT)}`);
        })
    }

} else {
    const s = http2.createSecureServer({}, app)
    s.listen( Number(process.env.PORT), () => {
      console.info(`App listening on port ${(process.env.PORT)}`);
    })
}








function error_catch_all(res:any, err:any, httpstatus:int, msg:str) {
    console.error(err)
    res.status(httpstatus).send(JSON.stringify({message:msg}))
}




function process_file_request(url:str, res:any)  {
     
    return new Promise(async (resolve, _reject) => {

        res.set('Cache-Control', 'private, max-age=300');

        const parsed = url_util.parse(url);

        const extension = path_util.extname(parsed.pathname)

        const pathname = parsed.pathname
        let path = process.cwd() + `/static_${env}${pathname.replace("/assets/", "/")}` // if asset is in path remove it

        switch (extension) {
            case ".html":
                res.set('Content-Type', 'text/html; charset=UTF-8');
                break;

            case ".js":
                res.set('Content-Type', 'application/javascript; charset=UTF-8');
                if (env === "dist") {   path = await convert_path_to_br_or_just_min(path, extension, res)   }
                break;

            case ".css":
                res.set('Content-Type', 'text/css; charset=UTF-8');
                if (env === "dist") {   path = await convert_path_to_br_or_just_min(path, extension, res)   }
                break;

            case ".png":
                res.set('Content-Type', 'image/png');
                break;

            case ".jpg":
                res.set('Content-Type', 'image/jpeg');
                break;

            case ".svg":
                res.set('Content-Type', 'image/svg+xml');
                break;

            case ".gif":
                res.set('Content-Type', 'image/gif');
                break;

            case ".ico":
                res.set('Content-Type', 'image/x-icon');
                break;

            case ".woff2":
                res.set('Content-Type', 'font/woff2');
                break;

            case ".webmanifest":
                res.set('Content-Type', 'application/manifest; charset=UTF-8');
                break;
        }

        res.sendFile(path)

        resolve(true)
    })


    async function convert_path_to_br_or_just_min(path:str, extension:str, res:any) {

        return new Promise<str>(async (resolve, _reject) => {

            let url = ""

            const path_without_extension = path.substring(0, path.length - extension.length)

            let is_br_file = await fs.promises.access(path_without_extension + `.min${extension}.br`).then(()=> true).catch(()=> false)

            if (is_br_file) {
                url = path_without_extension + `.min${extension}.br`
                res.set('Content-Encoding', 'br');

            } else {
                url = path_without_extension + `.min${extension}`
            }

            resolve( url )
        })
    }
}




(process.openStdin()).addListener("data", async (a) => {

    let data = (Buffer.from(a, 'base64').toString()).trim();

    if (data === "pubsub") {

        let configPubSub = {
            gcpProjectId: projectId,
            gcpPubSubSubscriptionName: 'main_cli',
            gcpServiceAccountKeyFilePath: keyFilename
        }

        pubsub = new PubSub({
            projectId: configPubSub.gcpProjectId,

            keyFilename: configPubSub.gcpServiceAccountKeyFilePath,
        })

        pubsubSubscriptionForLocalUse = pubsub.subscription(configPubSub.gcpPubSubSubscriptionName);

        pubsubSubscriptionForLocalUse.on('message', (message:any) => {
            //routePubIn(message)
            message.ack();
        })
    }

    else if (data === "ssetrigger") {
        SSEvents.TriggerUpdate(SSEvents.SSE_Triggers.FIRESTORE, ["machines/vprViTeUk9uHmTIzkkiH/statuses"])
    }
})


export default app





