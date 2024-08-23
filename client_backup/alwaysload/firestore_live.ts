

type str = string; type bool = boolean; type int = number;


declare var FetchLassie:any
declare var SSEvents:any
declare var EngagementListen:any


import IndexedDB from './indexeddb.js';


enum CollectionStatus {   Empty, Populated, Behind, Stale   }

type Collection = {
    name: str,
    status: CollectionStatus,
    ts:int,
    opt: Opt
}

type ResourceRef = {
    collection_name:str,
    doc_id:str|null,
}

type Active_Firestore_Listener = {
    name:str,
    htmlel: HTMLElement,
    resource_refs: ResourceRef[],
    callback: (data:any[])=>void
}

type Opt = {   propa: str   }




const flisteners:Active_Firestore_Listener[] = []
const fcollections:Collection[] = []




function Init(collection_names:str[]) {

    collection_names.forEach(cn=> {
        const ts = Number(localStorage.getItem("ts_"+cn) || "0")
        fcollections.push({
            name: cn,
            status: ts === 0 ? CollectionStatus.Empty : CollectionStatus.Stale,
            ts,
            opt: { propa: "" }
        })
    })

    EngagementListen.Add_Listener("firestorelive", "focus", ()=> {

        if (fcollections.length) {
            for(const fc of fcollections) {
                fc.status = CollectionStatus.Stale
            }
            update_triggered()
        }

        // probably need to listen to DIS engagement from SSE and disable SSE listen feed coming in.
        // but i'll see if browser automaticlly takes care of that
    })

    SSEvents.Add_Listener("firestore", "firestore", (data:any)=> {

        console.log(document.hasFocus())

        if (!document.hasFocus()) {
            console.log("Document is hidden, not updating collections")
            return
        }

        const paths = data.paths as str[]

        const collection_names = paths.map(p=> p.split('/')[0])

        const cc = fcollections.filter(c=> collection_names.includes(c.name))

        for(const c of cc) {
            c.status = CollectionStatus.Behind
        }

        update_triggered()
    })

    const observer = new MutationObserver((mutationsList, observer) => {
        console.log(mutationsList)
        console.log(observer)
    })

    observer.observe(document.getElementById("views")!, { attributes: false, childList: true, subtree: false })
}




async function Subscribe(htmlel:HTMLElement, p_resources:str[]|str) {

    return new Promise(async (res, _rej)=> {

        const n = htmlel.tagName.toLowerCase()

        const is_already_listener = flisteners.find(l=> l.name === n) ? true : false

        if (is_already_listener) {
            redirect_from_error("Firestore Listener with that name already exists or not attached to a view")
            return
        }

        const listener:Active_Firestore_Listener = { 
            name:n,
            htmlel,
            resource_refs: [],
            callback: ()=>{}
        }

        const resources = Array.isArray(p_resources) ? p_resources : [p_resources]

        resources.forEach(r=> {
            const split = r.split("/")

            listener.resource_refs.push({
                collection_name: split[0],
                doc_id: split.length === 2 ? split[1] : null
            })
        })

        flisteners.push(listener)


        const collections = fcollections.filter(c=> c.status !== CollectionStatus.Populated)

        const collections_to_update = collections.filter(c=> flisteners.find(l=> l.resource_refs.map(r=> r.collection_name).includes(c.name)))
        
        if (collections_to_update.length) {

            const fetch_results = await fetch_collections_since_ts(collections_to_update)

            if (fetch_results.length) {
                await update_indexeddb_collections_from_fetch(collections_to_update, fetch_results)
            }
        }

        const returns = await get_indexeddb_collection(listener.resource_refs)

        res({ 
            ondata:(c:any)=> { listener.callback = c }, 
            initialdata: returns 
        })
    })
}




function Unsubscribe(htmlel:HTMLElement) {

    const n = htmlel.tagName.toLowerCase()

    console.log(n, " Unsubscribe")

    const listener = flisteners.find(l=> l.name === n)

    if (!listener) {
        redirect_from_error("Firestore Listener with that name does not exist")
        return
    }

    flisteners.splice(flisteners.findIndex(l=> l.name === n), 1)
}



/*
function add_listener___set_opts(resources:str[], popts:object|object[]|null) : Opt[] {

    const default_opt = { propa: "" }

    const o = (popts === null) ? resources.map(()=> default_opt) : Array.isArray(popts) ? popts : resources.map(()=> opts)

    const opts = resources.map((_p,i)=> {   return o[i] ? o[i] : o[o.length-1]   })

    for (const opt of opts) {
        if (opt.propa === undefined) opt.propa = ""
    }

    return opts
}
*/




