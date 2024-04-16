(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // server/static_dev/lazy/views/notifications/notifications.js
  var firebaseConfig = {
    apiKey: "AIzaSyAx0ix0_Yz6RN6_-5kiwU-_uWm4sErpXdw",
    authDomain: "purewatertech.firebaseapp.com",
    databaseURL: "https://purewatertech.firebaseio.com",
    projectId: "purewatertech",
    storageBucket: "purewatertech.appspot.com",
    messagingSenderId: "805737116651",
    appId: "1:805737116651:web:9baada48dc65d9b72c9fae",
    measurementId: "G-5VBS981F9K",
    vapidKey: "BCj4QZByQuDUdWC5ai7S1m5sxAdyVwVu1z4ozyC0EPC_GOKdJkVDCouR4mmmxtReHL8txGHPFV4Z41cAMmgecSg"
  };
  var firebase_service = {};
  firebase_service.initializeApp = {};
  firebase_service.getMessaging = {};
  firebase_service.getToken = {};
  firebase_service.app = {};
  firebase_service.messaging = {};
  var distcss = `h2{font-size:15px;padding-bottom:16px}
`;
  var VNotifications = class extends HTMLElement {
    $;
    s;
    shadow;
    constructor() {
      super();
      this.s = {
        is_subscribed: false
      };
      this.shadow = this.attachShadow({
        mode: "open"
      });
      SetDistCSS(this.shadow, distcss);
    }
    async connectedCallback() {
      await loadfirebase();
      navigator.serviceWorker.ready.then((registration) => {
        return registration.pushManager.getSubscription();
      }).then((subscription) => {
        if (subscription) {
          this.s.is_subscribed = true;
        } else {
          this.s.is_subscribed = false;
        }
        this.sc();
        setTimeout(() => {
          this.dispatchEvent(new Event("hydrated"));
        }, 100);
      });
    }
    sc() {
      Lit_Render(this.template(this.s), this.shadow);
    }
    async Subscribe() {
      navigator.serviceWorker.ready.then(async (reg) => {
        const result = await Notification.requestPermission();
        if (result !== "granted") {
          throw new Error("Permission not granted for Notification");
        } else {
          await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(firebaseConfig.vapidKey)
          });
          firebase_service.messaging = firebase_service.getMessaging();
          const fcm_token = await firebase_service.getToken(firebase_service.messaging, {
            serviceWorkerRegistration: reg,
            vapidKey: firebaseConfig.vapidKey
          });
          const user_email = localStorage.getItem("user_email");
          await FetchLassie("/api/notifications_add_subscription?user_email=" + user_email + "&fcm_token=" + fcm_token, {
            method: "GET",
            headers: {
              "Content-type": "application/json"
            }
          });
          this.s.is_subscribed = true;
          this.sc();
          await reg.showNotification("Notification with ServiceWorker", {
            body: "Notification with ServiceWorker"
          });
        }
      });
    }
    async Unsubscribe() {
      navigator.serviceWorker.ready.then(async (reg) => {
        reg.pushManager.getSubscription().then((subscription) => {
          subscription.unsubscribe().then(async (_successful) => {
            const user_email = localStorage.getItem("user_email");
            await FetchLassie("/api/notifications_remove_subscription?user_email=" + user_email, {
              method: "GET",
              headers: {
                "Content-type": "application/json"
              }
            });
            this.s.is_subscribed = false;
            this.sc();
          }).catch((_e) => {
          });
        });
      }).catch((_) => {
      });
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
    template = (_s) => {
      return Lit_Html`

<header class="viewheader">
    <a class="left" @click="${()=>window.location.hash='home'}"><span>‸</span><span>home</span></a>
    <div class="middle"><h1>Sign Up for Notifications</h1></div>
    <div class="right">
        &nbsp;
    </div>
</header>


<div class="content">
    <div style="text-align:center; padding-top: 30px;">

        ${_s.is_subscribed ? Lit_Html`
            <h2>This Device is subscribed to notifications</h2>
            <button class="btn" @click="${()=>this.Unsubscribe()}">Unsubscribe</button>
        ` : Lit_Html`
            <h2>This Device is not subscribed to notifications</h2>
            <button class="btn" @click="${()=>this.Subscribe()}">Subscribe</button>
        `}

    </div>

</div>



`;
    };
  };
  customElements.define("v-notifications", VNotifications);
  function loadfirebase() {
    return new Promise(async (res, _rej) => {
      const promises = [];
      promises.push(import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js"));
      promises.push(import("https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging.js"));
      const r = await Promise.all(promises);
      console.log(r);
      firebase_service.initializeApp = r[0].initializeApp;
      firebase_service.getMessaging = r[1].getMessaging;
      firebase_service.getToken = r[1].getToken;
      firebase_service.app = firebase_service.initializeApp(firebaseConfig);
      res(true);
    });
  }
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
})();
