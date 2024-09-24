const dummyArea = {
    id: "1",
    bucket: 0,
    name: "",
    longname: "",
    ynab_savings: 0,
    ts: 0
};
import { knit_all, get_months, filter_transactions, sort_transactions, current_month_of_filtered_transactions, catcalcs, totals, monthsnapshot } from '../../libs/finance_funcs.js';
import './parts/edit_transaction/edit_transaction.js';
var KeyE;
(function(KeyE) {
    KeyE[KeyE["NONE"] = 0] = "NONE";
})(KeyE || (KeyE = {}));
class VFinance extends HTMLElement {
    m;
    s;
    shadow;
    constructor(){
        super();
        this.s = {
            filter: {
                area: null,
                parentcat: null,
                cat: null,
                source: null,
                tags: null,
                daterange: null,
                merchant: null,
                note: null,
                amountrange: null,
                cattags: []
            },
            months: [],
            transactiondetails: {
                show_ui: 0,
                t: null
            },
            catsview: {
                show_ui: 0,
                cats_with_deleteflag: []
            },
            paymentsview: {
                show_ui: 0
            },
            tagsview: {
                show_ui: 0,
                tagtotals: []
            },
            editview: {
                show_ui: 0,
                transaction_id: ''
            },
            current_monthsnapshot: {
                area: dummyArea,
                month: "",
                bucket: 0,
                budget: 0,
                savings: 0
            },
            months_display_str: [],
            touch: {
                isactive: false,
                beginx: 0,
                beginy: 0,
                origin_action: 'month'
            },
            key: {
                listen_for: 0
            },
            prefs: {
                avgormed: 1
            }
        };
        this.m = {
            ynab_accounts: [],
            areas: [],
            cats: [],
            sources: [],
            tags: [],
            transactions: [],
            previous_static_monthsnapshots: [],
            filtered_transactions: [],
            current_month_transactions: [],
            catcalcs: [],
            totals: {
                sums: [],
                budget: 0,
                med: 0,
                avg: 0
            },
            payments: []
        };
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    async connectedCallback() {
        this.setAttribute("backhash", "home");
        DataSync.Subscribe([
            "areas",
            "cats",
            "sources",
            "tags",
            "payments",
            "transactions",
            "monthsnapshots"
        ], this);
        FetchLassie('/api/xen/finance/grab_em').then((data)=>{
            this.m.ynab_accounts = data.ynab_accounts;
        });
    /*
		const eltoattach = this.shadow.querySelector('.touchroot') as HTMLElement

		eltoattach.addEventListener("touchstart", this.handle_touch_start.bind(this));
		eltoattach.addEventListener("touchend", this.handle_touch_end.bind(this));
		eltoattach.addEventListener("touchcancel", this.handle_touch_cancel.bind(this));
		eltoattach.addEventListener("touchmove", this.handle_touch_move.bind(this));

		document.addEventListener('keydown', this.handle_keydown.bind(this))
		*/ }
    async DataSync_Updated() {
        console.time("getall");
        const idata = await window.IndexedDB.GetAll([
            "areas",
            "cats",
            "sources",
            "tags",
            "payments",
            "transactions",
            "monthsnapshots"
        ]);
        console.timeEnd("getall");
        checkit.bind(this)();
        function checkit() {
            if (this.m.ynab_accounts.length) {
                this.runit(idata);
                this.dispatchEvent(new Event('hydrated'));
            } else {
                setTimeout(checkit.bind(this), 10);
            }
        }
    }
    disconnectedCallback() {
        const eltoattach = this.shadow.querySelector('.touchroot');
        eltoattach.removeEventListener("touchstart", this.handle_touch_start.bind(this));
        eltoattach.removeEventListener("touchend", this.handle_touch_end.bind(this));
        eltoattach.removeEventListener("touchcancel", this.handle_touch_cancel.bind(this));
        eltoattach.removeEventListener("touchmove", this.handle_touch_move.bind(this));
        document.removeEventListener('keydown', this.handle_keydown.bind(this));
    }
    runit(data) {
        return new Promise(async (res, _rej)=>{
            data.get("areas").forEach((m)=>{
                const ynab_account = this.m.ynab_accounts.find((n)=>n.id === m.ynab_savings_id);
                m.ynab_savings = ynab_account.balance / 1000;
            });
            let k = knit_all(data.get("areas"), data.get("cats"), data.get("sources"), data.get("tags"), data.get("payments"), data.get("transactions"), data.get("monthsnapshots"));
            this.m.areas = k.areas;
            this.m.cats = k.cats;
            this.m.sources = k.sources;
            this.m.tags = k.tags;
            this.m.payments = k.payments;
            this.m.transactions = k.transactions;
            this.m.previous_static_monthsnapshots = k.previous_static_monthsnapshots;
            this.s.filter.area = this.m.areas.find((area)=>area.name === 'fam');
            this.set_default_date();
            this.set_default_cattags();
            this.set_default_except_area_and_date_and_cattags();
            this.parse_new_state();
            this.sc();
            res(1);
        });
    }
    reset() {
        this.set_default_cattags();
        this.set_default_date();
        this.set_default_except_area_and_date_and_cattags();
        this.parse_new_state();
        this.sc();
    }
    parse_new_state() {
        this.s.filter.daterange = [
            this.s.months[0],
            this.s.months[this.s.months.length - 1]
        ];
        this.m.filtered_transactions = filter_transactions(this.m.transactions, this.s.filter);
        this.m.current_month_transactions = current_month_of_filtered_transactions(this.m.filtered_transactions, this.s.months[this.s.months.length - 1]);
        this.m.catcalcs = catcalcs(this.m.filtered_transactions, this.s.filter.area, this.s.filter.cattags, this.m.cats, this.s.months);
        this.m.totals = totals(this.m.catcalcs, this.s.filter);
        this.s.current_monthsnapshot = monthsnapshot(this.s.filter.daterange[1], this.s.filter.area, this.m.cats, this.m.transactions, this.m.previous_static_monthsnapshots);
        this.m.current_month_transactions = sort_transactions(this.m.current_month_transactions, "ts", "desc");
    }
    set_default_cattags() {
        this.s.filter.cattags = [
            1,
            2,
            3,
            4
        ];
    }
    set_default_date() {
        const thismonth = new Date();
        thismonth.setUTCDate(1);
        thismonth.setUTCHours(0, 0, 0, 0);
        this.set_active_month(thismonth);
    }
    set_default_except_area_and_date_and_cattags() {
        this.s.filter.parentcat = null;
        this.s.filter.cat = null;
        this.s.filter.source = null;
        this.s.filter.tags = null;
        this.s.filter.merchant = null;
        this.s.filter.note = null;
        this.s.filter.amountrange = null;
    }
    set_area(areaname) {
        if (localStorage.getItem("auth_group") === 'admin') {
            this.s.filter.area = this.m.areas.find((area)=>area.name === areaname);
            this.set_default_except_area_and_date_and_cattags();
            this.parse_new_state();
            this.sc();
        } else {
            console.log("not allowed");
        }
    }
    set_active_month(date) {
        this.s.months = get_months(date, 3);
        this.s.months_display_str = this.s.months.map((m)=>{
            let d = new Date(m);
            d.setUTCDate(d.getUTCDate() + 2);
            return d.toLocaleString('default', {
                month: 'short'
            });
        });
    }
    filter_by_source(sourcename) {
        this.s.filter.source = this.m.sources.find((source)=>source.name === sourcename);
        this.parse_new_state();
        this.sc();
    }
    filter_by_cattag(tags) {
        this.s.filter.cattags = tags;
        this.parse_new_state();
        this.sc();
    }
    filter_by_tag(tag) {
        this.s.filter.tags = [
            tag
        ];
        this.parse_new_state();
        this.sc();
    }
    sort_transactions_by(sort_by, sort_direction) {
        this.m.current_month_transactions = sort_transactions(this.m.current_month_transactions, sort_by, sort_direction);
        this.sc();
    }
    transactionrow_clicked(e) {
        const el = e.currentTarget;
        this.s.editview.transaction_id = el.dataset.id;
        this.s.editview.show_ui = 1;
        this.sc();
    }
    calcmonth_clicked(e) {
        const el = e.currentTarget;
        const month_i = Number(el.dataset.month_i);
        if (month_i === 2) {
            return;
        }
        const offset = this.s.months.length - 1 - month_i;
        const clonedate = this.s.months[this.s.months.length - 1];
        clonedate.setUTCMonth(clonedate.getUTCMonth() - offset);
        this.set_active_month(clonedate);
        this.parse_new_state();
        this.sc();
    }
    calccat_clicked(e) {
        const el = e.currentTarget;
        const i = Number(el.dataset.i);
        const ii = Number(el.dataset.ii || -1);
        let parentcat = null;
        let cat = null;
        if (ii !== -1) {
            parentcat = this.m.catcalcs[i].cat;
            cat = this.m.catcalcs[i].subs[ii].cat;
            if (this.s.filter.parentcat === parentcat && this.s.filter.cat === cat) {
                parentcat = null;
                cat = null;
            }
        } else {
            cat = null;
            parentcat = this.m.catcalcs[i].cat;
            if (this.s.filter.parentcat === parentcat) {
                parentcat = null;
                cat = null;
            }
        }
        this.s.filter.parentcat = parentcat;
        this.s.filter.cat = cat;
        this.parse_new_state();
        this.sc();
    }
    avgormed_clicked(_e) {
        this.s.prefs.avgormed = this.s.prefs.avgormed === 1 ? 2 : 1;
        this.sc();
    }
    transaction_tag_clicked(e) {
        const el = e.currentTarget;
        const tag = this.m.tags.find((t)=>t.id === el.dataset.id);
        this.filter_by_tag(tag);
        e.stopPropagation();
    }
    tagsview_tag_clicked(e) {
        const el = e.currentTarget;
        const tag = this.m.tags.find((t)=>t.id === el.dataset.id);
        this.s.tagsview.show_ui = 2;
        this.filter_by_tag(tag);
    }
    async ynab_sync_categories() {
        const r = await FetchLassie('/api/xen/finance/ynab_sync_categories');
        this.s.catsview.cats_with_deleteflag = r.cats_with_deleteflag;
        this.sc();
    }
    async toggle_show_tags() {
        if (this.s.tagsview.show_ui === 1) {
            this.s.tagsview.show_ui = 2;
            this.sc();
            return;
        }
        const filtered_tags = this.m.tags.filter((tag)=>tag.area === this.s.filter.area);
        this.s.tagsview.tagtotals = filtered_tags.map((tag)=>{
            const t = this.m.transactions.filter((tr)=>tr.tags.find((t)=>t.id === tag.id));
            const total = t.reduce((acc, tr)=>acc + tr.amount, 0);
            return {
                id: tag.id,
                name: tag.name,
                sort: total,
                total
            };
        });
        this.s.tagsview.tagtotals.sort((a, b)=>b.sort - a.sort);
        this.s.tagsview.show_ui = 1;
        this.sc();
    }
    async handle_touch_start(e) {
        console.log("start");
        const target = e.touches[0].target;
        console.log(target);
        if (target.classList.contains('touch_month')) {
            this.s.touch.isactive = true;
            this.s.touch.beginx = e.touches[0].clientX;
            this.s.touch.beginy = e.touches[0].clientY;
            this.s.touch.origin_action = 'month';
        } else if (target.classList.contains('touch_catquad')) {
            this.s.touch.isactive = true;
            this.s.touch.beginx = e.touches[0].clientX;
            this.s.touch.beginy = e.touches[0].clientY;
            this.s.touch.origin_action = 'catquad';
        } else if (target.classList.contains('touch_area')) {
            this.s.touch.isactive = true;
            this.s.touch.beginx = e.touches[0].clientX;
            this.s.touch.beginy = e.touches[0].clientY;
            this.s.touch.origin_action = 'area';
        } else if (target.closest('.touch_switch_calcs_transactions')) {
            this.s.touch.isactive = true;
            this.s.touch.beginx = e.touches[0].clientX;
            this.s.touch.beginy = e.touches[0].clientY;
            this.s.touch.origin_action = 'switch_calcs_transactions_view';
        } else {
            this.s.touch.isactive = false;
        }
    }
    async handle_touch_end(e) {
        if (this.s.touch.isactive) {
            this.s.touch.isactive = false;
            const xdelta = e.changedTouches[0].clientX - this.s.touch.beginx;
            const ydelta = e.changedTouches[0].clientY - this.s.touch.beginy;
            if (Math.abs(xdelta) > 50 && Math.abs(xdelta) > Math.abs(ydelta)) {
                let is_direction_right = xdelta > 0 ? true : false;
                if (this.s.touch.origin_action === 'month') {
                    const clonedate = this.s.months[this.s.months.length - 1];
                    clonedate.setUTCMonth(clonedate.getUTCMonth() + (is_direction_right ? -1 : 1));
                    this.set_active_month(clonedate);
                    this.parse_new_state();
                    this.sc();
                } else if (this.s.touch.origin_action === 'catquad') {
                    const cat_a_els = Array.from(this.shadow.querySelectorAll('th.cat > a'));
                    const cat_a_active_index = cat_a_els.findIndex((el)=>el.classList.contains('active'));
                    if (is_direction_right && cat_a_active_index > 0 && cat_a_active_index < cat_a_els.length) {
                        const ary = cat_a_els[cat_a_active_index - 1].dataset.cattags?.split(',').map(Number);
                        this.s.filter.cattags = ary;
                    } else if (!is_direction_right && cat_a_active_index < cat_a_els.length - 1) {
                        const ary = cat_a_els[cat_a_active_index + 1].dataset.cattags?.split(',').map(Number);
                        this.s.filter.cattags = ary;
                    }
                    this.parse_new_state();
                    this.sc();
                } else if (this.s.touch.origin_action === 'area') {
                    if (localStorage.getItem("auth_group") === 'admin') {
                        if (this.s.filter.area?.name === 'fam' && !is_direction_right) this.set_area('pers');
                        else if (this.s.filter.area?.name === 'pers' && !is_direction_right) this.set_area('rtm');
                        else if (this.s.filter.area?.name === 'pers' && is_direction_right) this.set_area('fam');
                        else if (this.s.filter.area?.name === 'rtm' && is_direction_right) this.set_area('pers');
                    }
                } else if (this.s.touch.origin_action === 'switch_calcs_transactions_view') {
                    const elcalcs = this.shadow.querySelector('#calcs');
                    const eltransactions = this.shadow.querySelector('#transactions');
                    if (!is_direction_right) {
                        elcalcs.style.display = 'none';
                        eltransactions.style.display = 'block';
                        eltransactions.style.width = '100%';
                    } else {
                        elcalcs.style.display = 'block';
                        elcalcs.style.width = '100%';
                        eltransactions.style.display = 'none';
                    }
                }
            }
        }
    }
    async handle_touch_cancel(e) {
        console.log("cancel");
        console.log("target, x, y", e.changedTouches[0].target, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }
    async handle_touch_move(e) {}
    async handle_keydown(e) {
        if (this.s.key.listen_for === 0) {
            if (e.key === 'h') {
                const clonedate = this.s.months[this.s.months.length - 1];
                clonedate.setUTCMonth(clonedate.getUTCMonth() - 1);
                this.set_active_month(clonedate);
                this.parse_new_state();
                this.sc();
            } else if (e.key === 'l') {
                const clonedate = this.s.months[this.s.months.length - 1];
                clonedate.setUTCMonth(clonedate.getUTCMonth() + 1);
                this.set_active_month(clonedate);
                this.parse_new_state();
                this.sc();
            } else if (e.key === 'j') {
            // go down a row
            } else if (e.key === 'k') {
            // go up a row
            } else if (e.key === 'r') {
                this.reset();
            } else if (e.key === 's') {
                document.location.reload();
            } else if (e.key === 't') {
                this.toggle_show_tags();
            } else if (e.key === 'c') {
                this.s.catsview.show_ui = this.s.catsview.show_ui === 1 ? 2 : 1;
                this.sc();
            } else if (e.key === 'p') {
                this.s.paymentsview.show_ui = this.s.paymentsview.show_ui === 1 ? 2 : 1;
                this.sc();
            }
            if (e.key === '6') {
                this.set_area('fam');
            }
            if (e.key === '7') {
                this.set_area('pers');
            }
            if (e.key === '8') {
                this.set_area('rtm');
            }
            if (e.key === '1') {
                this.filter_by_cattag([
                    1
                ]);
            }
            if (e.key === '2') {
                this.filter_by_cattag([
                    2
                ]);
            }
            if (e.key === '3') {
                this.filter_by_cattag([
                    3
                ]);
            }
            if (e.key === '4') {
                this.filter_by_cattag([
                    4
                ]);
            }
            if (e.key === '`') {
                this.filter_by_cattag([
                    1,
                    2,
                    3
                ]);
            }
            if (e.key === '5') {
                this.filter_by_cattag([
                    1,
                    2,
                    3,
                    4
                ]);
            }
        }
    /*
    else if ( this.s.key.listen_for === KeyE.NONE && e.key === 'a') {
        this.s.key.listen_for = KeyE.LISTEN_FOR_AREA
    } 

    else if ( this.s.key.listen_for === KeyE.NONE && e.key === 'q') {
        this.s.key.listen_for = KeyE.LISTEN_FOR_QUADRANT
    } 
    */ /*
    else if ( this.s.key.listen_for === KeyE.SOMEPRIMARYKEY_COMBO_TO_DRIVE_ACTION) {

    }
        */ }
    sc(state_changes = {}) {
        this.s = Object.assign(this.s, state_changes);
        Lit_Render(this.template(this.s, this.m), this.shadow);
    }
    payments_r(p) {
        return Lit_Html`
        <div class="payment ${p.breakdown.length ? 'hasbreakdown' : ''}" @click="${(e)=>{
            let el = e.currentTarget.querySelector('.notes');
            el.style.display = el.style.display === 'block' ? 'none' : 'block';
        }}">
            <h4>${p.payee} ${p.notes ? '..' : ''}</h4>
            <p>
                ${p.is_auto ? Lit_Html`<strong>A</strong>&nbsp;` : ''}
                ${p.is_auto && p.payment_source && p.payment_source.name === 'checkpers' ? Lit_Html`<strong class="extra">B</strong>&nbsp;` : ''}
                ${p.day}&nbsp;
                ${p.amount ? "$" + p.amount : ''}
            </p>
            <p class="notes">${p.notes}</p>
            ${p.breakdown.length ? Lit_Html`
                <div class="breakdown">
                   ${p.breakdown.map((b)=>Lit_Html`
                        <b>${b}</b>
                   `)}
                </div>
            ` : ''}
        </div>
    `;
    }
    template = (_s, _m)=>{
        return Lit_Html`<link rel='stylesheet' href='/assets/main.css'><style>



div.content {
    width: 100%;
    height: 100%;
}

#calc_transactions_wrapper {
    display: flex;
    justify-content: space-between;
    height: 100%;
    width: 100%;
}

#calcs, #transactions {

    & table {
        border-collapse: collapse;
        position: relative;
        width: 100%;
    }

    & td {
        border: 0;
        padding: 3px 4px;
    }

    & thead th {
        background-color: white;
        text-align: left;
        padding-bottom: 4px;
        padding-top: 3px;
        border: 0;
        box-shadow: inset 0 -5px 0px 0px rgb(134 220 239);
    }

    & tfoot th {
        background-color: white;
        text-align: left;
        padding-top: 9px;
        padding-bottom: 7px;
        box-shadow: inset 0 5px 0px 0px rgb(134 220 239);
    }
}


#calcs {
    width: 43%;

    & #tablewrap {
        overflow-y: scroll;
        height: 86%;
    }

    & table thead, & table tfoot {
        z-index: 1;
        position: sticky;
    }
    & table thead {
        top: 0;
    }
    & table tfoot {
        bottom: 0;
    }

    & p.tempe {
        position: absolute;
        top: 100px;
        left: 200px;
        margin: 0;
        padding: 30px;
        background-color: #f0f0f0;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    }


    & th.monthname {
        width: 42px;
        max-width: 42px;
    }

    & th.avgmed, & th.budget {
        width: 47px;
        max-width: 47px;
    }

    & th.cat, & td.cat {
        padding-left: 10px;
    }

    & th.cat a.active {
    background: #86dcef;
    }

    & th.current, & td.current  {
        background-color: #e5fff4;
    }

    & th.avgmed, & td.avgmed {
        background-color: #abf1ff;
    }

    & th.budget, & td.budget {
        background-color: #caf6ff;
    }

    & tr.topcatrow td {
        font-weight: bold;
    }

    & tr.subcatrow td {
        font-weight: normal;
    }


    & td.avgmed {
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
        transition-duration: 0.7s;
        transition-property: background-color, color;
    }

    & td.avgmed.transfer_state_1 {
        background-color: #00a3c3;
        color: white;
    }
    & td.avgmed.transfer_state_2 {
        background-color: #00a3c3;
        color: white;
    }

    & tr.lastsubcat td {
        padding-bottom: 17px;
    }
}


#transactions {
    position: relative;
    width: 57%;

    & #tablewrap {
        overflow-y: scroll;
        height: 86%;
    }

    & table {
        border-collapse: collapse;
        width: 100%;
    }
    
    & td.notes {
        overflow-x: scroll;
        text-wrap: nowrap;

        & .tag {
        font-weight: bold;
        }
    }
    & td.merchant {
        overflow-x: scroll;
        text-wrap: nowrap;
    }

    & td.amount {
        min-width: 58px;
    }
}


footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 87px;

    & #snapshot {
        background: #ececec;
        width: 100%;
        height: 100%;
        padding: var(--padding-container);

        & .snapshotrow {
            display: flex;
            justify-content: space-evenly;
            margin-bottom: 10px;

            &
            p {
                margin: 0;
            padding: 0;
            }
        }
    }
}


#transactiondetails {
    padding: 0;

    &
    h4 {
        margin: 0;
        padding: 10px 0 0 12px;
        font-size: 17px;
    }

    &
    ul.items {
        padding: 0;

        &
    li {
            padding: 0;
    margin: 0;
        }
    }
}





#paymentsview {
    padding: var(--padding-container);

    & > section {
        display: flex;
        flex-wrap: wrap;
    }

    & > hr {
        border: 1px solid #ececec;
        margin-bottom: 18px;
    }
    
    & > section.payments {

        & .payment {
            position: relative;
            margin-right: 10px;
            padding: 0;
            margin-bottom: 11px;
            border-radius: 4px;
            width: 22%;

            & .notes {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            background: white;
            }

            &
            strong {
                color: #18c3c5;
            }
            &
            strong.extra {
                color: #a61b78;
            }

            & .breakdown {
                &
                b {
                    font-weight: normal;
                    display: inline-block;
                    padding: 12px 0 0px 0;
                }
            ;
                column-count: 5;
            }
        }
        & .payment.hasbreakdown {
            width: 100%;
        }
        
    }

    & h3 {
        width: 100%;
        font-size: 16px;
        margin-bottom: 5px;
    }
    
    & td {
        overflow-x: hidden;
    }

    & td > span {
        display: block;
        width: 188px;
        overflow-x: scroll;
        text-wrap: nowrap;
    }
}


#catsview {
    position: relative;
    padding: var(--padding-container);
    box-sizing: border-box;
    height: 90%;

    &
    h3 {
        margin: 0 0 var(--padding-section-vert) 0;
    padding: 3px 0 5px 0;
    font-size: 16px;
    border-bottom: 1px solid #e2e2e2;
    }

    & .parent {
    padding: 0px 0 var(--padding-section-vert) 0;

        &
    h4 {
            margin: 0;
    padding: 0 0 var(--padding-minipad) 0;

            &
    a {
                color: var(--actioncolor);
    text-decoration: none;
    display: inline-block;
            }
        }

        & .sub {
    padding: 0 0 0 0;
    display: flex;
    flex-wrap: wrap;

            &
    h6 {
                width: 110px;
    padding-bottom: 7px;
    font-weight: 400;
    box-sizing: border-box;
    background: #bde5f1;
    margin: 0 5px 5px 0;
    padding: 3px 6px 5px 7px;
    border-radius: 5px;
            }
        }
    }
;
    margin-bottom: var(--padding-section-vert);
    overflow-y: scroll;
    border-bottom: 1px solid #d8d8d8;

    & button {
        margin: 0 0 0 var(--padding-container);
    }
}





#monthsnapshotview {

    height: 100%;
    overflow-y: scroll;

    h3 {
        padding: var(--padding-container);
    }

    h6 {
        padding: var(--padding-container);
    }

    ul.items {
        padding-bottom: 10px;
    }
}




#tagsview {
    
    & h3 {
        padding: var(--padding-container);
    }
}


@media only screen and (max-device-width: 767px) {

    #calcs {
        width: 100%;
    }
    
    #transactions {
        display: none;
    }
}




@media only screen and (min-device-width: 768px) {

}





</style>
<!-- FEATURES

- Category Tags. Quadrant 1, 2, 3 are Fixed Bills, Fluxuating Neccessities, and Comforts. Fourth Quadrant is for wants that make a desirable life. What we get to spend after      1,2,3 are covered.
- Custom Category Tags. Number starts at 10 and up
- Category popup. List that area's cats. 
- Category popup button to sync cats with YNAB. Each cat sub can have #1,11 etc etc for cat tags. Auto gets parsed to firestore

- CalcCat - Avg and Medians for each month for each cat
- CalcCat - Can expand to show any number of months previous
- CalcCat - Clicking on a cat filters transactions, etc to just that cat

- Areas - Can quickly jump to each area

- Transactions - Clicking on a transaction shows details popup
- Transactions - Clicking on a column header sorts by that column

- Reset - Keeps current area. Resets all other filters

- Keyboard Shortcuts
   - R -- Reset
   - S -- Sync Transactions from YNAB
   - A -- Switch area. Followed by number for specific area

-->

<header class="viewheader" style="display:none;">
    <a class="left"><span>‸</span><span></span></a>
    <div class="middle">
        <h1>Ya</h1>
    </div>
    <div class="right">
    </div>
</header>

<div class="content touchroot">

    <div id="calc_transactions_wrapper">

        <div id="calcs"  class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4">
            <div id="tablewrap">
                <table>
                    <thead>
                        <tr>
                            <th class="cat">

                                <a class="${_s.filter.cattags[0] === 1 && _s.filter.cattags[1] === 2 && _s.filter.cattags[2] === 3 && !_s.filter.cattags[3] ? 'active' : ''}" @click="${()=>this.filter_by_cattag([1,2,3])}" data-cattags='1,2,3'>&nbsp;○&nbsp;</a>

                                <a class="${_s.filter.cattags[0] === 1 && !_s.filter.cattags[1] ? 'active' : ''}" @click="${()=>this.filter_by_cattag([1])}" data-cattags='1'>&nbsp;1&nbsp;</a>
                                <a class="${_s.filter.cattags[0] === 2 && !_s.filter.cattags[1] ? 'active' : ''}" @click="${()=>this.filter_by_cattag([2])}" data-cattags='2'>&nbsp;2&nbsp;</a>
                                <a class="${_s.filter.cattags[0] === 3 && !_s.filter.cattags[1] ? 'active' : ''}" @click="${()=>this.filter_by_cattag([3])}" data-cattags='3'>&nbsp;3&nbsp;</a>
                                <a class="${_s.filter.cattags[0] === 4 && !_s.filter.cattags[1] ? 'active' : ''}" @click="${()=>this.filter_by_cattag([4])}" data-cattags='4'>&nbsp;4&nbsp;</a>

                                <a class="${_s.filter.cattags[0] === 1 && _s.filter.cattags[1] === 2 && _s.filter.cattags[2] === 3 && _s.filter.cattags[3] === 4 ? 'active' : ''}" @click="${()=>this.filter_by_cattag([1,2,3,4])}" data-cattags='1,2,3,4'>&nbsp;●&nbsp;</a>

                            </th>

                            ${_s.months_display_str.map((m,i) => Lit_Html`
                                <th class="monthname ${i === _s.months.length-1 ? 'current' : ''}" @click="${(e)=>this.calcmonth_clicked(e)}" data-month_i="${i}">${m}</th>
                            `)}

                            <th class="budget">B</th>
                            <th class="avgmed" @click="${()=>this.avgormed_clicked()}">${_s.prefs.avgormed === 1 ? 'A' : 'M'}</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${_m.catcalcs.map((c,i) => Lit_Html`
                            <tr class="topcatrow">
                                <td class="touch_catquad cat" @click="${(e)=>this.calccat_clicked(e)}" data-i="${i}">${c.cat.name}</td>

                                ${_s.months.map((m,i) => Lit_Html`
                                <td class="touch_month sum ${i === _s.months.length-1 ? 'current' : ''}">${Math.round(c.sums[i])}</td>
                                `)}

                                <td class="touch_area budget">${c.budget}</td>
                                <td class="touch_area avgmed">${Math.round(c.avg)}</td>
                            </tr>

                            ${c.subs.map((cs,ii) => Lit_Html`
                                <tr class="subcatrow ${ii === c.subs.length-1 ? 'lastsubcat' : ''}" data-catcalc_index="${i}" data-catcalc_sub_index="${ii}">
                                    <td class="touch_catquad cat sub" @click="${(e)=>this.calccat_clicked(e)}" data-i="${i}" data-ii="${ii}">${cs.cat.name}</td>

                                    ${_s.months.map((m,iii) => Lit_Html`
                                        <td class="touch_month sum sub ${iii === _s.months.length-1 ? 'current' : ''}">${Math.round(cs.sums[iii])}</td>
                                    `)}

                                    <td class="touch_area budget">${cs.cat.budget}</td>
                                    <td class="touch_area avgmed">${Math.floor(   (_s.prefs.avgormed === 1 ? cs.avg : cs.med)   )}</td>
                                </tr>
                            `)}
                        `)}
                    </tbody>

                    <tfoot>
                        <tr class="totals">
                            <th class="cat">Totals</th>

                            ${_s.months.map((m,i) => Lit_Html`
                            <th class="sum ${i === _s.months.length-1 ? 'current' : ''}">${Math.round(_m.totals.sums[i])}</th>
                            `)}

                            <th class="budget">${Math.round(_m.totals.budget)}</th>
                            <th class="avgmed">${Math.round(_m.totals.avg)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>


        <div id="transactions">
            <div id="tablewrap">
                <table>
                    <thead>
                        <tr>
                            <th class="date" @click="${()=>this.sort_transactions_by('ts', 'asc')}">date</th>
                            <th class="merchant" @click="${()=>this.sort_transactions_by('merchant', 'asc')}">merchant</i></th>
                            <th class="category" @click="${()=>this.sort_transactions_by('cat', 'asc')}">category</th>
                            <th class="amount" @click="${()=>this.sort_transactions_by('amount', 'asc')}">amount</th>
                            <th class="source" @click="${()=>this.sort_transactions_by('source', 'asc')}">source</th>
                            <th class="notes" @click="${()=>this.sort_transactions_by('notes', 'asc')}">notes &nbsp;  
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                    ${_m.current_month_transactions.map((t,i) => Lit_Html`
                        <tr @click="${(e)=>this.transactionrow_clicked(e)}" data-id="${t.id}">
                            <td class="date">${(new Date(t.ts*1000)).toLocaleDateString().slice(0,-5)}</td>
                            <td class="merchant">${t.merchant.toLowerCase().slice(0,18)}</td>
                            <td class="category">${t.cat.name.slice(0,9)}</td>
                            <td class="amount">${Math.round(t.amount)}</td>
                            <td class="source">${t.source.name}</td>
                            <td class="notes">${t.tags.map(tg=>Lit_Html`<span class='tag' @click="${(e)=>this.transaction_tag_clicked(e)}" data-id="${tg.id}">#${tg.name} </span>`)} ${t.notes}</td>
                        </tr>
                    `)}
                    </tbody>
                </table>
            </div>
        </div>

    </div>

    <footer class="touch_switch_calcs_transactions">
        <div id="snapshot">

            <div>
                <a @click="${()=>location.reload()}">&nbsp;Sync&nbsp;</a>
                &nbsp; &nbsp; &nbsp;
                <a @click="${()=>{this.reset()}}">&nbsp;R&nbsp;</a>
                &nbsp;
                <a @click="${()=>{this.toggle_show_tags()}}">&nbsp;T&nbsp;</a>
                &nbsp;
                <a @click="${()=>{this.s.paymentsview.show_ui = this.s.paymentsview.show_ui === 1 ? 2 : 1; this.sc()}}">&nbsp;P&nbsp;</a>
                &nbsp;
                <a @click="${()=>{this.s.catsview.show_ui=1;this.sc();}}">&nbsp;C&nbsp;</a>
            </div>

            <div class="snapshotrow">

                <p class="total">
                    <strong style="color: #097287;">T</strong>
                    ${Math.round(_s.current_monthsnapshot.total)}
                </p>
                <p class="quad4total">
                    <strong style="color: #097287;">T4</strong>
                    ${Math.round(_s.current_monthsnapshot.quad4total)}
                </p>
                <p class="quad123total">
                    <strong style="color: #097287;">T123</strong>
                    ${Math.round(_s.current_monthsnapshot.quad123total)}
                </p>
                <p class="bucket">
                    <i class="icon-bucket" style="color: #097287; font-size: 13.5px;position: relative;top: 0.5px;left: 1px; padding-right: 0px;"></i> 
                    ${Math.round(_s.current_monthsnapshot.bucket)}
                </p>
                <p class="budget">
                    <strong style="color: #097287;">B</strong>
                    ${Math.round(_s.current_monthsnapshot.budget)}
                </p>
                <p class="savings">
                    <i class="icon-piggy" style="color: #097287; font-size: 13.5px;position: relative;top: 0.5px;left: 1px; padding-right: 0px;"></i> 
                    ${Math.round(_s.current_monthsnapshot.savings)}
                </p>
            </div>

            <div class="snapshotrow">

                <p class="budget_t123_diff">
                    <strong style="color: #097287;">B</strong> - <strong style="color: #097287;">T123</strong>
                    ${Math.round(_s.current_monthsnapshot.budget - _s.current_monthsnapshot.quad123total)}
                </p>

                <!--
                <p class="bucket_total_diff">
                    <i class="icon-bucket" style="color: #097287; font-size: 13.5px;position: relative;top: 0.5px;left: 1px; padding-right: 0px;"></i> - <strong style="color: #097287;">T</strong>
                    ${Math.round(_s.current_monthsnapshot.bucket - _s.current_monthsnapshot.total)}
                </p>
                -->

                <p class="bucket_budget_diff">
                    <i class="icon-bucket" style="color: #097287; font-size: 13.5px;position: relative;top: 0.5px;left: 1px; padding-right: 0px;"></i> - <strong style="color: #097287;">B</strong>
                    ${Math.round(_s.current_monthsnapshot.bucket - _s.current_monthsnapshot.budget)}
                </p>
            </div>
        </div>

    </footer>

</div>


${ _s.editview.show_ui !== 0 ? Lit_Html`
    <c-ol shape="1" title="Edit Transaction" @close="${()=> { this.s.editview.show_ui = 0; this.sc(); } }">
        <vp-transaction-edit transaction="${_s.editview.transaction_id}"></vp-transaction-edit>
    </c-ol>
` : '' }



<!--
${ _s.transactiondetails.show_ui !== 0 ? Lit_Html`
    <c-ol shape="1" title="Details" @close="${()=> this.transactiondetails_close() }">
        <div id="transactiondetails">
            <h4>Transaction Details</h4>
            <ul class="items">
                <li><h5>Date</h5><p>${(new Date(_s.transactiondetails.t.ts*1000)).toLocaleDateString()}</p></li>
                <li><h5>Merchant</h5><p>${_s.transactiondetails.t.merchant}</p></li>
                <li><h5>Amount</h5><p>${_s.transactiondetails.t.amount}</p></li>
                <li><h5>Category</h5><p>${_s.transactiondetails.t.cat.parent.area.name} :: ${_s.transactiondetails.t.cat.parent.name} :: ${_s.transactiondetails.t.cat.name}</p></li>
                <li><h5>Source</h5><p>${_s.transactiondetails.t.source.name}</p></li>
                <li><h5>Tags</h5><p>${_s.transactiondetails.t.tags.map(tag=>Lit_Html`<span>${tag}</span>`)}</p></li>
                <li><h5>Note</h5><p>${_s.transactiondetails.t.notes}</p></li>
                <li><h5>ID</h5><p>${_s.transactiondetails.t.id}</p></li>
            </ul>
        </div>
    </c-ol>
` : ''}
-->




${ _s.catsview.show_ui !== 0 ? Lit_Html`
    <c-ol shape="1" title="Categories" ?close="${this.s.catsview.show_ui === 2}" @close="${()=> { this.s.catsview.show_ui = 0; this.sc(); } }">

        <div id="catsview">

            <h3>${_s.filter.area.longname} Categories</h3>

            ${_m.cats.filter(c=> c.area === _s.filter.area).map((cat,i) => Lit_Html`
                <div class="parent" data-i="${i}">
                    <h4>${cat.name}</h4>
                    <div class="sub">
                        ${cat.subs.map(subcat=>Lit_Html`
                            <h6>${subcat.name}</h6>
                        `)}
                    </div>
                </div>
            `)}
        </div>

        <button @click="${()=>this.ynab_sync_categories()}">Sync YNAB Cats</button>

        ${_s.catsview.cats_with_deleteflag.map((cat,i) => Lit_Html`
            <p>${cat.id} :: ${cat.name}</p>
        `)}

    </c-ol>
` : ''}


${ _s.paymentsview.show_ui !== 0 ? Lit_Html`
    <c-ol shape="1" title="Payments" ?close="${this.s.paymentsview.show_ui === 2}" @close="${()=> { this.s.paymentsview.show_ui = 0; this.sc(); } }">

    <div id="paymentsview">

        <section class="payments">
            ${_m.payments.filter(p=>p.type === 'creditcard').map(p=>this.payments_r(p))}
        </section>
        <hr>
        <hr>
        <section class="payments">
            ${_m.payments.filter(p=>p.type === 'carloan').map(p=>this.payments_r(p))}
        </section>
        <hr>
        <section class="payments">
            ${_m.payments.filter(p=>p.type === 'bill').map(p=>this.payments_r(p))}
        </section>

        <!--
        <table>
            <tr>
                <th>payee</th>
                <th>type</th>
                <th>day</th>
                <th>auto</th>
                <th>amount</th>
                <th>nointerest</th>
                <th>pingschecking</th>
                <th>notes</th>
            </tr>

            ${_m.payments.map((p,i) => Lit_Html`
                <tr>
                    <td>${p.payee}</td>
                    <td>${p.type}</td>
                    <td>${p.day}</td>
                    <td>${p.is_auto ? 'yes' : 'no'}</td>
                    <td>${p.amount}</td>
                    <td>${p.nointerest_ifby}</td>
                    <td>${p.is_auto && p.payment_source && p.payment_source.name === 'checkpers' ? 'yes' : ''}</td>
                    <td><span>${p.notes}</span></td>
                </tr>

                ${p.breakdown.map(b=> Lit_Html`
                <tr>
                    <td>${b.split(':')[0]}</td>
                    <td>aggregate</td>
                    <td>0</td>
                    <td>-</td>
                    <td>${b.split(':')[1]}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                `)}
            `)}
        </table>
-->
    </div>

    </c-ol>
` : ''}




${ _s.tagsview.show_ui !== 0 ? Lit_Html`
    <c-ol top="34" width="sm" height="full" ?close="${this.s.tagsview.show_ui === 2}" @close="${()=> { this.s.tagsview.show_ui = 0; this.sc(); } }">

        <div id="tagsview">

            <h3>Tags</h3>

            <ul class="items">
                ${_s.tagsview.tagtotals.map(t=>Lit_Html`
                <li @click="${(e)=>{this.tagsview_tag_clicked(e)}}" data-id="${t.id}">
                        <h5>${t.name}</h5>
                        <p>
                            <span>${Math.round(t.total)}</span>
                        </p>
                    </li>
                `)}
            </ul>

        </div>

    </c-ol>
` : ''}

`;
    };
}
customElements.define('v-finance', VFinance);
