

type int = number
type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;

type ViewT = {
    animate: bool,
}

type BackgroundT = {
    opacity: int,
    blur: int,
}

type WrapperT = {
    animation: str
}

type State = {
    width: str,
    height: str,
    top: str,
    left: str,
    margin_left: str,
    pinto: str,
    closebtn: bool,
    showheader: bool,
    view: ViewT,
    background: BackgroundT,
    wrapper: WrapperT,
}


let distcss = `{--distcss--}`;


class COl extends HTMLElement {

    shadow:ShadowRoot
    $:any
    s:State
    wrapperAnimation!:Animation|null
    backgroundAnimation!:Animation|null
    viewAnimation!:Animation|null
    sheet:CSSStyleSheet




    static get observedAttributes() { return ['close']; }




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
            view: {animate:true},
            background: {opacity:0.75, blur:4},
            wrapper: {animation:"fadeup"}
        }

        this.$ = this.querySelector

        this.shadow = this.attachShadow({mode: 'open'});

        SetDistCSS(this.shadow, distcss)
    }




    connectedCallback() {   

        this.s.closebtn = this.getAttribute("closebtn") === "true" ? true : false
        this.s.showheader = this.getAttribute("showheader") === "true" ? true : false

        const { view, background, wrapper } = get_params(this.s.view, this.s.background, this.s.wrapper, this.getAttribute("view")!, this.getAttribute("background")!, this.getAttribute("wrapper")!)
        this.s.view = view
        this.s.background = background
        this.s.wrapper = wrapper

        const child = this.firstElementChild as HTMLElement

        child.addEventListener("close", ()=> {
            this.close()
        })


        this.stateChanged()

        this.setup_animations_etc(this.s.view, this.s.background, this.s.wrapper)

        if (child.tagName.startsWith("C-") || child.tagName.startsWith("VP-")) {
            child.addEventListener("hydrated", continue_to_open.bind(this))
        } else {
            continue_to_open.bind(this)()
        }

        this.backgroundAnimation!.addEventListener("finish", ()=> {
            if (this.backgroundAnimation!.playbackRate === -1) {
                this.removeAttribute("closing")
                this.removeAttribute("opened")
                this.setAttribute("closed", "true")
                this.dispatchEvent(new Event('close'))
            } else {
                this.removeAttribute("opening")
                this.removeAttribute("closed")
                this.setAttribute("opened", "true")
            }
        })


        function continue_to_open() {
            this.setup_pos_size_etc()
            this.stateChanged()
            this.setAttribute("opening", "true")
            animate_in(this.backgroundAnimation, this.viewAnimation, this.wrapperAnimation, this.s.view.animate)
        }
    }




    async attributeChangedCallback(name:str) {

        if (name === "close") { 
            this.close()
        }
    }



    stateChanged() {   Lit_Render(this.template(this.s), this.shadow);   }




    close() {
        this.setAttribute("closing", "true")
        animate_out(this.backgroundAnimation!, this.viewAnimation!, this.wrapperAnimation!, this.s.view.animate)
    }



    setup_animations_etc(vieww:ViewT, background:BackgroundT, wrapper:WrapperT) {

        let elW = this.shadow.querySelector(".wrapper")!
        let elB = this.shadow.querySelector(".backgroundcover") as HTMLElement
        let elC = document.querySelector("#views .view")!.shadowRoot!.querySelector(".content") as HTMLElement

        elB.style.backgroundColor = `rgba(249,249,249,${background.opacity})`
        elB.style.backdropFilter = `blur(${background.blur}px)`
        //@ts-ignore
        elB.style.webkitBackdropFilter = `blur(${background.blur}px)`

        const anim0 = [
          {transform: "translate3d(0, 0px, 0)"},
          {transform: "translate3d(0, -55px, 0)"}
        ]
        const timing0 = {
          duration: 380,
          easing: "cubic-bezier(.71,0,0,1)",
          fill: "both",
          iterations: 1,
        }
        const anim1 = [
          {opacity: '0'},
          {opacity: '1'}
        ]
        const timing1 = {
          duration: 380,
          easing: "cubic-bezier(.71,0,0,1)",
          fill: "both",
          iterations: 1,
        }
        const timing2 = {
          duration: 380,
          easing: "cubic-bezier(.71,0,0,1)",
          fill: "both",
          iterations: 1,
        }

        this.backgroundAnimation = elB.animate(anim1, timing1 as any)
        this.backgroundAnimation.pause()

        if (vieww.animate) {
            this.viewAnimation = elC.animate(anim0, timing0 as any)
            this.viewAnimation.pause()
        }

        this.wrapperAnimation = elW.animate(animations.get(wrapper.animation) as Keyframe[], timing2 as any)
        this.wrapperAnimation.pause()
    }



    setup_pos_size_etc() {

        const width = this.getAttribute("width") || "md"
        const height = this.getAttribute("height") || "md"
        let width_num = 0
        let height_num = 0
        const top = this.getAttribute("top") || "34"
        const left = this.getAttribute("left")
        const pinto = this.getAttribute("pinto")
        const position = this.getAttribute("pintoposition")
        const align = this.getAttribute("pintoalign")!

        if (Number(width) > 0) {
            this.s.width = Number(width) + 'px'
            width_num = Number(width)
        } else {
            switch (width) {
                case "xxl": this.s.width = 860+'px'; width_num = 860; break;
                case "xl":  this.s.width = 700+'px'; width_num = 700; break;
                case "lg":  this.s.width = 600+'px'; width_num = 600; break;
                case "md":  this.s.width = 480+'px'; width_num = 480; break;
                case "sm":  this.s.width = 380+'px'; width_num = 380; break;
                case "xs":  this.s.width = 280+'px'; width_num = 280; break;
            }
        }

        if (Number(height) > 0) {
            this.s.height = Number(height) + 'px'
            height_num = Number(height)
        } 
        else {
            if (Number(height) > 0) {
                this.s.height = Number(height) + 'px'
            } else {
                if (height === "full") {
                    if (window.innerHeight < 850) {
                        this.s.height = `calc(100% - 34px - 10px)`; height_num = window.innerHeight - 44;
                    } else {
                        this.s.height = `800px`;
                    }
                } else {
                    switch (height) {
                        case "xl":   this.s.height = 140+'px'; height_num = 140; break;
                        case "lg":   this.s.height = 200+'px'; height_num = 200; break;
                        case "md":   this.s.height = 300+'px'; height_num = 300; break;
                        case "sm":   this.s.height = 450+'px'; height_num = 450; break;
                        case "xs":   this.s.height = 550+'px'; height_num = 550; break;
                    }
                }
            }
        }

        if (pinto) {

            const rn = this.getRootNode() as ShadowRoot

            if (!rn) {
                console.error("No root node for pinto")
                return
            }

            this.s.pinto = pinto
            const pintoel = rn.querySelector(this.s.pinto) as HTMLElement
            const rect = pintoel.getBoundingClientRect()

            if (position) {

                const p = position.split(" ").map(p=> p.trim())
                const a = align.split(" ").map(a=> a.trim())
                const alignleftdif = a[0] === 'right' ? -width_num : 0
                const aligntopdif = a[1] === 'bottom' ? -height_num : 0

                if (p[0] === "left") {
                    this.s.left = (rect.left + alignleftdif + (Number(left) || 0)) + 'px'
                }
                if (p[0] === "right") {
                    this.s.left = (rect.right + alignleftdif + (Number(left) || 0)) + 'px'
                }
                if (p[1] === "top") {
                    this.s.top = (rect.top + aligntopdif + (Number(top) || 0)) + 'px'
                }
                if (p[1] === "bottom") {
                    this.s.top = (rect.bottom + aligntopdif + (Number(top) || 0)) + 'px'
                }
            } else {
                this.s.left = rect.left + 'px'
                this.s.top = rect.bottom + 'px'
            }

        } 

        if (!this.s.left) {
            this.s.left = '50%'
            this.s.margin_left = '-'+(Number(this.s.width.replace("px", ""))/2)+'px'
        }

        if (!this.s.top) {
            this.s.top = top ? top + 'px' : '10%'
        }
    }



    template = (_s:State) => { return Lit_Html`{--devservercss--}{--html--}`; }; 
}




