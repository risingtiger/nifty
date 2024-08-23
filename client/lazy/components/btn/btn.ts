


import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;



enum ModeT { INERT = 0, SAVING = 1, SAVED = 2 }


type StateT = {
    mode: ModeT,
}

type ModelT = {
    c: str,
}

type ElsT = {
    animeffect:HTMLElement|null,
}



let distcss = `{--distcss--}`;




class CBtn extends HTMLElement {

    s:StateT
    m:ModelT
    els:ElsT
    
    shadow:ShadowRoot




    //static get observedAttributes() { return ['val']; }




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = { mode: ModeT.INERT}
        this.m = { c: "" }
        this.els = { animeffect: null}


        SetDistCSS(this.shadow, distcss)
    }




    connectedCallback() {   

        this.sc()

        this.addEventListener("click", () => {
            this.is_clicked()
        })
    }




    async attributeChangedCallback(name:str, oldval:str, newval:str) {
    }




    SetResolved() {   this.to_resolved();   }




    is_clicked() {

        if (this.s.mode == ModeT.INERT) {
            this.to_saving()
        }
    }




    to_saving() {   

        if (this.s.mode === ModeT.INERT) {
            
            this.s.mode = ModeT.SAVING

            this.els.animeffect = document.createElement("c-animeffect")
            this.els.animeffect.setAttribute("active", "")

            this.shadow.appendChild(this.els.animeffect)

            this.els.animeffect.offsetWidth
            this.els.animeffect.className = "active"

            this.shadow.getElementById("slotwrap")!.classList.add("subdued")
        }
    }




    to_resolved() {   

        if (this.s.mode === ModeT.SAVING) {
            
            this.s.mode = ModeT.SAVED

            this.els.animeffect!.className = "";

            setTimeout(() => {

                this.els.animeffect!.remove()
                this.shadow.querySelector("#slotwrap")!.classList.remove("subdued")

                this.s.mode = ModeT.INERT

            }, 100)
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
    */




    sc() {   Lit_Render(this.template(), this.shadow);   }




    template = () => { return Lit_Html`{--devservercss--}{--html--}`; }; 
}




customElements.define('c-btn', CBtn);









export {  }



