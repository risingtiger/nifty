



function FetchLassie(url:str, options:any = {}) { return new Promise(async res=> { 

    let flg = false

    set_pre()

    if (!options.method) {
        options.method = 'GET'
    }

    execute(url, options)

        .then((result:any)=> {
            if (!flg) {
                flg = true
                set_success()
                res(result)
            }
        })

        .catch((err:any)=> {
            flg = true
            error_out(err)
        })

    setTimeout(()=> {   
        if (!flg) {
            flg = true   
            error_out("FetchLassie timed out")
        }
    }, 5000)
})}




function execute(resource:str, options:any) { return new Promise(async (res,er)=> { 

    let accept_type = (options.headers["Accept"] && options.headers["Accept"] !== "application/json") ? "text" : "json"

    fetch(resource, options)

        .then(async (req:any)=> {
            if (req.ok) {
                const request_result = await (accept_type === "text" ? req.text() : req.json())
                res(request_result)
            }

            else {
                er("FetchLassie Error: not ok")
            }
        })

        .catch((error:any)=> {
            er(error)
        })
})}




function error_out(er:any = null) {
    if (!window.location.href.includes("localhost")) {   
        window.location.href = `/?errmsg=${encodeURIComponent('Unable to FetchLassie')}`; 
    }   

    console.error("FetchLassie Error: ")
    console.error(er)
}




function set_pre() {
    document.getElementById("loadviewoverlay")!.classList.add("active")
}




function set_success() {
    document.getElementById("loadviewoverlay")!.classList.remove("active")
}



(window as any).FetchLassie = FetchLassie;


