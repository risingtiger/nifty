

import { LazyLoadT, FirestoreLoadSpecT, URIDetailT } from  "../../defs.js" 
import { str } from  "../../defs_server_symlink.js" 
import { Run as LazyLoadRun } from '../lazyload.js'
import { AddView as CMechAddView } from "../cmech.js"

let   cancelhashload = false;
const view_load_done_event = new Event("view_load_done");
let   _currentHistoryIndex: number = 0;





class Route {

    lazyload_view: LazyLoadT
    path_regex: RegExp
    path_paramnames: Array<str>




    constructor(lazyload_view_: LazyLoadT) {
        this.lazyload_view = lazyload_view_

		const {regex, paramnames} = grabregexparams(this.lazyload_view.urlmatch!)

        this.path_regex      = regex
        this.path_paramnames = paramnames
    }




    load(uri:str, urlmatches:Array<str>, views_attach_point:"beforeend"|"afterbegin") { 

        return new Promise<string>( async (res, _rej) => {

			let uriparams = {}
			for (let i = 0; i < urlmatches.length; i++) {
				const val = urlmatches[i]
				const name = this.path_paramnames[i]
				uriparams[name] = val
			}

			const uridetails:URIDetailT = { uri, params: uriparams }

			const loadspecs:FirestoreLoadSpecT = new Map()
			this.lazyload_view.loadspecs?.forEach(ls => {
				let path = ls.path
				for (const [key, value] of Object.entries(uridetails.params)) {
					path = path.replace(`:${key}`, `${value}`)
				}
				loadspecs.set(path, {name:ls.name, opts:ls.opts, els:ls.els} )
			})

			const promises:Promise<any>[] = []

            promises.push( LazyLoadRun([this.lazyload_view]) )
			promises.push( CMechAddView(this.lazyload_view.name, loadspecs, views_attach_point) )


			const r = await Promise.all(promises)

			if (r[0] === null || r[1] === null) { res('failed'); return; }

			res('success')
        })
    }
}




let _routes:Array<Route> = [];




const Init = ()=> {

    // Listen for popstate events which are triggered by back/forward or swipe gestures
    window.addEventListener('popstate', (e) => {
        // Get the current clean path from the browser location
        const newPath = window.location.pathname;
        // Trigger our route change handler with the new path
        routeChanged(newPath);
    });

    // Initialize with current path
    const initialPath = window.location.pathname === "/" ? "home" : window.location.pathname;
    // If no state exists, initialize it to index 0
    if (!history.state || history.state.index === undefined) {
        history.replaceState({ index: 0 }, '', initialPath);
        _currentHistoryIndex = 0;
    } else {
        _currentHistoryIndex = history.state.index;
    }
    routeChanged(initialPath);
}




const AddRoute = (lazyload_view:LazyLoadT)=> {
    _routes.push(new Route(lazyload_view))
}




/**
 * Navigates back using the browser's History API.
 * This supports both the native back button and mobile swipe gestures.
 */
function Back() {
    history.back();
}




/**
 * Navigates to a new route by pushing a clean URL into the browser history.
 * Also triggers the route change handling (e.g., loading and animating the new view).
 * @param path - The new clean URL path (e.g. "/home", "/users/123").
 */
function navigateTo(path: string) {
    // Increment the history index
    const newIndex = _currentHistoryIndex + 1;
    // Push the new state with the new index and a clean URL
    history.pushState({ index: newIndex }, '', path);
    _currentHistoryIndex = newIndex;
    // Trigger handling of the new route
    routeChanged(path);
}




function grabregexparams(original_matchstr:string) {
	const pathparamnames: Array<str> = [];
	const pattern = original_matchstr.replace(/:([a-z][a-z_0-9]+)/g, (_match, pathparamname) => {
		pathparamnames.push(pathparamname);
		return '([a-zA-Z0-9_]+)';
	});

	const regex      = new RegExp(pattern);
	const paramnames = pathparamnames;

	return {regex, paramnames}
}




function load_and_attach_route(url: str, views_attach_point:"beforeend"|"afterbegin") {   return new Promise<string>(async (res, _rej)=> {

    const [ urlm, route ] = load_and_attach_route___set_match_and_get_match_and_route(url);

    route.load(url, urlm, views_attach_point).then((result:string)=> {   
		if (result === 'failed') {
			res('failed')
		} else if ( result === 'success' ) {
			res('success')   
		} else {
			throw new Error("Unknown result")
		}
	})
})}




function load_and_attach_route___set_match_and_get_match_and_route(url: str) : [Array<str>, Route] {


    for (let i = 0; i < _routes.length; i++) {

		let urlmatchstr = url.match(_routes[i].path_regex)

		if (urlmatchstr) { 
			return [ urlmatchstr.slice(1), _routes[i] ]
		}
    }

    // catch all -- just route to home
    return [ [], _routes.find(r=> r.lazyload_view.name==="home")! ]
}




