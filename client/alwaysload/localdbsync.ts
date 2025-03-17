

import { num, str, bool } from '../defs_server_symlink.js'
import { SSETriggersE } from '../defs_server_symlink.js'
import { $NT, LoggerTypeE, LoggerSubjectE, EngagementListenerTypeT  } from '../defs.js'
import { HandleFirestoreDataUpdated } from './cmech.js'


declare var $N:$NT


type SyncObjectStoresT = { name: string, ts: num|null, lock:boolean, indexes:string[]|null }

type PathSpecT = {
	path:string,
	p: string[],
	collection: string,
	docid: string|null, // never will just be a document (always a collection). but could be a path like "machines/1234/statuses"
	subcollection: string|null,
	syncobjectstore: SyncObjectStoresT | null,
}


let DBNAME:str = ""
let DBVERSION:num = 0

let _syncobjectstores:SyncObjectStoresT[] = []
let _activepaths:PathSpecT[] = []
//let _listens: FirestoreLoadSpecT = new Map()
//let _nonsync_tses: Map<str,num> = new Map()




const Init = (localdb_objectstores: {name:str,indexes?:str[]}[], db_name: str, db_version: num) => { 

	DBNAME    = db_name
	DBVERSION = db_version

	{ 
		const synccollection_names                = localdb_objectstores.map(item => item.name)
		const localstorage_synccollections        = JSON.parse(localStorage.getItem("synccollections") || "[]") as {name:str, ts:num|null}[]
		const synccollections_not_in_localstorage = synccollection_names.filter((name) => !localstorage_synccollections.find(item => item.name === name))

		synccollections_not_in_localstorage.forEach((name) => {
			localstorage_synccollections.push({ name, ts: null })
		})

		_syncobjectstores = localstorage_synccollections.map((dc,i)=> ({ name: dc.name, ts: dc.ts, lock: false, indexes: localdb_objectstores[i].indexes || null }))

		localStorage.setItem("synccollections", JSON.stringify(localstorage_synccollections))

		_activepaths = []
	}


	$N.EngagementListen.Add_Listener(document.body, 'firestore', EngagementListenerTypeT.visible, 100, async ()=> {

		if (_activepaths.length === 0) return

		const r = await datagrabber(_activepaths, {retries:2}, true)
		if (r === null) return

		/*
		const filtered_has_data = new Map( [...r].filter(([_path, data])=> data.length > 0) )  
		if (filtered_has_data.size === 0) return
		*/

		//HandleFirestoreDataUpdated(filtered_has_data)
	})


	$N.SSEvents.Add_Listener(document.body, "firestore_doc", [SSETriggersE.FIRESTORE_DOC], 100, async (event:{path:string,data:object})=> {

		const ssepathspec = parse_into_pathspec(event.path)!
		if (ssepathspec.syncobjectstore) {   await write_to_indexeddb_store([ ssepathspec.syncobjectstore ], [ [event.data] ]);   }

		//HandleFirestoreDataUpdated(r)
	});


	$N.SSEvents.Add_Listener(document.body, "firestore_collection", [SSETriggersE.FIRESTORE_COLLECTION], 100, async (event:{paths:str[]})=> {

		// event.paths is only going to be collections, never a singe document. Single doc goes through SSETriggersE.FIRESTORE_DOC

		const pathspecs = findrelevantpathspecs_from_ssepaths(event.paths)
		if (!pathspecs) return

		const r = await datagrabber(pathspecs, {}, true)
		if (r === null) return

		/*
		const filtered_has_data = new Map( [...r].filter(([_path, data])=> data.length > 0) )  
		if (filtered_has_data.size === 0) return

		HandleFirestoreDataUpdated(filtered_has_data)
		*/
	});


	return true


	function findrelevantpathspecs_from_ssepaths(ssepaths?:str[]) : PathSpecT[]|null {

		const ssepathspecs         = ssepaths?.map(sp=> parse_into_pathspec(sp)) || []

		const pathspecs = _activepaths.filter(aps=> {
			return ssepathspecs.find(sp=> sp.collection === aps.collection && sp.docid === aps.docid && sp.subcollection === aps.subcollection)
		})

		if (pathspecs.length === 0) return null

		return pathspecs
	}
}




