
enum UpdateState { DEFAULT, UPDATING, UPDATED }

let cache_name = 'cacheV__0__';
let cache_version = Number(cache_name.split("__")[1])


const initial_cache_allall = [
	"/",
	"/index.html",
	"/v",
	"/assets/main.js",
	"/assets/main.css",
	"/assets/index.css",
	"app.webmanifest",
]



self.addEventListener('install', (e: any) => { 

    let promise = new Promise(async (res, _rej) => {

        // @ts-ignore
        self.skipWaiting()
        res(1)
    })
    e.waitUntil(promise)
})




self.addEventListener('activate', (e:any) => {

    let promise = new Promise(async (res, _rej) => {

		let cachekeys = await caches.keys();
		cachekeys.forEach(async (c)=> {
			await caches.delete(c);
		})

		const cache = await caches.open(cache_name)
		await cache.addAll([
			"/",
			"/index.html",
			"/v",
			"/assets/main.js",
			"/assets/main.css",
			"/assets/index.css",
			"app.webmanifest",
		])

        res(1)
    })
    e.waitUntil(promise)
})




self.addEventListener('fetch', (e:any) => {

    let promise = new Promise(async (res, _rej) => {

		const cache = await caches.open(cache_name)
		const match_r = await cache.match(e.request)

		if (match_r) { 
			res(match_r) 

		} else {

			if (should_url_be_cached(e.request)) {

				const r = await fetch(e.request)

				if (r.ok)
					cache.put(e.request, r.clone())

				res(r)

			} else {

				const r = await fetch(e.request)
				res(r)
			}
		}
    })

    e.respondWith(promise)
})




self.addEventListener('message', async (e:any) => {

	if (e.data.action === "update") {
		//@ts-ignore
		self.registration?.update()
	}
})




self.addEventListener('push',(e:any)=>{

    if(self.Notification.permission == 'denied'){
        return;
    }

    if(self.Notification.permission == 'default'){
        //
    }

    try{
        const msg = (e.data.json()).data

        const options = {   body: msg.body   };

        e.waitUntil((self as any).registration.showNotification(msg.title,options))

    } catch(err){
        throw new Error('Error in SW: '+err)
    }
})




self.addEventListener('notificationclick', (event:any) => {

    event.waitUntil(
        //(self as any).clients.openWindow("some page")
    )
})

/*
self.addEventListener("pushsubscriptionchange", (event) => {

    const subscription = (self as any).registration.pushManager.subscribe(event.oldSubscription.options)

    .then((subscription) =>
    fetch("register", {
    method: "post",
    headers: {
    "Content-type": "application/json",
    },
    body: JSON.stringify({
    endpoint: subscription.endpoint,
    }),
    }),
    );
    event.waitUntil(subscription);
    },

    false,
)
*/

/*
async function check_update_polling() {

	while (true) {

		await new Promise(r => setTimeout(r, 3000))

		console.log("check_update_polling")
		const response = await fetch('/api/latest_app_version')
		const server_version = Number(await response.text())

		//@ts-ignore
		//self.clients.matchAll().then((clients:any) => {
		//	clients.forEach((client:any) => {
		//		client.postMessage({ msg: "testlog", cache_version, server_version })
		//	})
		//})

		//@ts-ignore
		if (Number(server_version) != cache_version && self.registration && self.registration.update) {
			//@ts-ignore
			self.registration?.update()
		}
    }
}
*/



function should_url_be_cached(request:Request) {

    if (request.url.includes(".webmanifest")) {
        return true;
    }

    else if (request.url.includes("/assets/")) {
        return true;
    }

    else if (request.url.includes("/lazy/")) {
        return true;
    }

    else if (request.url.includes("/media/")) {
        return true;
    }

    else if (request.url.includes("/v/")) {
        return true;
    }

    else {
        return false;
    }

}



