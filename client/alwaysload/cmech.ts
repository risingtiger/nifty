

import { num, str } from "../defs_server_symlink.js"

import { 
	$NT, 
	CMechT, 
	CMechOptsT, 
	EngagementListenerTypeT, 
	FirestoreFetchResultT,
	FirestoreLoadSpecT,
    LazyLoadT,
	URIDetailT
} from "../defs.js"

import { GrabHoldData as FirestoreGrabHoldData } from "./firestore.js"

declare var $N: $NT;



const _viewloadspecs:Map<string, FirestoreLoadSpecT> = new Map()

//let _c:{lazyload:LazyLoadT, uridetails:URIDetailT}|null = null




const Init = () => {
}




const AddView = (componentname:str, loadspecs:FirestoreLoadSpecT, views_attach_point:"beforeend"|"afterbegin") => new Promise<void>(async (res, _rej)=> {

	_viewloadspecs.set(componentname, loadspecs)

	const parentEl = document.querySelector("#views")!;
	parentEl.insertAdjacentHTML(views_attach_point, `<v-${componentname} class='view'></v-${componentname}>`);
	//const el = parentEl.getElementsByTagName(`v-${componentname}`)[0] as HTMLElement

			//if (el.dataset.hydratestate === "ok") {
			//	res('success')
			//} else if (el.dataset.hydratestate === "err") {
			//	el.remove()
			//	res('failed')
			//} else {
			//	el.addEventListener("hydrated", hydrated)
			//	el.addEventListener("failed", failed)
			//}

	res()
})

/*

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

	Listen_to_Loadspecs(loadspecs)

	_isgrabbingdata = false

	res()
	*/



const ConnectedCallback = async (component:HTMLElement & CMechT, opts?:CMechOptsT|undefined|null) => new Promise<void>(async (res, _rej)=> {

	const tagname       = component.tagName.toLowerCase()
	const tagname_split = tagname.split("-")
	let   loadspecs_view_to_load = ""
	let   is_mainview   = true

	if   (tagname_split[0] === 'v') {
		loadspecs_view_to_load = tagname_split[1]
	}
	else {
		const rootnode                    = component.getRootNode()
		//@ts-ignore
		const host                        = rootnode.host as HTMLElement
		const ancestor_view_tagname       = host.tagName.toLowerCase()
		const ancestor_view_tagname_split = ancestor_view_tagname.split("-")

		loadspecs_view_to_load            = ancestor_view_tagname_split[1]
		is_mainview                       = false
	}

	const loadspecs = _viewloadspecs.get(loadspecs_view_to_load)
	const loadspecs_array = loadspecs ? [...loadspecs] : []

	if (loadspecs && loadspecs.size > 0) {
		const filtered_loadspecs = new Map(
			loadspecs_array.filter(([_path, ls]) => {
				if (is_mainview) {
					return !ls.els || ls.els.includes('this')
				} else {
					return ls.els && ls.els.includes(tagname)
				}
			})
		);
		const data = FirestoreGrabHoldData(filtered_loadspecs);
		if (data === null) throw new Error("Data not found for " + loadspecs_view_to_load);

		for (const [path, d] of data) {
			const loadspec = loadspecs.get(path)!
			component.m[loadspec.name] = Array.isArray(component.m[loadspec.name]) ? d : d[0]
		}
	}

	for(const prop in component.a) component.a[prop] = component.getAttribute(prop)

	if (component.knitdata) component.knitdata()
	component.sc()
	
	const els = [...new Set(loadspecs_array.map(([_path, ls])=> ls.els).flat().filter(Boolean))] as string[]

	if (is_mainview && loadspecs && loadspecs.size > 0 && loadspecs_array.some(( ls:any )=> ls.els)) {
		for(const ls of loadspecs_array) {	

		}
	}



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

	if (!a.updatescheduled) {
		a.updatescheduled = true
		Promise.resolve().then(()=> { 
			if (knitdata) knitdata()
			sc()
			a.updatescheduled = false
		})
	}
}




const datagrab = async (loadspecs:FirestoreLoadSpecT[]) => new Promise<FirestoreFetchResultT|null>(async (res, _rej)=> {

	const r = await $N.Firestore.DataGrab(loadspecs)
	if (r === null) { res(null); return; }

	r.forEach((value, key) => {
		_data.set(key, value);
	});
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




function handle_firestore_listener(component:HTMLElement & CMechT, r:FirestoreFetchResultT) {

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






export { Init, AddView }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).CMech = { ConnectedCallback, AttributeChangedCallback };



