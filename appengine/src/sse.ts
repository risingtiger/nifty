import { ServerResponse } from "http";


type str = string; type int = number; //type bool = boolean;
enum SSE_Triggers    {  FIRESTORE = 0   }


//import fetch from 'node-fetch';




type Listener = {
    httpres: any
    unique_identifier:str
    listen_to: {path:str}[]
    expires_at_timeout: int 
    trigger_callback:(obj:object)=>void
}

const listeners:Map<str,Listener> = new Map()




function Begin(req:any, res:any) { 

    const unique_identifier = req.query.unique_identifier as str
    const l = listeners.get(unique_identifier)

    if (l) {
        res.status(400).send("user already has a listener")
        return
    }

    listeners.set(unique_identifier, {
        httpres: res,
        unique_identifier, 
        listen_to:[],
        expires_at_timeout: Date.now() + (1000 * 60 * 5),

        trigger_callback: (obj:object)=> {
            const y = 'data:'+ JSON.stringify(obj) + '\n\n'
            res.write('event:triggered\n')
            res.write(y)
            res.write('\n\n')
        }
    })


    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
    })

    res.write('event: connected\n')
    res.write('data: { "message": "hey connected" }')
    res.write('\n\n')

    req.on('close', () => {
        listeners.delete(unique_identifier)
    })
}




function TriggerUpdate(trigger:SSE_Triggers, paths:str[]) {

    listeners.forEach(l => {
        l.trigger_callback({trigger, paths})
    })
}




function remove_listener(l:Listener) {

    l.httpres.destroy()
    listeners.delete(l.unique_identifier)
}





function sse_ticktock() {

    setTimeout(()=> {

        const now = Date.now()

        listeners.forEach(l => {
            //l.data_change_callback("ticktocken")

            if (now > l.expires_at_timeout) {
                remove_listener(l)
            }
        })

        sse_ticktock()

    }, 1000 * 60 * 1 )
}




sse_ticktock()




const SSEvents = { Begin, TriggerUpdate, SSE_Triggers }
export { SSEvents }

