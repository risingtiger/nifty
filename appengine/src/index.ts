

type str = string; type int = number; type bool = boolean;


'use strict';



import https from 'https';
import fetch from 'node-fetch';
import { promises as fs } from "fs";
import path from 'path'
import { existsSync, readFileSync } from "fs";
import * as url_util from "url";
import * as path_util from "path";
import express from "express";
import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
import { SecretManagerServiceClient }  from "@google-cloud/secret-manager";
import { Firestore } from "./firestore.js"
import { InfluxDB } from "./influxdb.js"
//import { authenticate as googleauthenticate } from '@google-cloud/local-auth'
import { google as googleapis} from 'googleapis'
// @ts-ignore
import { Init, projectId, keyFilename, identity_platform_api } from "../appengine/src/index_extend.js"
import bodyParser from 'body-parser'
import compression from 'compression'




const app = express()

const APPVERSION = 0; 
const env = process.env.NODE_ENV === "dev" ? "dev" : "dist";

let secrets_client:any;
let sheets:any;
const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SHEETS_TOKEN_PATH = path.join(process.cwd(), 'token.json');
const SHEETS_CREDENTIALS_PATH = path.join(process.cwd(), 'sheets_credentials.json');
let db:any;

app.use(bodyParser.json())
app.use(compression({ filter: should_compress }))


if (process.platform === 'darwin') {
    secrets_client = new SecretManagerServiceClient({
        projectId,
        keyFilename
    });

    const serviceAccount = JSON.parse(readFileSync(keyFilename, 'utf8')) as any
    console.log(serviceAccount.client_email)
    sheets = googleapis.sheets({version: 'v4', auth: new googleapis.auth.JWT(
        serviceAccount.client_email,
        null,
        serviceAccount.private_key,
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
    )});

    initializeApp({   credential: cert(keyFilename)   })
} 

else { 
    secrets_client = new SecretManagerServiceClient()
    initializeApp()
}

db = getFirestore();




app.get('/sw-v*.js$', async (req, res) => {

    process_file_request(req.url, res)
})




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

    //if (url.includes("views/upgrade")) 
    //    url = `./lazy/views/upgrade-v${APPVERSION}.js`

    process_file_request(req.url, res)
})




/*
app.get('/api/appfocusping', (_req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

    res.status(200).send(APPVERSION.toString())
})
*/




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

    //const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);

    const paths = Array.isArray(req.body.paths) ? req.body.paths : [req.body.paths]
    const opts = req.body.opts

    Firestore.Retrieve(db, paths, opts).then((results:any)=> {
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(results))
    }).catch((err:str)=> {
        res.status(401).send(err)
    })

    req.headers['x-compression'] = "true"
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




app.post('/api/influxdb_retrieve', async (req, res) => {

    const rb = req.body

    InfluxDB.Retrieve(rb.bucket, rb.begins, rb.ends, rb.msrs, rb.fields, rb.tags, rb.intrv, rb.priors).then((results:any)=> {
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(results))
    }).catch((err:str)=> {
        res.status(401).send(err)
    })

    req.headers['x-compression'] = "true"
})




app.post('/api/influxdb_retrieve_points', async (req, res) => {

    const rb = req.body

    InfluxDB.Retrieve_Points(rb.bucket, rb.begins, rb.ends, rb.msrs, rb.fields, rb.tags).then((results:any)=> {
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(results))
    }).catch((err:str)=> {
        res.status(401).send(err)
    })

    req.headers['x-compression'] = "true"
})




app.post('/api/influxdb_retrieve_medians', async (req, res) => {

    const rb = req.body

    InfluxDB.Retrieve_Medians(rb.bucket, rb.begins, rb.ends, rb.dur_amounts, rb.dur_units, rb.msrs, rb.fields, rb.tags, rb.aggregate_fn).then((results:any)=> {
        res.setHeader('Appversion', APPVERSION);
        res.status(200).send(JSON.stringify(results))
    }).catch((err:str)=> {
        res.status(401).send(err)
    })

    req.headers['x-compression'] = "true"
})



if (env === "dist") {
    /*
    app.listen( Number(process.env.PORT), () => {
      console.info(`App listening on port ${(process.env.PORT)}`);
    })
    */

    const https_options = {
        key: readFileSync(process.cwd() + "/localhost-key.pem"),
        cert: readFileSync(process.cwd() + "/localhost.pem")
    }
    
    
    const https_server = https.createServer(https_options, app)
    
    https_server.listen( Number(process.env.PORT), () => {
        console.info(`HTTPS App version ( ${APPVERSION} ) listening on port ${(process.env.PORT)}`);
    })
}

else {
    app.listen( Number(process.env.PORT), () => {
      console.info(`App listening on port ${(process.env.PORT)}`);
    })
}




Init(app, db, secrets_client, sheets)




function process_file_request(url:str, res:any)  {

    res.set('Cache-Control', 'private, max-age=300');

    var parsed = url_util.parse(url);

    const extension = path_util.extname(parsed.pathname)

    const pathname = parsed.pathname
    let path = process.cwd() + `/static_${env}${pathname.replace("/assets/", "/")}` // if asset is in path remove it

    switch (extension) {
        case ".html":
            res.set('Content-Type', 'text/html; charset=UTF-8');
            break;

        case ".js":
            res.set('Content-Type', 'application/javascript; charset=UTF-8');
            if (env === "dist") {   path = convert_path_to_br_or_just_min(path, extension, res)   }
            break;

        case ".css":
            res.set('Content-Type', 'text/css; charset=UTF-8');
            if (env === "dist") {   path = convert_path_to_br_or_just_min(path, extension, res)   }
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


    function convert_path_to_br_or_just_min(path:str, extension:str, res:any) : str {

        let url = ""

        const path_without_extension = path.substring(0, path.length - extension.length)

        let is_br_file = existsSync(path_without_extension + `.min${extension}.br`)

        if (is_br_file) {
            url = path_without_extension + `.min${extension}.br`
            res.set('Content-Encoding', 'br');

        } else {
            url = path_without_extension + `.min${extension}`
        }

        return url
    }
}




function does_file_exist (path:string) {  
    return new Promise(async (resolve, _reject) => {
        try {
            await fs.access(path)
            resolve(true)
        } catch {
            resolve(false)
        }
    })

}




function should_compress(req:any, _res:any) {

    if (req.headers['x-compression']) {
        return true
    }

    return false
}




/*
async function loadSavedCredentialsIfExist() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    } catch (err) {
        return null;
    }
}
*/


export default app





