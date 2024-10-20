
import { $NT } from '../defs_client.js'

type str = string; type bool = boolean; type int = number;   

declare var $N:$NT

type Opt = {
    limit: int
    order_by: str,
}




function Retrieve(paths:str[]|str, param_opts:object[]|object|null) { 

    return new Promise<Array<object[]|object>>(async (res,_rej)=> { 

        paths = Array.isArray(paths) ? paths : [paths]

        const opts:Opt[] = set_all_options_from_opts(paths, param_opts)

        const fetch_results = await firestore_fetch_paths(paths, opts)

        res(fetch_results as Array<object[]|object>)
    })
}




function Add(path:str, newdocs:any[]) { return new Promise(async (res,_rej)=> { 

    const body = { path, newdocs }

    const opts = {
        method: 'POST',
        body: JSON.stringify(body),
    }

    await $N.FetchLassie('/api/firestore_add', opts, null) as Promise<any[]>

    res({result_str: "ok"})
})}




function Patch(paths:str, data:any, param_opts:object|object|null) {   return new Promise(async (res, _rej)=> { 

    const body = { paths, opts: param_opts, data }

    const opts = {   
        method: "POST",  
        body: JSON.stringify(body),
    }

    const fetch_results = await $N.FetchLassie('/api/firestore_patch', opts, null) as Promise<any[]>

    res(fetch_results)
})}




function set_all_options_from_opts(paths:str[], popts:object[]|object|null) : Opt[] {

    const o:object[] = (!popts) ? paths.map(()=> ({})) : Array.isArray(popts) ? popts : paths.map(()=> popts)

    const opts:object[] = paths.map((_p,i)=> {   return o[i] ? o[i] : o[o.length-1]   })

    const options:Opt[] = opts.map((pgo:any,_i)=> {
        return {
            limit: pgo.limit ? pgo.limit : null,
            order_by: pgo.order_by ? pgo.order_by : null,
            ts: pgo.ts ? pgo.ts : null,
        }
    })

    return options
}




function firestore_fetch_paths(paths:str[], firestoreopts:Opt[]) {   return new Promise(async (res)=> {

    const body = { paths, opts:firestoreopts }

    const fetchopts = {   
        method: "POST",
        body: JSON.stringify(body),
    }

    const fetch_results = await $N.FetchLassie('/api/firestore_retrieve', fetchopts, null) as Promise<any[]>

    res(fetch_results)
})}





if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).Firestore = { Retrieve, Add, Patch };

