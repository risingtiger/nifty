

import { str, num } from  "../../defs_server_symlink.js" 
import { URIDetailT, FirestoreLoadSpecT, LazyLoadLoadSpecT } from  "./../defs.js" 




const RegExParams = (original_matchstr:string) => {
	const pathparamnames: Array<str> = [];
	const pattern = original_matchstr.replace(/:([a-z][a-z_0-9]+)/g, (_match, pathparamname) => {
		pathparamnames.push(pathparamname);
		return '([a-zA-Z0-9_]+)';
	});

	const regex      = new RegExp(pattern);
	const paramnames = pathparamnames;

	return {regex, paramnames}
}




const GetPathParams = (pathparams_propnames:str[], pathparams_vals:str[]) => {

	const pathparams:any = pathparams_propnames.map((_, i) => {
		return { [pathparams_propnames[i]]: pathparams_vals[i] }
	})

	return Object.assign({}, ...pathparams)	
}




const GetLoadSpec = (uri:str, urlmatches:Array<str>, paramnames:Array<str>, lazyloadloadspecs:LazyLoadLoadSpecT[]) => {

	let uriparams = {}
	for (let i = 0; i < urlmatches.length; i++) {
		const val = urlmatches[i]
		const name = paramnames[i]
		uriparams[name] = val
	}

	const uridetails:URIDetailT = { uri, params: uriparams }

	const loadspecs:FirestoreLoadSpecT = new Map()
	lazyloadloadspecs?.forEach(ls => {
		let path = ls.path
		for (const [key, value] of Object.entries(uridetails.params)) {
			path = path.replace(`:${key}`, `${value}`)
		}
		loadspecs.set(path, {name:ls.name, opts:ls.opts, els:ls.els} )
	})

	return loadspecs
}




export { RegExParams, GetLoadSpec }

//if (!(window as any).$N) {   (window as any).$N = {};   }
//((window as any).$N as any).SwitchStation = { NavigateTo, NavigateBack };













