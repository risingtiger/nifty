class VHome extends HTMLElement {
    $;
    s;
    shadow;
    constructor(){
        super();
        this.$ = this.querySelector;
        this.s = {
            admin_return_str: ""
        };
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    connectedCallback() {
        this.sc();
        setTimeout(()=>{
            this.dispatchEvent(new Event('hydrated'));
        }, 100);
    }
    async DataSync_Updated() {
        const x = await window.IndexedDB.GetAll([
            "transactions"
        ]);
        const el = this.shadow.querySelector("#hldr");
        el.innerHTML = x.get("transactions").find((t)=>t.id === "01zJLy97OeJTzO5XA9SV").amount;
        this.sc();
    //setTimeout(()=> {   this.dispatchEvent(new Event('hydrated'))   }, 100)
    }
    ya1() {
        DataSync.Subscribe([
            "transactions"
        ], this);
        setTimeout(()=>{
            const el = this.shadow.querySelector("ct-temp");
            el.DataSync_Updated = async ()=>{
                const y = await window.IndexedDB.GetAll([
                    "transactions",
                    "cats"
                ]);
                const n = y.get("cats").find((c)=>c.id === "013fe784-a92b-4333-bfeb-260afd3b8235");
                const ell = this.shadow.querySelector("ct-temp");
                ell.innerHTML = n.name;
            };
            DataSync.Subscribe([
                "transactions",
                "cats"
            ], el);
        }, 100);
    }
    ya2() {
        DataSync.Subscribe([
            "transactions",
            "cats"
        ], this);
    }
    ya3() {
        DataSync.Subscribe([
            "transactions",
            "cats",
            "areas"
        ], this);
    }
    sc() {
        Lit_Render(this.template(this.s), this.shadow);
    }
    async adminetc(api, method = "GET") {
        if (confirm("Are you sure you want to run admin: " + api)) {
            const returndata = await FetchLassie("/api/xen/admin/" + api, {
                method
            });
            if (returndata.return_str) {
                this.s.admin_return_str = returndata.return_str.includes("--") ? returndata.return_str.split("--") : returndata.return_str;
            }
            this.sc();
        }
    }
    template = (_s)=>{
        return Lit_Html`<link rel='stylesheet' href='/assets/main.css'><style>

header.viewheader {
    background: white;
    height: 57px;
    box-shadow: 0 0 15px 0px rgb(0 0 0 / 11%);

    /*
    & .left {
    width: 80%;
    }
    & .middle {
    width: 10%;
    }
    & .right {
    width: 10%;
    }
    */
}


.content {
    padding: 20px;
}








</style>
<header class="viewheader">
    <div class="left"></div>
    <div class="middle"><h1>Xen</h1></div>
    <div class="right">&nbsp;</div>
</header>

<div class="content">

	<ct-temp>Placeholder</ct-temp>
    <div id="admin">

		<div id="hldr">Placeholder</div>

        ${localStorage.getItem("auth_group") === 'admin' ? Lit_Html`
            <h5 @click="${()=>this.adminetc('firestore_misc_update')}">firestore_misc_update</h5>
        ` : ''}
        
        <div style="height: 200px; overflow-y:scroll;">
            ${Array.isArray(_s.admin_return_str) ? _s.admin_return_str.map((item, index) => Lit_Html`
                <p>${item}</p>
            `) : Lit_Html`
                <p>${_s.admin_return_str}</p>
            `}
        </div>

        <h5 @click="${()=>window.location.hash='finance'}">Finance</h5>

        ${localStorage.getItem("auth_group") === 'admin' ? Lit_Html`
            <br><br>
            <h5 @click="${()=>window.location.hash='addtr'}">AddTr</h5>
        ` : ''}

        <br><br>

        <h5 @click="${()=>window.location.hash='auth'}">Auth</h5>

		<a @click="${()=>this.ya1()}">ya1</a> &nbsp; &nbsp;
		<a @click="${()=>this.ya2()}">ya2</a> &nbsp; &nbsp;
		<a @click="${()=>this.ya3()}">ya3</a>
    </div>

</div>


`;
    };
}
customElements.define('v-home', VHome);
export { };
