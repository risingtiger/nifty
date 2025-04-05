

import { num, str, bool } from '../defs_server_symlink.js'
import { SSETriggersE } from '../defs_server_symlink.js'
import { $NT, LoggerTypeE, LoggerSubjectE, EngagementListenerTypeT, GenericRowT  } from '../defs.js'
import { HandleLocalDBSyncUpdateTooLarge as SwitchStationHandleLocalDBSyncUpdateTooLarge } from './switchstation.js'
import { Init as CMechInit, AddView as CMechAddView, SearchParamsChanged as CMechSearchParamsChanged, DataChanged as CMechDataChanged } from './cmech.js'
import { Add as M_Add, Patch as M_Patch, Delete as M_Delete } from './localdbsync_modify.js'


declare var $N:$NT


type SyncObjectStoresT = { name: string, ts: num|null, lock:boolean, indexes:string[]|null }

export type PathSpecT = {
	path:string,
	p: string[],
	collection: string,
	docid: string|null, // never will just be a document (always a collection). but could be a path like "machines/1234/statuses"
	subcollection: string|null,
	syncobjectstore: SyncObjectStoresT,
}


let DBNAME:str = ""
let DBVERSION:num = 0

let db:IDBDatabase|null = null
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

		const r = await datasetter(_activepaths, {retries:2}, true, true)
		if (r === null || r === 1) return

		notify_of_datachange(r as Map<str, GenericRowT[]>)
	})


	$N.SSEvents.Add_Listener(document.body, "firestore_doc_add", [SSETriggersE.FIRESTORE_DOC_ADD], 100, (event:{path:string,data:object})=> {
		handle_firestore_doc_add_or_patch(event.path, event.data)
	});


	$N.SSEvents.Add_Listener(document.body, "firestore_doc_patch", [SSETriggersE.FIRESTORE_DOC_PATCH], 100, (event:{path:string,data:object, ispartial?:bool})=> {
		handle_firestore_doc_add_or_patch(event.path, event.data, event.ispartial || false)
	});


	$N.SSEvents.Add_Listener(document.body, "firestore_doc_delete", [SSETriggersE.FIRESTORE_DOC_DELETE], 100, (event:{path:string,data:object})=> {
		//TODO: not handling delete yet. REALLY NEED TO. Not too hard to remove from local database and pass to cmech. But, when about when user has been offline and missed delete calls. Need a server side list to send of delete history since ts
	});


	$N.SSEvents.Add_Listener(document.body, "firestore_doc_collection", [SSETriggersE.FIRESTORE_COLLECTION], 100, async (event:{paths:str[]})=> {

		// event.paths is only going to be collections, never a singe document. Single doc goes through SSETriggersE.FIRESTORE_DOC

		const pathspecs = findrelevantpathspecs_from_ssepaths(event.paths)
		if (!pathspecs) return

		const r = await datasetter(pathspecs, {}, true, true)
		if (r === null || r === 1) return

		notify_of_datachange(r as Map<str, GenericRowT[]>)
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


	function notify_of_datachange(returns:Map<str, GenericRowT[]>) {

		if (returns.size === 0) return

		let is_too_large_to_update = false

		if ([...returns].some(rr=> rr[1].length === 300)) is_too_large_to_update = true

		if (is_too_large_to_update) {
			SwitchStationHandleLocalDBSyncUpdateTooLarge()
			return
		}	

		if ([...returns].some(rr => rr[1].length >= 1)) {
			CMechDataChanged(returns)
		}
	}
}




const EnsureObjectStoresActive = (names:str[]) => new Promise<num|null>(async (res,_rej)=> {

	// currently is only main level firestore collections. will add subcollections soon

	const pathspecs:PathSpecT[] = names.map(name=> parse_into_pathspec(name))

	const newpathspecs = pathspecs.filter(pathspec => 
		!_activepaths.some(activePath => 
			activePath.collection === pathspec.collection && 
			activePath.docid === pathspec.docid && 
			activePath.subcollection === pathspec.subcollection
		)
	)

	if (newpathspecs.length === 0) { res(1); return; }

	const r = await datasetter(newpathspecs, {}, false, false)
	if (r === null) { res(null); return; }

	_activepaths = [..._activepaths, ...newpathspecs]

	res(1)
})




const Add = (path:str, data:GenericRowT) => new Promise<num|null>(async (res,_rej)=> {  
	const p = parse_into_pathspec(path)
	if (!db) db = await openindexeddb()
	const r = await M_Add(db, p, data)
	if (!r) { redirect_from_error("IndexedDB Error adding data"); res(null); return; }

	handle_firestore_doc_add_or_patch(path, r, false, false)
	res(1)
})




const Patch = (path:str, data:GenericRowT) => new Promise<num|null>(async (res,_rej)=> {  
	const p = parse_into_pathspec(path)
	if (!db) db = await openindexeddb()
	const r = await M_Patch(db, p, data)
	if (!r) { redirect_from_error("IndexedDB Error patching data"); res(null); return; }

	handle_firestore_doc_add_or_patch(path, r, false, false)
	res(1)
})




const Delete = (path:str) => new Promise<num|null>(async (res,_rej)=> {  
	const p = parse_into_pathspec(path)
	if (!db) db = await openindexeddb()
	const r = await M_Delete(db, p)
	if (!r) { redirect_from_error("IndexedDB Error deleting data"); res(null); return; }

	res(r)
})




async function handle_firestore_doc_add_or_patch(path:str, data:object, ispartial:bool = false, save_to_indexeddb:bool = true) {

	const pathspec = parse_into_pathspec(path)!
	if (pathspec.syncobjectstore && save_to_indexeddb) {   await write_to_indexeddb_store([ pathspec.syncobjectstore ], [ [data], [{ispartial}] ]);   }

	const returnmap = new Map<str, GenericRowT[]>([[pathspec.syncobjectstore.name, [data]]])

	CMechDataChanged(returnmap)
}




const datasetter = (pathspecs:PathSpecT[], opts?:{retries?:num}, force_refresh_syncobjectstores:bool = false, returnnewdata=false) => new Promise<num|null|Map<str,GenericRowT[]>>(async (res,_rej)=> { 

	opts = opts || {retries:0}
	opts.retries = opts.retries || 0

	let returns:Map<str,GenericRowT[]> = new Map()

	const paths_tosync                            = pathspecs.filter(p=> p.syncobjectstore.ts === null || force_refresh_syncobjectstores )

	// probably wont be duplicates, but when I start doing subcollections it could start being an issue

	const syncobjectstores_tosync_withduplicates  = paths_tosync.map(p=> p.syncobjectstore!)
	const syncobjectstores_tosync                 = syncobjectstores_tosync_withduplicates.filter((item, index) => syncobjectstores_tosync_withduplicates.indexOf(item) === index)
	const syncobjectstores_tosync_unlocked        = syncobjectstores_tosync.filter(dc=> !dc.lock)
	const syncobjectstores_tosync_locked          = syncobjectstores_tosync.filter(dc=> dc.lock)


	{
		if (syncobjectstores_tosync_unlocked.length) {
			const rs = await load_into_syncobjectstores(syncobjectstores_tosync_unlocked, opts.retries, returnnewdata)
			if (rs === null) { res(null); return; }

			if (returnnewdata) returns = rs as Map<str,GenericRowT[]>
		}

		if (syncobjectstores_tosync_locked.length) {
			await new Promise((resolve_inner) => {
				const intrvl = setInterval(() => {
					if (syncobjectstores_tosync_locked.every(dc=> !dc.lock)) {
						clearInterval(intrvl)
						resolve_inner(1)
					}
				}, 10)
			})
		}
	}

	
	if (returnnewdata) res(returns)
	else               res(1)
})




function parse_into_pathspec(path:str) : PathSpecT {

	const p                    = path.split('/') as Array<string>
	const collection           = p[0]
	const docid                = p[1] || null // only ever have a docid because we'll be using a subcollection. ALL paths are collections
	const subcollection        = docid && p[2] ? p[2] : null 

	// syncollection currently is ONLY for main level collections. we'll be adding subcollections soon (so firestore machines/123/statuses for example can be accessed)
	const syncobjectstore      = _syncobjectstores.find((dc) => dc.name === collection) as SyncObjectStoresT

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




const load_into_syncobjectstores = (syncobjectstores:SyncObjectStoresT[], retries:num = 0, returnnewdata:bool, returnnewdata_limit:num = 300) => new Promise<num|null|Map<str,GenericRowT[]>>(async (res,_rej)=> {

    syncobjectstores.forEach(dc => dc.lock = true);

	const runidstring       = Math.random().toString(15).substring(2, 12)
	let   continue_calling  = true	
	const paths             = syncobjectstores.map(dc=> dc.name)
	const tses              = syncobjectstores.map(dc=> dc.ts || null)
	const returns           = new Map<str,GenericRowT[]>( paths.map(path=> [path, []]) )
	const body              = { runid:runidstring, paths, tses }

	while (continue_calling) {
		const r = await $N.FetchLassie('/api/firestore_get_batch', { method: "POST", body: JSON.stringify(body) }, { retries })
		if (r === null || !(r as any).ok) { continue_calling = false; cleanup(); res(null); return; }

		for(let i = 0; i < paths.length; i++) {
			if (r[i].docs.length === 0) continue
			await write_to_indexeddb_store([syncobjectstores[i]], [r[i].docs])
			if (returnnewdata) pushtoreturns(paths[i], r[i].docs)
		}

		continue_calling = (r as any[]).every((rr:any) => rr.isdone) ? false : true
	}

	const newts = Math.floor(Date.now()/1000);
	syncobjectstores.forEach(dc => dc.ts = newts);
	localStorage.setItem("synccollections", JSON.stringify(_syncobjectstores
		.map(dc => ({ name: dc.name, ts: dc.ts }))));

	cleanup();

	if (returnnewdata)	res(returns);
	else				res(1)


    function cleanup() {
        continue_calling = false;
        syncobjectstores.forEach(dc => dc.lock = false);
    }


	function pushtoreturns( path:string, docs:GenericRowT[] ) {
		const rp = returns.get(path)!
		const available_space = returnnewdata_limit - rp.length
		rp.push(...docs.slice(0, available_space))
	}
const write_to_indexeddb_store = (syncobjectstores: SyncObjectStoresT[], datas:Array<object[]>, opts:{ispartial:bool}[] = []) => new Promise<void>(async (resolve, reject) => {

	if (!datas.some((d:any) => d.length > 0)) { resolve(); return; }

	if( !db ) db = await openindexeddb() // Assuming openindexeddb handles its own errors/rejections

	const tx:IDBTransaction = db.transaction(syncobjectstores.map(ds => ds.name), "readwrite", { durability: "relaxed" })

	while (opts.length < syncobjectstores.length)   opts.push({ ispartial: false });

	let operations_failed = false // Flag to track if any operation within the transaction fails

	for(let i = 0; i < syncobjectstores.length; i++) {
		const ds = syncobjectstores[i]
		if (datas[i].length === 0) continue
		const ispartial = opts[i].ispartial
		const os = tx.objectStore(ds.name)

		for(let ii = 0; ii < datas[i].length; ii++) {
            const currentData = datas[i][ii] as GenericRowT; // Type assertion for clarity

            // Centralized error handler for operations within the loop
            const handleError = (operation: string, id: string | number | undefined, error: any) => {
                console.error(`IndexedDB ${operation} error for id ${id || 'N/A'} in store ${ds.name}:`, error);
                operations_failed = true; // Mark that an operation failed
            };

			if (ispartial) {
				const id = currentData.id; // Assumes data object has an 'id' property for lookup
				if (!id) {
					// Log a warning and fallback to a full put if ID is missing for a partial update
					console.warn("Partial update requested but data has no ID:", currentData, "in store", ds.name, ". Performing full put instead.");
                    const putRequest = os.put(currentData);
                    putRequest.onerror = (event: any) => handleError('put (partial fallback)', id, event.target.error);
				} else {
					// Perform get -> merge -> put for partial update
					const getRequest = os.get(id);
					getRequest.onerror = (event: any) => handleError('get (partial)', id, event.target.error);
					
					// Define onsuccess handler for the get request
					getRequest.onsuccess = (event: any) => {
						const existingData = getRequest.result;
						let dataToPut;
						if (existingData) {
							// Merge existing data with partial data
							dataToPut = { ...existingData, ...currentData };
						} else {
							// If record doesn't exist, warn and insert the partial data as a new record
							console.warn(`Record with id ${id} not found for partial update in store ${ds.name}. Inserting new record.`);
							dataToPut = currentData;
						}
						// Put the merged or new data back into the object store
						const putRequest = os.put(dataToPut);
						putRequest.onerror = (event: any) => handleError('put (partial merge)', id, event.target.error);
					};
				}
			} else {
				// Perform a standard full put (overwrite)
				const putRequest = os.put(currentData);
                putRequest.onerror = (event: any) => handleError('put (full)', currentData.id, event.target.error);
			}
		}
	}

	// Transaction completion handler
	tx.oncomplete = (_event:any) => {
		if (operations_failed) {
            // If any operation failed, reject the promise
            const errorMsg = `IndexedDB transaction completed, but one or more operations failed in stores: ${syncobjectstores.map(s=>s.name).join(', ')}`;
            console.error(errorMsg);
            reject(new Error(errorMsg)); // Reject the promise
		} else {
			resolve(); // All operations succeeded, resolve the promise
		}
	}

	// Transaction error handler (catches transaction-level errors, e.g., aborts)
	tx.onerror = (event:any) => {
        const errorMsg = `IndexedDB Transaction Error aborted in stores: ${syncobjectstores.map(s=>s.name).join(', ')} - ${(event.target as IDBTransaction).error}`;
		console.error(errorMsg);
        reject(new Error(errorMsg)); // Reject the promise
	}
})




/*
const get_paths_from_indexeddb = (pathspecs: PathSpecT[]) => new Promise<DataFetchResultT>(async (resolve, _reject) => {

	const store_datas:DataFetchResultT = new Map()

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
*/




function redirect_from_error(errmsg:str) {
	$N.Logger.Log(LoggerTypeE.error, LoggerSubjectE.indexeddb_error, errmsg)
	if (window.location.protocol === "https:") {
		window.location.href = `/index.html?error_subject=${LoggerSubjectE.indexeddb_error}`; 
	} else {
		throw new Error(LoggerSubjectE.indexeddb_error + " -- " + errmsg)
	}
}






export { Init, EnsureObjectStoresActive } 
if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).LocalDBSync = { Add, Patch, Delete };




