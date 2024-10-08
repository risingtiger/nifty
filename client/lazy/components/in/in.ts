


import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;



enum ModeT { EDIT = 0, VIEW = 1, SAVING = 2, SAVED = 3, ERRORED = 4}
enum LayoutT { ROW = 0, INLINE = 1 }
enum TypeT { INPUT = 0, DSELECT = 1, TOGGLE = 2 }
type InputStrT = "none" | "text" | "phone" | "email" | "password" | "number" | "url" | "date" | "time" | "datetime" | "month" | "week" | "color" | "search" | "file" | "range"
//enum InputTypeT { NONE = 0, TEXT = 1, PHONE = 2, EMAIL = 3, PASSWORD = 4, NUMBER = 5, URL = 6, DATE = 7, TIME = 8, DATETIME = 9, MONTH = 10, WEEK = 11, COLOR = 12, SEARCH = 13, FILE = 14, RANGE = 15 }


type StateT = {
    mode: ModeT,
    isanimating: bool,
    val: str,
    err_msg: str,
}

type ModelT = {
    layout: LayoutT,
    cansave: bool,
    name: str,
    type: TypeT,
    inputtype: InputStrT,
    label: str,
    labelwidth: num,
    placeholder: str,
}

type ElsT = {
    label:HTMLLabelElement|null,
    section:HTMLElement|null,
    view:HTMLSpanElement|null,
    edit:HTMLSpanElement|null,
    displayval:HTMLParagraphElement|null,
    action:HTMLElement|null,
    editdone:HTMLElement|null,
    animeffect:HTMLElement|null,
    input:HTMLInputElement|null,
    switch:HTMLSpanElement|null,
    dselect:HTMLElement|null,
}

type AnimationHandlesT = {
    view: Animation|null,
    edit: Animation|null,
}

type KeyframesT = {
    view: KeyframeEffect|null,
    edit: KeyframeEffect|null,
}







class CIn extends HTMLElement {

    s:StateT
    m:ModelT
    els:ElsT
    
    animatehandles: AnimationHandlesT
    keyframes: KeyframesT
    shadow:ShadowRoot

    static get observedAttributes() { return ['val']; }




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = { mode: ModeT.VIEW, val: "", isanimating: false, err_msg: "" }
        this.m = { layout: LayoutT.ROW, cansave:true, name: "", type: TypeT.INPUT, inputtype: "text", label: "", labelwidth: 0, placeholder: "" }
        this.els = { label: null, section: null, view: null, edit: null, displayval: null, action: null, editdone: null, animeffect: null, input: null, switch: null, dselect: null}

