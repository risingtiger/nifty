

import { str } from './defs.js'



//import { getMessaging }  from "firebase-admin/messaging";




async function Send(messages:any[]) {

    const url = 'https://api.mailjet.com/v3.1/send';
    const username = "2269ce42acdd34698b46f64ac7c66bde";

    let password = process.env["MAILJET_PASS"]

    const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    const data = {
        Messages: messages
    }

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(data)
    })

    //const res = await fetchres.json();

    return true;
}




const Emailing = { Send }

export default Emailing;


