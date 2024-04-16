

import { bool, str,  LazyLoadT } from "../definitions.js";




const TIMEOUT_TS = 9000;



let lazyloads:LazyLoadT[] = [];

const _loaded:LazyLoadT[] = [];

let loadstart_ts = 0;





function LazyLoad(loads:LazyLoadT[]) {   return new Promise<bool>(async (res, _rej)=> {

    if (loadstart_ts > 0) {
        console.log("LazyLoad loadstart_ts > 0, returning early.")
        res(true)
        return;
    }

    const loadque:LazyLoadT[] = []

    for(const load of loads) {
        conditionally_addtoque(load, loadque)
    }

    if (loadque.length > 0) {
        console.log("LazyLoad loadque.length > 0, starting load.")

        loadstart_ts = Date.now()

        ticktock()

        await retrieve_loadque(loadque)

        loadstart_ts = 0

    } else {
        console.log("LazyLoad loadque.length === 0, returning early.")
    }

    res(true)
})}




function Init(lazyloads_:LazyLoadT[]) {
    lazyloads = lazyloads_
}




function conditionally_addtoque(load:LazyLoadT, loadque:LazyLoadT[]) {

    if (_loaded.find(l=> l.type === load.type && l.name === load.name && l.instance === load.instance)) {
        console.log("already loaded", load)
        return;
    }

    if (loadque.find(l=> l.type === load.type && l.name === load.name && l.instance === load.instance)) {
        console.log("already in que", load)
        return;
    }

    for (const dep of load.dependencies) {

        const dep_inst = dep.instance ? dep.instance : null;
        const dep_load = lazyloads.find(l=> l.type === dep.type && l.name === dep.name && l.instance == dep_inst)!
        conditionally_addtoque(dep_load, loadque)
    }

    loadque.push(load)
}




function retrieve_loadque(loadque: LazyLoadT[]) { return new Promise<bool>(async (res, _rej)=> {

    const promises:Promise<bool>[] = []

    const filepaths = loadque.map(l=> get_filepath(l.type, l.name, l.instance))

    for(const f of filepaths) {
        promises.push(import(f).catch((_e)=> throwup_and_leave(f)))
    }

    await Promise.all(promises)

    res(true)
})}




function get_filepath(type:str, name:str, instance:str|null) {

    let path = instance ? `/assets/client_${instance}/` : "/assets/"
    let appversion_str = (window as any).APPVERSION > 0 ? `_v${(window as any).APPVERSION}` : "" 

    switch (type) {
        case "view": 
            path += `lazy/views/${name}/${name}${appversion_str}.js`
            break;
        case "component":
            path += `lazy/components/${name}/${name}${appversion_str}.js`
            break;
        case "thirdparty":
            path += `thirdparty/${name}${appversion_str}.js`
            break;
        case "lib":
            path += `lazy/lib/${name}${appversion_str}.js`
            break;
    }

    return path
}




function throwup_and_leave(fpath:str) {

    const errmsg = encodeURIComponent(`Unable to Lazy Load Js: ${fpath}`)

    console.info(`/?errmsg=${errmsg}`)

    if (!window.location.href.includes("localhost")) {
        window.location.href = `/?errmsg=${errmsg}`
    }
}




function ticktock() {

    setTimeout(()=> {
        console.log("ticktock 50ms")

        if (loadstart_ts > 0) {

            const now = Date.now()

            document.getElementById("loadviewoverlay")!.classList.add("active")
            document.getElementById("waiting_animate")!.classList.add("active")

            const istimedout = now - loadstart_ts > TIMEOUT_TS

            if (istimedout) {
                throwup_and_leave("")
            } else {
                ticktock()
            }
        } else {
            document.getElementById("loadviewoverlay")!.classList.remove("active")
            document.getElementById("waiting_animate")!.classList.remove("active")
        }
    }, 350)
}




(window as any).LazyLoad = LazyLoad;

export default { Init }




