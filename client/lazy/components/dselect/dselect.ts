

import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;



enum ModeE { CLOSED = 0, OPEN = 1 }
enum TypeE { SELECTBOX = 0, MENU = 1, GENERAL = 1 }

type OptionT = { val: str, label: str }


type StateT = {
    mode: ModeE,
    isanimating: bool,
    instigator_term: str,
    options_str: str,
    options: OptionT[],
    val: str,
    term: str,
	did_first_run: bool
}

type ModelT = {
    type: TypeE
    /*
    width: str,
    height: str,
    top: str,
    left: str,
    */
}

type ElsT = {
    instigator: HTMLElement,
    instigator_cnt: HTMLElement,
    dialog_view: HTMLDialogElement,
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




    static get observedAttributes() { return ['term','val','open']; }




    constructor() {   

		super(); 

		this.shadow = this.attachShadow({mode: 'open'});

		this.s = { mode: ModeE.CLOSED, isanimating: false, instigator_term: "", options: [], options_str: "", val: "", term: "", did_first_run:false }
		this.m = { type: TypeE.SELECTBOX }
		this.els = { instigator: DUMMY_EL, instigator_cnt: DUMMY_EL, dialog_view: (DUMMY_EL as any)}

		this.animatehandles = { view: null, instigator: null, }// label: null}
		this.keyframes = { view: null, instigator: null, }// label: null}


    }




    connectedCallback() {   

		this.s.options_str = this.getAttribute("options") || "";
		this.s.val = this.getAttribute("val") || "";

		const typestr:str = this.getAttribute("type") || (this.s.options_str ? "selectbox" : "general");

		switch (typestr) {
			case "selectbox": this.m.type = TypeE.SELECTBOX; break;
			case "menu": this.m.type = TypeE.MENU; break;
			default: this.m.type = TypeE.GENERAL; break;
		}

		if (this.s.options_str)   this.s.options = parse_options(this.s.options_str)

        this.s.term = set_term(this.getAttribute("term"), this.m.type, this.s.options, this.s.val)

        this.sc()

        this.els.instigator = this.shadow.getElementById("instigator") as HTMLElement
        this.els.instigator_cnt = this.els.instigator.querySelector(".cnt") as HTMLElement
        this.els.dialog_view = this.shadow.getElementById("dialog_view") as HTMLDialogElement

		this.els.instigator.addEventListener("click", () => this.instigator_clicked())
		this.els.dialog_view.addEventListener("click", (e) => this.dialog_clicked(e))

		this.s.did_first_run = true

		if (this.hasAttribute("open")) {
			setTimeout(()=>this.to_open(),20)
		}
    }




    async attributeChangedCallback(name:str, old_val:str, new_val:str) {

		if (this.s.did_first_run === false) return


        if (name === "term") { 
			this.s.term = set_term(new_val, this.m.type, this.s.options, this.s.val)
			this.sc()
        }

		else if (name === "val") { 
			this.s.val = new_val
			this.sc()

			if (this.s.mode === ModeE.OPEN && this.m.type === TypeE.SELECTBOX) {
				set_active_option(this.els.dialog_view, new_val)
			}
        }

		else if (name === "open" && new_val === "" && old_val === null && this.s.mode === ModeE.CLOSED) { 
			this.to_open()
		}

		else if (name === "open" && new_val === null && old_val === "" && this.s.mode === ModeE.OPEN) { 
			this.to_closed()
		} 
    }




    sc() {   Lit_Render(this.template(this.s), this.shadow);   }




    dialog_clicked(e:MouseEvent) {
		if (e.target === this.els.dialog_view && this.s.mode === ModeE.OPEN) {
			this.removeAttribute("open")
			this.dispatchEvent(new CustomEvent("cancelled", {}))
		}
    }




    instigator_clicked() {
		this.setAttribute("open", "")
    }




    async option_clicked(e:MouseEvent) { // only when is of type options, vs general

        const el = e.currentTarget as HTMLElement

        const detail:any = {}

		const val = el.getAttribute("val")!
		const term = el.querySelector("h5")!.textContent!

		detail.newval = val
		detail.oldval = this.s.val

		this.setAttribute("val", val)
		this.setAttribute("term", term)

		setTimeout(()=> {
			this.removeAttribute("open")
			this.dispatchEvent(new CustomEvent("changed", {detail}))
		}, 200)
    }



    to_open = () => {

        if (this.s.mode === ModeE.CLOSED && this.s.isanimating === false) {

            const xy = this.els.instigator.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const viewportWidth = window.innerWidth
            const margin = 3 


            if (this.m.type === TypeE.SELECTBOX || this.m.type === TypeE.MENU) {
                const option_items_ul = render_options(this.s.options, this.s.val, this.m.type, this.option_clicked.bind(this))

                const existing_ul = this.shadow.getElementById("option_items") as HTMLUListElement

                if (existing_ul) {
                    existing_ul.remove()
                }

                this.els.dialog_view.querySelector("#dialog_wrap")!.prepend(option_items_ul)
            }

            this.els.dialog_view.style.visibility = 'hidden'
            this.els.dialog_view.style.display = 'block'
            
            const dialogContent = this.els.dialog_view.querySelector("#dialog_wrap") as HTMLElement
            const contentHeight = dialogContent.offsetHeight
            const contentWidth  = dialogContent.offsetWidth
            const dialogHeight  = contentHeight + 7 
            const dialogWidth   = contentWidth 

            const width = `${dialogWidth}px`

            this.els.dialog_view.style.display = ''
            this.els.dialog_view.style.visibility = ''

            const height = `${dialogHeight}px`

            let top: number
            if (xy.bottom + dialogHeight + margin <= viewportHeight) {
                // Enough space below the instigator
                top = xy.bottom + margin
            } else if (xy.top - dialogHeight - margin >= 0) {
                // Not enough space below, but enough space above
                top = xy.top - dialogHeight - margin
            } else {
                // Not enough space above or below, center it on the screen
                top = Math.max(0, (viewportHeight - dialogHeight) / 2)
            }

            let left: number
            if (xy.left + dialogWidth + margin <= viewportWidth) {
                // Enough space to the right of the instigator
                left = xy.left
            } else if (xy.right - dialogWidth - margin >= 0) {
                // Not enough space to the right, but enough space to the left
                left = xy.right - dialogWidth
            } else {
                // Not enough space on either side, center it horizontally
                left = Math.max(0, (viewportWidth - dialogWidth) / 2)
            }

            this.els.dialog_view.style.width = width
            this.els.dialog_view.style.height = height
            
            this.els.dialog_view.style.top = `${top}px`;
            this.els.dialog_view.style.left = `${left}px`;

            (this.els.dialog_view as HTMLDialogElement).showModal()

            this.s.mode = ModeE.OPEN

            this.sc()
        }
    }




    to_closed = () => new Promise<void>((resolve) => {

        if (this.s.mode === ModeE.OPEN && this.s.isanimating === false) {
			this.sc()
            this.s.mode = ModeE.CLOSED;
            this.els.dialog_view.classList.add("closing")

            setTimeout(() => {
                this.els.dialog_view.classList.remove("closing");
                this.els.dialog_view.close();
				resolve()
            }, 400)
        }
    })








    animate_view_end() {
        if (this.animatehandles.view!.currentTime === 0) {

        } else {
            //this.els.dialog_view.style.display = "none";
        }

        this.s.isanimating = false
    }




    animate_instigator_end() {
        if (this.animatehandles.instigator!.currentTime === 0) {


        } else {

            //this.els.input.select();
        }

    }




    template = (_s:StateT) => { return Lit_Html`{--css--}{--html--}`; }; 
}




