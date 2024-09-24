function Retrieve(paths, param_opts) {
    return new Promise(async (res, _rej)=>{
        paths = Array.isArray(paths) ? paths : [
            paths
        ];
        const opts = set_all_options_from_opts(paths, param_opts);
        const fetch_results = await firestore_fetch_paths(paths, opts);
        res(fetch_results);
    });
}
function Add(path, newdocs) {
    return new Promise(async (res, _rej)=>{
        const body = {
            path,
            newdocs
        };
        const opts = {
            method: 'POST',
            body: JSON.stringify(body)
        };
        await FetchLassie('/api/firestore_add', opts, null);
        res({
            result_str: "ok"
        });
    });
}
function Patch(paths, data, param_opts) {
    return new Promise(async (res, _rej)=>{
        const body = {
            paths,
            opts: param_opts,
            data
        };
        const opts = {
            method: "POST",
            body: JSON.stringify(body)
        };
        const fetch_results = await FetchLassie('/api/firestore_patch', opts, null);
        res(fetch_results);
    });
}
function set_all_options_from_opts(paths, popts) {
    const o = !popts ? paths.map(()=>({})) : Array.isArray(popts) ? popts : paths.map(()=>popts);
    const opts = paths.map((_p, i)=>{
        return o[i] ? o[i] : o[o.length - 1];
    });
    const options = opts.map((pgo, _i)=>{
        return {
            limit: pgo.limit ? pgo.limit : null,
            order_by: pgo.order_by ? pgo.order_by : null,
            ts: pgo.ts ? pgo.ts : null
        };
    });
    return options;
}
function firestore_fetch_paths(paths, firestoreopts) {
    return new Promise(async (res)=>{
        const body = {
            paths,
            opts: firestoreopts
        };
        const fetchopts = {
            method: "POST",
            body: JSON.stringify(body)
        };
        const fetch_results = await FetchLassie('/api/firestore_retrieve', fetchopts, null);
        res(fetch_results);
    });
}
window.Firestore = {
    Retrieve,
    Add,
    Patch
};
export default {
    Retrieve
};
