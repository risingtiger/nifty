
/*type int = number;*/ /*type bool = boolean;*/ type str = string

'use strict';


let cb = (_path:str, _data:any):void=> {}

type Snapshot_Subscriptions = {
    path:str,
    unsubscribe:()=>void
}

const snapshot_subscriptions:Snapshot_Subscriptions[] = []





function Hook_Update_Event(callback: (path:str, data:any)=>void) {
    cb = callback
}




function Listen_To(db:any, path:string) { return new Promise<any>((res, _rej)=> {

    const is_existing_snapshot_subscription = snapshot_subscriptions.find(s=> s.path === path)

    if (is_existing_snapshot_subscription) {
        res(1)
        return
    }


    const obj = create_get_obj(db, path) 
    let has_initiated = false

    const unscubscribe = obj.onSnapshot((snapshot:any)=> {

        if (!has_initiated) {
            has_initiated = true
            return
        }

        const docs:{change_type:str,id:str,data:str}[] = []

        snapshot.docChanges().forEach((change:any) => {

            if (change.type === "added") {
                docs.push({change_type: "added", id:change.doc.id, data:change.doc.data()})
            }

            if (change.type === "modified") {
                docs.push({change_type: "modified", id:change.doc.id, data:change.doc.data()})
            }

            if (change.type === "removed") {
                docs.push({change_type: "removed", id:change.doc.id, data:change.doc.data()})
            }
        })

        cb(path, docs)
    })

    snapshot_subscriptions.push({ path, unsubscribe: unscubscribe })

    res(1)
})}




function Is_Authenticated(fetch:any, id_token:string) { return new Promise((res, rej)=> {

    const body = { idToken: id_token }

    fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)

    }).then(async (r:any)=> {

        let users:any = await r.json()

        if (users.error) {
            rej(users.errors[0].message)
        } else {
            res(users.users[0])
        }

    }).catch((err:any)=> {
        rej(err)
    })
})}




function Prune_Listeners_Not_In_Paths(paths:string[]) {

    const paths_to_remove = snapshot_subscriptions.filter(s=> !paths.find(p=>p === s.path))

    for (let i = 0; i < paths_to_remove.length; i++) {
        paths_to_remove[i].unsubscribe()
        snapshot_subscriptions.splice(snapshot_subscriptions.indexOf(paths_to_remove[i]), 1)
    }
}




function create_get_obj(db:any, path:string) {

    const parts = path.split("/")
    let obj = db

    for(let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) { // collection
            obj = obj.collection(parts[i])
        }
        else { // doc
            obj = obj.doc(parts[i])
        }
    }

    return obj
}




const Firestore = { Listen_To, Hook_Update_Event, Is_Authenticated, Prune_Listeners_Not_In_Paths }
export { Firestore }



