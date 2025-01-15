
export type str = string; export type num = number; export type bool = boolean;

export const enum SSETriggersE { FIRESTORE, PLACEHOLDER }

export type ServerMainsT = {
	app:any, 
	db:any, 
	appversion:number, 
	sheets:any, 
	notifications:any, 
	firestore:any, 
	influxdb:any, 
	emailing:any,
	sse:any,
	validate_request:any
};

export type ServerInstanceT = {
	INSTANCEID:string, 
	PROJECTID:string, 
	KEYJSONFILE:string, 
	IDENTITY_PLATFORM_API:string,
	SHEETS_KEYJSONFILE:string, 
	Set_Server_Mains:(m:ServerMainsT)=>void, 
	Set_Routes:()=>void,
}




