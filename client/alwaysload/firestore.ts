

import { num, str, bool } from '../defs_server_symlink.js'
import { SSETriggersE } from '../defs_server_symlink.js'
import { $NT, LoggerTypeE, LoggerSubjectE, FetchResultT, FirestoreOptsT, EngagementListenerTypeT, FirestoreLoadSpecT, FirestoreFetchResultT } from '../defs.js'


declare var $N:$NT


type DCollectionT = { name: string, ts: num|null, lock:boolean }

type PathSpecT = FirestoreLoadSpecT & {
	p: string[],
	collection: string,
	doc: string|null,
	subcollection: string|null,
	subdoc: string|null,
	collectionquery: string|null,
	subcollectionquery: string|null,
	dcollection: DCollectionT | null
}

type ListenerT = {
	el: HTMLElement,
	name: string,
	getloadspecs: ()=>FirestoreLoadSpecT[],
	cb: any
}


let DBNAME:str = ""
let DBVERSION:num = 0

let _dcollections:DCollectionT[] = []
let _masterdatagrabber_isgraben:boolean = false
let _listeners: ListenerT[] = [];




const Init = (datasync_collections_specs:string[], db_name: str, db_version: num) => new Promise(async (res,_rej)=> { 

	DBNAME = db_name
	DBVERSION = db_version

	{ 
		let local_dcollections:DCollectionT[] = JSON.parse(localStorage.getItem("dcollections") || "[]")

		local_dcollections = local_dcollections.filter((item:DCollectionT) => datasync_collections_specs.includes(item.name))
		datasync_collections_specs.forEach((name) => {
			if (!local_dcollections.find((item:DCollectionT) => item.name === name)) {
				local_dcollections.push({ name, ts: null, lock: false })
			}
		})
		_dcollections = local_dcollections
		localStorage.setItem("dcollections", JSON.stringify(local_dcollections.map(dc=> ({ name: dc.name, ts: dc.ts }))))

		if (_dcollections.length === 0) { res(true); return; }
	}

	$N.EngagementListen.Add_Listener('firestore', EngagementListenerTypeT.visible, 100, async ()=> {
	//window.onfocus = async () => {
		const listener_loadspecs = _listeners.map(l=> l.getloadspecs().map(ls=> parseloadspec(ls)))

		const relevantpathspecs = findrelevantpathspecs(null,listener_loadspecs)
		if (!relevantpathspecs) return

		const r = await masterdatagrabber(relevantpathspecs, {}, true)
		if (r === null) return

		sendtolisteners(listener_loadspecs, relevantpathspecs, r)	
	//}
	})

	$N.SSEvents.Add_Listener(document.body, "firestore_doc", [SSETriggersE.FIRESTORE_DOC], 100, async (event:{path:string,di:object})=> {

		for(let i = 0; i < _listeners.length; i++) {
			const loadspecs = _listeners[i].getloadspecs()
			for(let ii = 0; ii < loadspecs.length; ii++) {
				if (loadspecs[ii].path === event.path) {
					_listeners[i].cb([event.di])
					continue
				}
			}
		}
	});

	$N.SSEvents.Add_Listener(document.body, "firestore_collection", [SSETriggersE.FIRESTORE_COLLECTION], 100, async (event:{paths:str[]})=> {

		const listener_loadspecs = _listeners.map(l=> l.getloadspecs().map(ls=> parseloadspec(ls)))
		const relevantpathspecs = findrelevantpathspecs(event.paths, listener_loadspecs)
		if (!relevantpathspecs) return

		const r = await masterdatagrabber(relevantpathspecs, {}, true)
		if (r === null) return

		sendtolisteners(listener_loadspecs, relevantpathspecs, r)	
	});

	res(1)
})




async function Add_Listener(el:HTMLElement, name:str, getloadspecs:()=>FirestoreLoadSpecT[], callback_:(di?:any|undefined)=>any) {

	let newlistener:ListenerT

	for (const s of _listeners) {
		if (!s.el.parentElement) {
			Remove_Listener(s.el, name) // just a little cleanup. if the element is gone, remove the listener
		}
	}

	newlistener = {
		el: el,
		name: name,
		getloadspecs: getloadspecs,
		cb: callback_
	}

	Remove_Listener(el, name) // will just return if not found

	_listeners.push(newlistener)
}




