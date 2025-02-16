

import { num, str } from "../defs_server_symlink.js"
import { 
	$NT, 
	ComponentMechanicsT, 
	ComponentMechanicsOptsT, 
	EngagementListenerTypeT, 
	FirestoreFetchResultT,
	FirestoreLoadSpecT,
} from "../defs.js"

declare var $N: $NT;




const Init = () => {}




const ConnectedCallback = async (component:HTMLElement & ComponentMechanicsT, opts?:ComponentMechanicsOptsT|undefined|null) => new Promise<void>(async (res, rej)=> {


	let   lhydrations:{ el:HTMLElement }[] = []

	for(const prop in component.a) component.a[prop] = component.getAttribute(prop)
	component.sc()


	{
		if (!opts) opts      = {  }
		opts.hydrates        = opts.hydrates === undefined ? [] : opts.hydrates
		
		if ( !component.m || !component.a || !component.sc)  throw new Error("Component must have m, a and sc " + component.nodeName)
	}


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


	{
		const loadspecs = component.getloadspecs ? component.getloadspecs() : []
		if (loadspecs.length) {
			const r = await DataGrab(component.m, loadspecs)
			if (r === null) { hydratedfailedevent(); return; }
		}

		if (component.knitdata) component.knitdata()
		component.sc()
	}


	if (component.getloadspecs) {
		$N.Firestore.Add_Listener(
			component, 
			"component", 
			()=> component.getloadspecs ? component.getloadspecs() : [],
			(r:FirestoreFetchResultT)=> handle_firestore_listener(component, r)
		) 
	}


	$N.EngagementListen.Add_Listener(component, "component", EngagementListenerTypeT.resize, null, async ()=> {
		component.sc()
	})


	component.dataset.hydratestate = "ok"
	checkhydration()
	

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


	function hydratedfailedevent() {
		component.dataset.hydratestate = "err"
		component.dispatchEvent(new Event('failed'))
		rej()
	}
})




const AttributeChangedCallback = (component:HTMLElement & ComponentMechanicsT, name:string, oldval:str|boolean|number, newval:string|boolean|number, _opts?:object) => {

	console.log("REMOVE ONCE DONE TESTING. I THINK THIS WILL SHOW UP INIT OF COMPONENT. NEED TO FILTER OUT FIRST CALLS. I THINK BY TESTING FOR NULL OF OLDVAL")
	if (oldval === null) return

	component.a[name] = newval

	clearTimeout(component.a.lastupdatedtimeout)
	component.a.lastupdatedtimeout = setTimeout(()=> {
		if (component.knitdata) component.knitdata()
		component.sc()
	}, 100)
}




const DataGrab = async (model:any, loadspecs:FirestoreLoadSpecT[]) => new Promise<num|null>(async (res, _rej)=> {

	const r = await $N.Firestore.DataGrab(loadspecs)
	if (r === null) { res(null); return; }

	for(let i = 0; i < loadspecs.length; i++) {
		const m = r.get(loadspecs[i].path) as Array<object>|object
		model[loadspecs[i].name] = Array.isArray(model[loadspecs[i].name]) ? m : m[0]
	}

	res(1)
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







if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).ComponentMechanics = { Init, ConnectedCallback, AttributeChangedCallback, DataGrab };