customElements.define('c-dselect', CDselect);




function render_options(options:OptionT[], options_val:str, type:TypeE, option_clicked:(e:MouseEvent) => void) : HTMLUListElement {

    const ulitemsel = document.createElement("ul")
    ulitemsel.classList.add("options")
    ulitemsel.id = "option_items"

    ulitemsel.classList.add("items")

    options.forEach((x) => {

        const liel = document.createElement("li")

        const h5el = document.createElement("h5")
        h5el.textContent = x.label
        liel.setAttribute("val",x.val)

        liel.appendChild(h5el)

		if (x.val === options_val && type === TypeE.SELECTBOX) {
			liel.classList.add("selected")
		} else {
			liel.insertAdjacentHTML("beforeend", `<span class='postpend'></span>`)
		}

		liel.insertAdjacentHTML("beforeend", `<span class='postpend'></span>`)

        liel.addEventListener("click", (e:MouseEvent) => option_clicked(e))

        ulitemsel.appendChild(liel)
    })

    return ulitemsel
}




function parse_options(options_str:str) : OptionT[] {

    const options:OptionT[] = options_str.split(",").map((x,_i) => {

        const parts = x.trim().split(":")

        return {
            label: parts[0], val: parts[1] ?? parts[0] 
        }
    })

    return options
}




function set_term(term:str|null, type:TypeE, options:OptionT[]|null, val:str) : str {

	if (term) {
		return term

	} else if (!term && (type === TypeE.SELECTBOX || type === TypeE.MENU)) {

		const option = options ? options.find(o => o.val === val) : null
		return option ? option.label : val

	} else {
		return val
	}
}




function set_active_option(dialog_view_el:HTMLElement, val:str) {

	const option_els = dialog_view_el.querySelectorAll("#option_items > li")

	option_els.forEach((x,_i) => {   x.classList.remove("selected")   })

	const active_li_el = dialog_view_el.querySelector(`#option_items > li[val='${val}']`) as HTMLElement
	active_li_el.classList.add("selected")
}


export {  }



