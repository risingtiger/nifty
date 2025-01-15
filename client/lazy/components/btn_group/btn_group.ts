


import { str, num, bool } from "../../../defs_server_symlink.js";

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




class CBtnGroup extends HTMLElement {

    shadow: ShadowRoot

    constructor() {   
        super(); 
        this.shadow = this.attachShadow({mode: 'open'});
    }

    connectedCallback() {   
        this.render()
    }

    render() {   
        Lit_Render(this.template(), this.shadow);   
    }

    template = () => { 
        return Lit_Html`{--css--}{--html--}`; 
    }; 
}

customElements.define('c-btn-group', CBtnGroup);









export {  }



