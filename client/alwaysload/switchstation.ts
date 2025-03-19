

import { $NT, GenericRowT, LazyLoadT, URIDetailT, LoggerSubjectE } from  "./../defs.js" 
import { str, num } from  "../../defs_server_symlink.js" 
import { Run as LazyLoadRun } from './lazyload.js'
import { AddView as CMechAddView, SearchParamsChanged as CMechSearchParamsChanged } from "./cmech.js"
import { RegExParams, GetPathParams } from "./switchstation_uri.js"

declare var $N: $NT;

type Route = {
	lazyload_view: LazyLoadT
	path_regex: RegExp
	pathparams_propnames: Array<str>
}

let isSwipeBackGesture   = false;
let _routes:Array<Route> = [];




const Init = async ()=> {

	const pathname     = window.location.pathname.slice(3)
    const searchParams = window.location.search ? window.location.search : '';
    const initialPath  = window.location.pathname + searchParams;

    if (!history.state || history.state.index === undefined) {
		await routeChanged(pathname, 'firstload');
        history.replaceState({ index: 0, path: initialPath  }, '', initialPath);
    } else {
		await routeChanged(pathname, 'firstload');
    }


	window.addEventListener("touchstart", (e: TouchEvent) => {
		const touch = e.touches[0];
		if (touch.clientX < 50 && touch.clientY > 60) {
			isSwipeBackGesture = true;
		}
	})


	window.addEventListener("touchmove", (_e: TouchEvent) => {
	})


	window.addEventListener("touchend", () => {
		setTimeout(() => isSwipeBackGesture = false, 600)
	})


	window.addEventListener("popstate", async (e) => {
		if (e.state) routeChanged(e.state.path, 'back')
	})
}




const AddRoute = (lazyload_view:LazyLoadT)=> {
	const {regex, paramnames: pathparams_propnames} = RegExParams(lazyload_view.urlmatch!)
	_routes.push({ lazyload_view, path_regex: regex, pathparams_propnames })
}




async function NavigateTo(newPath: string) {
    const r = await routeChanged(newPath, 'forward');
	if (r === null) { 
		$N.ToastShow("Couldnt navigate to page", 4, 5000000)
		return; 
	}

    history.pushState({ index: history.state.index+1, path: newPath }, '', newPath);
}




async function NavigateBack(opts:{ default:str}) {


	console.log(`
	NEED TO HANDLE THIS SO THAT IF NAVIGATING BACK, BUT BACK IS JUST A SEARCHPARAMS CHANGE, THEN DONT CALL routeChanged
	just call CMechUpdateFromSearchParams
	`)

	if (history.state && history.state.index > 0) {
		await routeChanged(opts.default, 'back');
		history.back();
	}
	else {
		await routeChanged(opts.default, 'back');
		history.replaceState({ index: 0, path: opts.default }, '', opts.default);
	}
}




async function NavigateToSearchParams(newsearchparams:GenericRowT) {

	const searchparams = new URLSearchParams(window.location.search);
	Object.entries(newsearchparams).forEach(([key, value]) => {
		searchparams.set(key, value);
	});

	const searchparams_str = searchparams.toString();

	const newhistoryurl = window.location.pathname + '?' + searchparams_str;

    history.pushState({ index: history.state.index+1, path: newhistoryurl }, '', newhistoryurl);
    
	CMechSearchParamsChanged(new URLSearchParams(newsearchparams))
}




function HandleLocalDBSyncUpdateTooLarge() {
	$N.ToastShow("LocalDB Sync Too Large", 4, 5000000)
}




