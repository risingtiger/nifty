var ModeT;
(function(ModeT) {
    ModeT[ModeT["CLOSED"] = 0] = "CLOSED";
    ModeT[ModeT["OPEN"] = 1] = "OPEN";
})(ModeT || (ModeT = {}));
const DEFAULT_VIEW_WIDTH = 100;
const DEFAULT_VIEW_HEIGHT = 200;
const DUMMY_EL = document.createElement("div");
class CDselect extends HTMLElement {
    s;
    m;
    els;
    animatehandles;
    keyframes;
    shadow;
    static get observedAttributes() {
        return [
            'term'
        ];
    }
    constructor(){
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.s = {
            mode: 0,
            isanimating: false,
            instigator_term: "",
            options_str: "",
            val: ""
        };
        this.m = {
            is_options: false
        };
        this.els = {
            instigator: DUMMY_EL,
            view: DUMMY_EL
        };
        this.animatehandles = {
            view: null,
            instigator: null
        } // label: null}
        ;
        this.keyframes = {
            view: null,
            instigator: null
        } // label: null}
        ;
    }
    connectedCallback() {
        this.sc();
        const instigator_term = this.getAttribute("term") || "";
        this.els.instigator = this.shadow.getElementById("instigator");
        this.m.is_options = this.hasAttribute("options");
        this.els.view = this.shadow.getElementById("view");
        if (instigator_term) {
            this.els.instigator.textContent = instigator_term;
            this.els.instigator.classList.add("active");
            this.els.instigator.addEventListener("click", ()=>this.instigatorclicked());
            this.els.view.addEventListener("click", (e)=>this.viewclicked(e));
        } else {
            this.to_open();
        }
    }
    async attributeChangedCallback(name, old_val, new_val) {
        if (name === "term" && old_val !== null) {
            this.els.instigator.textContent = new_val;
        }
    /*
        if (name === "val" && this.s.mode === 'saving' && this.s.isanimating === false) { 
            this.to_saved(new_val)
        }

        else if (name === "gomodeedit" && old_val !== null && this.s.mode === 'view' && this.s.isanimating === false) {
            this.to_edit()
        }
        */ }
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
    OpenIt() {
        this.to_open();
    }
    GetMode() {
        return this.s.mode;
    }
    SetValAndTerm(val, term) {
        if (this.s.mode === 0) {
            this.s.val = val;
            this.els.instigator.textContent = term;
            this.setAttribute("term", term);
            this.setAttribute("val", val);
        }
    }
    viewclicked(e) {
        if (e.target === this.els.view) {
            this.dispatchEvent(new CustomEvent("closed", {
                detail: {}
            }));
            this.to_closed();
        }
    }
    instigatorclicked() {
        this.to_open();
    }
    to_open() {
        const xy = this.els.instigator.getBoundingClientRect();
        const width = "200px";
        const top = (xy.top - 100).toString() + "px";
        const left = (xy.left + (xy.width - 243)).toString() + "px";
        if (this.s.mode === 0 && this.s.isanimating === false) {
            const height = "300px";
            this.els.view.style.width = width;
            this.els.view.style.height = height;
            this.els.view.style.top = top;
            this.els.view.style.left = left;
            if (this.m.is_options) {
                const options_str = this.getAttribute("options") || "";
                const option_val = this.getAttribute("val") || "";
                const options = parse_options(options_str);
                const option_items_ul = render_options(options, option_val, this.optionclicked.bind(this));
                const existing_ul = this.shadow.getElementById("option_items");
                if (existing_ul) {
                    existing_ul.remove();
                }
                this.els.view.querySelector("#wrap").prepend(option_items_ul);
            }
            this.els.view.showModal();
            this.s.mode = 1;
        }
    }
    to_closed() {
        if (this.s.mode === 1 && this.s.isanimating === false) {
            this.s.mode = 0;
            this.els.view.classList.add("closing");
            setTimeout(()=>{
                this.els.view.classList.remove("closing");
                this.els.view.close();
            }, 400);
        }
    }
    optionclicked(e) {
        const el = e.currentTarget;
        this.els.view.querySelectorAll("#option_items > li").forEach((x, _i)=>{
            x.classList.remove("selected");
        });
        el.classList.add("selected");
        const detail = {};
        if (this.m.is_options) {
            const val = el.querySelector("h5").getAttribute("val");
            const term = el.querySelector("h5").textContent;
            detail.newval = val;
            detail.oldval = this.s.val;
            this.s.val = val;
            this.els.instigator.textContent = term;
            this.setAttribute("term", term);
            this.setAttribute("val", val);
            this.els.instigator.textContent = term;
        }
        this.dispatchEvent(new CustomEvent("changed", {
            detail
        }));
        this.to_closed();
    }
    animate_view_end() {
        if (this.animatehandles.view.currentTime === 0) {} else {
        //this.els.view.style.display = "none";
        }
        this.s.isanimating = false;
    }
    animate_instigator_end() {
        if (this.animatehandles.instigator.currentTime === 0) {} else {
        //this.els.input.select();
        }
    }
    template = ()=>{
        return Lit_Html`<style>

:host {
    display: inline-block;
    position: relative;
}

:host > #instigator {
    display: none;
    cursor: pointer;
    position: relative;
    padding: 7px 5px 8px 5px;
    border: 1px solid #cecece;
    border-radius: 4px;
    color: #6d6d6d;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
    background: white;
}
:host > #instigator.active {
    display: inline-block;
}
:host > #instigator::after {
    content: '+';
    position: absolute;
    right: 0;
    top: 0px;
    height: 100%;
    padding: 9px 9px 0 9px;
    box-sizing: border-box;
    border-left: 1px solid #ccc;
    font-size: 12px;
    color: #666;
}

:host > dialog {
    position: relative;
    margin: 0;
    background-color: white;
    box-shadow: 0 2px 17px 4px rgb(0 0 0 / 10%);
    padding: 0;
    width: 200px;
    height: 400px;
    border-radius: 4px;
    border: 1px solid #e6e6e6;
    padding: 0;
    inset: 0;
    outline: none;
    opacity: 0;
    transform: translateY(20px);
    transition: 0.4s cubic-bezier(0.93, 0, 0.18, 1);
    transition-property: opacity, transform;

    &[open] {
        opacity: 1;
        transform: translateY(0);

        @starting-style {
            opacity: 0;
            transform: translateY(20px);
        }
    }

    &.closing {
        opacity: 0;
        transform: translateY(20px);
    }

    & > #wrap {
        width: 100%;
        height: 100%;

        & > ul.items > li {
            & .action {
                display: none;
            }
        }
        & > ul.items > li.selected {

            & .action {
                display: block;
                color: black;
            }
        }
    }

}


</style>
<span id="instigator"></span>
<dialog id="view">
    <div id="wrap">
        <slot></slot>
    </div>
</dialog>
`;
    };
}
customElements.define('c-dselect', CDselect);
function render_options(options, options_val, optionclicked) {
    const ulitemsel = document.createElement("ul");
    ulitemsel.classList.add("items");
    ulitemsel.id = "option_items";
    ulitemsel.classList.add("items");
    options.forEach((x)=>{
        const liel = document.createElement("li");
        const h5el = document.createElement("h5");
        h5el.textContent = x.label;
        h5el.setAttribute("val", x.val);
        liel.appendChild(h5el);
        const iel = document.createElement("i");
        iel.classList.add("icon-checkcircle");
        iel.classList.add("action");
        liel.appendChild(iel);
        if (x.val === options_val) {
            liel.classList.add("selected");
        }
        liel.addEventListener("click", (e)=>optionclicked(e));
        ulitemsel.appendChild(liel);
    });
    return ulitemsel;
}
function parse_options(options_str) {
    const options = options_str.split(",").map((x, _i)=>{
        const parts = x.trim().split(":");
        return {
            label: parts[0],
            val: parts[1]
        };
    });
    return options;
}
export { };
