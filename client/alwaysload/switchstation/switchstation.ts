

import { LazyLoadT } from  "../../defs.js" 
import { str } from  "../../defs_server_symlink.js" 
import SwitchStationDragBack from "./dragback.js"

declare var $N:any

const hstack:Array<str> = [];
let   cancelhashload = false;
const view_load_done_event = new Event("view_load_done");




class Route {

    lazyload_view: LazyLoadT
    path_regex: RegExp
    paramNames: Array<str>




    constructor(lazyload_view_: LazyLoadT) {
        this.lazyload_view = lazyload_view_

        // Initialize an array to hold parameter names
        const paramNames: Array<str> = [];

        // Replace placeholders like ':id' with '([a-z_0-9]+)' and collect parameter names
        const pattern = this.lazyload_view.urlmatch!.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, paramName) => {
            paramNames.push(paramName);
            return '([a-z_0-9]+)';
        });

        // Create the regex with the modified pattern
        this.path_regex = new RegExp(pattern);

        // Store the parameter names
        this.paramNames = paramNames;
    }




    load(urlm:Array<str>, views_attach_point:"beforeend"|"afterbegin") { 

        return new Promise<string>( async (res, _rej) => {

            await $N.LazyLoad.Run([this.lazyload_view]);

            const parentEl = document.querySelector("#views")!;

            let urstr = 'urlmatches = "' + urlm.join(",") + '"'

            parentEl.insertAdjacentHTML(views_attach_point, `<v-${this.lazyload_view.name} class='view' ${urstr}></v-${this.lazyload_view.name}>`);

            const viewname = this.lazyload_view.name
            const els = parentEl.querySelectorAll(`v-${viewname}`) as NodeListOf<HTMLElement>
            const el = els[els.length-1]

            el.addEventListener("hydrated", hydrated)
            el.addEventListener("failed", failed)

            el.addEventListener("touchstart", SwitchStationDragBack.TouchDown)
            el.addEventListener("touchend", SwitchStationDragBack.TouchUp)
            el.addEventListener("touchmove", SwitchStationDragBack.TouchMove)
            el.addEventListener("touchcancel", SwitchStationDragBack.TouchCancel)

			function hydrated() {

                // !! HACK !! - Making an exemption for machinetelemetry because chartist needs display to block in order to figure out offsets widths etc
                // TODO: - Need to have display set to block from the get go and use visibility hidden instead

                if (viewname.includes("machinetelemetry")) {
                    res('success')
                } else {
                    setTimeout(()=> { //Flashes before css is loaded ... this is for development environment where the css is being linked in (allowing for chrome css edit). In prod its all bundled together, so there won't be a separate css file load
                        res('success')
                    }, 10)
                }

				el.removeEventListener("hydrated", hydrated)
			}

			function failed() {
				el.removeEventListener("failed", failed)
				el.remove()
				res('failed')
			}
        })
    }
}




let _routes:Array<Route> = [];




const InitInterval = ()=> {

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
        hash_changed(e)
    })

    //history.replaceState({}, "", window.location.href)
    hash_changed()
}




const AddRoute = (lazyload_view:LazyLoadT)=> {
    _routes.push(new Route(lazyload_view))
}




function Back() {

    const backhash = document.querySelector("#views .view[active]")!.getAttribute("backhash") as str

    window.location.hash = backhash
}




