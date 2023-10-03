

// type str = string;   
// type int  = number; type bool = boolean;





type Load_Item = {what:str, name:str}
type Load_Que = {
    i: int,
    url: str,
    ts: int
}

const load_ques:Load_Que[] = []
let load_que_i = 0
const _filepaths:str[] = [];




function LazyLoad(loads:Array<Load_Item>) { 

    return new Promise(async (res, _rej)=> {

        let filepaths:str[] = []

        extract_filepaths_from_loads(loads, filepaths)

        const all_loads_unique_paths = filepaths.filter((f, i, self) => self.indexOf(f) === i)

        const promises = []

        for (let i = 0; i < all_loads_unique_paths.length; i++) {

            const f = all_loads_unique_paths[i]

            if (!_filepaths.includes(f)) {

                promises.push(suck_in_file(f+'.js'))
                _filepaths.push(f)
            }
        }
        await Promise.all(promises)
        res(1)
    })
}




function extract_filepaths_from_loads(loads:Load_Item[], filepaths:str[]) {

    for(let i = 0; i < loads.length; i++) {

        let whatlist:Array<any> = []
        let path_prefix = ""

        switch (loads[i].what) {
            case "views": 
                whatlist = [...(window as any).__VIEWS, ...(window as any).__APPINSTANCE_VIEWS]
                path_prefix = "/assets/lazy/views/"
                break;
            case "components":
                whatlist = [...(window as any).__COMPONENTS, ...(window as any).__APPINSTANCE_COMPONENTS]
                path_prefix = "/assets/lazy/components/"
                break;
            case "thirdparty":
                whatlist = [...(window as any).__THIRDPARTY, ...(window as any).__APPINSTANCE_THIRDPARTY]
                path_prefix = "/assets/lazy/thirdparty/"
                break;
            case "libs":
                whatlist = [...(window as any).__LIBS, ...(window as any).__APPINSTANCE_LIBS]
                path_prefix = "/assets/lazy/libs/"
                break;
        }

        let load_item = whatlist.find((d:any)=> d.name === loads[i].name)!

        let fpath:str = path_prefix + load_item.name + ((window as any).APPVERSION > 0 ? `-v${(window as any).APPVERSION}` : "")

        filepaths.push(fpath)

        if (load_item.dependencies.length > 0) {
            extract_filepaths_from_loads(load_item.dependencies, filepaths)
        }
    }
}



/*
type Load_Que = {
    i: int,
    url,
    ts: int
}
const load_ques:Load_Que[] = []
let load_que_i = 0
const _filepaths:str[] = [];
*/


function suck_in_file(fpath:str) {

    return new Promise(async (res, _rej)=> {

        const i = load_que_i++
        load_ques.push({ i, url: fpath, ts: Date.now() })
        load_ticktock()

        import(fpath).then(async _module => {

            const que_index = load_ques.findIndex(x=> x.i === i)
            load_ques.splice(que_index)
            res(1)
        })

        .catch((_e)=> {
            if (!window.location.href.includes("localhost")) {
                window.location.href = "/index.html?update=1"
            } else {
                throwup_and_leave(fpath)
            }
        })	
    })
}




function throwup_and_leave(fpath:str) {

    const errmsg = encodeURIComponent(`Unable to Lazy Load Js: ${fpath}`)

    console.info(`/?errmsg=${errmsg}`)

    if (!window.location.href.includes("localhost")) {
        window.location.href = `/?errmsg=${errmsg}`
    }
}




function load_ticktock() {
    setTimeout(()=> {
        console.log("lazyload tick tocking")
        if (load_ques.length > 0) {
            const now = Date.now()
            document.getElementById("loadviewoverlay")!.classList.add("active")
            const queover = load_ques.find(x=> now - x.ts > 9000)
            if (queover) {
                throwup_and_leave(queover.url)
            } else {
                load_ticktock()
            }
        } else {
            document.getElementById("loadviewoverlay")!.classList.remove("active")
        }
    }, 500)
}




(window as any).LazyLoad = LazyLoad;




