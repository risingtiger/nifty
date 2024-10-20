
type num = number
//type str = string
//type bool = boolean

type IndexedDBStoreMetaT = {
	name: string,
	url: string
}

enum DataSyncStoreMetaStateE  { 
	EMPTY, 
	STALE, 
	QUELOAD, 
	LOADING, 
	LOADED, 
	OK 
}
type DataSyncStoreMetaT = {
	n: string, // name
	s: string[], // subscribers
	l: DataSyncStoreMetaStateE, // 
	ts: number // timestamp
}




self.onmessage = async (e:any) => {


	switch (e.data.cmd) {
		case "init":
			Updater_Init(e.data.dbname, e.data.dbversion, e.data.appversion, e.data.id_token, e.data.indexeddb_stores)	
		break;
		case "subscribe":
			EventLoopen_Run(e.data.store_names, e.data.subscriber, e.data.store_metas);
		break;
		case "refresh_from_stale":
			EventLoopen_Run(null, null, e.data.store_metas);
		break;
	}
}


























// EventLoopenWorker
/* ************ */

let   store_metas_while_open_que:DataSyncStoreMetaT[] = []




function EventLoopen_Run(
	store_names:str[]|null, 
	subscriber:str|null,
	store_metas:DataSyncStoreMetaT[]|null
){

	console.log("hitten the event loop")

	if (store_metas_while_open_que.length === 0 && !store_names && !subscriber && (store_metas && store_metas.length)) {
		store_metas_while_open_que = store_metas
	}

	else if (store_names && subscriber && store_metas)  {
		handle_subscribe_call(store_names, subscriber, store_metas)
	}


	const queload_store_metas = store_metas_while_open_que.filter((sm) => sm.l === DataSyncStoreMetaStateE.QUELOAD)
	const loaded_store_metas  = store_metas_while_open_que.filter((sm) => sm.l === DataSyncStoreMetaStateE.LOADED)

	if (loaded_store_metas.length) {
		handle_loaded_store_metas(loaded_store_metas)
	}

	if (queload_store_metas.length) {

		Updater_StoresToIndexeddb(queload_store_metas)

		queload_store_metas.forEach((sm) => sm.l = DataSyncStoreMetaStateE.LOADING)
	}

	const pending = store_metas_while_open_que.filter((sm) => sm.l === DataSyncStoreMetaStateE.LOADING)

	if (pending.length) {
		setTimeout(EventLoopen_Run, 100)
	} else {
		self.postMessage({ cmd: "save_store_metas", store_metas: store_metas_while_open_que })
		store_metas_while_open_que = []
	}
}




function handle_subscribe_call(
	store_names:str[], 
	subscriber:str,
	store_metas:DataSyncStoreMetaT[]
){

	if (store_metas_while_open_que.length === 0) {
		store_metas_while_open_que = store_metas
	}

	add_to_store_metas_if_not_exists(store_names, subscriber)

	const filtered_store_metas  = store_metas_while_open_que.filter((sm) => store_names.includes(sm.n))

	for(const fsm of filtered_store_metas) {
		if (
			fsm.l === DataSyncStoreMetaStateE.EMPTY || 
			fsm.l === DataSyncStoreMetaStateE.STALE 
		){
			fsm.l = DataSyncStoreMetaStateE.QUELOAD
		}
	}

	if (filtered_store_metas.every((sm) => sm.l === DataSyncStoreMetaStateE.OK)) {
		self.postMessage({ cmd: "notify_subscribers", subscribers:[subscriber]  })
	}
}




function add_to_store_metas_if_not_exists(store_names:str[], component_path_str:string) {

	for(const store_name of store_names) {
		let existing_store = store_metas_while_open_que.find((s:DataSyncStoreMetaT) => s.n === store_name)

		if (!existing_store) {
			const new_store:DataSyncStoreMetaT = { n: store_name, s: [component_path_str], l:DataSyncStoreMetaStateE.EMPTY, ts: 0 }
			store_metas_while_open_que.push(new_store)
			existing_store = store_metas_while_open_que[store_metas_while_open_que.length-1]
		}

		if (!existing_store.s.includes(component_path_str)) {
			existing_store.s.push(component_path_str)
		}
	}
}




