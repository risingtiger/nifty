
import { num, bool, str, FetchLassieHttpOptsT, FetchLassieOptsT } from "../defs_client.js"

enum QueRequestStateE { INACTIVE, ACTIVE, SUCCESS, FAILED }

type QueRequestT = {
    url: str,
    ts: num,
    http_opts: FetchLassieHttpOptsT,
    opts: FetchLassieOptsT,
    state: QueRequestStateE,
    cb: (_:any)=>void,
}

const ques:QueRequestT[] = []




function FetchLassie(url:string, http_optsP:FetchLassieHttpOptsT|undefined, opts:FetchLassieOptsT|null|undefined) { return new Promise(async (response_callback:(_:any)=>void)=> { 

    //const i = que_i++

    http_optsP = http_optsP || { method: "GET", headers: {}, body: null }
    opts = opts || { disable_auth: false, isbackground: false, timeout: 9000 }

    opts.disable_auth = typeof opts.disable_auth !== "undefined" ? opts.disable_auth : false

    let http_opts:FetchLassieHttpOptsT = {
        method: typeof http_optsP.method !== "undefined" ? http_optsP.method : "GET",
        headers: typeof http_optsP.headers !== "undefined" ? http_optsP.headers : {},
        body: typeof http_optsP.body !== "undefined" ? http_optsP.body : null
    }

    http_opts.method  = typeof http_opts.method !== "undefined" ? http_opts.method : "GET"
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

    set_que(url, opts, http_opts, (r)=>response_callback(r))
})}




function execute(que:QueRequestT) {  

    fetch(que.url, que.http_opts)

        .then(async (server_response:any)=> {

            if (server_response.status === 401) {
				que.state = QueRequestStateE.FAILED
                error_out("fetchlassie_not_authorized", "Fetchlassie- " + que.url + ":" + "401. Not Authorized")
            }

            else if (server_response.status === 410) {
				que.state = QueRequestStateE.FAILED
                window.location.href = "/?update_init=1"
            }

            else if (server_response.ok) {
                const request_result = await (que.http_opts.headers["Accept"] === "application/json" ? server_response.json() : server_response.text())
                que.state = QueRequestStateE.SUCCESS
                que.cb(request_result)
            }

            else {
				que.state = QueRequestStateE.FAILED
                error_out("fetchlassie_server_error", "Fetchlassie Server Error - " + que.url + ": " + server_response.statusText)
            }
        })

        .catch((error:any)=> {
				que.state = QueRequestStateE.FAILED
			error_out("fetchlassie_network_error", "Fetchlassie Network Error - " + que.url + ": " + error.message)
        })
}




function error_out(errmsg:string, errmsg_long:string="") {

	localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long)
	if (window.location.protocol === "https:") {
		window.location.href = `/index.html?errmsg=${errmsg}`; 
	} else {
		throw new Error(errmsg + " -- " + errmsg_long)
	}
}




function set_que(url:string, opts:FetchLassieOptsT, http_opts:FetchLassieHttpOptsT, cb:(_:any)=>void) {

    ques.push({ url, ts: Date.now(), opts, http_opts, state:QueRequestStateE.INACTIVE, cb });

    if (ques.length === 1)
        fetch_lassie_ticktock()
}




function authrequest() { return new Promise<string>(async (res,_rej)=> { 

    let id_token = localStorage.getItem('id_token')
    let refresh_token = localStorage.getItem('refresh_token')
    let token_expires_at = localStorage.getItem('token_expires_at')!

    if (!id_token) {
        error_out("fetchlassie_id_token_missing", "Fetchlassie - ID token missing in browser storage")
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
                error_out("fetchlassie_refresh_auth_failed", "Fetchlassie Refresh Auth Failed - " + data.error.message)
            }

            else {
                localStorage.setItem('id_token', data.id_token)
                localStorage.setItem('refresh_token', data.refresh_token)
                localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.expires_in) ).toString() )

                res(data.id_token)
            }

        }).catch(err=> {
			error_out("fetchlassie_network_refresh_auth_failed", "Fetchlassie Network Refresh Auth Failed - " + err.message)
        })
    }

    else {
        res(id_token)
    }
})}


function fetch_lassie_ticktock() {

    for(let i = ques.length-1; i >= 0; i--) {
        if (ques[i].state === QueRequestStateE.SUCCESS || ques[i].state === QueRequestStateE.FAILED) {
            ques.splice(i, 1)
        }
    }

    const now = Date.now()

    const que_timedout = ques.find(x=> now - x.ts > x.opts.timeout)

    if (que_timedout) {
        error_out("fetchlassie_timeout", "Fetch Lassie Timeout - " + que_timedout.url)
        return
    }

    const xel = document.getElementById("fetchlassy_overlay")!

    const activeque = ques.find(x=> x.state === QueRequestStateE.ACTIVE)
    if (!activeque && ques.length) { ques[0].state = QueRequestStateE.ACTIVE; execute(ques[0]); }

    if (ques.length && ques.some(q=> q.state === QueRequestStateE.ACTIVE && !q.opts.isbackground)) {
        xel.classList.add("active")

        const anyactive_taking_a_while = ques.some(q=> q.state === QueRequestStateE.ACTIVE && Date.now() - q.ts > 600)
        if (anyactive_taking_a_while)
            xel.querySelector(".waiting_animate")!.classList.add("active")

    } else {
        xel.classList.remove("active")
        xel.querySelector(".waiting_animate")!.classList.remove("active")
    }

    if (ques.length) {
        setTimeout(()=>fetch_lassie_ticktock(), 30)
        return 
    }


}



if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).FetchLassie = FetchLassie;

