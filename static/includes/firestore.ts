

enum RefType { Collection, Doc }


type Collection = {
    istype: RefType,
    path: str,
    name: str,
    isfilled: bool,
    listen: bool, // currently not being used. need to finish the listen for updates feature. not finished yet
    is_listening: bool, // currently not being used. need to finish the listen for updates feature. not finished yet
    docs: Map<str,Doc>
}

type Doc = {
    istype: RefType,
    path:str,
    id: str,
    isfilled: bool
    listen: bool, // currently not being used. need to finish the listen for updates feature. not finished yet
    is_listening: bool, // currently not being used. need to finish the listen for updates feature. not finished yet
    data: any|null,
    collections: Collection[]
}

type Listener = {
    path: str,
}

type GetOpts = {
    pageSizes?: int[]
    listens?: bool[],
    orderBys?: str[],
}


//const RUNURL = "https://runlisten-rdw5zhdhea-uc.a.run.app/"
//const INACTIVITY_TIMEOUT = 3540 // 59 minutes
const collections:Collection[] = []

let is_listen_active = false
let last_active_timestamnp = 0
const data_change_event = new Event("data_change");



let tempfl = false
function Retrieve(paths:str[]|str, opts:GetOpts = {}) { return new Promise((res,_rej)=> { 

    last_active_timestamnp = Math.floor(Date.now() / 1000)

    authrequest().then((id_token:str)=> {

        paths = Array.isArray(paths) ? paths : [paths]

        if (!opts.pageSizes) opts.pageSizes = paths.map(()=> null)
        if (!opts.listens)   opts.listens = paths.map(()=> false)
        if (!opts.orderBys)  opts.orderBys = paths.map(()=> null)

        const refs:Array<Collection|Doc> = paths.map(path=> ref_from_path(path))

        const refs_to_fetch:Array<Collection|Doc> = refs.filter(ref=> ref.isfilled === false)

        if (refs_to_fetch.length > 0) {

            fetch_paths(refs_to_fetch.map(ref=> ref.path), opts, id_token).then((data:any[])=> {

                // refs.filter((_r,i)=> opts.listens[i] === true).forEach(ref=> ref.listen = true) // listening for changes isnt dont yet

                // listen to feature not done. FOR NOW, IM DISABLING THE isfilled flag. will ALWAYS be false, until I finish the listen feature
                populate_to_refs(data, refs_to_fetch) 
                const returns = collect_from_refs(refs)
                tempfl = true

                res(returns)

            }).catch(err=> {
                redirect_from_error(err)
            })
        }

        else {
            const returns = collect_from_refs(refs)
            res(returns)
        }

    }).catch(err=> {
        redirect_from_error(err)
    })
})}




function Patch(what:str, mask:any[], data:any) { return new Promise(async (res,_rej)=> { 

    last_active_timestamnp = Math.floor(Date.now() / 1000)

    authrequest().then((id_token:str)=> {

        const body = { path:what, mask, data }

        fetch('/api/firestore_patch', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token
            },
            body: JSON.stringify(body)

        }).then(async r=> {
            let data = await r.json()

            if (data.err) {
                redirect_from_error(data.err)
            } else {
                res(data)
            }

        }).catch(err=> {
            redirect_from_error(err)
        })

    }).catch(err=> {
        redirect_from_error(err)
    })
})}




function authrequest() { return new Promise<str>(async (res,rej)=> { 

    let id_token = localStorage.getItem('id_token')
    let refresh_token = localStorage.getItem('refresh_token')
    let token_expires_at = localStorage.getItem('token_expires_at')

    if (!id_token) {
        rej('Not Signed In')
        return
    }


    if (Date.now()/1000 > parseInt(token_expires_at)-30) {

        const body = { refresh_token }

        fetch('/api/firestore_refresh_auth', {

            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)

        }).then(async r=> {

            let data = await r.json()

            if (data.error) {
                rej(data.error.message)
            }

            else {
                localStorage.setItem('id_token', data.id_token)
                localStorage.setItem('refresh_token', data.refresh_token)
                localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.expires_in) ).toString() )

                res(data.id_token)
            }

        }).catch(err=> {
            rej(err)
        })
    }

    else {
        res(id_token)
    }
})}




function fetch_paths(paths:any, opts:any, id_token:str) {   return new Promise<any[]|str>(async (res)=> {

    const body = { paths, opts}

    fetch('/api/firestore_retrieve', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + id_token
        },
        body: JSON.stringify(body)

    }).then(async r=> {
        let data = await r.json()
        res(data)

    }).catch(err=> {
        res(err)
    })
})}




