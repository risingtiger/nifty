
import { SSE_TriggersE, str  } from './definitions.js'






type ListenerT = {
    id:str,
    cb:(trigger:SSE_TriggersE, obj:any)=>void
}

const listeners:Map<str,ListenerT> = new Map()




function Add_Listener(req:any, res:any) { 

    const id = req.query.id as str
    const l = listeners.get(id)

    if (l) {
        res.status(400).send("user already has a listener")
        return
    }

    listeners.set(id, {
        id, 
        cb: (trigger:SSE_TriggersE, data:any)=> {
            res.write(`event: a_${trigger}\n`)
            res.write(`data: ${JSON.stringify(data)}`)
            res.write('\n\n')
        }
    })

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': "keep-alive"
    })

    res.write('event: connected\n')
    res.write('data: { "message": "hey connected" }')
    res.write('\n\n')

    req.on('close', () => {
        listeners.delete(id)
    })
}




function TriggerEvent(eventname:SSE_TriggersE, data:any) {

    listeners.forEach(l => {
        l.cb(eventname, data)
    })
}



/*
setInterval(() => {
    TriggerEvent('cssupdate', { cssfile: '/Users/dave/Code/nifty/client/client_pwt/lazy/views/home/home.css' })
}, 5000)
*/




/*
function remove_listener(l:Listener) {

    l.httpres.destroy()
    listeners.delete(l.unique_identifier)
}
*/




export default { Add_Listener, TriggerEvent }