function Remove_Listener(el:HTMLElement, name:str) {   
	const i = _listeners.findIndex(l=> l.el === el && l.name === name)
	if (i === -1) return
	_listeners.splice(i, 1)   
}




const Retrieve = (_paths:str[]|str, _param_opts:FirestoreOptsT|FirestoreOptsT[]|undefined|null) => new Promise<FetchResultT>(async (_res,_rej)=> { 

	/*
	paths = Array.isArray(paths) ? paths : [paths]

	const opts:FirestoreOptsT[] = set_all_options_from_opts(paths, param_opts)

	const pathspecs = paths.map((p,i)=> getpathspec(p, opts[i]))

	const paths_needing_datasync_init = pathspecs.filter(p=> p.datasyncCollection && p.datasyncCollection.ts === 0)
	const dcollections_to_init = paths_needing_datasync_init.map(p=> p.datasyncCollection!)
	const rs = await initDataSyncCollections(dcollections_to_init)
	if (rs === null) { res(null); return; }

	const straightfetches    = pathspecs.filter(p=> !p.datasyncCollection)
	const datasyncfetches    = pathspecs.filter(p=> p.datasyncCollection)

	const promises:Promise<FetchResultT>[] = []

	const straightfetches_promise = straightfetches.length ? firestore_fetch_paths(paths, opts) : new Promise<FetchResultT>((res)=> res([]))
	const datasyncfetches_promise = datasyncfetches.length ? getPathDatasFromIndexedDB(datasyncfetches) : new Promise<FetchResultT>((res)=> res([]))
	promises.push(straightfetches_promise, datasyncfetches_promise)

	const allrs = await Promise.all(promises)

	console.log(allrs)

	console.log("ORDER OF ARRAY OF RETURN SHOULD MATCH ORDER OF PATHS IN RETRIEVE ARG")
	console.log("FUCK OPTION TO PASS AND RECEIVE ARRAY OR OBJECT. IN AND OUT SHOULD ONLY BE ARRAY PERIOD ALL THE WAY THROUGH")
	res([])
	*/
})




function Add(path:str, newdocs:any[]) { return new Promise(async (res,_rej)=> { 

    const body = { path, newdocs }

    const opts:{method:'POST',body:string} = {
        method: 'POST',
        body: JSON.stringify(body),
    }

    await $N.FetchLassie('/api/firestore_add', opts, null) as Promise<any[]>

    res({result_str: "ok"})
})}




function Patch(paths:str, data:any, param_opts:object|object|null) {   return new Promise(async (res, _rej)=> { 

    const body = { paths, opts: param_opts, data }

    const opts:any = {   
        method: "POST",  
        body: JSON.stringify(body),
    }

    const fetch_results = await $N.FetchLassie('/api/firestore_patch', opts, null) as Promise<any[]>

    res(fetch_results)
})}




const DataGrab = (loadspecs:FirestoreLoadSpecT[]) => new Promise<FirestoreFetchResultT>(async (res,_rej)=> {

	const pathspecs = loadspecs.map(ls=> parseloadspec(ls))
	if (!pathspecs.length) { res(null); return; }

	const r = await masterdatagrabber(pathspecs, {}, false)
	if (r === null) { res(null); return; }

	res(r)
})




