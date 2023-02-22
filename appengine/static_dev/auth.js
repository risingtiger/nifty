(() => {
  // static/components/auth/auth.ts
  var CAuth = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s) => {
        return Lit_Html`<style>

:host {
}



/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YXRpYy9jb21wb25lbnRzL2F1dGgvYXV0aC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtBQUNBIiwiZmlsZSI6InN0YXRpYy9jb21wb25lbnRzL2F1dGgvYXV0aC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuOmhvc3Qge1xufVxuXG5cbiJdfQ== */</style>


<c-overlay size="small" showheader="true" closebtn="true" show="false">

  <span slot="headermiddle">Authenticate</span>
  <span slot="headerright" @click="${()=>this.login()}"><strong>login</strong></span>

  <form name="login">
    <ul class="items">

      <li>
        <label class="text" for="username">Username</label>
        <input type="text" name="username" id="username" value="" style="text-align:left;">
        <label class="action" for="username"><i class="icon-edit1"></i></label>
      </li>

      <li>
        <label class="text" for="password">Password</label>
        <input type="password" name="password" id="password" value="" style="text-align:left;">
        <label class="action" for="password"><i class="icon-edit1"></i></label>
      </li>

    </ul>
  </form>

</c-overlay>

`;
      };
      this.$ = this.querySelector;
      this.s = {
        propa: "",
        propb: ""
      };
    }
    static get observedAttributes() {
      return ["animateshow"];
    }
    async Activate() {
      return new Promise(async (res) => {
        this.stateChanged();
        res(1);
      });
    }
    stateChanged() {
      Lit_Render(this.template(this.s), this);
    }
    async login() {
      const formel = this.querySelector("form[name='login']");
      const els = formel.elements;
      if (els.username.value === "robert@purewater-tech.com" && els.password.value === "pure312water!!" || els.username.value === "davis@risingtiger.com" && els.password.value === "pure312water!!") {
        window.___passalong = true;
        alert("Logged In Successfully");
        localStorage.setItem("cat", "-");
        this.dispatchEvent(new Event("requested_close"));
      } else {
        alert("Wrong user name or password");
      }
    }
  };
  customElements.define("c-auth", CAuth);
})();
