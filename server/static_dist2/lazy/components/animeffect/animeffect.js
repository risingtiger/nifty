var WhatE;
(function(WhatE) {
    WhatE[WhatE["INIT"] = 0] = "INIT";
    WhatE[WhatE["SPIN"] = 1] = "SPIN";
})(WhatE || (WhatE = {}));
class CAnimeffect extends HTMLElement {
    s;
    m;
    shadow;
    static get observedAttributes() {
        return [
            'active'
        ];
    }
    constructor(){
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.s = {
            what: 0
        };
    }
    connectedCallback() {}
    async attributeChangedCallback(name, _old_val, new_val) {
        if (name === "active" && new_val === "") {
            if (this.s.what === 0) {
                switch(this.getAttribute("what")){
                    case "spin":
                        this.s.what = 1;
                        break;
                    default:
                        this.s.what = 1;
                        break;
                }
                this.sc();
            }
        }
    }
    sc() {
        Lit_Render(this.template(this.s, this.m), this.shadow);
    }
    template = (_s, _m)=>{
        return Lit_Html`<style>
:host {
}

.spin {
    width: 100%;
    height: 100%;
    background: none;

    & > .spinner {
    display: block;
    width: 100%;
    height: 100%;
    border: 3px solid #f3f3f3;
    box-sizing: border-box;
    border-radius: 50%;
    border-top-color: #0091e8;
    animation: spin 1s ease-in-out infinite;
    }
}
.spin.active {
    display: block;
}
.spin.blur {
    box-shadow: 0 0 20px 20px white;
}





@keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}
@-webkit-keyframes spin {
  to { -webkit-transform: rotate(360deg); }
}
</style>
${_s.what === 1 ? Lit_Html`
<div class="spin">
    <div class="spinner"></div>
</div>
` : '' }
`;
    };
}
customElements.define('c-animeffect', CAnimeffect);
export { };
