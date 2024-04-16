
type str = string; type int = number; type bool = boolean;


type Que = {
    i: int,
    url: str,
    ts: int
}

type HttpOptsT = {
    method: str,
    headers: any,
    body: string|null,
}

type OptsT = {
    disable_auth: bool,
}

const ques:Que[] = []
let que_i = 0




type HttpOptsHldrT = {
    method?: str,
    headers?: any,
    body?: string|null,
}
function FetchLassie(url:str, http_optsP:HttpOptsHldrT|undefined, opts:OptsT|null|undefined) { return new Promise(async res=> { 

    const i = que_i++

    set_pre(url, i)

    http_optsP = http_optsP || { method: "GET", headers: {}, body: null }
    opts = opts || { disable_auth: false }

    opts.disable_auth = typeof opts.disable_auth !== "undefined" ? opts.disable_auth : false

    let http_opts:HttpOptsT = {
        method: typeof http_optsP.method !== "undefined" ? http_optsP.method : "GET",
        headers: typeof http_optsP.headers !== "undefined" ? http_optsP.headers : {},
        body: typeof http_optsP.body !== "undefined" ? http_optsP.body : null
    }

    http_opts.method = typeof http_opts.method !== "undefined" ? http_opts.method : "GET"
    http_opts.headers = typeof http_opts.headers !== "undefined" ? http_opts.headers : {}
    http_opts.body    = typeof http_opts.body !== "undefined" ? http_opts.body : null

    if(!http_opts.headers["Content-Type"]) http_opts.headers["Content-Type"] = "application/json"
    if(!http_opts.headers["Accept"]) http_opts.headers["Accept"] = "application/json"

    if (url.startsWith("/api/"))
        http_opts.headers["appversion"] = (window as any).APPVERSION

    if (url.startsWith("/api/") && !opts.disable_auth) {
        let id_token = await authrequest()
        http_opts.headers["Authorization"] = `Bearer ${id_token}`
    }

    execute(url, http_opts)
        .then((result:any)=> {
            set_success(i)
            res(result)
        })

        .catch((err:any)=> {
            error_out(err)
        })
})}




function execute(resource:str, http_opts:HttpOptsT) { return new Promise(async (res, er)=> { 

    fetch(resource, http_opts)

        .then(async (server_response:any)=> {

            if (server_response.status === 401) {
                alert ("Not Authorized")
            }

            else if (server_response.status === 410) {
                window.location.href = "/index.html?update=1"
            }

            else if (server_response.ok) {
                const request_result = await (http_opts.headers["Accept"] === "application/json" ? server_response.json() : server_response.text())
                res(request_result)
            }

            else {
                er(server_response)
            }
        })

        .catch((error:any)=> {
            er(error)
        })
})}




function error_out(server_response:any = {}) {

    const errmsg = server_response.msg || server_response

    if ((window as any).APPVERSION !== 0) { 
        window.location.href = `/?errmsg=${encodeURIComponent('Unable to Fetch')}`; 
    }   

    console.log(server_response.status)
    console.error("Fetch Error: ")
    console.error(errmsg)
}




function set_pre(url:str, this_que_i:int) {

    ques.push({ i:this_que_i, url, ts: Date.now() })
    fetch_lassie_ticktock()
}




function set_success(this_que_i:int) {

    const que_index = ques.findIndex(x=> x.i === this_que_i)
    ques.splice(que_index)
}




function authrequest() { return new Promise<str>(async (res,_rej)=> { 

    let id_token = localStorage.getItem('id_token')
    let refresh_token = localStorage.getItem('refresh_token')
    let token_expires_at = localStorage.getItem('token_expires_at')!

    if (!id_token) {
        error_out("Not Signed In")
        return
    }


    if (Date.now()/1000 > parseInt(token_expires_at)-30) {

        const body = { refresh_token }

        fetch('/api/refresh_auth', {

            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)

        }).then(async r=> {

            let data = await r.json()

            if (data.error) {
                error_out(data.error.message)
            }

            else {
                localStorage.setItem('id_token', data.id_token)
                localStorage.setItem('refresh_token', data.refresh_token)
                localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.expires_in) ).toString() )

                res(data.id_token)
            }

        }).catch(err=> {
            error_out(err.message)
        })
    }

    else {
        res(id_token)
    }
})}


function fetch_lassie_ticktock() {

    setTimeout(()=> {
        if (ques.length > 0) {
            const now = Date.now()
            document.getElementById("fetchlassy_overlay")!.classList.add("active")
            document.getElementById("waiting_animate")!.classList.add("active")
            const queover = ques.find(x=> now - x.ts > 9000)
            if (queover) {
                error_out("FetchLassie timed out")
            } else {
                fetch_lassie_ticktock()
            }
        } else {
            document.getElementById("fetchlassy_overlay")!.classList.remove("active")
            document.getElementById("waiting_animate")!.classList.remove("active")
        }
    }, 350)
}


(window as any).FetchLassie = FetchLassie;


