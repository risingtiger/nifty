/*
*/
import { InitInterval as SwitchStation_InitInterval } from './switchstation.js';
import  './thirdparty/lit-html.js';
import  './libs/suckinjs.js';
import  './libs/firebase.js';


declare var APPVERSION:number;




window.addEventListener("load", async () => {


  if (APPVERSION > 0)
    await navigator.serviceWorker.register("/sw.js", {   scope: "/"   });

  SwitchStation_InitInterval(); // dummy call to keep rollup from wiping this out of the code base

})




window.addEventListener("focus", () => {

  // If i want to add in manual updating of app put this back in

  // if (APPVERSION > 0) {
  //   fetch('/api/appfocusping?appversion=' + APPVERSION) // will be set in index.html, but from rollup script
  //     .then(response => response.text())
  //     .then(data => { 
  //       if (data === "no") {
  //         window.location.hash = "upgrade";
  //       }   });
  // }

})


