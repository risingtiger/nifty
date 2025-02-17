

import { num, str } from "../defs_server_symlink.js"

import { 
	$NT, 
	ComponentMechanicsT, 
	ComponentMechanicsOptsT, 
	EngagementListenerTypeT, 
	FirestoreFetchResultT,
	FirestoreLoadSpecT,
	LazyLoadLoadSpecT,
    LazyLoadT,
	URIDetailT
} from "../defs.js"

import { Listen_to_Loadspecs } from "./firestore.js"
import { GetURIDetails } from "./switchstation/switchstation.js"

declare var $N: $NT;




//let _c:{lazyload:LazyLoadT, uridetails:URIDetailT}|null = null

let _lazyloads:LazyLoadT[] = []
let _data:Map<string, FirestoreFetchResultT> = new Map()
let _isgrabbingdata = false



const Init = (lazyloads_:LazyLoadT[]) => {
	_lazyloads = lazyloads_
}




const RouteChanged = (uridetails:URIDetailT, lazyload:LazyLoadT) => new Promise<void>(async (res, _rej)=> {

	console.log("RouteChanged uridetails lazyload ", uridetails, lazyload)
	 
	//_c = { lazyload, uridetails }

	if (!lazyload.loadspecs || !lazyload.loadspecs.length) { res(); return; }

	const loadspecs = lazyload.loadspecs.map(ls => {
		let path = ls.path
		for (const [key, value] of Object.entries(uridetails.params)) {
			path = path.replace(`:${key}`, `${value}`)
		}
		return {path:path, opts:ls.opts}
	})

	_isgrabbingdata = true

	const r = await datagrab(loadspecs)
	if (r === null) { _isgrabbingdata = false; res(); return; }

	for(const [key, value] of Object.entries(r)) {
		_data!.set(key, value)
	}

	Listen_to_Loadspecs(loadspecs)

	_isgrabbingdata = false

	res()
})




function FirestoreChanged() {
	console.log("firestorechanged")
}




const ConnectedCallback = async (component:HTMLElement & ComponentMechanicsT, opts?:ComponentMechanicsOptsT|undefined|null) => new Promise<void>(async (res, rej)=> {

	const rawtagname                         = component.tagName.toLowerCase()
	const tagnamesplit                       = rawtagname.split("-")
	let   type                               = ""
	let   data:any|null                      = null
	let   lazyload:LazyLoadT|null            = null
	let   loadspecs:LazyLoadLoadSpecT[]|null = null

	switch(tagnamesplit[0]) {
		case "v":  
			type = "view";      
			lazyload = _lazyloads.find(l=> l.name === tagnamesplit[1] && l.type === type) || null
			if (!lazyload) throw new Error("Lazyload not found for " + rawtagname)
			loadspecs = lazyload.loadspecs || null
			break;
		case "c":  
			type = "component"; 
			break;
		case "vp": 
			type = "viewpart"; 

			const viewsel   = document.getElementById("views") as HTMLElement
			const viewel    = viewsel.getElementsByTagName("v-"+tagnamesplit[1])[0]
			lazyload        = _lazyloads.find(l=> l.name === tagnamesplit[1] && l.type === type) as LazyLoadT
			loadspecs = lazyload.loadspecs?.filter(l=> l.els!.includes(rawtagname)) || null
			break;
	}


	if (!lazyload) throw new Error("Lazyload not found for " + rawtagname)

	if (loadspecs) {
		const uridetails = GetURIDetails() as URIDetailT

		const aloadspecs = loadspecs.map(ls => {
			let path = ls.path
			for (const [key, value] of Object.entries(uridetails.params)) {
				path = path.replace(`:${key}`, `${value}`)
			}
			const pdata = _data.get(path)
			console.log(pdata)
			return {path:path, opts:ls.opts}
		})


	}


	{
		const loadspecs = lazyload.loadspecs
		if (loadspecs && loadspecs.length) {
			data = await datagrab(loadspecs)
			if (data === null) { hydratedfailedevent(); return; }
		}

		if (component.knitdata) component.knitdata()
		component.sc()
	}
	

	//let   lhydrations:{ el:HTMLElement }[] = []

	for(const prop in component.a) component.a[prop] = component.getAttribute(prop)




	//component.sc()





	{
		if (!opts) opts      = {  }
		opts.hydrates        = opts.hydrates === undefined ? [] : opts.hydrates
		
		if ( !component.m || !component.a || !component.sc)  throw new Error("Component must have m, a and sc " + component.nodeName)
	}





	/*
	{
		lhydrations = opts.hydrates.map(l=> {
			const el = ( component as any ).shadow.querySelector(l)
			if (!el) throw new Error("Could not find element in shadow dom with selector: " + l)
			return { el }
		})
		lhydrations.forEach(l=> {
			l.el.addEventListener('hydrated', checkhydration)
			l.el.addEventListener('failed',   checkhydration)
		})
	}
	*/






	/*
	{
		const loadspecs = component.getloadspecs ? component.getloadspecs() : []
		if (loadspecs.length) {
			const r = await DataGrab(component.m, loadspecs)
			if (r === null) { hydratedfailedevent(); return; }
		}

		if (component.knitdata) component.knitdata()
		component.sc()
	}
	*/


	/*
	if (component.getloadspecs) {
		$N.Firestore.Add_Listener(
			component, 
			"component", 
			()=> component.getloadspecs ? component.getloadspecs() : [],
			(r:FirestoreFetchResultT)=> handle_firestore_listener(component, r)
		) 
	}
	*/


	$N.EngagementListen.Add_Listener(component, "component", EngagementListenerTypeT.resize, null, async ()=> {
		component.sc()
	})


	function hydratedfailedevent() {
		component.dataset.hydratestate = "err"
		component.dispatchEvent(new Event('failed'))
		rej()
	}

	/*
	component.dataset.hydratestate = "ok"
	checkhydration()
	*/	

	/*
	function checkhydration() {

		const is_any_subcomponentserr = lhydrations.some(l=> l.el.dataset.hydratestate === "err")
		if (is_any_subcomponentserr) {
			hydratedfailedevent()

		} else {
			const is_this_hydrated = component.dataset.hydratestate === "ok"
			const is_all_subs_hydrated = lhydrations.every(l=> l.el.dataset.hydratestate === "ok")

			if (is_all_subs_hydrated && is_this_hydrated) {

				component.dispatchEvent(new Event('hydrated'))
				res()

				lhydrations.forEach(l=> {
					l.el.removeEventListener('hydrated', checkhydration)
					l.el.removeEventListener('failed',   checkhydration)
				})
			}
		}
	}


	*/
})




