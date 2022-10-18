

'use strict';


//const app = require("~/Code")


const express = require('express');
const fs = require('fs');
const app = express();
const APPVERSION = 605; 
const env = process.env.NODE_ENV === "dev" ? "dev" : "dist";




app.get('*.js', (req, res) => {

  if (env === "dev") {

    req.url = __dirname + "/static_dev" + req.url;
    res.set('Content-Type', 'application/javascript; charset=UTF-8');


  } else {

    if (req.url === "/sw.js") {
      req.url = __dirname + "/static_dist" + req.url;

    } else {
      req.url = __dirname + "/static_dist" + req.url.substring(0, req.url.length - 3) + '.min.js.br';
      res.set('Content-Encoding', 'br');

    }


    res.set('Content-Type', 'application/javascript; charset=UTF-8');

  }


  res.sendFile(req.url);

});




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




app.get(['/'], (req, res) => {

  res.set('Content-Type', 'text/html; charset=UTF-8');


  req.url = __dirname + `/static_${env}/index.html`;


  res.sendFile(req.url);

})




app.use(express.static(`static_${env}`));




app.listen( Number(process.env.PORT), () => {
  console.log(`App listening on port ${(process.env.PORT)}`);
});


module.exports = app;









/*
 *   res.set('Access-Control-Allow-Origin', "*")
  res.set('Access-Control-Allow-Methods', 'GET, POST');

  if (req.method === "OPTIONS") {
    // stop preflight requests here
    res.status(204).send('');
    return;
  }
  
  let thisAppVersion = Number(req.query.appversion);

  if (thisAppVersion === appVersion) {
    res.status(200).send("ok");
  } else {
    res.status(200).send("no");
  } */



/*
    app.get(['/', '/v/*'], (_req, res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.sendFile(__dirname + `/static/index.html`);
    });

    app.get(['/sw.js'], (_req, res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.sendFile(__dirname + `/static/sw.js`);
    });

    app.get(['/pwt.webmanifest'], (_req, res) => {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        res.sendFile(__dirname + `/static/pwt.webmanifest`);
    });





// const https = require("https");
// let key;
// let cert;

// if(process.env.NODE_ENVHTTPS && process.env.NODE_ENVHTTPS.indexOf('development') > -1) {
//     key = fs.readFileSync("localhost-key.pem", "utf-8");
//     cert = fs.readFileSync("localhost.pem", "utf-8");
// }



//const os = require('os');



if (process.platform === 'darwin') {
}
  */

