
import { int, str, num, IndexedDBStoreMetaT, SSE_TriggersE  } from "../definitions.js";

declare var EngagementListen:any
declare var SSEvents:any

let   worker:Worker|null = null
const app_start_time = Math.floor(Date.now() / 1000)


function Init(indexeddb_stores: IndexedDBStoreMetaT[], dbname:str, dbversion:int, appversion:num) {

	worker = new Worker("/assets/lazy/workers/datasync_worker.js", { type: "module" })

	worker.postMessage({ cmd: "init", dbname, dbversion, appversion, indexeddb_stores, id_token: localStorage.getItem("id_token") })

	const store_metas = JSON.parse(localStorage.getItem("datasync_store_metas") || "[]") as any[]
	for(const s of store_metas) {   s.l = 2 /* STAlE*/ }
	remove_store_metas_not_in_indexeddb_store_metas(indexeddb_stores, store_metas)
	localStorage.setItem("datasync_store_metas", JSON.stringify(store_metas))


	worker.addEventListener("message", (e) => {
		switch (e.data.cmd) {

			case "error":
				if (e.data.errmsg === "datasync_fetch_out_of_date") {
					window.location.href = "/index.html?update_init=1"
				} else {
					localStorage.setItem("errmsg", e.data.errmsg + " -- " + e.data.errmsg_long)
					window.location.href = "/index.html?errmsg="+e.data.errmsg
				}
			break;

			case "save_store_metas" : 
				save_store_metas(e.data.store_metas)
			break;

			case "notify_subscribers" : 
				notify_subscribers(e.data.subscribers)
			break;
		}
	});


    //EngagementListen.Add_Listener("firestorelive", "focus", ()=> {
	window.addEventListener("focus", ()=> {

		const store_metas = JSON.parse(localStorage.getItem("datasync_store_metas") || "[]") as any[]
		for(const s of store_metas) {   s.l = 2 /* STAlE*/ }
		localStorage.setItem("datasync_store_metas", JSON.stringify(store_metas))

		worker?.postMessage({ cmd: "refresh_from_stale", store_metas });

        // probably need to listen to DIS engagement from SSE and disable SSE listen feed coming in.
        // but i'll see if browser automaticlly takes care of that
    })

    SSEvents.Add_Listener("datasync", [SSE_TriggersE.FIRESTORE], (data:any)=> {

		const store_metas = JSON.parse(localStorage.getItem("datasync_store_metas") || "[]") as any[]

		const filtered_store_metas = store_metas.filter((s:any)=> data.paths.includes(s.n))
		for(const s of filtered_store_metas) {   s.l = 2 /* STAlE*/ }

		localStorage.setItem("datasync_store_metas", JSON.stringify(store_metas))

		worker?.postMessage({ cmd: "refresh_from_stale", store_metas });
    })
}




function Subscribe(store_names:str[], subscriber_el:HTMLElement) {
	const store_metas = JSON.parse(localStorage.getItem("datasync_store_metas") || "[]") as any[]
	worker?.postMessage({ cmd: "subscribe", store_names, subscriber: generate_string_from_el(subscriber_el), store_metas });
} 




function notify_subscribers(subscribers:str[]) {

	for (const s of subscribers) {
		const subscriber_el = get_el_from_subscriber_str(s)

		if (subscriber_el && subscriber_el["DataSync_Updated"]) {
			subscriber_el["DataSync_Updated"]()
		}
	}
}




function save_store_metas(store_metas:DataSyncStoreMetaT[]) {

	for (const s of store_metas) {
		for (const sm of s.s) {
			const subscriber_el = get_el_from_subscriber_str(sm)

			if (subscriber_el && subscriber_el["DataSync_Updated"]) {
				// all good
			} else {
				s.s.splice(s.s.indexOf(sm), 1)
			}
		}
	}

	localStorage.setItem("datasync_store_metas", JSON.stringify(store_metas))
}



function generate_string_from_el(el:HTMLElement) {

    let path_str = "";
    let current_element: HTMLElement | null = el;

    while (current_element) {
        const tagName = current_element.tagName.toLowerCase();
        path_str = tagName + (path_str ? "," + path_str : "");

        const rootNode = current_element.getRootNode();
        if (rootNode instanceof ShadowRoot) {
            current_element = rootNode.host as HTMLElement;
        } else {
            current_element = null;
        }
    }

	return path_str
}




function get_el_from_subscriber_str(el_str:string) {

	const el_str_parts = el_str.split(",")

	let current_element: HTMLElement | null = document.querySelector(el_str_parts[0]);

	for (let i = 1; i < el_str_parts.length; i++) {
		if (current_element) {
			current_element = current_element.shadowRoot?.querySelector(el_str_parts[i]) as HTMLElement;
		}
	}

	return current_element
}



function remove_store_metas_not_in_indexeddb_store_metas(
	indexeddb_stores:IndexedDBStoreMetaT[],
	store_metas:DataSyncStoreMetaT[]
){

	for(const s of store_metas) {
		if (!indexeddb_stores.find((ss) => ss.name === s.n)) {
			store_metas.splice(store_metas.indexOf(s), 1)
		}
	}

}















const DataSync = { Subscribe };

(window as any).DataSync = DataSync

export default  Init 

