

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

    const initialPath = window.location.pathname.slice(3)

    if (!history.state || history.state.index === undefined) {
		await routeChanged(initialPath, 'firstload');
        history.replaceState({ index: 0, path: initialPath }, '', initialPath);
    } else {
		await routeChanged(history.state.path, 'firstload');
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

	const newhistoryurl = window.location.pathname.slice(3) + '?' + searchparams_str;

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










const loady_a = (_pathparams:GenericRowT, _searchparams: URLSearchParams) => new Promise<Map<str,GenericRowT[]>>(async (res, _rej) => {

	const a = new Map<str,GenericRowT[]>()

	a.set("testy1", [{testy1:1}, {testy1:2}])
	a.set("testy2", [{testy2:10}, {testy2:20}])

	res(a)	
})

const loady_b = (_pathparams:GenericRowT, _old_searchparams: URLSearchParams, _new_searchparams: URLSearchParams) => new Promise<Map<str,GenericRowT[]>>(async (res, _rej) => {

	const a = new Map<str,GenericRowT[]>()

	a.set("b_testy1", [{testy1:1}, {testy1:2}])
	a.set("b_testy2", [{testy2:10}, {testy2:20}])

	res(a)
})

