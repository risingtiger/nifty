

//type bool  = boolean; type str  = string; type int  = number;

type SERVER_MAINS_T = { app:any, db:any, Firestore:any, sheets:any, notifications:any, sse:any, appversion:number, validate_request:(res:any, req:any)=>Promise<string> }
const SERVER_MAINS:SERVER_MAINS_T = { app:{}, db:{}, Firestore:{}, sheets:{}, notifications:{}, sse:{}, appversion: 0, validate_request: (_req:any) => Promise.resolve("") }

import Finance from "./finance.js"
import Admin_Firestore from "./admin/admin_firestore.js"




function Set_Server_Mains(app:any, db:any, Firestore:any, sheets:any, notifications:any, sse:any, appversion:number, validate_request:any) {
    SERVER_MAINS.app = app 
    SERVER_MAINS.db = db
    SERVER_MAINS.Firestore = Firestore
    SERVER_MAINS.sheets = sheets
    SERVER_MAINS.notifications = notifications
    SERVER_MAINS.sse = sse
    SERVER_MAINS.appversion = appversion
    SERVER_MAINS.validate_request = validate_request
}




function Set_Routes() {

    SERVER_MAINS.app.get(  '/api/xen/finance/grab_em',                                        grab_em)       
    SERVER_MAINS.app.get(  '/api/xen/finance/ynab_sync_categories',                           finance_ynab_sync_categories)       
    SERVER_MAINS.app.get(  '/api/xen/finance/get_ynab_raw_transactions',                      get_ynab_raw_transactions)
    SERVER_MAINS.app.post(  '/api/xen/finance/save_transactions_and_delete_ynab_records',     finance_save_transactions_and_delete_ynab_records)
    SERVER_MAINS.app.post(  '/api/xen/finance/save_month_snapshots',                          finance_save_month_snapshots)

    SERVER_MAINS.app.get(  '/api/xen/admin/firestore_misc_update',                            admin_firestore_misc_update)
}




// -- ROUTE HANDLERS --

async function grab_em(req:any, res:any) {

    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const r = await Finance.Grab_Em(SERVER_MAINS.db, SERVER_MAINS.Firestore)

    res.status(200).send(JSON.stringify(r))
}




async function finance_ynab_sync_categories(req:any, res:any) {
    
    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const categories = await Finance.YNAB_Sync_Categories(SERVER_MAINS.db, SERVER_MAINS.Firestore)
    res.status(200).send(JSON.stringify(categories))
}




async function get_ynab_raw_transactions(req:any, res:any) {
    
    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const response = await Finance.Get_YNAB_Raw_Transactions(SERVER_MAINS.db)
    res.status(200).send(JSON.stringify(response))
}




async function finance_save_transactions_and_delete_ynab_records(req:any, res:any) {

    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const r = await Finance.Save_Transactions_And_Delete_YNAB_Records(SERVER_MAINS.db, req.body)

    res.status(200).send(JSON.stringify(r))
}




async function finance_save_month_snapshots(req:any, res:any) {

    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const r = await Finance.Save_Month_Snapshots(SERVER_MAINS.db, req.body)

    res.status(200).send(JSON.stringify(r))
}




async function admin_firestore_misc_update(req:any, res:any) {
    
    if (! await SERVER_MAINS.validate_request(res, req)) return 

    const results = await Admin_Firestore.Misc_Update(SERVER_MAINS.db)
    res.status(200).send(JSON.stringify(results))
}












const PROJECTID   = "xenition"
const LOCALPORT   = 3002
const KEYJSONFILE = "/Users/dave/.ssh/xenition_local.json"
const SHEETS_KEYJSONFILE = "/Users/dave/.ssh/xenition-sheets-244e0733ca64.json"
const IDENTITY_PLATFORM_API = "AIzaSyDfXcwqyiRGGO6pMBsG8CvNEtDIhdspKRI"

export default { PROJECTID, LOCALPORT, KEYJSONFILE, IDENTITY_PLATFORM_API, SHEETS_KEYJSONFILE, Set_Server_Mains, Set_Routes};


