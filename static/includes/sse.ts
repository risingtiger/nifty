
import * as AppFocusListen from "./appfocus_listen.js"


enum EventState_     {   CONNECTING = 0, OPEN = 1, UNINITIALIZED = 2, ERRORED = 3, ERROR_FLUSHING = 4   }
enum SSE_Triggers    {  FIRESTORE = 0   }




let evt: EventSource|null = null
let evt_state:EventState_ = EventState_.UNINITIALIZED
let set_timeout_intrv:NodeJS.Timeout|null = null
let connection_init_time = 0




type SSE_Listener = {
    name: str,
    trigger:SSE_Triggers,
    callback:(paths:str[])=>void
}

const sse_listeners:SSE_Listener[] = []




function Init() {   
    sse_ticktock()   

    AppFocusListen.AppFocus_Add_Listener("sse", (isfocused:bool)=> {

        if (isfocused) {
            clearTimeout(set_timeout_intrv)
            sse_ticktock()

        } else {
            clearTimeout(set_timeout_intrv)
        }
    })
}




function Add_Listener(name:str, trigger:SSE_Triggers, callback_:(obj:object)=>void) {

    const is_already_listener = sse_listeners.find(l=> l.name === name) ? true : false

    if (is_already_listener) {
        redirect_from_error("SSE Listener with that name already exists")
        return
    }

    sse_listeners.push({
        name: name,
        trigger: trigger,
        callback: callback_
    })
}




function Remove_Listener(name:str) {   sse_listeners.splice(sse_listeners.findIndex(l=> l.name === name), 1)   }




function begin_it() { 

    let unique_identifier = localStorage.getItem('sse_unique_identifier')

    if (!unique_identifier) {
        unique_identifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sse_unique_identifier', unique_identifier)
    }

    evt = new EventSource("/api/listen_begin?unique_identifier=" + unique_identifier)
    evt_state = EventState_.CONNECTING


    evt.onopen = (_e:Event) => {
        if (evt.readyState === EventSource.OPEN)
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
    })

    evt.addEventListener("intervalmsg", (_e) => {
        //const data = JSON.parse(e.data)
    }) 
}




function sse_ticktock() {   

    const next_timeout_millis:int = sse_ticktock_run()   

    set_timeout_intrv = setTimeout(sse_ticktock, next_timeout_millis)   
}




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
        evt.close()
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








function redirect_from_error(errmsg:str) {
    console.info(`/?errmsg=SSE Error: ${errmsg}`)

    if (!window.location.href.includes("localhost")) {
        window.location.href = `/?errmsg=SSE Error: ${errmsg}`
    }
}








export { Init, Add_Listener, Remove_Listener, SSE_Triggers }

(window as any).SSEvents = { Add_Listener, Remove_Listener, SSE_Triggers }

