
import { num, str } from "../defs_server_symlink.js"
import { FetchLassieHttpOptsT, FetchLassieOptsT } from "../defs.js"


const enum RequestStateE { INACTIVE, ACTIVE, SUCCESS, FAILED }


type RequestT = {
    url: str,
    ts: num,
    http_opts: FetchLassieHttpOptsT,
    opts: FetchLassieOptsT,
    state: RequestStateE,
    cb: (_:any)=>void,
}




function FetchLassie(url:string, http_optsP:FetchLassieHttpOptsT|undefined, opts:FetchLassieOptsT|null|undefined) { return new Promise(async (response_callback:(_:any)=>void)=> { 

    http_optsP = http_optsP || { method: "GET", headers: {}, body: null }
    opts = opts || { isbackground: false, timeout: 9000 }

    opts.isbackground = typeof opts.isbackground !== "undefined" ? opts.isbackground : false
	opts.timeout = typeof opts.timeout !== "undefined" ? opts.timeout : 9000

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

	setBackgroundOverlay(opts.isbackground)

	const controller = new AbortController();
	const { signal } = controller;

	const fetchPromise = fetch(url, { ...http_opts, signal });

	const timeoutControllerId     = setTimeout(() => {   controller.abort();        }, opts.timeout);
	const timeoutWaitingAnimateId = setTimeout(() => {   setWaitingAnimate(true);   }, 600);

	fetchPromise.finally(() => { 
		clearTimeout(timeoutControllerId)
		clearTimeout(timeoutWaitingAnimateId)

		setBackgroundOverlay(false)
		setWaitingAnimate(false)
	});

	return fetchPromise
})}




function setBackgroundOverlay(ison:boolean) {
    const xel = document.getElementById("fetchlassy_overlay")!
    if (ison) {   xel.classList.add("active");   } else {   xel.classList.remove("active");   }
}




function setWaitingAnimate(ison:boolean) {
    const xel = document.getElementById("fetchlassy_overlay .waiting_animate")!
    if (ison) {   xel.classList.add("active");   } else {   xel.classList.remove("active");   }
}




/*
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
    opts = opts || { isbackground: false, timeout: 9000 }

    opts.isbackground = typeof opts.isbackground !== "undefined" ? opts.isbackground : false
	opts.timeout = typeof opts.timeout !== "undefined" ? opts.timeout : 9000

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

    set_que(url, opts, http_opts, (r)=>response_callback(r))
})}




function execute(que:QueRequestT) {  

    fetch(que.url, que.http_opts)
        .then(async (server_response:Response|false)=> {
            if (server_response && server_response.status === 200 && server_response.ok) {
                const request_result = await (que.http_opts.headers["Accept"] === "application/json" ? server_response.json() : server_response.text())
                que.state = QueRequestStateE.SUCCESS
                que.cb(request_result)
            } else {
				// all requests are funneled through service worker, which handles errors
			}
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







function fetch_lassie_ticktock() {

    for(let i = ques.length-1; i >= 0; i--) {
        if (ques[i].state === QueRequestStateE.SUCCESS || ques[i].state === QueRequestStateE.FAILED) {
            ques.splice(i, 1)
        }
    }

    const now = Date.now()

    const que_timedout = ques.find(x=> now - x.ts > x.opts.timeout!)

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

*/


if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).FetchLassie = FetchLassie;



