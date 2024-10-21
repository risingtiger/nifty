
export type str = string; export type num = number; export type bool = boolean;

export enum SSE_TriggersE { FIRESTORE, PLACEHOLDER }

export type ServerMainsT = {app:any, db:any, appversion:number, sheets:any, notifications:any, firestore:any, influxdb:any, validate_request:any};

export type INSTANCE_T = {
	INSTANCEID:string, 
	PROJECTID:string, 
	KEYJSONFILE:string, 
	IDENTITY_PLATFORM_API:string,
	SHEETS_KEYJSONFILE:string, 
	Set_Server_Mains:(m:ServerMainsT)=>void, 
	Set_Routes:()=>void,
}




