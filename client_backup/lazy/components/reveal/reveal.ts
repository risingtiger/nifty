
// TODO: wrapper animates at different rate than sibling list items. dont look right. fix it

import { str, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;

type State = {
    siblinglevel: "parent" | "self",
    selfactuated: bool,
    parent: HTMLElement,
    grandparent: HTMLElement,
    grandparent_children: HTMLElement[],
    parentindex: number,
    //nextsibling: HTMLElement,
    wrap: HTMLElement,
    parent_height: number,
    isopen: bool
}


let distcss = `{--distcss--}`;


class CReveal extends HTMLElement {

    s:State
    shadow:ShadowRoot




    static get observedAttributes() { return ['active']; }




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = {
            siblinglevel: "parent",
            selfactuated: true,
            parent: this.parentElement as HTMLElement,
            grandparent: this.parentElement!.parentElement as HTMLElement,
            grandparent_children: Array.from(this.parentElement!.parentElement!.children) as HTMLElement[],
            parentindex: (Array.from(this.parentElement!.parentElement!.children)).indexOf(this.parentElement!),
            //nextsibling: this,
            wrap: this, // to be attached after connectedCallback
            parent_height: 0,
            isopen: false
        }

        SetDistCSS(this.shadow, distcss)
    }




    connectedCallback() {   


        if (this.s.selfactuated) { 

            this.s.parent.addEventListener("click", (e:any)=> { 

                if (e.srcElement.closest("c-reveal") === this) { return }


                if (this.s.siblinglevel === "self") { console.info("will build this in at some point"); return }


                if (this.s.grandparent_children.find(a=> a.dataset._reveal_transitioning === "true")) { return; }


                let x = this.hasAttribute("active")

                if (x)
                    this.removeAttribute("active")
                else
                    this.setAttribute("active", "")
            })
        }

        this.sc()
    }




    async attributeChangedCallback(name:str, _oldval:str, newval:str) {

        if (name === "active") { 
            let active = newval === null ? false : true

            if (active) { this.showit() } else { this.closeit() }
        }
    }



    sc() {   Lit_Render(this.template(this.s), this.shadow);   }




    showit() {

        if (this.s.siblinglevel === "self") { console.info("will build this in at some point"); return }

        this.s.wrap = this.shadow.querySelector(".wrap") as HTMLElement,
        this.s.parent_height = this.parentElement!.offsetHeight,


        this.s.parent.dataset._reveal_transitioning = "true"
        this.s.parent.style.position = "relative"
        this.style.display = "block"
        this.style.top = this.s.parent_height + "px"
        
        for(const a of this.s.grandparent_children) {
            a.style.transition = `transform 0.9s cubic-bezier(0.91, 0, 0.19, 1)`
        }

        this.addEventListener("transitionend", open_end)

        setTimeout(this.showit_after_timeout.bind(this), 10)

        function open_end() {
            delete this.s.parent.dataset._reveal_transitioning
            this.removeEventListener("transitionend", open_end)
        }
    }
    showit_after_timeout() {

        const height = this.offsetHeight
        this.style.clipPath = `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`
        this.s.wrap.style.opacity = '1.0';
        this.s.wrap.style.transform = `translateY(0px)`

        for(let i = this.s.parentindex + 1; i < this.s.grandparent_children.length; i++) {
            const a = this.s.grandparent_children[i]

            const m = a.style.transform.match(/translateY\(([0-9]+)px\)/)
            const y = m ? Number(m[1]) : 0
            a.style.transform = `translateY(${y + height}px)`
        }
    }




    closeit() {

        if (this.s.siblinglevel === "self") { console.info("will build this in at some point"); return }


        this.s.parent.dataset._reveal_transitioning = "true"

        this.addEventListener("transitionend", close_end)

        this.style.clipPath = `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`
        this.s.wrap.style.transform = `translateY(-20px)`
        this.s.wrap.style.opacity = `0`

        if (!this.s.grandparent_children[this.s.parentindex + 1]) {   return   }


        //const m = this.s.grandparent_children[this.s.parentindex + 1].style.transform.match(/translateY\(([0-9]+)px\)/)

        const height = this.offsetHeight

        //let y = m ? Number(m[1]) : 0

        for(let i = this.s.parentindex + 1; i < this.s.grandparent_children.length; i++) {
            const a = this.s.grandparent_children[i]

            const a_m = a.style.transform.match(/translateY\(([0-9]+)px\)/)
            const a_y = a_m ? Number(a_m[1]) : 0

            a.style.transform = `translateY(${a_y - height}px)`
        }

        function close_end() {
            delete this.s.parent.dataset._reveal_transitioning
            this.s.parent.style.position = "inherit"
            this.style.display = "none"
            this.removeEventListener("transitionend", close_end)
        }
    }




    template = (_s:State) => { return Lit_Html`{--devservercss--}{--html--}`; }; 
}




customElements.define('c-reveal', CReveal);




/*
function fncy() {
}
*/


export {  }



