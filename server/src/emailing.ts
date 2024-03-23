

type str = string; //type int = number; type bool = boolean;


//import { getMessaging }  from "firebase-admin/messaging";




async function Send(to: str, subject: str, message: str, from: str = "") {

    const url = 'https://api.mailjet.com/v3.1/send';
    const username = '2269ce42acdd34698b46f64ac7c66bde';
    const password = '9e1aa816f58fcd7a0606491a0efa63c2';

    const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    const data = {
        Messages: [
            {
                From: {
                    Email: "accounts@risingtiger.com",
                    Name: "RTM"
                },
                To: [
                    {
                        Email: to,
                        Name: "To whom it may concern"
                    }
                ],
                Subject: subject,
                TextPart: message,
                HTMLPart: `<p>${message}</p>`
            }
        ]
    }

    const fetchres = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
        },
        body: JSON.stringify(data)
    })

    const res = await fetchres.json();

    return true;
}




const Emailing = { Send }

export default Emailing;


