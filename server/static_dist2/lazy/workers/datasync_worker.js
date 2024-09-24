var DataSyncStoreMetaStateE;
(function(DataSyncStoreMetaStateE) {
    DataSyncStoreMetaStateE[DataSyncStoreMetaStateE["EMPTY"] = 0] = "EMPTY";
    DataSyncStoreMetaStateE[DataSyncStoreMetaStateE["STALE"] = 1] = "STALE";
    DataSyncStoreMetaStateE[DataSyncStoreMetaStateE["QUELOAD"] = 2] = "QUELOAD";
    DataSyncStoreMetaStateE[DataSyncStoreMetaStateE["LOADING"] = 3] = "LOADING";
    DataSyncStoreMetaStateE[DataSyncStoreMetaStateE["LOADED"] = 4] = "LOADED";
    DataSyncStoreMetaStateE[DataSyncStoreMetaStateE["OK"] = 5] = "OK";
})(DataSyncStoreMetaStateE || (DataSyncStoreMetaStateE = {}));
self.onmessage = async (e)=>{
    switch(e.data.cmd){
        case "init":
            Updater_Init(e.data.dbname, e.data.dbversion, e.data.appversion, e.data.id_token, e.data.indexeddb_stores);
            break;
        case "subscribe":
            EventLoopen_Run(e.data.store_names, e.data.subscriber, e.data.store_metas);
            break;
        case "refresh_from_stale":
            EventLoopen_Run(null, null, e.data.store_metas);
            break;
    }
};
// EventLoopenWorker
/* ************ */ let store_metas_while_open_que = [];
function EventLoopen_Run(store_names, subscriber, store_metas) {
    console.log("hitten the event loop");
    if (store_metas_while_open_que.length === 0 && !store_names && !subscriber && store_metas && store_metas.length) {
        store_metas_while_open_que = store_metas;
    } else if (store_names && subscriber && store_metas) {
        handle_subscribe_call(store_names, subscriber, store_metas);
    }
    const queload_store_metas = store_metas_while_open_que.filter((sm)=>sm.l === 2);
    const loaded_store_metas = store_metas_while_open_que.filter((sm)=>sm.l === 4);
    if (loaded_store_metas.length) {
        handle_loaded_store_metas(loaded_store_metas);
    }
    if (queload_store_metas.length) {
        Updater_StoresToIndexeddb(queload_store_metas);
        queload_store_metas.forEach((sm)=>sm.l = 3);
    }
    const pending = store_metas_while_open_que.filter((sm)=>sm.l === 3);
    if (pending.length) {
        setTimeout(EventLoopen_Run, 100);
    } else {
        self.postMessage({
            cmd: "save_store_metas",
            store_metas: store_metas_while_open_que
        });
        store_metas_while_open_que = [];
    }
}
function handle_subscribe_call(store_names, subscriber, store_metas) {
    if (store_metas_while_open_que.length === 0) {
        store_metas_while_open_que = store_metas;
    }
    add_to_store_metas_if_not_exists(store_names, subscriber);
    const filtered_store_metas = store_metas_while_open_que.filter((sm)=>store_names.includes(sm.n));
    for (const fsm of filtered_store_metas){
        if (fsm.l === 0 || fsm.l === 1) {
            fsm.l = 2;
        }
    }
    if (filtered_store_metas.every((sm)=>sm.l === 5)) {
        self.postMessage({
            cmd: "notify_subscribers",
            subscribers: [
                subscriber
            ]
        });
    }
}
function add_to_store_metas_if_not_exists(store_names, component_path_str) {
    for (const store_name of store_names){
        let existing_store = store_metas_while_open_que.find((s)=>s.n === store_name);
        if (!existing_store) {
            const new_store = {
                n: store_name,
                s: [
                    component_path_str
                ],
                l: 0,
                ts: 0
            };
            store_metas_while_open_que.push(new_store);
            existing_store = store_metas_while_open_que[store_metas_while_open_que.length - 1];
        }
        if (!existing_store.s.includes(component_path_str)) {
            existing_store.s.push(component_path_str);
        }
    }
}
function handle_loaded_store_metas(loaded_store_metas) {
    const subscribers_to_notify = [];
    const subscribers = [
        ...new Set(loaded_store_metas.map((sm)=>sm.s).flat())
    ];
    const subscribers_map = new Map(subscribers.map((s)=>[
            s,
            store_metas_while_open_que.filter((sm)=>sm.s.includes(s))
        ]));
    for (let [subscriber, store_metas] of subscribers_map){
        if (store_metas.some((sm)=>sm.l === 4)) {
            if (store_metas.every((sm)=>sm.l === 4 || sm.l === 5)) {
                subscribers_to_notify.push(subscriber);
            }
        }
    }
    loaded_store_metas.forEach((sm)=>sm.l = 5);
    if (subscribers_to_notify.length) {
        self.postMessage({
            cmd: "notify_subscribers",
            subscribers: subscribers_to_notify
        });
    }
}
// UPDATE WORKER
/* ********** */ let DBNAME = "";
let DBVERSION = 0;
let APPVERSION = 0;
let ID_TOKEN = "";
let INDEXEDDB_STORES = [];
async function Updater_Init(dbname, dbversion, appversion, id_token, indexeddb_stores) {
    DBNAME = dbname;
    DBVERSION = dbversion;
    APPVERSION = appversion;
    ID_TOKEN = id_token;
    INDEXEDDB_STORES = indexeddb_stores;
}
async function Updater_StoresToIndexeddb(store_metas) {
    const url = "/api/firestore_retrieve";
    const paths = [];
    const opts = [];
    for (const sm of store_metas){
        const store_url = INDEXEDDB_STORES.find((s)=>s.name === sm.n).url;
        paths.push(store_url);
        opts.push({
            limit: 1000,
            order_by: "ts,desc",
            ts: sm.ts
        });
    }
    const body = {
        paths,
        opts
    };
    const fetchopts = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "appversion": APPVERSION,
            "Authorization": `Bearer ${ID_TOKEN}`
        },
        body: JSON.stringify(body)
    };
    const fr = await fetch(url, fetchopts);
    if (fr.status === 401) {
        redirect_from_error("datasync_fetch_not_authorized", "DataSync Fetch Not Authorized - " + fr.url + ": " + fr.statusText);
        return false;
    } else if (fr.status === 410) {
        redirect_from_error("datasync_fetch_out_of_date", "DataSync Fetch Out of Date - " + fr.url);
        return false;
    } else if (!fr.ok) {
        redirect_from_error("datasync_fetch_error", "DataSync Server Error - " + fr.url + ": " + fr.statusText);
        return false;
    }
    const data = await fr.json();
    await write_to_indexeddb(data, store_metas, DBNAME, DBVERSION);
    store_metas.forEach((sm)=>{
        sm.l = 4;
        sm.ts = Math.floor(Date.now() / 1000);
    });
}
function write_to_indexeddb(data, store_metas, db_name, db_version) {
    return new Promise(async (resolve, _reject)=>{
        if (!data.some((d)=>d.length > 0)) {
            resolve(true);
            return;
        }
        const request = indexedDB.open(db_name, db_version);
        request.onerror = (event)=>{
            redirect_from_error("datasync_worker_db_open_error", "datasync_worker_db_open_error: " + event.target.errorCode);
        };
        request.onsuccess = async (e)=>{
            e.target.result.onerror = (event)=>{
                redirect_from_error("datasync_worker_db_operation_error", "IndexedDB Error - " + event.target.errorCode);
            };
            const db = e.target.result;
            const tx = db.transaction(store_metas.map((s)=>s.n), "readwrite", {
                durability: "relaxed"
            });
            let are_there_any_put_errors = false;
            for (const [i, sm] of store_metas.entries()){
                if (data[i].length === 0) continue;
                const os = tx.objectStore(sm.n);
                for(let ii = 0; ii < data[i].length; ii++){
                    const db_put = os.put(data[i][ii]);
                    db_put.onerror = (_event)=>are_there_any_put_errors = true;
                }
            }
            tx.oncomplete = (_event)=>{
                if (are_there_any_put_errors) {
                    redirect_from_error("firestorelive_indexeddb_put", "Firestorelive Error putting data into IndexedDB");
                    return;
                }
                resolve(true);
            };
            tx.onerror = (_event)=>{
                redirect_from_error("firestorelive_indexeddb_put", "Firestorelive Error putting data from IndexedDB");
            };
        };
    });
}
function redirect_from_error(errmsg, errmsg_long) {
    self.postMessage({
        cmd: "error",
        errmsg,
        errmsg_long
    });
}
