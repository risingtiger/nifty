

type int = number
type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;


type State = {
    width: str,
    height: str,
    top: str,
    left: str,
    margin_left: str,
    pinto: str,
    closebtn: bool,
    showheader: bool,
}




class COverlay extends HTMLElement {

    shadow:ShadowRoot
    $:any
    s:State
    wrapperAnimation!:Animation|null
    backgroundAnimation!:Animation|null
    viewAnimation!:Animation|null




    static get observedAttributes() { return ['closing']; }




    constructor() {   

        super(); 

        this.shadow = this.attachShadow({ mode: "open" });

        this.s = {
            width: "",
            height: "",
            top: "",
            left: "",
            margin_left: "",
            pinto: "",
            closebtn: false,
            showheader: false,
        }

        this.$ = this.querySelector
    }




    connectedCallback() {   

        this.s.closebtn = this.getAttribute("closebtn") === "true" ? true : false
        this.s.showheader = this.getAttribute("showheader") === "true" ? true : false
        this.stateChanged()

        this.setup_animations_etc()

        const child = this.firstElementChild as HTMLElement

        if (child.tagName.substring(0,2) === "C-") {
            child.addEventListener("hydrated", continue_to_open.bind(this))
            child.addEventListener("closing", ()=> {
                this.dispatchEvent(new Event('closing'))
            })

        } else {
            continue_to_open.bind(this)()
        }

        this.addEventListener("animated_in", ()=> {
            this.dispatchEvent(new Event('opened'))
        })

        this.backgroundAnimation.addEventListener("finish", ()=> {
            if (this.backgroundAnimation!.playbackRate === -1) {
                this.dispatchEvent(new Event('closed'))
            } else {
                this.dispatchEvent(new Event('opened'))
            }
        })


        function continue_to_open() {
            this.setup_pos_size_etc()
            this.stateChanged()
            animate_in(this.backgroundAnimation, this.viewAnimation, this.wrapperAnimation)
        }
    }




    async attributeChangedCallback(name:str) {

        if (name === "closing") { 
            animate_out(this.backgroundAnimation, this.viewAnimation, this.wrapperAnimation)
        }
    }



    stateChanged() {   Lit_Render(this.template(this.s), this.shadow);   }




    setup_animations_etc() {

        let elW = this.shadow.querySelector(".wrapper")!
        let elB = this.shadow.querySelector(".backgroundcover")!
        let elC = document.querySelector("#views > .view > .content")!

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
        const anim2 = [
          {opacity: '0', transform: `translate3d(0, 80px, 0) scale(1.10)`},
          {opacity: '1', transform: "translate3d(0, 0, 0) scale(1)"}
        ]
        const timing2 = {
          duration: 380,
          easing: "cubic-bezier(.71,0,0,1)",
          fill: "both",
          iterations: 1,
        }

        this.backgroundAnimation = elB.animate(anim1, timing1 as any)
        this.backgroundAnimation.pause()

        this.viewAnimation = elC.animate(anim0, timing0 as any)
        this.viewAnimation.pause()

        this.wrapperAnimation = elW.animate(anim2, timing2 as any)
        this.wrapperAnimation.pause()
    }



    setup_pos_size_etc() {

        const width = this.getAttribute("width")
        const height = this.getAttribute("height")
        let width_num = 0
        let height_num = 0
        const top = this.getAttribute("top")
        const left = this.getAttribute("left")
        const pinto = this.getAttribute("pinto")
        const position = this.getAttribute("pintoposition")
        const align = this.getAttribute("pintoalign")

        if (width) {
            if (Number(width) > 0) {
                this.s.width = Number(width) + 'px'
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
        } else {
            this.s.width = 480+'px'
            width_num = 480
        }
        if (height) {
            if (Number(height) > 0) {
                this.s.height = Number(height) + 'px'
            } else {
                switch (height) {
                    case "xl":  this.s.height = 140+'px'; height_num = 140; break;
                    case "lg":  this.s.height = 200+'px'; height_num = 200; break;
                    case "md":  this.s.height = 300+'px'; height_num = 300; break;
                    case "sm":  this.s.height = 450+'px'; height_num = 450; break;
                    case "xs":  this.s.height = 550+'px'; height_num = 550; break;
                }
            }
        } else {
            this.s.height = 300+'px'
            height_num = 300
        }

        if (pinto) {
            this.s.pinto = pinto
            const el = document.querySelector(this.s.pinto)
            const rect = el.getBoundingClientRect()

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



    template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 
}




customElements.define('c-overlay', COverlay);




function animate_in(backgroundAnimation:Animation, viewAnimation:Animation, wrapperAnimation:Animation) {
    backgroundAnimation!.playbackRate = 1
    backgroundAnimation!.currentTime = 0
    backgroundAnimation!.play()

    viewAnimation!.playbackRate = 1
    viewAnimation!.currentTime = 0
    viewAnimation!.play()

    wrapperAnimation!.playbackRate = 1
    wrapperAnimation!.currentTime = 0
    wrapperAnimation!.play()
}

function animate_out(backgroundAnimation:Animation, viewAnimation:Animation, wrapperAnimation:Animation) {
    backgroundAnimation!.reverse()
    viewAnimation!.reverse()
    wrapperAnimation!.reverse()
}




export {  }



