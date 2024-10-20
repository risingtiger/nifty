
import {  } from "./defs_server_symlink.js";
import { LazyLoadT, $NT, INSTANCE_T } from "./defs_client.js";


declare var INSTANCE:INSTANCE_T; // set here for LSP support only
declare var $N: $NT;


// 33--THE FOLLOWING GET BUNDLED INTO THE MAIN BUNDLE

import './alwaysload/switchstation/switchstation.js';
import './thirdparty/lit-html.js';
import './alwaysload/fetchlassie.js';
import './alwaysload/firestore.js';
import './alwaysload/firestore_live.js';
import './alwaysload/influxdb.js';
import './alwaysload/lazyload.js';
import './alwaysload/sse.js';
import './alwaysload/engagementlisten.js';
import './alwaysload/indexeddb.js';
import './alwaysload/datasync.js';


//{--main_instance.js--} 


let _is_in_initial_view_load = true;
let serviceworker_reg: ServiceWorkerRegistration|null;


const LAZYLOADS: LazyLoadT[] = [

	// VIEWS

	{
		type: "view",
		urlmatch: "^auth$",
		name: "auth",
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "view",
		urlmatch: "^notifications$",
		name: "notifications",
		is_instance: false,
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
		is_instance: false,
		dependencies: [{ type: "thirdparty", name: "chartist" }],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "ol",
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "tl",
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "reveal",
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "form",
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "dselect",
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "in",
		is_instance: false,
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
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "toast",
		is_instance: false,
		dependencies: [],
		auth: []
	},

	{
		type: "component",
		urlmatch: null,
		name: "btn",
		is_instance: false,
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
		is_instance: false,
		dependencies: [],
		auth: []
	},


	// LIBS

	{
		type: "lib",
		urlmatch: null,
		name: "testlib",
		is_instance: false,
		dependencies: [],
		auth: []
	},


	// DIRECTIVES
];




window.addEventListener("load", async (_e) => {

	console.log("7777reload entire app if over such adn such seconds")

	const lazyloads = [...LAZYLOADS, ...INSTANCE.LAZYLOADS]




	/*
	const saved_indexeddb_stores = JSON.parse(localStorage.getItem("indexeddb_stores") || "[]") as IndexedDBStoreMetaT[]

	for(const s of INSTANCE.INFO.indexeddb_stores) {
		const found = saved_indexeddb_stores.find(ss => ss.name === s.name)
		s.ts = found ? found.ts : 0
	}

	localStorage.setItem("indexeddb_stores", JSON.stringify(INSTANCE.INFO.indexeddb_stores))
	*/

	await $N.IndexedDB.Init  (INSTANCE.INFO.indexeddb_stores, INSTANCE.INFO.firebase.project, INSTANCE.INFO.firebase.dbversion)
	$N.DataSync.Init          (INSTANCE.INFO.indexeddb_stores, INSTANCE.INFO.firebase.project, INSTANCE.INFO.firebase.dbversion, (window as any).APPVERSION)

	/*
	setTimeout(() => {
		DataSyncM.Subscribe(["cats", "sources", "tags", "transactions"], document.body)
	}, 2000)
	*/

	if (window.location.protocol === "https:") {
		setup_service_worker()
	}

	//FirestoreLiveM.Init()
	$N.EngagementListen.Init()
	$N.LazyLoad.Init(lazyloads)

	setTimeout(() => {
		$N.SSEvents.Init()
	}, 5000)


	localStorage.setItem("identity_platform_key", INSTANCE.INFO.firebase.identity_platform_key)

	lazyloads.filter(l => l.type === "view").forEach(r => $N.SwitchStation.AddRoute(r))

	$N.SwitchStation.InitInterval();
})




document.querySelector("#views")!.addEventListener("view_load_done", () => {

	if (_is_in_initial_view_load) {

		_is_in_initial_view_load = false;

	}
})








function ToastShow(msg: string, level?: number | null, duration?: number | null) {

	let existing_toast = document.getElementById("maintoast")

	if (existing_toast) {
		console.log("toast already showing")
		return
	}


	const htmlstr = `<c-toast id="maintoast" msg="" level="" duration=""></c-toast>`
	document.body.insertAdjacentHTML("beforeend", htmlstr)
	let toast_el = document.getElementById("maintoast")! as any

	toast_el.setAttribute("msg", msg || "")
	toast_el.setAttribute("level", level || '0')
	toast_el.setAttribute("duration", duration ? duration.toString() : '4500')

	toast_el.setAttribute("action", "run")

	toast_el.addEventListener("done", () => {
		document.body.removeChild(toast_el)
	})
}
$N.ToastShow = ToastShow




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
