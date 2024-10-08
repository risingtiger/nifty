


import { str, num, bool } from "../../../definitions.js";

declare var Lit_Render: any;
declare var Lit_Html: any;



enum ModeT { INERT = 0, SAVING = 1, SAVED = 2 }


type StateT = {
    mode: ModeT,
}

type ModelT = {
	wait_for_confirm: bool
}

type ElsT = {
    animeffect:HTMLElement|null,
}




class CBtn extends HTMLElement {

    s:StateT
    m:ModelT
    els:ElsT
    
    shadow:ShadowRoot








    constructor() {   

        super(); 

        this.shadow = this.attachShadow({mode: 'open'});

        this.s = { mode: ModeT.INERT}
        this.m = { wait_for_confirm: true }
        this.els = { animeffect: null}
    }




    connectedCallback() {   

        this.sc()

		this.m.wait_for_confirm = this.hasAttribute("nowait") ? false : true

        this.addEventListener("click", () => {
            this.is_clicked()
        })
    }




    async attributeChangedCallback(name:str, oldval:str, newval:str) {
    }




    public set_resolved()         {   this.to_resolved();            }




    is_clicked() {

        if (this.s.mode == ModeT.INERT && this.m.wait_for_confirm) {
            this.to_saving()
			this.dispatchEvent(new CustomEvent("submit", {detail: { 
				set_resolved: this.set_resolved.bind(this), 
			}}))
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




    template = () => { return Lit_Html`{--css--}{--html--}`; }; 
}




customElements.define('c-btn', CBtn);









export {  }



