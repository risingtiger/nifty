

type str = string; type int = number; type bool = boolean;


'use strict';

import fetch from 'node-fetch';
import { getAuth } from "firebase-admin/auth";



type RetrieveOptsT = { order_by:str|null, modts:int|null, limit:int|null }
function Retrieve(db:any, pathstr:str[]|str, opts:RetrieveOptsT[]|null, id_token:str) { 

    return new Promise(async (res, _rej) => {

        await auth_request(id_token)

        const promises = []

        pathstr = Array.isArray(pathstr) ? pathstr : [pathstr]

        if (!opts) opts = [{order_by: "", modts: null, limit: null}]

        for(let i = opts.length; i < pathstr.length; i++) opts.push(opts[opts.length-1])

        for (let i = 0; i < pathstr.length; i++) {
            let d = parse_request(db, pathstr[i], opts[i].modts)

            if (opts[i].order_by) d = d.orderBy(opts[i].order_by.split(",")[0], opts[i].order_by.split(",")[1])
            if (opts[i].limit) d = d.limit(opts[i].limit)

            promises.push(d.get())
        }

        Promise.all(promises).then((results:any[])=> {
            const returns = []
            for (let i = 0; i < results.length; i++) {

                if (results[i].docs && results[i].docs.length === 0) {
                    returns.push([])
                } 

                else if (results[i].docs && results[i].docs.length) {
                    const docs = results[i].docs.map((doc:any)=> {
                        return {id: doc.id, ...doc.data()}
                    })
                    returns.push(docs)
                } 

                else {
                    returns.push({id: results[i].id, ...results[i].data()})
                }
            }
            res(returns)
        })
    })
}




function Add(db:any, path:str, newdocs:any[], id_token:str, projectname:str) {   return new Promise(async (res, rej)=> {

    await auth_request(id_token)

    const batch        = db.batch()

    for(const newdoc of newdocs) {
        const doc_ref = db.collection(path).doc()
        batch.set(doc_ref, newdoc)
    }

    await batch.commit().catch((err:any)=> { rej(err) })

    res({ok: true})
})}



