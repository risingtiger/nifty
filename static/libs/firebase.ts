

// import { FsQssOpts } from "../definitions.js"


type str = string;   type int = number;   type bool = boolean;


export type FsQssOptsT = {
  limit: int,
  orderBy: str|null,
  mktype: bool,
  forceGetAll: bool
}
export type FsGssOptsT = {
  propa:bool,
}



function FSQss(queries:Array<str>, opts:FsQssOptsT = {forceGetAll: false, limit: 100, orderBy: null, mktype: false}) { 

  const preurl = `https://firestore.googleapis.com/v1/projects/${(window as any).__APPINSTANCE.firebase.project}/databases/(default)/documents/`

  const results:any = []

  return new Promise((res, _rej)=> {

    const fetchparams = queries.map(q=> _FSQss_getFetchParams(preurl, q))

    const orderByStr = opts.orderBy ? 'orderBy=' + opts.orderBy : ''  

    const qf = fetchparams.map(fp=> fetch(fp.fetchurl + '?pageSize=' + (opts.forceGetAll ? 300 : opts.limit) + '&' + orderByStr, fp.fetchopts).then(response => response.json()))

    Promise.all(qf)
      .then(async (qr:any[])=> {
        for(let i = 0; i < queries.length; i++) {

          if (qr[i].nextPageToken && opts.forceGetAll) 
            await _FSQss_getAllPaginatedData(fetchparams[i].fetchurl, 300, qr[i], qr[i].documents) as any

          if (qr[i].documents)
            results.push(qr[i].documents.map((d:any)=> _FSQss_parse(d, opts.mktype)))
          else
            results.push(_FSQss_parse(qr[i], opts.mktype))

          if (results.length === queries.length)
            res(results)

        }
      })
      
      .catch(_=> {
        window.location.href = "/?errmsg=firestoreLoadFail";
      })

  })

}




function FSGss(colletionName:str, docId:str, mask:any[], data:any, _opts:FsGssOptsT = {propa: false}) { 

  return new Promise(async (res, _rej)=> {

    const url = `https://firestore.googleapis.com/v1/projects/${(window as any).__APPINSTANCE.firebase.project}/databases/(default)/documents/${colletionName}/${docId}`

    const maskstr  = "?" + mask.map(m=> `updateMask.fieldPaths=${m}`).join("&")

    const dataBody = { fields: {}}

    for(const prop in data) 
      _FSGssCreateObj(prop, data[prop], dataBody.fields)

    const fetchopts = {  
      method: 'PATCH',
      body: JSON.stringify(dataBody)
      // headers: {
      //   'Authorization': 'Bearer aizasycdbd4fdbczbl03_m4k2mlpaidkuo32gii',
      //   'Content-Type': 'application/json',
      //   //'Origin': '',
      //   //'Host': 'api.producthunt.com'
      // }
    }
    fetch(url + maskstr, fetchopts)
      .then((_rq:any)=> {
        res(1)
      })
      .catch((_e:any)=> {
        //window.location.href = "/"
      })

  })

}




function _FSGssCreateObj(propname:str|int, propval:any, dest:any) : any {

  if (typeof propval == "string") {
    dest[propname] = { stringValue: propval }

  } else if (typeof propval == "boolean") {
    dest[propname] = { booleanValue: propval }

  } else if (typeof propval == "number") {
    dest[propname] = { integerValue: propval }

  } else if (typeof propval == "object" && !Array.isArray(propval)) {
    dest[propname] = { mapValue: { fields: {}}}
    for(const prop in (propval as any)) {
      _FSGssCreateObj(prop, propval[prop], dest[propname].mapValue.fields)
    }

  } else if (typeof propval == "object" && Array.isArray(propval)) {
    dest[propname] = { arrayValue: { values: Array(propval.length)}}
    for(let i = 0; i < propval.length; i++) {
      _FSGssCreateObj(i, propval[i], dest[propname].arrayValue.values)
    }
  }

}




function _FSQss_getFetchParams(preurl:str, w:str|Array<str>) : {fetchurl:str, fetchopts:any} {

  let collection:str, constriction:str|null, specifity:str|null = ""

  if (Array.isArray(w)) {
    collection = w[0]
    constriction = w[1]
    specifity = w[2]
  }

  else {
    collection = w
    constriction = null
    specifity = null
  }

  let fetchurl = preurl + ((constriction && constriction === "doc") ? collection + "/" + specifity : collection)

  const fetchopts = {  
    method: 'GET',
    // headers: {
    //   'Authorization': 'Bearer aizasycdbd4fdbczbl03_m4k2mlpaidkuo32gii',
    //   'Content-Type': 'application/json',
    //   //'Origin': '',
    //   //'Host': 'api.producthunt.com'
    // }
  }

  return {fetchurl, fetchopts}

}




function _FSQss_getAllPaginatedData(fetchurl:str, pagesize:int, dataIn:any, fillin:any[]) {

  return new Promise(async (res, _ref)=> {

    fetch(fetchurl+'?pageSize='+pagesize+'&pageToken='+dataIn.nextPageToken, {method:'GET'})
      .then(response => response.json())
      .then(async response => {

        if (response.nextPageToken) {
          await _FSQss_getAllPaginatedData(fetchurl, pagesize, response, fillin)
          fillin.push(...response.documents)
          res(1)
        }

        else {
          fillin.push(...response.documents)
          res(1)
        }
      })

  })

}








function _FSQss_parse(item:any, maketype:bool = false) : any {

  const namesplit = item.name.split("/")
  // const collection = namesplit[namesplit.length-2]
  const d = { id: namesplit[namesplit.length-1]};


  for(const prop in item.fields) 
    d[prop] = _FSQssParseCore(item.fields[prop]);


  if (maketype)
    console.log(_FSQssParseType(item));


  return d;

}




function _FSQssParseCore(obj:any) : any {

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
    return obj.arrayValue.values ? obj.arrayValue.values.map((m:any)=> _FSQssParseCore(m)) : []

  } else if (obj.hasOwnProperty("mapValue")) {
    const x = {};

    for(const prop in obj.mapValue.fields) 
      x[prop] = _FSQssParseCore(obj.mapValue.fields[prop]);

    return x;
  }

}




function _FSQssParseType(items:any) : any {

  let typestr = `export type Type = { \n`;


  for(const prop in items.fields) {
    typestr += `${prop}: ${_FSQssParseTypeCore(items.fields[prop])}, `;
  }

  return typestr;

}




function _FSQssParseTypeCore(obj:any) {

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
    return _FSQssParseTypeCore(obj.arrayValue.values[0]) + "[] \n";

  } else if (obj.hasOwnProperty("mapValue")) {
    let x = "{ ";

    for(const prop in obj.mapValue.fields) {
      x += prop + ": ";
      x += _FSQssParseTypeCore(obj.mapValue.fields[prop]) + ",";
    }

    x += "}";

    return x;
  }

}




(window as any).FSQss = FSQss;
(window as any).FSGss = FSGss;



