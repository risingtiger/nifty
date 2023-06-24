

// type int = number
// type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;




type State = {
    propa: str,
}




class VAuth extends HTMLElement {

$:any 
s:State




static get observedAttributes() { return ['animateshow']; }




constructor() {   

    super(); 

    this.s = {
        propa: "",
    }

}




connectedCallback() {   

    setTimeout(()=> {   this.dispatchEvent(new Event('hydrate'))   }, 100)

    this.stateChanged()

}




stateChanged() {

    Lit_Render(this.template(this.s), this);

}




async Login() {

    const formel = this.querySelector("form[name='login']") as HTMLFormElement

    const els = formel.elements as any

    if ( (els.username.value === "robert@purewater-tech.com" && els.password.value === "pure312water!!") || (els.username.value === "davis@risingtiger.com" && els.password.value === "pure312water!!")) {

        (window as any).___passalong = true

        alert("Logged In Successfully")

        localStorage.setItem('cat', '-');
        localStorage.setItem('acc', els.username.value);

        window.location.hash = 'index'

    } else {
        alert("Wrong user name or password")
    }

}




template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 

}




customElements.define('v-auth', VAuth);




export {  }