/**
 * Handles routing when the URL changes.
 * Instead of reading the hash fragment, we use the clean URL path.
 * @param path - The clean URL path (e.g. "/home", "/user/123") to load the route for.
 */
async function routeChanged(path: string) {

	let   overlayel       = document.getElementById("switchstation_overlay") as HTMLElement
    const normalizedRoute = path.startsWith('/') ? path.substring(1) : path;
    const routeToLoad     = normalizedRoute === "" ? "home" : normalizedRoute;
    const newHistoryIndex = history.state?.index ?? _currentHistoryIndex;
    const direction       = newHistoryIndex < _currentHistoryIndex ? "back" : "forward";

	{
		if (overlayel.style.display === "block") {
			window.location.href = `/?errmsg=${encodeURIComponent('switchstation already in transition')}`;
			return;
		}
		overlayel.style.display = "block";
	}


    _currentHistoryIndex = newHistoryIndex

    const [urlMatches, routeObj] = load_and_attach_route___set_match_and_get_match_and_route(routeToLoad);

    const loadresult = await routeObj.load(routeToLoad, urlMatches, "beforeend");

    if (loadresult === "failed") {
        overlayel.style.display = "none";
        window.location.href = "/?errmsg=" + encodeURIComponent('failed to load view');
        return;
    }

    // Apply the proper transition based on navigation type.
    if (direction === "firstload") {
        // FIRSTLOAD: No active view exists – simply mark the newly loaded view as active.
        const newActiveView = document.querySelector("#views .view:last-child") as HTMLElement;
        // Optionally, add any fade-in or initial animation here.
        newActiveView.setAttribute("active", "");
    }
    else if (direction === "forward") {
        // Forward transition animation
        const allviews = document.querySelectorAll("#views .view") as NodeListOf<HTMLElement>;
        const activeview = allviews[allviews.length - 1];
        activeview.classList.add("next_startstate");
        activeview.style.display = "block";
        activeview.offsetHeight; // force reflow
        activeview.classList.remove("next_startstate");

        const previousview = activeview.previousElementSibling as HTMLElement;
        if (previousview) {
            previousview.classList.add("previous_endstate");
        }

        activeview.addEventListener("transitionend", function activeTransitionEnd() {
            activeview.setAttribute("active", "");
            if (previousview) {
                previousview.removeAttribute("active");
                previousview.setAttribute("previous", "");
                const previous_previousview = previousview.previousElementSibling as HTMLElement;
                if (previous_previousview) {
                    previous_previousview.removeAttribute("previous");
                }
            }
            activeview.removeEventListener("transitionend", activeTransitionEnd);
        });
    }
    else if (direction === "back") {
        // Backward transition animation
        const activeview = document.querySelector("#views .view[active]") as HTMLElement;
        let previousview = activeview?.previousElementSibling;
        if (!previousview) {
            // If the previous view isn't present, load it
            const loadresult = await load_and_attach_route(routeToLoad, "afterbegin");
            if (loadresult === "failed") {
                overlayel.style.display = "none";
                window.location.href = "/?errmsg=" + encodeURIComponent('failed to load view');
                return;
            }
            previousview = activeview?.previousElementSibling as HTMLElement;
            previousview.classList.add("previous_endstate");
            previousview.style.display = "block";
            previousview.offsetHeight;
        }
        activeview.classList.add("active_endstate");
        previousview.classList.remove("previous_endstate");

        activeview.addEventListener("transitionend", function activeTransitionEnd() {
            activeview.remove();
            previousview?.setAttribute("active", "");
            const previous_previousview = previousview?.previousElementSibling as HTMLElement;
            if (previous_previousview) {
                previous_previousview.setAttribute("previous", "");
            }
            activeview.removeEventListener("transitionend", activeTransitionEnd);
        });
    }

    // Remove overlay and signal that view load is done.
    overlayel.style.display = "none";
    document.querySelector("#views")!.dispatchEvent(view_load_done_event);
}




function hash_changed___posthash() {

    document.getElementById("switchstation_overlay")!.style.display = "none"

    localStorage.setItem("hstack", JSON.stringify(hstack))

    document.querySelector("#views")!.dispatchEvent(view_load_done_event);
}




function has_changed___failed_posthash(showhomebtn = true) {
    document.getElementById("switchstation_overlay")!.style.display = "none";
    if (showhomebtn) {
        document.body.insertAdjacentHTML("beforeend", `<button id="gohomebtn" style="cursor:pointer;position: absolute;top: 20px;left: 50%;width: 200px;margin-left: -100px;">Reload Home Page</button>`);
        const el = document.getElementById("gohomebtn") as HTMLButtonElement;
        el.addEventListener("click", () => {
            window.location.href = "/index.html";
        });
    }
    cancelhashload = true;
    alert("Network error. Failed to load view");
}











export { Init, AddRoute, navigateTo }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SwitchStation = { AddRoute, Back, navigateTo }













