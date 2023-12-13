

type str = string; //type int = number; type bool = boolean;


import { Firestore } from "firebase-admin/firestore";
import { getMessaging }  from "firebase-admin/messaging";




async function WebPush_Add_Subscription(db:Firestore, fcm_token:str, user_email:str, d:any) {

    try {
        const user = await db.collection("users").doc(user_email).get()
        const user_data = user.data()

        const notifies = user_data.notifies || []
        const device = {
            browser: d.client?.name, id: d.device?.id, model: d.device?.model, type: d.device?.type 
        }

        let flg = false
        for (const f of notifies) {
            const fd = f.device
            if (fd.browser === device.browser && fd.id === device.id && fd.model === device.model && fd.type === device.type) {
                f.fcm_token = fcm_token
                flg = true
            }
        }

        if (!flg) {
            notifies.push({fcm_token, device})
        }


        return db.collection("users").doc(user_email).update( {
            notifies
        })
    } 

    catch (err) { throw err }
}




async function WebPush_Send_Msg(db:Firestore, title:str, body:str, tags:str[]) {

    try {
        const all_user_docs = await db.collection("users").get()
        const all_users = all_user_docs.docs.map((d:any)=> d.data())

        const all_subscriptions:any[] = []

        all_users.forEach((u:any)=> {
            if (u.messaging.tags.some((t:any)=> tags.includes(t))) {
                u.notifies.forEach((n:any)=> all_subscriptions.push(n.fcm_token))
            }
        })

        const all_messages = all_subscriptions.map((t:any)=> ( { token:t, data: { title, body } } ) )

        if (all_messages.length === 0) { return new Promise((res, _rej)=> res("No users found to send messages to")) }

        return getMessaging().sendEach(all_messages)
    } 

    catch (err) { throw err }
}




export { WebPush_Add_Subscription, WebPush_Send_Msg }