const masterdatagrabber = (pathspecs:PathSpecT[], opts?:{}, forcerefresh:bool = false) => new Promise<FirestoreFetchResultT>(async (res,_rej)=> { 

	opts = opts || {}

	let   allrs:FirestoreFetchResultT[] = []	
	const track_pos = pathspecs.map(p=> p.dcollection ? 1 : 0)
	const promises:Promise<FirestoreFetchResultT>[] = []

	const paths_tosync                 = pathspecs.filter(p=> p.dcollection &&  ( p.dcollection.ts === null || forcerefresh )  )
	const dcollections_tosync_withdups = paths_tosync.map(p=> p.dcollection!)
	const dcollections_tosync          = dcollections_tosync_withdups.filter((item, index) => dcollections_tosync_withdups.indexOf(item) === index)
	const dcollections_tosync_unlocked = dcollections_tosync.filter(dc=> !dc.lock)
	const dcollections_tosync_locked   = dcollections_tosync.filter(dc=> dc.lock)


	const straight_fetch_pathspecs     = pathspecs.filter(p=> !p.dcollection)
	const straight_fetch_promise       = straight_fetch_pathspecs.length ? firestore_fetch_paths(straight_fetch_pathspecs) : new Promise<FirestoreFetchResultT>((res)=> res(new Map()))
	promises.push(straight_fetch_promise)


	if (dcollections_tosync_unlocked.length) {
		const rs = await loadDataSyncCollections(dcollections_tosync_unlocked)
		if (rs === null) { res(null); return; }
	}

	if (dcollections_tosync_locked.length) {
		await new Promise((resolve_inner) => {
			const intrvl = setInterval(() => {
				if (dcollections_tosync_locked.every(dc=> !dc.lock)) {
					clearInterval(intrvl)
					resolve_inner(1)
				}
			}, 100)
		})
	}


	const datasync_fetch_pathspecs     = pathspecs.filter(p=> p.dcollection)
	const datasync_fetch_promise       = datasync_fetch_pathspecs.length ? getPathDatasFromIndexedDB(datasync_fetch_pathspecs) : new Promise<FirestoreFetchResultT>((res)=> res(new Map()))
	promises.push(datasync_fetch_promise)


	allrs = await Promise.all(promises)


	if (allrs[0] === null || allrs[1] === null) { res(null); return; }


	{ // make sure the response is in the same order as the pathspecs

		const res_array:any[] = pathspecs.map(() => [])
		let incr:num[]  = [0,0]
		for(let i = 0; i < pathspecs.length; i++) 
			if (track_pos[i] === 0) 
				res_array[i] = allrs[0][incr[0]++]
			else 
				res_array[i] = allrs[1][incr[1]++]

		res(res_array)
	}
})




function findrelevantpathspecs(ssepaths:str[]|null, listener_loadspecs:Array<PathSpecT[]>) : PathSpecT[]|null {

	const ssepathspecs = ssepaths ? ssepaths.map(sp=> parseloadspec({name:"", path:sp})) : null

	const allpathspecs       = listener_loadspecs.flat()
	const alluniquepathspecs:PathSpecT[] = []

	allpathspecs.forEach(aps=> {
		const matching_pathspec = alluniquepathspecs.find(up=> up.path === aps.path)
		if (matching_pathspec) return

		alluniquepathspecs.push(aps)
	})

	if (!ssepathspecs) return alluniquepathspecs.length ? alluniquepathspecs : null

	const allrelevantpathspecs = alluniquepathspecs.filter(aps=> { 
		const matching_ssepathspec = ssepathspecs.find(sp=> sp.path === aps.path)
		return matching_ssepathspec ? true : false
	})

	return allrelevantpathspecs.length ? allrelevantpathspecs : null
}




function sendtolisteners(listener_loadspecs:Array<PathSpecT[]>, relevantpathspecs:PathSpecT[], r:FirestoreFetchResultT) {

	if (!r) return

	for(let i = 0; i < _listeners.length; i++) {
		const loadspecs = listener_loadspecs[i]
		const returndata = Array(loadspecs.length).fill(null)
		for(let ii = 0; ii < loadspecs.length; ii++) {
			const ls = loadspecs[ii]
			const relevantpathspec_index = relevantpathspecs.findIndex(rp=> rp.path === ls.path)
			if (relevantpathspec_index !== -1) {
				returndata[ii] = r[relevantpathspec_index] 
			}
		}
		if (returndata.some(rd=> rd !== null)) _listeners[i].cb(returndata)
	}
}




function firestore_fetch_paths(pathspecs:PathSpecT[]) {   return new Promise<FirestoreFetchResultT>(async (res)=> {

	const paths = pathspecs.map(p=> p.path)
	const opts  = pathspecs.map(p=> p.opts || {})

    const body = { paths, opts }
    const fetchopts:any = {   
        method: "POST",
        body: JSON.stringify(body),
    }
    const fetch_results = await $N.FetchLassie('/api/firestore_retrieve', fetchopts, null) as Promise<Array<object[]>|null>
	if (fetch_results === null) {
		res(null)
		return
	}

	const results = new Map()
	for(let i = 0; i < pathspecs.length; i++) {
		const pathname = pathspecs[i].path
		results.set(pathname, fetch_results[i])
	}

    res(results)
})}




