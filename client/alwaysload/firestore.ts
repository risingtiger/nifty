

import { num, str, bool } from '../defs_server_symlink.js'
import { SSETriggersE } from '../defs_server_symlink.js'
import { $NT, LoggerTypeE, LoggerSubjectE, FirestoreOptsT, EngagementListenerTypeT, FirestoreLoadSpecT, FirestoreFetchResultT } from '../defs.js'


declare var $N:$NT


type SyncCollectionT = { name: string, ts: num|null, lock:boolean }

type PathSpecT = FirestoreLoadSpecT & {
	p: string[],
	collection: string,
	doc: string|null,
	subcollection: string|null,
	subdoc: string|null,
	collectionquery: string|null,
	subcollectionquery: string|null,
	synccollection: SyncCollectionT | null,
	isdoc: boolean
}

type ListenerT = {
	el: HTMLElement,
	name: string,
	getloadspecs: ()=>FirestoreLoadSpecT[],
	cb: any
}


let DBNAME:str = ""
let DBVERSION:num = 0

let _synccollections:SyncCollectionT[] = []
let _listeners: ListenerT[] = [];
let _nonsync_tses: Map<str,num> = new Map()





const Init = (synccollection_names:string[], db_name: str, db_version: num) => new Promise(async (res,_rej)=> { 

	DBNAME = db_name
	DBVERSION = db_version

	{ 
		let localstorage_synccollections:SyncCollectionT[] = JSON.parse(localStorage.getItem("synccollections") || "[]")

		localstorage_synccollections = localstorage_synccollections.filter((item:SyncCollectionT) => synccollection_names.includes(item.name))
		synccollection_names.forEach((name) => {
			if (!localstorage_synccollections.find((item:SyncCollectionT) => item.name === name)) {
				localstorage_synccollections.push({ name, ts: null, lock: false })
			}
		})
		_synccollections = localstorage_synccollections
		localStorage.setItem("synccollections", JSON.stringify(localstorage_synccollections.map(dc=> ({ name: dc.name, ts: dc.ts }))))

		if (_synccollections.length === 0) { res(true); return; }
	}


	$N.EngagementListen.Add_Listener(document.body, 'firestore', EngagementListenerTypeT.visible, 100, async ()=> {

		const pathspecs = findrelevantpathspecs()
		if (!pathspecs) return

		const r = await datagrabber(pathspecs, {}, true)
		if (r === null) return

		sendtolisteners(r)	
	})


	$N.SSEvents.Add_Listener(document.body, "firestore_doc", [SSETriggersE.FIRESTORE_DOC], 100, async (event:{path:string,data:object})=> {

		const r = new Map()	
		r.set(event.path, [event.data])

		sendtolisteners(r)	
	});


	$N.SSEvents.Add_Listener(document.body, "firestore_collection", [SSETriggersE.FIRESTORE_COLLECTION], 100, async (event:{paths:str[]})=> {

		// event.paths is only going to be collections, never a singe document. Single doc goes through SSETriggersE.FIRESTORE_DOC

		const pathspecs = findrelevantpathspecs(event.paths)
		if (!pathspecs) return

		const r = await datagrabber(pathspecs, {}, true)
		if (r === null) return

		sendtolisteners(r)	
	});


	res(1)
})




async function Add_Listener(el:HTMLElement, name:str, getloadspecs:()=>FirestoreLoadSpecT[], callback_:(di?:any|undefined)=>any) {

	let newlistener:ListenerT

	for(let i = 0; i < _listeners.length; i++) {
		if (!_listeners[i].el.parentElement) {
			_listeners.splice(i, 1)   
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
	const i = _listeners.findIndex(l=> l.el.tagName === el.tagName && l.name === name)
	if (i === -1) return
	_listeners.splice(i, 1)   
}




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

	const r = await datagrabber(pathspecs, {}, false)
	if (r === null) { res(null); return; }

	res(r)
})




