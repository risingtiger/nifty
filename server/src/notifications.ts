

type str = string; //type int = number; type bool = boolean;

import { FieldValue } from "@google-cloud/firestore"
import { Firestore } from "firebase-admin/firestore";
import { getMessaging }  from "firebase-admin/messaging";




async function Add_Subscription(db:Firestore, fcm_token:str, user_email:str) {

    try {
        return db.collection("users").doc(user_email).update( {
            "notifications.fcm_token": fcm_token
        })
    } 

    catch (err) { throw(err) }
}




async function Remove_Subscription(db:Firestore, user_email:str) {

    try {
        return db.collection("users").doc(user_email).update( {
            "notifications.fcm_token": FieldValue.delete()
        })
    } 

    catch (err) { throw(err) }
}




async function Send_Msg(db:Firestore, title:str, body:str, tags:str[]) {

	return new Promise<number>(async (promise_res, _rej)=> {

		try {
			const all_user_docs = await db.collection("users").get()
			const all_users = all_user_docs.docs.map((d:any)=> d.data())

			const regtokens:any[] = []
			all_users.forEach((u:any)=> {
				if (u.notifications.fcm_token && u.notifications.tags.some((t:any)=> tags.includes(t))) {
					regtokens.push(u.notifications.fcm_token)
				}
			})

			const message  =  { data: { title, body }, tokens: regtokens }
			const response = await getMessaging().sendEachForMulticast(message)

			console.log(`FCM Send Msg success count: ${response.successCount}`)                               
			 
			promise_res(1)
		} 

		catch (err) { promise_res(0) }
	})
}




const Notifications = { Add_Subscription, Remove_Subscription, Send_Msg } 

export default Notifications


