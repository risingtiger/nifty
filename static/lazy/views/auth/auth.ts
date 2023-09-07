

// type int = number
// type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;




type State = {
    error_msg: str,
}




class VAuth extends HTMLElement {

$:any 
s:State




static get observedAttributes() { return ['animateshow']; }




constructor() {   

    super(); 

    this.s = {
        error_msg: "",
    }

}




connectedCallback() {   

    setTimeout(()=> {   this.dispatchEvent(new Event('hydrate'))   }, 100)

    document.addEventListener('keyup', (e) => {   if (e.key === 'Enter') {   this.Login();   }})

    this.stateChanged()

}





stateChanged() {

    Lit_Render(this.template(this.s), this);

}




async Login() {

    const formel = this.querySelector("form[name='login']") as HTMLFormElement

    const els = formel.elements as any

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI`

    const fetchauth = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({
            email: els.username.value,
            password: els.password.value,
            returnSecureToken: true
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const data = await fetchauth.json()

    if (data.error) {
        this.s.error_msg = data.error.message

    } else {
        localStorage.setItem('id_token', data.idToken);
        localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.expiresIn) ).toString() ),
        localStorage.setItem('refresh_token', data.refreshToken);
        localStorage.setItem('auth_group', 'admin');
        localStorage.setItem('user_email', data.email);
        window.location.hash = 'index'
    }

    this.stateChanged()


    /*
    if ( (els.username.value === "robert@purewater-tech.com" && els.password.value === "pure312water!!") || (els.username.value === "davis@risingtiger.com" && els.password.value === "pure312water!!")) {

        (window as any).___passalong = true

        alert("Logged In Successfully")

        localStorage.setItem('cat', '-');
        localStorage.setItem('acc', els.username.value);
        localStorage.setItem('auth_group', "admin");

        window.location.hash = 'index'

    } else {
        alert("Wrong user name or password")
    }
    */

}




template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 

}




customElements.define('v-auth', VAuth);




export {  }



