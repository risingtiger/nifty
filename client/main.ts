
import {  } from "./defs_server_symlink.js";
import { LazyLoadT, $NT, INSTANCE_T, IndexedDBStoreMetaT, LoggerSubjectE, LoggerTypeE } from "./defs.js";


declare var INSTANCE:INSTANCE_T; // set here for LSP support only
declare var $N: $NT;


// --THE FOLLOWING GET BUNDLED INTO THE MAIN BUNDLE

import './alwaysload/switchstation/switchstation.js';
import './thirdparty/lit-html.js';
import './alwaysload/fetchlassie.js';
import './alwaysload/firestore.js';
//import './alwaysload/firestore_live.js';
import './alwaysload/influxdb.js';
import './alwaysload/lazyload.js';
import './alwaysload/sse.js';
import './alwaysload/engagementlisten.js';
import './alwaysload/indexeddb.js';
import './alwaysload/datasync.js';
import './alwaysload/logger.js';
import './alwaysload/utils.js';

//{--main_instance.js--}


let _is_in_initial_view_load = false;
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
		name: "pol",
		is_instance: false,
		dependencies: [],
		auth: [],
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

	const lazyloads = [...LAZYLOADS, ...INSTANCE.LAZYLOADS]

	const saved_indexeddb_stores = JSON.parse(localStorage.getItem("indexeddb_stores") || "[]") as IndexedDBStoreMetaT[]
	for(const s of (INSTANCE.INFO.indexeddb_stores as any)) {
		const found = saved_indexeddb_stores.find(ss => ss.name === s.name) as any
		s.ts = found ? found.ts : 0
	}
	localStorage.setItem("indexeddb_stores", JSON.stringify(INSTANCE.INFO.indexeddb_stores))

	await $N.IndexedDB.Init  (INSTANCE.INFO.indexeddb_stores, INSTANCE.INFO.firebase.project, INSTANCE.INFO.firebase.dbversion)
	$N.DataSync.Init          (INSTANCE.INFO.indexeddb_stores, INSTANCE.INFO.firebase.project, INSTANCE.INFO.firebase.dbversion)

	if ((window as any).APPVERSION > 0)   await setup_service_worker()

	$N.EngagementListen.Init()
	$N.LazyLoad.Init(lazyloads)

	setTimeout(() => $N.SSEvents.Init(), 3000)

	localStorage.setItem("identity_platform_key", INSTANCE.INFO.firebase.identity_platform_key)

	lazyloads.filter(l => l.type === "view").forEach(r => $N.SwitchStation.AddRoute(r))

	$N.SwitchStation.InitInterval();
})




function generate_ran_num(param: number): number {
    // Validate input is between 1 and 12
    if (param < 1 || param > 12) {
        throw new Error('Parameter must be between 1 and 12');
    }
    
    // Generate random number between param and param * 10
    return Math.floor(Math.random() * (param * 10 - param + 1)) + param;
}

function genran(): number {
    // AI Generated Comment: Generates a random number between 1 and 1000
    return Math.floor(Math.random() * 1000) + 1;
}

document.querySelector("#views")!.addEventListener("view_load_done", () => {
	if (_is_in_initial_view_load)   _is_in_initial_view_load = false
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




const setup_service_worker = () => new Promise<void>((resolve, _reject) => {

	let hasPreviousController = navigator.serviceWorker.controller ? true : false;

	 navigator.serviceWorker.register('sw.js').then(registration => {

		serviceworker_reg = registration;

         navigator.serviceWorker.ready.then(() => {                                                             
			registration.active?.postMessage({                                                                 
				action:"initial_pass_auth_info",                                                               
				id_token: localStorage.getItem("id_token"),                                                    
				token_expires_at: localStorage.getItem("token_expires_at"),                                    
				refresh_token: localStorage.getItem("refresh_token"),                                          
				user_email: localStorage.getItem("user_email")                                                 
			});                                                                                                

			resolve()
		}); 

		navigator.serviceWorker.addEventListener('message', (event:any) => {

			if (event.data.action === 'update_auth_info') {
				localStorage.setItem("id_token", event.data.id_token)
				localStorage.setItem("token_expires_at", event.data.token_expires_at.toString())
				localStorage.setItem("refresh_token", event.data.refresh_token)
			}

			else if (event.data.action === 'update_init') {
				$N.SSEvents.ForceStop()
				serviceworker_reg?.update()
			}

			else if (event.data.action === 'error_out') {
				$N.Logger.Log(LoggerTypeE.error, event.data.subject, `${event.data.errmsg}`)
				if (window.location.protocol === "https:") {
					window.location.href = `/index.html?error_subject=${event.data.subject}`; 
				} else {
					throw new Error(event.data.subject + " -- " + event.data.errmsg)
				}
			}
		});

		navigator.serviceWorker.addEventListener('controllerchange', onNewServiceWorkerControllerChange);

		navigator.serviceWorker.addEventListener('updatefound', (_e:any) => {
			$N.SSEvents.ForceStop()
		});


		function onNewServiceWorkerControllerChange() {

			console.log("main.ts controllerchange")

			if (!hasPreviousController) {
				console.log("main.ts no previous controller")
				hasPreviousController = true
				return;
			}

			console.log("main.ts has previous controller")

			localStorage.clear();

			setTimeout(() => {
				if (window.location.protocol === "https:") {
					window.location.href = "/index.html?update=done";
				} else {
					alert("Update complete. Redirect to /index.html?update=done")
				}
			}, 2000)
		}
	});
})





