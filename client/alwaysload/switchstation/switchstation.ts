

import { LazyLoadT, FirestoreLoadSpecT, URIDetailT } from  "../../defs.js" 
import { str } from  "../../defs_server_symlink.js" 
import { Run as LazyLoadRun } from '../lazyload.js'
import { AddView as CMechAddView } from "../cmech.js"

const hstack:Array<str> = [];
let   cancelhashload = false;
const view_load_done_event = new Event("view_load_done");





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



let currenthash = "";

const Init = ()=> {

    /*
    window.addEventListener("popstate", (e)=> {
        hash_changed(e);
    })
    */

    window.addEventListener('hashchange', (e)=> {
		if (cancelhashload) {
			cancelhashload = false
			return
		}

        const m = (e as any).newURL.match(/#(.+)/)
        const c = m[1] as str
		const y = (c.split("--"))[0]

		if (y !== currenthash) {
			currenthash = y
			hash_changed(e)
		}
    })

    //history.replaceState({}, "", window.location.href)
    hash_changed()
}




const AddRoute = (lazyload_view:LazyLoadT)=> {
    _routes.push(new Route(lazyload_view))
}




function Back() {

	const m         = window.location.href.match(/#(.+)/)!
	const c         = m[1] as str
	const split     = c.split("/")

	const hashpath  = split.slice(0, split.length-1).join("/")

    window.location.hash = hashpath
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




async function hash_changed(e:Event|null = null) {

    const overlayel = document.getElementById("switchstation_overlay") as HTMLElement

    if (overlayel.style.display === "block") {
		window.location.href = `/?errmsg=${encodeURIComponent('switchstation already in transition')}`; 
        return
    } 


    overlayel.style.display = "block"

    if (e && (e as any)!.newURL) {
        const m = (e as any).newURL.match(/#(.+)/)
        const c = m[1] as str
		const y = (c.split("--"))[0]

        if (hstack.length === 1 && document.querySelector("#views .view[active]")?.getAttribute("backhash") === y) {
            hstack.unshift(y)
        }
    }

    if (document.querySelector("#views .view[active][draggedback]")) {
        const activeview = document.querySelector("#views .view[active][draggedback]") as HTMLElement
        const previousview = activeview.previousElementSibling as HTMLElement

        activeview.remove()
        previousview.removeAttribute("previous")
        previousview.setAttribute("active", "")

        previousview.style.transform = ""
        previousview.classList.remove("previous_endstate")

        hstack.pop()

        hash_changed___posthash()
    }

    else if (!hstack.length) { // first time load in browser

		const n = window.location.hash === "" ? "home" : window.location.hash.substring(1)
		const y = (n.split("--"))[0]
		const loadresult = await load_and_attach_route(y, "beforeend")

		if (loadresult === "failed") {
			if (!window.location.href.includes("localhost")) 
				window.location.href = "/?errmsg=" + encodeURIComponent('failed to load view')
			else 
				throw new Error("switchstation - failed to load view")

			return
		}

        const view = document.querySelector("#views .view") as HTMLElement

        view.style.display = "block"
        view.setAttribute("active", "")

        hstack.push(window.location.hash.substring(1))

        hash_changed___posthash()
    } 

    else if (window.location.hash.substring(1) === hstack[hstack.length-2]) { // is going back

        const activeview = document.querySelector("#views .view[active]")
        let   previousview = activeview?.previousElementSibling

        if(!previousview) { // browser load at a particular page and then back button pressed. History exists in browser, but not previous view

            const loadresult  = await load_and_attach_route(hstack[hstack.length-2], "afterbegin")

			if (loadresult === "failed") {
				window.location.href = "/?errmsg=" + encodeURIComponent('failed to load view')
				return
			}

            previousview = activeview?.previousElementSibling as HTMLDivElement
            previousview.classList.add("previous_endstate")
            //@ts-ignore
            previousview.style.display = "block"
            //@ts-ignore
            previousview.offsetHeight
        }

        activeview?.classList.add("active_endstate")
        previousview?.classList.remove("previous_endstate")

        activeview?.addEventListener("transitionend", activeview_transitionend)

        function activeview_transitionend() {
            activeview?.remove()
            previousview?.setAttribute("active", "")

            const previous_previousview = previousview?.previousElementSibling as HTMLElement
            if (previous_previousview) {
                previous_previousview.setAttribute("previous", "")
            }

            hstack.pop()

            hash_changed___posthash()

            activeview?.removeEventListener("transitionend", activeview_transitionend)
        }

    } else {   // is going forward

		const c = window.location.hash.substring(1)
		const y = (c.split("--"))[0]

        const loadresult = await load_and_attach_route(y, "beforeend")

		if (loadresult === "failed") {
			has_changed___failed_posthash(false)
			return
		}

        const allviews = document.querySelectorAll("#views .view") as NodeListOf<HTMLElement>
        const activeview = allviews[allviews.length-1]
        const previousview = activeview.previousElementSibling as HTMLElement

        activeview.classList.add("next_startstate")
        activeview.style.display = "block"
        activeview.offsetHeight
        activeview.classList.remove("next_startstate")

        previousview.classList.add("previous_endstate")

        activeview.addEventListener("transitionend", activeview_transition_end)

        function activeview_transition_end() {
            activeview.setAttribute("active", "")
            previousview.removeAttribute("active")
            previousview.setAttribute("previous", "")

            const previous_previousview = previousview.previousElementSibling as HTMLElement
            if (previous_previousview) {
                previous_previousview.removeAttribute("previous")
            }

            //history.pushState({}, "", "#" + window.location.hash.substring(1))
			const c = window.location.hash.substring(1)
			const y = (c.split("--"))[0]
            hstack.push(y)

            hash_changed___posthash()

            activeview.removeEventListener("transitionend", activeview_transition_end)
        }
    }
}




function hash_changed___posthash() {

    document.getElementById("switchstation_overlay")!.style.display = "none"

    localStorage.setItem("hstack", JSON.stringify(hstack))

    document.querySelector("#views")!.dispatchEvent(view_load_done_event);
}




function has_changed___failed_posthash(showhomebtn=true) {
    document.getElementById("switchstation_overlay")!.style.display = "none"

	if (showhomebtn) {
		document.body.insertAdjacentHTML("beforeend", `<button id="gohomebtn" style="cursor:pointer;position: absolute;top: 20px;left: 50%;width: 200px;margin-left: -100px;">Reload Home Page</button>`)
		const el = document.getElementById("gohomebtn") as HTMLButtonElement
		el.addEventListener("click", ()=> { 
			window.location.href = "/index.html" 
		})
	}
	cancelhashload = true
	window.location.hash = hstack[hstack.length-1]
	alert ("Network error. failed to load view")
}











export { Init, AddRoute }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SwitchStation = { AddRoute, Back }













