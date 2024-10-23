
export type str = string; 
export type bool = boolean; 
export type num = number;

import { SSE_TriggersE } from "./defs_server_symlink.js";


export type LazyLoadT = {
    type: "view" | "component" | "thirdparty" | "lib",
    urlmatch: string|null,
    name: string,
    is_instance: bool,
    dependencies: { type: string, name: string, is_instance?: bool|null }[],
    auth: string[]
}


export type FetchLassieHttpOptsT = {
	method?: "GET" | "POST" | "PUT" | "DELETE",
	headers?: any,
	body?: string | null
}

export type FetchLassieOptsT = {
	disable_auth?: bool,
	isbackground?: bool,
	timeout: num,
}





export type IndexedDBStoreMetaT = {
	name: str,
	url: str
}


export type $NT = {
	SSEvents: {
		Init: () => void,
		Add_Listener: (listener_name:string, eventname:SSE_TriggersE[], callback_func:any) => void
		Remove_Listener: (name:string)=>void
	},

	IndexedDB: {
		Init: (indexeddb_store_names:IndexedDBStoreMetaT[], firebase_project:string, dbversion:number) => Promise<void>,
		GetAll: (store_names: str[]) => Promise<Map<string, any[]>>
	}

	DataSync: {
		Init: (indexeddb_stores: IndexedDBStoreMetaT[], dbname:str, dbversion:number, appversion:num) => void
		Subscribe: (store_names:str[], subscriber_el:HTMLElement) => void
	}

	EngagementListen: {
		Init: () => void
	}

	LazyLoad: {
		Init: (lazyloads_:LazyLoadT[]) => void
	}

	SwitchStation: {
		InitInterval: () => void,
		AddRoute: (lazyload_view:LazyLoadT) => void
	}

	Firestore: {
		Retrieve: (path:string|string[], opts?:any) => Promise<any>,
		Patch: (path:string, opts?:any) => Promise<any>,
		Add: (path:string, newdocs:any[]) => Promise<any>,
	}

	FirestoreLive: {
		Init: () => Promise<any>,
		Get: (resources:any[]) => Promise<any[]>,
		Remove: () => void,
		Subscribe: (htmlel:HTMLElement) => void,
		UnSubscribe: (htmlel:HTMLElement) => void,
	}

	InfluxDB: {
		Retrieve_Series: (bucket:str, begins:number[], ends:number[], msrs:str[], fields:str[], tags:str[], intrv:number[], priors:str[]) => Promise<any>
	}

	FetchLassie: (url:string, http_optsP?:FetchLassieHttpOptsT|undefined, opts?:FetchLassieOptsT|null|undefined) => Promise<any>

	ToastShow: (msg: str, level?: number|null, duration?: num|null) => void
}
 

export type INSTANCE_T = {
	INFO: {
		name: string,
		firebase: {
			project: string,
			identity_platform_key: string,
			dbversion: number,
		},
		indexeddb_stores: IndexedDBStoreMetaT[],
	},
	LAZYLOADS: LazyLoadT[],
}




