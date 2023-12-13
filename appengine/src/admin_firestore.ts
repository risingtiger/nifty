






const UPDATEDMACHINES = [
    {
        "mchId": "0423",
        "latlon": [
            "39.977404",
            "-111.7759179"
        ],
        "storeid": "0657",
        "clientid": "1000010",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "2412",
        "latlon": [
            "39.977404",
            "-111.7759179"
        ],
        "storeid": "WF172",
        "clientid": "1000032",
        "unfindable": false,
        "hasprocessed": false
    },
    {
        "mchId": "0408",
        "latlon": [
            "35.5469066",
            "-105.9056213"
        ],
        "storeid": "0887",
        "clientid": "9824",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0431",
        "latlon": [
            "39.977404",
            "-111.7759179"
        ],
        "storeid": "0473",
        "clientid": "1000020",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0139",
        "latlon": [
            "28.1393788",
            "-82.358205"
        ],
        "storeid": "0630",
        "clientid": "9747",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0429",
        "latlon": [
            "39.977404",
            "-111.7759179"
        ],
        "storeid": "0468",
        "clientid": "1000015",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "2407",
        "latlon": [],
        "storeid": "0166",
        "clientid": "0009799",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0396",
        "latlon": [
            "35.5469066",
            "-105.9056213"
        ],
        "storeid": "0648",
        "clientid": "9816",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0071",
        "latlon": [
            "35.1307145",
            "-106.5155657"
        ],
        "storeid": "0703",
        "clientid": "0000242",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0365",
        "latlon": [
            "26.5304984",
            "-80.1471021"
        ],
        "storeid": "0632",
        "clientid": "0009780",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0394",
        "latlon": [
            "35.5469066",
            "-105.9056213"
        ],
        "storeid": "0046",
        "clientid": "0009814",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "2326",
        "latlon": [
            "32.8430421",
            "-97.2350318"
        ],
        "storeid": "0126",
        "clientid": "0009430",
        "unfindable": false,
        "hasprocessed": true
    },
    {
        "mchId": "0432",
        "latlon": [
            "39.977404",
            "-111.7759179"
        ],
        "storeid": "0000",
        "clientid": "1000029",
        "unfindable": true,
        "hasprocessed": true
    },
    {
        "mchId": "0363",
        "latlon": [
            "25.6843653",
            "-80.3995261"
        ],
        "storeid": "0638",
        "clientid": "9785",
        "unfindable": false,
        "hasprocessed": true
    }
]







//type str = string; //type int = number; type bool = boolean;

//import fetch from "node-fetch";
import {FieldValue} from "@google-cloud/firestore"
//import fs from "fs";


const Admin_Firestore_Update_Collection_Docs = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {

        const machines_collection = db.collection("machines")

        const machines_snapshot = await machines_collection.get()

        const docs = machines_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        let batch        = db.batch()

        let count = 0

        for (const updatedmachine of UPDATEDMACHINES) {

            const doc = docs.find((m: any) => m.mchId === updatedmachine.mchId)

            if (!doc){
                continue
            }

            count++

            const lat = parseFloat(updatedmachine.latlon[0])
            const lon = parseFloat(updatedmachine.latlon[1])
            const clientid = updatedmachine.clientid.padStart(7, "0")

            batch.update(machines_collection.doc(doc.id), { 

                "store.latlon": [lat, lon],
                "store.id": updatedmachine.storeid,
                clientid: clientid,
            })
        }

        console.info("count ", count)

        /*
        for (let doc of docs) {
            batch.update(machines_collection.doc(doc.id), { "clientid": "0000000" })
        }
        */

        //batch.update(machines_collection.doc(doc.id), { twillio_phones: FieldValue.delete() })

        await batch.commit().catch((er:any)=> console.error(er))

        res({return_str:"Done Updating Collection Docs"})
  })

}



