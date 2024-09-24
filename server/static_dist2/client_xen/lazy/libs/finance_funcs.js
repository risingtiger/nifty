function knit_all(raw_areas, raw_cats, raw_sources, raw_tags, raw_payments, raw_transactions, raw_monthsnapshots) {
    const areas = knit_areas(raw_areas);
    const cats = knit_cats(raw_areas, raw_cats);
    const sources = knit_sources(raw_sources);
    const tags = knit_tags(areas, raw_tags);
    const payments = knit_payments(sources, raw_payments);
    const transactions = knit_transactions(cats, sources, tags, raw_transactions);
    const previous_static_monthsnapshots = knit_monthsnapshots(raw_monthsnapshots, areas);
    return {
        areas,
        cats,
        sources,
        tags,
        payments,
        transactions,
        previous_static_monthsnapshots
    };
}
function knit_areas(raw_areas) {
    return raw_areas;
}
function knit_cats(raw_areas, raw_cats) {
    const cats = raw_cats.filter((raw_cat)=>raw_cat.area !== null && raw_cat.parent == null).map((raw_cat)=>{
        return {
            id: raw_cat.id,
            area: raw_areas.find((area)=>area.id === raw_cat.area._path.segments[1]),
            budget: raw_cat.budget,
            name: raw_cat.name,
            parent: null,
            tags: raw_cat.tags,
            subs: [],
            ts: raw_cat.ts,
            transfer_state: 0
        };
    });
    cats.forEach((cat)=>{
        cat.subs = raw_cats.filter((raw_cat)=>raw_cat.parent !== null && raw_cat.parent._path.segments[1] === cat.id).map((raw_cat)=>{
            return {
                id: raw_cat.id,
                area: null,
                budget: raw_cat.budget,
                name: raw_cat.name,
                parent: cat,
                tags: raw_cat.tags,
                subs: null,
                ts: raw_cat.ts,
                transfer_state: 0
            };
        });
        cat.subs.sort((a, b)=>a.name.localeCompare(b.name));
    });
    cats.sort((a, b)=>a.area.name.localeCompare(b.area.name) || a.name.localeCompare(b.name));
    return cats;
}
function knit_sources(raw_sources) {
    return raw_sources.map((raw_source)=>{
        return {
            id: raw_source.id,
            ts: raw_source.ts,
            name: raw_source.name
        };
    });
}
function knit_tags(areas, raw_tags) {
    return raw_tags.map((raw_tag)=>{
        const area = areas.find((area)=>area.id === raw_tag.area._path.segments[1]);
        return {
            id: raw_tag.id,
            ts: raw_tag.ts,
            name: raw_tag.name,
            area
        };
    });
}
function knit_payments(sources, raw_payments) {
    const processed_payments = raw_payments.map((rp)=>{
        rp.source = sources.find((s)=>{
            if (rp.payment_source === null) return false;
            return rp.payment_source._path.segments[1] === s.id;
        });
        rp.cat = null; // not dealing with this yet
        return rp;
    });
    return processed_payments;
}
function knit_transactions(cats, sources, tags, raw_transactions) {
    const transactions = raw_transactions.map((raw_transaction)=>{
        let trcat = null;
        let trarea = null;
        for (const cat of cats){
            const subcat_match = cat.subs?.find((subcat)=>subcat.id === raw_transaction.cat._path.segments[1]);
            if (subcat_match) {
                trcat = subcat_match;
                trarea = cat.area;
                break;
            }
        }
        const trsource = sources.find((source)=>source.id === raw_transaction.source._path.segments[1]);
        const trtags = raw_transaction.tags.map((t)=>tags.find((tag)=>tag.id === t._path.segments[1]));
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
function knit_monthsnapshots(raw_snaps, areas) {
    return raw_snaps.map((raw_source)=>{
        return {
            ...raw_source,
            area: areas.find((area)=>area.id === raw_source.area._path.segments[1])
        };
    });
}
function get_months(month_end, count) {
    const months = [];
    for(let i = 0; i < count; i++){
        months.push(new Date(month_end));
        month_end.setUTCMonth(month_end.getUTCMonth() - 1);
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
        end_of_last_month.setUTCMonth(end_of_last_month.getUTCMonth() + 1);
        const end_of_last_month_ts = end_of_last_month.getTime() - 1000;
        daterange.begin = Math.floor(filter.daterange[0].getTime() / 1000);
        daterange.end = Math.floor(end_of_last_month_ts / 1000);
    }
    return transactions.filter((transaction)=>{
        if (filter.area && transaction.area !== filter.area) {
            return false;
        }
        if (filter.cat && transaction.cat !== filter.cat) {
            return false;
        }
        if (filter.cattags && filter.cattags.length && !transaction.cat.tags.some((t)=>filter.cattags.includes(t))) {
            return false;
        }
        if (filter.parentcat && transaction.cat.parent !== filter.parentcat) {
            return false;
        }
        if (filter.source && transaction.source !== filter.source) {
            return false;
        }
        if (filter.tags && !filter.tags.every((tag)=>transaction.tags.find((t_tag)=>t_tag === tag))) {
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
    return transactions.sort((a, b)=>{
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
            return sort_direction === "asc" ? a.tags.join().localeCompare(b.tags.join()) : b.tags.join().localeCompare(a.tags.join());
        }
        if (sort_by === "ts") {
            return sort_direction === "asc" ? a.ts - b.ts : b.ts - a.ts;
        }
        return 0;
    });
}
function current_month_of_filtered_transactions(filtered_transactions, month) {
    const m = new Date(month);
    const month_start_ts = m.getTime() / 1000;
    const month_end_ts = m.setUTCMonth(m.getUTCMonth() + 1) / 1000 - 1;
    const daterange = {
        begin: Math.floor(month_start_ts),
        end: Math.floor(month_end_ts)
    };
    return filtered_transactions.filter((transaction)=>{
        return transaction.ts >= daterange.begin && transaction.ts < daterange.end;
    });
}
function catcalcs(transactions, filter_area, filter_cattags, cats, months) {
    const all_catcalcs = [];
    const months_ts = months.map((month)=>{
        const start = Math.floor(month.getTime() / 1000);
        const end_d = new Date(month);
        end_d.setUTCMonth(end_d.getUTCMonth() + 1);
        const end = Math.floor(end_d.getTime() / 1000) - 1;
        return {
            start,
            end
        };
    });
    const filteredcats = cats.filter((cat)=>{
        if (cat.area !== filter_area) {
            return false;
        }
        const isofarea = cat.area === filter_area;
        if (filter_cattags.length === 0) return isofarea;
        const has_filter_a_cattag = cat.subs?.some((subcat)=>{
            return subcat.tags.some((t)=>{
                return filter_cattags.includes(t);
            });
        });
        return has_filter_a_cattag;
    });
    for (const cat of filteredcats){
        const catcalc = {
            cat,
            subs: [],
            sums: [],
            budget: 0,
            med: 0,
            avg: 0
        };
        const filtered_sub_cats = cat.subs.filter((cat)=>{
            if (filter_cattags.length === 0) {
                return true;
            }
            return cat.tags.some((t)=>filter_cattags.includes(t));
        });
        for (const subcat of filtered_sub_cats){
            const subcatcalc = {
                cat: subcat,
                subs: null,
                sums: [],
                budget: subcat.budget,
                med: 0,
                avg: 0
            };
            for(let m = 0; m < months_ts.length; m++){
                const month_ts = months_ts[m];
                const filtered_transactions = transactions.filter((transaction)=>{
                    return transaction.cat === subcat && transaction.ts > month_ts.start && transaction.ts < month_ts.end;
                });
                const sum = filtered_transactions.reduce((acc, transaction)=>{
                    return acc + transaction.amount;
                }, 0);
                subcatcalc.sums.push(sum);
            }
            const sorted_sums_desc = subcatcalc.sums.slice().sort((a, b)=>b - a);
            subcatcalc.med = sorted_sums_desc[Math.floor(sorted_sums_desc.length / 2)];
            subcatcalc.avg = subcatcalc.sums.reduce((acc, sum)=>{
                return acc + sum;
            }, 0) / subcatcalc.sums.length;
            catcalc.subs.push(subcatcalc);
        }
        catcalc.budget = catcalc.subs.reduce((acc, subcatcalc)=>{
            return acc + subcatcalc.budget;
        }, 0);
        all_catcalcs.push(catcalc);
    }
    for (const catcalc of all_catcalcs){
        const sums = [];
        for(let i = 0; i < months_ts.length; i++){
            let sum = 0;
            for (const subcatcalc of catcalc.subs){
                sum += subcatcalc.sums[i];
            }
            sums.push(sum);
        }
        catcalc.sums = sums;
        const sorted_sums_desc = catcalc.sums.slice().sort((a, b)=>b - a);
        catcalc.med = sorted_sums_desc[Math.floor(sorted_sums_desc.length / 2)];
        catcalc.avg = catcalc.sums.reduce((acc, sum)=>{
            return acc + sum;
        }, 0) / catcalc.sums.length;
    }
    return all_catcalcs;
}
function totals(catcalcs, filter) {
    const catcalcs_f = catcalcs.filter((cc)=>{
        const a = cc.cat.area === filter.area;
        const t = cc.cat.subs.some((subcat)=>subcat.tags.some((t)=>filter.cattags.includes(t)));
        return a && t;
    });
    let budget = catcalcs_f.reduce((acc, catcalc)=>{
        return acc + catcalc.budget;
    }, 0);
    const sums = catcalcs_f[0] ? catcalcs[0].sums.map((_)=>{
        return 0;
    }) : [];
    for (const catcalc of catcalcs_f){
        for(let i = 0; i < catcalc.sums.length; i++){
            sums[i] += catcalc.sums[i];
        }
    }
    const med = sums.slice().sort((a, b)=>b - a)[Math.floor(sums.length / 2)];
    const avg = sums.reduce((acc, sum)=>{
        return acc + sum;
    }, 0) / sums.length;
    return {
        sums,
        budget,
        med,
        avg
    };
}
function monthsnapshot(date, area, cats, transactions, previous_static_monthsnapshots) {
    const clonedate = new Date(date);
    clonedate.setUTCDate(15) // middle of the month so our monthstr doesnt slip into the past month because of timezone offset when using toISOString
    ;
    const monthstr = clonedate.toISOString().slice(0, 7);
    const msp = previous_static_monthsnapshots.find((ms)=>ms.area === area && ms.month === monthstr);
    const totals = month_totals(area, transactions, date);
    if (msp) {
        return {
            area: msp.area,
            month: msp.month,
            bucket: msp.bucket,
            budget: msp.budget,
            savings: msp.savings,
            total: totals.total,
            quad4total: totals.quad4total,
            quad123total: totals.quad123total
        };
    } else {
        const budget = month_budget_total(area, cats);
        return {
            area,
            month: monthstr,
            bucket: area.bucket,
            budget,
            savings: area.ynab_savings,
            ...totals
        };
    }
}
function month_totals(area, transactions, month) {
    const clonedate = new Date(month);
    const rangetimestart = Math.floor(clonedate.getTime() / 1000);
    const rangetimeend = Math.floor(clonedate.setUTCMonth(clonedate.getUTCMonth() + 1) / 1000);
    const filtered_transactions = transactions.filter((t)=>t.area === area && t.ts >= rangetimestart && t.ts < rangetimeend);
    const quad4transactions = filtered_transactions.filter((t)=>t.cat.tags.includes(4));
    const total = Math.round(filtered_transactions.reduce((a, b)=>a + b.amount, 0));
    const quad4total = Math.round(quad4transactions.reduce((a, b)=>a + b.amount, 0));
    const quad123total = total - quad4total;
    return {
        total,
        quad4total,
        quad123total
    };
}
function month_budget_total(area, cats) {
    let budget_total = 0;
    cats.filter((c)=>c.area === area).forEach((cat)=>{
        budget_total += cat.subs?.reduce((a, b)=>a + b.budget, 0);
    });
    return budget_total;
}
export { knit_all, knit_areas, knit_cats, knit_sources, get_months, filter_transactions, sort_transactions, current_month_of_filtered_transactions, catcalcs, totals, monthsnapshot };