function populate_to_refs(fetch_results:any[], refs_to_fetch:Array<Collection|Doc>) {

    fetch_results.forEach((a:any, i:int)=> {

        const ref:Collection|Doc = refs_to_fetch[i]

        if (ref.istype === RefType.Collection) {
            //@ts-ignore
            ref.docs = new Map() 

            a.forEach((data:any)=> {
                const newdoc:Doc = { istype: RefType.Doc, path: ref.path + '/' + data.id, id: data.id, isfilled: true, listen:false, is_listening: false, data, collections: [] }
                //@ts-ignore
                ref.docs.set(data.id, newdoc)
            })

            // listen to feature not done. FOR NOW, IM DISABLING THE isfilled flag. will ALWAYS be false, until I finish the listen feature
            //ref.isfilled = true
        }

        else if (ref.istype === RefType.Doc) {

            //@ts-ignore
            ref.data = a[0]


            ref.isfilled = true
        }
    })
}




function collect_from_refs(refs:Array<Collection|Doc>) {

    const returns = []

    refs.forEach(ref=> {
        if (ref.istype === RefType.Collection) {
            const d = []
            //@ts-ignore
            ref.docs.forEach((doc:Doc)=> d.push(doc.data))
            returns.push(d)
        }
        if (ref.istype === RefType.Doc) {
            //@ts-ignore
            returns.push(ref.data)
        }
    })

    return returns
}



/* 
 * Listening for changes isnt done yet. Will come back later .... maybe
 *
function listen_begin() { return new Promise(async (res, _rej)=> { 

    const id_token = localStorage.getItem('id_token')
    let is_connected = false
    let did_timeout = false
    let last_listen_to_timeout:any

    const evtSource = new EventSource(RUNURL+"firestore_listen_begin?id_token=" + id_token, {   withCredentials: true   })

    evtSource.addEventListener("connected", (_e) => {

        if (did_timeout) {
            evtSource.close()

            redirect_from_error("SSE Error: Unable to begin connection")
            return
        }

        else {
            is_connected = true
            instigate_timeout()
            res(1)
        }
    })

    evtSource.addEventListener("firestore", (e) => {
        const c = JSON.parse(e.data)
        handle_data_change(c.path ,c.docs)
    })

    evtSource.addEventListener("message", (e) => {
        console.log(JSON.parse(e.data))
    })

    evtSource.addEventListener("error", (e) => {
        console.log("error")
        console.log(e)
    })

    

    setTimeout(()=> {
        if (!is_connected) {
            did_timeout = true
            evtSource.close()

            redirect_from_error("SSE Error: Unable to begin connection")
            return
        }
    }, 5000)


    function instigate_timeout() { 

        clearTimeout(last_listen_to_timeout)

        last_listen_to_timeout = setTimeout(()=> {

            if (Math.floor(Date.now() / 1000) - last_active_timestamnp < INACTIVITY_TIMEOUT ) {
                instigate_timeout()
            }    

            else {
                is_listen_active = false
                evtSource.close()
                redirect_from_error("Inactivity")
            }
        }, INACTIVITY_TIMEOUT * 1000) // just under an hour
        //}, 3540 * 1000) // just under an hour
    }
})}




function listen_to(paths:str[]) { return new Promise(async (res,_rej)=> { 

    const body = { paths, user_email: localStorage.getItem('user_email') }

    if (!is_listen_active) {

        await listen_begin()

        is_listen_active = true
        actual_listen_to()
    }

    else {
        actual_listen_to()
    }


    function actual_listen_to() {

        fetch(RUNURL+'firestore_listen_to', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('id_token')
            },
            body: JSON.stringify(body)

        }).then(async r=> {

            if (r.status === 401 || r.status === 400) {
                redirect_from_error("Unauthorized or Not Found " + r.statusText)
            }

            else {
                res(1)
            }

        }).catch(err=> {
            redirect_from_error(err)
        })
    }
})}




function handle_data_change(path:str, docs:any) {
    
    const ref = ref_from_path(path)

    if (ref.istype === RefType.Collection) {

        docs.forEach((doc:any)=> {

            if (doc.change_type === "added") {
                const newdoc:Doc = { istype: RefType.Doc, path: ref.path + '/' + doc.id, id: doc.id, isfilled: true, listen:false, is_listening: false, data:doc.data, collections: [] }
                //@ts-ignore
                ref.docs.set(doc.id, newdoc)
            } 

            if (doc.change_type === "modified") {
                //@ts-ignore
                ref.docs.get(doc.id).data = doc.data
            } 
            
            if (doc.change_type === "removed") {
                //@ts-ignore
                ref.docs.delete(doc.id)
            }

        })
    }

    else if (ref.istype === RefType.Doc) {
        //@ts-ignore
        ref.data = docs[0]
    }

    document.dispatchEvent(data_change_event)
}
*/