const routeChanged = (path: string, direction:'firstload'|'back'|'forward' = 'firstload') => new Promise<num|null>(async (res, _rej) => {

	const viewsel            = document.getElementById("views") as HTMLElement;

    const [urlmatches, routeindex] = get_route_uri(path);

    if (direction === "firstload") {

		const loadresult = await routeload(routeindex, path, urlmatches, "beforeend");

		if (loadresult === 'failed') {
			$N.Unrecoverable("Error", "Could Not Load Page", "Reset App", `/index.html?error_subject=${LoggerSubjectE.switch_station_route_load_fail}`)
			res(null);
			return;
		}

		( viewsel.children[0] as HTMLElement ).style.display = "block";

		document.querySelector("#views")!.dispatchEvent(new Event("visibled"));
    }

    else if (direction === "forward") {

		const loadresult = await routeload(routeindex, path, urlmatches, "beforeend");

		if (loadresult === 'failed') {
			res(null);
			return;
		}

        const activeview = viewsel.children[viewsel.children.length - 1] as HTMLElement;
        activeview.classList.add("next_startstate");
        activeview.style.display = "block";
        activeview.offsetHeight; // force reflow
        activeview.classList.remove("next_startstate");

        const previousview = activeview.previousElementSibling as HTMLElement;
        if (previousview) {
            previousview.classList.add("previous_endstate");
        }

        activeview.addEventListener("transitionend", function activeTransitionEnd() {
            if (previousview) {
                previousview.style.display = "none";
            }
            activeview.removeEventListener("transitionend", activeTransitionEnd);

			document.querySelector("#views")!.dispatchEvent(new Event("visibled"));
        });
    }

    else if (direction === "back") {

        const activeview = viewsel.children[viewsel.children.length - 1] as HTMLElement;
        let previousview = activeview?.previousElementSibling as HTMLElement;


        if (isSwipeBackGesture) {
            activeview.remove();
			previousview.classList.remove("previous_endstate");
			await new Promise((res, _rej) => setTimeout(res, 100));
			previousview.style.display = "block";
            document.querySelector("#views")!.dispatchEvent(new Event("view_load_done"));
            res(1);
            return;
        }

        if (!previousview) {
			const loadresult = await routeload(routeindex, path, urlmatches, "afterbegin");

            if (loadresult === "failed") {
				$N.Unrecoverable("Error", "Could Not Load Page", "Reset App", `/index.html?error_subject=${LoggerSubjectE.switch_station_route_load_fail}`)
				res(null);
				return;
            }
            previousview = activeview?.previousElementSibling as HTMLElement;
        }

		previousview.style.display = "block";
        activeview.offsetHeight; // force reflow
        activeview.classList.add("active_endstate");
        previousview.classList.remove("previous_endstate");

        activeview.addEventListener("transitionend", function activeTransitionEnd() {
            activeview.remove();
            const previous_previousview = previousview?.previousElementSibling as HTMLElement;
            if (previous_previousview) {
            }
            activeview.removeEventListener("transitionend", activeTransitionEnd);

			document.querySelector("#views")!.dispatchEvent(new Event("visibled"));
        });
    }

	res(1);
})




const routeload = (routeindex:num, uri:str, urlmatches:str[], views_attach_point:'beforeend'|'afterbegin') => new Promise<string>( async (res, _rej) => {
	 
	const route           = _routes[routeindex];

	const pathparams      = GetPathParams(route.pathparams_propnames, urlmatches);
	const searchparams    = new URLSearchParams(window.location.search);

	const localdb_preload = route.lazyload_view.localdb_preload

	const promises:Promise<any>[] = []

	promises.push( LazyLoadRun([route.lazyload_view]) )
	promises.push( CMechAddView(route.lazyload_view.name, pathparams, searchparams, localdb_preload, views_attach_point, loady_a, loady_b) )

	const r = await Promise.all(promises)

	if (r[0] === null || r[1] === null) { res('failed'); return; }

	res('success')
})




function get_route_uri(url: str) : [Array<str>, num] {

    for (let i = 0; i < _routes.length; i++) {

		let urlmatchstr = url.match(_routes[i].path_regex)

		if (urlmatchstr) { 
			return [ urlmatchstr.slice(1), i ]
		}
    }

    // catch all -- just route to home
    return [ [], _routes.findIndex(r=> r.lazyload_view.name==="home")! ]
}




export { Init, AddRoute, HandleLocalDBSyncUpdateTooLarge }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SwitchStation = { NavigateTo, NavigateBack, NavigateToSearchParams };










const finance_loady_a = (_pathparams:GenericRowT, _searchparams: URLSearchParams) => new Promise<null|Map<str,GenericRowT[]>>(async (res, _rej) => {
	const a = new Map<str,GenericRowT[]>()
	a.set("testy1", [{testy1:1}, {testy1:2}])
	a.set("testy2", [{testy2:10}, {testy2:20}])
	res(a)	
})

const finance_loady_b = (_pathparams:GenericRowT, _old_searchparams: URLSearchParams, _new_searchparams: URLSearchParams) => new Promise<Map<str,GenericRowT[]>>(async (res, _rej) => {
	const a = new Map<str,GenericRowT[]>()
	a.set("b_testy1", [{testy1:1}, {testy1:2}])
	a.set("b_testy2", [{testy2:10}, {testy2:20}])
	res(a)
})




const addtr_loady_a = (_pathparams:GenericRowT, _searchparams: URLSearchParams) => new Promise<null|Map<str,GenericRowT[]>>(async (res, _rej) => {
	const a = new Map<str,GenericRowT[]>()

	const ynabraw = await $N.FetchLassie('/api/xen/finance/get_ynab_raw_transactions', {})
	if (ynabraw === null) { res(null); return; }

	a.set("ynabraw", ynabraw as GenericRowT[])

	res(a)	
})

