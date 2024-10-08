
import { SSE_TriggersE } from "../definitions.js";

type str = string; type bool = boolean; type int = number;


declare var FetchLassie:any
declare var SSEvents:any
declare var EngagementListen:any


import FStore from './firestore.js';
import IndexedDB from './indexeddb.js';


enum CollectionStatusE        {   Empty, Updated, Old, Stale   }
enum CollectionStorageTypeE   {   IndexedDB, InMemory  }

type CollectionT = {
    name: str,
    url: str,
    status: CollectionStatusE,
    type: CollectionStorageTypeE,
    ts:int,
    opt: Opt
}

type ResourceRefT = {
    collection_ref:CollectionT,
    doc_id:str|null,
}

type FetchCollectionResultT = {
    collection_ref:CollectionT,
    docs:object[]
}

type ListenerResourceRefT = ResourceRefT & { 
    listener_ref: ListenerT 
}

type InMemoryDataT = { 
    collection_ref: CollectionT, 
    data:object[] 
}

type ListenerT = {
    htmlel: HTMLElement,
    iteration: int,
    callback: (iteration:int, data:any[])=>void
}

type Opt = {   propa: str   }




let   fcollections:CollectionT[] = []

let   listeners:ListenerT[] = []
let   listener_resourcesrefs:ListenerResourceRefT[] = []
let   inmemory_data:InMemoryDataT[] = []




function Init() {

    /*
    EngagementListen.Add_Listener("firestorelive", "focus", ()=> {

        if ((window as any).APPVERSION > 0) {
            if (fcollections.length) {
                for(const fc of fcollections)   fc.status = CollectionStatusE.Stale
                update_triggered()
            }
        }


        // probably need to listen to DIS engagement from SSE and disable SSE listen feed coming in.
        // but i'll see if browser automaticlly takes care of that
    })
    */

    /*
    SSEvents.Add_Listener("firestorelive", [SSE_TriggersE.FIRESTORE], (data:any)=> {

        if (!EngagementListen.IsDocFocused()) {
            return
        }

        const paths = data.paths as str[]

        const cc = fcollections.filter(c=> paths.includes(c.url))

        if (cc.length) {

            for(const c of cc) 
                c.status = CollectionStatusE.Old

            update_triggered()
        }
    })
    */
}




async function update_triggered() { 

    const outdated_collections = fcollections.filter(c=> c.status === CollectionStatusE.Stale || c.status === CollectionStatusE.Old)

    const fetch_results = await fetch_collections_since_ts(outdated_collections)

    await update_collections_from_fetch(fetch_results)

    const subscribed_to_outdated_collections = listener_resourcesrefs.filter(r=> outdated_collections.some(c=> c.name === r.collection_ref.name))
    const stoc = subscribed_to_outdated_collections

    const non_repeated_listeners:ListenerT[] = []
    stoc.forEach(r=> {
        if (!non_repeated_listeners.includes(r.listener_ref))   non_repeated_listeners.push(r.listener_ref)
    })

    for(const l of non_repeated_listeners) {
        const lrs = listener_resourcesrefs.filter(r=> r.listener_ref === l);
        const data = await get_resources(lrs);

        l.callback(++l.iteration, data)
    }
}




function fetch_collections_since_ts(collections:CollectionT[]) {

    return new Promise<FetchCollectionResultT[]>(async (res)=> {

        const paths = collections.map(p=> p.url)
        const opts = collections.map(p=> {
            return  {order_by:"ts,desc", limit:300, ts: p.ts} 
        })

        /*
        const body = { paths, opts } 

        const fetch_opts = {   
            method: "POST",  
            body: JSON.stringify(body)   
        }
        */

        const f = await FStore.Retrieve(paths, opts) as Array<any[]>

        const results = collections.map((p,i)=> {
            return { collection_ref:p, docs:f[i] }
        })

        res(results)
    })
}




