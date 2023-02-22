

import { InitInterval as SwitchStation_InitInterval, AddRoute as SwitchStation_AddRoute } from './switchstation.js';
import  './thirdparty/lit-html.js';
import  './libs/suckinjs.js';
import  './libs/firebase.js';
import  './libs/ddom.js';


declare var APPVERSION:number;
declare var __APPINSTANCE_ROUTES:Array<any>;




(window as any).__DEPENDENCIES = [
  {
    module: "graphing",
    dependencies: ["chartist"]
  },
  {
    module: "auth",
    dependencies: ["overlay"]
  }
];




window.addEventListener("load", async (_e) => {

  if (APPVERSION > 0)
    await navigator.serviceWorker.register("/sw.js", {   scope: "/"   });


  __APPINSTANCE_ROUTES.forEach(r=> SwitchStation_AddRoute(r[0], r[1]))


  if (window.location.href.includes("errmsg")) {
    const errmsg = (window.location.href.match(/errmsg=(.+)/))![1]

    confirm(decodeURIComponent(errmsg))

    window.location.href = "/"
  }

  else {
    SwitchStation_InitInterval(); // dummy call to keep rollup from wiping this out of the code base
  }

})




window.addEventListener("focus", () => {

  // If i want to add in manual updating of app put this back in

  // if (APPVERSION > 0) {
  //   console.log("asdf")
  //   fetch('/api/appfocusping?appversion=' + APPVERSION) // will be set in index.html, but from rollup script
  //     .then(response => response.text())
  //     .then(data => { 
  //       if (data === "no") {
  //         //window.location.hash = "upgrade";
  //       }   });
  // }

})



