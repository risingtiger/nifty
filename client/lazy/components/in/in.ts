

import { str, bool, num } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;


type State = {
    eltype: str,
    type: str,
    label: str,
    value: str,
    placeholder: str,
    opt_vals: str[],
    opt_labels: str[],
    opt_selected: num

}


let distcss = `{--distcss--}`;


class CIn extends HTMLElement {

    s:State
    shadow:ShadowRoot




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});



        this.s = {
            eltype: this.getAttribute("eltype") || "input",
            type: this.getAttribute("type") || "text",
            label: this.getAttribute("label") || "",
            value: this.getAttribute("value") || "",
            placeholder: this.getAttribute("placeholder") || "",
            opt_vals: [],
            opt_labels: [],
            opt_selected: 0,
        }

        SetDistCSS(this.shadow, distcss)
    }




    connectedCallback() {   

        const opts_str = this.getAttribute("opts") || "";
        const opt_vals:str[] = [];
        const opt_labels:str[] = [];
        
        let opt_selected = 0;

        if (opts_str) {
            opts_str.split(",").forEach((opt) => {
                const [val, label] = opt.split(";");
                opt_vals.push(val);
                opt_labels.push(label);
            })

            opt_selected = this.getAttribute("opt_selected") ? parseInt(this.getAttribute("opt_selected")!) : 0;

            this.s.opt_vals = opt_vals;
            this.s.opt_labels = opt_labels;
            this.s.opt_selected = opt_selected;
        }
        this.sc()
    }




    sc() {   Lit_Render(this.template(this.s), this.shadow);   }





    template = (_s:State) => { return Lit_Html`{--devservercss--}{--html--}`; }; 
}




customElements.define('c-in', CIn);




export {  }



