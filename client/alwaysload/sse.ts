

import { str, SSETriggersE } from "../defs_server_symlink.js"
import { $NT, LoggerTypeE, LoggerSubjectE } from "../defs.js"


type SSE_Listener = {
    name: str,
	el: HTMLElement,
    triggers:SSETriggersE[],
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
	evt!.close()
}




function Add_Listener(el:HTMLElement, name:str, triggers:SSETriggersE[], callback_:(obj:any)=>void) {

	for (const s of sse_listeners) {
		if (!s.el.parentElement) {
			sse_listeners.splice(sse_listeners.indexOf(s), 1)
		}
	}

    const is_already_listener = sse_listeners.find(l=> l.name === name && l.el === el) ? true : false

    if (is_already_listener) {
        redirect_from_error("sse_listner_already_exists","SSE Listener with that name already exists")
        return
    }

    sse_listeners.push({
        name: name,
		el: el,
        triggers,
        cb: callback_
    })

	$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_listener_added, `${name}`)

	console.log(`SSE Listener Added: ${el.tagName} - ${name}`)
}




function Remove_Listener(name:str) {   
	const i = sse_listeners.findIndex(l=> l.name === name)
	sse_listeners.splice(i, 1)   

	$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_listener_removed, `${sse_listeners[i].name}`)
	console.log(`SSE Listener Removed: ${sse_listeners[i].name}`)
}




async function Reset() {

    if (evt) {
        evt.close()
        evt = null
    }

    setTimeout(()=> {
        boot_up()
    }, 15000)
}




function boot_up() {

    let id = localStorage.getItem('sse_id')

    if (!id) {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sse_id', id)
    }

    evt = new EventSource("/api/sse_add_listener?id=" + id)
	connect_ts = Date.now()

    evt.onerror = (_e) => {
		$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_listener_error, ``)
		console.log(`SSE Listener Client Error: `)
    }

    evt.addEventListener("connected", (_e) => {
		$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_listener_connected, ``)
		console.log(`SSE Listener Client Connected: `)
		//
    })

    evt.addEventListener("a_"+SSETriggersE.FIRESTORE, (e) => {

		$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_received_firestore, ``)
		console.log(`SSE Received Firestore: ${e.data}`)

		if (document.hasFocus()) {

			$N.Logger.Log(LoggerTypeE.debug, LoggerSubjectE.sse_received_withfocus, ``)
			console.log(`SSE Received With Focus: `)

			const data = JSON.parse(e.data)
			sse_listeners.filter(l=> l.triggers.includes(SSETriggersE.FIRESTORE)).forEach(l=> l.cb(data))
		}
    }) 

    // lets just see if the browser will take care of when user goes in and out of focus on window / app

    /*
    sse_ticktock()   

    EngagementListen.Add_Listener("sse", "focus", ()=> {
        clearTimeout(set_timeout_intrv!)
        sse_ticktock()
    })
    EngagementListen.Add_Listener("sse", "blur", ()=> {
        clearTimeout(set_timeout_intrv!)
    })
    */
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


        console.log("this needs to be taken out. was put in to trigger sync with pwtdata but that api should be done soon and this whole process removed")

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






function redirect_from_error(errmsg:str, errmsg_long:str) {
	localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long)
	if (window.location.protocol === "https:") {
		window.location.href = `/index.html?errmsg=${errmsg}`
	} else {
		throw new Error(errmsg + " -- " + errmsg_long)
	}
}




if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SSEvents = { Init, ForceStop, Reset, Add_Listener, Remove_Listener };

