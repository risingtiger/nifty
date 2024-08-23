

import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;




type StateT = {
    placeholder: str,
}

type ModelT = {
    placeholder: str,
}




let distcss = `{--distcss--}`;




class CForm extends HTMLElement {

    s:StateT
    m:ModelT

    c_in_els:NodeListOf<HTMLElement>
    shadow:ShadowRoot




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = {
            placeholder: this.getAttribute("placeholder") || "",
        }


        SetDistCSS(this.shadow, distcss)
    }




    connectedCallback() {   

        this.sc()

        /*
        this.c_in_els = this.querySelectorAll("c-in");

        this.c_in_els.forEach((el:HTMLElement) => {
            el.addEventListener("save", (e:any) => {
                this.dispatchEvent(new CustomEvent("itemsave", { detail: e.detail }));
            });
        });
        */
    }




    sc() {   Lit_Render(this.template(this.s), this.shadow);   }




    template = (_s:StateT) => { return Lit_Html`{--devservercss--}{--html--}`; }; 
}




customElements.define('c-form', CForm);




export {  }



