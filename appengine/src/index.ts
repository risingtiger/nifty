

'use strict';


import * as https from "https";
import { promises as fs, readFileSync } from "fs";
import * as url_util from "url";
import * as path_util from "path";
import express from "express";
import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
// @ts-ignore
import { Init } from "../appengine/src/index_extend.js"




const app = express()
const APPVERSION = 0; 
const env = process.env.NODE_ENV === "dev" ? "dev" : "dist";



app.get('/sw-v*.js$', async (req, res) => {

    const url_without_extension = req.url.substring(0, req.url.length - 3)

    let is_br_file = await does_file_exist(process.cwd() + "/static_dist" + url_without_extension + ".min.js.br")

    const url = is_br_file ? url_without_extension + ".min.js.br" : url_without_extension + ".min.js"

    process_file_request(url, res)

});




app.get(['/','/index.html'], async (_req, res) => {
    const full_url = process.cwd() + `/static_${env}/` + (`index${env==='dev' ? '' : '-v'+APPVERSION}.html`)

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')

    res.sendFile(full_url)
});

app.get('/app-v*.webmanifest$', async (req, res) => {
    process_file_request(req.url, res);
});

app.get('/assets/*\.css$', async (req, res) => {
    process_file_request(req.url, res);
});

app.get(['/assets/media/*\.ico', '/assets/media/*\.png', '/assets/media/*\.gif', '/assets/media/*\.jpg', '/assets/media/*\.svg', '/assets/media/*\.woff2'], async (req, res) => {
    process_file_request(req.url, res);
});

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

});




app.get('/api/appfocusping', (_req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

    console.log("appfocusping APPVERSION: ", APPVERSION)
    res.status(200).send(APPVERSION.toString())

})




if (env === "dist") {
    app.listen( Number(process.env.PORT), () => {
      console.log(`App listening on port ${(process.env.PORT)}`);
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
    //     console.log(`HTTPS App listening on port ${(process.env.PORT)}`);
    // })
}

else {
    app.listen( Number(process.env.PORT), () => {
      console.log(`App listening on port ${(process.env.PORT)}`);
    })
}




Init(initializeApp, getFirestore, cert, app)




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




export default app