const addtr_loady_b = (_pathparams:GenericRowT, _old_searchparams: URLSearchParams, _new_searchparams: URLSearchParams) => new Promise<Map<str,GenericRowT[]>>(async (res, _rej) => {
	const a = new Map<str,GenericRowT[]>()
	a.set("b_testy1", [{testy1:1}, {testy1:2}])
	a.set("b_testy2", [{testy2:10}, {testy2:20}])
	res(a)
})






const getAllPromise = (objectStore:IDBObjectStore) => new Promise((res, rej) => {
	const request = objectStore.getAll();
	request.onsuccess = (ev:any) => res(ev.target.result);
	request.onerror   = (ev:any) => rej(ev.target.error);
})


const indexeddb_graball = (objectstore_names:str[]) => new Promise<Map<str,GenericRowT[]>|null>(async (res, _rej) => {

	const db = await openindexeddb()

	const returns:Map<str,GenericRowT[]> = new Map<str,GenericRowT[]>() // key being the objectstore name

	const transaction             = db.transaction(objectstore_names, 'readonly');

	const promises:Promise<any>[] = []

	for (const objectstore_name of objectstore_names) {
		const objectstore = transaction.objectStore(objectstore_name)
		promises.push(getAllPromise(objectstore))
	}

	const r = await Promise.all(promises)
		.catch((_e) => { 
			res(null); 
			return null; 
		})

	if (r === null) return; // Early return if Promise.all failed

	const transaction_store       = transaction.objectStore('transactions');
	const cat_store               = transaction.objectStore('cats');
	const source_store            = transaction.objectStore('sources');

	const t1 = performance.now()

	const cats_request    = cat_store.getAll();
	const sources_request = source_store.getAll();
	
	const catsPromise = new Promise<any[]>((resolveC, rejectC) => {
		cats_request.onsuccess = () => {
			resolveC(cats_request.result);
		};
		cats_request.onerror = () => {
			rejectC('Error fetching cats');
		};
	});

	const sourcesPromise = new Promise<any[]>((resolveC, rejectC) => {
		sources_request.onsuccess = () => {
			resolveC(sources_request.result);
		};
		sources_request.onerror = () => {
			rejectC('Error fetching sources');
		};
	});

	let count = 0;
	transaction_store.openCursor().onsuccess = (event) => {
		const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
		
		if (cursor && count < 100) {
			const transaction = cursor.value;
			transactions.push(transaction);
			count++;
			cursor.continue();
		} else {

			Promise.all([catsPromise, sourcesPromise]).then((results) => {
				const t2 = performance.now()
				console.log("100testdb_a time: " + (t2 - t1));
				cats = results[0];
				sources = results[1];
				resolve({transactions, cats, sources});
			}).catch(error => {
				console.error(error);
				reject(error);
			});
		}
	}
})




const testdb_b = () => new Promise(async (resolve, reject) => {

	const db = await openindexeddb()

	let  transactions: any[]      = [];
	let  cats:any[]               = [];
	let  sources:any[]            = [];
	let  cat_ids:Set<string>      = new Set<string>();
	let  source_ids:Set<string>   = new Set<string>();
        
	const transaction             = db.transaction(['transactions', 'cats','sources'], 'readonly');
	const transaction_store       = transaction.objectStore('transactions');
	const cat_store               = transaction.objectStore('cats');
	const source_store            = transaction.objectStore('sources');

	const t1 = performance.now()

	transaction_store.openCursor().onsuccess = (event) => {
		const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
		
		if (cursor) {
			const transaction = cursor.value;
			transactions.push(transaction);
			
			// Process cat if not already processed
			if (!cat_ids.has(transaction.cat)) {
				const cat_request = cat_store.get(transaction.cat);
				
				cat_request.onsuccess = () => {
					cats.push(cat_request.result)	
					cat_ids.add(transaction.cat)
				};
				
				cat_request.onerror = () => {
					console.error('Error retrieving cat:', cat_request.error);
				};
			}
			
			// Process source if not already processed
			if (!source_ids.has(transaction.source)) {
				const source_request = source_store.get(transaction.source);
				
				source_request.onsuccess = () => {
					sources.push(source_request.result)	
					source_ids.add(transaction.source)
				};
				
				source_request.onerror = () => {
					console.error('Error retrieving source:', source_request.error);
				};
			}

			cursor.continue();
		} else {
			const t2 = performance.now()
			console.log("-testdb_b time: " + (t2 - t1));

			resolve({transactions, cats, sources});
		}
	}
})




const openindexeddb = () => new Promise<IDBDatabase>(async (res,_rej)=> {

	let dbconnect = indexedDB.open('xenition', 4)

	dbconnect.onerror = (event:any) => { 
		console.log("IndexedDB Error - " + event.target.errorCode)
	}

	dbconnect.onsuccess = async (event: any) => {
		event.target.result.onerror = (event:any) => {
			console.log("IndexedDB Error - " + event.target.errorCode)
		}
		const db = event.target.result
		res(db)
	}
})