customElements.define('c-ol', COl);




function animate_in(backgroundAnimation:Animation, viewAnimation:Animation, wrapperAnimation:Animation, showviewAnimation:bool) {


    backgroundAnimation!.playbackRate = 1
    backgroundAnimation!.currentTime = 0
    backgroundAnimation!.play()

    if (showviewAnimation) {
        viewAnimation!.playbackRate = 1
        viewAnimation!.currentTime = 0
        viewAnimation!.play()
    }

    wrapperAnimation!.playbackRate = 1
    wrapperAnimation!.currentTime = 0
    wrapperAnimation!.play()
}

function animate_out(backgroundAnimation:Animation, viewAnimation:Animation, wrapperAnimation:Animation, showviewAnimation:bool) {

    backgroundAnimation!.reverse()

    if (showviewAnimation)
        viewAnimation!.reverse()

    wrapperAnimation!.reverse()
}




function get_params(view:ViewT, background:BackgroundT, wrapper:WrapperT, view_str:str, background_str:str, wrapper_str:str) : { view:ViewT, background:BackgroundT, wrapper:WrapperT } {

    view_str = view_str || ""
    background_str = background_str || ""
    wrapper_str = wrapper_str || ""

    const view_return = view
    const background_return = background
    const wrapper_return = wrapper

    runit(view_str.split(","), view_return)
    runit(background_str.split(","), background_return)
    runit(wrapper_str.split(","), wrapper_return)

    return { view:view_return, background:background_return, wrapper:wrapper_return } 

    
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




const animations = new Map<str, Array<any>>()

animations.set("fadeup", [
    {opacity: '0', transform: `translate3d(0, 80px, 0) scale(1.10)`},
    {opacity: '1', transform: "translate3d(0, 0, 0) scale(1)"}
])

animations.set("faderight", [
    {opacity: '0', transform: `translate3d(-20px, 0, 0) scale(1.10)`},
    {opacity: '1', transform: "translate3d(0, 0, 0) scale(1)"}
])

export {  }



