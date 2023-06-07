
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

        this.stateChanged()

        setTimeout(()=> {   this.dispatchEvent(new Event('hydrate'))   }, 100)

        setTimeout(()=> {   

            if (document.location.href.includes("upgrade_1")) {
                window.location.href = "http://www.yavada.com/bouncebacktopurewater?round=1"   
            }

            if (document.location.href.includes("upgrade_2")) {
                window.location.href = "http://www.yavada.com/bouncebacktopurewater?round=2"   
            }

        }, 5000)

    }




  stateChanged() {

    Lit_Render(this.template(this.state), this);

  }




  template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 
}




customElements.define('v-upgrade', VUpgrade);




export {  }


