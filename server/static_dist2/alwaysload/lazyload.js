const TIMEOUT_TS = 9000;
let lazyloads = [];
const _loaded = [];
let loadstart_ts = 0;
function LazyLoad(loads) {
    return new Promise(async (res, _rej)=>{
        if (loadstart_ts > 0) {
            console.log("LazyLoad loadstart_ts > 0, returning early.");
            res(true);
            return;
        }
        const loadque = [];
        for (const load of loads){
            conditionally_addtoque(load, loadque);
        }
        if (loadque.length > 0) {
            loadstart_ts = Date.now();
            ticktock();
            await retrieve_loadque(loadque);
            loadstart_ts = 0;
        } else {
            console.log("LazyLoad loadque.length === 0, returning early.");
        }
        res(true);
    });
}
function Init(lazyloads_) {
    lazyloads = lazyloads_;
}
function conditionally_addtoque(load, loadque) {
    if (_loaded.find((l)=>l.type === load.type && l.name === load.name && l.instance === load.instance)) {
        console.log("already loaded", load);
        return;
    }
    if (loadque.find((l)=>l.type === load.type && l.name === load.name && l.instance === load.instance)) {
        return;
    }
    for (const dep of load.dependencies){
        const dep_inst = dep.instance ? dep.instance : null;
        const dep_load = lazyloads.find((l)=>l.type === dep.type && l.name === dep.name && l.instance == dep_inst);
        conditionally_addtoque(dep_load, loadque);
    }
    loadque.push(load);
}
function retrieve_loadque(loadque) {
    return new Promise(async (res, _rej)=>{
        const promises = [];
        const filepaths = loadque.map((l)=>get_filepath(l.type, l.name, l.instance));
        for (const f of filepaths){
            promises.push(import(f).catch((_e)=>throwup_and_leave("lazyload_server_error", `Failed to lazyload ${f}`)));
        }
        await Promise.all(promises);
        res(true);
    });
}
function get_filepath(type, name, instance) {
    let path = instance ? `/assets/client_${instance}/` : "/assets/";
    switch(type){
        case "view":
            path += `lazy/views/${name}/${name}.js`;
            break;
        case "component":
            path += `lazy/components/${name}/${name}.js`;
            break;
        case "thirdparty":
            path += `thirdparty/${name}.js`;
            break;
        case "workers":
            path += `lazy/workers/${name}.js`;
            break;
        case "lib":
            path += `lazy/libs/${name}.js`;
            break;
        case "directive":
            path += `lazy/directives/${name}.js`;
            break;
    }
    return path;
}
function throwup_and_leave(errmsg, errmsg_long = "") {
    localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long);
    window.location.href = `/index.html?errmsg=${errmsg}`;
}
function ticktock() {
    setTimeout(()=>{
        const xel = document.getElementById("lazyload_overlay");
        if (loadstart_ts > 0) {
            const now = Date.now();
            xel.classList.add("active");
            xel.querySelector(".waiting_animate").classList.add("active");
            const istimedout = now - loadstart_ts > TIMEOUT_TS;
            if (istimedout) {
                throwup_and_leave("lazyload_timeout", "Lazyload took too long to load.");
            } else {
                ticktock();
            }
        } else {
            xel.classList.remove("active");
            xel.querySelector(".waiting_animate").classList.remove("active");
        }
    }, 30);
}
window.LazyLoad = LazyLoad;
export default {
    Init
};
