

import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;




enum WhatE { INIT, SPIN }

type StateT = {
    what: WhatE,
}

type ModelT = {
    what: WhatE,
}




let distcss = `{--distcss--}`;




class CAnimeffect extends HTMLElement {

    s:StateT
    m:ModelT

    shadow:ShadowRoot




    static get observedAttributes() { return ['active']; }




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = { what: WhatE.INIT } 


        SetDistCSS(this.shadow, distcss)
    }




    connectedCallback() {   
    }




    async attributeChangedCallback(name:str, _old_val:str, new_val:str) {

        if (name === "active" && new_val === "" ) { 

            if (this.s.what === WhatE.INIT) {

                switch (this.getAttribute("what")) {
                    case "spin": this.s.what = WhatE.SPIN; break;
                    default: this.s.what = WhatE.SPIN; break;
                }

                this.sc()
            }
        }
    }




    sc() {   Lit_Render(this.template(this.s, this.m), this.shadow);   }




    template = (_s:StateT, _m:ModelT) => { return Lit_Html`{--devservercss--}{--html--}`; }; 
}




customElements.define('c-animeffect', CAnimeffect);




export {  }



