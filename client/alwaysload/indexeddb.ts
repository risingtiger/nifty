
import { str } from "../../defs.js";
import { IndexedDBStoreMetaT } from "../defs_client.js";


let DBNAME:str = ""
let DBVERSION:int = 0
let STORE_METAS:IndexedDBStoreMetaT[] = []



function Init(store_metas: IndexedDBStoreMetaT[], db_name: str, db_version: int) {   

    return new Promise(async (res, _rej) => {

		DBNAME = db_name
		DBVERSION = db_version
		STORE_METAS = store_metas

		const db = indexedDB.open(DBNAME, DBVERSION)

		db.onerror = (event:any) => { 
			redirect_from_error("indexeddb_access","IndexedDB - creating/accessing IndexedDB database" + event.target.errorCode)
		}

		db.onsuccess = async (event: any) => {
			event.target.result.onerror = (event:any) => {
				redirect_from_error("indexeddb_database","IndexedDB Error - " + event.target.errorCode)
			}
			event.target.result.close()
			res(true)
		}

		db.onupgradeneeded = (event: any) => {
			for (const store_name of store_metas.map((s) => s.name)) {
				event.target.result.createObjectStore(store_name, { keyPath: "id" })
			}
		}
	})
}




function GetAll(store_names: str[]) {   

    return new Promise<Map<string, any[]>>(async (res, _rej) => {

		const store_metas = STORE_METAS.filter((s) => store_names.includes(s.name))

		const store_datas:Map<string, any[]> = new Map()

		const openRequest = indexedDB.open(DBNAME, DBVERSION);

		openRequest.onerror = (event:any) => {
			redirect_from_error("indexeddb_open","IndexedDB - opening" + event.target.errorCode)
		};

		openRequest.onsuccess = async (event:any) => {

			event.target.result.onerror = (event_s:any) => {
				redirect_from_error("indexeddb_request","IndexedDB Request - " + event_s.target.errorCode)
			}

			const db = openRequest.result;

			const store_names = store_metas.map((s) => s.name)
			const transaction = db.transaction(store_names, 'readonly');

			for (const s of store_names) {
				const store = transaction.objectStore(s);
				const getAllRequest = store.getAll();

				getAllRequest.onerror = (event_s:any) => {
					redirect_from_error("indexeddb_getallrequest","IndexedDB getAll - " + event_s.target.errorCode)
				};

				getAllRequest.onsuccess = (_event) => {
					const data = getAllRequest.result;
					store_datas.set(s, data)
				};

			}

			transaction.oncomplete = () => {
				db.close()
				res(store_datas)	
			}

			transaction.onerror = (event_s:any) => {
				redirect_from_error("indexeddb_transaction","IndexedDB Transaction - " + event_s.target.errorCode)
			}
		};
	})
}




function redirect_from_error(errmsg:str, errmsg_long:str) {
	localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long)
	if (window.location.protocol === "https:") {
		window.location.href = `/index.html?errmsg=${errmsg}`; 
	} else {
		throw new Error(errmsg + " -- " + errmsg_long)
	}
}



if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).IndexedDB = { Init, GetAll };

