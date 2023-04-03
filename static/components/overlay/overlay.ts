

type int = number
type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;




type State = {
  width: str,
  height: str,
  closebtn: bool,
  showheader: bool,
  firstRunRan:bool
}




class COverlay extends HTMLElement {

  shadow:ShadowRoot
  $:any
  s:State
  wrapperAnimation!:Animation|null
  backgroundAnimation!:Animation|null
  viewAnimation!:Animation|null




  static get observedAttributes() { return ['show']; }




  constructor() {   

    super(); 

    this.shadow = this.attachShadow({ mode: "open" });

    this.s = {
      width: "",
      height: "",
      closebtn: false,
      showheader: false,
      firstRunRan: false
    }

    this.$ = this.querySelector
  }




  attributeChangedCallback(name:str, oldValue:str|bool|int, newValue:str|bool|int) {

    const animateIn = ()=> {
      this.backgroundAnimation!.playbackRate = 1
      this.backgroundAnimation!.currentTime = 0
      this.backgroundAnimation!.play()

      this.viewAnimation!.playbackRate = 1
      this.viewAnimation!.currentTime = 0
      this.viewAnimation!.play()

      this.wrapperAnimation!.playbackRate = 1
      this.wrapperAnimation!.currentTime = 0
      this.wrapperAnimation!.play()
    }

    const animateOut = ()=> {
      this.backgroundAnimation!.reverse()
      this.viewAnimation!.reverse()
      this.wrapperAnimation!.reverse()
    }



    if (!this.s.firstRunRan) {

      // first run through, so set things up

      this.s.width = this.getAttribute("width") ? "w_" + this.getAttribute("width") : "w_md"
      this.s.height = this.getAttribute("height") ? "h_" + this.getAttribute("height") : ""
      this.s.closebtn = this.getAttribute("closebtn") === "true" ? true : false
      this.s.showheader = this.getAttribute("showheader") === "true" ? true : false

      this.stateChanged()

      this.setupAnimationsEtc()

      this.s.firstRunRan = true
    }


    if (name === "show" && newValue === "true") {
      animateIn()
    }
    else if (name === "show" && oldValue === "true" && newValue === "false") {
      animateOut()
    }

  }



  stateChanged() {

    Lit_Render(this.template(this.s), this.shadow);

  }




  setupAnimationsEtc() {

    let elW = this.shadow.querySelector(".wrapper")!
    let elB = this.shadow.querySelector(".backgroundcover")!
    let elC = document.querySelector("#views > .view > .content")!

    const anim0 = [
      {transform: "translate3d(0, 0px, 0)"},
      {transform: "translate3d(0, -55px, 0)"}
    ]
    const timing0 = {
      duration: 380,
      easing: "cubic-bezier(.71,0,0,1)",
      fill: "both",
      iterations: 1,
    }
    const anim1 = [
      {opacity: '0'},
      {opacity: '1'}
    ]
    const timing1 = {
      duration: 380,
      easing: "cubic-bezier(.71,0,0,1)",
      fill: "both",
      iterations: 1,
    }
    const anim2 = [
      {opacity: '0', transform: `translate3d(0, 120px, 0) scale(1.15)`},
      {opacity: '1', transform: "translate3d(0, 0, 0) scale(1)"}
    ]
    const timing2 = {
      duration: 380,
      easing: "cubic-bezier(.71,0,0,1)",
      fill: "both",
      iterations: 1,
    }

    this.backgroundAnimation = elB.animate(anim1, timing1 as any)
    this.backgroundAnimation.pause()
    this.backgroundAnimation.onfinish = _=> {
      if (this.getAttribute("show") === "true")
        this.dispatchEvent(new Event('opened'))
      if (this.getAttribute("show") === "false")
        this.dispatchEvent(new Event('closed'))
    }

    this.viewAnimation = elC.animate(anim0, timing0 as any)
    this.viewAnimation.pause()

    this.wrapperAnimation = elW.animate(anim2, timing2 as any)
    this.wrapperAnimation.pause()

  }




  template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 

}




customElements.define('c-overlay', COverlay);




export {  }



