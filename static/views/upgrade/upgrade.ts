
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

    this.state = {propa:""};
  }




  connectedCallback() {   
  }




  activated(_urlmatch:RegExpMatchArray) { 

    return new Promise((res, _rej)=> {


      res(1);

    })

  }




  stateChanged() {


    Lit_Render(this.template(this.state), this);

  }




  template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 
}




customElements.define('v-upgrade', VUpgrade);




export {  }


