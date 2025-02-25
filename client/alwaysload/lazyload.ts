import { bool, str } from "../defs_server_symlink.js";
import { LazyLoadT } from "../defs.js";


const TIMEOUT_TS = 9000;


function importWithTimeout<T>(path: string, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout loading ${path}`));
    }, timeoutMs);

    import(path)
      .then((module: T) => {
        clearTimeout(timer);
        resolve(module);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}


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

	try {
		for(const f of filepaths) {
			// Each file will timeout after 4000 ms (4 seconds)
			promises.push(importWithTimeout(f, 4000));
		}

		await Promise.all(promises);
	}
	catch (err) {
		res(null)
		return
	}

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




export { Run, Init }
