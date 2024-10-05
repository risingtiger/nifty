
import { LazyLoadT, IndexedDBStoreMetaT } from "./definitions.js";


import { InitInterval as SwitchStation_InitInterval, AddRoute as SwitchStation_AddRoute } from './alwaysload/switchstation.js';

import './thirdparty/lit-html.js';
import './alwaysload/fetchlassie.js';
import './alwaysload/firestore.js';
import FirestoreLiveM from './alwaysload/firestore_live.js';
import './alwaysload/influxdb.js';
import LazyLoadM from './alwaysload/lazyload.js';
import SSEventsM from './alwaysload/sse.js';
import EngagementListenM from './alwaysload/engagementlisten.js';
import IndexedDBM from './alwaysload/indexeddb.js';
import DataSync_Init  from './alwaysload/datasync.js';

import INSTANCE from './client_pwt/main_xtend.js'; // instance is swapped out on buildit set instance 





let _is_in_initial_view_load = true;
let serviceworker_reg: ServiceWorkerRegistration|null;




const LAZYLOADS: LazyLoadT[] = [


        // VIEWS

        {
                type: "view",
                urlmatch: "^auth$",
                name: "auth",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "view",
                urlmatch: "^notifications$",
                name: "notifications",
                instance: null,
                dependencies: [
                        { type: "component", name: "ol" },
                ],
                auth: ["admin", "store_manager", "scanner"]
        },


        // COMPONENTS

        {
                type: "component",
                urlmatch: null,
                name: "graphing",
                instance: null,
                dependencies: [{ type: "thirdparty", name: "chartist" }],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "ol",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "tl",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "reveal",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "form",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "dselect",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "in",
                instance: null,
                dependencies: [
                        { type: "component", name: "dselect" },
                        { type: "component", name: "animeffect" }
                ],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "animeffect",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "toast",
                instance: null,
                dependencies: [],
                auth: []
        },

        {
                type: "component",
                urlmatch: null,
                name: "btn",
                instance: null,
                dependencies: [
					{ type: "component", name: "animeffect" },
				],
                auth: []
        },

        // THIRDPARTY

        {
                type: "thirdparty",
                urlmatch: null,
                name: "chartist",
                instance: null,
                dependencies: [],
                auth: []
        },


        // LIBS

        {
                type: "lib",
                urlmatch: null,
                name: "testlib",
                instance: null,
                dependencies: [],
                auth: []
        },


        // DIRECTIVES
];




window.addEventListener("load", async (_e) => {

	console.log("reload entire app if over such adn such seconds")

	const lazyloads = [...LAZYLOADS, ...INSTANCE.LAZYLOADS]




	/*
	const saved_indexeddb_stores = JSON.parse(localStorage.getItem("indexeddb_stores") || "[]") as IndexedDBStoreMetaT[]

	for(const s of INSTANCE.INFO.indexeddb_stores) {
		const found = saved_indexeddb_stores.find(ss => ss.name === s.name)
		s.ts = found ? found.ts : 0
	}

	localStorage.setItem("indexeddb_stores", JSON.stringify(INSTANCE.INFO.indexeddb_stores))
	*/

	await IndexedDBM.Init  (INSTANCE.INFO.indexeddb_stores, INSTANCE.INFO.firebase.project, INSTANCE.INFO.firebase.dbversion)
	DataSync_Init          (INSTANCE.INFO.indexeddb_stores, INSTANCE.INFO.firebase.project, INSTANCE.INFO.firebase.dbversion, (window as any).APPVERSION)

	/*
	setTimeout(() => {
		DataSyncM.Subscribe(["cats", "sources", "tags", "transactions"], document.body)
	}, 2000)
	*/

	if (window.location.protocol === "https:") {
		setup_service_worker()
	}

	//FirestoreLiveM.Init()
	EngagementListenM.Init()
	LazyLoadM.Init(lazyloads)


	localStorage.setItem("identity_platform_key", INSTANCE.INFO.firebase.identity_platform_key)

	lazyloads.filter(l => l.type === "view").forEach(r => SwitchStation_AddRoute(r))

	SwitchStation_InitInterval();
})




document.querySelector("#views")!.addEventListener("view_load_done", () => {

	if (_is_in_initial_view_load) {

		_is_in_initial_view_load = false;

		SSEventsM.Init()
	}
})








function ToastShow(msg: string | null, level: string | null, duration: number | null) {

        let toast_el = document.getElementById("maintoast")

        if (!toast_el) {
                const htmlstr = `<c-toast id="maintoast" msg="" level="" duration=""></c-toast>`
                document.body.insertAdjacentHTML("beforeend", htmlstr)
                toast_el = document.getElementById("maintoast") as any
        }

        toast_el!.setAttribute("msg", msg || "")
        toast_el!.setAttribute("level", level || '0')
        toast_el!.setAttribute("duration", duration ? duration.toString() : '4500')

        toast_el!.setAttribute("clink", "run")
}
(window as any).ToastShow = ToastShow




function setup_service_worker() {

	 navigator.serviceWorker.register('sw.js').then(regitration => {

		serviceworker_reg = regitration;

		regitration.addEventListener("updatefound", () => {
			const worker = regitration.installing;
			worker!.addEventListener('statechange', () => {
				if (worker!.state === "activated") {
					window.location.href = "/index.html"
				}
			});
		});
	});
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		window.location.href = "/index.html"
	});
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
