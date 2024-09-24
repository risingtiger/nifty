class CForm extends HTMLElement {
    s;
    m;
    c_in_els;
    shadow;
    constructor(){
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.s = {
            placeholder: this.getAttribute("placeholder") || ""
        };
    }
    connectedCallback() {
        this.sc();
    /*
        this.c_in_els = this.querySelectorAll("c-in");

        this.c_in_els.forEach((el:HTMLElement) => {
            el.addEventListener("save", (e:any) => {
                this.dispatchEvent(new CustomEvent("itemsave", { detail: e.detail }));
            });
        });
        */ }
    sc() {
        Lit_Render(this.template(this.s), this.shadow);
    }
    template = (_s)=>{
        return Lit_Html`<style>

:host {
    color: red;
}

</style>

<form>
    <slot></slot>
</form>

`;
    };
}
customElements.define('c-form', CForm);
export { };
