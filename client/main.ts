
// -- ---------------------------------------

import { InitInterval as SwitchStation_InitInterval, AddRoute as SwitchStation_AddRoute } from './alwaysload/switchstation.js';
import  './thirdparty/lit-html.js';
import  './alwaysload/fetchlassie.js';
import  './alwaysload/firestore.js';
import * as Firestore_Live from './alwaysload/firestore_live.js';
import  './alwaysload/influxdb.js';
import  LazyLoadImport from './alwaysload/lazyload.js';
import  SSEvents from './alwaysload/sse.js';
import  EngagementListen from './alwaysload/engagementlisten.js';
import  IndexedDB from './alwaysload/indexeddb.js';

import INSTANCE from './client_xen/main_xtend.js'; // instance is swapped out on buildit set instance 

import  { LazyLoadT } from "./definitions.js";



let _is_in_initial_view_load = true;
let serviceworker_reg:ServiceWorkerRegistration;




const LAZYLOADS:LazyLoadT[] = [


    // VIEWS

    { 
        type: "view", 
        urlmatch: "^auth$", 
        name: "auth", 
        instance: null,
        dependencies:[], 
        auth: [] 
    },

    { 
        type: "view", 
        urlmatch: "^notifications$", 
        name: "notifications", 
        instance: null,
        dependencies:[
            {type:"component", name: "ol"},
        ], 
        auth: ["admin", "store_manager", "scanner"] 
    },


    // COMPONENTS

    { 
        type: "component", 
        urlmatch: null, 
        name: "graphing", 
        instance: null,
        dependencies:[{ type: "thirdparty", name: "chartist" }], 
        auth: [] 
    },

    { 
        type: "component", 
        urlmatch: null, 
        name: "ol", 
        instance: null,
        dependencies:[], 
        auth: [] 
    },

    { 
        type: "component", 
        urlmatch: null, 
        name: "tl", 
        instance: null,
        dependencies:[], 
        auth: [] 
    },

    { 
        type: "component", 
        urlmatch: null, 
        name: "reveal", 
        instance: null,
        dependencies:[], 
        auth: [] 
    },

    // THIRDPARTY

    { 
        type: "thirdparty", 
        urlmatch: null, 
        name: "chartist", 
        instance: null,
        dependencies:[], 
        auth: [] 
    },


    // LIBS

    { 
        type: "lib", 
        urlmatch: null, 
        name: "testlib", 
        instance: null,
        dependencies:[], 
        auth: [] 
    },
];




window.addEventListener("load", async (_e) => {

    const lazyloads = [...LAZYLOADS, ...INSTANCE.LAZYLOADS]

    const collections = INSTANCE.INFO.indexeddb_collections

    IndexedDB.Init(collections, INSTANCE.INFO.firebase.project)
    Firestore_Live.Init(collections)
    EngagementListen.Init()
    LazyLoadImport.Init(lazyloads)

    serviceworker_reg = await navigator.serviceWorker.register("/sw.js", {   scope: "/"   });

    localStorage.setItem("identity_platform_key", INSTANCE.INFO.firebase.identity_platform_key)

    lazyloads.filter(l=> l.type === "view").forEach(r=> SwitchStation_AddRoute(r))

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

    //let mouseupanim:Animation|null = null 
    document.addEventListener("mouseup", (_e:any) => {

        console.log("remember you have this bubble animate thing on click. but I want to make it a case by case basis")
        return false
        /*
        const x = document.getElementById("click_visual")!
        const y = x.querySelector(".clickybubble") as HTMLElement

        x.style.left = (e.clientX - 20) + "px"
        x.style.top = (e.clientY - 20) + "px"

        x.classList.add("active")
        x.offsetWidth

        if (!mouseupanim) {
            mouseupanim = y.animate(
                [
                    { opacity: 0, transform: 'scale(.5)' },
                    { opacity: 1, transform: 'scale(1)' },
                    { opacity: 0, transform: 'scale(.5)' }
                ],
                { duration: 600, easing: 'ease-out', fill: 'both', iterations: 1 }
            )

            mouseupanim.pause()

            mouseupanim.addEventListener("finish", ()=> {
                x.classList.remove("active")
            })
        }

        mouseupanim.play()
        */
    })
})




document.querySelector("#views")!.addEventListener("view_load_done", () => {

    if (_is_in_initial_view_load) {

        _is_in_initial_view_load = false;

        setTimeout(()=> {

            serviceworker_reg.active!.postMessage({ command: "load_core" })

            SSEvents.Init()

        }, 5000)
    }
})




async function update(round:int) {

    const origin = window.location.origin
    const tohref = "http://www.yavada.com/bouncebacktopurewater?round="+round+"&origin="+origin

    if (round===1) {

        document.getElementById("updatevisual")!.classList.add("active")
        document.getElementById("waiting_animate")!.classList.add("active")
        document.getElementById("waiting_animate")!.style.top = "250px"

        const cache = await caches.open(`cacheV__${(window as any).APPVERSION}__`)

        await cache.delete("/")

        let x = await caches.keys();

        x.forEach(async (c)=> {
            await caches.delete(c);
        })

        await serviceworker_reg.update()

        setTimeout(()=> {
            window.location.href = tohref
        }, 1500)
    }

    else if (round===2) {

        document.getElementById("updatevisual")!.classList.add("active")
        document.getElementById("waiting_animate")!.classList.add("active")
        document.getElementById("waiting_animate")!.style.top = "250px"

        setTimeout(()=> {
            window.location.href = tohref
        }, 1500)
    }

    else if (round===3) {

        document.getElementById("updatevisual")!.classList.add("active")
        document.getElementById("waiting_animate")!.classList.add("active")
        document.getElementById("waiting_animate")!.style.top = "250px"

        setTimeout(()=> {
            window.location.href = "/index.html"
        }, 1500)
    }
}




/*
async function reload_css_in_dev(data:any) {

    if (data.to_where === "main") {
        GLOBAL_MAINCSS.replaceSync(data.css_str)
        
    } else {
        const x = document.querySelector(data.to_where) as any
        x.sheet.replaceSync(data.css_str)
    }

    /*
    for(let i=0; i < document.adoptedStyleSheets.length; i++) {
        let sheet = document.adoptedStyleSheets[i] as any
        console.log(sheet)
        const x = document.querySelector("v-home") as any
        x.temp.replaceSync(data.css_str)
    }

    /*
    let f = data.css_str;

    console.log(f)

    const lall = Array.from(document.querySelectorAll("link"))
    const l = lall.find(l=> l.getAttribute("href")!.includes(f))

    if (l) {
        l.setAttribute("href", f + "?v=" + Math.random())
    } else {
        console.log(f)
        console.error("CSS file not found on css reload");
    }
}
*/





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
