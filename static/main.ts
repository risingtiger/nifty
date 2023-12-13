

import { InitInterval as SwitchStation_InitInterval, AddRoute as SwitchStation_AddRoute } from './includes/switchstation.js';
import  './includes/lit-html.js';
import  './includes/fetchlassie.js';
import  './includes/lazyload.js';
import  './includes/firestore.js';
import  './includes/influxdb.js';
import * as Firestore_Live from './includes/firestore_live.js';
import * as IndexedDB from './includes/indexeddb.js';
import * as SSEvents from './includes/sse.js';
import * as AppFocusListen from './includes/appfocus_listen.js';




(window as any).APPVERSION=0; // at_main_js
(window as any).APPUPDATE_TS=0; // at_main_js




let _is_in_initial_view_load = true;
let serviceworker_reg:ServiceWorkerRegistration;




(window as any).__VIEWS = [
    { path: "^auth$", name: "auth", dependencies:[], auth: [] },
    { path: "^beginnotify$", name: "beginnotify", 
        dependencies:[], 
        auth: [] 
    },
];




(window as any).__COMPONENTS = [
    { name: "graphing", dependencies: [{ what: "thirdparty", name: "chartist" }]},
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

    const collections = (window as any).__APPINSTANCE.indexeddb_collections

    AppFocusListen.AppFocus_Init()
    IndexedDB.Init(collections)
    Firestore_Live.Init(collections)

    if (location.protocol === "https:") {
        serviceworker_reg = await navigator.serviceWorker.register("/sw.js", {   scope: "/"   });
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

            if (location.protocol === "https:") {
                serviceworker_reg.active.postMessage({ command: "load_core" })
            }

            SSEvents.Init()

        }, 5000)
    }
})




async function update(round:int) {

    const backto = window.location.href
    const tohref = "http://www.yavada.com/bouncebacktopurewater?round="+round+"&backto="+backto

    if (round===1) {

        const cache = await caches.open(`cacheV__${(window as any).APPVERSION}__`)

        await cache.delete("/")

        let x = await caches.keys();

        x.forEach(async (c)=> {
            await caches.delete(c);
        })


        if (location.protocol === "https:") {
            await serviceworker_reg.update()
        }

        setTimeout(()=> {
            window.location.href = tohref
        }, 2500)

    }

    else if (round===2) {

        setTimeout(()=> {
            window.location.href = tohref
        }, 1000)
    }

    else if (round===3) {

        setTimeout(()=> {
            window.location.href = "/index.html"
        }, 500)
    }

}





/*
async function sse_triggered(obj:any) {

    if (obj.what === "firestore_changed") {
        (window as any).Firestore.Update_Triggered(obj.paths).then(()=> {

            const activeview = document.querySelector("#views > .view.active")!

            if ((activeview as any).SSE_Update) (activeview as any).SSE_Update(obj)

        })
    }
}
*/


/*

const INDEXEDDB_STORES_YA = ["pers_cats","pers_sources","pers_tags","pers_transactions"]




*/





/*
 * Part of listening for changes. Not done yet. will come back to this .... maybe
 *
document.addEventListener("data_change", () => {



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