const EnsureObjectStoresActive = (names:str[]) => new Promise<num|null>(async (res,_rej)=> {

	// currently is only main level firestore collections. will add subcollections soon

	const pathspecs:PathSpecT[] = parseloadspec(loadspecs)

	if (!pathspecs.length) { res(null); return; }

	// Filter out pathspecs that are already in _activepaths
	const newPathspecs = pathspecs.filter(pathspec => 
		!_activepaths.some(activePath => 
			activePath.collection === pathspec.collection && 
			activePath.docid === pathspec.docid && 
			activePath.subcollection === pathspec.subcollection
		)
	)

	// If there are no new paths to process, return success
	if (newPathspecs.length === 0) { res(1); return; }

	// Only fetch data for paths not already active
	const r = await datagrabber(newPathspecs, {}, false)
	if (r === null) { res(null); return; }

	// Add the new paths to _activepaths
	_activepaths = [..._activepaths, ...newPathspecs]

	res(1)
})




const AddToListens = (loadspecs:FirestoreLoadSpecT) => {
	loadspecs.forEach((ls, path) => _listens.set(path, ls))
}
const RemoveFromListens = (pathkeys:str[]) => {
	pathkeys.forEach(p=> {
		_listens.delete(p)
		_nonsync_tses.delete(p)
	})
}




const datagrabber = (pathspecs:PathSpecT[], opts?:{retries?:num}, force_refresh_synccollections:bool = false) => new Promise<FirestoreFetchResultT>(async (res,_rej)=> { 

	opts = opts || {retries:0}
	opts.retries = opts.retries || 0

	let   allrs:FirestoreFetchResultT[] = []	
	const promises:Promise<FirestoreFetchResultT>[] = []

	const paths_tosync                          = pathspecs.filter(p=> p.syncobjectstore &&  ( p.syncobjectstore.ts === null || force_refresh_synccollections )  )
	const synccollections_tosync_withduplicates = paths_tosync.map(p=> p.syncobjectstore!)
	const synccollections_tosync                = synccollections_tosync_withduplicates.filter((item, index) => synccollections_tosync_withduplicates.indexOf(item) === index)
	const synccollections_tosync_unlocked       = synccollections_tosync.filter(dc=> !dc.lock)
	const synccollections_tosync_locked         = synccollections_tosync.filter(dc=> dc.lock)


	{
		const nonsync_fetch_pathspecs               = pathspecs.filter(p=> !p.syncobjectstore)
		const nonsync_fetch_promise                 = nonsync_fetch_pathspecs.length ? fetch_nonsync_paths(nonsync_fetch_pathspecs, opts.retries) : new Promise<FirestoreFetchResultT>((res)=> res(new Map()))
		promises.push(nonsync_fetch_promise)
	}


	{
		if (synccollections_tosync_unlocked.length) {
			const rs = await load_into_synccollections(synccollections_tosync_unlocked, opts.retries)
			if (rs === null) { res(null); return; }
		}

		if (synccollections_tosync_locked.length) {
			await new Promise((resolve_inner) => {
				const intrvl = setInterval(() => {
					if (synccollections_tosync_locked.every(dc=> !dc.lock)) {
						clearInterval(intrvl)
						resolve_inner(1)
					}
				}, 4)
			})
		}
	}


	{
		const indexeddb_fetch_pathspecs     = pathspecs.filter(p=> p.syncobjectstore)
		const indexeddb_fetch_promise       = indexeddb_fetch_pathspecs.length ? get_paths_from_indexeddb(indexeddb_fetch_pathspecs) : new Promise<FirestoreFetchResultT>((res)=> res(new Map()))
		promises.push(indexeddb_fetch_promise)
	}


	allrs = await Promise.all(promises)


	if (allrs[0] === null || allrs[1] === null) { res(null); return; }

	const combined_results = new Map([...allrs[0], ...allrs[1]])

	res(combined_results)
})




