
//@ts-ignore
//import { initializeApp } from "firebase/app";
//@ts-ignore
//import { getMessaging, getToken  } from "firebase/messaging";




type bool = boolean;  //type str = string; type int = number;   




declare var Lit_Render: any;
declare var Lit_Html: any;
declare var FetchLassie: any;
declare var SetDistCSS: any;




const firebaseConfig = {
    apiKey: "AIzaSyAx0ix0_Yz6RN6_-5kiwU-_uWm4sErpXdw",
    authDomain: "purewatertech.firebaseapp.com",
    databaseURL: "https://purewatertech.firebaseio.com",
    projectId: "purewatertech",
    storageBucket: "purewatertech.appspot.com",
    messagingSenderId: "805737116651",
    appId: "1:805737116651:web:9baada48dc65d9b72c9fae",
    measurementId: "G-5VBS981F9K",
    vapidKey: "BCj4QZByQuDUdWC5ai7S1m5sxAdyVwVu1z4ozyC0EPC_GOKdJkVDCouR4mmmxtReHL8txGHPFV4Z41cAMmgecSg"
}



let firebase_service:any = {}
firebase_service.initializeApp = {}
firebase_service.getMessaging = {}
firebase_service.getToken = {}
firebase_service.app = {}
firebase_service.messaging = {}




type State = {
    is_subscribed: bool,
}


let distcss = `{--distcss--}`;


class VNotifications extends HTMLElement {

    $:any 
    s:State
    shadow:ShadowRoot




    constructor() {   

        super(); 

        this.s = {
            is_subscribed: false,
        }

        this.shadow = this.attachShadow({mode: 'open'});

        SetDistCSS(this.shadow, distcss)
    }




    async connectedCallback() {   

        await loadfirebase()

        navigator.serviceWorker.ready
        .then((registration) => {

            return registration.pushManager.getSubscription()

        }).then(subscription => {
            if (subscription) {
                this.s.is_subscribed = true
            } else {
                this.s.is_subscribed = false
            }
            this.sc()
            setTimeout(()=> {   this.dispatchEvent(new Event('hydrated'))   }, 100)
        })
    }




    sc() {
        Lit_Render(this.template(this.s), this.shadow);
    }




    async Subscribe() {

        navigator.serviceWorker.ready

        .then(async (reg:ServiceWorkerRegistration) => {

            const result = await Notification.requestPermission()

            if (result !== 'granted') {
                throw new Error('Permission not granted for Notification')
            }

            else {

                await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(firebaseConfig.vapidKey)
                })

                firebase_service.messaging = firebase_service.getMessaging()

                const fcm_token = await firebase_service.getToken(firebase_service.messaging, { 
                    serviceWorkerRegistration: reg,
                    vapidKey: firebaseConfig.vapidKey 
                })

                const user_email = localStorage.getItem('user_email')
                await FetchLassie('/api/notifications_add_subscription?user_email=' + user_email + '&fcm_token='+fcm_token, {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    },
                })

                this.s.is_subscribed = true
                this.sc()

                await reg.showNotification('Notification with ServiceWorker', {
                    body: 'Notification with ServiceWorker',
                })
            }
        })
    }




    async Unsubscribe() {

        navigator.serviceWorker.ready

        .then(async (reg:ServiceWorkerRegistration) => {

            reg.pushManager.getSubscription().then((subscription) => {
                subscription!
                  .unsubscribe()
                  .then(async (_successful) => {

                    const user_email = localStorage.getItem('user_email')
                    await FetchLassie('/api/notifications_remove_subscription?user_email=' + user_email, {
                        method: 'GET',
                        headers: {
                            'Content-type': 'application/json'
                        },
                    })

                    this.s.is_subscribed = false
                    this.sc()

                  })
                  .catch((_e) => {
                  });
              });

        }).catch(_ => {
        })
    }




    /*
    request_notification_permission() {

        return new Promise(async (res, rej) => {

            const permission = await Notification.requestPermission()

            if (permission === 'granted') {

                res(true)
            } else {
                rej(false)
            }
        })
    }
    */




    /*
    async subscribe_user_to_push() {

        navigator.serviceWorker.ready
        .then(async registration => {
            const vapid_public_key = 'BE12SQmupb1Zw7Bw5JDgknlHe_3p3MbZWYVd4fhowa_An_-YHcp4joi_8IqEZN4fkLMIviV0PP-DVocfQVnd2vU'

            return registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapid_public_key
            })

        }).then(async subscription => {

            const queryjson = JSON.stringify({
                user_email: localStorage.getItem('user_email'),
                subscription
            })

            await FetchLassie('/api/webpush_add_subscription?fuckyouanyways='+queryjson, {
                method: 'GET',
                headers: {
                    'Content-type': 'application/json'
                },
                //body: JSON.stringify({user_email: "accounts@risingtiger.com", subscriptionL: {a:1}})
                    /*
                body: 
            })

            this.s.is_subscribed = true
            this.sc()
        })
    }
    */




    template = (_s:State) => { return Lit_Html`{--devservercss--}{--html--}`; }; 

}




customElements.define('v-notifications', VNotifications);




function loadfirebase() {   return new Promise(async (res:any, _rej:any)=> {

    const promises = []

    //@ts-ignore
    promises.push(import ("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js") )
    //@ts-ignore
    promises.push(import ("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js") )

    const r:any = await Promise.all(promises)

    console.log(r)

    firebase_service.initializeApp = r[0].initializeApp
    firebase_service.getMessaging = r[1].getMessaging
    firebase_service.getToken = r[1].getToken

    firebase_service.app = firebase_service.initializeApp(firebaseConfig)

    res(true)
})}




function urlBase64ToUint8Array(base64String:any) {

    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}




export {  }


/*
 *

    async subscribe_user_to_push() {

        navigator.serviceWorker.ready

        .then(async registration => {

            const vapid_public_key = 'BCj4QZByQuDUdWC5ai7S1m5sxAdyVwVu1z4ozyC0EPC_GOKdJkVDCouR4mmmxtReHL8txGHPFV4Z41cAMmgecSg'

            await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapid_public_key
            })

            return new Promise((res, _rej) => {
                setTimeout(()=> {   res(1);   }, 1000)
            })

        }).then(_subscription => {

            return new Promise((res, rej) => {

                app = initializeApp(firebaseConfig)
                messaging = getMessaging(app)

                getToken(messaging, { vapidKey: "BCj4QZByQuDUdWC5ai7S1m5sxAdyVwVu1z4ozyC0EPC_GOKdJkVDCouR4mmmxtReHL8txGHPFV4Z41cAMmgecSg" })

                .then(async (currentToken:any) => {

                    if (currentToken) {

                        await FetchLassie('/api/fcm_add_token', {
                            method: 'POST',
                            headers: {
                                'Content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                user_email: localStorage.getItem('user_email'),
                                token: currentToken
                            })
                        })

                        res(true)

                    } else {
                        rej(false)
                    }

                }).catch((err:any) => {
                    rej(false)
                })
            })
                    
        }).then(_ => {

            this.s.is_subscribed = true
            this.sc()

        }).catch(_err => {
            //
        })
    }
*/
