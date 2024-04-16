

import { str, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;

type State = {
    prop: bool
}


let distcss = `{--distcss--}`;


class CForm extends HTMLElement {

    s:State
    shadow:ShadowRoot




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = {
            prop: false,
        }

        SetDistCSS(this.shadow, distcss)
    }




    connectedCallback() {   

        this.sc()

        this.shadow.querySelector("form")!.addEventListener("submit", (e:Event) => {
            e.preventDefault()
            console.log("form submitted")
            this.formsubmitted()
        })
    }




    sc() {   Lit_Render(this.template(this.s), this.shadow);   }




    formsubmitted() {

        const formel = this.querySelector("form") as HTMLFormElement

        const data = new FormData(formel)

        this.dispatchEvent(new CustomEvent("formsubmitted", {detail: data}))
    }




    template = (_s:State) => { return Lit_Html`{--devservercss--}{--html--}`; }; 
}




customElements.define('c-form', CForm);




export {  }



