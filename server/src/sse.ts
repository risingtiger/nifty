
import { SSE_TriggersE, str  } from './defs_server.js'






type ListenerT = {
    id:str,
    cb:(trigger:SSE_TriggersE, obj:any)=>void
}

const listeners:Map<str,ListenerT> = new Map()



function Add_Listener(req:any, res:any) { 

    const id = req.query.id as str
    const l = listeners.get(id)

    if (l) {
		listeners.delete(id)
    }

    listeners.set(id, {
        id, 
        cb: (trigger:SSE_TriggersE, data:any)=> {
            res.write(`event: a_${trigger}\n`)
            res.write(`data: ${JSON.stringify(data)}\n`)
			res.write('retry: 15000\n')
            res.write('\n\n')
        }
    })

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': "keep-alive"
    })

    res.write('event: connected\n')
    res.write('data: { "message": "hey connected" }\n')
	res.write('retry: 15000\n')
    res.write('\n\n')

    req.on('close', () => {
        listeners.delete(id)
    })
}




function TriggerEvent(eventname:SSE_TriggersE, data:any) {

    listeners.forEach(l => {
		try {
			l.cb(eventname, data)
		} catch (e) {
			listeners.delete(l.id)
		}
    })
}






/*
function remove_listener(l:Listener) {

    l.httpres.destroy()
    listeners.delete(l.unique_identifier)
}
*/




export default { Add_Listener, TriggerEvent }



