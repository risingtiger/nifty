
import { str, SSETriggersE } from "../defs_server_symlink.js"
import { $NT, LoggerTypeE, LoggerSubjectE } from "../defs.js"


type SSE_Listener = {
    name: str,
	el: HTMLElement,
    triggers:SSETriggersE[],
	priority:number,
    cb:(paths:str[])=>void
}


declare var $N: $NT;


const sse_listeners:SSE_Listener[] = []
let evt: EventSource|null = null
let connect_ts = 0
//let evt_state:EventState_ = EventState_.UNINITIALIZED
//let set_timeout_intrv:NodeJS.Timeout|null = null
//let connection_init_time = 0




function Init() {   
    boot_up()
}




function ForceStop() {   
	if (evt)
		evt.close()
}




const WaitTilConnectedOrTimeout = () => new Promise<boolean>(async (res, _rej)=> {

	let counter = 0

	if (evt && evt.readyState === EventSource.OPEN) {
		res(true)
		return
	} else {
		const intrv = setInterval(()=> {
			if (evt && evt.readyState === EventSource.OPEN) {
				clearInterval(intrv)
				res(true)
			}

			counter++

			if (counter > 30) {
				clearInterval(intrv)
				res(false)
			}

		}, 100)
	}
})




function Add_Listener(el:HTMLElement, name:str, triggers:SSETriggersE[], priority_:number|null, callback_:(obj:any)=>void) {

	for(let i = 0; i < sse_listeners.length; i++) {
		if (!sse_listeners[i].el.parentElement) {
			sse_listeners.splice(i, 1)   
		}
	}

	const priority = priority_ || 0

	const newlistener = {
		name: name,
		el: el,
		triggers,
		priority,
		cb: callback_
	}


	Remove_Listener(el, name) // will just return if not found

	sse_listeners.push(newlistener)

	sse_listeners.sort((a, b)=> a.priority - b.priority)
}




function Remove_Listener(el:HTMLElement, name:str) {   
	const i = sse_listeners.findIndex(l=> l.el.tagName === el.tagName && l.name === name)
	if (i === -1) return
	sse_listeners.splice(i, 1)   
}




function boot_up() {

    let id = localStorage.getItem('sse_id')

    if (!id) {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sse_id', id)
    }

    // Check if we're on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Use absolute path for localhost, otherwise use the full URL
    const eventSourceUrl = isLocalhost 
        ? "/api/sse_add_listener?id=" + id
        : "https://webapp-805737116651.us-central1.run.app/api/sse_add_listener?id=" + id;
    
    evt = new EventSource(eventSourceUrl);
	connect_ts = Date.now()

	$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_listener_added, ``)

    evt.onerror = (_e) => {
		$N.Logger.Log(LoggerTypeE.error, LoggerSubjectE.sse_listener_error, ``)
    }

    evt.addEventListener("connected", (_e) => {
		$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_listener_connected, ``)
    })

    evt.addEventListener("a_"+SSETriggersE.FIRESTORE_DOC, (e) => {
		const data = JSON.parse(e.data)
		const ls = sse_listeners.filter(l=> l.triggers.includes(SSETriggersE.FIRESTORE_DOC))
		if (!ls) throw new Error("should be at least one  listener for FIRESTORE_DOC, but none found")
		ls.forEach(l=> l.cb(data))
    }) 

    evt.addEventListener("a_"+SSETriggersE.FIRESTORE_COLLECTION, (e) => {
		const data = JSON.parse(e.data)
		const ls = sse_listeners.filter(l=> l.triggers.includes(SSETriggersE.FIRESTORE_COLLECTION))
		if (!ls) throw new Error("should be at least one listener for FIRESTORE_COLLECTION, but none found")
		ls.forEach(l=> l.cb(data))
    }) 


    // lets just see if the browser will take care of when user goes in and out of focus on window / app
}



/*
function __begin_it__() { 

    let unique_identifier = localStorage.getItem('sse_unique_identifier')

    if (!unique_identifier) {
        unique_identifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sse_unique_identifier', unique_identifier)
    }

    evt = new EventSource("/api/sse_begin?unique_identifier=" + unique_identifier)
    evt_state = EventState_.CONNECTING


    evt.onopen = (_e:Event) => {
        if (evt!.readyState === EventSource.OPEN)
            evt_state = EventState_.OPEN
        else
            evt_state = EventState_.ERRORED
    }

    evt.onerror = (_e) => {
        evt_state = EventState_.ERRORED
    }

    evt.addEventListener("triggered", (e) => {

        const data = JSON.parse(e.data)
        const trigger = data.trigger
        const paths = data.paths

        sse_listeners.forEach((listener) => {
            if (listener.trigger === trigger) {
                listener.callback(paths)
            }
        })



        if (trigger === SSE_Triggers.PWTSync) {
            const viewsel = document.querySelector("#views") as HTMLDivElement
            viewsel.setAttribute("data-pwtsync", "true")
        }
    })

    evt.addEventListener("intervalmsg", (_e) => {
        //const data = JSON.parse(e.data)
    }) 
}
*/


/*
function sse_ticktock() {   

    const next_timeout_millis:int = sse_ticktock_run()   

    set_timeout_intrv = setTimeout(sse_ticktock, next_timeout_millis)   
}
*/



/*
function sse_ticktock_run() : int {

    let new_timeout_millis:int = 15000

    if (evt_state === EventState_.UNINITIALIZED) {
        new_timeout_millis = 100
        connection_init_time = Date.now()
        begin_it()
    }

    if (evt_state === EventState_.CONNECTING) {
        new_timeout_millis = 1000

        if (Date.now() - connection_init_time > 7000) {
            evt_state = EventState_.ERRORED
            new_timeout_millis = 0
        }    
    }

    else if (evt_state === EventState_.ERRORED) {
        evt!.close()
        evt = null
        new_timeout_millis = 10000
        evt_state = EventState_.ERROR_FLUSHING

    } else if (evt_state === EventState_.ERROR_FLUSHING) {
        new_timeout_millis = 0
        evt_state = EventState_.UNINITIALIZED

    } else if (evt_state === EventState_.OPEN) {
    }

    return new_timeout_millis
}
*/






/*
function redirect_from_error(errmsg:str, errmsg_long:str) {
	localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long)
	if (window.location.protocol === "https:") {
		window.location.href = `/index.html?errmsg=${errmsg}`
	} else {
		throw new Error(errmsg + " -- " + errmsg_long)
	}
}
*/



export { Init }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SSEvents = {ForceStop, Add_Listener, Remove_Listener, WaitTilConnectedOrTimeout };

