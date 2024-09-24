var ModeT;
(function(ModeT) {
    ModeT[ModeT["INERT"] = 0] = "INERT";
    ModeT[ModeT["SAVING"] = 1] = "SAVING";
    ModeT[ModeT["SAVED"] = 2] = "SAVED";
})(ModeT || (ModeT = {}));
class CBtn extends HTMLElement {
    s;
    m;
    els;
    shadow;
    static get observedAttributes() {
        return [
            'resolved'
        ];
    }
    constructor(){
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.s = {
            mode: 0
        };
        this.m = {
            wait_for_confirm: true
        };
        this.els = {
            animeffect: null
        };
    }
    connectedCallback() {
        this.sc();
        this.m.wait_for_confirm = this.hasAttribute("nowait") ? false : true;
        this.addEventListener("click", ()=>{
            this.is_clicked();
        });
    }
    async attributeChangedCallback(name, oldval, newval) {
        if (name === "resolved" && newval === "true" && !oldval) {
            this.removeAttribute("resolved");
            this.to_resolved();
        }
    }
    is_clicked() {
        if (this.s.mode == 0 && this.m.wait_for_confirm) {
            this.to_saving();
        }
    }
    to_saving() {
        if (this.s.mode === 0) {
            this.s.mode = 1;
            this.els.animeffect = document.createElement("c-animeffect");
            this.els.animeffect.setAttribute("active", "");
            this.shadow.appendChild(this.els.animeffect);
            this.els.animeffect.offsetWidth;
            this.els.animeffect.className = "active";
            this.shadow.getElementById("slotwrap").classList.add("subdued");
        }
    }
    to_resolved() {
        if (this.s.mode === 1) {
            this.s.mode = 2;
            this.els.animeffect.className = "";
            setTimeout(()=>{
                this.els.animeffect.remove();
                this.shadow.querySelector("#slotwrap").classList.remove("subdued");
                this.s.mode = 0;
            }, 100);
        }
    }
    /*
    set_mode(mode:ModeT) {   

        switch (mode) {

            case ModeT.INERT: this.classList.remove("saving", "saved"); break

            case ModeT.SAVING: 

                this.classList.add("saving"); 

                this.dispatchEvent

            break

            case ModeT.SAVED: this.classList.add("saved"); break
        }
    }
    */ sc() {
        Lit_Render(this.template(), this.shadow);
    }
    template = ()=>{
        return Lit_Html`<style>

:host {
    position: relative;
    font-weight: 600;
    display: inline-block;
    padding: 9px 15px 0px 15px;
    border-radius: 22px;
    box-sizing: border-box;
    height: 36px;
    color: gray;
    background-color: white;
    border-color: var(--actioncolor);
    border-width: 1px;
    border-style: solid;
    cursor: pointer;
    transition-property: background-color;
    transition-duration: 0.1s;
    transition-timing-function: ease-in-out;
}
:host(:hover) {
    background-color: #f2f5f6;
}

:host(.primary) {
    border: none;
    background-color: var(--actioncolor);
}


:host(.primary) #slotwrap {
    color: white;
    transition: opacity 0.4s ease-in;
}

:host #slotwrap.subdued {
    opacity: 0.4;
}

:host c-animeffect {
    position: absolute;
    top: 7px;
    left: calc(50% - 10px);
    width: 20px;
    height: 20px;
}



</style>
<span id="slotwrap">
    <slot></slot>
</span>
`;
    };
}
customElements.define('c-btn', CBtn);
export { };
