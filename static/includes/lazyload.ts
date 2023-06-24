

// type str = string;   
// type int  = number; type bool = boolean;





type Load_Item = {what:str, name:str}



const _filepaths:str[] = [];




function LazyLoad(loads:Array<Load_Item>) { 

    return new Promise(async (res, _rej)=> {

        let filepaths:str[] = []

        extract_filepaths_from_loads(loads, filepaths)

        const all_loads_unique_paths = filepaths.filter((f, i, self) => self.indexOf(f) === i)

        for (let i = 0; i < all_loads_unique_paths.length; i++) {

            const f = all_loads_unique_paths[i]

            if (!_filepaths.includes(f)) {

                await suck_in_file(f+'.js')
                _filepaths.push(f)

            }

        }

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




function suck_in_file(fpath:str) {

    return new Promise(async (res, _rej)=> {

        let flag = false

        import(fpath).then(async _module => {

            flag = true
            res(1)

        })

        .catch(()=> {
            if (!flag) {
                throwup_and_leave(fpath)
            }
            flag = true

        })	

        setTimeout(()=> {
            if (!flag) {
                throwup_and_leave(fpath)
            }
            flag = true
        }, 5000)

    })


    //bad_ux_but_untill_i_can_get_back_to_this_it_is_what_it_is__fucked

    function throwup_and_leave(fpath:str) {

        const errmsg = encodeURIComponent(`Unable to Lazy Load Js: ${fpath}`)

        console.log(`/?errmsg=${errmsg}`)

        if (!window.location.href.includes("localhost")) {
            window.location.href = `/?errmsg=${errmsg}`
        }
    }

}




(window as any).LazyLoad = LazyLoad;




