(() => {
  // server/static_dev/client_xen/lazy/views/home/home.js
  var distcss = `header.viewheader{background:#fff;height:57px;box-shadow:0 0 15px #0000001c}.content{padding:20px}
`;
  var VHome = class extends HTMLElement {
    $;
    s;
    shadow;
    constructor() {
      super();
      this.$ = this.querySelector;
      this.s = {
        admin_return_str: ""
      };
      this.shadow = this.attachShadow({
        mode: "open"
      });
      SetDistCSS(this.shadow, distcss);
    }
    connectedCallback() {
      this.sc();
      setTimeout(() => {
        this.dispatchEvent(new Event("hydrated"));
      }, 100);
    }
    sc() {
      Lit_Render(this.template(this.s), this.shadow);
    }
    async adminetc(api, method = "GET") {
      if (confirm("Are you sure you want to run admin: " + api)) {
        const returndata = await FetchLassie("/api/xen/admin/" + api, {
          method
        });
        if (returndata.return_str) {
          this.s.admin_return_str = returndata.return_str.includes("--") ? returndata.return_str.split("--") : returndata.return_str;
        }
        this.sc();
      }
    }
    template = (_s) => {
      return Lit_Html`
<header class="viewheader">
    <div class="left"></div>
    <div class="middle"><h1>Xen</h1></div>
    <div class="right">&nbsp;</div>
</header>

<div class="content">

    <div id="admin">

        <h5 @click="${()=>this.adminetc('firestore_misc_update')}">firestore_misc_update</h5>
        
        <div style="height: 200px; overflow-y:scroll;">
            ${Array.isArray(_s.admin_return_str) ? _s.admin_return_str.map((item, index) => Lit_Html`
                <p>${item}</p>
            `) : Lit_Html`
                <p>${_s.admin_return_str}</p>
            `}
        </div>

        <h5 @click="${()=>window.location.hash='finance'}">Finance</h5>

    </div>

</div>


`;
    };
  };
  customElements.define("v-home", VHome);
})();
