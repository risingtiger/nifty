

import { num, str, bool } from "../defs_server_symlink.js"
import { $NT, CMechViewT, CMechViewPartT, EngagementListenerTypeT } from "../defs.js"
import { EnsureObjectStoresActive as LocalDBSyncEnsureObjectStoresActive } from "./localdbsync.js"

declare var $N: $NT;



//const _viewloadspecs:Map<string, FirestoreLoadSpecT> = new Map() // key is view tagname sans 'v-'
//const _viewloadeddata:Map<string, FirestoreFetchResultT> = new Map() // key is view tagname sans 'v-'

// these are set when a new view is added, and removed after that view is hydrated (or failed) 

let _loadeddata:Map<str, {remote:{[key:string]:any}, localdb:{[key:string]:any}}> = new Map() // map by view name
let _searchparams:Map<str, URLSearchParams> = new Map() // map by view name
let _pathparams:Map<str, { [key: string]: string }> = new Map() // map by view name




const Init = () => {
}




const AddView = (
	componentname:str, 
	pathparams: { [key: string]: string }, 
	searchparams:URLSearchParams, 
	localdb_preload:str[]|null|undefined,
	views_attach_point:"beforeend"|"afterbegin", 
	loadremote:(pathparams:{ [key: string]: string }, searchparams: URLSearchParams, isinitial:bool)=>Promise<{ [key: string]: string }|null>
) => new Promise<num|null>(async (res, _rej)=> {

	//_viewloadspecs.set(componentname, loadspecs)

	const promises:Promise<any>[] = []

	promises.push(localdb_preload ? LocalDBSyncEnsureObjectStoresActive(localdb_preload) : Promise.resolve(1))
	promises.push( loadremote(pathparams, searchparams, false) )

	const r = Promise.all(promises)

	if (r[0] === null || r[1] === null) { res(null); return; }
	
	_loadeddata.set(componentname, {remote:r[1], localdb:{}})
	_searchparams.set(componentname, searchparams)
	_pathparams.set(componentname, pathparams)

	const parentEl = document.querySelector("#views")!;
	parentEl.insertAdjacentHTML(views_attach_point, `<v-${componentname} class='view'></v-${componentname}>`);

	const el = parentEl.getElementsByTagName(`v-${componentname}`)[0] as HTMLElement & CMechViewT

	el.addEventListener("hydrated", ()=> { 
		_loadeddata.delete(componentname) 
		_searchparams.delete(componentname) 
		_pathparams.delete(componentname) 
		res(1); 
	})
	el.addEventListener("failed",   ()=> { 
		_loadeddata.delete(componentname) 
		_searchparams.delete(componentname) 
		_pathparams.delete(componentname) 
		el.remove()
		res(null); 
	})

	parentEl.addEventListener("visibled", visibled)


	function visibled() {
		if (el.visibled) el.visibled()
		parentEl.removeEventListener("visibled", visibled)
	}
})








