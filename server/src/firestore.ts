


type str = string; type int = number; type bool = boolean;

import { readFileSync, writeFileSync } from "fs"

const offlinedata_dir = process.env.NIFTY_OFFLINEDATA_DIR || ""



type RetrieveOptsT   = { order_by:str|null, ts:int|null, limit:int|null, startafter: string|null }




function Retrieve(db:any, pathstr:str[], opts:RetrieveOptsT[]|null|undefined) {   return new Promise<Array<object[]>>(async (res, _rej) => {

    const promises:any = []

    if (!opts) opts = [{ order_by: null, ts: null, limit: null, startafter: null }];

    for (let i = opts.length; i < pathstr.length; i++) {
        opts.push({ ...opts[opts.length - 1] });
    }
    opts.forEach((o: any) => {
        if (o.order_by === undefined) o.order_by = null;
        if (o.ts === undefined) o.ts = null;
        if (o.limit === undefined) o.limit = null;
        if (o.startafter === undefined) o.startafter = null;
        if (o.startafter !== null && (o.order_by === null || o.limit === null)) 
            throw new Error("When startby is set, both order_by and limit must be provided.");
    });

	if (!db) {  const r = get_jsons(pathstr, opts); res(r); return;  }


    for (let i = 0; i < pathstr.length; i++) {

        let d = parse_request(db, pathstr[i], opts[i].ts)

        if (!opts[i].ts && opts[i].order_by !== null) {

            const [field, direction] = opts[i].order_by!.split(",");

            d = d.orderBy(field, direction);

            if (opts[i].startafter !== null) {
				const doc_ref = await db.doc(opts[i].startafter).get()
                d = d.startAfter(doc_ref)
            }
        }
        if (opts[i].limit) {
            d = d.limit(opts[i].limit);
        }

        promises.push(d.get())
    }

    Promise.all(promises)
		.then((results:any[])=> {
			const returns:any = []
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
					returns.push([{id: results[i].id, ...results[i].data()}])
				}
			}
			res(returns)
		})
		.catch((err:any)=> {
			throw new Error("Error in Firestore Retrieve: " + err)
		})
})}




function Add(db:any, path:str, newdocs:any[]) {   return new Promise(async (res, _rej)=> {

    const batch        = db.batch()

    for(const newdoc of newdocs) {
        const doc_ref = db.collection(path).doc()

        // db.collection(obj[key][0]).doc(obj[key][1])

        batch.set(doc_ref, newdoc)
    }

    await batch.commit().catch((_err:any)=> { res({err:"batch commit failed"}) })

    res({ok: true})
})}




function Patch(db:any, pathstrs:str[], datas:any[], oldtses:number[]) {   return new Promise(async (res, _rej)=> {

    const promises:any[] = []

    for (let i = 0; i < pathstrs.length; i++) {
        let d = parse_request(db, pathstrs[i], null)
        datas[i].ts = Math.floor(Date.now() / 1000)
        promises.push(   d.update(datas[i])  )
    }

    Promise.all(promises).then((results:any[])=> {
        const returns:any = []
        for (let i = 0; i < results.length; i++) {
            returns.push({ok: true})
        }

        res(returns)
    })
})}




const callers:{ runid:string, paths:string[], tses:number[], startafters: Array<object|null>, isdones: boolean[] }[] = []

const GetBatch = (db:any, paths:str[], tses:number[], runid:str) => new Promise<Array<{isdone:boolean, docs:object[]}>>(async (res, _rej)=> {

	let   caller = callers.find((c:any)=> c.runid === runid)
	if (!caller)   callers.push({ runid, paths, tses, startafters: paths.map(()=> null), isdones: paths.map(()=> false) })
	caller       = caller || callers.find((c:any)=> c.runid === runid)!

	const limit_on_all         = Math.floor( 2000 / caller.paths.filter((_p:any, i:any)=> !caller.isdones[i]).length )

	const promises:Promise<any>[] = []

	for(let i = 0; i < caller.paths.length; i++) {

		const ts         = caller.tses[i] || 0
		const startafter = caller.startafters[i] || null

		const q = db.collection(caller.paths[i]).where("ts", ">", ts).orderBy("ts")

		if (startafter) q.startAfter(startafter)

		q.limit(limit_on_all)

		promises.push( q.get() )
	}

	const r = await Promise.all(promises)

	const returns:Array<{ isdone:boolean, docs:object[] }> = []

	for(let i = 0; i < r.length; i++) {
		const snapshot = r[i]

		if (snapshot.docs.length === limit_on_all) {
			caller.startafters[i] = snapshot.docs[snapshot.docs.length - 1]
			caller.isdones[i] = false
		}
		else if (snapshot.docs.length < limit_on_all) { // including if 0
			caller.startafters[i] = null
			caller.isdones[i] = true
		}

		const docs   = snapshot.docs.map((doc:any)=> ( {id: doc.id, ...doc.data() } ) )
		const isdone = caller.isdones[i]
		returns.push({ isdone, docs }) // docs array could be empty
	}

	if (caller.isdones.every(d=> d === true)) {
		callers.splice(callers.findIndex((c:any)=> c.runid === runid), 1)
	}

	res(returns)
})




function parse_request(db:any, pathstr:str, ts:int|null) : any {

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

            else if (ts !== null && i === pathsplit.length - 1) {
                d = d.collection(pathsplit[i]).where("ts", ">", ts)

            } else {
                d = d.collection(pathsplit[i])
            }
        }
    }

    return d
}




