

'use strict';


import express from "express";
import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
import { LocateParticleChipByCellTower }  from "./locatechip.js";
import { SecretManagerServiceClient }  from "@google-cloud/secret-manager";


let   secretsClient:any;
let   db:any
const app = express()
const APPVERSION = 879; 
const env = process.env.NODE_ENV === "dev" ? "dev" : "dist";

if (process.platform === 'darwin') {
  secretsClient = new SecretManagerServiceClient({
    projectId: 'purewatertech',
    keyFilename: '/Users/dave/.ssh/purewatertech-57be6d28e11f.json'
  });
  initializeApp({   credential: cert('/Users/dave/.ssh/purewatertech-57be6d28e11f.json')   })
} else { 
  secretsClient = new SecretManagerServiceClient()
  initializeApp()
}

db = getFirestore();




app.get('*.js', (req, res) => {

  if (env === "dev") {

    req.url = process.cwd() + "/static_dev" + req.url;
    res.set('Content-Type', 'application/javascript; charset=UTF-8');

  } else {

    if (req.url === "/sw.js") {
      req.url = process.cwd() + "/static_dist" + req.url;

    } else {
      req.url = process.cwd() + "/static_dist" + req.url.substring(0, req.url.length - 3) + '.min.js.br';
      res.set('Content-Encoding', 'br');

    }

    res.set('Content-Type', 'application/javascript; charset=UTF-8');

  }


  res.sendFile(req.url);

});




app.get('/api/locatechip', (req, res) => {

  LocateParticleChipByCellTower(db, req.query.particleaccount as any, req.query.particleid as any, secretsClient)
    .then(data=> {
      res.status(200).send(JSON.stringify(data))
    })
    .catch(er=> {
      res.status(400).send(er)
    })

})




app.get('/api/appfocusping', (req, res) => {

  let thisAppVersion = Number(req.query.appversion);

  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  if (thisAppVersion === APPVERSION) {
      res.status(200).send("ok");
  } else {
      res.status(200).send("no");
  }

})




app.use(express.static(`static_${env}`));




app.listen( Number(process.env.PORT), () => {
  console.log(`App listening on port ${(process.env.PORT)}`);
});



export default app




