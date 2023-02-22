(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/views/index/index.ts
  var VIndex = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s) => {
        return Lit_Html`<style>

  v-index .testy {
    display: none;
    position: absolute;
    width:  100px;
    height: 100px;
    top:    80px;
    left:   30px;
    background-color: orange;
    opacity: 0;
  }




a {
    color: red;
}




a > span {
	    color: blue;
    }



/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB3YXBwL3N0YXRpYy92aWV3cy9pbmRleC9pbmRleC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFJRTtJQUNFLGFBQWE7SUFDYixrQkFBa0I7SUFDbEIsYUFBYTtJQUNiLGFBQWE7SUFDYixZQUFZO0lBQ1osWUFBWTtJQUNaLHdCQUF3QjtJQUN4QixVQUFVO0VBQ1o7Ozs7O0FBT0Y7SUFDSSxVQUFVO0FBS2Q7Ozs7O0FBSEk7S0FDQyxXQUFXO0lBQ1oiLCJmaWxlIjoicHdhcHAvc3RhdGljL3ZpZXdzL2luZGV4L2luZGV4LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG52LWluZGV4IHtcblxuICAmIC50ZXN0eSB7XG4gICAgZGlzcGxheTogbm9uZTtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgd2lkdGg6ICAxMDBweDtcbiAgICBoZWlnaHQ6IDEwMHB4O1xuICAgIHRvcDogICAgODBweDtcbiAgICBsZWZ0OiAgIDMwcHg7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogb3JhbmdlO1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cblxufVxuXG5cblxuXG5hIHtcbiAgICBjb2xvcjogcmVkO1xuXG4gICAgJiA+IHNwYW4ge1xuXHQgICAgY29sb3I6IGJsdWU7XG4gICAgfVxufVxuXG5cbiJdfQ== */</style>
<header class="viewheader">
  <div class="left"></div>
  <div class="middle"><h1>Pure Water Tech</h1></div>
  <div class="right"></div>
</header>

<div class="content">
  <div style="text-align: center; padding-top: 30px;">

    ${ localStorage.getItem('cat') ? Lit_Html`<span>Logged in &nbsp;</span>` : Lit_Html`<button class="btn" @click="${()=>this.login()}">LOG IN</button>` }

    <button class="btn" @click="${()=>window.location.hash = 'machines'}">VIEW MACHINES</button>

  </div>
</div>

<c-auth ddomgo="${_s.showAuth}"></c-auth>
`;
      };
      this.$ = this.querySelector;
      this.s = {
        showAuth: false,
        showTesty: false
      };
    }
    connectedCallback() {
      this.stateChanged();
      this.$("c-auth").addEventListener("requested_close", () => {
        this.s.showAuth = false;
        this.stateChanged();
      });
      setTimeout(() => {
        this.dispatchEvent(new Event("hydrate"));
      }, 100);
    }
    stateChanged() {
      Lit_Render(this.template(this.s), this);
    }
    login() {
      this.s.showAuth = true;
      this.stateChanged();
    }
  };
  customElements.define("v-index", VIndex);
})();
