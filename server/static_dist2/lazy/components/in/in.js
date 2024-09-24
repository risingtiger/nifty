var ModeT;
(function(ModeT) {
    ModeT[ModeT["EDIT"] = 0] = "EDIT";
    ModeT[ModeT["VIEW"] = 1] = "VIEW";
    ModeT[ModeT["SAVING"] = 2] = "SAVING";
    ModeT[ModeT["SAVED"] = 3] = "SAVED";
    ModeT[ModeT["ERRORED"] = 4] = "ERRORED";
})(ModeT || (ModeT = {}));
var LayoutT;
(function(LayoutT) {
    LayoutT[LayoutT["ROW"] = 0] = "ROW";
    LayoutT[LayoutT["INLINE"] = 1] = "INLINE";
})(LayoutT || (LayoutT = {}));
var TypeT;
(function(TypeT) {
    TypeT[TypeT["INPUT"] = 0] = "INPUT";
    TypeT[TypeT["DSELECT"] = 1] = "DSELECT";
    TypeT[TypeT["TOGGLE"] = 2] = "TOGGLE";
})(TypeT || (TypeT = {}));
class CIn extends HTMLElement {
    s;
    m;
    els;
    animatehandles;
    keyframes;
    shadow;
    static get observedAttributes() {
        return [
            'val'
        ];
    }
    constructor(){
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.s = {
            mode: 1,
            val: "",
            term: "",
            error: "",
            isanimating: false
        };
        this.m = {
            layout: 0,
            cansave: true,
            name: "",
            type: 0,
            inputtype: "text",
            label: "",
            labelwidth: 0,
            placeholder: ""
        };
        this.els = {
            label: null,
            section: null,
            view: null,
            edit: null,
            displayval: null,
            action: null,
            editdone: null,
            animeffect: null,
            input: null,
            switch: null,
            dselect: null
        };
        this.animatehandles = {
            view: null,
            edit: null
        } // label: null}
        ;
        this.keyframes = {
            view: null,
            edit: null
        } // label: null}
        ;
    }
    connectedCallback() {
        this.sc();
        const attr_typestr = this.getAttribute("type") || "toggle";
        this.s.val = this.getAttribute("val") || "";
        this.m.label = this.getAttribute("label") || "";
        this.m.labelwidth = parseInt(this.getAttribute("labelwidth") || "125");
        this.m.layout = this.hasAttribute("inline") ? 1 : 0;
        this.m.cansave = this.hasAttribute("nosave") ? false : true;
        this.m.name = this.getAttribute("name") || "";
        if (attr_typestr === "toggle") {
            this.s.mode = 0;
            this.m.type = 2;
            this.m.inputtype = "none";
        } else if (attr_typestr === "dselect") {
            this.s.mode = !this.m.cansave ? 0 : this.hasAttribute("edit") ? 0 : 1;
            this.m.type = 1;
            this.m.inputtype = "none";
            this.s.term = this.getAttribute("term") || "";
        } else {
            this.s.mode = !this.m.cansave ? 0 : this.hasAttribute("edit") ? 0 : 1;
            this.m.type = 0;
            this.m.inputtype = attr_typestr;
        }
        const frag = document.createDocumentFragment();
        this.els.label = document.createElement("label");
        this.els.section = document.createElement("section");
        this.els.label.part.add("label");
        this.els.label.textContent = this.m.label;
        this.els.label.style.width = this.m.labelwidth + "px";
        if (this.s.mode === 0) {
            this.insert_edit();
        } else {
            this.insert_view();
        }
        frag.appendChild(this.els.label);
        frag.appendChild(this.els.section);
        this.shadow.appendChild(frag);
        this.addEventListener("click", (e)=>this.clicked(e), true);
        this.classList.add(this.m.layout === 0 ? 'row' : 'inline');
    }
    async attributeChangedCallback(name, oldval, newval) {
        if (name === "val" && oldval !== null) {
            this.s.val = newval;
            if (this.m.type === 0 && this.els.input?.value !== newval) {
                this.els.input.value = newval;
            }
        }
    /*
        if (name === "val" && this.s.mode === 'saving' && this.s.isanimating === false) { 
            this.to_saved(new_val)
        }

        else if (name === "gomodeedit" && old_val !== null && this.s.mode === 'view' && this.s.isanimating === false) {
            this.to_edit()
        }
        */ }
    SaveResponse(newval, newterm) {
        this.to_saved_result(newval, newterm);
    }
    SaveResponseError(error) {
        this.to_error_result(error);
    }
    trigger_changed(newval, oldval) {
        this.dispatchEvent(new CustomEvent("changed", {
            detail: {
                newval,
                oldval
            }
        }));
    }
    clicked(e) {
        let allow_propagation = false;
        if (this.s.mode === 0) {
            if (this.m.type === 2) {
                allow_propagation = true;
            } else if (this.m.type === 0) {
                this.els.input?.focus();
                allow_propagation = true;
            } else if (this.m.type === 1) {
                allow_propagation = true;
            /*
                if ((this.els.dselect as any).GetMode() === 1) {
                    allow_propagation = true
                } else {
                    (this.els.dsselect as any).OpenIt();
                }
                */ }
        } else if (this.s.mode === 1) {
            if (this.m.type === 0) {
                this.to_edit();
            } else if (this.m.type === 1) {
                this.to_edit();
            }
        }
        if (allow_propagation === false) e.stopPropagation();
    /*
        if (this.s.mode === ModeT.VIEW && this.m.dselect_initial_mode === ModeT.EDIT) {
            this.to_dselect_edit()
        }

        else {
            this.to_edit()
        }
        */ }
    insert_edit(immediate_focus = false) {
        this.els.edit = document.createElement("span");
        this.els.edit.id = "edit";
        if (this.m.type === 2) {
            this.els.switch = document.createElement("span");
            const span_inner_el = document.createElement("span");
            this.els.switch.className = "switch";
            span_inner_el.className = "inner";
            this.els.switch.style.transition = "none";
            span_inner_el.style.transition = "none";
            if (this.s.val === "true") {
                this.els.switch.classList.add("istrue");
            }
            this.els.switch.appendChild(span_inner_el);
            this.els.edit.appendChild(this.els.switch);
            setTimeout(()=>{
                this.els.switch.style.transition = "";
                span_inner_el.style.transition = "";
            }, 700);
            this.els.switch.addEventListener("click", ()=>{
                const newval = this.s.val === "true" ? "false" : "true";
                this.trigger_changed(newval, this.s.val);
                if (newval === "true") {
                    this.els.switch.classList.add("istrue");
                } else {
                    this.els.switch.classList.remove("istrue");
                }
                if (this.m.cansave) {
                    this.to_saving(newval, this.s.val);
                } else {
                    this.setAttribute("val", newval);
                }
            });
        } else if (this.m.type === 0) {
            this.els.input = document.createElement("input");
            this.els.input.type = this.els.input.type;
            this.els.input.value = this.s.val;
            this.els.input.placeholder = this.getAttribute("placeholder") || "";
            if (this.els.input.type === "range") {
                this.els.input.min = this.getAttribute("min") || "";
                this.els.input.max = this.getAttribute("max") || "";
            }
            this.els.edit.appendChild(this.els.input);
            this.els.input.addEventListener("input", ()=>{
                this.trigger_changed(this.els.input?.value, this.s.val);
                if (!this.m.cansave) {
                    this.setAttribute("val", this.els.input?.value || "");
                }
            });
            if (this.m.cansave) {
                this.els.editdone = document.createElement("i");
                this.els.editdone.className = "icon-edit2";
                this.els.editdone.addEventListener("click", ()=>{
                    const newval = this.els.input?.value || "";
                    const oldval = this.s.val;
                    if (this.m.cansave) this.to_saving(newval, oldval);
                    else this.s.val = newval;
                });
                this.els.edit.appendChild(this.els.editdone);
            } else {
            //
            }
            if (immediate_focus) {
                setTimeout(()=>this.els.input.focus(), 800);
            }
        } else if (this.m.type === 1) {
            this.els.dselect = document.createElement("c-dselect");
            this.els.dselect.setAttribute("options", this.getAttribute("options") || "");
            this.els.dselect.setAttribute("term", this.s.term || "");
            this.els.dselect.setAttribute("val", this.s.val);
            this.els.dselect.addEventListener("changed", (e)=>{
                const e_newval = e.detail.newval;
                const e_oldval = e.detail.oldval;
                this.trigger_changed(e_newval, e_oldval);
                if (this.m.cansave) {
                    this.to_saving(e.detail.newval, e.detail.oldval);
                } else {
                    const v = this.els.dselect.getAttribute("val") || "";
                    const t = this.els.dselect.getAttribute("term") || "";
                    this.setAttribute("val", v);
                    this.setAttribute("term", t);
                }
            });
            this.els.dselect.addEventListener("closed", (_e)=>{
                if (this.m.cansave) {
                    this.s.mode = 3;
                    this.to_view();
                }
            });
            this.els.edit.appendChild(this.els.dselect);
            if (immediate_focus) {
                setTimeout(()=>this.els.dselect.OpenIt(), 20);
            }
        }
        this.els.section?.appendChild(this.els.edit);
    }
    insert_view() {
        this.els.view = document.createElement("span");
        this.els.view.id = "view";
        this.els.displayval = document.createElement("p");
        this.els.action = document.createElement("i");
        this.els.action.className = "icon-edit1";
        this.els.displayval.textContent = this.s.term || this.s.val;
        this.els.view.appendChild(this.els.displayval);
        this.els.view.appendChild(this.els.action);
        this.els.section?.appendChild(this.els.view);
    }
    to_edit() {
        if (this.s.mode === 1 && this.s.isanimating === false) {
            this.s.mode = 0;
            this.s.isanimating = true;
            this.insert_edit(true);
            this.set_animation();
            this.animatehandles.edit.play();
            this.animatehandles.view.play();
            this.animatehandles.edit.onfinish = ()=>{
                this.s.isanimating = false;
                this.els.view?.parentElement?.removeChild(this.els.view);
            };
        }
    }
    to_saving(newval, oldval = null) {
        if (this.s.mode === 0 && this.s.isanimating === false) {
            this.s.mode = 2;
            if (newval === oldval) {
                this.to_saved_result(newval, oldval);
                return;
            }
            if (this.m.type === 2) {
            //
            } else if (this.m.type === 0) {
                this.els.editdone?.classList.add("hide_while_spinner");
            } else if (this.m.type === 1) {
            //
            }
            this.els.animeffect = document.createElement("c-animeffect");
            this.els.animeffect.setAttribute("active", "");
            this.els.edit?.appendChild(this.els.animeffect);
            /*
            if (this.m.type === TypeT.TOGGLE) {
            } else if (this.m.type === TypeT.INPUT) {
            } else if (this.m.type === TypeT.DSELECT) {
            }
            */ this.els.animeffect.offsetWidth;
            this.els.animeffect.className = "active";
            setTimeout(()=>{
                this.dispatchEvent(new CustomEvent("save", {
                    detail: {
                        name: this.m.name,
                        newval,
                        oldval
                    }
                }));
            }, 500);
        }
    }
    to_saved_result(newval, term) {
        if (this.s.mode === 2 && this.s.isanimating === false) {
            this.s.mode = 3;
            if (this.m.type === 2) {
                this.els.animeffect?.remove();
                if (newval === "true") {
                    this.els.switch.classList.add("istrue");
                } else {
                    this.els.switch.classList.remove("istrue");
                }
                this.setAttribute("val", newval);
                this.s.mode = 0;
            } else if (this.m.type === 0) {
                this.setAttribute("val", newval);
                this.to_view();
            } else if (this.m.type === 1) {
                this.s.term = term;
                this.setAttribute("val", newval);
                this.setAttribute("term", term);
                this.to_view();
            }
        }
    }
    to_error_result(error) {
        if (this.s.mode === 2 && this.s.isanimating === false) {
            if (this.m.type === 2) {
                this.els.animeffect?.remove();
                if (this.s.val === "true") {
                    this.els.switch.classList.add("istrue");
                } else {
                    this.els.switch.classList.remove("istrue");
                }
                this.s.mode = 0;
            } else if (this.m.type === 0) {
                this.els.input.value = this.s.val;
                this.s.mode = 4;
                this.to_view();
            } else if (this.m.type === 1) {
                this.els.dselect.SetValAndTerm(this.s.val, this.s.term);
                this.s.mode = 4;
                this.to_view();
            }
            console.log("error: " + error);
        }
    }
    to_view() {
        if ((this.s.mode === 3 || this.s.mode === 4) && this.s.isanimating === false) {
            this.s.mode = 1;
            this.s.isanimating = true;
            this.insert_view();
            this.set_animation();
            this.animatehandles.edit.reverse();
            this.animatehandles.view.reverse();
            this.animatehandles.edit.onfinish = ()=>{
                this.s.isanimating = false;
                this.els.edit?.parentElement?.removeChild(this.els.edit);
            };
        }
    }
    set_animation() {
        const a = this.animatehandles;
        const k = this.keyframes;
        k.view = new KeyframeEffect(this.els.view, [
            {
                opacity: 1,
                transform: "perspective(300px) translate3d(0, 0, 0)"
            },
            {
                transform: "perspective(300px) translate3d(0, -21px, 0)",
                opacity: 0
            }
        ], {
            duration: 290,
            easing: "cubic-bezier(.18,.24,.15,1)",
            fill: "both"
        });
        k.edit = new KeyframeEffect(this.els.edit, [
            {
                transform: "perspective(300px) translate3d(0, 21px, 13px) rotateX(72deg)",
                opacity: 0
            },
            {
                transform: "perspective(300px) translate3d(0, 0, 0) rotateX(0)",
                opacity: 1
            }
        ], {
            duration: 290,
            easing: "cubic-bezier(.18,.24,.15,1.0)",
            fill: "both"
        });
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
    */ sc() {
        Lit_Render(this.template(), this.shadow);
    }
    template = ()=>{
        return Lit_Html`<style>

:host {
	-webkit-font-smoothing: antialiased;
    display: flex;
    flex-direction: row;
    position: relative;
    box-sizing: border-box;
    justify-content: space-between;
    flex-wrap: nowrap;
    text-indent: 0;
}
:host(.row) {
    padding-left: 11px;
    height: 52px;
    border-bottom-width: 0.5px;
    border-bottom-style: solid;
    border-bottom-color: var(--bordercolor);
    padding-right: 8px;
}
:host(.inline) {
    height: 35px;
}


:host > label {
    overflow: hidden;
    text-wrap: nowrap;
    margin-right: 6px;
	font-family: var(--fontfamily);
    font-weight: 700;
    color: rgb(190 56 151);
}
:host(.row) > label {
    padding: 18px 0 0 0px;
}
:host(.inline) > label {
    padding-right: 12px;
}
:host > label::after {
    content: ":";
}


:host > section {
    position: relative;
    flex: 1;
}



:host > section > #view {
    display: flex;
    width: 100%;
    justify-content: flex-end;

    & > p {
		font-family: var(--fontfamily);
        padding-right: 9px;
    }

    & > i {
        font-size: 20px;
        padding: 0px 0px 0 0;
        color: var(--actioncolor);
    }
}
:host > section > #view.initial_edit {
    border: 1px solid #cecece;
    border-radius: 4px;
    padding-right: 6px;
    width: calc(100% - 7px);
    height: 23px;

    & > i {
        font-size: 13px;
        display: inline-block;
        padding-top: 1px;
        padding-right: 3px;
        transform: rotate(90deg);
        transition: opacity 0.3s;
    } 
}
:host(.row) > section > #view {
    /* margin-top: 10px; */
    /* padding-top: 8px; */
}


:host > section > #edit {
    display: flex;
    justify-content: flex-end;
    position: absolute;
    width: 100%;

    & > input {
		font-family: var(--fontfamily);
        font-size: 14px;
        box-sizing: border-box;
        outline: none;
        border: 1px solid #cecece;
        border-radius: 4px;
        padding: 7px 5px 8px 5px;
        color: #6d6d6d;
        display: inline-block;
        margin-top: 0;
        flex: 1;
        width: 100%;
    }

    & > c-dselect {
        display: block;
        width: 100%;
    }

    & > i {
        padding-left: 11px;
        padding-top: 8px;
        color: var(--actioncolor);
        font-weight: 500;
        transition: opacity 0.3s;
    } & > i.hide_while_spinner {
        opacity: 0;
    }

    & > c-animeffect {
        position: absolute;
        opacity: 0;
        top: 8px;
        right: 0;
        width: 18px;
        height: 18px;
    }
    & > c-animeffect.active {
        opacity: 1;
    }

    & > c-dselect + c-animeffect {
        top: 8px;
        right: 5px;
        width: 18px;
        height: 18px;
    }
}
:host(.row) > section > #edit {
    top: 9px;
}
:host(.inline) > section > #edit {
    top: -7px;
}



:host span.switch {
    position: relative;
    display: inline-block;
    border-width: 1px;
    border-color: rgb(0 0 0 / 16%);
    border-style: solid;
    border-radius: 52px;
    background-color: #fff;
    width: 30px;
    height: 18px;
    user-select: none;
    transition: 0.4s cubic-bezier(0.73, 0.01, 0.28, 1);
    transition-property: background-color, border-color;

    & > .inner {
        position: relative;
        display: block;
        width: 14px;
        height: 14px;
        margin-top: 2px;
        border-radius: 50%;
        background-color: #D9DADC;
        user-select: none;
        transform: translateX(2px);
        transition: 0.4s cubic-bezier(0.73, 0.01, 0.28, 1);
        transition-property: background-color, transform;
    }

    & > c-animeffect {
        position: absolute;
        top: 2px;
        left: 3px;
        width: 13px;
        height: 13px;
        /* padding-top: 8px; */
    }
}
:host span.switch.istrue {
    border-color: rgba(255, 255, 255, 0.0);
    background-color: #36cf90;

    & > .inner {
        background-color: white;
        transform: translateX(14px);
    }
}
:host(.row) span.switch {
    margin-top: 6px;

    margin-right: 2px;
}
</style>
`;
    };
}
customElements.define('c-in', CIn);
export { };
