

import { bool, num, str, SSETriggersE } from './defs_server_symlink.js'


export type LazyLoadT = {
    type: "view" | "component" | "thirdparty" | "lib",
    urlmatch: string|null,
    name: string,
    is_instance: bool,
    dependencies: { type: string, name: string, is_instance?: bool|null }[],
    auth: string[]
}


export type FetchLassieHttpOptsT = {
	method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
	headers?: any,
	body?: string | null
}
export type FetchLassieOptsT = {
	isbackground?: bool,
	timeout?: num,
}


export const enum LoggerTypeE {
	debug = 10,
    info = 20,
	warning = 30,
	error = 40
}


export const enum LoggerSubjectE {
	sse_listener_added = "ssa",
	sse_listener_removed = "ssd",
	sse_listener_connected = "ssc",
	sse_listener_error = "sse",
    sse_received_withfocus = "ssw",
    sse_received_firestore = "ssf",
	sw_fetch_not_authorized = "sw4",
	sw_fetch_error = "swe",
}


export const enum DataSyncStoreMetaStateE  { 
	EMPTY, 
	STALE, 
	QUELOAD, 
	LOADING, 
	LOADED_AND_CHANGED, 
	LOADED_AND_UNCHANGED,
	OK 
}
export type DataSyncStoreMetaT = {
	n: string, // store name
	i: null|string, // item id or null if entire store
	l: DataSyncStoreMetaStateE, // 
	ts: number // timestamp
}








export type IndexedDBStoreMetaT = {
	name: str,
	url: str
}


export type $NT = {
	SSEvents: {
		Init: () => void,
		ForceStop: () => void,
		Add_Listener: (el:HTMLElement, listener_name:string, eventname:SSETriggersE[], callback_func:any) => void
		Remove_Listener: (name:string)=>void
	},

	IndexedDB: {
		Init: (indexeddb_store_names:IndexedDBStoreMetaT[], firebase_project:string, dbversion:number) => Promise<void>,
		GetAll: (store_names: str[]) => Promise<Map<string, any[]>>
	}

	DataSync: {
		Init: (indexeddb_stores: IndexedDBStoreMetaT[], dbname:str, dbversion:number) => void
		Subscribe: (el:HTMLElement, store_names:str[], callback:(data:any)=>void) => void
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

	InfluxDB: {
		Retrieve_Series: (bucket:str, begins:number[], ends:number[], msrs:str[], fields:str[], tags:str[], intrv:number[], priors:str[]) => Promise<any>
	}

	FetchLassie: (url:string, http_optsP?:FetchLassieHttpOptsT|undefined, opts?:FetchLassieOptsT|null|undefined) => Promise<any>

	ToastShow: (msg: str, level?: number|null, duration?: num|null) => void

	Logger: {
		Log: (type:LoggerTypeE, subject:LoggerSubjectE, message:str) => void,
		Save: () => void
		Get: () => void
	}

	Utils: {
		CSV_Download: (csvstr:string, filename:string) => void,
	}
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