function fetch_nonsync_paths(pathspecs:PathSpecT[], retries:num = 0) {   return new Promise<FirestoreFetchResultT>(async (res)=> {

	const paths = pathspecs.map(p=> p.path)
	const opts  = pathspecs.map(p=> p.opts || {}) as FirestoreOptsT[]
	
	opts.forEach((o,i)=> {
		if (o.ts) return
		o.ts = _nonsync_tses.get(paths[i]) || null
	})

    const body = { paths, opts }
    const fetchopts:any = {   
        method: "POST",
        body: JSON.stringify(body),
    }
    const fetch_results = await $N.FetchLassie('/api/firestore_retrieve', fetchopts, {retries}) as Promise<Array<object[]>|null>
	if (fetch_results === null) {
		res(null)
		return
	}

	const tsnow = Math.floor( Date.now()  / 1000)
	pathspecs.forEach(p=> _nonsync_tses.set(p.path, tsnow))

	const results = new Map()
	for(let i = 0; i < pathspecs.length; i++) {
		const pathname = pathspecs[i].path
		results.set(pathname, fetch_results[i])
	}

    res(results)
})}




function parse_into_pathspec(path:str) : PathSpecT {

	const p                    = path.split('/') as Array<string>
	const collection           = p[0]
	const docid                = p[1] || null // only ever have a docid because we'll be using a subcollection. ALL paths are collections
	const subcollection        = docid && p[2] ? p[2] : null 

	// syncollection currently is ONLY for main level collections. we'll be adding subcollections soon (so firestore machines/123/statuses for example can be accessed)
	const syncobjectstore      = !subcollection ? _syncobjectstores.find((dc) => dc.name === collection) || null : null

	return { path, p, collection, docid, subcollection, syncobjectstore }
}




const openindexeddb = () => new Promise<IDBDatabase>(async (res,_rej)=> {

	let dbconnect = indexedDB.open(DBNAME, DBVERSION)

	dbconnect.onerror = (event:any) => { 
		redirect_from_error("IndexedDB - creating/accessing IndexedDB database" + event.target.errorCode)
	}

	dbconnect.onsuccess = async (event: any) => {
		event.target.result.onerror = (event:any) => {
			redirect_from_error("IndexedDB Error - " + event.target.errorCode)
		}
		const db = event.target.result
		res(db)
	}

	dbconnect.onupgradeneeded = (event: any) => {
		const db = event.target.result
		_syncobjectstores.forEach((dc) => {
			if (!db.objectStoreNames.contains(dc.name)) {

				const objectStore = db.createObjectStore(dc.name, { keyPath: 'id' });
                
				(dc.indexes || []).forEach(prop=> { // could be empty and wont create index
					objectStore.createIndex(prop, prop, { unique: false });
				})
			}
		})
	}
})




const load_into_synccollections = (synccollections:SyncObjectStoresT[], retries:num = 0) => new Promise<num|null>(async (res,_rej)=> {

    synccollections.forEach(dc => dc.lock = true);

	const runidstring      = Math.random().toString(15).substring(2, 12)
	let   continue_calling = true	
	const paths            = synccollections.map(dc=> dc.name)
	const tses             = synccollections.map(dc=> dc.ts || null)

	const body = { runid:runidstring, paths, tses }

	while (continue_calling) {
		const r = await $N.FetchLassie('/api/firestore_get_batch', { method: "POST", body: JSON.stringify(body) }, { retries })
		if (r === null) { continue_calling = false; cleanup(); res(null); return; }

		for(let i = 0; i < paths.length; i++) {
			if (r[i].docs.length === 0) continue
			await write_to_indexeddb_store([synccollections[i]], [r[i].docs])
		}

		continue_calling = (r as any[]).every((rr:any) => rr.isdone) ? false : true
	}

	const newts = Math.floor(Date.now()/1000);
	synccollections.forEach(dc => dc.ts = newts);
	localStorage.setItem("synccollections", JSON.stringify(_syncobjectstores
		.map(dc => ({ name: dc.name, ts: dc.ts }))));

	cleanup();

	res(1)


    function cleanup() {
        continue_calling = false;
        synccollections.forEach(dc => dc.lock = false);
    }
})




