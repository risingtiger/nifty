

enum SSE_TriggersE { FIRESTORE, SOMETINELSE }

type str = string; type bool = boolean; type num = number;



type LazyLoadT = {
    type: "view"| "component" | "thirdparty" | "lib",
    urlmatch: string|null,
    name: string,
    instance: string|null,
    dependencies: { type: string, name: string, instance?: string|null }[],
    auth: string[]
}




(process as any).dumpdefenitions_to_keep_build_process_from_erasing_this_file = true;



export { str, bool, num, LazyLoadT, SSE_TriggersE }
