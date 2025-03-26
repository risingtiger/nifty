

import { num, str, bool } from '../defs_server_symlink.js'
import { SSETriggersE } from '../defs_server_symlink.js'
import { $NT, LoggerTypeE, LoggerSubjectE, EngagementListenerTypeT, GenericRowT  } from '../defs.js'
import { HandleLocalDBSyncUpdateTooLarge as SwitchStationHandleLocalDBSyncUpdateTooLarge } from './switchstation.js'
import { Init as CMechInit, AddView as CMechAddView, SearchParamsChanged as CMechSearchParamsChanged, DataChanged as CMechDataChanged } from './cmech.js'
import { PathSpecT } from "./localdbsync.ts"

declare var $N:$NT




const Add = (db:IDBDatabase, objecstorepath:PathSpecT, data:GenericRowT) => new Promise<GenericRowT|null>(async (res,_rej)=> {  

	if (!objecstorepath.docid) throw new Error('docid in path is required for Patch')

	const newid = crypto.randomUUID() 
	const newts = Math.floor( Date.now() / 1000 )

	let are_there_any_put_errors = false
	let objectstores = [objecstorepath.syncobjectstore.name]

	const tx:IDBTransaction = db.transaction(objectstores, "readwrite", { durability: "relaxed" })

	const pathos       = tx.objectStore(objecstorepath.syncobjectstore.name)
	const p_db_put     = pathos.add( { ...data, ts:newts, id:newid } )
	p_db_put.onerror   = (_event:any) => are_there_any_put_errors = true

	tx.onerror     = (_event:any) => res(null)

	tx.oncomplete  = async (_event:any) => { 
		if (are_there_any_put_errors) {res(null); return;}


		const body = { path:objecstorepath.path, data, ts:newts, id:newid } 

		const opts:{method:'POST',body:string} = {
			method: 'POST',
			body: JSON.stringify(body),
		}

		const r = await $N.FetchLassie('/api/firestore_add', opts, null) as GenericRowT | null
		if (!r || !r.ok) { 
			alert ('is offline or server down. data not saved')
			res(null); return; 
		} // the server is down

		res(data) 
	}
})




const Patch = (db:IDBDatabase, path:PathSpecT, data:GenericRowT) => new Promise<GenericRowT|null>(async (res,_rej)=> {  

	// data is only of partial update -- only properties that are being updated, not the entire record
	// we'll get the existing data from local database
	//   but still send partial to server
	//   and send full merged back to sync mechanisms for component data updates etc
	// after local update, but before sending sync, send to server to update remote

	if (!path.docid) throw new Error('docid in path is required for Patch')


	let mergeddata:GenericRowT|null = null
	let existingdata:GenericRowT|null = null
	let newts = Math.floor( Date.now() / 1000 )
	let are_there_any_put_errors = false
	let objectstores = [path.syncobjectstore.name]

	const tx:IDBTransaction = db.transaction(objectstores, "readwrite", { durability: "relaxed" })
	const pathos = tx.objectStore(path.syncobjectstore.name)
	

	const getrequest = pathos.get(path.docid)
	
	getrequest.onsuccess = (event: any) => {
		existingdata = event.target.result || {}

		// Process data to handle reference paths
		const processedData: GenericRowT = {}
		for (const key in data) {
			if (key.endsWith('__ref')) {
				const baseKey = key.split('__ref')[0]
				const pathValue = data[key] as string
				const pathParts = pathValue.split('/')
				const collection = pathParts.slice(0, -1).join('/')
				const docId = pathParts[pathParts.length - 1]
				processedData[baseKey] = { __path: [collection, docId] }
			} else {
				processedData[key] = data[key]
			}
		}

		mergeddata = { ...existingdata, ...processedData, ts:newts }
		
		const putrequest = pathos.put(mergeddata)
		putrequest.onerror = (_event: any) => are_there_any_put_errors = true
	}
	
	getrequest.onerror = (_event: any) => {
		are_there_any_put_errors = true
	}

	tx.onerror = (_event: any) => res(null)

	tx.oncomplete = async (_event: any) => { 
		if (are_there_any_put_errors) {res(null); return;}


		const body = { path:path.path, data, oldts: existingdata!.ts, newts} 

		const opts:any = {   
			method: "POST",  
			body: JSON.stringify(body),
		}

		const r = await $N.FetchLassie('/api/firestore_patch', opts, null) as GenericRowT | null

		if (!r || !r.ok) { 
			alert ('is offline or server down. data not saved')
			res(null); return;
		} 

		// need to send message from server if the data is nerwer
		// which I believe would be r === 0

		res(mergeddata)
	}
})




const Delete = (db:IDBDatabase, path:PathSpecT) => new Promise<num|null>(async (res,_rej)=> {  

	if (!path.docid) throw new Error('docid in path is required for Patch')


	let are_there_any_put_errors = false
	let objectstores             = [path.syncobjectstore.name]

	const tx:IDBTransaction      = db.transaction(objectstores, "readwrite", { durability: "relaxed" })

	const pathos                 = tx.objectStore(path.syncobjectstore.name)
	const p_db_put               = pathos.delete(path.docid)
	p_db_put.onerror             = (_event:any) => are_there_any_put_errors = true

	tx.onerror                   = (_event:any) => res(null)

	tx.oncomplete                = async (_event:any) => { 
		if (are_there_any_put_errors) {res(null); return;}

		const body = { path } 

		const opts:any = {   
			method: "POST",  
			body: JSON.stringify(body),
		}

		const r = await $N.FetchLassie('/api/firestore_delete', opts, null) as GenericRowT | null
		if (!r || !r.ok) { 
			alert ('is offline or server down. data not saved')
			res(null); return; 
		} // the server is down

		res(1) 
	}
})



export { Add, Patch, Delete } 
/*
if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).LocalDBSync = { EnsureObjectStoresActive };
*/




