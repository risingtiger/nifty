var ShapeE;
(function(ShapeE) {
    ShapeE[ShapeE["NOT_APPLICABLE"] = 0] = "NOT_APPLICABLE";
    ShapeE[ShapeE["PRIORITY_MOBILE_FULL"] = 1] = "PRIORITY_MOBILE_FULL";
    ShapeE[ShapeE["PRIORITY_MOBILE_BOTTOM_HALF"] = 2] = "PRIORITY_MOBILE_BOTTOM_HALF";
    ShapeE[ShapeE["PRIORITY_MOBILE_BOTTOM_THIRD"] = 3] = "PRIORITY_MOBILE_BOTTOM_THIRD";
    ShapeE[ShapeE["PRIORITY_DESKTOP_MD"] = 4] = "PRIORITY_DESKTOP_MD";
    ShapeE[ShapeE["PRIORITY_DESKTOP_LG"] = 5] = "PRIORITY_DESKTOP_LG";
    ShapeE[ShapeE["PRIORITY_DESKTOP_XL"] = 6] = "PRIORITY_DESKTOP_XL";
    ShapeE[ShapeE["PRIORITY_DESKTOP_XXL"] = 7] = "PRIORITY_DESKTOP_XXL";
    ShapeE[ShapeE["XS"] = 8] = "XS";
})(ShapeE || (ShapeE = {}));
class COl extends HTMLElement {
    s;
    m;
    $;
    wrapperAnimation;
    backgroundAnimation;
    viewAnimation;
    viewheaderAnimation;
    sheet;
    shadow;
    static get observedAttributes() {
        return [
            'close'
        ];
    }
    constructor(){
        super();
        this.s = {
            title: "",
            width: "",
            height: "",
            top: "",
            left: "",
            margin_left: "",
            shape: 1,
            /*pinto: "",*/ show_closebtn: true,
            show_header: true,
            is_mobile_centric: false
        };
        this.$ = this.querySelector;
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    connectedCallback() {
        this.s.title = this.getAttribute("title") || "asdfsdf";
        this.s.show_closebtn = this.getAttribute("closebtn") === "false" ? false : true;
        this.s.show_header = this.getAttribute("showheader") === "false" ? false : true;
        const child = this.firstElementChild;
        child.addEventListener("close", ()=>{
            this.close();
        });
        this.sc();
        if (child.tagName.startsWith("C-") || child.tagName.startsWith("VP-")) {
            child.addEventListener("hydrated", continue_to_open.bind(this));
        } else {
            continue_to_open.bind(this)();
        }
        function continue_to_open() {
            this.setup_pos_size_etc();
            this.setup_dom();
            this.setup_animations_etc();
            this.wrapperAnimation.addEventListener("finish", animate_finished.bind(this));
            this.sc();
            this.setAttribute("opening", "true");
            animate_in(this.backgroundAnimation, this.viewAnimation, this.viewheaderAnimation, this.wrapperAnimation);
        }
        function animate_finished() {
            if (this.wrapperAnimation.playbackRate === -1) {
                this.removeAttribute("closing");
                this.removeAttribute("opened");
                this.setAttribute("closed", "true");
                this.dispatchEvent(new Event('close'));
            } else {
                this.removeAttribute("opening");
                this.removeAttribute("closed");
                this.setAttribute("opened", "true");
            }
        }
    }
    async attributeChangedCallback(name) {
        if (name === "close") {
            this.close();
        }
    }
    sc() {
        Lit_Render(this.template(this.s, this.m), this.shadow);
    }
    close() {
        this.setAttribute("closing", "true");
        animate_out(this.backgroundAnimation, this.viewAnimation, this.viewheaderAnimation, this.wrapperAnimation);
    }
    setup_animations_etc() {
        let elW = this.shadow.querySelector(".wrapper");
        let elB = this.shadow.querySelector(".backgroundcover");
        let elC = document.querySelector("#views .view").shadowRoot.querySelector(".content");
        let elCH = document.querySelector("#views .view").shadowRoot.querySelector("header");
        this.backgroundAnimation = elB.animate(ol_animations.get("background_fade_in"), ol_timings.get("mobile_a"));
        this.backgroundAnimation.pause();
        this.viewAnimation = elC.animate(ol_animations.get(`${this.s.is_mobile_centric ? 'mobile' : 'desktop'}_view_slide_down`), ol_timings.get("mobile_a"));
        this.viewAnimation.pause();
        this.viewheaderAnimation = elCH.animate(ol_animations.get(`${this.s.is_mobile_centric ? 'mobile' : 'desktop'}_view_slide_down`), ol_timings.get("mobile_a"));
        this.viewheaderAnimation.pause();
        this.wrapperAnimation = elW.animate(ol_animations.get(`${this.s.is_mobile_centric ? 'mobile' : 'desktop'}_wrapper_fade_up`), ol_timings.get("mobile_a"));
        this.wrapperAnimation.pause();
    }
    setup_pos_size_etc() {
        const ww = window.innerWidth;
        //const hh = window.innerHeight
        const pb = this.getAttribute("shape") || "0";
        const pw = this.getAttribute("width") || "0";
        const ph = this.getAttribute("height") || "0";
        const pt = this.getAttribute("top") || "0";
        const pl = this.getAttribute("left") || "0";
        /*
        const pp = this.getAttribute("pinto") || ""
        const ps = this.getAttribute("pinposition") || ""
        const pa = this.getAttribute("pintoalign") || ""
        */ const shape = Number(pb) || 1;
        let width = Number(pw);
        let height = Number(ph);
        let width_num = 0;
        let height_num = 0;
        let top = Number(pt);
        let left = Number(pl);
        /*
        let pinto_query_str = pp
        let pinto_el:HTMLElement|null = null
        let position = ps
        let align = pa
        */ const DESKTOP_DEFAULT_WIDTH = 480;
        const DESKTOP_TO_MOBILE_DOWNSIZE_WIDTH = 390;
        const DESKTOP_DEFAULT_HEIGHT = 800;
        const DESKTOP_DEFAULT_TOP = 34;
        const MOBILE_DEFAULT_HALF_HEIGHT = 400;
        const MOBILE_DEFAULT_THIRD_HEIGHT = 200;
        if (width > 0) {
            if (ww < DESKTOP_DEFAULT_WIDTH) {
                width = 0;
                height = 0;
            } else {
                width = Number(pw);
                height = height || DESKTOP_DEFAULT_HEIGHT;
            }
        /*
        } else if (pinto_query_str) {

            const rn = this.getRootNode() as ShadowRoot

            if (!rn) {
                console.error("No root node for pinto")
                return
            }

            pinto_el = rn.querySelector(this.s.pinto) as HTMLElement
            const rect = pinto_el.getBoundingClientRect()

            if (position) {

                const p = position.split(" ").map(p=> p.trim())
                const a = align.split(" ").map(a=> a.trim())
                const alignleftdif = a[0] === 'right' ? -width_num : 0
                const aligntopdif = a[1] === 'bottom' ? -height_num : 0

                if (p[0] === "left") {
                    left = (rect.left + alignleftdif + (Number(left) || 0))
                }
                if (p[0] === "right") {
                    left = (rect.right + alignleftdif + (Number(left) || 0))
                }
                if (p[1] === "top") {
                    top = (rect.top + aligntopdif + (Number(top) || 0))
                }
                if (p[1] === "bottom") {
                    top = (rect.bottom + aligntopdif + (Number(top) || 0))
                }
            } else {
                left = rect.left
                top = rect.bottom
            }

        }
        */ } else if (shape === 1 || shape === 2 || shape === 3) {
            if (ww < DESKTOP_DEFAULT_WIDTH) {
                width = 0;
                if (shape === 1) {
                    height = 0;
                } else if (shape === 2) {
                    height = MOBILE_DEFAULT_HALF_HEIGHT;
                } else if (shape === 3) {
                    height = MOBILE_DEFAULT_THIRD_HEIGHT;
                }
            } else {
                width = DESKTOP_TO_MOBILE_DOWNSIZE_WIDTH;
                height = DESKTOP_DEFAULT_HEIGHT;
            }
        } else if (shape === 4 || shape === 5 || shape === 6 || shape === 7) {
            if (ww < DESKTOP_DEFAULT_WIDTH) {
                width = 0;
                height = 0;
            } else {
                if (shape === 4) {
                    width = DESKTOP_DEFAULT_WIDTH;
                    height = DESKTOP_DEFAULT_HEIGHT;
                } else if (shape === 5) {
                    width = 640;
                    height = 1000;
                } else if (shape === 6) {
                    width = 800;
                    height = 1200;
                } else if (shape === 7) {
                    width = 1024;
                    height = 1400;
                }
            }
        } else if (shape === 8) {
            width = 280;
            height = 550;
        }
        if (width === 0) {
            this.s.width = "100%";
            this.s.left = '0';
        } else {
            this.s.width = width + 'px';
            this.s.left = left ? left + 'px' : '50%';
            this.s.margin_left = '-' + width / 2 + 'px';
        }
        if (height === 0) {
            this.s.height = "100%";
            this.s.top = '0';
        } else {
            this.s.height = height + 'px';
            this.s.top = top ? top + 'px' : DESKTOP_DEFAULT_TOP + 'px';
        }
        this.s.is_mobile_centric = ww < DESKTOP_DEFAULT_WIDTH ? true : false;
    }
    setup_dom() {
        const wrapper_el = this.shadow.querySelector(".wrapper");
        wrapper_el.style.width = this.s.width;
        wrapper_el.style.height = this.s.height;
        wrapper_el.style.top = this.s.top;
        wrapper_el.style.left = this.s.left;
        wrapper_el.style.marginLeft = this.s.margin_left;
        if (this.s.is_mobile_centric) {
            wrapper_el.classList.add("mobile_centric");
        }
    }
    template = (_s, _m)=>{
        return Lit_Html`<style>:host {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
}

.wrapper {
    position: absolute;
    border-radius: 8px 8px 0px 0px;
    border: 0px solid rgb(40 171 214 / 47%);
    box-shadow: 0 0 12px -4px rgba(0, 0, 0, 0.5);
    opacity: 0;
    box-sizing: border-box;
    background: white;
    z-index: 2;
}
.wrapper.mobile_centric {
    box-shadow: none;
}

.wrapper > header {
    display: flex;
    width: 100%;
    box-sizing: border-box;
    padding: 10px 12px;

    & .left {
        display: block;
        width: 20%;
		font-family: var(--fontfamily);
        font-size: 16px;
        font-weight: 400;
        color: var(--actioncolor);
    }

    & .middle {
        display: block;
        width: 60%;

        & h1 {
			font-family: var(--fontfamily);
			-webkit-font-smoothing: antialiased;
			color: var(--textcolor);	
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            padding: 0;
            margin: 0;
        }
    }

    & .right {
        display: block;
        width: 20%;
        font-size: 16px;
        font-weight: 400;
        text-align: right;
        color: var(--actioncolor);
    }
}

.backgroundcover {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 0;
    /*will-change: opacity; /* Prevents flicker in Safari */
    /*background-color: #00000036;*/
    background-color: #00000036;
    background-color: rgba(255, 255, 255, 0.9);
}
</style>

<!--

<div 

    class="wrapper 

        ${_s.iswrapper_full_width ? 'fullwidth' : ''} 
        ${_s.wrapper_round_bottom_corners ? 'roundbottom' : ''}" 

    style="
        ${'width:'+_s.width+';'} 
        ${'height:'+_s.height+';'} 
        ${'left:'+_s.left+';'} 
        ${'top:'+_s.top+';'} 
        ${_s.margin_left ? 'margin-left:' + _s.margin_left : ''}">

-->

<div class="wrapper">
  ${_s.show_header ? Lit_Html`
    <header>
      <div class="left">${_s.show_closebtn ? Lit_Html`<a @click="${()=>this.close()}">close</a>` : ''} <slot name="headerleft"></slot></div>
		<div class="middle"><h1>${_s.title}</h1></div>
      <div class="right">&nbsp;</div>
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
}
customElements.define('c-ol', COl);
function animate_in(backgroundAnimation, viewAnimation, viewheaderAnimation, wrapperAnimation) {
    backgroundAnimation.playbackRate = 1;
    backgroundAnimation.currentTime = 0;
    backgroundAnimation.play();
    viewAnimation.playbackRate = 1;
    viewAnimation.currentTime = 0;
    viewAnimation.play();
    viewheaderAnimation.playbackRate = 1;
    viewheaderAnimation.currentTime = 0;
    viewheaderAnimation.play();
    wrapperAnimation.playbackRate = 1;
    wrapperAnimation.currentTime = 0;
    wrapperAnimation.play();
}
function animate_out(backgroundAnimation, viewAnimation, viewheaderAnimation, wrapperAnimation) {
    backgroundAnimation.reverse();
    viewAnimation.reverse();
    viewheaderAnimation.reverse();
    wrapperAnimation.reverse();
}
/*
function get_params(background:BackgroundT, wrapper:WrapperT, view_str:str, background_str:str, wrapper_str:str) : { background:BackgroundT, wrapper:WrapperT } {

    view_str = view_str || ""
    background_str = background_str || ""
    wrapper_str = wrapper_str || ""

    const background_return = background
    const wrapper_return = wrapper

    runit(background_str.split(","), background_return)
    runit(wrapper_str.split(","), wrapper_return)

    return { background:background_return, wrapper:wrapper_return } 

    
    function runit(s:str[], o:any) {
        s.forEach((x:str)=> {
            let y = x.trim().split(":")
            y = y.map((z:str)=> z.trim())

            let val:boolean|number|string|null = y[1]
            let valn = Number(val)
            if (val === "true") val = true
            else if (val === "false") val = false
            else if (val === "null") val = null
            else if (!isNaN(valn)) val = valn
            else val = String(val)

            o[y[0]] = val
        })
    }
}
*/ const ol_animations = new Map();
ol_animations.set("mobile_wrapper_fade_up", [
    {
        opacity: '0',
        transform: `translate3d(0, 44px, 0)`
    },
    {
        opacity: '1',
        transform: "translate3d(0, 0, 0)"
    }
]);
ol_animations.set("desktop_wrapper_fade_up", [
    {
        opacity: '0',
        transform: `translate3d(0, 19px, 0)`
    },
    {
        opacity: '1',
        transform: "translate3d(0, 0, 0)"
    }
]);
ol_animations.set("mobile_view_slide_down", [
    {
        transform: `scale(1) translate3d(0, 0px, 0)`
    },
    {
        transform: "scale(0.9) translate3d(0, 28px, 0)"
    }
]);
ol_animations.set("desktop_view_slide_down", [
    {
        transform: `scale(1) translate3d(0, 0px, 0)`
    },
    {
        transform: "scale(0.97) translate3d(0, 15px, 0)"
    }
]);
ol_animations.set("background_fade_in", [
    {
        opacity: `0`
    },
    {
        opacity: "1"
    }
]);
const ol_timings = new Map();
ol_timings.set("mobile_a", {
    duration: 500,
    easing: "cubic-bezier(0.69, 0, 0.29, 1)",
    fill: "both",
    iterations: 1
});
ol_timings.set("dekstop_a", {
    duration: 500,
    easing: "cubic-bezier(0.69, 0, 0.29, 1)",
    fill: "both",
    iterations: 1
});
export { };
