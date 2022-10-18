
//type int = number
//type bool = boolean
type str = string

declare var Lit_Render: any;
declare var Lit_Html: any;




type State = {
  propa: str
}




class VUpgrade extends HTMLElement {

  state:State;




  constructor() {   
    super(); 
    console.log("v-upgrade constructor");

    this.state = {propa:""};
  }




  connectedCallback() {   
    console.log("v-upgrade connected");   
  }




  activated(_urlmatch:RegExpMatchArray) { 

    return new Promise((res, _rej)=> {

      console.log("v-upgrade activated");   

      res(1);

    })

  }




  stateChanged() {

    console.log("v-upgrade stateChanged. ... Rendering now");

    Lit_Render(this.template(this.state), this);

  }




  template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 
}




customElements.define('v-upgrade', VUpgrade);




export {  }


