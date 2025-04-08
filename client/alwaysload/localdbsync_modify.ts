

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

	const processeddata: GenericRowT = {}
	for (const key in data) {
		if (key.endsWith('__ref')) {
			const baseKey = key.split('__ref')[0]
			const pathValue = data[key] as string
			const pathParts = pathValue.split('/')
			const collection = pathParts.slice(0, -1).join('/')
			const docId = pathParts[pathParts.length - 1]
			processeddata[baseKey] = { __path: [collection, docId] }
		} else {
			processeddata[key] = data[key]
		}
	}

	const p_db_put     = pathos.add( { ...processeddata, ts:newts, id:newid } )
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
		if (r === null || r?.ok === false) {   res(null); return; } 

		res(data) 
	}
})




const Patch = (db:IDBDatabase, path:PathSpecT, data:GenericRowT) => new Promise<GenericRowT|null>(async (res,_rej)=> {  

	if (!path.docid) throw new Error('docid in path is required for Patch')


	let workingdata:GenericRowT = {}
	let newts = Math.floor( Date.now() / 1000 )
	let oldts = 0;
	let are_there_any_put_errors = false
	let objectstores = [path.syncobjectstore.name]

	const tx:IDBTransaction = db.transaction(objectstores, "readwrite", { durability: "relaxed" })
	const pathos = tx.objectStore(path.syncobjectstore.name)
	

	const getrequest = pathos.get(path.docid)
	
	getrequest.onsuccess = (event: any) => {
		workingdata = event.target.result || {}
		oldts = workingdata.ts || 0

		for (const key in data) {
			if (key.endsWith('__ref')) {
				// probably will take this out entirely. but commented for now
				/*
				const baseKey = key.split('__ref')[0]
				const pathValue = data[key] as string
				const pathParts = pathValue.split('/')
				const collection = pathParts.slice(0, -1).join('/')
				const docId = pathParts[pathParts.length - 1]
				existingdata[baseKey] = { __path: [collection, docId] }
				*/

			} else if (key.includes(".")) {
				const keys = key.split(".")
				workingdata[keys[0]][keys[1]] = data[key]

			} else {
				workingdata[key] = data[key]
			}
		}
		workingdata.ts = newts
		
		const putrequest = pathos.put(workingdata)
		putrequest.onerror = (_event: any) => are_there_any_put_errors = true
	}
	
	getrequest.onerror = (_event: any) => {
		are_there_any_put_errors = true
	}

	tx.onerror = (_event: any) => res(null)

	tx.oncomplete = async (_event: any) => { 
		if (are_there_any_put_errors) {res(null); return;}


		const body = { path:path.path, data, oldts, newts} 

		const opts:any = {   
			method: "POST",  
			body: JSON.stringify(body),
		}

		const r = await $N.FetchLassie('/api/firestore_patch', opts, null) as GenericRowT | null
		if (r === null || r?.ok === false) {   res(null); return;   } 

		res(workingdata)
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
		if (r === null || r?.ok === false) {   res(null); return;   } 

		res(1) 
	}
})



export { Add, Patch, Delete } 
/*
if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).LocalDBSync = { EnsureObjectStoresActive };
*/




