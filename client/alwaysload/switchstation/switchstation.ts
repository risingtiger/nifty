

import { LazyLoadT, FirestoreLoadSpecT, URIDetailT } from  "../../defs.js" 
import { str } from  "../../defs_server_symlink.js" 
import { Run as LazyLoadRun } from '../lazyload.js'
import { AddView as CMechAddView } from "../cmech.js"


let _currentHistoryIndex: number = 0;
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








const Init = ()=> {

    window.addEventListener('popstate', (_e) => routeChanged(window.location.pathname.slice(3)));

    const initialPath = window.location.pathname.slice(3)

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




async function routeChanged(path: string) {

	let   overlayel          = document.getElementById("switchstation_overlay") as HTMLElement
    const newHistoryIndex    = history.state?.index ?? _currentHistoryIndex;
	const viewsel            = document.getElementById("views") as HTMLElement;
    const is_any_activeview  = viewsel.children.length > 0;
    let   direction          = !is_any_activeview ? "firstload" : newHistoryIndex < _currentHistoryIndex ? "back" : "forward";

	{
		if (overlayel.style.display === "block") {
			window.location.href = `/?errmsg=${encodeURIComponent('switchstation already in transition')}`;
			return;
		}
		overlayel.style.display = "block";
	}


    _currentHistoryIndex         = newHistoryIndex

    const [urlMatches, routeObj] = get_route_uri(path);


    if (direction === "firstload") {

		const loadresult = await routeObj.load(path, urlMatches, "beforeend");

		if (loadresult === 'failed') {
			overlayel.style.display = "none";
			window.location.href = `/?errmsg=${encodeURIComponent('failed to load view')}`;
			return;
		}

        viewsel.children[0].setAttribute("active", "");
		( viewsel.children[0] as HTMLElement ).style.display = "block";
    }

    else if (direction === "forward") {

		const loadresult = await routeObj.load(path, urlMatches, "beforeend");

		if (loadresult === 'failed') {
			overlayel.style.display = "none";
			alert ("failed to load view")
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
        });
    }

    else if (direction === "back") {

        const activeview = viewsel.children[viewsel.children.length - 1] as HTMLElement;
        let previousview = activeview?.previousElementSibling as HTMLElement;

        if (!previousview) {
			
			const loadresult = await routeObj.load(path, urlMatches, "afterbegin");

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

    overlayel.style.display = "none";
    document.querySelector("#views")!.dispatchEvent(new Event("view_load_done"));
}




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