const ViewConnectedCallback = async (component:HTMLElement & CMechViewT) => new Promise<void>(async (res, _rej)=> {

	const tagname                            = component.tagName.toLowerCase()
	const tagname_split                      = tagname.split("-")
	const viewname                           = tagname_split[1]

	if (tagname_split[0] !== 'v') throw new Error("Not a view component")

	for(const prop in component.a) component.a[prop] = component.getAttribute(prop);

	component.subelshldr = []

	const loadeddata = _loadeddata.get(viewname)!
	const searchparams = _searchparams.get(viewname)!

	if (component.loadlocaldb) loadeddata.localdb = component.loadlocaldb(loadeddata.remote, searchparams)

	if (component.kd) component.kd(loadeddata)

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




const ViewPartConnectedCallback = async (component:HTMLElement & CMechViewPartT) => new Promise<void>(async (res, _rej)=> {

	const tagname                     = component.tagName.toLowerCase()
	const tagname_split               = tagname.split("-")

	if (tagname_split[0] !== 'vp') throw new Error("Not a view part component")

	const rootnode                    = component.getRootNode()
	const host                        = ( rootnode as any ).host as HTMLElement & CMechViewT
	const ancestor_view_tagname       = host.tagName.toLowerCase()
	const ancestor_view_tagname_split = ancestor_view_tagname.split("-")
	const ancestor_viewname           = ancestor_view_tagname_split[1]

	for(const prop in component.a) component.a[prop] = component.getAttribute(prop)

	host.subelshldr!.push(component)

	const loadeddata = _loadeddata.get(ancestor_viewname)!

	if (component.kd) component.kd(loadeddata)
	component.sc()

	/*
	if (component.loadother) {
		const r = await component.loadother()
		if (r === null) { component.dispatchEvent(new CustomEvent("failed")); res(); return; }
	}
	*/

	//set_component_m_data(false, component, tagname, loadspecs!, _viewloadeddata.get(ancestor_viewname)!)


	$N.EngagementListen.Add_Listener(component, "component", EngagementListenerTypeT.resize, null, async ()=> {
		component.sc()
	})

	res()
})




const AttributeChangedCallback = (component:HTMLElement, name:string, oldval:str|boolean|number, newval:string|boolean|number, _opts?:object) => {

	if (oldval === null) return

	const a = (component as any).a as {[key:string]:any}

	a[name] = newval

	if (!a.updatescheduled) {
		a.updatescheduled = true
		Promise.resolve().then(()=> { 
			(component as any).sc()
			a.updatescheduled = false
		})
	}
}




const ViewDisconnectedCallback = (component:HTMLElement) => {

	if (!component.tagName.startsWith("V-")) throw new Error("Not a view component")

	const componentname           = component.tagName.toLowerCase().split("-")[1]

	_loadeddata.delete(componentname) // should already be deleted by the time this is called - but just in case
	_searchparams.delete(componentname) // should already be deleted by the time this is called - but just in case
	_pathparams.delete(componentname) // should already be deleted by the time this is called - but just in case
}




const UpdateFromSearchParamsChanged = (oldparams:URLSearchParams, newparams:URLSearchParams) => {

	// search params are only relevant to active view. ignore inactive views

	const activeviewel = document.getElementById("views")!.lastElementChild as HTMLElement & CMechViewT

	if (activeviewel.searchchngd) activeviewel.searchchngd(oldparams, newparams)
	
	// If we need to notify all views in the future, use this pattern:
	// const viewElements = document.getElementById("views")!.querySelectorAll(".view")
	// Array.from(viewElements).forEach((viewEl: Element) => {
	//     const typedViewEl = viewEl as HTMLElement & CMechViewT;
	//     if (typedViewEl.searchchngd) typedViewEl.searchchngd(oldparams, newparams);
	// });
}




const UpdateFromModelChanged = (changedpaths:str[], datas:any[]) => {

	const views = document.getElementById("views")!.querySelectorAll(".view")

	for(const viewel of views) {
		( viewel as HTMLElement & CMechViewT ).mdlchngd(changedpaths)
	}

	/*
	views.forEach((viewel:HTMLElement & CMechViewT)=> {
		viewel.searchchngd(oldparams, newparams)
	})
	*/
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




/*
const handle_view_initial_data_load = (viewname:str, loadother:()=>{}|null) => new Promise<null|num>(async (res, _rej)=> {

	const loadspecs = _viewloadspecs.get(viewname)!

	const promises:any[] = []

	promises.push(loadspecs.size ? FirestoreDataGrab(loadspecs) : 0) 
	promises.push(loadother ? loadother() : 0)

	const r = await Promise.all(promises)

	if (r[0] === null || r[1] === null) { res(null); return; }

	if (r[0] !== 0) {
		FirestoreAddToListens(loadspecs)
		_viewloadeddata.set(viewname, r[0])
	}

	res(1)
})
*/




/*
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
*/




export { Init, AddView, UpdateFromSearchParamsChanged, HandleFirestoreDataUpdated }

if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).CMech = { ViewConnectedCallback, ViewPartConnectedCallback, AttributeChangedCallback, ViewDisconnectedCallback };



