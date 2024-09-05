

// type int = number
// type bool = boolean
type str = string


declare var Lit_Render: any;
declare var Lit_Html: any;
declare var SetDistCSS: any;
declare var FetchLassie: any;




type State = {
    error_msg: str,
}


let distcss = `{--distcss--}`;


class VAuth extends HTMLElement {

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

    SetDistCSS(this.shadow, distcss)
}




connectedCallback() {   

    setTimeout(()=> {   this.dispatchEvent(new Event('hydrated'))   }, 100)

    document.addEventListener('keyup', (e) => {   if (e.key === 'Enter') {   this.Login();   }})

    this.stateChanged()
}





stateChanged() {

    Lit_Render(this.template(this.s), this.shadow);

}




async Login() {

    const formel = this.shadow.querySelector("form[name='login']") as HTMLFormElement

    const els = formel.elements as any

    const identity_platform_key = localStorage.getItem('identity_platform_key')
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=` + identity_platform_key

    const opts = {
        method: 'POST',
        body: JSON.stringify({
            email: els.username.value,
            password: els.password.value,
            returnSecureToken: true
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }

	let data:any = {}

	if (window.location.hostname === "localhost") {
		data = {
			idToken: "local_token",
			expiresIn: 3600,
			refreshToken: "local refresh",
			email: els.username.value
		}

		localStorage.setItem('id_token', data.idToken);
		localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.expiresIn) ).toString() ),
		localStorage.setItem('refresh_token', data.refreshToken);
		localStorage.setItem('user_email', data.email);
		localStorage.setItem('auth_group', 'user');

		window.location.hash = 'home'
	}
	
	else {
		data = await FetchLassie(url, opts) as any

		if (data.error) {
			this.s.error_msg = data.error.message
			this.stateChanged()

		} else {
			localStorage.setItem('id_token', data.idToken);
			localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.expiresIn) ).toString() ),
			localStorage.setItem('refresh_token', data.refreshToken);
			localStorage.setItem('user_email', data.email);

			if (data.email === "accounts@risingtiger.com")
				localStorage.setItem('auth_group', 'admin');
			else 
				localStorage.setItem('auth_group', 'user');

			window.location.hash = 'home'
		}
	}



    /*
    if ( (els.username.value === "robert@purewater-tech.com" && els.password.value === "pure312water!!") || (els.username.value === "davis@risingtiger.com" && els.password.value === "pure312water!!")) {

        (window as any).___passalong = true

        alert("Logged In Successfully")

        localStorage.setItem('cat', '-');
        localStorage.setItem('acc', els.username.value);
        localStorage.setItem('auth_group', "admin");

        window.location.hash = 'home'

    } else {
        alert("Wrong user name or password")
    }
    */

}




template = (_s:State) => { return Lit_Html`{--devservercss--}{--html--}`; }; 

}




customElements.define('v-auth', VAuth);




export {  }



