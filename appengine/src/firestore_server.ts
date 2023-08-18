

'use strict';

import fetch from 'node-fetch';




function Firestore_Server_Get(whats:str[], opts:any, token:str) { return new Promise((res, rej) => {

    let query_params = ""

    let preurl = `https://firestore.googleapis.com/v1/projects/purewatertech/databases/(default)/documents`

    if (opts.pageSize) query_params += `pageSize=${opts.pageSize}&`
    if (opts.orderBy) query_params += `orderBy=${opts.orderBy}&`

    const results = whats.map(()=> { return { items:[], flg: false } })

    whats.forEach((what:any, i:int)=> { 
        let { urlstr, structuredQuery } = parse_request(what)

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
    })


    function post_fetch(items:any[], index:int) {
        results[index].flg = true
        results[index].items = items

        if (results.every((r:any)=> r.flg)) {
            res(results.map((r:any)=> r.items))
        }
    }
})}




function Firestore_Server_Patch(what:str, mask:any[], data:any, token:str) {   return new Promise(async (res, rej)=> {

    const url = `https://firestore.googleapis.com/v1/projects/purewatertech/databases/(default)/documents/${what}`

    const maskstr  = "?" + mask.map(m=> `updateMask.fieldPaths=${m}`).join("&")

    const data_body = { fields: {}}

    for(const prop in data) 
        create_obj(prop, data[prop], data_body.fields)

    const fetchopts = {  
        method: 'PATCH',
        body: JSON.stringify(data_body),
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
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
})}




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




function parse_request(whatstr:str) : {urlstr:str, structuredQuery:any|null} {

    let urlstr = ""
    let structuredQuery:any|null = null
    const whatsplit = whatstr.split("/")

    if (whatsplit.length % 2 === 0) { // doc
        urlstr += "/" + whatstr
    }

    else if (whatsplit.length % 2 === 1) { // collection

        if (whatstr.includes(":")) {

            //urlstr += "/" + whatstr.substring(0, whatstr.indexOf(":"))

            const querystr = whatstr.substring(whatstr.indexOf(":") + 1, whatstr.length)

            let op = ""
            let valuestr = ""
            let field = {fieldPath: ""}

            if (querystr.includes("==")) {
                op = "EQUAL"
                field.fieldPath = querystr.substring(0, querystr.indexOf("=="))
                valuestr = querystr.substring(querystr.indexOf("==") + 2)
            }
            else if (querystr.includes("<")) {
                op = "LESS_THAN"
                field.fieldPath = querystr.substring(0, querystr.indexOf("<"))
                valuestr = querystr.substring(querystr.indexOf("<") + 1)
            }
            else if (querystr.includes(">")) {
                op = "GREATER_THAN" 
                field.fieldPath = querystr.substring(0, querystr.indexOf(">"))
                valuestr = querystr.substring(querystr.indexOf(">") + 1)
            }
            else if (querystr.includes("<=")) {
                op = "LESS_THAN_OR_EQUAL"
                field.fieldPath = querystr.substring(0, querystr.indexOf("<="))
                valuestr = querystr.substring(querystr.indexOf("<=") + 2)
            }
            else if (querystr.includes(">=")) {
                op = "GREATER_THAN_OR_EQUAL"
                field.fieldPath = querystr.substring(0, querystr.indexOf(">="))
                valuestr = querystr.substring(querystr.indexOf(">=") + 2)
            }

            //if (!isNaN(Number(valuestr))) value = { integerValue: Number(valuestr) }
            //else if (valuestr === "true") value = { booleanValue: true }
            //else if (valuestr === "false") value = { booleanValue: false }
            //else value = { stringValue: valuestr }
            let value = { stringValue: valuestr }

            structuredQuery = { from: [{collectionId: 'machines'}], where:  { fieldFilter: { field, op, value } } }
            urlstr += ":runQuery"
        }

        else {
            urlstr += "/" + whatstr
        }
    }

    return { urlstr, structuredQuery }
}




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

    for(const prop in obj.mapValue.fields) 
      x[prop] = parse_response_core(obj.mapValue.fields[prop]);

    return x;
  }

}




function parse_response_type(items:any) : any {

  let typestr = `export type Type = { \n`;


  for(const prop in items.fields) {
    typestr += `${prop}: ${parse_response_type_core(items.fields[prop])}, `;
  }

  return typestr;

}




function parse_response_type_core(obj:any) {

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
    return parse_response_type_core(obj.arrayValue.values[0]) + "[] \n";

  } else if (obj.hasOwnProperty("mapValue")) {
    let x = "{ ";

    for(const prop in obj.mapValue.fields) {
      x += prop + ": ";
      x += parse_response_type_core(obj.mapValue.fields[prop]) + ",";
    }

    x += "}";

    return x;
  }

}


export { Firestore_Server_Get, Firestore_Server_Patch }


