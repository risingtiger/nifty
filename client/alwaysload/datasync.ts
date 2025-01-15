

import { num, bool, str, SSETriggersE  } from "../defs_server_symlink.js";
import { IndexedDBStoreMetaT, DataSyncStoreMetaStateE, DataSyncStoreMetaT, $NT  } from "../defs.js";

declare var $N:$NT

let   worker:Worker|null = null
const subscribers:{el:HTMLElement, is_inited:bool, callback:()=>void, store_names:str[], store_item_ids:(str|null)[] }[] = []
let   store_metas:DataSyncStoreMetaT[] = []




function Init(indexeddb_stores: IndexedDBStoreMetaT[], dbname:str, dbversion:num) {
	worker = new Worker("/assets/lazy/workers/datasync_worker.js", { type: "module" })

	worker.postMessage({ cmd: "init", dbname, dbversion, indexeddb_stores })

	store_metas = JSON.parse(localStorage.getItem("datasync_store_metas") || "[]") as any[]
	for(const s of store_metas) {   s.l = DataSyncStoreMetaStateE.STALE; }
	remove_store_metas_not_in_indexeddb_store_metas(indexeddb_stores)


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

			case "save_changed_store_metas_state" : 
				e.data.changed_store_metas.forEach((s:DataSyncStoreMetaT)=> {
					const store_meta = store_metas.find((sm) => sm.n === s.n)!
					store_meta.l = s.l
				})	
				localStorage.setItem("datasync_store_metas", JSON.stringify(store_metas))
			break;

			case "notify_subscribers" : 
				notify_subscribers(e.data.loaded_store_metas)
			break;
		}
	});


	window.addEventListener("focus", ()=> {

		for(const s of store_metas) {   s.l = DataSyncStoreMetaStateE.STALE, s.i = null }
		worker?.postMessage({ cmd: "run_loop", store_metas });
    })

    $N.SSEvents.Add_Listener(window.document.body, "datasync", [SSETriggersE.FIRESTORE], (data:any)=> {

		const data_parts = data.paths.map((p:str)=> p.split("/"))
		const store_names = data_parts.map((p:str[])=> p[0])
		const store_item_ids = data_parts.map((p:str[])=> p[1] || null)

		const filtered_store_metas = store_metas.filter((s:any)=> store_names.includes(s.n)) 
		for(const [i, s] of filtered_store_metas.entries()) {   s.l = DataSyncStoreMetaStateE.STALE; s.i = store_item_ids[i] }

		worker?.postMessage({ cmd: "run_loop", store_metas });
    })
}




function Subscribe(el:HTMLElement, store_uris:str[], callback:()=>void) {
	
	// NOT allowing subscribing to individual items in store. Just the whole store like 'transactions' or 'users'

	purge_removed_subscribers()

	let subscriber = subscribers.find(sub => sub.el === el)
	if (!subscriber) {   
		const store_uri_parts = store_uris.map((s) => s.split("/"))
		const store_names = store_uri_parts.map((s) => s[0])
		const store_item_ids = store_uri_parts.map((s) => s[1] || null)
		subscribers.push({ el, is_inited: false, callback, store_names, store_item_ids });   
		subscriber = subscribers[subscribers.length-1] 
	}

	for(const [i,s] of subscriber.store_names.entries()) {
		let store_meta = store_metas.find((sm) => sm.n === s)
		if (!store_meta) {   
			store_metas.push({ n: s, i: null, l: DataSyncStoreMetaStateE.EMPTY, ts: 0 });   
			store_meta = store_metas[store_metas.length-1]
		}

		store_meta.i = subscriber.store_item_ids[i]	
	}

	if (store_metas.some((s) => s.l === DataSyncStoreMetaStateE.EMPTY || s.l === DataSyncStoreMetaStateE.STALE)) {
		worker?.postMessage({ cmd: "run_loop", store_metas });

	} else {
		// if all store_metas are already loaded (and current), then just call the callback immediately
		subscriber.is_inited = true
		callback()
	}
} 




function notify_subscribers(loaded_store_metas:DataSyncStoreMetaT[]) {

	for(const s of loaded_store_metas) {
		const store_meta = store_metas.find((sm) => sm.n === s.n)
		store_meta!.l = s.l
		store_meta!.ts = s.ts
	}

	const subscribers_to_notify = subscribers.filter((s) => loaded_store_metas.some((lsm) => {

		const subscriber_store_index = s.store_names.indexOf(lsm.n)

		if (!s.el.parentElement)            { return false } // should be purged by purge_removed_subscribers, but just in case
		if (subscriber_store_index === -1)  { return false }
		
		// in some cases, subscribers just want to know if the collection store is updated at all, regardless of any particular item.
		//  but, sometimes a subscriber will want to only be notified if a particular item is updated.
		if (s.store_item_ids[subscriber_store_index] !== null && s.store_item_ids[subscriber_store_index] !== lsm.i ) { return false }

		if      (!s.is_inited && lsm.l === DataSyncStoreMetaStateE.LOADED_AND_UNCHANGED) { return true; }	
		else if (lsm.l === DataSyncStoreMetaStateE.LOADED_AND_CHANGED)                   { return true }

		return false
	}))

	loaded_store_metas.forEach(lsm=> store_metas.find(sm=> sm.n === lsm.n)!.l = DataSyncStoreMetaStateE.OK)

	localStorage.setItem("datasync_store_metas", JSON.stringify(store_metas))

	if (!subscribers_to_notify.length) { return }
	
	for (const s of subscribers_to_notify) {
		s.is_inited = true
		s.callback() 
	}
}







function remove_store_metas_not_in_indexeddb_store_metas(indexeddb_stores:IndexedDBStoreMetaT[]) {
	for(const s of store_metas) {
		if (!indexeddb_stores.find((ss) => ss.name === s.n)) {
			store_metas.splice(store_metas.indexOf(s), 1)
		}
	}
}




function purge_removed_subscribers() {
	for (const s of subscribers) {
		if (!s.el.parentElement) {
			subscribers.splice(subscribers.indexOf(s), 1)
		}
	}
}





if (!(window as any).$N) { (window as any).$N = {}; }
((window as any).$N as any).DataSync = { Init, Subscribe };









/*
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
*/



/*
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
*/