async function update_triggered() { 

    const collections = fcollections.filter(c=> c.status === CollectionStatus.Stale || c.status === CollectionStatus.Behind)

    const collections_to_update = collections.filter(c=> flisteners.find(l=> l.resource_refs.map(r=> r.collection_name).includes(c.name)))
    
    if (!collections_to_update.length) return


    const listeners_to_update = flisteners.filter(l=> l.resource_refs.map(r=> r.collection_name).some(c=> collections.map(co=> co.name).includes(c)))

    const fetch_results = await fetch_collections_since_ts(collections_to_update)

    if (fetch_results.length) {
        await update_indexeddb_collections_from_fetch(collections_to_update, fetch_results)
    }

    for(let i = 0; i < listeners_to_update.length; i++) {
        const returns = await get_indexeddb_collection(listeners_to_update[i].resource_refs)
        listeners_to_update[i].callback(returns)
    }
}




/*
function update_triggerd___get_relevant_listeners(listeners_list:Map<str,Active_Firestore_Listener>, collection_path_strs:str[]) { 

    const listeners_list_as_array = [...listeners_list.values()]
    const relevant_listeners:Active_Firestore_Listener[] = []

    listeners_list_as_array.forEach(listener=> {
        
        let is_listener_added = false

        for( const path_str of collection_path_strs) {

            if (listener.paths.map(listener_path=> listener_path.collection).includes(path_str)) {
                if(!is_listener_added) {
                    relevant_listeners.push(listener)
                    is_listener_added = true
                }
            }
        }
    })

    return relevant_listeners
}
*/




function fetch_collections_since_ts(collections:Collection[]) {

    return new Promise<{collection_name:str,docs_array:object[]}[]>(async (res)=> {

        const paths = collections.map(p=> p.name)
        const opts = collections.map(p=> {
            return  {order_by:null, limit:null, ts: p.ts} 
        })

        const body = { paths, opts } 

        const fetch_opts = {   
            method: "POST",  
            body: JSON.stringify(body)   
        }

        const f = await FetchLassie('/api/firestore_retrieve', fetch_opts) as Promise<Array<Array<object>>>

        const results = collections.map((p,i)=> {
            return { collection_name:p.name, docs_array:f[i] }
        })

        res(results)
    })
}




function update_indexeddb_collections_from_fetch(collections:Collection[], fetch_results:{collection_name:str,docs_array:object[]}[])  {

    return new Promise(async (res)=> {

        let tx = await IndexedDB.New_Tx(collections.map(c=>c.name), "readwrite")
        let are_there_any_put_errors = false

        for(let i = 0; i < collections.length; i++) {
            const object_store = tx.objectStore(collections[i].name)
            const fetch_result = fetch_results.find(r=> r.collection_name === collections[i].name)!

            for(let ii = 0; ii < fetch_result.docs_array.length; ii++) {
                const db_put = object_store.put(fetch_result.docs_array[ii])
                db_put.onerror = (_event:any) => are_there_any_put_errors = true
            }
        }

        tx.oncomplete = (_event:any) => {

            if (are_there_any_put_errors) {   redirect_from_error("Error putting data into IndexedDB");  return;   }

            collections.forEach(c=> {
                c.status = CollectionStatus.Populated
                c.ts = Math.floor(Date.now()/1000)
                localStorage.setItem("ts_"+c.name, c.ts.toString())
            })

            res(1)
            return
        }

        tx.onerror = (_event:any) => {
            redirect_from_error("Error getting data from IndexedDB TX at populate_to_refs_from_indexeddb_if_needed")
        }
    })
}




function get_indexeddb_collection(resources:ResourceRef[])  {

    return new Promise<Array<object[]|object>>(async (res)=> {

        const collection_names = resources.map(r=> r.collection_name)
        const returns:Array<object[]|object> = Array(resources.length).fill(null)

        let tx = await IndexedDB.New_Tx(collection_names, "readonly")
        let are_there_any_read_errors = false

        resources.forEach((r,i)=> {
            const object_store = tx.objectStore(r.collection_name)

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




function redirect_from_error(errmsg:str) {

    console.info(`/?errmsg=Firestore Error: ${errmsg}`)

    if ((window as any).APPVERSION > 0) {
        window.location.href = `/?errmsg=Firestore Error: ${errmsg}`
    }
}




(window as any).Firestore_Live = { Subscribe, Unsubscribe }
export { Init }


