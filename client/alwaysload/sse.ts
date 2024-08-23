
import { SSE_TriggersE } from '../definitions.js'

//declare var EngagementListen:any;



type SSE_Listener = {
    name: str,
    triggers:SSE_TriggersE[],
    cb:(paths:str[])=>void
}


const sse_listeners:SSE_Listener[] = []
let evt: EventSource|null = null
//let evt_state:EventState_ = EventState_.UNINITIALIZED
//let set_timeout_intrv:NodeJS.Timeout|null = null
//let connection_init_time = 0




function Init() {   

    boot_up()
}




function Add_Listener(name:str, triggers:SSE_TriggersE[], callback_:(obj:any)=>void) {

    const is_already_listener = sse_listeners.find(l=> l.name === name) ? true : false

    if (is_already_listener) {
        redirect_from_error("SSE Listener with that name already exists")
        return
    }

    sse_listeners.push({
        name: name,
        triggers,
        cb: callback_
    })
}




function Remove_Listener(name:str) {   sse_listeners.splice(sse_listeners.findIndex(l=> l.name === name), 1)   }




async function Reset() {

    if (evt) {
        evt.close()
        evt = null
    }

    setTimeout(()=> {
        boot_up()
    }, 5000)
}




function boot_up() {

    let id = localStorage.getItem('sse_id')

    if (!id) {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sse_id', id)
    }

    evt = new EventSource("/api/sse_add_listener?id=" + id)

    evt.onerror = (e) => {
        console.error("SSE Error")
        console.error(e)
    }

    evt.addEventListener("connected", (_e) => {
        //
    })

    evt.addEventListener("a_"+SSE_TriggersE.FIRESTORE, (e) => {
        const data = JSON.parse(e.data)
        sse_listeners.filter(l=> l.triggers.includes(SSE_TriggersE.FIRESTORE)).forEach(l=> l.cb(data))
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






function redirect_from_error(errmsg:str) {
    console.info(`/?errmsg=SSE Error: ${errmsg}`)

    if ((window as any).APPVERSION > 0) {
        window.location.href = `/?errmsg=SSE Error: ${errmsg}`
    }
}




(window as any).SSEvents = { Add_Listener, Remove_Listener }

export default { Init, Reset, Add_Listener, Remove_Listener }


