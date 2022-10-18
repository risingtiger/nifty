

//type bool = boolean;   
type str  = string;   
//type int  = number;


const _hstack:Array<str> = [];
let   _intransitionLock = false;




class Route {

  regex: any;
  view: str;




  constructor(regexP: str, viewP: str) {
    this.regex     = new RegExp(regexP);
    this.view      = viewP;
  }




  attempToload(urlMatch: str[]) { 

    return new Promise<any>( (res, rej) => {

      import(`/${this.view}.js`)
        .then(_ => {
          const x  = document.querySelector("#views") as any;

          x.insertAdjacentHTML("beforeend", `<v-${this.view} class='view'></v-${this.view}>`);
          const el = document.querySelector(`#views > v-${this.view}`) as any;


          el.activated(urlMatch)
            .then(()=> {
              res(1);})

            .catch(()=> rej())

        })

        .catch(()=> rej());	

    })

  }




  emitTransitionedIn() {

    const el = document.querySelector(`#views > v-${this.view}`) as any
    if (el.transitioned)   el.transitioned();

  }




}




const _routes = [
  new Route("^index$", "index"),
  new Route("^machines$", "machines"),
  new Route("^machine\/([0-9A-Za-z_]+)$", "machine"),
  new Route("^machine\/([0-9A-Za-z_]+)\/graphs$", "graphs"),
  new Route("^upgrade$", "upgrade")
];








function _doRoute(url: str) {
    if (_intransitionLock) {
    return false;
  }


  _intransitionLock = true;


  const viewsEl                = document.querySelector("#views") as HTMLElement;
  const [ urlmatch, route ] = _setMatchAndGetMatchAndRoute(url);


  route.attempToload(urlmatch)

    .then(()=> {

      setTimeout(()=> {

        // this timeout is only temporary until I can get my shit together and figure out the page transition
        // set ALL views to inactive, then set the last view (which should be the one being loaded in) to active


        let ch = viewsEl.children;
        ch[ch.length - 1].classList.add('active');

        for(let i = 0; i < ch.length - 1; i++)
          viewsEl.removeChild(ch[i]);


        if (window.location.hash.substring(1) === _hstack[_hstack.length-2]) {
          _hstack.pop();
          
        } else {
          _hstack.push(url);

        }


        route.emitTransitionedIn();


        _intransitionLock = false;

      }, 300);   })

    .catch(()=> {
      window.location.hash = _hstack[_hstack.length-1] || "index";
      _intransitionLock = false;
      alert("unable to load view");   });

}




function _setMatchAndGetMatchAndRoute(url: str) : [RegExpMatchArray, Route] {
  for (let i = 0; i < _routes.length; i++) {
    let urlmatchstr = url.match(_routes[i].regex);

    if (urlmatchstr)
      return [ urlmatchstr, _routes[i] ];
  }


  // catch all -- just route to index

  return [ ("index".match(/index/g) as RegExpMatchArray), _routes.find(r=> r.view==="index") as Route ];
}




const InitInterval = ()=> {
  setInterval(_=> {
    if (_intransitionLock) {
      return false;

    } else if (!_hstack.length) {

      if (window.location.hash === "") {
        window.location.hash = "index";
        _doRoute("index");

      } else {
        _doRoute(window.location.hash.substring(1));
      }

    } else if (window.location.hash.substring(1) !== _hstack[_hstack.length-1]) {
      _doRoute(window.location.hash.substring(1));
    }

  }, 200);
}



export { InitInterval };

