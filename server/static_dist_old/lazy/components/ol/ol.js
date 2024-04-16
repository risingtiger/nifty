(() => {
  // server/static_dev/lazy/components/ol/ol.js
  var distcss = `:host{position:absolute;width:100%;height:100%;top:0;left:0;z-index:1000}.wrapper{position:absolute;border-radius:0;box-shadow:0 0 0 7px #6cc3df38;border:7px solid rgb(40 171 214 / 47%);opacity:0;box-sizing:border-box;background:#fff;z-index:2}.wrapper.fullscreen{top:10px;left:10px;width:calc(100% - 20px);height:calc(100% - 20px);margin:0}.wrapper>header{display:flex;width:100%;box-sizing:border-box;padding:10px 12px;.left{display:block;width:20%;font-size:16px;font-weight:400;color:var(--actioncolor)}.middle{display:block;width:60%;& h1{font-size:16px;font-weight:700;text-align:center;padding:0;margin:0}}.right{display:block;width:20%;font-size:16px;font-weight:400;text-align:right;color:var(--actioncolor)}}.backgroundcover{position:absolute;width:100%;height:100%;top:0;left:0;z-index:1}
`;
  var COl = class extends HTMLElement {
    shadow;
    $;
    s;
    wrapperAnimation;
    backgroundAnimation;
    viewAnimation;
    sheet;
    static get observedAttributes() {
      return [
        "close"
      ];
    }
    constructor() {
      super();
      this.s = {
        width: "",
        height: "",
        top: "",
        left: "",
        margin_left: "",
        pinto: "",
        closebtn: false,
        showheader: false,
        view: {
          animate: true
        },
        background: {
          opacity: 0.75,
          blur: 4
        },
        wrapper: {
          animation: "fadeup"
        }
      };
      this.$ = this.querySelector;
      this.shadow = this.attachShadow({
        mode: "open"
      });
      SetDistCSS(this.shadow, distcss);
    }
    connectedCallback() {
      this.s.closebtn = this.getAttribute("closebtn") === "true" ? true : false;
      this.s.showheader = this.getAttribute("showheader") === "true" ? true : false;
      const { view, background, wrapper } = get_params(this.s.view, this.s.background, this.s.wrapper, this.getAttribute("view"), this.getAttribute("background"), this.getAttribute("wrapper"));
      this.s.view = view;
      this.s.background = background;
      this.s.wrapper = wrapper;
      const child = this.firstElementChild;
      child.addEventListener("close", () => {
        this.close();
      });
      this.stateChanged();
      this.setup_animations_etc(this.s.view, this.s.background, this.s.wrapper);
      if (child.tagName.startsWith("C-") || child.tagName.startsWith("VP-")) {
        child.addEventListener("hydrated", continue_to_open.bind(this));
      } else {
        continue_to_open.bind(this)();
      }
      this.backgroundAnimation.addEventListener("finish", () => {
        if (this.backgroundAnimation.playbackRate === -1) {
          this.removeAttribute("closing");
          this.removeAttribute("opened");
          this.setAttribute("closed", "true");
          this.dispatchEvent(new Event("close"));
        } else {
          this.removeAttribute("opening");
          this.removeAttribute("closed");
          this.setAttribute("opened", "true");
        }
      });
      function continue_to_open() {
        this.setup_pos_size_etc();
        this.stateChanged();
        this.setAttribute("opening", "true");
        animate_in(this.backgroundAnimation, this.viewAnimation, this.wrapperAnimation, this.s.view.animate);
      }
    }
    async attributeChangedCallback(name) {
      if (name === "close") {
        this.close();
      }
    }
    stateChanged() {
      Lit_Render(this.template(this.s), this.shadow);
    }
    close() {
      this.setAttribute("closing", "true");
      animate_out(this.backgroundAnimation, this.viewAnimation, this.wrapperAnimation, this.s.view.animate);
    }
    setup_animations_etc(vieww, background, wrapper) {
      let elW = this.shadow.querySelector(".wrapper");
      let elB = this.shadow.querySelector(".backgroundcover");
      let elC = document.querySelector("#views .view").shadowRoot.querySelector(".content");
      elB.style.backgroundColor = `rgba(249,249,249,${background.opacity})`;
      elB.style.backdropFilter = `blur(${background.blur}px)`;
      elB.style.webkitBackdropFilter = `blur(${background.blur}px)`;
      const anim0 = [
        {
          transform: "scale(1) translate3d(0, 0px, 0)"
        },
        {
          transform: "scale(0.97) translate3d(0, -15px, 0)"
        }
      ];
      const timing0 = {
        duration: 420,
        easing: "cubic-bezier(.18,.24,.15,1)",
        /*easing: "cubic-bezier(.71,0,0,1)",*/
        fill: "both",
        iterations: 1
      };
      const anim1 = [
        {
          opacity: "0"
        },
        {
          opacity: "1"
        }
      ];
      const timing1 = {
        duration: 420,
        easing: "cubic-bezier(.18,.24,.15,1)",
        fill: "both",
        iterations: 1
      };
      const timing2 = {
        duration: 420,
        easing: "cubic-bezier(.18,.24,.15,1)",
        fill: "both",
        iterations: 1
      };
      this.backgroundAnimation = elB.animate(anim1, timing1);
      this.backgroundAnimation.pause();
      if (vieww.animate) {
        this.viewAnimation = elC.animate(anim0, timing0);
        this.viewAnimation.pause();
      }
      this.wrapperAnimation = elW.animate(animations.get(wrapper.animation), timing2);
      this.wrapperAnimation.pause();
    }
    setup_pos_size_etc() {
      const width = this.getAttribute("width") || "md";
      const height = this.getAttribute("height") || "md";
      let width_num = 0;
      let height_num = 0;
      const top = this.getAttribute("top") || "34";
      const left = this.getAttribute("left");
      const pinto = this.getAttribute("pinto");
      const position = this.getAttribute("pintoposition");
      const align = this.getAttribute("pintoalign");
      if (Number(width) > 0) {
        this.s.width = Number(width) + "px";
        width_num = Number(width);
      } else {
        switch (width) {
          case "xxl":
            this.s.width = "860px";
            width_num = 860;
            break;
          case "xl":
            this.s.width = "700px";
            width_num = 700;
            break;
          case "lg":
            this.s.width = "600px";
            width_num = 600;
            break;
          case "md":
            this.s.width = "480px";
            width_num = 480;
            break;
          case "sm":
            this.s.width = "380px";
            width_num = 380;
            break;
          case "xs":
            this.s.width = "280px";
            width_num = 280;
            break;
        }
      }
      if (Number(height) > 0) {
        this.s.height = Number(height) + "px";
        height_num = Number(height);
      } else {
        if (Number(height) > 0) {
          this.s.height = Number(height) + "px";
        } else {
          if (height === "full") {
            if (window.innerHeight < 850) {
              this.s.height = `calc(100% - 34px - 10px)`;
              height_num = window.innerHeight - 44;
            } else {
              this.s.height = `800px`;
            }
          } else {
            switch (height) {
              case "xl":
                this.s.height = "140px";
                height_num = 140;
                break;
              case "lg":
                this.s.height = "200px";
                height_num = 200;
                break;
              case "md":
                this.s.height = "300px";
                height_num = 300;
                break;
              case "sm":
                this.s.height = "450px";
                height_num = 450;
                break;
              case "xs":
                this.s.height = "550px";
                height_num = 550;
                break;
            }
          }
        }
      }
      if (pinto) {
        const rn = this.getRootNode();
        if (!rn) {
          console.error("No root node for pinto");
          return;
        }
        this.s.pinto = pinto;
        const pintoel = rn.querySelector(this.s.pinto);
        const rect = pintoel.getBoundingClientRect();
        if (position) {
          const p = position.split(" ").map((p2) => p2.trim());
          const a = align.split(" ").map((a2) => a2.trim());
          const alignleftdif = a[0] === "right" ? -width_num : 0;
          const aligntopdif = a[1] === "bottom" ? -height_num : 0;
          if (p[0] === "left") {
            this.s.left = rect.left + alignleftdif + (Number(left) || 0) + "px";
          }
          if (p[0] === "right") {
            this.s.left = rect.right + alignleftdif + (Number(left) || 0) + "px";
          }
          if (p[1] === "top") {
            this.s.top = rect.top + aligntopdif + (Number(top) || 0) + "px";
          }
          if (p[1] === "bottom") {
            this.s.top = rect.bottom + aligntopdif + (Number(top) || 0) + "px";
          }
        } else {
          this.s.left = rect.left + "px";
          this.s.top = rect.bottom + "px";
        }
      }
      if (!this.s.left) {
        this.s.left = "50%";
        this.s.margin_left = "-" + Number(this.s.width.replace("px", "")) / 2 + "px";
      }
      if (!this.s.top) {
        this.s.top = top ? top + "px" : "10%";
      }
    }
    template = (_s) => {
      return Lit_Html`


<div class="wrapper" style="${'width:'+_s.width+';'} ${'height:'+_s.height+';'} ${'left:'+_s.left+';'} ${'top:'+_s.top+';'} ${_s.margin_left ? 'margin-left:' + _s.margin_left : ''}">
  ${_s.showheader ? Lit_Html`
    <header>
      <div class="left">${_s.closebtn ? Lit_Html`<a @click="${()=>this.close()}">close</a>` : ''} <slot name="headerleft"></slot></div>
      <div class="middle"><h1><slot name="headermiddle"></slot></h1></div>
      <div class="right"><slot name="headerright"></slot></div>
    </header>
  ` : ''}
  <slot></slot>
</div>

<div class="backgroundcover" @click="${()=>this.close()}">
    <div class="topcover"></div>
    <div class="bottomcover"></div>
</div>
`;
    };
  };
  customElements.define("c-ol", COl);
  function animate_in(backgroundAnimation, viewAnimation, wrapperAnimation, showviewAnimation) {
    backgroundAnimation.playbackRate = 1;
    backgroundAnimation.currentTime = 0;
    backgroundAnimation.play();
    if (showviewAnimation) {
      viewAnimation.playbackRate = 1;
      viewAnimation.currentTime = 0;
      viewAnimation.play();
    }
    wrapperAnimation.playbackRate = 1;
    wrapperAnimation.currentTime = 0;
    wrapperAnimation.play();
  }
  function animate_out(backgroundAnimation, viewAnimation, wrapperAnimation, showviewAnimation) {
    backgroundAnimation.reverse();
    if (showviewAnimation)
      viewAnimation.reverse();
    wrapperAnimation.reverse();
  }
  function get_params(view, background, wrapper, view_str, background_str, wrapper_str) {
    view_str = view_str || "";
    background_str = background_str || "";
    wrapper_str = wrapper_str || "";
    const view_return = view;
    const background_return = background;
    const wrapper_return = wrapper;
    runit(view_str.split(","), view_return);
    runit(background_str.split(","), background_return);
    runit(wrapper_str.split(","), wrapper_return);
    return {
      view: view_return,
      background: background_return,
      wrapper: wrapper_return
    };
    function runit(s, o) {
      s.forEach((x) => {
        let y = x.trim().split(":");
        y = y.map((z) => z.trim());
        let val = y[1];
        let valn = Number(val);
        if (val === "true")
          val = true;
        else if (val === "false")
          val = false;
        else if (val === "null")
          val = null;
        else if (!isNaN(valn))
          val = valn;
        else
          val = String(val);
        o[y[0]] = val;
      });
    }
  }
  var animations = /* @__PURE__ */ new Map();
  animations.set("fadeup", [
    {
      opacity: "0",
      transform: `translate3d(0, 40px, 0) scale(1.10)`
    },
    {
      opacity: "1",
      transform: "translate3d(0, 0, 0) scale(1)"
    }
  ]);
  animations.set("faderight", [
    {
      opacity: "0",
      transform: `translate3d(-20px, 0, 0) scale(1.10)`
    },
    {
      opacity: "1",
      transform: "translate3d(0, 0, 0) scale(1)"
    }
  ]);
})();
