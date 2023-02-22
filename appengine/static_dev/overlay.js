(() => {
  // static/components/overlay/overlay.ts
  var COverlay = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s) => {
        return Lit_Html`<style>

:host {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
}


.wrapper {
  position: absolute;
  left: 50%;
  border-radius: 8px;
  box-shadow: 0 0 14px 4px rgb(0 0 0 / 4%);
  opacity: 0;
  box-sizing: border-box;
  background: white;
  z-index: 2;
}
.wrapper.large {
  top: 10px;
  left: 10px;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  margin: 0px 0 0 0px;
}
.wrapper.large2 {
  top: 84px;
  width: 720px;
  height: 480px;
  margin: 0px 0 0 -360px;
}
.wrapper.medium {
  top: 84px;
  width: 600px;
  height: 600px;
  margin: 0px 0 0 -300px;
}
.wrapper.small {
  top: 12%;
  width: 340px;
  height: 600px;
  margin: 0px 0 0 -170px;
}

.wrapper > header {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
}

.wrapper > header .left {
    display: block;
    width: 20%;
    font-size: 16px;
    font-weight: 400;
    color: var(--actioncolor);
  }

.wrapper > header .middle {
    display: block;
    width: 60%;

  }

.wrapper > header .middle h1 {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      padding: 0;
      margin: 0;
    }

.wrapper > header .right {
    display: block;
    width: 20%;
    font-size: 16px;
    font-weight: 400;
    text-align: right;
    color: var(--actioncolor);
  }


.backgroundcover {
  position: absolute;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  background: #efefefbf;
  z-index: 1;
}




/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YXRpYy9jb21wb25lbnRzL292ZXJsYXkvb3ZlcmxheS5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQTtFQUNFLGtCQUFrQjtFQUNsQixXQUFXO0VBQ1gsWUFBWTtFQUNaLE1BQU07RUFDTixPQUFPO0VBQ1AsYUFBYTtBQUNmOzs7QUFHQTtFQUNFLGtCQUFrQjtFQUNsQixTQUFTO0VBQ1Qsa0JBQWtCO0VBQ2xCLHdDQUF3QztFQUN4QyxVQUFVO0VBQ1Ysc0JBQXNCO0VBQ3RCLGlCQUFpQjtFQUNqQixVQUFVO0FBQ1o7QUFDQTtFQUNFLFNBQVM7RUFDVCxVQUFVO0VBQ1Ysd0JBQXdCO0VBQ3hCLHlCQUF5QjtFQUN6QixtQkFBbUI7QUFDckI7QUFDQTtFQUNFLFNBQVM7RUFDVCxZQUFZO0VBQ1osYUFBYTtFQUNiLHNCQUFzQjtBQUN4QjtBQUNBO0VBQ0UsU0FBUztFQUNULFlBQVk7RUFDWixhQUFhO0VBQ2Isc0JBQXNCO0FBQ3hCO0FBQ0E7RUFDRSxRQUFRO0VBQ1IsWUFBWTtFQUNaLGFBQWE7RUFDYixzQkFBc0I7QUFDeEI7O0FBRUE7RUFDRSxhQUFhO0VBQ2IsV0FBVztFQUNYLHNCQUFzQjtFQUN0QixrQkFBa0I7QUFnQ3BCOztBQTlCRTtJQUNFLGNBQWM7SUFDZCxVQUFVO0lBQ1YsZUFBZTtJQUNmLGdCQUFnQjtJQUNoQix5QkFBeUI7RUFDM0I7O0FBRUE7SUFDRSxjQUFjO0lBQ2QsVUFBVTs7RUFVWjs7QUFSRTtNQUNFLGVBQWU7TUFDZixpQkFBaUI7TUFDakIsa0JBQWtCO01BQ2xCLFVBQVU7TUFDVixTQUFTO0lBQ1g7O0FBSUY7SUFDRSxjQUFjO0lBQ2QsVUFBVTtJQUNWLGVBQWU7SUFDZixnQkFBZ0I7SUFDaEIsaUJBQWlCO0lBQ2pCLHlCQUF5QjtFQUMzQjs7O0FBSUY7RUFDRSxrQkFBa0I7RUFDbEIsV0FBVztFQUNYLFlBQVk7RUFDWiwwQkFBMEI7RUFDMUIsa0NBQWtDO0VBQ2xDLHFCQUFxQjtFQUNyQixVQUFVO0FBQ1oiLCJmaWxlIjoic3RhdGljL2NvbXBvbmVudHMvb3ZlcmxheS9vdmVybGF5LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG46aG9zdCB7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICB6LWluZGV4OiAxMDAwO1xufVxuXG5cbi53cmFwcGVyIHtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBsZWZ0OiA1MCU7XG4gIGJvcmRlci1yYWRpdXM6IDhweDtcbiAgYm94LXNoYWRvdzogMCAwIDE0cHggNHB4IHJnYigwIDAgMCAvIDQlKTtcbiAgb3BhY2l0eTogMDtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgYmFja2dyb3VuZDogd2hpdGU7XG4gIHotaW5kZXg6IDI7XG59XG4ud3JhcHBlci5sYXJnZSB7XG4gIHRvcDogMTBweDtcbiAgbGVmdDogMTBweDtcbiAgd2lkdGg6IGNhbGMoMTAwJSAtIDIwcHgpO1xuICBoZWlnaHQ6IGNhbGMoMTAwJSAtIDIwcHgpO1xuICBtYXJnaW46IDBweCAwIDAgMHB4O1xufVxuLndyYXBwZXIubGFyZ2UyIHtcbiAgdG9wOiA4NHB4O1xuICB3aWR0aDogNzIwcHg7XG4gIGhlaWdodDogNDgwcHg7XG4gIG1hcmdpbjogMHB4IDAgMCAtMzYwcHg7XG59XG4ud3JhcHBlci5tZWRpdW0ge1xuICB0b3A6IDg0cHg7XG4gIHdpZHRoOiA2MDBweDtcbiAgaGVpZ2h0OiA2MDBweDtcbiAgbWFyZ2luOiAwcHggMCAwIC0zMDBweDtcbn1cbi53cmFwcGVyLnNtYWxsIHtcbiAgdG9wOiAxMiU7XG4gIHdpZHRoOiAzNDBweDtcbiAgaGVpZ2h0OiA2MDBweDtcbiAgbWFyZ2luOiAwcHggMCAwIC0xNzBweDtcbn1cblxuLndyYXBwZXIgPiBoZWFkZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICB3aWR0aDogMTAwJTtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgcGFkZGluZzogMTBweCAxMnB4O1xuXG4gICYgLmxlZnQge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHdpZHRoOiAyMCU7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgY29sb3I6IHZhcigtLWFjdGlvbmNvbG9yKTtcbiAgfVxuXG4gICYgLm1pZGRsZSB7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgd2lkdGg6IDYwJTtcblxuICAgICYgaDEge1xuICAgICAgZm9udC1zaXplOiAxNnB4O1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICBwYWRkaW5nOiAwO1xuICAgICAgbWFyZ2luOiAwO1xuICAgIH1cblxuICB9XG5cbiAgJiAucmlnaHQge1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHdpZHRoOiAyMCU7XG4gICAgZm9udC1zaXplOiAxNnB4O1xuICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgdGV4dC1hbGlnbjogcmlnaHQ7XG4gICAgY29sb3I6IHZhcigtLWFjdGlvbmNvbG9yKTtcbiAgfVxufVxuXG5cbi5iYWNrZ3JvdW5kY292ZXIge1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGJhY2tkcm9wLWZpbHRlcjogYmx1cig0cHgpO1xuICAtd2Via2l0LWJhY2tkcm9wLWZpbHRlcjogYmx1cig0cHgpO1xuICBiYWNrZ3JvdW5kOiAjZWZlZmVmYmY7XG4gIHotaW5kZXg6IDE7XG59XG5cblxuXG4iXX0= */</style>


<div class="wrapper ${_s.size}">
  ${_s.showheader ? Lit_Html`
    <header>
      <div class="left">${_s.closebtn ? Lit_Html`<a @click="${()=>this.dispatchEvent(new Event('requested_close'))}">close</a>` : ''} <slot name="headerleft"></slot></div>
      <div class="middle"><h1><slot name="headermiddle"></slot></h1></div>
      <div class="right"><slot name="headerright"></slot></div>
    </header>
  ` : ''}
  <slot></slot>
</div>

<div class="backgroundcover" @click="${()=> { this.dispatchEvent(new Event('requested_close'));}}"></div>
`;
      };
      this.shadow = this.attachShadow({ mode: "open" });
      this.s = {
        size: "",
        closebtn: false,
        showheader: false,
        firstRunRan: false
      };
      this.$ = this.querySelector;
    }
    static get observedAttributes() {
      return ["show"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      const animateIn = () => {
        this.backgroundAnimation.playbackRate = 1;
        this.backgroundAnimation.currentTime = 0;
        this.backgroundAnimation.play();
        this.viewAnimation.playbackRate = 1;
        this.viewAnimation.currentTime = 0;
        this.viewAnimation.play();
        this.wrapperAnimation.playbackRate = 1;
        this.wrapperAnimation.currentTime = 0;
        this.wrapperAnimation.play();
      };
      const animateOut = () => {
        this.backgroundAnimation.reverse();
        this.viewAnimation.reverse();
        this.wrapperAnimation.reverse();
      };
      if (!this.s.firstRunRan) {
        this.s.size = this.getAttribute("size") || "small";
        this.s.closebtn = this.getAttribute("closebtn") === "true" ? true : false;
        this.s.showheader = this.getAttribute("showheader") === "true" ? true : false;
        this.stateChanged();
        this.setupAnimationsEtc();
        this.s.firstRunRan = true;
      }
      if (name === "show" && newValue === "true") {
        animateIn();
      } else if (name === "show" && oldValue === "true" && newValue === "false") {
        animateOut();
      }
    }
    stateChanged() {
      Lit_Render(this.template(this.s), this.shadow);
    }
    setupAnimationsEtc() {
      let elW = this.shadow.querySelector(".wrapper");
      let elB = this.shadow.querySelector(".backgroundcover");
      let elC = document.querySelector("#views > .view > .content");
      const anim0 = [
        { transform: "translate3d(0, 0px, 0)" },
        { transform: "translate3d(0, -55px, 0)" }
      ];
      const timing0 = {
        duration: 380,
        easing: "cubic-bezier(.71,0,0,1)",
        fill: "both",
        iterations: 1
      };
      const anim1 = [
        { opacity: "0" },
        { opacity: "1" }
      ];
      const timing1 = {
        duration: 380,
        easing: "cubic-bezier(.71,0,0,1)",
        fill: "both",
        iterations: 1
      };
      const anim2 = [
        { opacity: "0", transform: `translate3d(0, 120px, 0) scale(1.15)` },
        { opacity: "1", transform: "translate3d(0, 0, 0) scale(1)" }
      ];
      const timing2 = {
        duration: 380,
        easing: "cubic-bezier(.71,0,0,1)",
        fill: "both",
        iterations: 1
      };
      this.backgroundAnimation = elB.animate(anim1, timing1);
      this.backgroundAnimation.pause();
      this.backgroundAnimation.onfinish = (_) => {
        if (this.getAttribute("show") === "true")
          this.dispatchEvent(new Event("opened"));
        if (this.getAttribute("show") === "false")
          this.dispatchEvent(new Event("closed"));
      };
      this.viewAnimation = elC.animate(anim0, timing0);
      this.viewAnimation.pause();
      this.wrapperAnimation = elW.animate(anim2, timing2);
      this.wrapperAnimation.pause();
    }
  };
  customElements.define("c-overlay", COverlay);
})();
