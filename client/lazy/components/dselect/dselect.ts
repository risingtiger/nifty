

import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;



enum ModeT { CLOSED = 0, OPEN = 1 }

type OptionT = { val: str, label: str }


type StateT = {
    mode: ModeT,
    isanimating: bool,
    instigator_term: str,
    options_str: str
    val: str,
}

type ModelT = {
    is_options: bool
    /*
    width: str,
    height: str,
    top: str,
    left: str,
    */
}

type ElsT = {
    instigator: HTMLElement,
    view: HTMLDialogElement,
}




const DEFAULT_VIEW_WIDTH = 100
const DEFAULT_VIEW_HEIGHT = 200
const DUMMY_EL = document.createElement("div")








class CDselect extends HTMLElement {

    s:StateT
    m:ModelT
    els:ElsT

    animatehandles: { view: Animation|null, instigator: Animation|null, } //label: Animation|null }
    keyframes: { view: KeyframeEffect|null, instigator: KeyframeEffect|null, } //label: KeyframeEffect|null}
    shadow:ShadowRoot




    static get observedAttributes() { return ['term']; }




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = { mode: ModeT.CLOSED, isanimating: false, instigator_term: "", options_str: "", val: ""}
        this.m = { is_options: false }
        this.els = { instigator: DUMMY_EL, view: (DUMMY_EL as any)}

        this.animatehandles = { view: null, instigator: null, }// label: null}
        this.keyframes = { view: null, instigator: null, }// label: null}


    }




    connectedCallback() {   

        this.sc()

        const instigator_term = this.getAttribute("term") || ""

        this.els.instigator = this.shadow.getElementById("instigator") as HTMLElement
        this.m.is_options = this.hasAttribute("options")
        this.els.view = this.shadow.getElementById("view") as HTMLDialogElement

        if (instigator_term) {

            this.els.instigator.textContent = instigator_term
            this.els.instigator.classList.add("active")

            this.els.instigator.addEventListener("click", () => this.instigatorclicked())
            this.els.view.addEventListener("click", (e) => this.viewclicked(e))

        } else {

            this.to_open()
        }
    }




    async attributeChangedCallback(name:str, old_val:str, new_val:str) {

        if (name === "term" && old_val !== null) { 
            this.els.instigator.textContent = new_val
        }

        /*
        if (name === "val" && this.s.mode === 'saving' && this.s.isanimating === false) { 
            this.to_saved(new_val)
        }

        else if (name === "gomodeedit" && old_val !== null && this.s.mode === 'view' && this.s.isanimating === false) {
            this.to_edit()
        }
        */
    }




    /*
    EditDoneClicked() {
        if (this.s.mode === 'edit' && this.s.isanimating === false) {

            const inputel = this.shadow.getElementById("input") as HTMLInputElement
            if (inputel.value === this.s.val) {
                this.to_view()
            }

            else {
                this.to_saving()
            }

        }
    }
    */




    sc() {   Lit_Render(this.template(), this.shadow);   }




    OpenIt() {
        this.to_open()
    }




    GetMode() {   return this.s.mode;   }




    SetValAndTerm(val:str, term:str) {

        if (this.s.mode === ModeT.CLOSED) {
            this.s.val = val
            this.els.instigator.textContent = term

            this.setAttribute("term", term)
            this.setAttribute("val", val)
        }
    }




    viewclicked(e:Event) {

        if (e.target === this.els.view) {
            this.dispatchEvent(new CustomEvent("closed", {detail:{}}))
            this.to_closed()
        }
    }




    instigatorclicked() {

        this.to_open()
    }




    to_open() {

        const xy = this.els.instigator.getBoundingClientRect()

        const width = "200px"
        const top = (xy.top - 100).toString() + "px"
        const left = (xy.left + (xy.width - 243)).toString() + "px"

        if (this.s.mode === ModeT.CLOSED && this.s.isanimating === false) {

            const height = "300px"

            this.els.view.style.width = width
            this.els.view.style.height = height
            
            this.els.view.style.top   = top
            this.els.view.style.left  = left

            if (this.m.is_options) {

                const options_str = this.getAttribute("options") || ""
                const option_val = this.getAttribute("val") || ""

                const options = parse_options(options_str)

                const option_items_ul = render_options(options, option_val, this.optionclicked.bind(this))

                const existing_ul = this.shadow.getElementById("option_items") as HTMLUListElement

                if (existing_ul) {
                    existing_ul.remove()
                }

                this.els.view.querySelector("#wrap")!.prepend(option_items_ul)
            }

            (this.els.view as HTMLDialogElement).showModal()

            this.s.mode = ModeT.OPEN
        }
    }




    to_closed() {

        if (this.s.mode === ModeT.OPEN && this.s.isanimating === false) {
            this.s.mode = ModeT.CLOSED;
            (this.els.view as HTMLDialogElement).classList.add("closing")

            setTimeout(() => {
                (this.els.view as HTMLDialogElement).classList.remove("closing");
                (this.els.view as HTMLDialogElement).close();
            }, 400)
        }
    }




    optionclicked(e:MouseEvent) {

        const el = e.currentTarget as HTMLElement

        this.els.view.querySelectorAll("#option_items > li").forEach((x,_i) => {
            x.classList.remove("selected")
        })

        el.classList.add("selected")

        const detail:any = {}

        if (this.m.is_options) {

            const val = el.querySelector("h5")!.getAttribute("val")!
            const term = el.querySelector("h5")!.textContent!

            detail.newval = val
            detail.oldval = this.s.val

            this.s.val = val
            this.els.instigator.textContent = term

            this.setAttribute("term", term)
            this.setAttribute("val", val)

            this.els.instigator.textContent = term
        }

        this.dispatchEvent(new CustomEvent("changed", {detail}))

        this.to_closed()
    }




    animate_view_end() {
        if (this.animatehandles.view!.currentTime === 0) {

        } else {
            //this.els.view.style.display = "none";
        }

        this.s.isanimating = false
    }




    animate_instigator_end() {
        if (this.animatehandles.instigator!.currentTime === 0) {


        } else {

            //this.els.input.select();
        }

    }




    template = () => { return Lit_Html`{--css--}{--html--}`; }; 
}




customElements.define('c-dselect', CDselect);




function render_options(options:OptionT[], options_val:str, optionclicked:(e:MouseEvent) => void) : HTMLUListElement {

    const ulitemsel = document.createElement("ul")
    ulitemsel.classList.add("items")
    ulitemsel.id = "option_items"

    ulitemsel.classList.add("items")

    options.forEach((x) => {

        const liel = document.createElement("li")

        const h5el = document.createElement("h5")
        h5el.textContent = x.label
        h5el.setAttribute("val",x.val)

        liel.appendChild(h5el)

        const iel = document.createElement("i")
        iel.classList.add("icon-checkcircle")
        iel.classList.add("action")
        liel.appendChild(iel)

        if (x.val === options_val) {
            liel.classList.add("selected")
        }

        liel.addEventListener("click", (e:MouseEvent) => optionclicked(e))

        ulitemsel.appendChild(liel)
    })

    return ulitemsel
}




function parse_options(options_str:str) : OptionT[] {

    const options:OptionT[] = options_str.split(",").map((x,_i) => {

        const parts = x.trim().split(":")

        return {
            label: parts[0], val: parts[1] 
        }
    })

    return options
}



export {  }



