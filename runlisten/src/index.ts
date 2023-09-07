
type int = number; /*type bool = boolean;*/ type str = string


import fetch from 'node-fetch';
import express from "express";
import { initializeApp, cert }  from "firebase-admin/app";
import { getFirestore }  from "firebase-admin/firestore";
import bodyParser from 'body-parser'
import cors from 'cors'
import { Firestore } from "./firestore.js"




type Firestore_Listener = {
    user_email:str
    listen_to: {path:str}[]
    expires_at_timeout: any // not really being used yet or maybe ever
    data_change_callback:(path:str, docs:any)=>void
}


const firestore_listeners:Firestore_Listener[] = []


const is_dev_env = process.env.NODE_ENV === "dev" ? true : false;
const app = express();
let db:any;

app.use(cors({ origin: 'https://20230826t191055-dot-purewatertech.appspot.com', credentials: true }))
app.use(bodyParser.json())


if (process.platform === 'darwin') {
    const keyFilename = "/Users/dave/.ssh/purewatertech-ad1adb2947b8.json"
    initializeApp({   credential: cert(keyFilename)   })
} 

else { 
    initializeApp()
}

db = getFirestore();





Firestore.Hook_Update_Event((path:str, docs:any)=> {
    const listeners = firestore_listeners.filter(l=> l.listen_to.find(lt=>lt.path === path))
    listeners.forEach(l=> l.data_change_callback(path, docs))
})




app.get('/firestore_listen_begin', (req, res) => {

    const id_token = req.query.id_token as str

    Firestore.Is_Authenticated(fetch, id_token).then((user:any)=> {

        const firestore_listener = firestore_listeners.find(l=>l.user_email === user.email)

        if (firestore_listener) {
            res.status(400).send("user already has a listener")
            return
        }

        firestore_listeners.push(
            {
                user_email:user.email, 
                listen_to:[],
                expires_at_timeout: setTimeout(()=> {
                    // nothing for now. may eventually remove listener but lets see how it goes
                }, 3600*1000),

                data_change_callback: (path:str, docs:any)=> {
                    const x = JSON.stringify({path, docs})
                    const y = 'data:'+ x
                    res.write('event:firestore\n')
                    res.write(y)
                    res.write('\n\n')
                }
            }
        )

        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            Connection: 'keep-alive',
            'Cache-Control': 'no-cache',
        })

        res.write('event: connected\n')
        res.write('data: { "message": "hey connected" }')
        res.write('\n\n')

        let count = 0
        setInterval(() => {
            res.write('event: message\n')
            res.write(`data: { "message": "hey message ${count}" }`)
            res.write('\n\n')
            count++
        }, 15000)

        req.on('close', () => {
            firestore_listener_remove(user.email)
        })

    }).catch((err:str)=> {
        res.status(401).send("unable to authenticate user: " + err)
    })
})




app.post('/firestore_listen_to', async (req, res) => {

    const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);
    const paths = req.body.paths

    Firestore.Is_Authenticated(fetch, id_token).then(async (user:any)=> {

        const listener = firestore_listeners.find(l=>l.user_email === user.email)

        if (!listener) {
            res.status(400).send("no listener found")
            return
        }

        clearInterval(listener.expires_at_timeout)
        listener.expires_at_timeout = setTimeout(()=> {
            // nothing for now. may eventually remove listener but lets see how it goes
        }, 3600*1000)

        for (let i = 0; i < paths.length; i++) {
            if (listener.listen_to.find(l=>l.path === paths[i])) {
                // already added
            } else {
                await Firestore.Listen_To(db, paths[i])
                listener.listen_to.push({path:paths[i]})
            }
        }

        res.status(200).send(JSON.stringify({message:"chance it wasnt added. but it probably was. yeah. thats super great and specific"}))

    }).catch((err:str)=> {
        res.status(401).send("unable to authenticate user: " + err)
    })
})




/*
app.post('/firestore_listen_refresh', async (req, res) => {

    const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);

    Firestore.Is_Authenticated(fetch, id_token).then(async (user:any)=> {

        const listener = firestore_listeners.find(l=>l.user_email === user.email)

        if (!listener) {
            res.status(400).send("no listener found")
            return
        }

        clearInterval(listener.expires_at_timeout)
        listener.expires_at_timeout = setTimeout(()=> {
            // nothing for now. may eventually remove listener but lets see how it goes
        }, 3600*1000)

        res.status(200).send(JSON.stringify({message:"refreshed"}))

    }).catch((err:str)=> {
        res.status(401).send("unable to authenticate user: " + err)
    })
})
*/




app.post('/firestore_listen_to_remove', async (req, res) => {

    const id_token = req.headers.authorization?.substring(7, req.headers.authorization?.length);
    const paths = req.body.paths

    Firestore.Is_Authenticated(fetch, id_token).then(async (user:any)=> {

        for (let i = 0; i < paths.length; i++) {
            firestore_listener_listen_to_remove(user.email, paths[i])
        }

        res.status(200).send(JSON.stringify({message:"success"}))

    }).catch((err:str)=> {

        res.status(401).send("unable to authenticate user: " + err)
    })
})




function firestore_listener_remove(user_email:str) {

    const firestore_listener = firestore_listeners.find(l=>l.user_email === user_email)

    if (!firestore_listener) {
        return
    }


    firestore_listeners.splice(firestore_listeners.indexOf(firestore_listener), 1)

    const all_paths = firestore_listeners.map(l=>l.listen_to.map(lt=>lt.path)).flat()
    Firestore.Prune_Listeners_Not_In_Paths(all_paths)
}




function firestore_listener_listen_to_remove(user_email:str, path:str) {

    const listener = firestore_listeners.find(l=>l.user_email === user_email)

    if (!listener) {
        return
    }


    const listen_to = listener.listen_to.find(l=>l.path === path)

    if (!listen_to) {
        return
    }


    this.listen_to.splice(this.listen_to.indexOf(listen_to), 1)

    const all_paths = firestore_listeners.map(l=>l.listen_to.map(lt=>lt.path)).flat()
    Firestore.Prune_Listeners_Not_In_Paths(all_paths)
}




//@ts-ignore
const port = (is_dev_env) ? 3004 : parseInt(process.env.PORT) || 8080

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});




