(() => {
  // server/static_dev/lazy/views/auth/auth.js
  var distcss = `header.viewheader{background:#fff;height:57px;box-shadow:0 0 15px #0000001c;.left{width:80%}.middle,.right{width:10%}}img.logo{width:47px;margin-left:15px;margin-right:8px;position:relative;top:-8px}img.logo+strong{display:inline-block;position:relative;top:-20px;font-size:18px}.content{margin:35px auto;max-width:400px}h1{padding-left:13px;padding-bottom:21px}button{margin-top:20px;margin-left:12px}.error{margin-top:20px;margin-left:12px;padding:8px 10px;background-color:#d25050;border-radius:4px;color:#fff}
`;
  var VAuth = class extends HTMLElement {
    $;
    s;
    cssstylesheet;
    shadow;
    constructor() {
      super();
      this.s = {
        error_msg: ""
      };
      this.shadow = this.attachShadow({
        mode: "open"
      });
      SetDistCSS(this.shadow, distcss);
    }
    connectedCallback() {
      setTimeout(() => {
        this.dispatchEvent(new Event("hydrated"));
      }, 100);
      document.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
          this.Login();
        }
      });
      this.stateChanged();
    }
    stateChanged() {
      Lit_Render(this.template(this.s), this.shadow);
    }
    async Login() {
      const formel = this.shadow.querySelector("form[name='login']");
      const els = formel.elements;
      const identity_platform_key = localStorage.getItem("identity_platform_key");
      const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=` + identity_platform_key;
      const opts = {
        method: "POST",
        body: JSON.stringify({
          email: els.username.value,
          password: els.password.value,
          returnSecureToken: true
        }),
        headers: {
          "Content-Type": "application/json"
        }
      };
      const data = await FetchLassie(url, opts);
      if (data.error) {
        this.s.error_msg = data.error.message;
      } else {
        localStorage.setItem("id_token", data.idToken);
        localStorage.setItem("token_expires_at", (Math.floor(Date.now() / 1e3) + Number(data.expiresIn)).toString()), localStorage.setItem("refresh_token", data.refreshToken);
        localStorage.setItem("auth_group", "admin");
        localStorage.setItem("user_email", data.email);
        window.location.hash = "home";
      }
      this.stateChanged();
    }
    template = (_s) => {
      return Lit_Html`
<header class="viewheader">
    <div class="left">
        <img class="logo" src="/assets/media/logo-icon.svg" alt="pwtlogo" /><strong>Pure Water Technologies</strong>
    </div>
    <div class="middle">&nbsp;</div>
    <div class="right">&nbsp;</div>
</header>


<div class="content">

    <h1>Authenticate</h1>

    <form name="login">
        <ul class="items">
            <li>
                <h5>Username</h5>
                <span class="input"><input type="text" name="username" id="username" value=""></span>
            </li>

            <li>
                <h5>Password</h5>
                <span class="input"><input type="password" name="password" id="password" value=""></span>
            </li>
        </ul>
    </form>

    ${_s.error_msg ? Lit_Html`<div class="error">${_s.error_msg}</div>` : ''}

    <button class="btn" @click="${()=>this.Login()}">login</span>

</div>

`;
    };
  };
  customElements.define("v-auth", VAuth);
})();
