

'use strict';


import { promises as fs } from "fs";
import express from "express";
import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
// @ts-ignore
import { Init } from "../appengine/src/index_extend.js"




const app = express()
const APPVERSION = 0; 
const env = process.env.NODE_ENV === "dev" ? "dev" : "dist";




app.get('*\.js$', async (req, res) => {

    const url_without_extension = req.url.substring(0, req.url.length - 3)

    if (env === "dev") {

        req.url = process.cwd() + "/static_dev" + req.url;
        res.set('Content-Type', 'application/javascript; charset=UTF-8');

    } else {

        if (req.url === "/sw.js") {

            req.url = process.cwd() + "/static_dist" + req.url;

        } else {

            let is_br_file = await does_file_exist(process.cwd() + "/static_dist" + url_without_extension + ".min.js.br")

            if (is_br_file) {
                req.url = process.cwd() + "/static_dist" + url_without_extension + ".min.js.br"
                res.set('Content-Encoding', 'br');
            }

            else {
                req.url = process.cwd() + "/static_dist" + url_without_extension + ".min.js"
            }

        }

        res.set('Content-Type', 'application/javascript; charset=UTF-8');

    }

    res.sendFile(req.url);

});




app.get('/api/appfocusping', (_req, res) => {

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    console.log("appfocusping APPVERSION: ", APPVERSION)
    res.status(200).send(APPVERSION.toString())



})




app.use(express.static(`static_${env}`));




app.listen( Number(process.env.PORT), () => {
  console.log(`App listening on port ${(process.env.PORT)}`);
});




Init(initializeApp, getFirestore, cert, app)




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





