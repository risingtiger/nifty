// type int = number
// type bool = boolean
class VAuth extends HTMLElement {
    $;
    s;
    cssstylesheet;
    shadow;
    constructor(){
        super();
        this.s = {
            error_msg: ""
        };
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    connectedCallback() {
        setTimeout(()=>{
            this.dispatchEvent(new Event('hydrated'));
        }, 100);
        document.addEventListener('keyup', (e)=>{
            if (e.key === 'Enter') {
                this.Login();
            }
        });
        this.stateChanged();
    }
    stateChanged() {
        Lit_Render(this.template(this.s), this.shadow);
    }
    async Login() {
        const formel = this.shadow.querySelector("form[name='login']");
        const els = formel.elements;
        const identity_platform_key = localStorage.getItem('identity_platform_key');
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=` + identity_platform_key;
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
        };
        let data = {};
        if (window.location.protocol === "http:") {
            data = {
                idToken: "local_token",
                expiresIn: 3600,
                refreshToken: "local refresh",
                email: els.username.value
            };
            localStorage.setItem('id_token', data.idToken);
            localStorage.setItem('token_expires_at', (Math.floor(Date.now() / 1000) + Number(data.expiresIn)).toString()), localStorage.setItem('refresh_token', data.refreshToken);
            localStorage.setItem('user_email', data.email);
            localStorage.setItem('auth_group', 'user');
            window.location.hash = 'home';
        } else {
            data = await FetchLassie(url, opts);
            if (data.error) {
                this.s.error_msg = data.error.message;
                this.stateChanged();
            } else {
                localStorage.setItem('id_token', data.idToken);
                localStorage.setItem('token_expires_at', (Math.floor(Date.now() / 1000) + Number(data.expiresIn)).toString()), localStorage.setItem('refresh_token', data.refreshToken);
                localStorage.setItem('user_email', data.email);
                if (data.email === "accounts@risingtiger.com") localStorage.setItem('auth_group', 'admin');
                else localStorage.setItem('auth_group', 'user');
                window.location.hash = 'home';
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
    */ }
    template = (_s)=>{
        return Lit_Html`<link rel='stylesheet' href='/assets/main.css'><style>
header.viewheader {
    background: white;
    height: 57px;
    box-shadow: 0 0 15px 0px rgb(0 0 0 / 11%);

    & .left {
        width: 80%;
    }
    & .middle {
        width: 10%;
    }
    & .right {
        width: 10%;
    }
}

img.logo {
    width: 47px;
    margin-left: 15px;
    margin-right: 8px;
    position: relative;
    top: -8px;
}

img.logo + strong {
    display: inline-block;
    position: relative;
    top: -20px;
    font-size: 18px;
}

.content {
    margin: 35px auto;
    max-width: 400px;
}

h1 {
    padding-left: 13px;
    padding-bottom: 21px;
}

button {
    margin-top: 20px;
    margin-left: 12px;
}

.error {
    margin-top: 20px;
    margin-left: 12px;
    padding: 8px 10px;
    background-color: #d25050;
    border-radius: 4px;
    color: white;
}


</style>
<header class="viewheader">
    <div class="left">
        <img class="logo" src="/assets/media/logo-icon.svg" alt="pwtlogo" /><strong>Pure Water Technologies</strong>
    </div>
    <div class="middle">&nbsp;</div>
    <div class="right">&nbsp;</div>
</header>


<div class="content">

    <h1>Authenticate</h1>

    <form name="login">
        <ul class="items">
            <li>
                <h5>Username</h5>
                <span class="input"><input type="text" name="username" id="username" value=""></span>
            </li>

            <li>
                <h5>Password</h5>
                <span class="input"><input type="password" name="password" id="password" value=""></span>
            </li>
        </ul>
    </form>

    ${_s.error_msg ? Lit_Html`<div class="error">${_s.error_msg}</div>` : ''}

    <button class="btn" @click="${()=>this.Login()}">login</span>

</div>

`;
    };
}
customElements.define('v-auth', VAuth);
export { };
