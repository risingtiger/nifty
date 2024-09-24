let DBNAME = "";
let DBVERSION = 0;
let STORE_METAS = [];
function Init(store_metas, db_name, db_version) {
    return new Promise(async (res, _rej)=>{
        DBNAME = db_name;
        DBVERSION = db_version;
        STORE_METAS = store_metas;
        const db = indexedDB.open(DBNAME, DBVERSION);
        db.onerror = (event)=>{
            redirect_from_error("indexeddb_access", "IndexedDB - creating/accessing IndexedDB database" + event.target.errorCode);
        };
        db.onsuccess = async (event)=>{
            event.target.result.onerror = (event)=>{
                redirect_from_error("indexeddb_database", "IndexedDB Error - " + event.target.errorCode);
            };
            event.target.result.close();
            res(true);
        };
        db.onupgradeneeded = (event)=>{
            for (const store_name of store_metas.map((s)=>s.name)){
                event.target.result.createObjectStore(store_name, {
                    keyPath: "id"
                });
            }
        };
    });
}
function GetAll(store_names) {
    return new Promise(async (res, _rej)=>{
        const store_metas = STORE_METAS.filter((s)=>store_names.includes(s.name));
        const store_datas = new Map();
        const openRequest = indexedDB.open(DBNAME, DBVERSION);
        openRequest.onerror = (event)=>{
            redirect_from_error("indexeddb_open", "IndexedDB - opening" + event.target.errorCode);
        };
        openRequest.onsuccess = async (event)=>{
            event.target.result.onerror = (event_s)=>{
                redirect_from_error("indexeddb_request", "IndexedDB Request - " + event_s.target.errorCode);
            };
            const db = openRequest.result;
            const store_names = store_metas.map((s)=>s.name);
            const transaction = db.transaction(store_names, 'readonly');
            for (const s of store_names){
                const store = transaction.objectStore(s);
                const getAllRequest = store.getAll();
                getAllRequest.onerror = (event_s)=>{
                    redirect_from_error("indexeddb_getallrequest", "IndexedDB getAll - " + event_s.target.errorCode);
                };
                getAllRequest.onsuccess = (_event)=>{
                    const data = getAllRequest.result;
                    store_datas.set(s, data);
                };
            }
            transaction.oncomplete = ()=>{
                db.close();
                res(store_datas);
            };
            transaction.onerror = (event_s)=>{
                redirect_from_error("indexeddb_transaction", "IndexedDB Transaction - " + event_s.target.errorCode);
            };
        };
    });
}
function redirect_from_error(errmsg, errmsg_long) {
    localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long);
    window.location.href = `/index.html?errmsg=${errmsg}`;
}
window.IndexedDB = {
    GetAll
};
export default {
    Init,
    GetAll
};