const datagrabber = (pathspecs:PathSpecT[], opts?:{}, force_refresh_synccollections:bool = false) => new Promise<FirestoreFetchResultT>(async (res,_rej)=> { 

	opts = opts || {}

	let   allrs:FirestoreFetchResultT[] = []	
	const promises:Promise<FirestoreFetchResultT>[] = []

	const paths_tosync                          = pathspecs.filter(p=> p.synccollection &&  ( p.synccollection.ts === null || force_refresh_synccollections )  )
	const synccollections_tosync_withduplicates = paths_tosync.map(p=> p.synccollection!)
	const synccollections_tosync                = synccollections_tosync_withduplicates.filter((item, index) => synccollections_tosync_withduplicates.indexOf(item) === index)
	const synccollections_tosync_unlocked       = synccollections_tosync.filter(dc=> !dc.lock)
	const synccollections_tosync_locked         = synccollections_tosync.filter(dc=> dc.lock)


	{
		const nonsync_fetch_pathspecs               = pathspecs.filter(p=> !p.synccollection)
		const nonsync_fetch_promise                 = nonsync_fetch_pathspecs.length ? fetch_nonsync_paths(nonsync_fetch_pathspecs) : new Promise<FirestoreFetchResultT>((res)=> res(new Map()))
		promises.push(nonsync_fetch_promise)
	}


	{
		if (synccollections_tosync_unlocked.length) {
			const rs = await load_into_synccollections(synccollections_tosync_unlocked)
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
		const indexeddb_fetch_pathspecs     = pathspecs.filter(p=> p.synccollection)
		const indexeddb_fetch_promise       = indexeddb_fetch_pathspecs.length ? get_paths_from_indexeddb(indexeddb_fetch_pathspecs) : new Promise<FirestoreFetchResultT>((res)=> res(new Map()))
		promises.push(indexeddb_fetch_promise)
	}


	allrs = await Promise.all(promises)


	if (allrs[0] === null || allrs[1] === null) { res(null); return; }

	const combined_results = new Map([...allrs[0], ...allrs[1]])

	res(combined_results)
})




function findrelevantpathspecs(ssepaths?:str[]) : PathSpecT[]|null {

	// sse paths are ONLY collections, never a single doc

	const all_listener_loadspecs = _listeners.map(l=> l.getloadspecs().map(ls=> parseloadspec(ls)))
	const ssepathspecs           = ssepaths ? ssepaths.map(sp=> parseloadspec({name:"", path:sp})) : []
	const all_pathspecs          = all_listener_loadspecs.flat()
	const all_unique_pathspecs   = [] as PathSpecT[]

	all_pathspecs.forEach(aps=> {
		const matching_pathspec = all_unique_pathspecs.find(up=> up.path === aps.path)
		if (matching_pathspec) return
		all_unique_pathspecs.push(aps)
	})

	if (all_unique_pathspecs.length === 0) return null
	if (ssepathspecs.length === 0)         return all_unique_pathspecs


	const pathspecs = all_unique_pathspecs.filter(aps=> { 
		const ssepathspec = ssepathspecs.find(sp=> sp.collection === aps.collection && sp.subcollection === aps.subcollection)
		return ssepathspec 
	})

	if (pathspecs.length === 0)            return null

	return pathspecs
}




function sendtolisteners(r:FirestoreFetchResultT) {

	if (r === null) return

	_listeners.forEach(l=> {
		const loadspecs = l.getloadspecs()
		const returns = new Map()

		for(const l of loadspecs) {
			if (!r.has(l.path)) continue
			const rs = r.get(l.path)	
			returns.set(l.path, rs)
		}

		if (returns.size > 0) l.cb(returns)
	})
}




function fetch_nonsync_paths(pathspecs:PathSpecT[]) {   return new Promise<FirestoreFetchResultT>(async (res)=> {

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
    const fetch_results = await $N.FetchLassie('/api/firestore_retrieve', fetchopts, null) as Promise<Array<object[]>|null>
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

	const synccollection = !subcollection ? _synccollections.find((dc) => dc.name === collection) || null : null

	const isdoc                = doc ? true : subdoc ? true : false

	return {  ...ls, p, collection, doc, subcollection, subdoc, collectionquery, subcollectionquery, synccollection, isdoc   }
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
		_synccollections.forEach((dc) => {
			event.target.result.createObjectStore(dc.name, { keyPath: "id" })
		})
	}
})




const load_into_synccollections = (synccollections:SyncCollectionT[]) => 
  new Promise<num|null>(async (res,_rej)=> {

    let iscomplete = false;
    const listran = Math.random().toString(36).substring(2, 10);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        if (!iscomplete) {
            controller.abort();
            cleanup();
            res(null);
        }
    }, 30000);

    synccollections.forEach(dc => dc.lock = true);

    try {
        const body = { 
            paths: synccollections.map(dc => dc.name),
            tses: synccollections.map(dc => dc.ts || null),
            instance_id: listran 
        };

        const response = await fetch('/api/firestore_init_batches', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            signal: controller.signal
        });

        if (!response.body) throw new Error('No readable stream received');

        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        
        while(true) {
            const { done, value } = await reader.read();
            
            if(done) {
                const newts = Math.floor(Date.now()/1000);
                synccollections.forEach(dc => dc.ts = newts);
                localStorage.setItem("synccollections", JSON.stringify(_synccollections
                    .map(dc => ({ name: dc.name, ts: dc.ts }))));
                cleanup();
                res(1);
                return;
            }

            const event = JSON.parse(value);
            if(event.instance_id !== listran) continue;

            const synccollection = synccollections.find(dc => dc.name === event.path);
            if(!synccollection) throw Error("Invalid collection in stream");
            
            await write_to_indexeddb_store([synccollection], [event.docs]);
        }

    } catch(err) {
        if((err as Error).name !== 'AbortError') {
            redirect_from_error(`Stream error: ${(err as Error).message}`);
        }
        cleanup();
        res(null);
    }

    function cleanup() {
        iscomplete = true;
        clearTimeout(timeout);
        synccollections.forEach(dc => dc.lock = false);
    }
})




const write_to_indexeddb_store = (synccollections: SyncCollectionT[], datas:Array<object[]>) => new Promise<void>(async (resolve, _reject) => {

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

		if (!_synccollections.find(dc => dc.name === p.collection))
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




export { Init } 
if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).Firestore = { Add_Listener, Add, Patch, DataGrab };




