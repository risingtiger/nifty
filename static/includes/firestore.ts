

type Opt = {
    limit: int
    order_by: str
}




function Retrieve(paths:str[]|str, param_opts:object[]|null) { 

    return new Promise<Array<object[]|object>>(async (res,_rej)=> { 

        paths = Array.isArray(paths) ? paths : [paths]

        const opts:Opt[] = set_all_options_from_opts(paths, param_opts)

        const id_token = await authrequest()

        const fetch_results = await firestore_fetch_paths(paths, opts, id_token)

        res(fetch_results as Array<object[]|object>)
    })
}




function Add(path:str, newdocs:any[]) { return new Promise(async (res,_rej)=> { 

    authrequest().then((id_token:str)=> {

        const body = { path, newdocs }

        fetch('/api/firestore_add', {
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




function Patch(what:str, mask:any[], data:any) { return new Promise(async (res,_rej)=> { 

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




function set_all_options_from_opts(paths:str[], popts:object[]|null) : Opt[] {

    const o:object[] = (!popts) ? paths.map(()=> ({})) : Array.isArray(popts) ? popts : paths.map(()=> popts)

    const opts:object[] = paths.map((_p,i)=> {   return o[i] ? o[i] : o[o.length-1]   })

    const options:Opt[] = opts.map((pgo:any,_i)=> {
        return {
            limit: pgo.limit ? pgo.limit : null,
            order_by: pgo.order_by ? pgo.order_by : null,
            modts: null
        }
    })

    return options
}




function firestore_fetch_paths(paths:str[], opts_:Opt[], id_token:str) {

    return new Promise(async (res)=> {

        const body = { paths, opts:opts_ }

        const opts = {   
            method: "POST",  
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + id_token,
            },
            body: JSON.stringify(body)   
        }

        const fetch_results = await FetchLassie('/api/firestore_retrieve', opts) as Promise<any[]>

        res(fetch_results)
    })
}




function authrequest() { return new Promise<str>(async (res,_rej)=> { 

    let id_token = localStorage.getItem('id_token')
    let refresh_token = localStorage.getItem('refresh_token')
    let token_expires_at = localStorage.getItem('token_expires_at')

    if (!id_token) {
        redirect_from_error("Not Signed In")
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
                redirect_from_error(data.error.message)
            }

            else {
                localStorage.setItem('id_token', data.id_token)
                localStorage.setItem('refresh_token', data.refresh_token)
                localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.expires_in) ).toString() )

                res(data.id_token)
            }

        }).catch(err=> {
            redirect_from_error(err.message)
        })
    }

    else {
        res(id_token)
    }
})}




function redirect_from_error(errmsg:str) {
    console.info(`/?errmsg=Firestore Error: ${errmsg}`)

    if (!window.location.href.includes("localhost")) {
        window.location.href = `/?errmsg=Firestore Error: ${errmsg}`
    }
}









(window as any).Firestore = { Retrieve, Add, Patch }