const write_to_indexeddb_store = (synccollections: SyncObjectStoresT[], datas:Array<object[]>) => new Promise<void>(async (resolve, _reject) => {

	if (!datas.some((d:any) => d.length > 0)) { resolve(); return; }

	const db = await openindexeddb()
	db.onerror = (event:any) => redirect_from_error("IndexedDB Error - " + event.target.errorCode)

	const tx:IDBTransaction = db.transaction(synccollections.map(ds => ds.name), "readwrite", { durability: "relaxed" })

	let are_there_any_put_errors = false

	for(let i = 0; i < synccollections.length; i++) {
		const ds = synccollections[i]

		if (datas[i].length === 0) continue

		const os = tx.objectStore(ds.name)

		for(let ii = 0; ii < datas[i].length; ii++) {
			const db_put = os.put(datas[i][ii])
			db_put.onerror = (_event:any) => are_there_any_put_errors = true
		}
	}

	tx.oncomplete = (_event:any) => {
		if (are_there_any_put_errors) redirect_from_error("Firestorelive Error putting data into IndexedDB")  
		db.close()
		resolve()
	}

	tx.onerror = (_event:any) => {
		redirect_from_error("Firestorelive Error putting data from IndexedDB")
	}
})




const get_paths_from_indexeddb = (pathspecs: PathSpecT[]) => new Promise<FirestoreFetchResultT>(async (resolve, _reject) => {

	const store_datas:FirestoreFetchResultT = new Map()

	const db = await openindexeddb()
	db.onerror = (event_s:any) => redirect_from_error("IndexedDB Request - " + event_s.target.errorCode)

	const store_names = pathspecs.map(p => p.collection)


	const transaction = db.transaction(store_names, 'readonly');

	pathspecs.forEach(p => {

		if (!_syncobjectstores.find(dc => dc.name === p.collection))
			throw new Error("Got to be pulling from a indexeddb store of a collection that is of datasync")

		const store      = transaction.objectStore(p.collection);
		let   getrequest:IDBRequest|IDBRequest<any[]>|null = null

		if (p.doc) {
			getrequest = store.get(p.doc)
		} else {  // NEED TO COME BACK IN AND PULLING WHERE QUERIES FROM INDEXEDDB. NOW, IT JUST PULL ALL
			getrequest = store.getAll()
		}

		getrequest.onerror = (event_s:any) => redirect_from_error("IndexedDB getAll - " + event_s.target.errorCode)

		getrequest.onsuccess = (_event) => {
			const r = Array.isArray(getrequest.result) ? getrequest.result : [getrequest.result]
			store_datas.set(p.path, r)
		};
	})

	transaction.oncomplete = () => {
		db.close()
		resolve(store_datas)	
	}

	transaction.onerror = (event_s:any) => redirect_from_error("IndexedDB Transaction - " + event_s.target.errorCode)
})




function redirect_from_error(errmsg:str) {
	$N.Logger.Log(LoggerTypeE.error, LoggerSubjectE.indexeddb_error, errmsg)
	if (window.location.protocol === "https:") {
		window.location.href = `/index.html?error_subject=${LoggerSubjectE.indexeddb_error}`; 
	} else {
		throw new Error(LoggerSubjectE.indexeddb_error + " -- " + errmsg)
	}
}




export { Init, DataGrab, AddToListens, RemoveFromListens } 
if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).Firestore = { Add, Patch };