const AttributeChangedCallback = (a:any, sc:()=>void, knitdata:( ()=>void )|null, name:string, oldval:str|boolean|number, newval:string|boolean|number, _opts?:object) => {

	console.log("REMOVE ONCE DONE TESTING. I THINK THIS WILL SHOW UP INIT OF COMPONENT. NEED TO FILTER OUT FIRST CALLS. I THINK BY TESTING FOR NULL OF OLDVAL")
	if (oldval === null) return

	a[name] = newval

	clearTimeout(a.lastupdatedtimeout)
	a.lastupdatedtimeout = setTimeout(()=> {
		if (knitdata) knitdata()
		sc()
	}, 100)
}




const datagrab = async (loadspecs:FirestoreLoadSpecT[]) => new Promise<FirestoreFetchResultT|null>(async (res, _rej)=> {

	const r = await $N.Firestore.DataGrab(loadspecs)
	if (r === null) { res(null); return; }

	res(r)

	/*
	const d = {}

	for(let i = 0; i < loadspecs.length; i++) {
		const isdoc = loadspecs[i].path.split("/").length % 2 === 0
		const m = r.get(loadspecs[i].path) as Array<object>|object
		d[loadspecs[i].name] = isdoc ? m : m[0]
	}

	res(d)
	*/
})




function handle_firestore_listener(component:HTMLElement & ComponentMechanicsT, r:FirestoreFetchResultT) {

	if (r === null) return

	const loadspecs = component.getloadspecs ? component.getloadspecs() : []

	loadspecs.forEach(l=> {
		const d = r.get(l.path) as Array<any>
		if (!d || d.length === 0) return

		if (!Array.isArray(component.m[l.name]) && d.length === 1) { // update single object

			component.m[l.name] = d[0]
			return

		} else if (Array.isArray(component.m[l.name]) && d.length === 1) { // update single object in component.m array

			const i = component.m[l.name].findIndex((e:any)=> e.id === d[0].id)
			if (i === -1) return
			component.m[l.name][i] = d[0]	
			return

		} else { // update entire array with new array objects

			const index_map = new Map();
			component.m[l.name].forEach((row:any, i:num) => index_map.set(row.id, i))

			for(let i = 0; i < d.length; i++) {
				const rowindex = index_map.get(d[i].id)
				if (rowindex === undefined) continue
				component.m[l.name][rowindex] = d[i]
			}
		}
	})

	if (component.knitdata) component.knitdata()
	component.sc()
}






export { Init, RouteChanged, FirestoreChanged }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).ComponentMechanics = { ConnectedCallback, AttributeChangedCallback };



