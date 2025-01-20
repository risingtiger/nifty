
import { SSETriggersE, str  } from './defs.js'






type ListenerT = {
    id:str,
    cb:(trigger:SSETriggersE, obj:any)=>void
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
        cb: (trigger:SSETriggersE, data:any)=> {
            res.write(`event: a_${trigger}\n`)
            res.write(`data: ${JSON.stringify(data)}\n`)
            res.write('\n')
        }
    })

	res.socket.setNoDelay(true); 

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': "keep-alive"
    })

    res.write('event: connected\n')
    res.write('data: { "message": "hey connected" }\n')
	res.write('retry: 60000\n')
    res.write('\n')



	const keepAliveInterval = setInterval(() => {
		res.write(':\n\n'); // Send a comment to keep the connection alive
	}, 60000); // 1 minute

    req.on('close', () => {
		clearInterval(keepAliveInterval); // Clean up when the connection closes
        listeners.delete(id)
    })


	function keepalive(res_ref:any) {
		if (res_ref.writable && !res_ref.destroyed) {
			res_ref.write(':\n\n'); // Send a comment to keep the connection alive
		}
	}
}




function TriggerEvent(eventname:SSETriggersE, data:any) {
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



