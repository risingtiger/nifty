

import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;
declare var LazyLoad: any;




type StateT = {
    propa: bool,
}

type ModelT = {
    propa: bool,
}




class CTl extends HTMLElement {

    s:StateT
    m:ModelT




    static get observedAttributes() { return ['close']; }




    constructor() {   

        super(); 

        this.s = {
            propa: false
        }
    }




    async connectedCallback() {   

        const customelements_to_load = find_all_custom_components_to_load(this)
        
        if (customelements_to_load.length > 0)
            await LazyLoad(customelements_to_load.map((name:str)=> { return {what:"components", name} }))

        this.firstElementChild!.addEventListener("close", ()=> {
            this.dispatchEvent(new Event("close"))
        })

        this.sc()
    }




    async attributeChangedCallback(name:str) {

        if (name === "close") {
            this.firstElementChild!.setAttribute("close", "true")
        } 
    }



    sc(state_changes = {}) {   
        this.s = Object.assign(this.s, state_changes)
        Lit_Render(this.template(this.s, this.m), this);   
    }


    template = (_s:StateT, _m:ModelT) => { return Lit_Html`{--htmlcss--}`; }; 
}




customElements.define('c-tl', CTl);




function find_all_custom_components_to_load(container_element:HTMLElement) {
    
    const allels:any = []
    const allels_str:str[] = []

    for(const el of container_element.children) {

        if (el.tagName.startsWith("C-"))   allels.push(el)

        for(const ell of el.children) {
            if (ell.tagName.startsWith("C-"))   allels.push(ell)
        }
    }

    for (let i = 0; i < allels.length; i++) {
        const namestartsat = allels[i].tagName.indexOf("-") + 1
        allels_str.push(allels[i].tagName.toLowerCase().substring(namestartsat).replace(/-/g, "_"))
    }

    return allels_str
}



export {  }




