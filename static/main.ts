

import { InitInterval as SwitchStation_InitInterval, AddRoute as SwitchStation_AddRoute } from './includes/switchstation.js';
import  './includes/lit-html.js';
import  './includes/lazyload.js';
import  './includes/firebase.js';
import  './includes/ddom.js';




(window as any).APPVERSION=0;
(window as any).APPUPDATE_TS=0;




let _is_in_initial_view_load = true;




(window as any).__VIEWS = [
    { path: "^auth$", name: "auth", dependencies:[] },
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

    if ((window as any).APPVERSION > 0) {
        await navigator.serviceWorker.register("/sw.js", {   scope: "/"   });
    }

    const views = [...(window as any).__VIEWS, ...(window as any).__APPINSTANCE_VIEWS];

    views.forEach(r=> SwitchStation_AddRoute(r))

    if (window.location.href.includes("errmsg")) {
        const errmsg = (window.location.href.match(/errmsg=(.+)/))![1]

        confirm(decodeURIComponent(errmsg))

        window.location.href = "/"
    }

    else if (window.location.hash.includes("update")) {
        const round = (window.location.hash.match(/update_(.+)/))![1]
        update(Number(round))
    }

    else {
        SwitchStation_InitInterval(); 
    }

})




document.querySelector("#views").addEventListener("view_load_done", () => {

    if (_is_in_initial_view_load) {
        _is_in_initial_view_load = false

        setTimeout(()=> {
            if (navigator.serviceWorker.controller)
                navigator.serviceWorker.controller!.postMessage({ command: "load_core" })
        }, 3000)

        check_for_updates()
    }

})





window.addEventListener("focus", () => {

    check_for_updates()

})



function check_for_updates() {

    if ((window as any).APPVERSION > 0) {

        fetch('/api/appfocusping?appversion=' + (window as any).APPVERSION)

        .then(async response => { 
            let x = await response.text()
            if (Number(x) != (window as any).APPVERSION) {
                update(1);
            }   
        })
    }

}




async function update(round:int) {

    console.log("update with round " + round + "")

    if (round===1) {

        console.log("update 1")   
        const cache = await caches.open(`cacheV__${(window as any).APPVERSION}__`)

        await cache.delete("/")

        let x = await caches.keys();

        x.forEach(async (c)=> {
            await caches.delete(c);
        })

        window.location.href = "http://www.yavada.com/bouncebacktopurewater?round=1"

    }

    else if (round===2) {
        console.log("update 2")

        setTimeout(()=> {
            window.location.href = "http://www.yavada.com/bouncebacktopurewater?round=2"
        }, 1000)
    }

    else if (round===3) {
        console.log("update 3-")

        setTimeout(()=> {
            window.location.href = "/"
        }, 500)
    }

}




