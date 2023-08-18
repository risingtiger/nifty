

'use strict';


import fetch from 'node-fetch';
import { promises as fs } from "fs";
import * as url_util from "url";
import * as path_util from "path";
import express from "express";
import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
import { SecretManagerServiceClient }  from "@google-cloud/secret-manager";
import { Firestore_Server_Get, Firestore_Server_Patch } from "./firestore_server.js"
// @ts-ignore
import { Init, projectId, keyFilename } from "../appengine/src/index_extend.js"
import bodyParser from 'body-parser'
import compression from 'compression'



const app = express()

const APPVERSION = 0; 
const env = process.env.NODE_ENV === "dev" ? "dev" : "dist";

let secrets_client:any;
let db:any;

app.use(bodyParser.json())
app.use(compression({ filter: should_compress }))


if (process.platform === 'darwin') {
    secrets_client = new SecretManagerServiceClient({
        projectId,
        keyFilename
    });

    initializeApp({   credential: cert(keyFilename)   })
} 

else { 
    secrets_client = new SecretManagerServiceClient()
    initializeApp()
}

db = getFirestore();




app.get('/sw-v*.js$', async (req, res) => {

    const url_without_extension = req.url.substring(0, req.url.length - 3)

    let is_br_file = await does_file_exist(process.cwd() + "/static_dist" + url_without_extension + ".min.js.br")

    const url = is_br_file ? url_without_extension + ".min.js.br" : url_without_extension + ".min.js"

    process_file_request(url, res)
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

    process_file_request(req.url, res);
})




app.get(['/assets/media/*\.ico', '/assets/media/*\.png', '/assets/media/*\.gif', '/assets/media/*\.jpg', '/assets/media/*\.svg', '/assets/media/*\.woff2'], async (req, res) => {

    process_file_request(req.url, res);
})




app.get(['/assets/*\.js$', '/sw*.js$'], async (req, res) => {

    let url = req.url

    if (env !== "dev") {

        if (url.includes("views/upgrade")) 
            url = `/assets/lazy/views/upgrade-v${APPVERSION}.js`

        const url_without_extension = url.substring(0, url.length - 3)

        let is_br_file = await does_file_exist(process.cwd() + "/static_dist" + url_without_extension + ".min.js.br")

        url = is_br_file ? url_without_extension + ".min.js.br" : url_without_extension + ".min.js"

    }

    process_file_request(url, res)
})




app.get('/api/appfocusping', (_req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

    res.status(200).send(APPVERSION.toString())
})




app.post('/api/firestore_get', async (req, res) => {

    const token = req.headers.authorization?.substring(7, req.headers.authorization?.length);
    const refresh_token = req.body.refresh_token || null
    let return_refresh_token:str
    let return_refresh_token_expires_in:str
    const return_data = {
        results: [],
        err: null,
        refresh_token: null,
        refresh_token_expires_in: null
    }

    if (refresh_token) {
        const url = `https://securetoken.googleapis.com/v1/token?key=AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI`
         
        const fetchauth = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=refresh_token&refresh_token=${refresh_token}`
        })
        
        const data:any = await fetchauth.json()

        return_refresh_token = data.refresh_token
        return_refresh_token_expires_in = data.expires_in
    }

    if (refresh_token && !return_refresh_token) {
        res.status(401).send("Unauthorized")
        return
    }

    const whats = Array.isArray(req.body.whats) ? req.body.whats : [req.body.whats]

    if (return_refresh_token) {
        return_data.refresh_token = return_refresh_token
        return_data.refresh_token_expires_in = return_refresh_token_expires_in
    }

    Firestore_Server_Get(whats, req.body.opts, token).then((results:any)=> {
        return_data.results = results
        res.status(200).send(JSON.stringify(return_data))
    }).catch((err:str)=> {
        return_data.err = err
        res.status(200).send(JSON.stringify(return_data))
    })

    req.headers['x-compression'] = "true"
})




app.post('/api/firestore_patch', async (req, res) => {

    const token = req.headers.authorization?.substring(7, req.headers.authorization?.length);
    const refresh_token = req.body.refresh_token || null
    let return_refresh_token:str
    let return_refresh_token_expires_in:str
    const return_data = {
        result: "",
        err: null,
        refresh_token: null,
        refresh_token_expires_in: null
    }

    if (refresh_token) {
        const url = `https://securetoken.googleapis.com/v1/token?key=AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI`
         
        const fetchauth = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `grant_type=refresh_token&refresh_token=${refresh_token}`
        })
        
        const data:any = await fetchauth.json()

        return_refresh_token = data.refresh_token
        return_refresh_token_expires_in = data.expires_in
    }

    if (refresh_token && !return_refresh_token) {
        res.status(401).send("Unauthorized")
        return
    }

    //const body = { what, mask, data, refresh_token: "" }

    if (return_refresh_token) {
        return_data.refresh_token = return_refresh_token
        return_data.refresh_token_expires_in = return_refresh_token_expires_in
    }

    Firestore_Server_Patch(req.body.what, req.body.mask, req.body.data, token).then((result:any)=> {
        if (result.ok) {
            return_data.result = "ok"
            res.status(200).send(JSON.stringify(return_data))
        } else {
            return_data.err = "not ok"
            res.status(200).send(JSON.stringify(return_data))
        }
    }).catch((err:str)=> {
        return_data.err = err
        res.status(200).send(JSON.stringify(return_data))
    })
})




if (env === "dist") {
    app.listen( Number(process.env.PORT), () => {
      console.info(`App listening on port ${(process.env.PORT)}`);
    })
    // const https_options = {
    //     key: readFileSync(process.cwd() + "/localhost-key.pem"),
    //     cert: readFileSync(process.cwd() + "/localhost.pem")
    // }
    //
    //
    // let https_server:any
    // if (env === "dist") {
    //     https_server = https.createServer(https_options, app)
    // }
    //
    // https_server.listen( Number(process.env.PORT), () => {
    //     console.info(`HTTPS App listening on port ${(process.env.PORT)}`);
    // })
}

else {
    app.listen( Number(process.env.PORT), () => {
      console.info(`App listening on port ${(process.env.PORT)}`);
    })
}




Init(app, db, secrets_client)




function process_file_request(url:str, res:any)  {

    res.set('Cache-Control', 'private, max-age=300');

    var parsed = url_util.parse(url);

    const extension = path_util.extname(parsed.pathname)

    const pathname = parsed.pathname
    const path = process.cwd() + `/static_${env}${pathname.replace("/assets/", "/")}` // if asset is in path remove it

    switch (extension) {
        case ".html":
            res.set('Content-Type', 'text/html; charset=UTF-8');
            break;
        case ".js":
            res.set('Content-Type', 'application/javascript; charset=UTF-8');
            break;
        case ".css":
            res.set('Content-Type', 'text/css; charset=UTF-8');
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

    res.sendFile(path);

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




export default app





