

type str  = string;   //type int  = number; type bool = boolean;


const _hstack:Array<str> = [];
let   _intransitionLock = false;

const view_load_done_event = new Event("view_load_done");


class Route {

    path_regex: RegExp
    name: str
    dependencies: Array<{type:str, name:str}>




    constructor(route: { path: str, name: str, dependencies: Array<{type:str, name:str}> }) {
        this.path_regex     = new RegExp(route.path)
        this.name      = route.name
        this.dependencies = route.dependencies
    }




    attemp_to_load(urlm:Array<str>) { 

        return new Promise<any>( async (res, rej) => {

            let flg = false;

            await (window as any).LazyLoad([{what:"views", name:this.name}])

            const parentEl = document.querySelector("#views")!;

            let urstr = 'urlmatches = "' + urlm.join(",") + '"'

            parentEl.insertAdjacentHTML("beforeend", `<v-${this.name} class='view' ${urstr}></v-${this.name}>`);

            const el = parentEl.querySelector(`v-${this.name}`)

            el?.addEventListener("hydrate", ()=> {
                if (!flg) {
                    flg = true
                    res(1)
                }
            })

            setTimeout(()=> {
                if (!flg) {
                    flg = true
                    rej(1)
                }
            }, 5000)

        })

    }

}




let _routes:Array<Route> = [];




const InitInterval = ()=> {
    window.addEventListener('hashchange', ()=>hashChanged())
    hashChanged()

}




const AddRoute = (route:{path:str, name:str, dependencies:Array<{type:str, name:str}>})=> {
    _routes.push(new Route(route))
}




function _doRoute(url: str, is_going_back:bool) {

    if (_intransitionLock) 
        return false;

    _intransitionLock = true;

    document.querySelector("#loadviewoverlay")!.classList.add("active")

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

    .catch(()=> {

        const errmsg = encodeURIComponent(`Unable to Lazy Load View Data: ${url}`)

        console.log(`/?errmsg=${errmsg}`)

        if (!window.location.href.includes("localhost")) {
            window.location.href = `/?errmsg=${errmsg}`
        }
        
    })



    function set_match_and_get_match_and_route(url: str) : [Array<str>, Route] {

        for (let i = 0; i < _routes.length; i++) {

        let urlmatchstr = url.match(_routes[i].path_regex)

            if (urlmatchstr) 
                return [ urlmatchstr.slice(1), _routes[i] ]
        }

        // catch all -- just route to index

        return [ ("index".match(/index/g) as RegExpMatchArray).slice(1), _routes.find(r=> r.name==="index")! ]

    }



    function posthash(el:HTMLElement) {

        document.querySelector("#loadviewoverlay")!.classList.remove("active")

        if (window.location.hash.substring(1) === _hstack[_hstack.length-2]) {
            _hstack.pop()
        } 
        
        else {
            _hstack.push(url)
        }

        (window as any).DDomObserve(el)

        _intransitionLock = false;

        localStorage.setItem("hstack", JSON.stringify(_hstack))

        document.querySelector("#views").dispatchEvent(view_load_done_event);
    }
}












function hashChanged() {

    if (_intransitionLock) {
        return false;
    } 

    else if (!_hstack.length) {

        if (window.location.hash === "") {
            window.location.hash = "index";
            _doRoute("index", false);

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


