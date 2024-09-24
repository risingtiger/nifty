class CFinanceBucket extends HTMLElement {
    s;
    constructor(){
        super();
        this.s = {
            propa: 1
        };
    }
    async connectedCallback() {
        this.dispatchEvent(new Event('hydrated'));
    }
    async mousedowned(e) {
        console.log('mousedowned');
    //bucket.transfer_ui_mousedown(e) 
    }
    async mouseupped(e) {
        console.log('mouseupped');
    //bucket.transfer_ui_mouseup(e)   
    }
    async mousemoved(e) {
        console.log('mousemoved');
    }
    sc() {
        Lit_Render(this.template(this.s), this);
    }
    template = (_s)=>{
        return Lit_Html`{--htmlcss--}`;
    };
}
customElements.define('c-finance-bucket', CFinanceBucket);
export { };