function update_collections_from_fetch(fetch_results:FetchCollectionResultT[])  {

    return new Promise(async (res)=> {

        const has_some_new_docs = fetch_results.some(r=> r.docs.length > 0)
        if (!has_some_new_docs) {
            set_collections_update()
            res(1)
            return
        }

        let tx:IDBTransaction|null = null

        if (fetch_results.some(r=> r.collection_ref.type === CollectionStorageTypeE.IndexedDB)) {
            const collection_names = fetch_results.filter(f=> f.collection_ref.type === CollectionStorageTypeE.IndexedDB).map(f=> f.collection_ref.name)
            tx = await IndexedDB.New_Tx(collection_names, "readwrite")
        }

        let are_there_any_put_errors = false

        for(let i = 0; i < fetch_results.length; i++) {

            if (fetch_results[i].collection_ref.type === CollectionStorageTypeE.InMemory) {

                let ind = inmemory_data.find(d=> d.collection_ref === fetch_results[i].collection_ref)

                if (!ind) {
                    inmemory_data.push({ collection_ref: fetch_results[i].collection_ref, data: fetch_results[i].docs })
                    ind = inmemory_data[inmemory_data.length-1]
                } else {
                    ind.data = fetch_results[i].docs
                }
            }

            else if (tx) {
                const collection_name = fetch_results[i].collection_ref.name
                const object_store = tx.objectStore(collection_name)
                const fetch_result = fetch_results[i]

                for(let ii = 0; ii < fetch_result.docs.length; ii++) {
                    const db_put = object_store.put(fetch_result.docs[ii])
                    db_put.onerror = (_event:any) => are_there_any_put_errors = true
                }
            }
        }

        if (tx) {
            tx.oncomplete = (_event:any) => {

                if (are_there_any_put_errors) {   redirect_from_error("Error putting data into IndexedDB");  return;   }

                set_collections_update()

                res(1)
                return
            }

            tx.onerror = (_event:any) => {
                redirect_from_error("Error getting data from IndexedDB TX at populate_to_refs_from_indexeddb_if_needed")
            }
        } else {
            // no set_collections_update because inmemory could be volatile. just pull fresh every time on it
            res(1)
        }
    })


    function set_collections_update() {
        fetch_results.forEach(f=> {

            f.collection_ref.status = CollectionStatusE.Updated

            if (f.collection_ref.type === CollectionStorageTypeE.IndexedDB) {
                f.collection_ref.ts = Math.floor(Date.now()/1000)
                localStorage.setItem("ts_"+f.collection_ref.name, f.collection_ref.ts.toString())
            }
        })
    }
}




function get_resources(resources:ResourceRefT[])  {

    return new Promise<Array<object[]|object|null>>(async (res)=> {

        const indexeddb_resources:ResourceRefT[] = []
        const inmemory_resources:ResourceRefT[] = []
        const mappings:Array<{type:CollectionStorageTypeE, specific_index:number}> = []

        resources.forEach(r=> {
            const type = fcollections.find(c=> c === r.collection_ref)!.type

            if (type === CollectionStorageTypeE.IndexedDB) {
                indexeddb_resources.push(r)
                mappings.push({type, specific_index: indexeddb_resources.length-1})
            } else {
                inmemory_resources.push(r)
                mappings.push({type, specific_index: inmemory_resources.length-1})
            }
        })

        const indexeddb_data = await get_indexeddb_resources(indexeddb_resources)
        const inmemory_data = await get_inmemory_resources(inmemory_resources)

        const returns:Array<object[]|object|null> = Array(resources.length).fill(null)

        for(const [i,m] of mappings.entries()) {
            if (m.type === CollectionStorageTypeE.IndexedDB) {
                returns[i] = indexeddb_data[m.specific_index]
            } else {
                returns[i] = inmemory_data[m.specific_index]
            }
        }

        res(returns)
    })
}




function get_indexeddb_resources(resources:ResourceRefT[])  {

    return new Promise<Array<object[]|object>>(async (res)=> {

        if (!resources.length) {
            res([])
            return
        }


        const collection_names = resources.map(r=> r.collection_ref.name)
        const returns:Array<object[]|object> = Array(resources.length).fill(null)

        let tx = await IndexedDB.New_Tx(collection_names, "readonly")
        let are_there_any_read_errors = false

        resources.forEach((r,i)=> {
            const object_store = tx.objectStore(r.collection_ref.name)

            let db_get = r.doc_id !== null ? object_store.get(r.doc_id) : object_store.getAll()

            db_get.onerror = (_event:any) => are_there_any_read_errors = true

            db_get.onsuccess = (event:any) => {
                if (r.doc_id !== null) {
                    returns[i] = event.target.result
                } else {
                    returns[i] = event.target.result           
                }
            }
        })

        tx.oncomplete = (_event:any) => {

            if (are_there_any_read_errors) {   redirect_from_error("Error reading data from IndexedDB");  return;   }

            res(returns)
            return
        }

        tx.onerror = (_event:any) => {
            redirect_from_error("Error getting data from IndexedDB TX at populate_to_refs_from_indexeddb_if_needed")
        }
    })
}




