import { knit_areas, knit_cats, knit_sources } from '../../libs/finance_funcs.js';
var InputModeE;
(function(InputModeE) {
    InputModeE[InputModeE["Cat"] = 0] = "Cat";
    InputModeE[InputModeE["Tag"] = 1] = "Tag";
    InputModeE[InputModeE["Note"] = 2] = "Note";
    InputModeE[InputModeE["Amount"] = 3] = "Amount";
})(InputModeE || (InputModeE = {}));
class VAddTr extends HTMLElement {
    s;
    areas;
    cats;
    sources;
    tags;
    latest_raw_transactions;
    shadow;
    constructor(){
        super();
        this.s = {
            newcount: 0,
            rawtransactions: [],
            focusedindex: 0,
            transactionindex: 0,
            splittotal: 0,
            allow_split: true,
            keyinput_mode: 0,
            instructions: "category"
        };
        this.areas = [];
        this.cats = [];
        this.sources = [];
        this.tags = [];
        this.latest_raw_transactions = [];
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    async connectedCallback() {
        this.setAttribute("backhash", "home");
        const promises = [];
        promises.push(Firestore.Retrieve([
            "areas",
            "cats",
            "sources"
        ]));
        promises.push(FetchLassie('/api/xen/finance/get_ynab_raw_transactions', {}));
        const v = await Promise.all(promises);
        this.areas = knit_areas(v[0][0]);
        this.cats = knit_cats(this.areas, v[0][1]);
        this.sources = knit_sources(v[0][2]);
        const trs = localStorage.getItem("user_email") === 'accounts@risingtiger.com' ? v[1].raw_transactions : v[1].raw_transactions.filter((tr)=>tr.source === "17c0d30d-4e6f-496e-a8e4-91dae1de8b4a");
        this.latest_raw_transactions = trs.map((tr)=>{
            return {
                skipsave: false,
                preset_area_id: tr.preset_area_id || null,
                preset_cat_name: tr.preset_cat_name || null,
                ynab_id: tr.ynab_id,
                amount: tr.amount,
                cat_id: null,
                cat_name: null,
                tag_ids: [],
                tag_names: [],
                merchant: tr.merchant,
                notes: tr.notes,
                source_id: tr.source_id,
                tags: tr.tags,
                ts: tr.ts
            };
        });
        if (this.latest_raw_transactions.length === 0) {
            alert("no new transactions");
        } else {
            this.s.transactionindex = 0;
            this.s.newcount = this.latest_raw_transactions.length;
            this.process_next_transaction();
            if (localStorage.getItem("user_email") !== 'accounts@risingtiger.com') {
                this.cats = this.cats.filter((cat)=>cat.area.name === "fam");
            }
            const keycatcher_el = this.shadow.querySelector("#keycatcher");
            keycatcher_el.focus();
            keycatcher_el.addEventListener("keyup", this.keyup.bind(this));
        }
        this.sc();
        this.dispatchEvent(new Event('hydrated'));
    }
    disconnectedCallback() {
    //
    }
    async process_next_transaction() {
        this.s.focusedindex = 0;
        this.s.keyinput_mode = 0;
        this.s.rawtransactions = [
            this.latest_raw_transactions[this.s.transactionindex]
        ];
        this.s.splittotal = 0;
        this.s.allow_split = true;
        this.sc();
        const keycatcher_el = this.shadow.querySelector("#keycatcher");
        keycatcher_el.value = "";
        keycatcher_el.focus();
    }
    async save_focused_transaction_and_load_next() {
        const nextit = ()=>{
            if (this.s.transactionindex == this.latest_raw_transactions.length - 1) {
                alert("all transactions processed. DONE");
            } else {
                this.s.transactionindex++;
                this.process_next_transaction();
            }
        };
        const unskipped_transactions = this.s.rawtransactions.filter((tr)=>!tr.skipsave);
        if (unskipped_transactions.length === 0) {
            nextit();
            return;
        } else {
            const body = this.s.rawtransactions;
            await FetchLassie(`/api/xen/finance/save_transactions_and_delete_ynab_records`, {
                method: "POST",
                body: JSON.stringify(body)
            });
            nextit();
        }
    }
    async keyup(e) {
        const keycatcher_el = this.shadow.querySelector("#keycatcher");
        const val = keycatcher_el.value.toLowerCase();
        if (e.key === "Enter") {
            if (this.s.keyinput_mode === 1) {
                const tag_strings = val.split("#").filter((t)=>t.length > 0).map((t)=>t.trim());
                const tags = this.tags.filter((tag)=>tag_strings.includes(tag.name));
                if (tags.length === 0) {
                    alert("no tags found");
                    keycatcher_el.value = "#";
                    keycatcher_el.focus();
                    return;
                }
                this.settags(tags.map((tag)=>tag.id), tags.map((tag)=>tag.name));
            } else if (this.s.keyinput_mode === 0) {
                if (val.length < 2) {
                    alert("no category selected");
                    keycatcher_el.value = "";
                    keycatcher_el.focus();
                    this.highlight_catnames_reset_all();
                } else {
                    const catname_els = this.shadow.querySelectorAll('.subcats > h6:not(.hidden)');
                    let foundcat = null;
                    let catname = catname_els[0].textContent;
                    for (const c of this.cats){
                        const f = c.subs?.find((sub)=>sub.name === catname);
                        if (f) {
                            foundcat = f;
                            break;
                        }
                    }
                    if (foundcat) {
                        this.setcat(foundcat);
                    } else {
                        alert("no category found or too many categories found. need to match only one.");
                        keycatcher_el.value = "";
                        keycatcher_el.focus();
                        this.highlight_catnames_reset_all();
                    }
                }
            } else if (this.s.keyinput_mode === 3) {
                if (this.s.focusedindex == this.s.rawtransactions.length - 1) {
                    this.s.rawtransactions[this.s.focusedindex].amount = this.s.splittotal;
                    this.s.keyinput_mode = 2;
                    this.s.instructions = "note";
                    keycatcher_el.value = "";
                    keycatcher_el.focus();
                    this.sc();
                }
                const n = parseFloat(val);
                if (isNaN(n) || n === 0 || n > this.s.splittotal) {
                    alert("split amount exceeded transaction amount or is invalid number");
                    keycatcher_el.value = "";
                    keycatcher_el.focus();
                    return;
                }
                this.s.keyinput_mode = 2;
                this.s.instructions = "note";
                keycatcher_el.value = "";
                keycatcher_el.focus();
                this.s.rawtransactions[this.s.focusedindex].amount = n;
                this.s.splittotal -= n;
                this.sc();
            } else if (this.s.keyinput_mode === 2) {
                this.s.rawtransactions[this.s.focusedindex].notes = val;
                this.save_transaction_and_move_to_next();
            }
        } else if (this.s.keyinput_mode === 0) {
            if (e.key === "Backspace") {
                this.highlight_catnames_reset_all();
                keycatcher_el.value = "";
                keycatcher_el.focus();
            } else if (e.key === "@") {
                if (!this.s.allow_split) {
                    alert("try to split fist, before choosing category");
                    keycatcher_el.value = "";
                    keycatcher_el.focus();
                    this.highlight_catnames_reset_all();
                    return;
                }
                const xstr = JSON.stringify(this.s.rawtransactions[this.s.focusedindex]);
                this.s.rawtransactions.push(JSON.parse(xstr));
                keycatcher_el.value = "";
                for(let i = 1; i < this.s.rawtransactions.length; i++){
                    this.s.rawtransactions[i].amount = 0;
                }
                this.s.splittotal = this.s.rawtransactions[0].amount;
                this.sc();
            } else if (e.key === ".") {
                this.skip_transaction();
            } else {
                if (val.length > 1) {
                    this.highlight_catnames(val);
                }
            }
        } else if (this.s.keyinput_mode === 3) {
        // nothing
        } else if (this.s.keyinput_mode === 2) {
            if (e.key === "#") {
                const results = await Firestore.Retrieve("tags");
                this.tags = results[0];
                this.tags.sort((a, b)=>b.ts - a.ts);
                const keycatcher_el = this.shadow.querySelector("#keycatcher");
                this.s.keyinput_mode = 1;
                this.s.instructions = "tags";
                keycatcher_el.value = "#";
                this.sc();
                keycatcher_el.focus();
            }
        }
    }
    save_transaction_and_move_to_next() {
        const keycatcher_el = this.shadow.querySelector("#keycatcher");
        if (this.s.focusedindex === this.s.rawtransactions.length - 1) {
            keycatcher_el.value = "";
            this.s.instructions = "category";
            keycatcher_el.focus();
            this.sc();
            this.save_focused_transaction_and_load_next();
        } else {
            this.s.focusedindex++;
            this.s.keyinput_mode = 0;
            this.s.instructions = "category";
            keycatcher_el.value = "";
            keycatcher_el.focus();
            this.sc();
        }
    }
    skip_transaction() {
        this.s.rawtransactions[this.s.focusedindex].skipsave = true;
        this.save_transaction_and_move_to_next();
    }
    setcat(cat) {
        const keycatcher_el = this.shadow.querySelector("#keycatcher");
        this.s.allow_split = false // only allow split before having chosen category. Must be first action after new raw transaction pops up
        ;
        this.s.rawtransactions[this.s.focusedindex].cat_id = cat.id;
        for (const cat of this.cats){
            const f = cat.subs?.find((sub)=>sub.id === this.s.rawtransactions[this.s.focusedindex].cat_id);
            if (f) {
                this.s.rawtransactions[this.s.focusedindex].cat_name = f.name;
                break;
            }
        }
        if (this.s.rawtransactions.length > 1) {
            this.s.keyinput_mode = 3;
            this.s.instructions = "amount";
            if (this.s.focusedindex == this.s.rawtransactions.length - 1) {
                keycatcher_el.value = this.s.splittotal.toFixed(2);
            } else {
                keycatcher_el.value = "";
            }
        } else {
            this.s.keyinput_mode = 2;
            this.s.instructions = "note";
            keycatcher_el.value = this.s.rawtransactions[this.s.focusedindex].notes || "";
        }
        this.highlight_catnames_reset_all();
        this.sc();
        keycatcher_el.focus();
    }
    settags(tag_ids, tag_names) {
        const keycatcher_el = this.shadow.querySelector("#keycatcher");
        this.s.rawtransactions[this.s.focusedindex].tag_ids = tag_ids;
        this.s.rawtransactions[this.s.focusedindex].tag_names = tag_names;
        this.s.keyinput_mode = 2;
        keycatcher_el.value = "";
        this.s.instructions = "note";
        this.sc();
        keycatcher_el.focus();
    }
    setcat_from_click(e) {
        const catid = e.target.dataset.id;
        for (const c of this.cats){
            const f = c.subs?.find((sub)=>sub.id === catid);
            if (f) {
                this.setcat(f);
                break;
            }
        }
    }
    settag_from_click(e) {
        const tagid = e.target.dataset.id;
        const tag = this.tags.find((tag)=>tag.id === tagid);
        this.settags([
            tag.id
        ], [
            tag.name
        ]);
    }
    highlight_catnames(searchstr) {
        const subcatnames = this.shadow.querySelectorAll('.subcats > h6');
        subcatnames.forEach((el)=>{
            const t = el.textContent?.toLowerCase();
            const startat = t.indexOf(searchstr);
            if (startat === -1) {
                el.innerHTML = t;
                el.classList.add("hidden");
            } else {
                const endat = startat + searchstr.length;
                const before = t.slice(0, startat);
                const after = t.slice(endat);
                const newhtml = `${before}<span class="cathighlight">${searchstr}</span>${after}`;
                el.innerHTML = newhtml;
            }
        });
        const catparentels = this.shadow.querySelectorAll('.catparent');
        catparentels.forEach((el)=>{
            const subcatnames = el.querySelectorAll('h6');
            // test if every subcatname is hidden
            const allhidden = Array.from(subcatnames).every((el)=>el.classList.contains("hidden"));
            if (allhidden) {
                el.classList.add("hidden");
            }
        });
    }
    highlight_catnames_reset_all() {
        const subcatnames = this.shadow.querySelectorAll('.subcats > h6');
        subcatnames.forEach((el)=>{
            el.innerHTML = el.textContent;
            el.classList.remove("hidden");
        });
        const catparentels = this.shadow.querySelectorAll('.catparent');
        catparentels.forEach((el)=>{
            el.classList.remove("hidden");
        });
    }
    reset_transaction() {
        location.reload();
    }
    sc() {
        Lit_Render(this.template(this.s, this.areas, this.cats, this.sources, this.tags), this.shadow);
    }
    template = (_s, _areas, _cats, _sources, _tags)=>{
        return Lit_Html`<link rel='stylesheet' href='/assets/main.css'><style>#keycatcher_w {
    position: relative;

    & #keycatcher_instructions {
        position: absolute;
        top: 1px;
        right: 0;
        padding: 3px 10px 0 0px;
        height: 24px;
        width: 100px;
        box-sizing: border-box;
        background: #efefef;
        text-align: right;
    }

    & > input#keycatcher {
        width: 100%;
        box-sizing: border-box;
        font-size: 14px;
        color: #6b6b6b;
        padding: 5px 2px 5px 7px;
        border-color: #d9d9d9;
        border-width: 0;
        border-style: solid;
        border-radius: 0;
        margin-bottom: 1px;
    }
}

#rawtransaction {
    & > .a_transaction {
        padding: 7px 10px;

        & .primary {
            display: flex;
            flex-wrap: wrap;
            padding-bottom: 7px;

            & .ofnumber {
                padding-right: 8px;
            }

            & .date {
                padding-right: 8px;
            }
            & .longdesc {
                font-weight: 600;
                /* white-space: nowrap; */
                /* overflow: hidden; */
                /* text-overflow: ellipsis; */
            }
            & .amount {
                width: 18%;
                text-align: right;
            }
            & .amount:before {
                content: "$";
            }
        }

        & .secondary {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;

            & .cat {
                width: 24%;
                text-align: left;
                /* border: 1px solid #ffffffad; */
                /* padding: 1px 7px 3px 7px; */
                /* border-radius: 6px; */
            }
            & .source {
                width: 18%;
                text-align: center;
                /* border: 1px solid #ffffffb3; */
                /* padding: 1px 7px 3px 7px; */
                /* border-radius: 6px; */
            }
        }

        & .tertiary {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;

            & .note {
                width: 100%;
            }
        }
        margin-bottom: 10px;
    }
    & > .a_transaction.active {
        background-color: #00accf;

        & .anitem {
            color: white;
        }
    }
}

#cats {
    padding: 0 0 0 10px;

    & .catparent {
        display: block;
        padding-bottom: 10px;

        & h4 {
            font-size: 14px;
            padding-bottom: 4px;
            padding-left: 1px;
            font-weight: 600;
        }

        & .subcats {
            flex-wrap: wrap;
            display: flex;

            & h6 {
                height: 20px;
                padding-top: 3px;
                padding-left: 6px;
                padding-right: 6px;
                padding-bottom: 2px;
                font-weight: 400;
                color: white;
                width: 75px;
                overflow: hidden;
                font-size: 14px;
                background: #00c9ba;
                margin-right: 5px;
                margin-bottom: 5px;
                border-radius: 6px;

                & > .cathighlight {
                    display: inline-block;
                    height: 100%;
                    background-color: #05accf;
                    color: white;
                    font-weight: 500;
                }
            }
            h6.hidden {
                display: none;
            }
        }
    }
    & .catparent.hidden {
        display: none;
    }
}

#tags {
    display: none;
    position: absolute;
    top: 132px;
    left: 0;
    width: 100%;
    height: 70px;
    background: white;
    padding: var(--padding-container);

    & h6 {
        height: 20px;
        padding-top: 3px;
        padding-left: 6px;
        padding-right: 6px;
        padding-bottom: 2px;
        font-weight: 400;
        color: white;
        width: 75px;
        overflow: hidden;
        font-size: 14px;
        background: #00c9ba;
        margin-right: 5px;
        margin-bottom: 5px;
        border-radius: 6px;
        display: inline-block;
    }
}
#tags.active {
    display: block;
}

.keyinput_indicator {
    display: none;
    position: absolute;
    top: 10px;
    right: 10px;
    height: 30px;
    box-sizing: border-box;
    padding: 6px 8px 0px 12px;
    border-radius: 6px;
    background-color: rgb(237, 237, 237);

    & > span {
        font-size: 13px;
    }
}
.keyinput_indicator.active {
    display: block;
}

input#merchantedit {
    padding-bottom: 30px;
}

footer#pagefooter {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    background: #ededed;
    color: #4e4e4e;
    text-align: center;
    padding: var(--padding-container);
    font-size: 14px;
    font-weight: 400;
    border-top: 1px solid #cccccc;
}
</style>
<!--
<header class="viewheader">
    <a class="left" @click="${()=>window.location.hash='finance'}"><span>‸</span><span>finance</span></a>
    <div class="middle">
        <h1>Categorize New ${_s.transactionindex+1} of ${_s.newcount}</h1>
    </div>
    <div class="right">
        <a @click="${()=>{ this.reset_transaction(); }}" style="font-size: 17px;">reset</a>
    </div>
</header>
-->

<div class="content">

    <div id="keycatcher_w">
        <input id="keycatcher" type="email" spellcheck="false" inputmode="email"></input>
        <div id="keycatcher_instructions">
            <span>${_s.instructions}</span>
        </div>
    </div>

    <div id="rawtransaction">
        ${_s.rawtransactions.map((rawtransaction,i)=>Lit_Html`
            <div class="a_transaction ${i === _s.focusedindex ? 'active' : ''}">
                <div class="primary">
                    <div class="anitem ofnumber">${_s.transactionindex+1} of ${_s.newcount}</div>
                    <div class="anitem date">${(new Date(rawtransaction.ts*1000)).toLocaleDateString().slice(0,4)}</div>
                    <div class="anitem longdesc">${rawtransaction.merchant}</div>
                    <div class="anitem amount">${rawtransaction.amount.toFixed(2)}</div>
                </div>

                <div class="secondary">
                <div class="anitem cat">${ rawtransaction.cat_name || '...'} &nbsp; </div>
                    <div class="anitem source">${(_sources.find(s=> s.id === rawtransaction.source_id)).name}</div>
                </div>

                <div class="tertiary"> 
                    <div class="anitem note">${rawtransaction.tag_names.map(tn=> '#' + tn + ' ')} ${rawtransaction.notes} ${ rawtransaction.preset_area_id ? _areas.find(a=>a.id === rawtransaction.preset_area_id).name : ''}::${ rawtransaction.preset_cat_name || ''}</div>
                </div>
            </div>
        `)}
    </div>

    <div id="cats">
        ${_cats.map(cat=>Lit_Html`
            <div class="catparent">
                <h4>${cat.name}</h4>
                <div class="subcats">
                    ${cat.subs.map(subcat=>Lit_Html`
                        <h6 @click="${(e)=>this.setcat_from_click(e)}" data-id="${subcat.id}">${subcat.name}</h6>
                    `)}
                </div>
            </div>
        `)}
    </div>

	<div id="tags" class="${_s.keyinput_mode === 1 ? 'active' : ''}">
        ${_tags.map(tag=>Lit_Html`
            <h6 @click="${(e)=>this.settag_from_click(e)}" data-id="${tag.id}">${tag.name}</h6>
        `)}
    </div>

    <!--
    <div class="keyinput_indicator active">
        ${_s.keyinput_mode == 0 ? Lit_Html`
            <span>type a category</span>
        ` : ''}
        ${_s.keyinput_mode == 1 ? Lit_Html`
            <span>type a note</span>
        ` : ''}
        ${_s.keyinput_mode == 2 ? Lit_Html`
            <span>split amount up to ${_s.splittotal.toFixed(2)}</span>
        ` : ''}
    </div>
    -->

    <footer id="pagefooter">
        <a class="syncgetter" @click="${()=> window.location.reload()}">sync latest</a>
    </footer>

</div>

`;
    };
}
customElements.define('v-addtr', VAddTr);