function Patch(_db:any, path:str, mask:any[], data:any, id_token:str, projectname:str) {   return new Promise(async (res, rej)=> {

    await auth_request(id_token)

    const url = `https://firestore.googleapis.com/v1/projects/${projectname}/databases/(default)/documents/${path}`

    const maskstr  = "?" + mask.map(m=> `updateMask.fieldPaths=${m}`).join("&")

    const data_body = { fields: {}}

    for(const prop in data) 
        create_obj(prop, data[prop], data_body.fields)

    const fetchopts = {  
        method: 'PATCH',
        body: JSON.stringify(data_body),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${id_token}` 
        },
    }

    fetch(url + maskstr, fetchopts).then((result:any)=> {
        if (result.ok) {
            res({ok: true})
        } else {
            rej({ok: false}) 
        }
    })
    .catch((err:any)=> {
        rej(err)
    })


    function create_obj(propname:str|int, propval:any, dest:any) : any {

      if (typeof propval == "string") {
        dest[propname] = { stringValue: propval }

      } else if (typeof propval == "boolean") {
        dest[propname] = { booleanValue: propval }

      } else if (typeof propval == "number") {
        dest[propname] = { integerValue: propval }

      } else if (typeof propval == "object" && !Array.isArray(propval)) {
        dest[propname] = { mapValue: { fields: {}}}
        for(const prop in (propval as any)) {
          create_obj(prop, propval[prop], dest[propname].mapValue.fields)
        }

      } else if (typeof propval == "object" && Array.isArray(propval)) {
        dest[propname] = { arrayValue: { values: Array(propval.length)}}
        for(let i = 0; i < propval.length; i++) {
          create_obj(i, propval[i], dest[propname].arrayValue.values)
        }
      }

    }
})}




function parse_request(db:any, pathstr:str, modts:int) : any {

    const pathsplit = pathstr.split("/")
    let d = db

    for (let i = 0; i < pathsplit.length; i++) {

        if (i % 2 === 1) { // doc
            d = d.doc(pathsplit[i])

        } else { // collection

            if (pathsplit[i].includes(":")) {

                const querystr = pathsplit[i].substring(pathsplit[i].indexOf(":") + 1, pathsplit[i].length)
                const collection_name = pathsplit[i].substring(0,pathsplit[i].indexOf(":"))

                d = d.collection(collection_name)

                /*
                let valuestr = ""
                let field = {fieldPath: ""}
                */
                let field = ""
                let op = ""
                let splitquery:str[] = []
                let val:str|int|bool = 0

                if (querystr.includes("==")) {
                    splitquery = querystr.split("==")
                    field = splitquery[0]
                    op = "=="

                    if (splitquery[1] === 'true') val = true
                    else if (splitquery[1] === 'false') val = false
                    else if (splitquery[1].charAt(0) === "'") val = splitquery[1].substring(1, splitquery[1].length-1)
                    else if (splitquery[1].charAt(0) === '"') val = splitquery[1].substring(1, splitquery[1].length-1)
                    else if ( !isNaN(Number(splitquery[1])) ) val = Number(splitquery[1])
        
                    /*
                    op = "EQUAL"
                    field.fieldPath = querystr.substring(0, querystr.indexOf("=="))
                    valuestr = querystr.substring(querystr.indexOf("==") + 2)
                    */
                }
                else if (querystr.includes("<")) {
                    splitquery = querystr.split("<")
                    field = splitquery[0]
                    op = "<"
                    val = Number(splitquery[1])
                    /*
                    op = "LESS_THAN"
                    field.fieldPath = querystr.substring(0, querystr.indexOf("<"))
                    valuestr = querystr.substring(querystr.indexOf("<") + 1)
                    */
                }
                else if (querystr.includes(">")) {
                    splitquery = querystr.split(">")
                    field = splitquery[0]
                    op = ">"
                    val = Number(splitquery[1])
                    /*
                    op = "GREATER_THAN" 
                    field.fieldPath = querystr.substring(0, querystr.indexOf(">"))
                    valuestr = querystr.substring(querystr.indexOf(">") + 1)
                    */
                }
                else if (querystr.includes("<=")) {
                    splitquery = querystr.split("<=")
                    field = splitquery[0]
                    op = "<="
                    val = Number(splitquery[1])
                    /*
                    op = "LESS_THAN_OR_EQUAL"
                    field.fieldPath = querystr.substring(0, querystr.indexOf("<="))
                    valuestr = querystr.substring(querystr.indexOf("<=") + 2)
                    */
                }
                else if (querystr.includes(">=")) {
                    splitquery = querystr.split(">=")
                    field = splitquery[0]
                    op = ">="
                    val = Number(splitquery[1])
                    /*
                    op = "GREATER_THAN_OR_EQUAL"
                    field.fieldPath = querystr.substring(0, querystr.indexOf(">="))
                    valuestr = querystr.substring(querystr.indexOf(">=") + 2)
                    */
                }

                //const field = splitquery[0]
                //const op = splitquery[1]

                //if (!isNaN(Number(valuestr))) value = { integerValue: Number(valuestr) }
                //else if (valuestr === "true") value = { booleanValue: true }
                //else if (valuestr === "false") value = { booleanValue: false }
                //else value = { stringValue: valuestr }

                d = d.where(field, op, val)
            }

            else if (modts !== null) {
                d = d.collection(pathsplit[i]).where("modts", ">", modts)

            } else {
                d = d.collection(pathsplit[i])
            }
        }
    }

    return d
}




function auth_request(id_token:str) {

    return new Promise((res, _rej)=> {

        getAuth()

        .verifyIdToken(id_token)

        .then((decodedToken) => {
             res(decodedToken.uid)
        })

        .catch((_error) => {
            throw new Error("unauthorized")
        })
    })
}










const Firestore = { Retrieve, Add, Patch }
export { Firestore }




/*
function parse_response_core(obj:any) : any {

    if (obj.hasOwnProperty("integerValue")) {
        return Number(obj.integerValue);

    } else if (obj.hasOwnProperty("doubleValue")) {
        return Number(obj.doubleValue);

    } else if (obj.hasOwnProperty("stringValue")) {
        return obj.stringValue;

    } else if (obj.hasOwnProperty("booleanValue")) {
        return obj.booleanValue;

    } else if (obj.hasOwnProperty("referenceValue")) {
        const m = obj.referenceValue.match(/^projects\/.+\/databases\/\(default\)\/documents\/(.+)\/(.+)$/)
        return {collection: m[1], id: m[2]}

    } else if (obj.hasOwnProperty("arrayValue")) {
        return obj.arrayValue.values ? obj.arrayValue.values.map((m:any)=> parse_response_core(m)) : []

    } else if (obj.hasOwnProperty("mapValue")) {
        const x = {};

        for(const prop in obj.mapValue.fields) {
            x[prop] = parse_response_core(obj.mapValue.fields[prop]);
        }

        return x;
    }
}

*/



/*
function parse_response(item:any, maketype:bool) : any {

    const namesplit = item.name.split("/")
    // const collection = namesplit[namesplit.length-2]
    const d = { id: namesplit[namesplit.length-1]};


    for(const prop in item.fields) 
        d[prop] = parse_response_core(item.fields[prop]);


    if (maketype)
        // print it out

    return d;
}




function parse_response_type(items:any) : any {

    let typestr = `export type Type = { \n`;

    for(const prop in items.fields) {
        typestr += `${prop}: ${run_core(items.fields[prop])}, `;
    }

    return typestr;


    function run_core(obj:any) {

        if (obj.hasOwnProperty("integerValue")) {
            return "number \n";

        } else if (obj.hasOwnProperty("doubleValue")) {
            return "number \n";

        } else if (obj.hasOwnProperty("stringValue")) {
            return "string \n";

        } else if (obj.hasOwnProperty("booleanValue")) {
            return "bool \n";

        } else if (obj.hasOwnProperty("referenceValue")) {
            const m = obj.referenceValue.match(/^projects\/.+\/databases\/\(default\)\/documents\/(.+)\/(.+)$/)
            return `${m[1]}Type`;

        } else if (obj.hasOwnProperty("arrayValue")) {
            return run_core(obj.arrayValue.values[0]) + "[] \n";

        } else if (obj.hasOwnProperty("mapValue")) {
            let x = "{ ";

            for(const prop in obj.mapValue.fields) {
                x += prop + ": ";
                x += run_core(obj.mapValue.fields[prop]) + ",";
            }

            x += "}";

            return x;
        }
    }
}
*/

/*
    for (let i = 0; i < collections.length; i++) { 

function parse_request(db:any, pathstr:str, wherestr:str) : any {
        

        if (opts.limit[i]) opts.limit[i] = 1000

        if (opts.pageSizes[i]) query_params += `pageSize=${opts.pageSizes[i]}&`
        if (opts.orderBys[i]) query_params += `orderBy=${opts.orderBys[i]}&`

        let { urlstr, structuredQuery } = parse_request(path)

        if (structuredQuery) {

            const body = {structuredQuery}

            fetch(`${preurl}${urlstr}?${query_params}`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(body)
            })
            .then((response:any) => response.json())
            .then((json:any) => {
                if (json.error) {
                    rej(json.error)
                }
                else if (json.length > 0) {  
                    let parsed_docs = json.map((item:any)=> parse_response(item.document, true))
                    post_fetch(parsed_docs, i)
                }
            })
            .catch((err:any) => rej(err))
        }

        else {
            fetch(`${preurl}${urlstr}?${query_params}`, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
            })
            .then((response:any) => response.json())
            .then((json:any) => {
                if (json.error) {
                    rej(json.error)
                }

                else {
                    let parsed_docs = []

                    if (json.documents) {
                        parsed_docs = json.documents.map((item:any)=> parse_response(item, true)) 

                    } else {
                        parsed_docs = [parse_response(json, true)]
                    }

                    post_fetch(parsed_docs, i)
                }
            })
            .catch((err:any) => rej(err))
        }
    }


    function post_fetch(items:any[], index:int) {
        results[index].flg = true
        results[index].items = items

        if (results.every((r:any)=> r.flg)) {
            res(results.map((r:any)=> r.items))
        }
    }
    */
