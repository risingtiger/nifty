

import { InitInterval as SwitchStation_InitInterval, AddRoute as SwitchStation_AddRoute } from './includes/switchstation.js';
import  './includes/lit-html.js';
import  './includes/fetchlassie.js';
import  './includes/lazyload.js';
import  './includes/firestore.js';
import  './includes/influxdb.js';




(window as any).tempywumpy = "";




(window as any).APPVERSION=0;
(window as any).APPUPDATE_TS=0;




let _is_in_initial_view_load = true;




(window as any).__VIEWS = [
    { path: "^auth$", name: "auth", dependencies:[], auth: [] },
];




(window as any).__COMPONENTS = [
    { name: "graphing", dependencies: [{ what: "thirdparty", name: "chartist" }]},
    { name: "auth", dependencies: [{ what: "thirdparty", name: "overlay" }]},
    { name: "overlay", dependencies: []},
    { name: "templateload", dependencies: []}
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

        const decoded = decodeURIComponent(errmsg)

        confirm(decoded)

        window.location.href = (decoded.includes("Firestore Auth Error")) ? "/#auth" : "/"
    }

    else if (window.location.search.includes("update")) {
        const params = new URLSearchParams(window.location.search)
        const round = Number(params.get("update"))
        update(round)
    }

    else {
        SwitchStation_InitInterval(); 
    }
})




document.querySelector("#views").addEventListener("view_load_done", () => {

    if (_is_in_initial_view_load) {

        _is_in_initial_view_load = false;

        setTimeout(()=> {
            if (navigator.serviceWorker.controller)
                navigator.serviceWorker.controller!.postMessage({ command: "load_core" })
        }, 3000)
    }
})



/*
 * Part of listening for changes. Not done yet. will come back to this .... maybe
 *
document.addEventListener("data_change", () => {

    console.log("main data change event receieved in main")


    const alertel = document.querySelector("#data_has_changed_alert")

    if (!alertel) {

        const htmlstr = `<div id="data_has_changed_alert">
                            <i class="icon-refresh"></i> View New Data
                        </div>`

        document.body.insertAdjacentHTML("beforeend", htmlstr)

        const el = document.querySelector("#data_has_changed_alert")! as any

        setTimeout(()=> {
            el.classList.add("active")
        }, 100)

        document.querySelector("#data_has_changed_alert")!.addEventListener("click", ()=> {
            document.body.removeChild(document.querySelector("#data_has_changed_alert")!)

            const activeview = document.querySelector("#views")!.querySelector(".view.active") as any

            if (activeview.Refresh) activeview.Refresh()
        })
    }

})
*/



/*
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
*/




async function update(round:int) {

    const backto = window.location.href.includes("localhost") ? "localhost" : ""

    if (round===1) {

        const cache = await caches.open(`cacheV__${(window as any).APPVERSION}__`)

        await cache.delete("/")

        let x = await caches.keys();

        x.forEach(async (c)=> {
            await caches.delete(c);
        })


        window.location.href = "http://www.yavada.com/bouncebacktopurewater?round=1&backto="+backto

    }

    else if (round===2) {

        setTimeout(()=> {
            window.location.href = "http://www.yavada.com/bouncebacktopurewater?round=2&backto="+backto
        }, 1000)
    }

    else if (round===3) {

        setTimeout(()=> {
            window.location.href = "/index.html"
        }, 500)
    }

}




