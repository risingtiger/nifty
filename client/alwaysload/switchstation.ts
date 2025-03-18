

import { $NT, LazyLoadT, URIDetailT, LoggerSubjectE } from  "./../defs.js" 
import { str, num } from  "../../defs_server_symlink.js" 
import { Run as LazyLoadRun } from './lazyload.js'
import { AddView as CMechAddView } from "./cmech.js"
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

	if (history.state && history.state.index > 0) {
		await routeChanged(opts.default, 'back');
		history.back();
	}
	else {
		await routeChanged(opts.default, 'back');
		history.replaceState({ index: 0, path: opts.default }, '', opts.default);
	}
}




async function NavigateToSearchParams(newsearchparams:{ [key: string]: string }) {

	const oldsearchparams = new URLSearchParams(window.location.search);
	const currentPath = history.state?.path || window.location.pathname.slice(3);
	
	// Create a new URLSearchParams object from the current search parameters
	const updatedSearchParams = new URLSearchParams(oldsearchparams);
	
	// Update with new search parameters
	Object.entries(newsearchparams).forEach(([key, value]) => {
		updatedSearchParams.set(key, value);
	});
	
	// Create the new path with updated search parameters
	const searchParamsString = updatedSearchParams.toString();
	const newPath = searchParamsString ? `${currentPath}?${searchParamsString}` : currentPath;
	
	// Navigate to the new path
	await NavigateTo(newPath);
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
	promises.push( CMechAddView(route.lazyload_view.name, pathparams, searchparams, localdb_preload, views_attach_point, view_finance_loadremote) )

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




export { Init, AddRoute }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SwitchStation = { NavigateTo, NavigateBack, NavigateToSearchParams };







const view_finance_loadremote = (pathparams:{ [key: string]: string }, searchparams: URLSearchParams, isinitial:boolean) => new Promise<{ [key: string]: string }|null>(async (res, _rej) => {
    try {
        const response = await fetch('https://example.com');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const htmlContent = await response.text();
        console.log('Fetched HTML content:', htmlContent.substring(0, 100) + '...');
		res({examplechunk: htmlContent.substring(0, 100), propa:'placeholder'});
    } catch (error) {
        console.error('Error fetching example.com:', error);
		res(null);
    }
})