function parseloadspec(ls:FirestoreLoadSpecT) : PathSpecT {
	const p                    = ls.path.split('/') as Array<string>
	const collectionsplit      = p[0].split(":")
	const subcollectionsplit   = p[2] ? p[2].split(":") : null
	const collection           = collectionsplit[0]
	const doc                  = p[1] || null
	const subcollection        = p[2] ? subcollectionsplit && subcollectionsplit.length == 2 ? subcollectionsplit[1] : p[2] : null
	const subdoc               = p[3] || null

	const collectionquery      = collectionsplit.length==2 ? collectionsplit[1] : null
	const subcollectionquery   = subcollectionsplit && subcollectionsplit.length==2 ? subcollectionsplit[1] : null

	const datasync_dcollection = !subcollection ? _dcollections.find((dc) => dc.name === collection) || null : null

	return {  ...ls, p, collection, doc, subcollection, subdoc, collectionquery, subcollectionquery, dcollection: datasync_dcollection   }
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
		_dcollections.forEach((dc) => {
			event.target.result.createObjectStore(dc.name, { keyPath: "id" })
		})
	}
})




const loadDataSyncCollections = (dcollections:DCollectionT[]) => new Promise<num|null>(async (res,_rej)=> {

	dcollections.forEach(dc=> dc.lock = true)

	const sr = await $N.SSEvents.WaitTilConnectedOrTimeout()
	if (!sr) { res(null); return; }

	const listran = Math.random().toString(36).substring(2, 10)

	$N.SSEvents.Add_Listener(document.body, "firestore_batch", [SSETriggersE.FIRESTORE_BATCH], null, async (event:{path:string,docs:object[], instance_id:str, isend:bool})=> {

		if (event.instance_id !== listran) return

		const dcollection = dcollections.find(dc=> dc.name === event.path)
		if (!dcollection) throw new Error("datasync collection not found from sse firestore batch event")
		await writeToIndexedDBCollection([dcollection], [ event.docs ])

		if (event.isend) {
			const newts = Math.floor( Date.now()  / 1000)
			dcollections.forEach(dc=> dc.ts = newts)
			localStorage.setItem("dcollections", JSON.stringify(_dcollections.map(dc=> ({ name: dc.name, ts: dc.ts }))))
			$N.SSEvents.Remove_Listener(document.body, "firestore_batch"+listran)
			dcollections.forEach(dc=> dc.lock = false)
			iscomplete = true
			clearTimeout(timeout)
			res(1)
		}
	});


	const timeout = setTimeout(() => {
		if (!iscomplete) {
			$N.SSEvents.Remove_Listener(document.body, "firestore_batch"+listran)
			dcollections.forEach(dc=> dc.lock = false)
			console.error("Timeout waiting for data sync to complete");
			res(null)
		}
	}, 30000);

	let   iscomplete      = false
	const paths = dcollections.map(dc=> dc.name)
	const tses            = dcollections.map((dc)=> (dc.ts ? dc.ts : null) )

    const body = { paths, tses, sse_id: localStorage.getItem("sse_id"), instance_id: listran }
    const fetchopts:any = { method: "POST", body: JSON.stringify(body) }
    const rs = await $N.FetchLassie('/api/firestore_init_batches', fetchopts, null) as Promise<Array<object[]>|null>
	if (rs === null) { iscomplete = true; res(null); return; }

	// nothing now. sse will call promise resolve when done
})




