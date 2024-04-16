(() => {
  // server/static_dev/client_xen/lazy/libs/finance_funcs.js
  function knit_all(raw_areas, raw_cats, raw_tags, raw_sources, raw_transactions) {
    const areas = knit_areas(raw_areas);
    const cats = knit_cats(raw_areas, raw_cats);
    const sources = knit_sources(raw_sources);
    const tags = knit_tags(raw_tags);
    const transactions = knit_transactions(cats, tags, sources, raw_transactions);
    return {
      areas,
      cats,
      tags,
      sources,
      transactions
    };
  }
  function knit_areas(raw_areas) {
    return raw_areas;
  }
  function knit_cats(raw_areas, raw_cats) {
    const cats = raw_cats.filter((raw_cat) => raw_cat.area._path.segments[1] !== "null" && raw_cat.parent._path.segments[1] == "null").map((raw_cat) => {
      return {
        id: raw_cat.id,
        area: raw_areas.find((area) => area.id === raw_cat.area._path.segments[1]),
        bucket: raw_cat.bucket,
        budget: raw_cat.budget,
        name: raw_cat.name,
        parent: null,
        subs: [],
        ts: raw_cat.ts,
        transfer_state: 0
      };
    });
    cats.forEach((cat) => {
      cat.subs = raw_cats.filter((raw_cat) => raw_cat.parent._path.segments[1] === cat.id).map((raw_cat) => {
        return {
          id: raw_cat.id,
          area: null,
          bucket: raw_cat.bucket,
          budget: raw_cat.budget,
          name: raw_cat.name,
          parent: cat,
          subs: null,
          ts: raw_cat.ts,
          transfer_state: 0
        };
      });
      cat.bucket.val = cat.subs.reduce((acc, subcat) => {
        return acc + subcat.bucket.val;
      }, 0);
      cat.budget = cat.subs.reduce((acc, subcat) => {
        return acc + subcat.budget;
      }, 0);
      cat.subs.sort((a, b) => a.name.localeCompare(b.name));
    });
    cats.sort((a, b) => a.area.name.localeCompare(b.area.name) || a.name.localeCompare(b.name));
    return cats;
  }
  function knit_sources(raw_sources) {
    return raw_sources.map((raw_source) => {
      return {
        id: raw_source.id,
        ts: raw_source.ts,
        name: raw_source.name
      };
    });
  }
  function knit_tags(raw_tags) {
    return raw_tags.map((raw_tag) => {
      return {
        id: raw_tag.id,
        ts: raw_tag.ts,
        name: raw_tag.name
      };
    });
  }
  function knit_transactions(cats, tags, sources, raw_transactions) {
    const transactions = raw_transactions.map((raw_transaction) => {
      let trcat = null;
      let trarea = null;
      for (const cat of cats) {
        const subcat_match = cat.subs?.find((subcat) => subcat.id === raw_transaction.cat._path.segments[1]);
        if (subcat_match) {
          trcat = subcat_match;
          trarea = cat.area;
          break;
        }
      }
      const trsource = sources.find((source) => source.id === raw_transaction.source._path.segments[1]);
      const trtags = raw_transaction.tags.map((t_tag) => {
        return tags.find((tag) => tag.id === t_tag._path.segments[1]);
      });
      return {
        id: raw_transaction.id,
        amount: raw_transaction.amount,
        area: trarea,
        cat: trcat,
        merchant: raw_transaction.merchant,
        ts: raw_transaction.ts,
        notes: raw_transaction.notes,
        source: trsource,
        tags: trtags
      };
    });
    return transactions;
  }
  function get_months(month_end, count) {
    const months = [];
    for (let i = 0; i < count; i++) {
      months.push(new Date(month_end));
      month_end.setMonth(month_end.getMonth() - 1);
    }
    months.reverse();
    return months;
  }
  function filter_transactions(transactions, filter) {
    const daterange = {
      begin: 0,
      end: 0
    };
    if (filter.daterange) {
      const end_of_last_month = new Date(filter.daterange[1]);
      end_of_last_month.setMonth(end_of_last_month.getMonth() + 1);
      const end_of_last_month_ts = end_of_last_month.getTime() - 1e3;
      daterange.begin = Math.floor(filter.daterange[0].getTime() / 1e3);
      daterange.end = Math.floor(end_of_last_month_ts / 1e3);
    }
    return transactions.filter((transaction) => {
      if (filter.area && transaction.area !== filter.area) {
        return false;
      }
      if (filter.cat && transaction.cat !== filter.cat) {
        return false;
      }
      if (filter.parentcat && transaction.cat.parent !== filter.parentcat) {
        return false;
      }
      if (filter.source && transaction.source !== filter.source) {
        return false;
      }
      if (filter.tags && !filter.tags.every((tag) => transaction.tags.find((t_tag) => t_tag === tag))) {
        return false;
      }
      if (filter.daterange && (transaction.ts < daterange.begin || transaction.ts > daterange.end)) {
        return false;
      }
      if (filter.merchant && !transaction.merchant.toLowerCase().includes(filter.merchant)) {
        return false;
      }
      if (filter.note && !transaction.notes.toLowerCase().includes(filter.note)) {
        return false;
      }
      if (filter.amountrange && (transaction.amount < filter.amountrange[0] || transaction.amount > filter.amountrange[1])) {
        return false;
      }
      return true;
    });
  }
  function sort_transactions(transactions, sort_by, sort_direction) {
    return transactions.sort((a, b) => {
      if (sort_by === "amount") {
        return sort_direction === "asc" ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sort_by === "cat") {
        return sort_direction === "asc" ? a.cat.name.localeCompare(b.cat.name) : b.cat.name.localeCompare(a.cat.name);
      }
      if (sort_by === "merchant") {
        return sort_direction === "asc" ? a.merchant.localeCompare(b.merchant) : b.merchant.localeCompare(a.merchant);
      }
      if (sort_by === "source") {
        return sort_direction === "asc" ? a.source.name.localeCompare(b.source.name) : b.source.name.localeCompare(a.source.name);
      }
      if (sort_by === "notes") {
        return sort_direction === "asc" ? a.notes.localeCompare(b.notes) : b.notes.localeCompare(a.notes);
      }
      if (sort_by === "tags") {
        return sort_direction === "asc" ? a.tags.map((tag) => tag.name).join().localeCompare(b.tags.map((tag) => tag.name).join()) : b.tags.map((tag) => tag.name).join().localeCompare(a.tags.map((tag) => tag.name).join());
      }
      if (sort_by === "ts") {
        return sort_direction === "asc" ? a.ts - b.ts : b.ts - a.ts;
      }
      return 0;
    });
  }
  function current_month_of_filtered_transactions(filtered_transactions, month) {
    const month_end = new Date(month);
    month_end.setMonth(month_end.getMonth() + 1);
    const month_start_ts = month.getTime() / 1e3;
    const month_end_ts = month_end.getTime() / 1e3 - 1;
    return filtered_transactions.filter((transaction) => {
      return transaction.ts > month_start_ts && transaction.ts < month_end_ts;
    });
  }
  function catcalcs(transactions, filter_area, cats, months) {
    const all_catcalcs = [];
    const months_ts = months.map((month) => {
      const start = month.getTime() / 1e3;
      const end_d = new Date(month);
      end_d.setMonth(end_d.getMonth() + 1);
      const end = end_d.getTime() / 1e3 - 1;
      return {
        start,
        end
      };
    });
    for (const cat of cats.filter((cat2) => cat2.area === filter_area)) {
      const catcalc = {
        cat,
        subs: [],
        sums: []
      };
      for (const subcat of cat.subs) {
        const subcatcalc = {
          cat: subcat,
          subs: null,
          sums: []
        };
        for (const month_ts of months_ts) {
          const sum = transactions.filter((transaction) => {
            return transaction.cat === subcat && transaction.ts > month_ts.start && transaction.ts < month_ts.end;
          }).reduce((acc, transaction) => {
            return acc + transaction.amount;
          }, 0);
          subcatcalc.sums.push(sum);
        }
        catcalc.subs.push(subcatcalc);
      }
      all_catcalcs.push(catcalc);
    }
    for (const catcalc of all_catcalcs) {
      const sums = [];
      for (let i = 0; i < months_ts.length; i++) {
        let sum = 0;
        for (const subcatcalc of catcalc.subs) {
          sum += subcatcalc.sums[i];
        }
        sums.push(sum);
      }
      catcalc.sums = sums;
    }
    return all_catcalcs;
  }

  // server/static_dev/client_xen/lazy/views/finance/parts/bucket/bucket.js
  var distcss = `:host{height:100%}#fromtoinfo{padding-top:17px;display:flex;justify-content:center;margin-bottom:10px;#from{margin-right:10px}#direction{margin-left:10px;margin-right:10px;.rightsignify{font-size:28px;color:#00a3c3}}#to{margin-left:10px}#from,#to{width:100px;text-align:center}#from .value,#to .value{font-size:21px;font-weight:700}#from .diffs,#to .diffs{font-size:12px}#from .value span:nth-child(1),#to .value span:nth-child(1){font-size:14px;position:relative;display:inline-block;padding-right:3px;top:-3px;font-weight:400}#from .label,#to .label{font-size:12px}}#fromtosetter,#saveorcancel{margin:0 20px;& input[name=fromtoslider]{width:100%;margin-bottom:10px}}
`;
  var VPFinanceBucket = class extends HTMLElement {
    s;
    shadow;
    constructor() {
      super();
      this.s = {
        fromcat: null,
        tocat: null,
        fromnewval: 0,
        tonewval: 0,
        fromcatdiffs: [],
        tocatdiffs: [],
        transfer_amount: 0
      };
      this.shadow = this.attachShadow({
        mode: "open"
      });
      SetDistCSS(this.shadow, distcss);
    }
    async connectedCallback() {
      let res = await Firestore.Retrieve([
        "cats"
      ]);
      let cats = res[0];
      const fromid = this.getAttribute("cat_from");
      const toid = this.getAttribute("cat_to");
      this.s.fromcat = cats.find((cat) => cat.id == fromid);
      this.s.tocat = cats.find((cat) => cat.id == toid);
      this.s.fromnewval = this.s.fromcat.bucket.val;
      this.s.tonewval = this.s.tocat.bucket.val;
      const d = /* @__PURE__ */ new Date();
      const one_month_ago = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const two_months_ago = new Date(d.getFullYear(), d.getMonth() - 2, 1);
      const d_short = d.toLocaleString("default", {
        month: "short"
      });
      const one_month_ago_short = one_month_ago.toLocaleString("default", {
        month: "short"
      });
      const two_months_ago_short = two_months_ago.toLocaleString("default", {
        month: "short"
      });
      this.s.fromcatdiffs = [
        `${this.s.fromcat.bucket.diffs[0]} -- `,
        `${this.s.fromcat.bucket.diffs[1]} -- `,
        `${this.s.fromcat.bucket.diffs[2]}`
      ];
      this.s.tocatdiffs = [
        `${this.s.tocat.bucket.diffs[0]} -- `,
        `${this.s.tocat.bucket.diffs[1]} -- `,
        `${this.s.tocat.bucket.diffs[2]}`
      ];
      this.sc();
      this.dispatchEvent(new Event("hydrated"));
    }
    async rangechange(e) {
      const val = e.target.value;
      this.s.transfer_amount = Math.ceil(this.s.fromcat.bucket.val * val / 100);
      this.s.fromnewval = this.s.fromcat.bucket.val - this.s.transfer_amount;
      this.s.tonewval = this.s.tocat.bucket.val + this.s.transfer_amount;
      this.sc();
    }
    async save() {
      const frompath = "cats/" + this.s.fromcat.id;
      const topath = "cats/" + this.s.tocat.id;
      const frombucket = this.s.fromcat.bucket;
      const tobucket = this.s.tocat.bucket;
      frombucket.val = this.s.fromnewval;
      tobucket.val = this.s.tonewval;
      frombucket.diffs[2] = frombucket.diffs[2] - this.s.transfer_amount;
      tobucket.diffs[2] = tobucket.diffs[2] + this.s.transfer_amount;
      const rs = await Firestore.Patch([
        frompath,
        topath
      ], [
        {
          bucket: frombucket
        },
        {
          bucket: tobucket
        }
      ]);
      this.dispatchEvent(new CustomEvent("saved", {
        "detail": {
          fromnewval: this.s.fromnewval,
          tonewval: this.s.tonewval
        }
      }));
      setTimeout(() => {
        this.dispatchEvent(new Event("close"));
      }, 300);
    }
    sc() {
      Lit_Render(this.template(this.s), this.shadow);
    }
    template = (_s) => {
      return Lit_Html`
<div id="fromtoinfo" @mousedown="${(e)=>{ this.mousedowned(e); }}" @mouseup="${(e)=>{ this.mouseupped(e); }}" @mousemove="${(e)=>{ this.mousemove(e); }}">
    <div id="from">
        <div class="value"><span>$</span><span>${_s.fromnewval}</span></div>
        <div class="label">${_s.fromcat.name}</div>
        <div class="diffs">${_s.fromcatdiffs}</div>
    </div>
    <div id="direction">
        <div class="rightsignify">${_s.transfer_amount} ➡</div>
    </div>
    <div id="to">
        <div class="value"><span>$</span><span>${_s.tonewval}</span></div>
        <div class="label">${_s.tocat.name}</div>
        <div class="diffs">${_s.tocatdiffs}</div>
    </div>
</div>

<div id="fromtosetter">
    <input type="range" name="fromtoslider" min="0" max="100" step="1" value="0" @input="${(e)=>{this.rangechange(e)}}" />
</div>

<div id="saveorcancel">
    <button class="btn" @click="${()=>{ this.dispatchEvent(new Event('close')); }}">Cancel</button>
    <button class="btn" @click="${()=>this.save()}">Save</button>
</div>
`;
    };
  };
  customElements.define("vp-finance-bucket", VPFinanceBucket);

  // server/static_dev/client_xen/lazy/views/finance/finance.js
  var distcss2 = `.mrsimple{padding:8px;background-color:#add8e6;border-radius:5px;color:#000;font-weight:700;font-size:16px}.mrsimple.active{background-color:#90ee90}div.content{display:flex;justify-content:space-between;height:100%}#calcs,#transactions{& table{border-collapse:collapse;position:relative;width:100%}& td,th{border:0;padding:3px 4px}& th{position:sticky;top:0;background-color:#fff;text-align:left;border-bottom:5px solid #9bdfee}}#calcs{flex:22;& th.monthname{width:42px;max-width:42px}& th.bucket,th.budget{width:47px;max-width:47px}& th.cat,td.cat{padding-left:10px}& th.current,td.current{background-color:#e5fff4}& th.bucket,td.bucket{background-color:#abf1ff}& th.budget,td.budget{background-color:#caf6ff}& tr.topcatrow td{font-weight:700}& tr.subcatrow td{font-weight:400}& td.bucket{-webkit-tap-highlight-color:rgba(255,255,255,0);transition-duration:.7s;transition-property:background-color,color}& td.bucket.transfer_state_1{background-color:#00a3c3;color:#fff}& td.bucket.transfer_state_2{background-color:#00a3c3;color:#fff}& tr.lastsubcat td{padding-bottom:17px}}#transactions{flex:33;& table{border-collapse:collapse;width:100%}}#transactiondetails{padding:0;& h4{margin:0;padding:10px 0 0 12px;font-size:17px}& ul.items{padding:0;& li{padding:0;margin:0}}}footer{position:fixed;bottom:0;left:0;width:100%;display:flex;justify-content:space-between;padding:0 10px;background-color:#f0f0f0;border-top:1px solid #d0d0d0;font-size:12px;color:#666;height:30px}#viewcats{padding:5px;.addacatlink{color:var(--actioncolor);text-decoration:none;padding-left:5px;font-size:18px;font-weight:700}& form.addacat{visibility:hidden;opacity:0;transform:translate3d(-8px,0,0);transition:opacity .35s ease-out,transform .35s ease-out;& input{width:110px}& select{margin:0 8px 0 0}}& form.addacat.active{visibility:visible;transform:translateZ(0);opacity:1;padding:8px 0 0 12px}& form.addacat .saveconfirm{visibility:hidden;opacity:0;transform:translate3d(-8px,0,0);transition:opacity .35s ease-out,transform .35s ease-out}& form.addacat .saveconfirm.active{visibility:visible;opacity:1}.catparent{padding:5px;& h4{margin:0;padding:0;& a{color:var(--actioncolor);text-decoration:none;display:inline-block;padding-left:5px}}.subcats{padding:5px;& h6{width:84px;padding-bottom:7px;font-weight:400}display:flex;flex-wrap:wrap}}}@media only screen and (max-device-width: 767px){#calcs{width:100%}#transactions{display:none}}
`;
  var VFinance = class extends HTMLElement {
    s;
    shadow;
    m;
    constructor() {
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
          amountrange: null
        },
        months: [],
        bucket_transfer: {
          fromcat: null,
          tocat: null,
          show_ui: 0
        },
        transactiondetails: {
          show_ui: 0,
          t: null
        },
        viewcats: {
          show_ui: 0
        },
        tempe_showui: 0
      };
      this.m = {
        areas: [],
        cats: [],
        tags: [],
        sources: [],
        transactions: [],
        filtered_transactions: [],
        current_month_transactions: [],
        catcalcs: [],
        groupcalcs: [
          {
            name: "fokes",
            parentcats: [
              "personal",
              "supplies"
            ],
            subcats: [
              "family:laura",
              "family:rent"
            ],
            sums: []
          }
        ]
      };
      this.shadow = this.attachShadow({
        mode: "open"
      });
      SetDistCSS(this.shadow, distcss2);
    }
    async connectedCallback() {
      let res = await Firestore.Retrieve([
        "areas",
        "cats",
        "tags",
        "sources",
        "transactions"
      ]);
      let k = knit_all(res[0], res[1], res[2], res[3], res[4]);
      this.m.areas = k.areas;
      this.m.cats = k.cats;
      this.m.tags = k.tags;
      this.m.sources = k.sources;
      this.m.transactions = k.transactions;
      this.s.filter.area = this.m.areas.find((area) => area.name === "fam");
      this.reset_except_area();
      this.parse_new_state();
      this.sc();
      this.dispatchEvent(new Event("hydrated"));
    }
    parse_new_state() {
      this.s.filter.daterange = [
        this.s.months[0],
        this.s.months[this.s.months.length - 1]
      ];
      this.m.filtered_transactions = filter_transactions(this.m.transactions, this.s.filter);
      this.m.current_month_transactions = current_month_of_filtered_transactions(this.m.filtered_transactions, this.s.months[this.s.months.length - 1]);
      this.m.catcalcs = catcalcs(this.m.current_month_transactions, this.s.filter.area, this.m.cats, this.s.months);
      this.catcalc_custom_groups();
    }
    reset_except_area() {
      const thismonth = /* @__PURE__ */ new Date();
      thismonth.setDate(1);
      thismonth.setHours(0, 0, 0, 0);
      this.s.months = get_months(thismonth, 3);
      this.s.filter.parentcat = null;
      this.s.filter.cat = null;
      this.s.filter.source = null;
      this.s.filter.tags = null;
      this.s.filter.daterange = null;
      this.s.filter.merchant = null;
      this.s.filter.note = null;
      this.s.filter.amountrange = null;
    }
    set_area(areaname) {
      this.reset_except_area();
      this.s.filter.area = this.m.areas.find((area) => area.name === areaname);
      this.parse_new_state();
      this.sc();
    }
    filter_by_source(sourcename) {
      this.s.filter.source = this.m.sources.find((source) => source.name === sourcename);
      this.parse_new_state();
      this.sc();
    }
    sort_transactions_by(sort_by, sort_direction) {
      this.m.current_month_transactions = sort_transactions(this.m.current_month_transactions, sort_by, sort_direction);
      this.sc();
    }
    catcalc_custom_groups() {
      for (const customgroup of this.m.groupcalcs) {
        customgroup.sums = Array(this.s.months.length).fill(0);
        const customgroup_subcats = customgroup.subcats.map((sc) => {
          let x = sc.split(":");
          return {
            parent: x[0],
            sub: x[1]
          };
        });
        for (const catcalc of this.m.catcalcs) {
          if (customgroup.parentcats.includes(catcalc.cat.name)) {
            for (let i = 0; i < customgroup.sums.length; i++) {
              customgroup.sums[i] += catcalc.sums[i];
            }
          }
          for (const customgroup_subcat of customgroup_subcats) {
            if (catcalc.cat.name === customgroup_subcat.parent) {
              const catcalc_sub = catcalc.subs.find((sub) => sub.cat.name === customgroup_subcat.sub);
              for (let i = 0; i < customgroup.sums.length; i++) {
                customgroup.sums[i] += catcalc_sub.sums[i];
              }
            }
          }
        }
      }
    }
    transactionrow_clicked(e) {
      const el = e.currentTarget;
      this.s.transactiondetails.t = this.m.transactions.find((t) => t.id === el.dataset.id);
      this.s.transactiondetails.show_ui = 1;
      this.sc();
    }
    transactiondetails_close() {
      this.s.transactiondetails.show_ui = 0;
      this.sc();
    }
    calcmonth_clicked(e) {
      const el = e.currentTarget;
      const month_i = Number(el.dataset.month_i);
      this.s.months = get_months(this.s.months[month_i], 3);
      this.parse_new_state();
      this.sc();
    }
    calccat_clicked(e) {
      const el = e.currentTarget;
      const i = Number(el.dataset.i);
      const ii = Number(el.dataset.ii || -1);
      if (ii === -1) {
        this.s.filter.parentcat = this.m.cats[i];
        this.s.filter.cat = null;
      } else {
        this.s.filter.cat = this.m.cats[i].subs[ii];
        this.s.filter.parentcat = null;
      }
      this.parse_new_state();
      this.sc();
    }
    async bucket_amount_clicked(e) {
      const el = e.currentTarget.closest("[data-catcalc_sub_index]");
      const cat_index = Number(el.dataset.catcalc_index);
      const subcat_index = Number(el.dataset.catcalc_sub_index);
      const cat = this.m.cats[cat_index].subs[subcat_index];
      let transfer_from_cat = null;
      for (const c of this.m.cats) {
        const cat_ = c.subs?.find((c2) => c2.transfer_state === 1);
        if (cat_) {
          transfer_from_cat = cat_;
          break;
        }
      }
      if (transfer_from_cat) {
        cat.transfer_state = 2;
        this.s.bucket_transfer.tocat = cat;
        this.s.bucket_transfer.show_ui = 1;
      } else {
        cat.transfer_state = 1;
        this.s.bucket_transfer.fromcat = cat;
      }
      this.sc();
    }
    async bucket_saved(e) {
      this.s.bucket_transfer.fromcat.bucket.val = e.detail.fromnewval;
      this.s.bucket_transfer.tocat.bucket.val = e.detail.tonewval;
      this.sc();
    }
    async bucket_closed(_e) {
      this.s.bucket_transfer.show_ui = 0;
      this.sc();
      setTimeout(() => {
        this.s.bucket_transfer.fromcat.transfer_state = 0;
        this.s.bucket_transfer.tocat.transfer_state = 0;
        this.sc();
      }, 1e3);
    }
    showaddacat(e) {
      const el = e.currentTarget;
      el.nextElementSibling.classList.add("active");
      this.sc();
    }
    async addacat(e) {
      const el = e.currentTarget;
      const formel = el.closest("form.addacat");
      const elements = formel.elements;
      const addacat_newcatname = elements.namedItem("newcatname");
      const addacat_parent = elements.namedItem("addacat_parent");
      this.sc();
    }
    sc(state_changes = {}) {
      this.s = Object.assign(this.s, state_changes);
      Lit_Render(this.template(this.s, this.m), this.shadow);
    }
    template = (_s, _m) => {
      return Lit_Html`

<div class="content">

    <div id="calcs">

        <p class="tempe" @click="${()=> this.sc({tempe_showui:(_s.tempe_showui ? 0 : 1)}) }" ${animate(_s.tempe_showui,this)}>Tempe</p>

        <table>
            <tr>
                <th class="cat"><i class="icon-list" style="font-size: 13px;position: relative;top: 1px; left: 1px; padding-right: 0px;"></i></th>

                ${_s.months.map((m,i) => Lit_Html`
                    <th class="monthname ${i === _s.months.length-1 ? 'current' : ''}" @click="${(e)=>this.calcmonth_clicked(e)}" data-month_i="${i}">${m.toLocaleString('default', { month: 'short' })}</th>
                `)}

                <th class="budget"><i class="icon-piggy" style="color: #097287; font-size: 13.5px;position: relative;top: 0.5px;left: 1px; padding-right: 0px;"></i></th>
                <th class="bucket"><i class="icon-bucket" style="color: #138ba3; font-size: 12px;position: relative;top: 1.5px; left: 1px; padding-right: 0px; "></i></th>
            </tr>


            ${_m.catcalcs.map((c,i) => Lit_Html`
                <tr class="topcatrow">
                    <td class="cat" @click="${(e)=>this.calccat_clicked(e)}" data-i="${i}">${c.cat.name}</td>

                    ${_s.months.map((m,i) => Lit_Html`
                    <td class="sum ${i === _s.months.length-1 ? 'current' : ''}">${Math.round(c.sums[i])}</td>
                    `)}

                    <td class="budget">${_m.cats[i].budget}</td>
                    <td class="bucket">${_m.cats[i].bucket.val}</td>
                </tr>

                ${c.subs.map((cs,ii) => Lit_Html`
                    <tr class="subcatrow ${ii === c.subs.length-1 ? 'lastsubcat' : ''}" data-catcalc_index="${i}" data-catcalc_sub_index="${ii}">
                        <td class="cat sub" @click="${(e)=>this.calccat_clicked(e)}" data-i="${i}" data-ii="${ii}">${cs.cat.name}</td>

                        ${_s.months.map((m,iii) => Lit_Html`
                            <td class="sum sub ${iii === _s.months.length-1 ? 'current' : ''}">${Math.round(cs.sums[iii])}</td>
                        `)}

                        <td class="budget">${_m.cats[i].subs[ii].budget}</td>
                        <td class="bucket transfer_state_${_m.cats[i].subs[ii].transfer_state}" @click="${(e)=>{ console.log("asdfasf"); this.bucket_amount_clicked(e); }}">${_m.cats[i].subs[ii].bucket.val}</td>
                    </tr>
                `)}
            `)}

            ${localStorage.getItem('user_email') === 'accounts@risingtiger.com' ? Lit_Html`
                ${_m.groupcalcs.map((g,i) => Lit_Html`
                    <tr class="">
                        <td class="cat">${g.name}</td>
                        ${_s.months.map((m,i) => Lit_Html`
                            <td>${Math.round(g.sums[i])}</td>
                        `)}
                        <td></td>
                        <td></td>
                    </tr>
                `)}
            ` : ''}
        </table>
    </div>




    <div id="transactions">
        <table>
            <tr>
                <th class="date" @click="${()=>this.sort_transactions_by('ts', 'asc')}">date</th>
                <th class="merchant" @click="${()=>this.sort_transactions_by('merchant', 'asc')}">merchant</i></th>
                <th class="category" @click="${()=>this.sort_transactions_by('cat', 'asc')}">category</th>
                <th class="amount" @click="${()=>this.sort_transactions_by('amount', 'asc')}">amount</th>
                <th class="source" @click="${()=>this.sort_transactions_by('source', 'asc')}">source</th>
                <th class="tags" @click="${()=>this.sort_transactions_by('tags', 'asc')}">tags</th>
                <th class="notes" @click="${()=>this.sort_transactions_by('notes', 'asc')}">notes</th>
            </tr>

            ${_m.current_month_transactions.map((t,i) => Lit_Html`
                <tr @click="${(e)=>this.transactionrow_clicked(e)}" data-id="${t.id}">
                    <td class="date">${(new Date(t.ts*1000)).toLocaleDateString().slice(0,-5)}</td>
                    <td class="merchant">${t.merchant.toLowerCase().slice(0,18)}</td>
                    <td class="category">${t.cat.name.slice(0,9)}</td>
                    <td class="amount">${Math.round(t.amount)}</td>
                    <td class="source">${t.source.name}</td>
                    <td class="tags">${t.tags.map(tag=>Lit_Html`<span>${tag}</span>`)}</td>
                    <td class="notes">${t.notes.slice(0,9)}</td>
                </tr>
            `)}

        </table>
    </div>

    <footer>

        <a @click="${()=>{this.s.viewcats.show_ui=1;this.sc();}}"><i class="icon-checkcircle"></i>View Cats</a>
        <a @click="${()=>window.location.hash='addtr'}"><i class="icon-checkcircle"></i>Categorize New</a>

        ${localStorage.getItem('user_email') === 'accounts@risingtiger.com' ? Lit_Html`
            <a @click="${()=>this.set_area('fam')}">Fam</a> &nbsp;
            <a @click="${()=>this.set_area('pers')}">Pers</a> &nbsp;
            <a @click="${()=>this.set_area('rtm')}">RTM</a> &nbsp;

            <a @click="${()=>this.filter_by_source('barclay')}">Barclay Card</a> &nbsp;

        ` : ''}

        <a @click="${()=>{this.reset_except_area();this.parse_new_state();this.sc();}}">Reset</a> &nbsp;

    </footer>

</div>




${ _s.transactiondetails.show_ui !== 0 ? Lit_Html`
    <c-ol top="34" width="sm" height="full" @close="${()=> this.transactiondetails_close() }">
        <div id="transactiondetails">
            <h4>Transaction Details</h4>
            <ul class="items">
                <li><h5>Date</h5><p>${(new Date(_s.transactiondetails.t.ts*1000)).toLocaleDateString()}</p></li>
                <li><h5>Merchant</h5><p>${_s.transactiondetails.t.merchant}</p></li>
                <li><h5>Amount</h5><p>${_s.transactiondetails.t.amount}</p></li>
                <li><h5>Category</h5><p>${_s.transactiondetails.t.cat.parent.area.name} :: ${_s.transactiondetails.t.cat.parent.name} :: ${_s.transactiondetails.t.cat.name}</p></li>
                <li><h5>Source</h5><p>${_s.transactiondetails.t.source.name}</p></li>
                <li><h5>Tags</h5><p>${_s.transactiondetails.t.tags.map(tag=>Lit_Html`<span>${tag}</span>`)}</p></li>
                <li><h5>Note</h5><p>${_s.transactiondetails.t.note}</p></li>
                <li><h5>ID</h5><p>${_s.transactiondetails.t.id}</p></li>
            </ul>
        </div>
    </c-ol>
` : ''}




${ _s.bucket_transfer.show_ui !== 0 ? Lit_Html`
    <c-ol top="34" width="sm" height="full" @close="${()=> this.bucket_closed() }">
        <vp-finance-bucket @saved="${(e)=>this.bucket_saved(e)}" cat_from="${_s.bucket_transfer.fromcat.id}" cat_to="${_s.bucket_transfer.tocat.id}"></vp-finance-bucket>
    </c-ol>
` : ''}




${ _s.viewcats.show_ui !== 0 ? Lit_Html`
    <c-ol top="34" width="sm" height="full" @close="${()=> this.bucket_closed() }">

    <div id="viewcats">

        ${_m.cats.map((cat,i) => Lit_Html`
            <div class="catparent" data-i="${i}">
                <h4>${cat.name}</h4>
                <div class="subcats">
                    ${cat.subs.map(subcat=>Lit_Html`
                        <h6>${subcat.name}</h6>
                    `)}
                </div>
            </div>
        `)}

        <div class="addacatlink" @click="${(e)=>this.showaddacat(e)}">+ add category</div>
        <form class="addacat">
            <select name="addacat_parent">
                <option value="0">Select Parent</option>
                <option value="0">None</option>
                ${_m.cats.map((cat,i) => Lit_Html`<option value="${i}">${cat.name}</option>`)}
            </select>
            <span class="input"><input name="newcatname" type="text" placeholder="New Category"></span>
            <button @click="${(e)=>this.addcat(e)}">Add</button>
            <span class="saveconfirm">added</span>
        </form>

    </div>
    </c-ol>
` : ''}



`;
    };
  };
  customElements.define("v-finance", VFinance);
})();
