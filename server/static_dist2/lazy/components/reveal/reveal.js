class CReveal extends HTMLElement {
    s;
    m;
    shadow;
    static get observedAttributes() {
        return [
            'active'
        ];
    }
    constructor(){
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.s = {
            siblinglevel: "parent",
            selfactuated: true,
            parent: this.parentElement,
            grandparent: this.parentElement.parentElement,
            grandparent_children: Array.from(this.parentElement.parentElement.children),
            parentindex: Array.from(this.parentElement.parentElement.children).indexOf(this.parentElement),
            wrap: this,
            parent_height: 0,
            isopen: false
        };
    }
    connectedCallback() {
        if (this.s.selfactuated) {
            this.s.parent.addEventListener("click", (e)=>{
                if (e.srcElement.closest("c-reveal") === this) {
                    return;
                }
                if (this.s.siblinglevel === "self") {
                    console.info("will build this in at some point");
                    return;
                }
                if (this.s.grandparent_children.find((a)=>a.dataset._reveal_transitioning === "true")) {
                    return;
                }
                let x = this.hasAttribute("active");
                if (x) this.removeAttribute("active");
                else this.setAttribute("active", "");
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
        Lit_Render(this.template(this.s, this.m), this.shadow);
    }
    showit() {
        if (this.s.siblinglevel === "self") {
            console.info("will build this in at some point");
            return;
        }
        this.addEventListener("transitionend", open_end);
        this.s.wrap = this.shadow.querySelector(".wrap"), this.s.parent_height = this.parentElement.offsetHeight, this.s.parent.dataset._reveal_transitioning = "true";
        this.s.parent.style.position = "relative";
        this.style.display = "block";
        this.style.top = this.s.parent_height + "px";
        const lih5_el = this.s.parent.querySelector("h5");
        lih5_el.style.transitionProperty = "transform";
        lih5_el.style.transitionDuration = "0.9s";
        lih5_el.style.transitionTimingFunction = "cubic-bezier(0.91, 0, 0.19, 1)";
        lih5_el.style.transformOrigin = "13px 31px";
        for (const a of this.s.grandparent_children){
            a.style.transitionProperty = "transform";
            a.style.transitionDuration = "0.9s";
            a.style.transitionTimingFunction = "cubic-bezier(0.91, 0, 0.19, 1)";
        }
        this.s.parent.style.boxShadow = "rgba(236, 236, 236, 0) 0px 4px 0px inset";
        this.s.parent.style.transitionProperty = "transform, box-shadow, background-color, border-bottom-color";
        const height = this.offsetHeight;
        lih5_el.style.transform = "scale(1.3)";
        this.s.parent.style.boxShadow = "rgba(236, 236, 236,1) 0px 4px 0px inset";
        this.s.parent.style.backgroundColor = "rgba(200, 200, 200, 0.10)";
        this.s.parent.style.borderBottomColor = "rgba(200, 200, 200, 0.0)";
        this.style.clipPath = `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`;
        this.s.wrap.style.opacity = '1.0';
        this.s.wrap.style.transform = `translateY(0px)`;
        for(let i = this.s.parentindex + 1; i < this.s.grandparent_children.length; i++){
            const a = this.s.grandparent_children[i];
            const m = a.style.transform.match(/translateY\(([0-9]+)px\)/);
            const y = m ? Number(m[1]) : 0;
            a.style.transform = `translateY(${y + height}px)`;
        }
        function open_end() {
            delete this.s.parent.dataset._reveal_transitioning;
            this.removeEventListener("transitionend", open_end);
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
        const lih5_el = this.s.parent.querySelector("h5");
        lih5_el.style.transform = "scale(1.0)";
        this.s.parent.style.boxShadow = "rgba(236, 234, 234, 0) 0px 4px 0px inset";
        this.s.parent.style.backgroundColor = "rgba(200, 200, 200, 0)";
        this.s.parent.style.borderBottomColor = "var(--bordercolor)";
        if (!this.s.grandparent_children[this.s.parentindex + 1]) {
            return;
        }
        //const m = this.s.grandparent_children[this.s.parentindex + 1].style.transform.match(/translateY\(([0-9]+)px\)/)
        const height = this.offsetHeight;
        //let y = m ? Number(m[1]) : 0
        for(let i = this.s.parentindex + 1; i < this.s.grandparent_children.length; i++){
            const a = this.s.grandparent_children[i];
            const a_m = a.style.transform.match(/translateY\(([0-9]+)px\)/);
            const a_y = a_m ? Number(a_m[1]) : 0;
            a.style.transform = `translateY(${a_y - height}px)`;
        }
        function close_end() {
            delete this.s.parent.dataset._reveal_transitioning;
            this.s.parent.style.position = "inherit";
            this.s.parent.style.boxShadow = "";
            this.s.parent.style.backgroundColor = "";
            this.style.display = "none";
            this.s.parent.style.transitionProperty = "transform";
            /*
			for(const a of this.s.grandparent_children) {
				a.style.transitionProperty = ""
				a.style.transitionDuration = ""
				a.style.transitionTimingFunction = ""
			}
			*/ this.removeEventListener("transitionend", close_end);
        }
    }
    template = (_s, _m)=>{
        return Lit_Html`<style>

:host {
    display: none;
    position: absolute;
    width: 100%;
    box-sizing: border-box;
    top: 0;
    left: 0;
    padding: 0;
    border-bottom: 0.5px solid var(--bordercolor);
    /*background-color: #f5f5f5;*/
    background-color: rgba(220, 220, 220, 0);
    clip-path: polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%);
    transition-property: clip-path;
    transition-duration: 0.9s;
    transition-timing-function: cubic-bezier(0.91, 0, 0.19, 1);
}


.wrap {
    opacity: 0;
    transform: translateY(-20px);
    transition-property: transform, opacity, background-color;
    transition-duration: 0.9s;
    transition-timing-function: cubic-bezier(0.91, 0, 0.19, 1);
    box-shadow: inset 0 -4px 0px 0px rgb(227 227 227);
    background-color: rgb(200 200 200 / 14%);
}

</style>

<div class="wrap">
    <slot></slot>
</div>
`;
    };
}
customElements.define('c-reveal', CReveal);
/*
function fncy() {
}
*/ export { };
