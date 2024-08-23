
type str = string;

let   INDEXEDDB_DBNAME = "";
let   INDEXEDDB_DBVERSION = 0;
let   INDEXEDDB_DBRequest: IDBOpenDBRequest|null;
let   INDEXEDDB_DB: IDBDatabase|null;

let INDEXEDDB_STORES:str[] = []




function Init(store_names: str[], firebasename: str, dbversion: int) {   
    INDEXEDDB_STORES = store_names   
    INDEXEDDB_DBNAME = firebasename
    INDEXEDDB_DBVERSION = dbversion
}




function New_Tx(store_names: str[], mode: "readwrite"|"readonly") {

    return new Promise<IDBTransaction>(async (res, _rej) => {

        await bootup_if_not_already()

        const transaction = INDEXEDDB_DB!.transaction(store_names, mode, { durability: "relaxed" })

        res(transaction)
    })
}




function Remove() {

    return new Promise(async (res, _rej) => {

        if (INDEXEDDB_DB)
            INDEXEDDB_DB.close()

        INDEXEDDB_DB = null
        INDEXEDDB_DBRequest = null

        indexedDB.deleteDatabase(INDEXEDDB_DBNAME)

        setTimeout(() => {
            res(true)
        }, 1000)
    })
}




function redirect_from_error(errmsg:str) {
    
    console.info(`/?errmsg=InfluxDB Error: ${errmsg}`)

    if ((window as any).APPVERSION > 0) {
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

                INDEXEDDB_DB!.onerror = (event:any) => {
                    redirect_from_error("Database error: " + event.target.errorCode)
                }

                res(true)
            }

            INDEXEDDB_DBRequest.onupgradeneeded = (event: any) => {
                console.log("Upgrading IndexedDB database")
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





export default { New_Tx, Remove, Init }

