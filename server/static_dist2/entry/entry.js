let els = {};
window.addEventListener("load", async (_e)=>{
    if (localStorage.getItem("disable_service_worker") !== "true") {
        setup_service_worker();
    }
    document.getElementById("login_button").addEventListener("click", ()=>{
        show_login();
    });
    const id_token = localStorage.getItem('id_token');
    els = {
        logged_in: document.getElementById("logged_in"),
        logged_out: document.getElementById("logged_out"),
        update: document.getElementById("update"),
        update_progress: document.getElementById("update_progress"),
        update_done: document.getElementById("update_done"),
        login: document.getElementById("login"),
        login_button: document.getElementById("login_button"),
        logout_btn: document.getElementById("logout_button"),
        submit_login_button: document.getElementById("submit_login_button"),
        home_btn: document.getElementById("home_button"),
        login_errormsg: document.getElementById("login_errormsg")
    };
    if (id_token) {
        els.logged_out.classList.remove("active");
        els.logged_in.classList.add("active");
    } else {
        els.logged_out.classList.add("active");
        els.logged_in.classList.remove("active");
    }
    els.login_button.addEventListener("click", ()=>{
        show_login();
    });
    if (window.location.search.includes("errmsg")) {
        let errmsg = window.location.search.split("errmsg=")[1];
        errmsg = decodeURIComponent(errmsg);
        if (errmsg === "not_authorized" || errmsg === "not_signed_in") {
            show_login();
        } else if (errmsg === "lazyload_server_error" || errmsg === "lazyload_overlay") {
            alert("Could Not Lazy Load Item");
        } else if (errmsg === "fetch_lassy_timeout") {
            alert("Fetch Lassy Timeout.");
        } else if (errmsg === "sse_listner_already_exists") {
            alert("Server Side Connection Already Exists.");
        } else if (errmsg === "fetchlassie_not_authorized" || errmsg === "fetchlassie_server_error" || errmsg === "fetchlassie_network_error" || errmsg === "fetchlassie_id_token_missing" || errmsg === "fetchlassie_refresh_auth_failed" || errmsg === "fetchlassie_network_refresh_auth_failed" || errmsg === "fetchlassie_timeout") {
            alert("Fetchlassie Error.");
        } else if (errmsg === "firestorelive_indexeddb_put" || errmsg === "firestorelive_indexeddb_put" || errmsg === "firestorelive_indexeddb_get" || errmsg === "firestorelive_indexeddb_get" || errmsg === "firestorelive_listener") {
            alert("Firestore Live Error.");
        } else if (errmsg === "engagementlisten_already_exists") {
            alert("Engagement Listen Error.");
        } else {
            alert("No Error Type Supplied.");
        }
    } else if (window.location.search.includes("update_done")) {
        document.getElementById("update").classList.add("active");
        document.getElementById("update_progress").classList.remove("active");
        document.getElementById("update_done").classList.add("active");
    }
});
function setup_service_worker() {
    let updated = false;
    let activated = false;
    navigator.serviceWorker.register('sw.js').then((regitration)=>{
        console.log("service worker registered");
        if (window.location.search.includes("update_init")) {
            console.log("update_init");
            document.getElementById("update").classList.add("active");
            document.getElementById("update_progress").classList.add("active");
            document.getElementById("update_done").classList.remove("active");
            regitration.update();
        }
        regitration.addEventListener("updatefound", ()=>{
            console.log("sw updatefound");
            const worker = regitration.installing;
            worker.addEventListener('statechange', ()=>{
                console.log("sw statechange");
                console.log({
                    state: worker.state
                });
                if (worker.state === "activated") {
                    activated = true;
                    checkUpdate();
                }
            });
        });
    });
    navigator.serviceWorker.addEventListener('controllerchange', ()=>{
        console.log("sw controllerchange");
        updated = true;
        checkUpdate();
    });
    navigator.serviceWorker.addEventListener('message', (event)=>{
    /*
		if (event.data.msg === "testlog") {
			const d = event.data
			document.body.insertAdjacentHTML("beforeend", `
				<div>Test Log: 
					cache_version: ${d.cache_version} --- 
					server_version: ${d.server_version} --- 
					entry_version: 3
				</div>`);
		}
		*/ });
    function checkUpdate() {
        if (activated && updated) {
            window.location.href = "/index.html?update_done=1";
        }
    }
}
function show_login() {
    els.login.classList.add("active");
    els.login_button.style.display = "none";
    els.submit_login_button.addEventListener("click", async ()=>{
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=` + window.identity_platform_key;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const body = {
            email,
            password,
            returnSecureToken: true
        };
        const opts = {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const r = await fetch(url, opts);
        const data = await r.json();
        if (data.error) {
            document.getElementById("login_errormsg").classList.add("active");
            document.getElementById("login_errormsg").innerText = data.error.message;
        } else {
            localStorage.setItem('id_token', data.idToken);
            localStorage.setItem('token_expires_at', (Math.floor(Date.now() / 1000) + Number(data.expiresIn)).toString()), localStorage.setItem('refresh_token', data.refreshToken);
            localStorage.setItem('user_email', data.email);
            if (data.email === "accounts@risingtiger.com") localStorage.setItem('auth_group', 'admin');
            else localStorage.setItem('auth_group', 'user');
            window.location.href = '/v#home';
        }
    });
} /*
async function update(round: int) {

        const origin = window.location.origin
        const tohref = "http://www.yavada.com/bouncebacktopurewater?round=" + round + "&origin=" + origin
        const wael = (document.querySelector("#updatevisual > .waiting_animate") as HTMLElement)

        if (round === 1) {

                document.getElementById("updatevisual")!.classList.add("active")
                wael.classList.add("active");
                wael.style.top = "250px";

                const cache = await caches.open(`cacheV__${(window as any).APPVERSION}__`)

                await cache.delete("/")

                let x = await caches.keys();

                x.forEach(async (c) => {
                        await caches.delete(c);
                })

                await serviceworker_reg.update()

                setTimeout(() => {
                        window.location.href = tohref
                }, 1500)
        }

        else if (round === 2) {

                document.getElementById("updatevisual")!.classList.add("active")
                wael.classList.add("active")
                wael.style.top = "250px"

                setTimeout(() => {
                        window.location.href = tohref
                }, 1500)
        }

        else if (round === 3) {

                document.getElementById("updatevisual")!.classList.add("active")
                wael.classList.add("active")
                wael.style.top = "250px"

                setTimeout(() => {
                        window.location.href = "/index.html"
                }, 1500)
        }
}
*/ 
