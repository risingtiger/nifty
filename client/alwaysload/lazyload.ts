

import { bool, str } from "../defs_server_symlink.js";
import { LazyLoadT } from "../defs.js";


const TIMEOUT_TS = 9000;



let lazyloads:LazyLoadT[] = [];

const _loaded:LazyLoadT[] = [];

let loadstart_ts = 0;





function Run(loads:LazyLoadT[]) {   return new Promise<number|null>(async (res, _rej)=> {

    if (loadstart_ts > 0) {
        res(1)
        return;
    }

    const loadque:LazyLoadT[] = []

    for(const load of loads) {
        addtoque(load, loadque)
    }

    if (loadque.length > 0) {

        loadstart_ts = Date.now()

        ticktock()

        const r = await retrieve_loadque(loadque)
		if (r === null) { res(null); return; }

        loadstart_ts = 0

    } else {
        console.log("LazyLoad loadque.length === 0, returning early.")
    }

    res(1)
})}




function Init(lazyloads_:LazyLoadT[]) {
    lazyloads = lazyloads_
}




function addtoque(load:LazyLoadT, loadque:LazyLoadT[]) {

	let is_already_loaded = _loaded.find(l=> l.type === load.type && l.name === load.name) 
	if (is_already_loaded !== undefined) {
		return;
	}

	for (const dep of load.dependencies) {
		const dep_load = lazyloads.find(l=> l.type === dep.type && l.name === dep.name)
		if (dep_load === undefined) {
			console.error("LazyLoad dependency not found", dep)
		} else {
			addtoque(dep_load, loadque)
		}
	}

	loadque.push(load)
}




function retrieve_loadque(loadque: LazyLoadT[]) { return new Promise<number|null>(async (res, _rej)=> {

    const promises:Promise<bool>[] = []

    const filepaths = loadque.map(l=> get_filepath(l.type, l.name, l.is_instance))

    for(const f of filepaths) {
        promises.push(import(f).catch((_e)=> { res(null); }))
    }

    await Promise.all(promises)

    res(1)
})}




function get_filepath(type:str, name:str, is_instance:bool|null) {

    let path = is_instance ? `/assets/instance/` : "/assets/"

    switch (type) {
        case "view": 
            path += `lazy/views/${name}/${name}.js`
            break;
        case "component":
            path += `lazy/components/${name}/${name}.js`
            break;
        case "thirdparty":
            path += `thirdparty/${name}.js`
            break;
        case "workers":
            path += `lazy/workers/${name}.js`
            break;
        case "lib":
            path += `lazy/libs/${name}.js`
            break;
        case "directive":
            path += `lazy/directives/${name}.js`
            break;
    }

    return path
}




function throwup_and_leave(errmsg:str, errmsg_long:str="") {

	localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long)
	if (window.location.protocol === "https:") {
		window.location.href = `/index.html?errmsg=${errmsg}`
	} else {
		throw new Error(errmsg + " -- " + errmsg_long)
	}
}




function ticktock() {

    setTimeout(()=> {

        const xel = document.getElementById("lazyload_overlay")!

        if (loadstart_ts > 0) {

            const now = Date.now()

            xel.classList.add("active")

            if (now - loadstart_ts > 1000) {
                xel.querySelector(".waiting_animate")!.classList.add("active")
            } else {
                xel.querySelector(".waiting_animate")!.classList.remove("active")
            }

            const istimedout = now - loadstart_ts > TIMEOUT_TS

            if (istimedout) {
                throwup_and_leave("lazyload_timeout", "Lazyload took too long to load.")
            } else {
                ticktock()
            }
        } else {
            xel.classList.remove("active")
            xel.querySelector(".waiting_animate")!.classList.remove("active")
        }
    }, 20)
}



export { Run, Init }



