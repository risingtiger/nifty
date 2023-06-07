

let cacheName = 'cacheV__0__';

const CACHE_FILES = [ 'main.js', 'index.html', 'main.css', 'app.webmanifest' ]



self.addEventListener('install', (_e) => 
{
    // e.waitUntil(async () => 
    // {
    //     const cache = await caches.open(cacheName);
    //     await cache.addAll(['cacheall_replacestr']);
    // });
});




self.addEventListener('fetch', e => {

    e.respondWith((async () => {

        const r = await caches.match(e.request);

        if (r) { 

            return r; 

        } else {

            const cache = await caches.open(cacheName)

            let substr = e.request.url.substring(e.request.referrer.length)

            if (should_url_be_cached(substr)) {

                const response = await fetch(e.request)

                if (!response.ok)
                    throw new TypeError("Bad response status")

                cache.put(e.request, response.clone())

                return response

            } else {

                return fetch(e.request)

            }

	    }

    })());

});



// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', async (_event) => {
  //const currentCaches = [cacheName];
  let x = await caches.keys();

  x.forEach(async (c)=> {
    if (c !== cacheName) {
        await caches.delete(c);
    }
  })
});




function should_url_be_cached(urlstr) {

    if (urlstr.includes("lazy")) {
        return true;
    }

    else if (urlstr.includes("images")) {
        return true;
    }

    else if (CACHE_FILES.includes(urlstr)) {
        return true;
    }

    else {
        return false;
    }

}




