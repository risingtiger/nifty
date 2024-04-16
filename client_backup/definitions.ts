

export type str = string; export type bool = boolean; export type int = number; export type num = number;



export type LazyLoadT = {
    type: "view"| "component" | "thirdparty" | "lib",
    urlmatch: string|null,
    name: string,
    instance: string|null,
    dependencies: { type: string, name: string, instance?: string|null }[],
    auth: string[]
}


(window as any).dumpdefenitions_to_keep_build_process_from_erasing_this_file = true;



