let cacheName = 'cacheV__0__';




self.addEventListener('install', (e) => 
{
    // e.waitUntil(async () => 
    // {
    //     const cache = await caches.open(cacheName);
    //     await cache.addAll(['cacheall_replacestr']);
    // });
});




self.addEventListener('fetch', e => {

  console.log(e);


  e.respondWith((async () => {
    const r = await caches.match(e.request);
    
    if (r) { 

      return r; 

    } else {

	    console.log("put in a catchall for local images");


	    const cache = await caches.open(cacheName);
	    let substr = e.request.url.substring(e.request.referrer.length);


	    if ([cache_onload_replacestr].includes(substr)) {

        const response = await fetch(e.request);

        if (!response.ok)
          throw new TypeError("Bad response status");

        cache.put(e.request, response.clone());

        return response;

	    } else {

        return fetch(e.request);

	    }

	  }

  })());

});



// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', async (event) => {
    console.log("yarp.  activater")
  //const currentCaches = [cacheName];
  let x = await caches.keys();

  x.forEach(async (c)=> {
    if (c !== cacheName) {
        await caches.delete(c);
    }
  })
});