const Update_Collection_Docs_arch = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {

        const pers_cats_collection = db.collection("pers_cats")
        const rtm_cats_collection = db.collection("rtm_cats")

        const pers_sources_collection = db.collection("pers_sources")
        const rtm_sources_collection = db.collection("rtm_sources")

        const pers_transactions_collection = db.collection("pers_transactions")
        const rtm_transactions_collection = db.collection("rtm_transactions")

        const old_transactions_collection = db.collection("transaction")




        const pers_cats_snapshot = await pers_cats_collection.get()
        const pers_cats_docs = pers_cats_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const rtm_cats_snapshot = await rtm_cats_collection.get()
        const rtm_cats_docs = rtm_cats_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const pers_sources_snapshot = await pers_sources_collection.get()
        const pers_sources_docs = pers_sources_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const rtm_sources_snapshot = await rtm_sources_collection.get()
        const rtm_sources_docs = rtm_sources_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const old_transactions_snapshot = await old_transactions_collection.get()
        const old_transactions_docs = old_transactions_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        /*
        const pers_transactions_snapshot = await pers_transactions_collection.get()
        const pers_transactions_docs = pers_transactions_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        const rtm_transactions_snapshot = await rtm_transactions_collection.get()
        const rtm_transactions_docs = rtm_transactions_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        */

        let batch        = db.batch()

        let pers_cats_docs_ids = pers_cats_docs.map((m: any) => m.id)
        let rtm_cats_docs_ids = rtm_cats_docs.map((m: any) => m.id)

        let pers_sources_docs_ids = pers_sources_docs.map((m: any) => m.id)
        let rtm_sources_docs_ids = rtm_sources_docs.map((m: any) => m.id)

        let pers_count = 0;
        let rtm_count = 0;
        let total_count = 0;

        const newdocs = []
        for (let doc of old_transactions_docs) {

            const area = pers_cats_docs_ids.includes(doc.cat.id) ? "pers" : rtm_cats_docs_ids.includes(doc.cat.id) ? "rtm" : null

            delete doc.id
            doc.tags = []

            if (area === null){
                console.info("transaction doesnt have a matching cat in either pers or rtm")
                continue
            } else if (area === "pers"){
                doc.cat = pers_cats_docs.find((m: any) => m.id === doc.cat.id).id   
                doc.source = pers_sources_docs.find((m: any) => m.id === doc.source.id)?.id || "ZD2kREyTHdjC2rhxWeBL"   
                const newdoc = pers_transactions_collection.doc()
                batch.set(newdoc, doc)
                pers_count++
            } else if (area === "rtm"){
                doc.cat = rtm_cats_docs.find((m: any) => m.id === doc.cat.id).id
                doc.source = rtm_sources_docs.find((m: any) => m.id === doc.source.id)?.id || "ZD2kREyTHdjC2rhxWeBL"
                const newdoc = rtm_transactions_collection.doc()
                batch.set(newdoc, doc)
                rtm_count++
            }

            total_count++
            newdocs.push(doc) 


            /*
            if (array.includes(doc.parent.id)){
                const newdoc = rtm_cats_collection.doc(doc.id)
                batch.set(newdoc, {
                    modts: Math.round(Date.now() / 1000),
                    name: doc.name,
                    parent: doc.parent.id,
                })
            }
            */

            //let mod_doc = collection.doc(doc.id)

            //let mod_obj = {
            //   "modts": 1697302721,
            //}

            /*
            const pers_newdoc = pers_sources_collection.doc(doc.id)
            const rtm_newdoc = rtm_sources_collection.doc(doc.id)

            batch.set(pers_newdoc, {
                modts: Math.round(Date.now() / 1000),
                name: doc.name,
            })
            batch.set(rtm_newdoc, {
                modts: Math.round(Date.now() / 1000),
                name: doc.name,
            })
            */

            /*
            if (doc.parent?.id){
                const newdoc = pers_cats_collection.doc(doc.id)

                batch.set(newdoc, {
                    modts: Math.round(Date.now() / 1000),
                    name: doc.name,
                    parent: doc.parent.id,
                })
            }
            */

            //x += `"${doc.id}", `
        }

        //console.info(x)

        //fs.writeFileSync("/Users/dave/Desktop/pers_cat.json", JSON.stringify(x, null,1))

        await batch.commit().catch((er:any)=> console.error(er))



        res({return_str:"Done Updating Collection Docs"})

  })

}




const Admin_Firestore_Misc_Get = async (db: any) => {

    return new Promise<any>(async (res, _rej)=> {
        
        const machines_collection = db.collection("machines")

        const machines_snapshot = await machines_collection.get()

        const machines = machines_snapshot.docs.map((m: any) => ({ id: m.id, ...m.data() }));

        let objarray = []

        for(const machine of machines){

            if (machine.mchId !== "0000" && machine.clientid === "0000000") {
                objarray.push({
                    chip: machine.chip,
                    mchId: machine.mchId,
                    storeid: machine.store.id
                })
            }
        }

        console.log(JSON.stringify(objarray, null, 2))

        res(objarray)
    })
}




/*
const Update_Firestore_Machine_Statuses = async (db: any) => {
  const machinesCollection = db.collection("machines");

  const allMachineDocs = await machinesCollection.get();

  const machines = allMachineDocs.docs.map((m: any) => ({ id: m.id, ...m.data() }));


  machines.forEach(async (m: any) => {
    let doc = machinesCollection.doc(m.id);

    const allSatuses = await doc.collection("statuses").get();
    let x = 0;

    allSatuses.docs.forEach(async (s: any) => {
      let sdoc = doc.collection("statuses").doc(s.id);
      let sData = s.data();
      let type = "n";
      x++;

      if (sData.startup) {
        type = "s";
      } else if (sData.day) {
        type = "d";
      }

      let moddoc = { type }


      let batch        = db.batch()

      batch.update(sdoc, moddoc)

      batch.commit()
        .then(()=> {
          console.info("all good")
        })
        .catch((er:any)=> {
          console.info(er)
        })
      });

    console.info(x);

  });
}
*/



export { Admin_Firestore_Update_Collection_Docs, Admin_Firestore_Misc_Get };


