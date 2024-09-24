class VPTransactionEdit extends HTMLElement {
    s;
    m;
    shadow;
    constructor(){
        super();
        this.m = {
            prop: "",
            transaction: null
        };
        this.s = {
            prop: ""
        };
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    async connectedCallback() {
        const transaction = await Firestore.Retrieve(`transactions/${this.getAttribute("transaction")}`);
        this.m.transaction = transaction[0];
        this.sc();
        this.dispatchEvent(new Event('hydrated'));
    }
    async merchant_changed(e) {
        const el = this.shadow.querySelector("c-in[name='merchant']");
        if (!e.detail.newval) {
            alert("Merchnat cannot be empty");
            return;
        }
        await Firestore.Patch(`transactions/${this.m.transaction.id}`, {
            "merchant": e.detail.newval
        });
        el.SaveResponse(e.detail.newval);
        window.ToastShow("Merchant Updated");
        this.sc();
    }
    sc(state_changes = {}) {
        this.s = Object.assign(this.s, state_changes);
        Lit_Render(this.template(this.s, this.m), this.shadow);
    }
    template = (_s, _m)=>{
        return Lit_Html`<link rel='stylesheet' href='/assets/main.css'><style>:host {
    position: relative;
}

ul.items > li > h5 {
    color: rgb(190 56 151);
}

c-reveal#storelink,
c-reveal#increments,
c-reveal#store_assign {
    padding: 0px 0px 0 0px;

    & > h5 {
        padding: 0px 0 5px 0;
    }

    & > p {
        padding: 0 0 19px 0;
    }

    & .linkrefs {
        display: flex;
        justify-content: space-around;
        padding-bottom: 25px;

        & > div {
            & label {
                padding-bottom: 5px;
                padding-left: 7px;
            }

            & input {
                width: 115px;
            }
        }
    }

    .confirm_msg {
        color: #009e88;
        text-align: center;
        font-weight: 900;
    }

    .heightfix {
        height: 115px;
        overflow: hidden;
    }
}

c-reveal#store_assign {
    & .alreadyassigned {
        height: 50px;
        padding: 0 0 0 13px;
    }

    .justinput.search {
        width: calc(100% - 20px);
        margin: 0 11px 0 11px;

        & > input {
            background-color: white;
        }
    }

    & #storelist {
        height: 300px;

        & > .storeitem {
            margin-bottom: 0px;

            & > p:first-child {
                font-weight: bold;
                font-size: 14px;

                & > span {
                    color: #52c3b5;
                    font-size: 14px;
                }
                & > span::after {
                    content: " - ";
                }
                width: 100%;
                box-sizing: border-box;
                overflow: hidden;
                text-wrap: nowrap;
            }
            & > p:nth-child(2) {
                font-size: 14px;
                color: #a8a5a5;
            }
            padding: var(--padding-container);
            padding-left: 17px;
        }
        & > .storeitem:hover {
            background-color: #f0f0f0;
        }

        padding-top: 4px;
    }

    #attachstoredata {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 341px;
        background: #fff;
        padding: 16px 11px 20px 17px;
        box-sizing: border-box;

        & > h1 {
            font-size: 16px;
            padding-bottom: 9px;
        }

        & > p.latlon {
            padding-bottom: 10px;
        }
        & > p.ids {
            font-size: 14px;

            & > span:nth-child(1) {
                display: inline-block;
                width: 85px;
            }
            & > span:nth-child(2) {
                display: inline-block;
                width: 224px;
            }
        }

        & .attachbtns {
            display: flex;
            justify-content: space-between;
            padding-top: 10px;
        }
    }
    #attachstoredata.active {
        display: block;
    }
}

c-reveal#increments {
    & .amounts {
        & > div {
            display: flex;
            justify-content: space-between;

            & > label {
                padding-top: 7px;
                flex-grow: 2;
                width: 100px;
                display: block;
                text-align: right;
                padding-right: 12px;
            }

            & > span.input {
                padding-bottom: 8px;
                display: block;
                flex-grow: 1;
            }

            & > span.input > input {
                width: 62px;
            }
        }
    }
}

c-reveal#reconcile {
    padding: 0px 14px 14px 14px;

    & #reconcile_warning {
        text-align: center;
        padding: 14px 14px 14px 14px;
        border-radius: 5px;
        background: #fffdd8;
        border: 1px solid #e3d800;
        margin-bottom: 26px;

        & strong {
            color: #bc3b00;
        }
    }

    .amounts {
        & > div {
            position: relative;
            display: flex;
            justify-content: space-between;
            margin-bottom: 11px;
            font-size: 13px;

            & > label {
                display: block;
                width: 75px;
                font-size: 13px;
                padding-top: 8px;
            }

            & > span.val {
                display: block;
                font-size: 13px;
                padding-top: 8px;
                padding-right: 11px;
                width: 75px;
            }

            & > span.input {
                & > input {
                    width: 93px;
                    font-size: 13px;
                }
                & > input::placeholder {
                    color: #b2b2b2;
                }
            }

            & > button {
                padding: 0px 8px 0 8px;
                height: 26px;
                font-size: 13px;
                margin-top: 3px;
            }

            & > div.reconcile_confirm {
                position: absolute;
                width: 100%;
                height: 35px;
                box-sizing: border-box;
                border-radius: 4px;
                background: #5b88bf;
                padding: 9px 2px 11px 0;
                color: white;
                z-index: 1;
                font-size: 14px;
                font-weight: bold;
                text-align: center;
            }
        }
    }
}

.savingstate {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    & h4 {
        position: absolute;
        width: 100%;
        text-align: center;
        font-size: 20px;
        color: gray;
        top: 171px;
    }
}
.savingstate.active {
    display: block;
}

.checkcircle {
    position: absolute;
    top: 41px;
    left: 0;
    width: 100%;
    margin: 0 auto 10px auto;
    text-align: center;

    & .icon-checkcircle {
        font-size: 98px;
        color: purple;
    }
}

/*& .spinnerhldr {
    }
    */

.spinner {
    position: absolute;
    display: block;
    width: 64px;
    height: 64px;
    top: 67px;
    left: calc(50% - 32px);

    .container1 > div,
    & .container2 > div,
    & .container3 > div {
        width: 10px;
        height: 10px;
        background-color: #b833da;

        border-radius: 100%;
        position: absolute;
        animation: bouncedelay 1.2s infinite ease-in-out;
        /* Prevent first frame from flickering when animation starts */
        animation-fill-mode: both;
    }

    .spinner-container {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .container2 {
        transform: rotateZ(45deg);
    }

    .container3 {
        transform: rotateZ(90deg);
    }

    .circle1 {
        top: 0;
        left: 0;
    }
    .circle2 {
        top: 0;
        right: 0;
    }
    .circle3 {
        right: 0;
        bottom: 0;
    }
    .circle4 {
        left: 0;
        bottom: 0;
    }

    .container2 .circle1 {
        animation-delay: -1.1s;
    }

    .container3 .circle1 {
        animation-delay: -1s;
    }

    .container1 .circle2 {
        animation-delay: -0.9s;
    }

    .container2 .circle2 {
        animation-delay: -0.8s;
    }

    .container3 .circle2 {
        animation-delay: -0.7s;
    }

    .container1 .circle3 {
        animation-delay: -0.6s;
    }

    .container2 .circle3 {
        animation-delay: -0.5s;
    }

    .container3 .circle3 {
        animation-delay: -0.4s;
    }

    .container1 .circle4 {
        animation-delay: -0.3s;
    }

    .container2 .circle4 {
        animation-delay: -0.2s;
    }

    .container3 .circle4 {
        animation-delay: -0.1s;
    }
}

.savingstate_bg {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ffffffdb;
}
.savingstate_bg.active {
    display: block;
}

@-webkit-keyframes bouncedelay {
    40% {
        transform: scale(1);
    }
}

@-webkit-keyframes bouncedelay {
    0%,
    80%,
    100% {
        transform: scale(0);
    }
    40% {
        transform: scale(1);
    }
}
</style>

<c-form name="mainform">
	<c-in label="Date" name="date" type="text" val="${_m.transaction.ts}"></c-in>
	<c-in label="Merchant" name="merchant" type="text" val="${_m.transaction.merchant}" @save="${(e)=>this.merchant_changed(e)}"></c-in>
	<c-in label="Amount" name="amount" type="number" val="${_m.transaction.amount}"></c-in>
	<c-in label="Source" name="source" type="text" val="${_m.transaction.source.name}"></c-in>
	<c-in label="Tags" name="tags" type="text" val="${_m.transaction.tags.map(tag=>Lit_Html`<span>${tag}</span>`)}"></c-in>
	<c-in label="Note" name="note" type="text" val="${_m.transaction.notes}"></c-in>
	<c-in label="ID" name="id" type="text" val="${_m.transaction.id}"></c-in>
</c-form>

`;
    };
}
customElements.define('vp-transaction-edit', VPTransactionEdit);
export { };
