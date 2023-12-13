

let   INDEXEDDB_DBNAME = "";
const INDEXEDDB_DBVERSION = 1;
let   INDEXEDDB_DBRequest: IDBOpenDBRequest;
let   INDEXEDDB_DB: IDBDatabase;

let INDEXEDDB_STORES = []




function Init(store_names: str[]) {   
    INDEXEDDB_STORES = store_names   
    INDEXEDDB_DBNAME = (window as any).__APPINSTANCE.firebase.project
}




function New_Tx(store_names: str[], mode: "readwrite"|"readonly") {

    return new Promise<IDBTransaction>(async (res, _rej) => {

        await bootup_if_not_already()

        const transaction = INDEXEDDB_DB.transaction(store_names, mode, { durability: "relaxed" })

        res(transaction)
    })
}




function redirect_from_error(errmsg:str) {
    
    console.info(`/?errmsg=InfluxDB Error: ${errmsg}`)

    if (!window.location.href.includes("localhost")) {
        window.location.href = `/?errmsg=InfluxDB Error: ${errmsg}`
    }
}




function bootup_if_not_already() {

    return new Promise(async (res, _rej) => {

        if (!INDEXEDDB_DB) {
            INDEXEDDB_DBRequest = indexedDB.open(INDEXEDDB_DBNAME, INDEXEDDB_DBVERSION)

            INDEXEDDB_DBRequest.onerror = (event:any) => { 
                redirect_from_error("Error creating/accessing IndexedDB database" + event.target.errorCode)
            }

            INDEXEDDB_DBRequest.onsuccess = async (event: any) => {
                INDEXEDDB_DB = event.target.result

                INDEXEDDB_DB.onerror = (event:any) => {
                    redirect_from_error("Database error: " + event.target.errorCode)
                }

                res(true)
            }

            INDEXEDDB_DBRequest.onupgradeneeded = (event: any) => {
                const db = event.target.result

                for (const store_name of INDEXEDDB_STORES) {
                    db.createObjectStore(store_name, { keyPath: "id" })
                }
            }
        }

        else {
            res(true)
        }
    })
}






export { New_Tx, Init }

