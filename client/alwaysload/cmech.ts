

import { num, str, bool } from "../defs_server_symlink.js"

import { 
	$NT, 
	CMechT, 
	EngagementListenerTypeT, 
	FetchResultT, 
	FirestoreFetchResultT,
	FirestoreLoadSpecT,
} from "../defs.js"

import { DataGrab as FirestoreDataGrab, AddToListens as FirestoreAddToListens, RemoveFromListens as FirestoreRemoveListens } from "./firestore.js"

declare var $N: $NT;



const _viewloadspecs:Map<string, FirestoreLoadSpecT> = new Map() // key is view tagname sans 'v-'
const _viewloadeddata:Map<string, FirestoreFetchResultT> = new Map() // key is view tagname sans 'v-'




const Init = () => {
}




const AddView = (componentname:str, loadspecs:FirestoreLoadSpecT, views_attach_point:"beforeend"|"afterbegin") => new Promise<num|null>(async (res, _rej)=> {

	_viewloadspecs.set(componentname, loadspecs)

	const parentEl = document.querySelector("#views")!;
	parentEl.insertAdjacentHTML(views_attach_point, `<v-${componentname} class='view'></v-${componentname}>`);

	const el = parentEl.getElementsByTagName(`v-${componentname}`)[0] as HTMLElement & CMechT

	el.addEventListener("hydrated", ()=> { res(1); })
	el.addEventListener("failed",   ()=> { 
		el.remove()
		res(null); 
	})

	parentEl.addEventListener("visibled", visibled)


	function visibled() {
		if (el.visibled) el.visibled()
		parentEl.removeEventListener("visibled", visibled)
	}
})




const ViewConnectedCallback = async (component:HTMLElement & CMechT) => new Promise<void>(async (res, _rej)=> {

	const tagname                            = component.tagName.toLowerCase()
	const tagname_split                      = tagname.split("-")
	const viewname                           = tagname_split[1]

	if (tagname_split[0] !== 'v') throw new Error("Not a view component")

	const r = await handle_view_initial_data_load(viewname, ( component.loadother ? component.loadother.bind(component) : null )  )
	if (r === null) { res(); return; }

	set_component_m_data(true, component, "", _viewloadspecs.get(viewname)!, _viewloadeddata.get(viewname)||null)

	for(const prop in component.a) component.a[prop] = component.getAttribute(prop);

	component.subelshldr = []

	if (component.kd) component.kd()
	component.sc()

	$N.EngagementListen.Add_Listener(component, "component", EngagementListenerTypeT.resize, null, async ()=> {   component.sc();   });

	// component.subelshldr array will be populated by the sub elements of the view if they exist after initial render -- keep in mind they will be EVEN AFTER the view is initially hydrated at any point later 
	component.subelshldr?.forEach((el:any)=>  {
		el.addEventListener("failed", ()=> { component.dispatchEvent(new CustomEvent("failed")); res(); return; })
		el.addEventListener("hydrated", ()=> {
			el.dataset.sub_is_hydrated = "1"
			if (component.subelshldr!.every((el:any)=> el.dataset.sub_is_hydrated === "1")) {
				res(); return;
			}
		})
	}) ?? res()
})




const GenConnectedCallback = async (component:HTMLElement & CMechT) => new Promise<void>(async (res, _rej)=> {

	const tagname                     = component.tagName.toLowerCase()

	const rootnode                    = component.getRootNode()
	const host                        = ( rootnode as any ).host as HTMLElement & CMechT
	const ancestor_view_tagname       = host.tagName.toLowerCase()
	const ancestor_view_tagname_split = ancestor_view_tagname.split("-")
	const ancestor_viewname           = ancestor_view_tagname_split[1]
	const loadspecs                   = _viewloadspecs.get(ancestor_viewname)

	host.subelshldr!.push(component)

	if (component.loadother) {
		const r = await component.loadother()
		if (r === null) { component.dispatchEvent(new CustomEvent("failed")); res(); return; }
	}

	set_component_m_data(false, component, tagname, loadspecs!, _viewloadeddata.get(ancestor_viewname)!)

	for(const prop in component.a) component.a[prop] = component.getAttribute(prop)

	if (component.kd) component.kd()
	component.sc()

	$N.EngagementListen.Add_Listener(component, "component", EngagementListenerTypeT.resize, null, async ()=> {
		component.sc()
	})

	res()
})




const AttributeChangedCallback = (component:HTMLElement & CMechT, name:string, oldval:str|boolean|number, newval:string|boolean|number, _opts?:object) => {

	if (oldval === null) return

	component.a[name] = newval

	if (!component.a.updatescheduled) {
		component.a.updatescheduled = true
		Promise.resolve().then(()=> { 
			if (component.kd) component.kd()
			component.sc()
			component.a.updatescheduled = false
		})
	}
}




const ViewDisconnectedCallback = (component:HTMLElement & CMechT) => {

	const componentname           = component.tagName.toLowerCase().split("-")[1]
	const x                       = _viewloadspecs.get(componentname)?.keys()
	const viewloadspecpaths:str[] = x ? [...x] : []

	_viewloadspecs.delete(componentname)
	_viewloadeddata.delete(componentname)

	const loadspecpaths_to_delete:str[] = viewloadspecpaths.filter(path=> {	
		return [..._viewloadspecs].every(([_viewname, viewloadspecs])=> !viewloadspecs.has(path))
	})

	FirestoreRemoveListens(loadspecpaths_to_delete)
}




