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
})();
