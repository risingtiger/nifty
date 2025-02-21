

import { LazyLoadT, FirestoreLoadSpecT, URIDetailT } from  "../../defs.js" 
import { str, num } from  "../../defs_server_symlink.js" 
import { Run as LazyLoadRun } from '../lazyload.js'
import { AddView as CMechAddView } from "../cmech.js"


// Add a global flag to detect swipe-back gesture
let isSwipeBackGesture = false;

window.addEventListener("touchstart", (e: TouchEvent) => {
    const touch = e.touches[0];
    // If the touch starts near the left edge, mark as potential swipe-back.
    if (touch.clientX < 50) {
        isSwipeBackGesture = true;
    }
});

window.addEventListener("touchmove", (e: TouchEvent) => {
    // Optionally, add more precise swipe detection logic here.
});

window.addEventListener("touchend", () => {
    // Reset the flag after the touch ends.
    isSwipeBackGesture = false;
});


let _routes:Array<Route> = [];




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








const Init = async ()=> {

    const initialPath = window.location.pathname.slice(3)

    if (!history.state || history.state.index === undefined) {
		await routeChanged(initialPath, 'firstload');
        history.replaceState({ index: 0, path: initialPath }, '', initialPath);
    } else {
		await routeChanged(history.state.path, 'firstload');
    }

	window.addEventListener("popstate", async (e) => {
		if (e.state) routeChanged(e.state.path, 'back')
	});
}




const AddRoute = (lazyload_view:LazyLoadT)=> {
    _routes.push(new Route(lazyload_view))
}




async function NavigateTo(newPath: string) {
    const r = await routeChanged(newPath, 'forward');
	if (r === null) { return; }

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




const routeChanged = (path: string, direction:'firstload'|'back'|'forward' = 'firstload') => new Promise<num|null>(async (res, _rej) => {

	const viewsel            = document.getElementById("views") as HTMLElement;

    const [urlMatches, routeObj] = get_route_uri(path);

    if (direction === "firstload") {

		const loadresult = await routeObj.load(path, urlMatches, "beforeend");

		if (loadresult === 'failed') {
			window.location.href = `/?errmsg=${encodeURIComponent('failed to load view')}`;
			res(null);
			return;
		}

        viewsel.children[0].setAttribute("active", "");
		( viewsel.children[0] as HTMLElement ).style.display = "block";

		document.querySelector("#views")!.dispatchEvent(new Event("view_load_done"));
    }

    else if (direction === "forward") {

		const loadresult = await routeObj.load(path, urlMatches, "beforeend");

		if (loadresult === 'failed') {
			alert ("failed to load view")
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
            activeview.setAttribute("active", "");
            if (previousview) {
                previousview.removeAttribute("active");
                previousview.setAttribute("previous", "");
            }
            activeview.removeEventListener("transitionend", activeTransitionEnd);

			document.querySelector("#views")!.dispatchEvent(new Event("view_load_done"));
        });
    }

    else if (direction === "back") {

        const activeview = viewsel.children[viewsel.children.length - 1] as HTMLElement;
        let previousview = activeview?.previousElementSibling as HTMLElement;

        // If a swipe-back gesture is detected, immediately remove the active view.
        if (isSwipeBackGesture) {
            activeview.remove();
            if (previousview) {
                previousview.setAttribute("active", "");
            }
            document.querySelector("#views")!.dispatchEvent(new Event("view_load_done"));
            res(1);
            return;
        }

        if (!previousview) {
			
			const loadresult = await routeObj.load(path, urlMatches, "afterbegin");

            if (loadresult === "failed") {
                window.location.href = "/?errmsg=" + encodeURIComponent('failed to load view');
				res(null);
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

			document.querySelector("#views")!.dispatchEvent(new Event("view_load_done"));
        });
    }

	res(1);
})




function get_route_uri(url: str) : [Array<str>, Route] {


    for (let i = 0; i < _routes.length; i++) {

		let urlmatchstr = url.match(_routes[i].path_regex)

		if (urlmatchstr) { 
			return [ urlmatchstr.slice(1), _routes[i] ]
		}
    }

    // catch all -- just route to home
    return [ [], _routes.find(r=> r.lazyload_view.name==="home")! ]
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




export { Init, AddRoute }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SwitchStation = { NavigateTo, NavigateBack };