function load_and_attach_route(url: str, views_attach_point:"beforeend"|"afterbegin") {   return new Promise<string>(async (res, _rej)=> {

    const [ urlm, route ] = load_and_attach_route___set_match_and_get_match_and_route(url);

    route.load(urlm, views_attach_point).then((result:string)=> {   
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

        if (urlmatchstr) 
            return [ urlmatchstr.slice(1), _routes[i] ]
    }

    // catch all -- just route to home
    return [ ("home".match(/home/g) as RegExpMatchArray).slice(1), _routes.find(r=> r.lazyload_view.name==="home")! ]
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

        if (hstack.length === 1 && document.querySelector("#views .view[active]")?.getAttribute("backhash") === c) {
            hstack.unshift(c)
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
		const loadresult = await load_and_attach_route(n, "beforeend")

		if (loadresult === "failed") {
			window.location.href = "/?errmsg=" + encodeURIComponent('failed to load view')
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

        const loadresult = await load_and_attach_route(window.location.hash.substring(1), "beforeend")

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
            hstack.push(window.location.hash.substring(1))

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



console.log("Now I need to deal with the whole hash in the URL thing. Click 'View Machines' button. The alert happens. All is well. But the url has v#machines hash. No bueno. No clicking the button again, nuten happens cause hash already at machines. So, need to do something. Not sure what. MIGHT BE A GOOD TIME TO FUCK THE HASH AND GO CLEAN ON HISTORY API")







/*

// SWIPE BACK FUNCTIONALITY

let _view_mousedown_x = 0
let _view_mousedown_y = 0
let _view_mx = 0
let _view_move_ref = 0
let _view_move_delta = 0
let _view_move_current_el:HTMLElement|null = null
let _view_move_previous_el:HTMLElement|null = null
let _view_mousedown_mode: "up" | "down" | "drag" | "goingback" | "canceled" = "up"
let _view_speed = 0
let _view_speed_x = 0
let _view_time = 0

const X_SNAPSHOT_INTERVAL = 50
const X_POSITIONS_COUNT = 20

let _view_x_positions:Array<{x:number,time:number}> = []
let _view_x_positions_index = 0

for (let i = 0; i < X_POSITIONS_COUNT; i++) {
    _view_x_positions.push({x:0, time:0})
}



function view_mousedown(e:TouchEvent) {

    const mx = e.changedTouches[0].clientX; 
    const my = e.changedTouches[0].clientY;

    if (_view_mousedown_mode !== "up" || mx >=50 || my < 60) {
        return;
    }

    _view_mousedown_x = mx;
    _view_mousedown_y = my;

    if (document.querySelectorAll("#views .view").length > 1)
        _view_mousedown_mode = "down";

    e.preventDefault()
}

function view_mouseup(e:TouchEvent) {

    if (_view_mousedown_mode === "drag") {
        dragreleased(e)
    } else {
        _view_mousedown_mode = "up";
    }
}

function view_mousemove(e:TouchEvent) {

    if (_view_mousedown_mode === "up" || _view_mousedown_mode === "canceled") {
        return;
    }

    const mx = e.changedTouches[0].clientX;
    const my = e.changedTouches[0].clientY;

    _view_mx = mx;

    if (_view_mousedown_mode === "down") {

        if (Math.abs(my - _view_mousedown_y) > 10) {
            _view_mousedown_mode = "canceled"

            return;

        } else if (   mx - _view_mousedown_x > 20) {
            _view_mousedown_mode = "drag"
            _view_move_ref = mx
            _view_move_current_el = e.target as HTMLElement
            _view_move_previous_el = _view_move_current_el.previousElementSibling as HTMLElement

            _view_move_current_el!.classList.add("dragging")
            _view_move_previous_el!.classList.add("dragging")

            _view_move_delta = mx - _view_move_ref;

            //const content_el = _view_move_current_el.shadowRoot!.querySelector(".content") as HTMLElement
            //content_el.style.overflowY = "hidden"

            document.getElementById("loadviewoverlay")!.style.display = "block"

            window.requestAnimationFrame(view_move_step)

            return
        }
    }

    else if (_view_mousedown_mode === "drag") {
        
        _view_move_delta = mx - _view_move_ref;

        e.preventDefault()
    }
}

function view_mouseleave(e:MouseEvent) {

    if (_view_mousedown_mode === "drag") {
        dragreleased(e)
    } else {
        _view_mousedown_mode = "up";
    }
}

function view_move_step(timestamp:number) {

    if (_view_mousedown_mode === "drag") {

        if (timestamp - _view_time > X_SNAPSHOT_INTERVAL) {

            _view_x_positions[_view_x_positions_index] = {x:_view_mx, time:timestamp}            
            _view_time = timestamp

            const compare_to_index = get_compare_to_index(1)

            _view_speed = (_view_x_positions[_view_x_positions_index].x - _view_x_positions[compare_to_index].x) / (timestamp - _view_x_positions[compare_to_index].time)

            if (_view_x_positions_index === X_POSITIONS_COUNT) {
                _view_x_positions_index = 0
            } else { 
                _view_x_positions_index++
            }
        }

        _view_move_current_el!.style.transform = `translate3d(${_view_move_delta}px, 0, 0)`
        _view_move_previous_el!.style.transform = `translate3d(${ (_view_move_delta / 3) - 150}px, 0, 0)`

        window.requestAnimationFrame(view_move_step)
    } 
}

function get_compare_to_index(stepsback:number) {
    return _view_x_positions_index - stepsback < 0 ? X_POSITIONS_COUNT + (_view_x_positions_index - stepsback) : _view_x_positions_index - stepsback
}


function dragreleased(e:Event) {

    if (_view_speed < 0.1) {
        _view_mousedown_mode = "up"

        _view_move_current_el!.classList.remove("dragging")
        _view_move_previous_el!.classList.remove("dragging")

        _view_move_current_el!.style.transform = ``
        _view_move_previous_el!.style.transform = `translate3d(-150px, 0, 0)`

        document.getElementById("loadviewoverlay")!.style.display = "none"

        return 
    } 




    _view_mousedown_mode = "goingback"


    _view_move_current_el!.classList.add("released")
    _view_move_previous_el!.classList.add("released")

    _view_move_current_el!.offsetHeight

    _view_move_current_el!.style.transform = `translate3d(calc(100% + 30px), 0, 0)`
    _view_move_previous_el!.style.transform = `translate3d(0, 0, 0)`

    //_view_move_current_el!.style.transitionDuration = (1-_view_speed) + .5 + "s"
    //_view_move_previous_el!.style.transitionDuration = (1-_view_speed) + .5 + "s"

    _view_move_current_el!.addEventListener("transitionend", ()=> {
        _view_mousedown_mode = "up"
        window.location.hash = hstack[hstack.length-2]
    })
}
*/



if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).SwitchStation = { InitInterval, AddRoute, Back }













