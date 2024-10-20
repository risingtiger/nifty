
export type str = string; export type num = number; export type bool = boolean;

export enum SSE_TriggersE { FIRESTORE, PLACEHOLDER }

export type INSTANCE_T = {
	INSTANCEID:string, 
	PROJECTID:string, 
	KEYJSONFILE:string, 
	IDENTITY_PLATFORM_API:string,
	SHEETS_KEYJSONFILE:string, 
	Set_Server_Mains:(app:any, db:any, sheets:any, notifications:any, appversion:number, validate_request:any)=>void, 
	Set_Routes:()=>void,
}




