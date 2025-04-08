


enum UpdateState { DEFAULT, UPDATING, UPDATED }


const EXITDELAY = 4000

let cache_name = 'cacheV__0__';
let cache_version = Number(cache_name.split("__")[1])
let id_token = ""
let token_expires_at = 0
let refresh_token = ""
let user_email = ""
let isoffline = false
let is_checking_connectivity = false




self.addEventListener('install', (event:any) => {
	event.waitUntil((async () => {
		console.log("sw.ts install")

		// Optionally, pre-cache any needed static assets here:
		// const cache = await caches.open(CACHE_NAME);
		// await cache.addAll([
		//   '/index.html',
		//   '/main.js',
		//   '/styles.css',
		//   ...
		// ]);

		await (self as any).skipWaiting();
		console.log("sw.ts install - after skipWaiting")
	})());
});


self.addEventListener('activate', (event:any) => {
	event.waitUntil((async () => {
		console.log("sw.ts activate")
		const cacheKeys = await caches.keys();
		for (const key of cacheKeys) {
			if (key !== cache_name) {
				console.log("sw.ts activate - deleting cache: " + key)
				await caches.delete(key);
			}
		}

		await (self as any).clients.claim();
	})());
});




self.addEventListener('controllerchange', (_e:any) => {
})




self.addEventListener('fetch', (e:any) => {

    let promise = new Promise(async (res, _rej) => {

		const cache   = await caches.open(cache_name)
		const match_r = await cache.match(e.request)

		if (match_r) { 
			res(match_r) 

		} else if (isoffline && !e.request.headers.get('retry')) {
			res(new Response(null, { status: 503, statusText: 'Network error' }))
			return

		} else if (e.request.url.includes("/api/")) {

			await authrequest()

			const new_headers = new Headers(e.request.headers);
			new_headers.append('appversion', cache_version.toString())
			new_headers.append('Authorization', `Bearer ${id_token}`)

			const controller = new AbortController();
			const { signal } = controller;
			const exitdelay = e.request.headers.get("exitdelay") || EXITDELAY;
			const timeoutControllerId     = setTimeout(() => { controller.abort(); }, Number(exitdelay));

			const new_request = new Request(e.request, {
				headers: new_headers,
				cache: 'no-store',
				signal
			});

			fetch(new_request)
				.then(async (server_response:any)=> {
					
					isoffline = false;
					clearTimeout(timeoutControllerId)

					if (server_response.status === 401) { // unauthorized
						error_out("sw4", "") // error_out has a setTimeout, so it will circumvent the respondWith
						res(server_response)
					}

					else if (server_response.status === 410) {
						(self as any).clients.matchAll().then((clients:any) => {
							clients.forEach((client: any) => {
								client.postMessage({
									action: 'update_init'
								})
							})
							res(server_response)
						})

					} else if (server_response.status === 200 && server_response.ok) {
						res(server_response)

					} else {
						logit(40, 'swe', server_response.status + " - " + server_response.statusText)
						res(new Response(null, { status: server_response.status, statusText: server_response.statusText }))
					}
				})
				.catch(async (err:any)=> {
					logit(40, 'swe', "fetch catch. url: " + new_request.url + '. errmsg: ' + err.message)
					isoffline = true
					check_connectivity()
					res(new Response(null, { status: 503, statusText: 'Network error' }))
				})

		} else {
			try {
				const controller = new AbortController();
				const { signal } = controller;
				const exitdelay = e.request.headers.get("exitdelay") || EXITDELAY;
				const timeoutId = setTimeout(() => controller.abort(), Number(exitdelay));
				
				const r = await fetch(e.request, { signal });
				clearTimeout(timeoutId);
				
				if (r.ok && should_url_be_cached(e.request))    {
					cache.put(e.request, r.clone());
					isoffline = false;
				}
					
				res(r);

			} catch (error: any) {
				logit(40, 'swe', "fetch catch. url: " + e.request.url + '. errmsg: ' + error.message)
				isoffline = true
				check_connectivity()
				res(new Response(null, { status: 503, statusText: 'Network error' }));
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

	else if (e.data.action === "initial_pass_auth_info") {
		id_token = e.data.id_token;
		token_expires_at = Number(e.data.token_expires_at);
		refresh_token = e.data.refresh_token;
		user_email = e.data.user_email;
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
    if (request.url.includes(".webmanifest") || request.url.includes("/assets/") || request.url.includes("/v/")) {
        return true;
    }
    else {
        return false;
    }
}



function check_connectivity() {

	if (is_checking_connectivity) return

	is_checking_connectivity = true;

	fetch('/api/ping', { cache: 'no-store' })
		.then(response => {
			if (response.ok) {
				isoffline = false;
				is_checking_connectivity = false;
			}
		})
		.catch(_err => {
			setTimeout(check_connectivity, 5000);
		})
}




function authrequest() { return new Promise(async (res,_rej)=> { 

    if (!id_token) {
		error_out("swe", "authrequest no token in browser storage")
        return
    }


    if (Date.now()/1000 > token_expires_at-30) {

        const body = { refresh_token }

        fetch('/api/refresh_auth', {

            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)

        }).then(async r=> {

            let data = await r.json() as any

            if (data.error) {
				error_out("swe", "authrequest refresh failed - " + data.error.message)
            }

            else {
                id_token = data.id_token
                refresh_token = data.refresh_token
                token_expires_at = Math.floor(Date.now()/1000) + Number(data.expires_in);

				(self as any).clients.matchAll().then((clients:any) => {
					clients.forEach((client: any) => {
						client.postMessage({
							action: 'update_auth_info',
							id_token,
							refresh_token,
							token_expires_at
						})
					})
				})


                res(1)
            }

        }).catch(err=> {
			error_out("swe", "authrequest refresh network failed - " + err)
        })
    }

    else {
        res(1)
    }
})}




function error_out(subject:string, errmsg:string="") {

	(self as any).clients.matchAll().then((clients:any) => {
		setTimeout(()=> {
			clients.forEach((client: any) => {
				client.postMessage({
					action: 'error_out',
					subject,
					errmsg
				})
			})
		},100)
	})
}




function logit(type:number, subject:string, msg:string="") {

	(self as any).clients.matchAll().then((clients:any) => {
		setTimeout(()=> {
			clients.forEach((client: any) => {
				client.postMessage({
					action: 'logit',
					type,
					subject,
					msg
				})
			})
		},100)
	})
}



