(() => {
  // server/static_dev/client_xen/lazy/components/placeholder_component/placeholder_component.js
  var CFinanceBucket = class extends HTMLElement {
    s;
    constructor() {
      super();
      this.s = {
        propa: 1
      };
    }
    async connectedCallback() {
      this.dispatchEvent(new Event("hydrated"));
    }
    async mousedowned(e) {
      console.log("mousedowned");
    }
    async mouseupped(e) {
      console.log("mouseupped");
    }
    async mousemoved(e) {
      console.log("mousemoved");
    }
    sc() {
      Lit_Render(this.template(this.s), this);
    }
    template = (_s) => {
      return Lit_Html`{--htmlcss--}`;
    };
  };
  customElements.define("c-finance-bucket", CFinanceBucket);
})();