function get_jsons(pathstr:str[]|str, _opts:RetrieveOptsT[]|null) {

	const returns:any[] = []

	for (let i = 0; i < pathstr.length; i++) {

		if (pathstr[i] === "machines") {
			const f = readFileSync(offlinedata_dir + "machines.json", "utf8")	
			returns.push(JSON.parse(f))

		} else if (/^machines\/[^\s\/]+$/.test(pathstr[i])) {

			const ff = readFileSync(offlinedata_dir + "machines.json", "utf8") as string
			const fc = JSON.parse(ff) as any[];

			const id = pathstr[i].split("/")[1];	
			const machine = fc.find((m:any)=> m.id === id);
			returns.push(machine);

		} else if (/^machines\/[^\s]+\/statuses$/.test(pathstr[i])) {

			const s = readFileSync(offlinedata_dir + "statuses.json", "utf8") as string
			returns.push(JSON.parse(s))

		} else if (/^machines\/[^\s]+\/reconciles$/.test(pathstr[i])) {

			const s = readFileSync(offlinedata_dir + "reconciles.json", "utf8") as string
			returns.push(JSON.parse(s))
		}
	}

	return returns
}

function patch_jsons(pathstr:str[]|str, data:any|any[], _opts:{}[]|null) {

	for (let i = 0; i < pathstr.length; i++) {

		if (/^machines\/[^\s\/]+$/.test(pathstr[i])) {
			const f = readFileSync(offlinedata_dir + "machines.json", "utf8")	
			const fc = JSON.parse(f) as any[];
			const id = pathstr[i].split("/")[1];
			const machine = fc.find((m:any)=> m.id === id);

			for (const key in data[i]) {
				if (key.includes(".")) {
					const s = key.split(".")
					let handle = machine
					for(let ii = 0; ii < s.length; ii++) {
						handle = handle[s[ii]]
					}

					if (Array.isArray(data[i][key])) {
						for(let ii = 0; ii < data[i][key].length;ii++) {
							handle[ii] = data[i][key][ii]
						}
					} else if (typeof data[i][key] === "object") {
						for (const k in data[i][key]) {
							handle[k] = data[i][key][k]
						}
					} else {
						handle = data[i][key]
					}

				} else {
					machine[key] = data[i][key]
				}
			}

			const machines_str = JSON.stringify(fc)
			writeFileSync(offlinedata_dir + "machines.json", machines_str, "utf8")
		}
	}
}


// what is the regular expression to match any non space character?



const Firestore = { Retrieve, Add, Patch, GetBatch }
export { Firestore }










/*

// Move this into xen instance. And make proper place to store all database collection schemas


    

enum ST {
    str,
    int,
    bool,
    map,
    array_int,
    array_str,
    array_bool,
    ref
}








// currently the schema setup isnt used


const schemas = [
    {
        collection_name: "cats",
        schema: {
            area: { t: ST.ref, c: "areas", r: false },
            bucket: { t: ST.map, r: true, s: 
                {
                    diffs: { t: ST.array_int, len: 3, r: false },
                    val: { t: ST.int, r: false }
                } 
            }, 
            budget: { t: ST.int, r: false },
            name: { t: ST.str, r: true },
            parent: { t: ST.ref, c: "cats", r: false },
            ts: { t: ST.int, r: true }
        }
    },
    {
        collection_name: "areas",
        schema: {
            longname: { t: ST.str, r: true },
            name: { t: ST.str, r: true },
            ts: { t: ST.int, r: true }
        }
    }
]




function sanitize_with_schema(db:any, schema:any, obj:object) : object|false {

    const sanitized = {}

    for (const key in schema) {

        if (schema[key].t === ST.int) {

            if (obj[key] === null || obj[key] === undefined) {
                if (schema[key].r) return false
                sanitized[key] = null
                continue
            }

            if (typeof obj[key] !== "number") return false
            sanitized[key] = obj[key]

        } else if (schema[key].t === ST.str) {

            if (obj[key] === null || obj[key] === undefined) {
                if (schema[key].r) return false
                sanitized[key] = null
                continue
            }

            if (typeof obj[key] !== "string") return false
            sanitized[key] = obj[key]

        } else if (schema[key].t === ST.bool) {

            if (obj[key] === null || obj[key] === undefined) {
                if (schema[key].r) return false
                sanitized[key] = null
                continue
            }

            if (typeof obj[key] !== "boolean") return false
            sanitized[key] = obj[key]

        } else if (schema[key].t === ST.map) {

            if (obj[key] === null || obj[key] === undefined) {
                if (schema[key].r) return false
                sanitized[key] = null
                continue
            }

            if (typeof obj[key] !== "object") return false

            const inner = sanitize(db, schema[key].s, obj[key])
            if (inner === false) return false

            sanitized[key] = inner

        } else if (schema[key].t === ST.array_int || schema[key].t === ST.array_str || schema[key].t === ST.array_bool) {

            if (obj[key] === null || obj[key] === undefined) {
                if (schema[key].r) return false
                sanitized[key] = null
                continue
            }

            if (!Array.isArray(obj[key])) return false
            if (schema[key].len && obj[key].length !== schema[key].len) return false

            const typeofval = schema[key].t === ST.array_int ? "number" : schema[key].t === ST.array_str ? "string" : "boolean"
            for (const val of obj[key]) {
                if (typeof val !== typeofval) return false
            }

            sanitized[key] = obj[key]

        } else if (schema[key].t === ST.ref) {

            if (obj[key] === null || obj[key] === undefined) {
                if (schema[key].r) return false
                sanitized[key] = null
                continue
            }

            if (!Array.isArray(obj[key]) || obj[key].length !== 2 || typeof obj[key][1] !== "string") return false
            if (obj[key][0] !== schema[key].c) return false

            sanitized[key] = db.collection(obj[key][0]).doc(obj[key][1])
        }
    }

    return sanitized
}

*/




