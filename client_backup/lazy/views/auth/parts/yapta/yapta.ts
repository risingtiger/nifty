

type str = string; //type bool = boolean;  type int = number;   

declare var GLOBAL_MAINCSS: CSSStyleSheet;

type State = {
    error_msg: str,
}


const cssstylesheet_str = `{--css--}`



class VYapta extends HTMLElement {

$:any 
s:State
cssstylesheet:CSSStyleSheet
shadow:ShadowRoot







constructor() {   

    super(); 

    this.s = {
        error_msg: "",
    }

    this.shadow = this.attachShadow({mode: 'open'});
}




connectedCallback() {   

    setTimeout(()=> {   this.dispatchEvent(new Event('hydrated'))   }, 100)

    document.addEventListener('keyup', (e) => {   if (e.key === 'Enter') {   this.Login();   }})

    this.cssstylesheet = new CSSStyleSheet();
    this.cssstylesheet.replaceSync(cssstylesheet_str);
    this.shadow.adoptedStyleSheets = [ GLOBAL_MAINCSS, this.cssstylesheet ];

    this.stateChanged()

}





stateChanged() {

    Lit_Render(this.template(this.s), this);

}


template = (_s:State) => { return Lit_Html`******************* YAPTA ************ {--htmlcss--} ************* END YAPTA ****`; }; 

}




customElements.define('v-yapta', VYapta);




export {  }



