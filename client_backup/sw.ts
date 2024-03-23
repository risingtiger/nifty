

let cache_name = 'cacheV__0__';
const SHOULD_CACHE = cache_name.includes("__0__") ? false : true




self.addEventListener('controllerchange', (_e:any) => {
    console.log("controllerchange")
})



self.addEventListener('install', (e: any) => { 

    console.log("install")

    let promise = new Promise(async (res, _rej) => {

        // @ts-ignore
        self.skipWaiting()

        res(1)

    })

    e.waitUntil(promise)

})




self.addEventListener('activate', (e:any) => {

    console.log("activate")

    let promise = new Promise(async (res, _rej) => {

        if (SHOULD_CACHE) {
            let x = await caches.keys();
            
            // just in case there is residue left -- should be cleared out by update method in main.ts
            x.forEach(async (c)=> {
                if (c !== cache_name) 
                    await caches.delete(c);
            })
        }

        // @ts-ignore
        self.clients.claim()

        res(1)

    })

    e.waitUntil(promise)
})




self.addEventListener('fetch', (e:any) => {

    let promise = new Promise(async (res, _rej) => {

        if (SHOULD_CACHE) {

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
        }

        else {
            const r = await fetch(e.request)
            res(r)
        }
    })

    e.respondWith(promise)
})




self.addEventListener('message', async (e:any) => {

    if (SHOULD_CACHE && e.data.command === "load_core") {

        caches.open(cache_name).then(function (cache) {
            cache.add("/")
            cache.add("/index.html")
            cache.add("/app_v"+cache_name.split("__")[1]+".webmanifest")
        })
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




function should_url_be_cached(request:Request) {

    if (request.url.includes(".webmanifest")) {
        return true;
    }

    else if (request.url.includes("/lazy/")) {
        return true;
    }

    else if (request.url.includes("/media/")) {
        return true;
    }

    else {
        return false;
    }

}