function ref_from_path(path:str) : Collection|Doc {

    const parts = path.split('/')

    let collection:Collection|null = null
    let doc:Doc|null = null

    for (let i = 0; i < parts.length; i++) {

        if (i % 2 === 0) { // dealing with a collection

            let thiscollection = (doc) ? doc.collections.find(c=> c.name === parts[i]) : collections.find(c=> c.name === parts[i])

            if (!thiscollection) {   
                thiscollection = { istype: RefType.Collection, path: getthispath(parts, i), name: parts[i], isfilled: false, listen: false, is_listening: false, docs: new Map() }   

                if (i === 0) collections.push(thiscollection) // top level -- needs attached 
                else if (doc) doc.collections.push(thiscollection) // nested -- needs attached to doc
            }
            
            collection = thiscollection
        }

        else if (i % 2 === 1) {
            let thisdoc = collection.docs.get(parts[i])

            if (!thisdoc) {   
                thisdoc = { istype: RefType.Doc, path: getthispath(parts, i), id: parts[i], isfilled: false, listen: false, is_listening: false, data: null, collections: [] }   
                collection.docs.set(thisdoc.id, thisdoc)
            }

            doc = thisdoc
        }
    }

    return (parts.length % 2 === 1) ? collection : doc


    function getthispath(parts:str[], i:int) : str {
         path = ""
        for (let j = 0; j <= i; j++) {
            path += parts[j] + "/"
        }
        return path.substring(0, path.length-1)
    }
}




function redirect_from_error(errmsg:str) {
    
    console.info(`/?errmsg=Firestore Error: ${errmsg}`)

    if (!window.location.href.includes("localhost")) {
        window.location.href = `/?errmsg=Firestore Error: ${errmsg}`
    }
}




/* 
 * Part of listening for changes. Not finished yet. Will come back later .... maybe
tick_listens()
function tick_listens() {
    setTimeout(async ()=> {    
        if (!tempfl) {
            tick_listens()
            return
        }
        tempfl = false

        const refs:{path:str, ref:any}[] = []

        get_it_all_but_is_temp_til_can_get_loopthrough_figured_out(refs)

        //collections.forEach(c=> {
        //    get_it_all_but_is_temp_til_can_get_loopthrough_figured_out(refs)
        //})

        if (refs.length > 0) {
            await listen_to(refs.map(r=> r.path))
            refs.forEach(r=> r.ref.is_listening = true)
        }

        tick_listens()
    }, 1000)

    function get_it_all_but_is_temp_til_can_get_loopthrough_figured_out(refs:{path:str, ref:any}[]) {

        if (collections.length === 1 && collections[0].path === "machines") {
            const m = collections[0]
            if (m.listen && !m.is_listening) {
                refs.push({ path: m.path, ref: m })
            }

            if (m.docs.size > 0) {
                for (const [_key, doc] of m.docs) {
                    if (doc.listen && !doc.is_listening) {
                        refs.push({ path: doc.path, ref: doc })
                    }
                    if (doc.collections.length > 0) {
                        for (let i = 0; i < doc.collections.length; i++) {
                            const statuses = doc.collections[i]
                            if (statuses.listen && !statuses.is_listening) {
                                refs.push({ path: statuses.path, ref: statuses })
                            }
                        }
                    }
                }
            }
        }
    }

//   
//    Come back to this later. need to be able to listen to everything in a collection recursively
//   
//   function loopthrough(refs:{path:str, ref:any}[], current_ref:Collection|Doc) {
//
//       if (current_ref.listen && !current_ref.is_listening) {
//           refs.push({ path: current_ref.path, ref: current_ref })
//       }
//
//       if (current_ref.istype === RefType.Collection) {
//           //@ts-ignore
//           for(const [_key, val] of current_ref.docs) {
//               //@ts-ignore
//               loopthrough(refs, [val])
//           }
//       } else if(current_ref.istype === RefType.Doc) {
//           //@ts-ignore
//           for(let i = 0; i < current_ref.collections.length; i++) {
//               //@ts-ignore
//               loopthrough(paths, [current_ref.collections[i]])
//           }
//       }
//   }
}
*/




(window as any).Firestore = { Retrieve, Patch }