const HandleFirestoreDataUpdated = async (updateddata:FirestoreFetchResultT) => {

	if (updateddata === null) return // updateddata is always an array of objects, never null. This line here is to shut up typescript linting

	const keys = [...updateddata.keys()]

	console.log("DONE WEIRD . CHROME CRAPS LIKE A SF 'RESIDENT' ON THE STREET OF MY IMMACULATE CODE.")

	const updateddata_path_dets = keys.map(p=> { const pd = pathdets(p); return pd; })

	console.log("ALL FUCKED. updateddata CAN include something like 'machines/somejackedid' while user is viewing 'machines/unjackedid' and 'somejacked' will just jack right into 'unjacked'. ALL fucked and jacked")

	for(const [viewname, viewloadeddata] of _viewloadeddata) {
		if (!viewloadeddata || viewloadeddata.size === 0)    continue

		let is_view_affected_flag = false
		let viewloadspecs_affected_paths:FirestoreLoadSpecT = new Map()

		viewloadeddata.forEach((viewloadeddata_list, loadeddata_path)=> {
			const lnd = pathdets(loadeddata_path)

			updateddata_path_dets.forEach(und=> {
				
				if (lnd.collection === und.collection && lnd.subcollection === und.subcollection) {
					is_view_affected_flag = true
					viewloadspecs_affected_paths.set(loadeddata_path, _viewloadspecs.get(viewname)!.get(loadeddata_path)!)


					// all FirestoreFetchResultT objects are arrays of objects -- so always dealing with arrays even if just array of one object

					const updateddata_list    = updateddata.get(und.path) as any[]

					const index_map = new Map();
					viewloadeddata_list.forEach((row:any, i:num) => index_map.set(row.id, i))

					for(let i = 0; i < updateddata_list.length; i++) {
						const rowindex = index_map.get(updateddata_list[i].id)
						if (rowindex === undefined) 
							viewloadeddata_list.push(updateddata_list[i])
						else
							viewloadeddata_list[rowindex] = updateddata_list[i]
					}

				}
			})
		})


		if (is_view_affected_flag && viewloadspecs_affected_paths.size > 0) {

			const viewel = document.querySelector(`v-${viewname}`) as HTMLElement & CMechT

			set_component_m_data(true, viewel, "", viewloadspecs_affected_paths, viewloadeddata)

			if (viewel.mdlchngd) await viewel.mdlchngd( [...viewloadspecs_affected_paths.keys()] )
			if (viewel.kd) viewel.kd()
			viewel.sc();

			for(const subel of ( viewel.subelshldr as ( HTMLElement & CMechT )[] )) {
				set_component_m_data(false, subel, subel.tagName.toLowerCase(), viewloadspecs_affected_paths, viewloadeddata)
				if (subel.mdlchngd) await subel.mdlchngd( [...viewloadspecs_affected_paths.keys()] )
				if (subel.kd) subel.kd()
				subel.sc()
			}
		}



	}


	function pathdets(p:str) {
		const sp = p.split('/')
		const collection = sp[0]
		const subcollection = sp[2] || null
		const doc = sp[1] || null
		const subdoc = sp[3] || null
		const isdoc = doc || subdoc ? true : false
		return { path:p, collection, subcollection, doc, subdoc, isdoc }
	}
}




const handle_view_initial_data_load = (viewname:str, loadother:()=>{}) => new Promise<null|num>(async (res, _rej)=> {

	const loadspecs = _viewloadspecs.get(viewname)!

	const promises:any[] = []

	promises.push(loadspecs.size ? FirestoreDataGrab(loadspecs) : 0) 
	promises.push(loadother ? loadother() : 0)

	const r = Promise.all(promises)

	if (r[0] === null || r[1] === null) { res(null); return; }

	if (r[0] !== 0) {
		FirestoreAddToListens(loadspecs)
		_viewloadeddata.set(viewname, r[0])
	}
})




function set_component_m_data(is_view:bool, component:HTMLElement & CMechT, componenttagname:str, loadspecs:FirestoreLoadSpecT, loaddata:FirestoreFetchResultT) {

	if (!loaddata || !loaddata.size || !loadspecs.size) return

	const filtered_loadspecs:FirestoreLoadSpecT = new Map()

	loadspecs.forEach((ls, path)=> {
		if (is_view && ( !ls.els || ls.els.includes('this') ))           filtered_loadspecs.set(path,ls)
		if (!is_view && ( ls.els && ls.els.includes(componenttagname) )) filtered_loadspecs.set(path,ls) 
	}); 

	filtered_loadspecs.forEach((ls, path)=> {
		const d              = loaddata.get(path)!
		component.m[ls.name] = Array.isArray(component.m[ls.name]) ? d : d[0]
	});
}




export { Init, AddView, HandleFirestoreDataUpdated }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).CMech = { ViewConnectedCallback, GenConnectedCallback, AttributeChangedCallback, ViewDisconnectedCallback };



