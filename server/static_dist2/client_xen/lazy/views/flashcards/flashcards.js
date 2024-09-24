//import { bool } from '../../../../definitions.js';
class VFlashCards extends HTMLElement {
    s;
    flashcards;
    shadow;
    constructor(){
        super();
        this.s = {
            props: {}
        };
        this.flashcards = [];
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    async connectedCallback() {
        const results = await Firestore.Retrieve("machines");
        this.flashcards = results[0];
        this.sc();
        this.dispatchEvent(new Event('hydrated'));
    }
    sc(state_changes = {}) {
        this.s = Object.assign(this.s, state_changes);
        Lit_Render(this.template(this.s, this.flashcards), this.shadow);
    }
    template = (_s, _flashcards)=>{
        return Lit_Html`<link rel='stylesheet' href='/assets/main.css'><style>

v-finance {

    & #calcs {

        & table {
            border-collapse: collapse
        }

        & td, th {
            border: 0;
            padding: 3px 4px;
        }

        
        & th {
            text-align: left;
            border-bottom: 5px solid #9bdfee;
        }

        & th.monthname, & th.bucket, & th.budget {
            width: 38px;
            max-width: 38px;
        }

        & td.topcat {
            font-weight: bold;
        }

        & td.current, & th.current {
            background-color: #e1faff;
        }

        & td.bucket, & th.bucket {
            background-color: #abf1ff;
        }

        & td.budget, & th.budget {
            background-color: #caf6ff;
        }

        & td.bucket.transfer_state_1 {
            background-color: #00a3c3;
            color: white;
        }
        & td.bucket.transfer_state_2 {
            background-color: #00a3c3;
            color: white;
        }

        & tr.lastsubcat td {
            padding-bottom: 17px;
        }
    }
}






</style>

<div class="content">

    ${_flashcards.map(fc => Lit_Html`
    <li>
        <div class="thumbnail"><img src="${fc.url}"></div>

	    <div class="aux">
            <h5>${fl.term}</h5>
            <p>
                ${fc.tags.map(t => Lit_Html`<span class="flashcard_tag">${t}</span>`)}
            </p>
        </div>

        <i class="icon-arrowright2 action"></i> 
    </li>
    `)}

</div>



`;
    };
}
customElements.define('v-flashcards', VFlashCards);
export { };
