var ModeT;
(function(ModeT) {
    ModeT[ModeT["CLOSED"] = 0] = "CLOSED";
    ModeT[ModeT["OPEN"] = 1] = "OPEN";
    ModeT[ModeT["OPENING"] = 2] = "OPENING";
    ModeT[ModeT["CLOSING"] = 3] = "CLOSING";
})(ModeT || (ModeT = {}));
var LevelT;
(function(LevelT) {
    LevelT[LevelT["INFO"] = 0] = "INFO";
    LevelT[LevelT["SAVED"] = 1] = "SAVED";
    LevelT[LevelT["SUCCESS"] = 2] = "SUCCESS";
    LevelT[LevelT["WARNING"] = 3] = "WARNING";
    LevelT[LevelT["ERROR"] = 4] = "ERROR";
})(LevelT || (LevelT = {}));
const DUMMYEL = document.createElement("div");
class CToast extends HTMLElement {
    s;
    m;
    els;
    shadow;
    static get observedAttributes() {
        return [
            'clink'
        ];
    }
    constructor(){
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.s = {
            mode: 0,
            level: 0,
            isanimating: false,
            msg: "",
            level_class: ""
        };
        this.m = {
            c: ""
        };
        this.els = {
            msg: DUMMYEL
        };
    }
    connectedCallback() {
        this.sc();
    }
    async attributeChangedCallback(name, oldval, newval) {
        if (name == "clink" && newval === 'run' && (oldval === '' || oldval === null)) {
            const msg = this.getAttribute("msg") || "";
            const level = this.getAttribute("level") || "0";
            const duration = this.getAttribute("duration") || "5000";
            await this.clink(msg, Number(level), Number(duration));
            this.setAttribute("clink", "");
        }
    }
    clink(msg, level, duration) {
        return new Promise((res)=>{
            duration = duration || 5000;
            this.els.msg = this.shadow.getElementById("msg");
            this.els.msg.textContent = msg;
            switch(level){
                case 0:
                    this.classList.add("level_info");
                    break;
                case 1:
                    this.classList.add("level_saved");
                    break;
                case 2:
                    this.classList.add("level_success");
                    break;
                case 3:
                    this.classList.add("level_warning");
                    break;
                case 4:
                    this.classList.add("level_error");
                    break;
            }
            this.style.display = "block";
            this.offsetHeight;
            this.classList.add("active");
            setTimeout(()=>{
                this.classList.remove("active");
                this.addEventListener("transitionend", transitionend);
            }, duration);
            function transitionend() {
                this.removeEventListener("transitionend", transitionend);
                this.style.display = "none";
                console.log("transitionend");
                res(1);
            }
        });
    }
    sc() {
        Lit_Render(this.template(), this.shadow);
    }
    template = ()=>{
        return Lit_Html`<style>

:host {
    display: none;
    position: absolute;
    left: 50%;
    margin-left: -175px;
    box-sizing: border-box;
    width: 350px;
    height: 40px;
    bottom: 20px;
    padding: var(--padding-container);
    z-index: 10000;
    background-color: #333;
    border-radius: 8px;
    box-shadow: 0 0 20px 7px rgb(0 0 0 / 16%);
    opacity: 0;
    transform: translate3d(0, 30px, 14px) perspective(300px) rotateX(72deg);
    transition-duration: 0.5s;
    transition-property: transform opacity;
    transition-timing-function: cubic-bezier(0.75, 0, 0.52, 1.51);
}
:host(.active) {
    opacity: 1;
    transform: translate3d(0, 0, 0) perspective(300px) rotateX(0deg);
}
:host(.level_info) {
    background-color: #007bff;
}
:host(.level_warning) {
    background-color: #ffc107;
}
:host(.level_error) {
    background-color: #dc3545;
}
:host(.level_success) {
    background-color: #28a745;
}
:host(.level_saved) {
    background-color: #0eb8ab;
}

:host > #msg {
    color: white;
    font-size: 14px;
    FONT-WEIGHT: 700;
    text-align: center;
}


</style>
<div id="msg"></div>
`;
    };
}
customElements.define('c-toast', CToast);
export { };
