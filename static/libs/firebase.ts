

import { FsQssOpts, FsQssProject } from "../definitions.js"


type str = string;   
//type int = number;   
type bool = boolean;




type Store = {
  str:str,
  itms: Array<any>
}




const stores:Array<Store> = [];




function FSQss(str:str, opts:FsQssOpts) { return new Promise<any[]>((res, rej)=> {

  // Machine > all
  // Machine > (where one | where) > (id | status == red)
  
  let store = stores.find(s=> s.str === str);

  if (store && !opts.refresh) {
    res(store.itms);
    return;
  }


  const s = str.split(">").map(v=> v.trim());


  const fetchoptions = {  
    method: 'GET',
    // headers: {
    //   'Authorization': 'Bearer aizasycdbd4fdbczbl03_m4k2mlpaidkuo32gii',
    //   'Content-Type': 'application/json',
    //   //'Origin': '',
    //   //'Host': 'api.producthunt.com'
    // }
  }
  fetch(`https://firestore.googleapis.com/v1/projects/${FsQssProject}/databases/(default)/documents/${s[0]}`, fetchoptions)
    .then(response => response.json())
    .then(data => {
      console.log("create another data sync file. and use firebase types to construct the object (making sure to hit the proper Type. Then do all stiching together here in firebase.ts for referenced documents. ... but, think about the indexedDB, so maybe you DONT want to stitch it together, but keep it has just a reference so referenced document can exist soley in indexedDB instead of memory")
      console.log("be careful! I made note in craft for NO centralized State whatsoever. It is painful and stupid usually. So, dont rush back to it with all this. firestore.ts should be able to handle any needs WITHOUT knowing of the particular database structure (aka: just as an agnostic plugin library)")
      if (store) {
        store.itms = data.documents.map((d:any)=> _fsqssParse(d, opts.mktype));
        res(store.itms);

      } else {
        let l = stores.push({str, itms:[]})

        stores[l-1].itms = data.documents.map((d:any)=> _fsqssParse(d));

        res(stores[l-1].itms);
      }
    }).catch(()=> rej());
})}




function _fsqssParse(item:any, maketype:bool = false) : any {

  const namesplit = item.name.split("/")
  const x = { id: namesplit[namesplit.length-1]};


  for(const prop in item.fields) 
    x[prop] = _fsqssParseCore(item.fields[prop]);


  if (maketype)
    console.log(_fsqssParseType(item));


  return x;
}




function _fsqssParseCore(obj:any) : any {
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
    return `${m[1]} > where one > ${m[2]}`;

  } else if (obj.hasOwnProperty("arrayValue")) {
    return obj.arrayValue.values.map((m:any)=> _fsqssParseCore(m))

  } else if (obj.hasOwnProperty("mapValue")) {
    const x = {};

    for(const prop in obj.mapValue.fields) {
      x[prop] = _fsqssParseCore(obj.mapValue.fields[prop]);
    }

    return x;

  }
}




function _fsqssParseType(items:any) : any {
  let typestr = `export type Type = { \n`;


  for(const prop in items.fields) {
    typestr += `${prop}: ${_fsqssParseTypeCore(items.fields[prop])}, `;
  }

  return typestr;
}




function _fsqssParseTypeCore(obj:any) {
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
    return _fsqssParseTypeCore(obj.arrayValue.values[0]) + "[] \n";

  } else if (obj.hasOwnProperty("mapValue")) {
    let x = "{ ";

    for(const prop in obj.mapValue.fields) {
      x += prop + ": ";
      x += _fsqssParseTypeCore(obj.mapValue.fields[prop]) + ",";
    }

    x += "}";

    return x;
  }
}




(window as any).FSQss = FSQss;



//const specifity = s[1];


// if (specifity === "all") {
//   q = collection(db, collectionName);
//
//
// } else if (specifity == "where" || specifity == "where one") {
//   const w = s[2].split(" ").map(vstr=> vstr.trim());
//   const field = w[0];
//   const comparator:any = w[1];
//   const valStr = w[2];
//   let val:bool|str|int;
//
//   if (valStr === "true")
//     val = true;
//
//   else if (valStr === "false")
//     val = false;
//
//   else if (Number(valStr) != NaN)
//     val = Number(valStr);
//
//   else
//     val = valStr;


  // if (specifity === "where") {
  //   q = query(collection(db, collectionName), where(field, comparator, val));
  //
  // } else if (specifity === "where one") {
  //   q = doc(db, collectionName, valStr);
  // }
