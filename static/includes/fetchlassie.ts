

type Que = {
    i: int,
    url: str,
    ts: int
}

const ques:Que[] = []
let que_i = 0




function FetchLassie(url:str, options:any = {}) { return new Promise(async res=> { 

    let flg = false

    const i = que_i++

    set_pre(url, i)

    if (!options.method) {
        options.method = 'GET'
    }

    if (!options.headers) {
        options.headers = {}
    }

    if (!options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/json"
    }

    if (!options.headers["Accept"]) {
        options.headers["Accept"] = "application/json"
    }

    execute(url, options)

        .then((result:any)=> {
            if (!flg) {
                flg = true
                set_success(i)
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
        document.getElementById("fetchlassy_overlay")!.classList.add("active")
        window.location.href = `/?errmsg=${encodeURIComponent('Unable to Fetch')}`; 
    }   

    console.error("Fetch Error: ")
    console.error(er)
}




function set_pre(url:str, this_que_i:int) {

    document.getElementById("fetchlassy_overlay")!.classList.add("active")
    ques.push({ i:this_que_i, url, ts: Date.now() })
    ticktock()
}




function set_success(this_que_i:int) {

    const que_index = ques.findIndex(x=> x.i === this_que_i)
    ques.splice(que_index)
}




function ticktock() {
    setTimeout(()=> {
        console.log("tick tocking")
        if (ques.length > 0) {
            const now = Date.now()
            document.getElementById("fetchlassy_overlay")!.classList.add("active")
            const queover = ques.find(x=> now - x.ts > 9000)
            if (queover) {
                error_out("FetchLassie timed out")
            } else {
                ticktock()
            }
        } else {
            document.getElementById("fetchlassy_overlay")!.classList.remove("active")
        }
    }, 500)
}



(window as any).FetchLassie = FetchLassie;