function handle_loaded_store_metas(loaded_store_metas:DataSyncStoreMetaT[]) {

	const subscribers_to_notify:str[] = []
	const subscribers = [...new Set(loaded_store_metas.map((sm) => sm.s).flat())]
	const subscribers_map = new Map(subscribers.map((s) => [s, store_metas_while_open_que.filter((sm) => sm.s.includes(s))]))

	for(let [subscriber, store_metas] of subscribers_map) {
		if (store_metas.some((sm) => sm.l === DataSyncStoreMetaStateE.LOADED)) {
			if (store_metas.every((sm) => sm.l === DataSyncStoreMetaStateE.LOADED || sm.l === DataSyncStoreMetaStateE.OK)) {
				subscribers_to_notify.push(subscriber)
			}
		}	
	}

	loaded_store_metas.forEach((sm) => sm.l = DataSyncStoreMetaStateE.OK)

	if (subscribers_to_notify.length) {
		self.postMessage({ cmd: "notify_subscribers", subscribers: subscribers_to_notify })
	}
}














































// UPDATE WORKER
/* ********** */

let DBNAME:str = "";
let DBVERSION:num = 0
let APPVERSION:num = 0;
let ID_TOKEN:str = ""
let INDEXEDDB_STORES:IndexedDBStoreMetaT[] = []




async function Updater_Init(dbname:str,dbversion:num,appversion:num,id_token:str,indexeddb_stores:IndexedDBStoreMetaT[]) {
	DBNAME = dbname
	DBVERSION = dbversion
	APPVERSION = appversion
	ID_TOKEN = id_token
	INDEXEDDB_STORES = indexeddb_stores
}



async function Updater_StoresToIndexeddb(store_metas:DataSyncStoreMetaT[]) {

	const url = "/api/firestore_retrieve"

	const paths:str[] = []
	const opts:{limit:num, order_by:str, ts:num}[] = []

	for(const sm of store_metas) {
		const store_url = INDEXEDDB_STORES.find((s) => s.name === sm.n)!.url
		paths.push(store_url)
		opts.push({ limit: 1000, order_by: "ts,desc", ts: sm.ts })
	}

	const body = { paths, opts }

	const fetchopts = {   
		method: "POST",
		headers: { 
			"Content-Type": "application/json", 
			"appversion": APPVERSION,
			"Authorization": `Bearer ${ID_TOKEN}`
		},
		body: JSON.stringify(body),
	}


	const fr = await fetch(url, (fetchopts as any))

	if (fr.status === 401) {
		redirect_from_error("datasync_fetch_not_authorized","DataSync Fetch Not Authorized - " + fr.url + ": " + fr.statusText)
		return false;
	}

	else if (fr.status === 410) {
		redirect_from_error("datasync_fetch_out_of_date","DataSync Fetch Out of Date - " + fr.url)
		return false;
	}

	else if (!fr.ok) {
		redirect_from_error("datasync_fetch_error","DataSync Server Error - " + fr.url + ": " + fr.statusText)
		return false;
	}

	const data = await fr.json()

	await write_to_indexeddb(data, store_metas, DBNAME, DBVERSION)

	store_metas.forEach((sm) => { sm.l = DataSyncStoreMetaStateE.LOADED; sm.ts = Math.floor(Date.now() / 1000) })
}




function write_to_indexeddb(
	data:any, 
	store_metas:DataSyncStoreMetaT[],
	db_name:str,
	db_version:num
) {

	return new Promise<bool>(async (resolve, _reject) => {

		if (!data.some((d:any) => d.length > 0)) {
			resolve(true)
			return
		}


		const request = indexedDB.open(db_name, db_version)

		request.onerror = (event:any) => {
			redirect_from_error("datasync_worker_db_open_error","datasync_worker_db_open_error: " + event.target.errorCode)
		}

		request.onsuccess = async (e:any) => {

			e.target.result.onerror = (event:any) => {
				redirect_from_error("datasync_worker_db_operation_error","IndexedDB Error - " + event.target.errorCode)
			}

			const db = e.target.result

			const tx:IDBTransaction = db.transaction(store_metas.map((s:any) => s.n), "readwrite", { durability: "relaxed" })

			let are_there_any_put_errors = false

			for (const [i, sm] of store_metas.entries()) {

				if (data[i].length === 0) continue

				const os = tx.objectStore(sm.n)

				for(let ii = 0; ii < data[i].length; ii++) {
					const db_put = os.put(data[i][ii])
					db_put.onerror = (_event:any) => are_there_any_put_errors = true
				}
			}

			tx.oncomplete = (_event:any) => {

				if (are_there_any_put_errors) {   
					redirect_from_error("firestorelive_indexeddb_put","Firestorelive Error putting data into IndexedDB")  
					return   
				}

				resolve(true)
			}

			tx.onerror = (_event:any) => {
				redirect_from_error("firestorelive_indexeddb_put","Firestorelive Error putting data from IndexedDB")
			}
		}
	})
}




function redirect_from_error(errmsg:str, errmsg_long:str) {
	self.postMessage({ cmd: "error", errmsg, errmsg_long })
}