const writeToIndexedDBCollection = (dcollections: DCollectionT[], datas:Array<object[]>) => new Promise<void>(async (resolve, _reject) => {

	if (!datas.some((d:any) => d.length > 0)) { resolve(); return; }

	const db = await openindexeddb()
	db.onerror = (event:any) => redirect_from_error("IndexedDB Error - " + event.target.errorCode)

	const tx:IDBTransaction = db.transaction(dcollections.map(ds => ds.name), "readwrite", { durability: "relaxed" })

	let are_there_any_put_errors = false

	for(let i = 0; i < dcollections.length; i++) {
		const ds = dcollections[i]

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




const getPathDatasFromIndexedDB = (pathspecs: PathSpecT[]) => new Promise<FirestoreFetchResultT>(async (resolve, _reject) => {

	const store_datas:FirestoreFetchResultT = new Map()

	const db = await openindexeddb()
	db.onerror = (event_s:any) => redirect_from_error("IndexedDB Request - " + event_s.target.errorCode)

	const store_names = pathspecs.map(p => p.collection)
	const transaction = db.transaction(store_names, 'readonly');

	for(let i = 0; i < pathspecs.length; i++) {
		const p = pathspecs[i]

		if (!_dcollections.find(dc => dc.name === p.collection))
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
			const data = getrequest.result;
			store_datas[i] = data
		};
	}

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


/*
const fleshoutspecs = (loadspecs:ComponentMechanicsLoadSpecT, type:DataGrabberTypeT, sse:{paths:str[], data:any[]}|null) : { firestorespecs:CompFExpT[] } => {


	// for now, just assume firestore. Its the only type of data load fleshed out currently. Hopefully influxdb and other will be fleshed out soon
	if (!loadspecs.firestore) { 
		throw new Error("For now, only using firestorespec. will change in (hopefully) near future")
	}


	const firestorespecs:CompFExpT[] = loadspecs.firestore.map(f=> {
		return {
			...f,
			loadit: false,
			usets: false,
			docID: null,
			docData: null,
			ts: null
		}
	})


	firestorespecs.forEach(spec=> {

		const p                   = spec.path.split('/') as Array<string>
		const isdoc               = p.length % 2 === 0
		const collectionName      = isdoc ? p.slice(0, -1).join('/') : spec.path.split(":")[0]

		if (type === DataGrabberTypeT.INITIAL) {
			spec.loadit = true
			spec.usets  = false
		}
		else if (type === DataGrabberTypeT.VISIBILE) {
			spec.loadit = true
			spec.usets  = true
		}
		else if (type === DataGrabberTypeT.SSE) {

			if (!sse) return // continue to next in forEach

			if (isdoc) { // spec is a doc
				const sseindex = sse.paths.findIndex(sp=> sp === spec.path)
				if (sseindex !== -1) return // continue to next in forEach
				if (sse.data[sseindex]) {
					spec.docData = sse.data[sseindex]
					spec.docID   = null
					spec.loadit  = false
					spec.usets   = false
				}
				else {
					spec.loadit = true
					spec.usets  = false
				}
			}
			else { // spec is a collection
				const sseCollectionIndex = sse.paths.findIndex(sp=> sp === collectionName)
				const sseDocIndex        = sseCollectionIndex !== -1 ? -1 : sse.paths.findIndex(ssepath=> {
					const sp                   = ssepath.split('/')
					const isMatchingCollection = ssepath.includes(collectionName + '/')
					const isDocOfCollection	   = sp.length === p.length + 1

					if (isMatchingCollection && isDocOfCollection) {
						return true
					}
				})
				
				if (sseCollectionIndex !== -1) {
					spec.loadit = true
					spec.usets  = true
				}		
				else if (sseDocIndex !== -1) {
					spec.docData = sse.data[sseDocIndex] || null
					spec.docID   = sse.data[sseDocIndex] ? sse.data[sseDocIndex].id : null
					spec.loadit  = false
					spec.usets   = false
				}
			}
		}
	})

	return { firestorespecs }
}

*/
























/*
async function processSSEBatchQueue() {
	while (_sseBatchQueue.length > 0) {
    
		const batchEvent = _sseBatchQueue.shift();
		switch (batchEvent.type) {

			case "batch":
				try {
					_is_updating_promise = doupdate(batchEvent.paths, batchEvent.data);
					await _is_updating_promise;
					_is_updating_promise = null;
				} catch (error) { console.error("Error processing SSE batch", error); _is_updating_promise = null; }
				break;

			case "done":
				console.log("Data sync complete");
			break;

			case "error":
				console.error("SSE reported an error:", batchEvent.message);
			break;

			default:
				console.warn("Received unknown SSE event type", batchEvent);
			break;
		}
	}
}
*/






/*
*/




/*
function set_all_options_from_opts(paths:str[], popts:FirestoreOptsT|FirestoreOptsT[]|undefined|null) : FirestoreOptsT[] {
    const o:FirestoreOptsT[] = (!popts) ? paths.map(()=> ({})) : Array.isArray(popts) ? popts : paths.map(()=> popts)
    const opts:FirestoreOptsT[] = paths.map((_p,i)=> {   return o[i] ? o[i] : o[o.length-1]   })
    return opts
}
*/








/*
*/




/*
*/




/*
*/









/*
*/




export { Init } 
if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).Firestore = { Add_Listener, Retrieve, Add, Patch, DataGrab };




