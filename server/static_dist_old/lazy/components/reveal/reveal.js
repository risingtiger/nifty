(() => {
  // server/static_dev/lazy/components/reveal/reveal.js
  var distcss = `:host{display:none;position:absolute;width:100%;box-sizing:border-box;top:0;left:0;padding:0;background-color:#f5f5f5;clip-path:polygon(0% 0%,100% 0%,100% 0%,0% 0%);transition-property:clip-path;transition-duration:.9s;transition-timing-function:cubic-bezier(.91,0,.19,1)}.wrap{opacity:0;transform:translateY(-20px);transition-property:transform,opacity;transition-duration:.9s;transition-timing-function:cubic-bezier(.91,0,.19,1)}
`;
  var CReveal = class extends HTMLElement {
    s;
    shadow;
    static get observedAttributes() {
      return [
        "active"
      ];
    }
    constructor() {
      super();
      this.shadow = this.attachShadow({
        mode: "open"
      });
      this.s = {
        siblinglevel: "parent",
        selfactuated: true,
        parent: this.parentElement,
        grandparent: this.parentElement.parentElement,
        grandparent_children: Array.from(this.parentElement.parentElement.children),
        parentindex: Array.from(this.parentElement.parentElement.children).indexOf(this.parentElement),
        //nextsibling: this,
        wrap: this,
        parent_height: 0,
        isopen: false
      };
      SetDistCSS(this.shadow, distcss);
    }
    connectedCallback() {
      if (this.s.selfactuated) {
        this.s.parent.addEventListener("click", (e) => {
          if (e.srcElement.closest("c-reveal") === this) {
            return;
          }
          if (this.s.siblinglevel === "self") {
            console.info("will build this in at some point");
            return;
          }
          if (this.s.grandparent_children.find((a) => a.dataset._reveal_transitioning === "true")) {
            return;
          }
          let x = this.hasAttribute("active");
          if (x)
            this.removeAttribute("active");
          else
            this.setAttribute("active", "");
        });
      }
      this.sc();
    }
    async attributeChangedCallback(name, _oldval, newval) {
      if (name === "active") {
        let active = newval === null ? false : true;
        if (active) {
          this.showit();
        } else {
          this.closeit();
        }
      }
    }
    sc() {
      Lit_Render(this.template(this.s), this.shadow);
    }
    showit() {
      if (this.s.siblinglevel === "self") {
        console.info("will build this in at some point");
        return;
      }
      this.s.wrap = this.shadow.querySelector(".wrap"), this.s.parent_height = this.parentElement.offsetHeight, this.s.parent.dataset._reveal_transitioning = "true";
      this.s.parent.style.position = "relative";
      this.style.display = "block";
      this.style.top = this.s.parent_height + "px";
      for (const a of this.s.grandparent_children) {
        a.style.transition = `transform 0.9s cubic-bezier(0.91, 0, 0.19, 1)`;
      }
      this.addEventListener("transitionend", open_end);
      setTimeout(this.showit_after_timeout.bind(this), 10);
      function open_end() {
        delete this.s.parent.dataset._reveal_transitioning;
        this.removeEventListener("transitionend", open_end);
      }
    }
    showit_after_timeout() {
      const height = this.offsetHeight;
      this.style.clipPath = `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`;
      this.s.wrap.style.opacity = "1.0";
      this.s.wrap.style.transform = `translateY(0px)`;
      for (let i = this.s.parentindex + 1; i < this.s.grandparent_children.length; i++) {
        const a = this.s.grandparent_children[i];
        const m = a.style.transform.match(/translateY\(([0-9]+)px\)/);
        const y = m ? Number(m[1]) : 0;
        a.style.transform = `translateY(${y + height}px)`;
      }
    }
    closeit() {
      if (this.s.siblinglevel === "self") {
        console.info("will build this in at some point");
        return;
      }
      this.s.parent.dataset._reveal_transitioning = "true";
      this.addEventListener("transitionend", close_end);
      this.style.clipPath = `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`;
      this.s.wrap.style.transform = `translateY(-20px)`;
      this.s.wrap.style.opacity = `0`;
      if (!this.s.grandparent_children[this.s.parentindex + 1]) {
        return;
      }
      const height = this.offsetHeight;
      for (let i = this.s.parentindex + 1; i < this.s.grandparent_children.length; i++) {
        const a = this.s.grandparent_children[i];
        const a_m = a.style.transform.match(/translateY\(([0-9]+)px\)/);
        const a_y = a_m ? Number(a_m[1]) : 0;
        a.style.transform = `translateY(${a_y - height}px)`;
      }
      function close_end() {
        delete this.s.parent.dataset._reveal_transitioning;
        this.s.parent.style.position = "inherit";
        this.style.display = "none";
        this.removeEventListener("transitionend", close_end);
      }
    }
    template = (_s) => {
      return Lit_Html`

<div class="wrap">
    <slot></slot>
</div>
`;
    };
  };
  customElements.define("c-reveal", CReveal);
})();
