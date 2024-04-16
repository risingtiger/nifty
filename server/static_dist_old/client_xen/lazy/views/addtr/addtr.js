(() => {
  // server/static_dev/client_xen/lazy/libs/finance_funcs.js
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

  // server/static_dev/client_xen/lazy/views/addtr/addtr.js
  var InputModeE;
  (function(InputModeE2) {
    InputModeE2[InputModeE2["Cat"] = 0] = "Cat";
    InputModeE2[InputModeE2["Note"] = 1] = "Note";
    InputModeE2[InputModeE2["Amount"] = 2] = "Amount";
  })(InputModeE || (InputModeE = {}));
  var distcss = `#keycatcher_w{width:100%;box-sizing:border-box;padding:10px;>input#keycatcher{width:100%;box-sizing:border-box;font-size:14px;color:#6b6b6b;padding:5px 2px 5px 7px;border-color:#d9d9d9;border-width:1px;border-style:solid;border-radius:6px}}#rawtransaction{padding:10px 10px 20px;border-radius:6px;>.a_transaction{padding:9px 10px;border-radius:6px;.primary{display:flex;flex-wrap:wrap;justify-content:space-between;padding-bottom:7px;.date{width:22%}.longdesc{width:60%;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.amount{width:18%;text-align:right}.amount:before{content:"$"}}.secondary{display:flex;flex-wrap:wrap;justify-content:space-between;.cat{width:24%;text-align:left;border:2px solid #16f0e0;padding:1px 7px 3px;border-radius:6px;background-color:#00daca}.source{width:18%;text-align:center;border:2px solid #08cbf2;padding:1px 7px 3px;border-radius:6px;background-color:#00bee4}}.tertiary{display:flex;flex-wrap:wrap;justify-content:space-between;.note{width:100%}}.anitem{font-size:17px;color:gray}}>.a_transaction.active{background-color:#00accf;.anitem{color:#fff}}}#cats{padding:0 0 0 10px;.catparent{display:block;padding-bottom:10px;& h4{font-size:16px;padding-bottom:4px;padding-left:1px;font-weight:400}.subcats{flex-wrap:wrap;display:flex;& h6{height:20px;padding:3px 6px 3px 7px;font-weight:400;color:#fff;width:75px;overflow:hidden;font-size:15px;background:#00c9ba;margin-right:5px;margin-bottom:5px;border-radius:6px;>.cathighlight{display:inline-block;height:100%;background-color:#05accf;color:#fff;font-weight:500}}h6.hidden{display:none}}}.catparent.hidden{display:none}}.keyinput_indicator{display:none;position:absolute;top:10px;right:10px;height:30px;box-sizing:border-box;padding:6px 8px 0 12px;border-radius:6px;background-color:#ededed;>span{font-size:13px}}.keyinput_indicator.active{display:block}input#merchantedit{padding-bottom:30px}
`;
  var VAddTr = class extends HTMLElement {
    s;
    areas;
    cats;
    sources;
    tags;
    latest_raw_transactions;
    shadow;
    constructor() {
      super();
      this.s = {
        newcount: 0,
        rawtransactions: [
          {
            id: "",
            sourcename: "",
            long_desc: "",
            short_desc: "",
            amount: 0,
            ts: 0,
            note: ""
          }
        ],
        focusedindex: 0,
        transactionindex: 0,
        splittotal: 0,
        allow_split: true,
        keyinput_mode: 0
      };
      this.areas = [];
      this.cats = [];
      this.sources = [];
      this.tags = [];
      this.latest_raw_transactions = [];
      this.shadow = this.attachShadow({
        mode: "open"
      });
      SetDistCSS(this.shadow, distcss);
    }
    async connectedCallback() {
      const promises = [];
      await this.sync_latest();
      const firestoredata = Firestore.Retrieve([
        "areas",
        "cats",
        "sources",
        "tags"
      ]);
      const latest = FetchLassie("/api/xen/finance/get_latest_raw_transactions");
      promises.push(firestoredata);
      promises.push(latest);
      const v = await Promise.all(promises);
      this.areas = knit_areas(v[0][0]);
      this.cats = knit_cats(this.areas, v[0][1]);
      this.sources = knit_sources(v[0][2]);
      this.tags = knit_tags(v[0][3]);
      if (localStorage.getItem("user_email") === "accounts@risingtiger.com") {
        this.latest_raw_transactions = v[1];
      } else {
        this.latest_raw_transactions = v[1].filter((tr) => tr.sourcename === "barclay");
      }
      this.latest_raw_transactions.forEach((tr) => {
        tr.source = this.sources.find((source) => source.name === tr.sourcename);
      });
      if (this.latest_raw_transactions.length === 0) {
        alert("no new transactions");
        return this.sc();
      }
      this.s.transactionindex = 0;
      this.s.newcount = this.latest_raw_transactions.length;
      this.process_next_transaction();
      if (localStorage.getItem("user_email") !== "accounts@risingtiger.com") {
        this.cats = this.cats.filter((cat) => cat.area.name === "fam");
      }
      const keycatcher_el = this.shadow.querySelector("#keycatcher");
      keycatcher_el.focus();
      keycatcher_el.addEventListener("keyup", this.keyup.bind(this));
      this.sc();
      this.dispatchEvent(new Event("hydrated"));
    }
    disconnectedCallback() {
    }
    async sync_latest() {
      return new Promise(async (resolve, _reject) => {
        await FetchLassie("/api/xen/finance/sync_latest_gsheet", {});
        resolve(1);
      });
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
      const trs = this.s.rawtransactions;
      const transaction_raw_id = trs[0].id;
      const newtransactions = trs.map((tr) => {
        return {
          amount: Math.round(tr.amount * 100) / 100,
          catid: tr.cat?.id,
          merchant: tr.long_desc,
          notes: tr.note,
          sourceid: tr.source?.id,
          tagids: [],
          ts: tr.ts
        };
      });
      const body = {
        transaction_raw_id,
        newtransactions
      };
      await FetchLassie("/api/xen/finance/save_raw_transaction", {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (this.s.transactionindex == this.latest_raw_transactions.length - 1) {
        alert("all transactions processed. DONE");
      } else {
        this.s.transactionindex++;
        this.process_next_transaction();
      }
    }
    keyup(e) {
      const keycatcher_el = this.shadow.querySelector("#keycatcher");
      const val = keycatcher_el.value.toLowerCase();
      if (e.key === "Enter") {
        if (this.s.keyinput_mode === 0) {
          if (val.length < 2) {
            alert("no category selected");
            keycatcher_el.value = "";
            keycatcher_el.focus();
            this.highlight_catnames_reset_all();
          } else {
            const catname_els = this.shadow.querySelectorAll(".subcats > h6:not(.hidden)");
            let foundcat = null;
            let catname = catname_els[0].textContent;
            for (const c of this.cats) {
              const f = c.subs?.find((sub) => sub.name === catname);
              if (f) {
                foundcat = f;
                break;
              }
            }
            if (foundcat) {
              this.s.allow_split = false;
              this.s.rawtransactions[this.s.focusedindex].cat = foundcat;
              if (this.s.rawtransactions.length > 1) {
                this.s.keyinput_mode = 2;
                if (this.s.focusedindex == this.s.rawtransactions.length - 1) {
                  keycatcher_el.value = this.s.splittotal.toFixed(2);
                } else {
                  keycatcher_el.value = "";
                }
              } else {
                this.s.keyinput_mode = 1;
                keycatcher_el.value = "";
              }
              this.highlight_catnames_reset_all();
              this.sc();
              keycatcher_el.focus();
            } else {
              alert("no category found or too many categories found. need to match only one.");
              keycatcher_el.value = "";
              keycatcher_el.focus();
              this.highlight_catnames_reset_all();
            }
          }
        } else if (this.s.keyinput_mode === 2) {
          if (this.s.focusedindex == this.s.rawtransactions.length - 1) {
            this.s.rawtransactions[this.s.focusedindex].amount = this.s.splittotal;
            this.s.keyinput_mode = 1;
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
          this.s.keyinput_mode = 1;
          keycatcher_el.value = "";
          keycatcher_el.focus();
          this.s.rawtransactions[this.s.focusedindex].amount = n;
          this.s.splittotal -= n;
          this.sc();
        } else if (this.s.keyinput_mode === 1) {
          this.s.rawtransactions[this.s.focusedindex].note = val;
          if (this.s.focusedindex === this.s.rawtransactions.length - 1) {
            keycatcher_el.value = "";
            keycatcher_el.focus();
            this.sc();
            this.save_focused_transaction_and_load_next();
          } else {
            this.s.focusedindex++;
            this.s.keyinput_mode = 0;
            keycatcher_el.value = "";
            keycatcher_el.focus();
            this.sc();
          }
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
          for (let i = 1; i < this.s.rawtransactions.length; i++) {
            this.s.rawtransactions[i].amount = 0;
          }
          this.s.splittotal = this.s.rawtransactions[0].amount;
          this.sc();
        } else {
          if (val.length > 1) {
            this.highlight_catnames(val);
          }
        }
      } else if (this.s.keyinput_mode === 2) {
      } else if (this.s.keyinput_mode === 1) {
      }
    }
    highlight_catnames(searchstr) {
      const subcatnames = this.shadow.querySelectorAll(".subcats > h6");
      subcatnames.forEach((el) => {
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
      const catparentels = this.shadow.querySelectorAll(".catparent");
      catparentels.forEach((el) => {
        const subcatnames2 = el.querySelectorAll("h6");
        const allhidden = Array.from(subcatnames2).every((el2) => el2.classList.contains("hidden"));
        if (allhidden) {
          el.classList.add("hidden");
        }
      });
    }
    highlight_catnames_reset_all() {
      const subcatnames = this.shadow.querySelectorAll(".subcats > h6");
      subcatnames.forEach((el) => {
        el.innerHTML = el.textContent;
        el.classList.remove("hidden");
      });
      const catparentels = this.shadow.querySelectorAll(".catparent");
      catparentels.forEach((el) => {
        el.classList.remove("hidden");
      });
    }
    reset_transaction() {
      location.reload();
    }
    sc() {
      Lit_Render(this.template(this.s, this.areas, this.cats, this.sources, this.tags), this.shadow);
    }
    template = (_s, _areas, _cats, _sources, _tags) => {
      return Lit_Html`
<header class="viewheader">
    <a class="left" @click="${()=>window.location.hash='finance'}"><span>‸</span><span>finance</span></a>
    <div class="middle">
        <h1>Categorize New ${_s.transactionindex+1} of ${_s.newcount}</h1>
    </div>
    <div class="right">
        <a @click="${()=>{ this.reset_transaction(); }}" style="font-size: 17px;">reset</a>
    </div>
</header>

<div class="content">

    <div id="keycatcher_w">
        <input id="keycatcher" type="email" spellcheck="false" inputmode="email"></input>
    </div>

    <div id="rawtransaction">
        ${_s.rawtransactions.map((rawtransactions,i)=>Lit_Html`
            <div class="a_transaction ${i === _s.focusedindex ? 'active' : ''}">
                <div class="primary">
                    <div class="anitem date">${(new Date(rawtransactions.ts*1000)).toLocaleDateString()}</div>
                    <div class="anitem longdesc">${rawtransactions.long_desc}</div>
                    <div class="anitem amount">${rawtransactions.amount.toFixed(2)}</div>
                </div>
                <div class="secondary">
                    <div class="anitem cat">${rawtransactions.cat?.name || '...'}</div>
                    <div class="anitem source">${rawtransactions.source?.name || ''}</div>
                </div>
                <div class="tertiary">
                    <div class="anitem note">${rawtransactions.note}</div>
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
                        <h6>${subcat.name}</h6>
                    `)}
                </div>
            </div>
        `)}
    </div>

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

    <a @click="${()=> this.sync_latest()}">sync latest</a>
</div>

`;
    };
  };
  customElements.define("v-addtr", VAddTr);
})();
