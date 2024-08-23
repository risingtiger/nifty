

import { str, bool, LazyLoadT } from  "../definitions.js" 

declare var LazyLoad:any

const _hstack:Array<str> = [];
let   _intransitionLock = false;

const view_load_done_event = new Event("view_load_done");




class Route {

    lazyload_view: LazyLoadT
    path_regex: RegExp




    constructor(lazyload_view_: LazyLoadT) {
        this.lazyload_view = lazyload_view_
        this.path_regex     = new RegExp(this.lazyload_view.urlmatch!)
    }




    attemp_to_load(urlm:Array<str>) { 

        return new Promise<any>( async (res, rej) => {

            if ( this.lazyload_view.auth.length > 0 && !this.lazyload_view.auth.includes(localStorage.getItem('auth_group')!)) {
                const errmsg = "not_authorized_to_view_page"
                rej(errmsg)
                return;
            }

            await LazyLoad([this.lazyload_view])

            const parentEl = document.querySelector("#views")!;

            let urstr = 'urlmatches = "' + urlm.join(",") + '"'

            parentEl.insertAdjacentHTML("beforeend", `<v-${this.lazyload_view.name} class='view' ${urstr}></v-${this.lazyload_view.name}>`);

            const el = parentEl.querySelector(`v-${this.lazyload_view.name}`) as HTMLElement

            el.addEventListener("hydrated", ()=> res(1))
        })
    }
}




let _routes:Array<Route> = [];




const InitInterval = ()=> {
    window.addEventListener('hashchange', ()=>hashChanged())
    hashChanged()

}




const AddRoute = (lazyload_view:LazyLoadT)=> {
    _routes.push(new Route(lazyload_view))
}




function _doRoute(url: str, is_going_back:bool) {

    if (_intransitionLock) 
        return false;

    _intransitionLock = true;

    const views_el = document.querySelector("#views") as HTMLElement;
    const [ urlm, route ] = set_match_and_get_match_and_route(url);

    route.attemp_to_load(urlm).then(()=> {

        let ch = views_el.children;

        if (ch.length === 2) {
            const anim = [
                {
                    opacity: '0', transform: `translate3D(${is_going_back ? '-' : ''}35px, 0, 0)`
                },
                {
                    opacity: '1', transform: "translate3D(0%, 0, 0)"
                }
            ]

            const timing = {
                duration: 300,
                easing: "cubic-bezier(.42,0,.04,1)",
                iterations: 1
            }

            setTimeout(()=> {
                let animate = ch[1].animate(anim, timing)
                animate.onfinish = _e=> {
                    (ch[1] as any).classList.add("active")
                    posthash((ch[1] as any))
                    views_el.removeChild(ch[0]);
                }
            }, 10)

        }

        else {
            (ch[0] as any).classList.add("active")
            posthash((ch[0] as any))
        }

    })


    function set_match_and_get_match_and_route(url: str) : [Array<str>, Route] {

        for (let i = 0; i < _routes.length; i++) {

        let urlmatchstr = url.match(_routes[i].path_regex)

            if (urlmatchstr) 
                return [ urlmatchstr.slice(1), _routes[i] ]
        }

        // catch all -- just route to home

        return [ ("home".match(/home/g) as RegExpMatchArray).slice(1), _routes.find(r=> r.lazyload_view.name==="home")! ]

    }



    function posthash(_el:HTMLElement) {

        if (window.location.hash.substring(1) === _hstack[_hstack.length-2]) {
            _hstack.pop()
        } 
        
        else {
            _hstack.push(url)
        }

        _intransitionLock = false;

        localStorage.setItem("hstack", JSON.stringify(_hstack))

        document.querySelector("#views")!.dispatchEvent(view_load_done_event);
    }
}




function hashChanged() {

    if (_intransitionLock) {
        return false;
    } 

    else if (!_hstack.length) {

        if (window.location.hash === "") {
            window.location.hash = "home";
            _doRoute("home", false);

        } 

        else {
            _doRoute(window.location.hash.substring(1), false);
        }

    } 

    else if (window.location.hash.substring(1) !== _hstack[_hstack.length-1]) {

        if (window.location.hash.substring(1) === _hstack[_hstack.length-2]) {

            // is going back

            _doRoute(window.location.hash.substring(1), true);

        } 

        else {

            // is going forward

            _doRoute(window.location.hash.substring(1), false);
        }
    }

}





export { InitInterval, AddRoute };