function get_inmemory_resources(resources:ResourceRefT[])  {

    return new Promise<Array<object[]|object|null>>(async (res)=> {

        if (!resources.length) {
            res([])
            return
        }

        const returns:Array<object[]|object|null> = []

        resources.forEach((r,i)=> {
            const ind = inmemory_data.find(d=> d.collection_ref === r.collection_ref)
            returns[i] = ind!.data
        })

        res(returns)
    })
}




function redirect_from_error(errmsg:str) {

    console.info(`/?errmsg=Firestore Error: ${errmsg}`)

    if ((window as any).APPVERSION > 0) {
        window.location.href = `/?errmsg=Firestore Error: ${errmsg}`
    }
}




function Get(resources:ResourceRefT[]) {   return new Promise<any[]>(async (res)=> {

    const not_updated_resource_collections:CollectionT[] = []

    resources.forEach(r=> { 
        const c = fcollections.find(c=> c.name === r.collection_ref.name)!

        if(c.status !== CollectionStatusE.Updated)   not_updated_resource_collections.push(c!)
    })
        
    if (not_updated_resource_collections.length) {
        const fetch_data = await fetch_collections_since_ts(not_updated_resource_collections)
        await update_collections_from_fetch(fetch_data)
    }

    const data = await get_resources(resources)

    res(data)
})}




async function Remove() {

    fcollections.forEach(cn=> {
        localStorage.removeItem("ts_"+cn.name) // whether it exists or not
        cn.status = CollectionStatusE.Empty
    })

    inmemory_data = []
}




function Unsubscribe(htmlel:HTMLElement) {

    const listener = listeners.find(l=> l.htmlel === htmlel)

    if (!listener) {
        return
    }

    listener_resourcesrefs = listener_resourcesrefs.filter(r=> r.listener_ref !== listener)

    listeners.splice(listeners.indexOf(listener), 1)
}



async function Subscribe(htmlel:HTMLElement, p_resources:str[]|str, cb:()=>void) {

    return new Promise(async (res, _rej)=> {

        const is_already_listener = listeners.find(l=> htmlel === l.htmlel) ? true : false

        if (is_already_listener) {
            redirect_from_error("Firestore Listener with that name already exists or not attached to a view")
            return
        }

        listeners.push({ htmlel, iteration: 0, callback: cb })
        const listener = listeners[listeners.length-1]

        const resources_params_array = Array.isArray(p_resources) ? p_resources : [p_resources]

        resources_params_array.forEach(r=> {

            let [ collection_name, url, doc_id, type ] = subscribe___parse_resource_str(r)

            subscribe___add_collection_if_not_exists(collection_name, url, type)

            listener_resourcesrefs.push({collection_ref:fcollections.find(fc=>fc.name===collection_name)!, doc_id, listener_ref: listener})
        })

        const data = await Get(listener_resourcesrefs.filter(r=> r.listener_ref === listener))

        listener.callback(++listener.iteration, data)

        res(1)
    })
}

function subscribe___parse_resource_str(resource_str:str) : [str, str, str|null, type:CollectionStorageTypeE] {

    let collection_name:string = ""
    let url:string = ""
    let doc_id:string|null = null
    let split = resource_str.split("/")
    let type = CollectionStorageTypeE.IndexedDB

    if (split.length === 1) {
        collection_name = resource_str
        url = resource_str
        doc_id = null
        type = CollectionStorageTypeE.IndexedDB

    } else if (split.length === 2) {
        collection_name = split[0]
        url = split[0]
        doc_id = split[1]
        type = CollectionStorageTypeE.IndexedDB

    } else if (split.length === 3) {
        collection_name = split[0] + "_" + split[1] + "_" + split[2]
        url = split[0] + "/" + split[1] + "/" + split[2]
        doc_id = null
        type = CollectionStorageTypeE.InMemory
    }


    return [ collection_name, url, doc_id, type ]
}

function subscribe___add_collection_if_not_exists(collection_name:str, url:str, type:CollectionStorageTypeE) : CollectionT {

    let c = fcollections.find(c=> c.name === collection_name)

    if (!c) {
        const ts = Number(localStorage.getItem("ts_"+collection_name) || "0")

        fcollections.push({
            name: collection_name,
            url,
            status: CollectionStatusE.Empty,
            type,
            ts,
            opt: { propa: "" }
        })

        c = fcollections[fcollections.length-1]
    }

    return c
}



(window as any).FirestoreLive = { Unsubscribe, Subscribe }

export default { Init, Remove  }


