

type int = number
type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;


type State = {
    propa: bool,
}




class CTemplateLoad extends HTMLElement {

    s:State




    static get observedAttributes() { return ['closing']; }




    constructor() {   

        super(); 

        this.s = {
            propa: false
        }
    }




    async connectedCallback() {   

        const customelements = find_all_custom_components(this)
        
        await LazyLoad(customelements.map((name:str)=> { return {what:"components", name} }))

        this.sc()

        this.firstElementChild.addEventListener("closing", ()=> {
            // put in code eventually that will allow the host view to respond to closing
            this.firstElementChild.setAttribute("closing", "true")
        })

        this.firstElementChild.addEventListener("closed", ()=> {
            this.dispatchEvent(new Event("closed"))
        })
    }




    async attributeChangedCallback(name:str) {

        if (name === "closing") {
            this.firstElementChild.setAttribute("closing", "true")
        } 
    }



    sc(state_changes = {}) {   
        this.s = Object.assign(this.s, state_changes)
        Lit_Render(this.template(this.s), this);   
    }


    template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 
}




customElements.define('c-templateload', CTemplateLoad);




function find_all_custom_components(container_element:HTMLElement) {
    
    let all = container_element.getElementsByTagName("*")
    let all_custom = []

    for (let i = 0; i < all.length; i++) {
        if (all[i].tagName.startsWith("C-")) {
            all_custom.push(all[i].tagName.toLowerCase().substring(2).replace(/-/g, "_"))
        }
    }
    return all_custom
}


export {  }



