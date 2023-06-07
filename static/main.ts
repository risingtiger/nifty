

import { InitInterval as SwitchStation_InitInterval, AddRoute as SwitchStation_AddRoute } from './includes/switchstation.js';
import  './includes/lit-html.js';
import  './includes/lazyload.js';
import  './includes/firebase.js';
import  './includes/ddom.js';

declare var browser: any;



(window as any).APPVERSION=0;




(window as any).__VIEWS = [
    { path: "^upgrade_1$", name: "upgrade", dependencies:[] },
    { path: "^upgrade_2$", name: "upgrade", dependencies:[] },
];




(window as any).__COMPONENTS = [
    { name: "graphing", dependencies: [{ what: "thirdparty", name: "chartist" }]},
    { name: "auth", dependencies: [{ what: "thirdparty", name: "overlay" }]},
    { name: "overlay", dependencies: []}
];




(window as any).__THIRDPARTY = [
    { name: "chartist", dependencies: []},
];




(window as any).__LIBS = [
    { name: "testlib", dependencies: []},
];




window.addEventListener("load", async (_e) => {

    if ((window as any).APPVERSION > 0)
        await navigator.serviceWorker.register("/sw.js", {   scope: "/"   });

    const views = [...(window as any).__VIEWS, ...(window as any).__APPINSTANCE_VIEWS];

    views.forEach(r=> SwitchStation_AddRoute(r))

    if (window.location.href.includes("errmsg")) {
        const errmsg = (window.location.href.match(/errmsg=(.+)/))![1]

        confirm(decodeURIComponent(errmsg))

        window.location.href = "/"
    }

    else {
        SwitchStation_InitInterval(); 
    }

})




window.addEventListener("focus", () => {

    if ((window as any).APPVERSION > 0) {
        console.log("focus-")

        fetch('/api/appfocusping?appversion=' + (window as any).APPVERSION)

        .then(async response => { 
            let x = await response.text()
            if (Number(x) != (window as any).APPVERSION) {
                window.location.hash = "upgrade_1";
            }   
        })
    }

})



