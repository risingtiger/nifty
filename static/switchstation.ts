

type str  = string;   //type int  = number; type bool = boolean;


const _hstack:Array<str> = [];
let   _intransitionLock = false;




class Route {

  regex: any;
  view: str;




  constructor(regexP: str, viewP: str) {
    this.regex     = new RegExp(regexP);
    this.view      = viewP;
  }




  attempToload(urlm:Array<str>) { 

    return new Promise<any>( (res, rej) => {

      let flg = false

      SuckInJs([this.view])
        .then(_ => {

          const parentEl = document.querySelector("#views")!;

          let urstr = 'urlmatches = "' + urlm.join(",") + '"'

          parentEl.insertAdjacentHTML("beforeend", `<v-${this.view} class='view' ${urstr}></v-${this.view}>`);

          const el = parentEl.querySelector(`v-${this.view}`)

          el?.addEventListener("hydrate", ()=> {
            if (!flg) {
              flg = true
              res(1)
            }
          })

        })

        .catch(_ => {
          if (!flg) {
            flg = true
            rej(1)
          }
        })



      setTimeout(()=> {
        if (!flg) {
          flg = true
          rej(1)
        }
      }, 4000)

    })

  }

}




let _routes:Array<Route> = [];




function _doRoute(url: str, isGoingBack:bool) {

  if (_intransitionLock) 
    return false;


  _intransitionLock = true;

  document.querySelector("#loadviewoverlay")!.classList.add("active")

  const viewsEl                = document.querySelector("#views") as HTMLElement;
  const [ urlm, route ] = _setMatchAndGetMatchAndRoute(url);


  route.attempToload(urlm)
    .then(()=> {
      let ch = viewsEl.children;

      if (ch.length === 2) {
        const anim = [
          {
            opacity: '0', transform: `translate3D(${isGoingBack ? '-' : ''}35px, 0, 0)`
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
            viewsEl.removeChild(ch[0]);
          }
        }, 10)


      }

      else {
        (ch[0] as any).classList.add("active")
        posthash((ch[0] as any))
      }



      function posthash(el:HTMLElement) {
        document.querySelector("#loadviewoverlay")!.classList.remove("active")

        if (window.location.hash.substring(1) === _hstack[_hstack.length-2]) {
          _hstack.pop();
          
        } else {
          _hstack.push(url);

        }


        (window as any).DDomObserve(el)


        _intransitionLock = false;
      }

    })


    .catch(()=> {
      console.log(`/?errmsg=${encodeURIComponent('Unable to Load Page View')}`)
      // window.location.href = `/?errmsg=${encodeURIComponent('Unable to Load Page View')}`
    })

}




function _setMatchAndGetMatchAndRoute(url: str) : [Array<str>, Route] {

  for (let i = 0; i < _routes.length; i++) {
    let urlmatchstr = url.match(_routes[i].regex);

    if (urlmatchstr) 
      return [ urlmatchstr.slice(1), _routes[i] ]
  }


  // catch all -- just route to index

  return [ ("index".match(/index/g) as RegExpMatchArray).slice(1), _routes.find(r=> r.view==="index")! ]
}




const InitInterval = ()=> {

  window.addEventListener('hashchange', ()=>hashChanged())
  hashChanged()

}




function hashChanged() {

  if (_intransitionLock) {
    return false;

  } else if (!_hstack.length) {

    if (window.location.hash === "") {
      window.location.hash = "index";
      _doRoute("index", false);

    } else {
      _doRoute(window.location.hash.substring(1), false);
    }

  } else if (window.location.hash.substring(1) !== _hstack[_hstack.length-1]) {

    if (window.location.hash.substring(1) === _hstack[_hstack.length-2]) {

      // is going back
      
      _doRoute(window.location.hash.substring(1), true);

    } else {

      // is going forward

      _doRoute(window.location.hash.substring(1), false);
    }

  }

}




const AddRoute = (regexstr:str, view:str)=> {
  _routes.push(new Route(regexstr, view))
}



export { InitInterval, AddRoute };