        this.animatehandles = { view: null, edit: null, }// label: null}
        this.keyframes = { view: null, edit: null, }// label: null}


    }




    connectedCallback() {   

        this.sc()

        const attr_typestr = this.getAttribute("type") || "toggle"

        this.s.val   = this.getAttribute("val") || ""
        this.m.label = this.getAttribute("label") || ""
        this.m.labelwidth = parseInt(this.getAttribute("labelwidth") || "125")
        this.m.layout = this.hasAttribute("inline") ? LayoutT.INLINE : LayoutT.ROW
        this.m.cansave = this.hasAttribute("nosave") ? false : true
        this.m.name = this.getAttribute("name") || ""

        if (attr_typestr === "toggle") {
            this.s.mode = ModeT.EDIT
            this.m.type = TypeT.TOGGLE
            this.m.inputtype = "none"

        } else if (attr_typestr === "dselect") {
            this.s.mode = !this.m.cansave ? ModeT.EDIT : ( this.hasAttribute("edit") ? ModeT.EDIT : ModeT.VIEW )
            this.m.type = TypeT.DSELECT
            this.m.inputtype = "none"

        } else { 
            this.s.mode = !this.m.cansave ? ModeT.EDIT : ( this.hasAttribute("edit") ? ModeT.EDIT : ModeT.VIEW )
            this.m.type = TypeT.INPUT
            this.m.inputtype = attr_typestr as any
        }

        const frag = document.createDocumentFragment()

        this.els.label = document.createElement("label")
        this.els.section = document.createElement("section")

        this.els.label.part.add("label")
        this.els.label.textContent = this.m.label
        this.els.label.style.width = this.m.labelwidth + "px"

        if (this.s.mode === ModeT.EDIT) {
            this.insert_edit()
        } else {
            this.insert_view()
        }

        frag.appendChild(this.els.label)
        frag.appendChild(this.els.section)

        this.shadow.appendChild(frag)

        this.addEventListener("click", (e) => this.clicked(e), true)

        this.classList.add ( this.m.layout === LayoutT.ROW ? 'row' : 'inline' )
    }




    async attributeChangedCallback(name:str, oldval:str, newval:str) {


        if (name === "val" && oldval !== null) { 

			this.s.val = newval

			if (this.m.type === TypeT.INPUT && this.els.input?.value !== newval) {
				this.els.input!.value = newval
			}
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




    public set_save_success(newval:str)         {   this.to_saved_result(newval);            }
    public set_save_fail(newval:str, error:str) {   this.to_error_result(newval, error);     }




    trigger_changed(newval:any, oldval:any) {

		this.dispatchEvent(new CustomEvent("changed", {detail: {newval, oldval}}))
	}




    clicked(e:Event) {

        let allow_propagation = false

        if (this.s.mode === ModeT.EDIT) {

            if (this.m.type === TypeT.TOGGLE) {
                allow_propagation = true
            }

            else if (this.m.type === TypeT.INPUT) {
                this.els.input?.focus()
                allow_propagation = true
            }

            else if (this.m.type === TypeT.DSELECT) {

                allow_propagation = true
            }
        }

        else if (this.s.mode === ModeT.VIEW) {

            if (this.m.type === TypeT.INPUT) {
                this.to_edit()
            }

            else if (this.m.type === TypeT.DSELECT) {
                this.to_edit()
            }
        }

        if (allow_propagation === false)
            e.stopPropagation()

        /*
        if (this.s.mode === ModeT.VIEW && this.m.dselect_initial_mode === ModeT.EDIT) {
            this.to_dselect_edit()
        }

        else {
            this.to_edit()
        }
        */
    }





    insert_edit(immediate_focus = false) {

        this.els.edit = document.createElement("span")
        this.els.edit.id = "edit"

        if (this.m.type === TypeT.TOGGLE) {
            this.els.switch = document.createElement("span")
            const span_inner_el = document.createElement("span")

            this.els.switch.className = "switch"
            span_inner_el.className = "inner"
            
            this.els.switch.style.transition = "none"
            span_inner_el.style.transition = "none"

            if (this.s.val === "true") { this.els.switch.classList.add("istrue") }

            this.els.switch.appendChild(span_inner_el)

            this.els.edit.appendChild(this.els.switch)

            setTimeout(() => {
                this.els.switch!.style.transition = ""
                span_inner_el.style.transition = ""
            }, 700)

            this.els.switch.addEventListener("click", () => {
                const newval = this.s.val === "true" ? "false" : "true"
				this.trigger_changed(newval, this.s.val)
                if (newval === "true") { this.els.switch!.classList.add("istrue") } else { this.els.switch!.classList.remove("istrue") }

                if (this.m.cansave) {  this.to_saving(newval, this.s.val) } else { this.setAttribute("val", newval); }
            })

        } else if (this.m.type === TypeT.INPUT) {

            this.els.input = document.createElement("input")
            this.els.input.type = this.els.input.type
            this.els.input.value = this.s.val
            this.els.input.placeholder = this.getAttribute("placeholder") || ""

            if (this.els.input.type === "range") {
                this.els.input.min = this.getAttribute("min") || ""
                this.els.input.max = this.getAttribute("max") || ""
            }

            this.els.edit.appendChild(this.els.input)

				
            this.els.input.addEventListener("input", () => {

				this.trigger_changed(this.els.input?.value, this.s.val)

				if (!this.m.cansave) {
					this.setAttribute("val", this.els.input?.value || "")
				}
            })

            if (this.m.cansave) {
                this.els.editdone = document.createElement("i")
                this.els.editdone.className = "icon-checkcircle"

                this.els.editdone.addEventListener("click", () => {
                    const newval = this.els.input?.value || ""
                    const oldval = this.s.val

                    if (this.m.cansave)   this.to_saving(newval, oldval); else this.s.val = newval;
                })

                this.els.edit.appendChild(this.els.editdone)

            } else {
                //
            }

            if (immediate_focus) {
                setTimeout(()=>this.els.input!.focus(), 800)
            }

        } else if (this.m.type === TypeT.DSELECT) {

            this.els.dselect = document.createElement("c-dselect")
            this.els.dselect.setAttribute("options", this.getAttribute("options") || "")
            this.els.dselect.setAttribute("val", this.s.val)


            this.els.dselect.addEventListener("changed", (e:Event) => {

				const e_newval = (e as CustomEvent).detail.newval || ""
				const e_oldval = (e as CustomEvent).detail.oldval

				this.trigger_changed(e_newval, e_oldval)

                if (this.m.cansave) {
                    this.to_saving((e as CustomEvent).detail.newval, (e as CustomEvent).detail.oldval); 
                } else { 
                    this.setAttribute("val", e_newval)
                }
            })

            this.els.dselect.addEventListener("cancelled", (_e:Event) => {
                if (this.m.cansave) {
                    this.s.mode = ModeT.SAVED
                    this.to_view()
                }
            })

            this.els.edit.appendChild(this.els.dselect)

            if (immediate_focus) {
                setTimeout(()=> this.els.dselect!.setAttribute("open", ""), 200)
            }
        }

        this.els.section?.appendChild(this.els.edit)
    }




    insert_view() {

        this.els.view = document.createElement("span")
        this.els.view.id = "view"
        this.els.displayval = document.createElement("p")
        this.els.action = document.createElement("i")

		if (this.m.type === TypeT.DSELECT) {

			const options = this.getAttribute("options") || ""
			if (options) {
				const options_arr = options.split(",")
				const option = options_arr.find((o:str) => o.split(":")[1] === this.s.val)
				this.els.displayval.textContent = option ? option.split(":")[0] : this.s.val

			} else {
				this.els.displayval.textContent = this.s.val
			}

		} else {

			this.els.displayval.textContent = this.s.val
		}

        this.els.view.appendChild(this.els.displayval)
        this.els.view.appendChild(this.els.action)

        if (this.s.err_msg) {
            const err_msg_el = document.createElement("span")
            err_msg_el.id = "err_msg"
            err_msg_el.textContent = this.s.err_msg
            this.els.view.appendChild(err_msg_el)
        }

        this.els.section?.appendChild(this.els.view) 
    }




    to_edit() {

        if (this.s.mode === ModeT.VIEW && this.s.isanimating === false) {

            this.s.mode = ModeT.EDIT
            this.s.isanimating = true

            this.insert_edit(true)

            this.set_animation()

            this.animatehandles!.edit!.play()
            this.animatehandles!.view!.play()

            this.animatehandles!.edit!.onfinish = () => {
                this.s.isanimating = false
                this.els.view?.parentElement?.removeChild(this.els.view)
            }
        }
    }




    to_saving(newval:str, oldval:str|null = null) { 

        if (this.s.mode === ModeT.EDIT && this.s.isanimating === false) {

            this.s.mode = ModeT.SAVING

            if (newval === oldval) {
                this.to_saved_result(newval)
                return
            }


            if (this.m.type === TypeT.TOGGLE) {
                //

            } else if (this.m.type === TypeT.INPUT) {
                this.els.editdone?.classList.add("hide_while_spinner")

            } else if (this.m.type === TypeT.DSELECT) {
                //
            }


            this.els.animeffect = document.createElement("c-animeffect")
            this.els.animeffect.setAttribute("active", "")

            this.els.edit?.appendChild(this.els.animeffect)
            /*
            if (this.m.type === TypeT.TOGGLE) {
            } else if (this.m.type === TypeT.INPUT) {
            } else if (this.m.type === TypeT.DSELECT) {
            }
            */

            this.els.animeffect.offsetWidth
            this.els.animeffect.className = "active"

            setTimeout(() => {
                this.dispatchEvent(new CustomEvent("save", {detail: { 
					name:this.m.name, 
					newval, oldval, 
					set_save_success: this.set_save_success.bind(this), 
					set_save_fail: this.set_save_fail.bind(this)
				}}))
            }, 500)
        }
    }




    to_saved_result(newval:str) {

        if (this.s.mode === ModeT.SAVING && this.s.isanimating === false) {

			this.s.err_msg = ""

            this.s.mode = ModeT.SAVED

            if (this.m.type === TypeT.TOGGLE) {

                this.els.animeffect?.remove()

                if (newval === "true") { this.els.switch!.classList.add("istrue"); } else { this.els.switch!.classList.remove("istrue"); } 

                this.setAttribute("val", newval!)

                this.s.mode = ModeT.EDIT

            } else if (this.m.type === TypeT.INPUT) {

                this.setAttribute("val", newval!)
                this.to_view()

            } else if (this.m.type === TypeT.DSELECT) {

                this.setAttribute("val", newval!)
                this.to_view()
            }
        }
    }




    to_error_result(newval:str, error:str) {

        if (this.s.mode === ModeT.SAVING && this.s.isanimating === false) {

            this.s.err_msg = error || "";

            if (this.m.type === TypeT.TOGGLE) {

                this.els.animeffect?.remove()

                if (this.s.val === "true") { this.els.switch!.classList.add("istrue"); } else { this.els.switch!.classList.remove("istrue"); } 

                this.s.mode = ModeT.EDIT

            } else if (this.m.type === TypeT.INPUT) {

                this.s.mode = ModeT.ERRORED
				this.setAttribute("val", (newval ? newval : this.s.val))
                this.els.input!.value = this.s.val
                this.to_view()

            } else if (this.m.type === TypeT.DSELECT) {

				this.setAttribute("val", this.s.val)

                this.s.mode = ModeT.ERRORED

                this.to_view()
            }

            console.error("error: " + error)
        }
    }




    to_view() {

        if ( (this.s.mode === ModeT.SAVED || this.s.mode === ModeT.ERRORED) && this.s.isanimating === false) {

            this.s.mode = ModeT.VIEW
            this.s.isanimating = true

            this.insert_view()

            this.set_animation()

            this.animatehandles!.edit!.reverse()
            this.animatehandles!.view!.reverse()

            this.animatehandles!.edit!.onfinish = () => {
                this.s.isanimating = false
                this.els.edit?.parentElement?.removeChild(this.els.edit)
            }
        }
    }




    set_animation() {

        const a = this.animatehandles
        const k = this.keyframes

        k.view = new KeyframeEffect(
            this.els.view, 
            [{opacity: 1, transform: "perspective(300px) translate3d(0, 0, 0)"}, {transform: "perspective(300px) translate3d(0, -21px, 0)", opacity: 0}], 
            {duration:290, easing: "cubic-bezier(.18,.24,.15,1)", fill: "both"}
        )

        k.edit = new KeyframeEffect(
            this.els.edit, 
            [{transform: "perspective(300px) translate3d(0, 21px, 13px) rotateX(72deg)", opacity: 0}, {transform: "perspective(300px) translate3d(0, 0, 0) rotateX(0)", opacity: 1}], 
            {duration:290, easing: "cubic-bezier(.18,.24,.15,1.0)", fill: "both"}
        )

        a.view = new Animation(k.view, document.timeline);
        a.edit = new Animation(k.edit, document.timeline);
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




    template = () => { return Lit_Html`{--css--}{--html--}`; }; 
}




customElements.define('c-in', CIn);


























export {  }



