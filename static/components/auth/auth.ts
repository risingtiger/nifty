

// type int = number
// type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;




type State = {
  propa: str,
  propb: str,
}




class CAuth extends HTMLElement {

  $:any
  s:State




  static get observedAttributes() { return ['animateshow']; }




  constructor() {   

    super(); 

    this.$ = this.querySelector

    this.s = {
      propa: "",
      propb: ""
    }

  }




  async Activate() {   

    return new Promise(async res=> {
      this.stateChanged()
      res(1)
    })

  }




  stateChanged() {
    
    Lit_Render(this.template(this.s), this);

  }




  async login() {

    const formel = this.querySelector("form[name='login']") as HTMLFormElement

    const els = formel.elements as any

    if ( (els.username.value === "robert@purewater-tech.com" && els.password.value === "pure312water!!") || (els.username.value === "davis@risingtiger.com" && els.password.value === "pure312water!!")) {

      (window as any).___passalong = true

      alert("Logged In Successfully")

      localStorage.setItem('cat', '-');

      this.dispatchEvent(new Event('requested_close'))

    } else {
      alert("Wrong user name or password")
    }

  }




  template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 

}




customElements.define('c-auth', CAuth);




export {  }



