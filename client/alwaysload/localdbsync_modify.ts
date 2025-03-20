

import { num, str, bool } from '../defs_server_symlink.js'
import { SSETriggersE } from '../defs_server_symlink.js'
import { $NT, LoggerTypeE, LoggerSubjectE, EngagementListenerTypeT, GenericRowT  } from '../defs.js'
import { HandleLocalDBSyncUpdateTooLarge as SwitchStationHandleLocalDBSyncUpdateTooLarge } from './switchstation.js'
import { Init as CMechInit, AddView as CMechAddView, SearchParamsChanged as CMechSearchParamsChanged, DataChanged as CMechDataChanged } from './cmech.js'


declare var $N:$NT




const Add = (db:IDBDatabase, path:str, data:GenericRowT) => new Promise<num|null>(async (res,_rej)=> {  

    const body = { path, data }

    const opts:{method:'POST',body:string} = {
        method: 'POST',
        body: JSON.stringify(body),
    }

    const r = await $N.FetchLassie('/api/firestore_add', opts, null) as num|null



	let are_there_any_put_errors = false
	let objectstores = r === null ? [path, '__localwrites'] : [path]

	const tx:IDBTransaction = db.transaction(objectstores, "readwrite", { durability: "relaxed" })

	const pathos       = tx.objectStore(path)
	const p_db_put     = pathos.add(data)
	p_db_put.onerror   = (_event:any) => are_there_any_put_errors = true

	if (r === null) {
		const lclwos   = tx.objectStore('__localwrites')
		const l_db_put = lclwos.add({path, action:'add', obj_id:data.id})
		l_db_put.onerror = (_event:any) => are_there_any_put_errors = true
	}

	tx.oncomplete  = (_event:any) => res( are_there_any_put_errors ? null : 1 )
	tx.onerror     = (_event:any) => res(null)
})




const Patch = (db:IDBDatabase, path:str, data:GenericRowT) => new Promise<num|null>(async (res,_rej)=> {  

    const body = { path, data } 

    const opts:any = {   
        method: "POST",  
        body: JSON.stringify(body),
    }

    const r = await $N.FetchLassie('/api/firestore_patch', opts, null) as num|null

	if (r === 0) { res(0); return; } // the data at server is newer
	//TODO: gotta surface this to the user. ideally, stash there changes somewhere then repull the data and let the user merge there changes back in. 



	let are_there_any_put_errors = false
	let objectstores = r === null ? [path, '__localwrites'] : [path]

	const tx:IDBTransaction = db.transaction(objectstores, "readwrite", { durability: "relaxed" })

	const pathos       = tx.objectStore(path)
	const p_db_put     = pathos.put(data)
	p_db_put.onerror   = (_event:any) => are_there_any_put_errors = true

	if (r === null) {
		const lclwos   = tx.objectStore('__localwrites')
		const l_db_put = lclwos.add({path, action:'patch', obj_id:data.id})
		l_db_put.onerror = (_event:any) => are_there_any_put_errors = true
	}

	tx.oncomplete  = (_event:any) => res( are_there_any_put_errors ? null : 1 )
	tx.onerror     = (_event:any) => res(null)

})




const Delete = (db:IDBDatabase, path:str, id:str) => new Promise<num|null>(async (res,_rej)=> {  

    const body = { path, id } 

    const opts:any = {   
        method: "POST",  
        body: JSON.stringify(body),
    }

    const r = await $N.FetchLassie('/api/firestore_delete', opts, null) as num|null



	let are_there_any_put_errors = false
	let objectstores = r === null ? [path, '__localwrites'] : [path]

	const tx:IDBTransaction = db.transaction(objectstores, "readwrite", { durability: "relaxed" })

	const pathos       = tx.objectStore(path)
	const p_db_put     = pathos.delete(id)
	p_db_put.onerror   = (_event:any) => are_there_any_put_errors = true

	if (r === null) {
		const lclwos   = tx.objectStore('__localwrites')
		const l_db_put = lclwos.add({path, action:'delete', obj_id:id})
		l_db_put.onerror = (_event:any) => are_there_any_put_errors = true
	}

	tx.oncomplete  = (_event:any) => res( are_there_any_put_errors ? null : 1 )
	tx.onerror     = (_event:any) => res(null)
})



export { Add, Patch, Delete } 
/*
if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).LocalDBSync = { EnsureObjectStoresActive };
*/




