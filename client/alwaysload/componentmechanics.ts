

import { num, str } from "../defs_server_symlink.js"

import { 
	$NT, 
	ComponentMechanicsT, 
	ComponentMechanicsOptsT, 
	EngagementListenerTypeT, 
	FirestoreFetchResultT,
	FirestoreLoadSpecT,
    LazyLoadT,
	URIDetailT
} from "../defs.js"

declare var $N: $NT;




let _c:{lazyload:LazyLoadT, uridetails:URIDetailT, data:any|null}|null = null




const Init = (lazyloads_:LazyLoadT[]) => {
}




const RouteChanged = (uridetails:URIDetailT, lazyload:LazyLoadT) => new Promise<void>(async (res, _rej)=> {

	console.log("RouteChanged uridetails lazyload ", uridetails, lazyload)
	 
	_c = { lazyload, uridetails, data: null }

	if (!lazyload.loadspecs || !lazyload.loadspecs.length) { res(); return; }

	const loadspecs:FirestoreLoadSpecT[] = []
	for(const ls of lazyload.loadspecs) {
		let p = ''
		for(const param of uridetails.params) {
			p = p.replace(':'+param.key, param.value)
		}
	}

	const ls = lazyload.loadspecs.map(l=> {path:l.path}) : null

	if (loadspecs && loadspecs.length) {

		const r = await datagrab(loadspecs)
		if (r === null) { res(); return; }
	}

	res()
})




const ConnectedCallback = async (component:HTMLElement & ComponentMechanicsT, opts?:ComponentMechanicsOptsT|undefined|null) => new Promise<void>(async (res, rej)=> {

	const rawtagname    = component.tagName.toLowerCase()
	const prefixsplit   = rawtagname.split("-")
	const tagnameprefix = prefixsplit[0]
	const tagname       = prefixsplit[0]
	let   type          = ""
	let   data:any|null = null

	switch(tagnameprefix) {
		case "v":  type = "view";      break;
		case "c":  type = "component"; break;
		case "vp": type = "viewpart";  break;
	}

	const lazyload = lazyloads.find(l=> l.name === tagname && l.type === type)

	if (!lazyload) throw new Error("Lazyload not found for " + tagname)


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






export { Init, RouteChanged }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).ComponentMechanics = { ConnectedCallback, AttributeChangedCallback };



