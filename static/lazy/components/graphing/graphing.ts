

type int = number
type bool = boolean
type str = string


declare var Chartist_LineChart: any;
declare var Chartist_BarChart: any;
declare var Chartist_FixedScaleAxis: any;
declare var Lit_Render: any;
declare var Lit_Html: any;


type State = {
    bucket: str, // what influxdb  measurement. ex. PSI
    msr: str, // what influxdb  measurement. ex. PSI
    fields: Field[], // what influxdb fields in specified measurement to show. ex. City psi and/or After Filter Psi
    tags: Tag[], // what influxdb tags , Chip Id , etc
    type: str, // line or bar  
    intrv: number, // interval -- how many seconds per point. ex. For 5 minute interval set to 300 (300 seconds in 5 minutes) 
    nifl: number, // nthIntervalForLabel -- nth points to show label on x axis. ex. For showing every hour at the top of the hour for 5 minute increments, set to 12
    ppf: number, // points Per Frame. ex. For One Day with 5 minute increments it will be 288 points
    aggr: bool, // aggregate -- should graph be aggregated or show raw data points in median window frames (aggregated over time according to intrv)
    ismdn: bool, // startAtMidnight -- should graph be positioned where the left most x on the x axis is midnight of current day
    lowhigh: str, // low and high values for y axis. ex. 0,100
    unitterms: str, // ex gals or psi
    begin: int, // point in time at which graph starts. if ismdn=true, this will be at midnight of local time
    tmzncy: str // time zone city , used to show time in whatever time zone chosen 
}

type Field = { 
    name: str
}

type Tag = { 
    name: str
    val: str
}

type FPS = { 
    f: Field, 
    points: {   x: int, y: int|null, d: Date   }[]
}




    let countr = 0;
class CGraphing extends HTMLElement {

s:State




static get observedAttributes() { return ['fields','begintime']; }




constructor() {   
    super(); 

    this.s = {
        bucket: "",
        msr: "",
        fields: [],
        tags: [],
        type: "line",
        intrv:300, 
        nifl: 12, 
        ppf: 288, 
        aggr: false,
        ismdn: true,
        lowhigh: "",
        unitterms: "",
        begin: 0,
        tmzncy: ""
    }
}




async attributeChangedCallback(name:str, oldValue:str|bool|int, newValue:str|bool|int) {

    if ( (name === "fields" || name === "begintime") && newValue !== oldValue) {
        countr++
        console.log("countr", countr)

        setTimeout(async ()=>{
            const fieldsstr = this.getAttribute("fields")
            const tagsstr = this.getAttribute("tags") || ""

            this.s.bucket = this.getAttribute("bucket") as str
            this.s.msr = this.getAttribute("measurement") as str
            this.s.fields = (fieldsstr?.split(",") as str[]).map((f:str)=> { return {name:f}; } )

            this.s.type = this.getAttribute("type")
            this.s.intrv = Number(this.getAttribute("intrv"))
            this.s.nifl = Number(this.getAttribute("nifl"))
            this.s.ppf = Number(this.getAttribute("ppf"))
            this.s.aggr = this.getAttribute("aggr") === "true"
            this.s.ismdn = this.getAttribute("ismdn") === "true" 
            this.s.lowhigh = this.getAttribute("lowhigh") 
            this.s.unitterms = this.getAttribute("unitterms") 
            this.s.begin = Number(this.getAttribute("begintime")) 

            if (tagsstr)
                this.s.tags = (tagsstr?.split(",") as str[]).map((f:str)=> { const sp = f.split(":"); return {name:sp[0], val:sp[1]}; } )
            else
                this.s.tags = []

            this.s.tmzncy = this.getAttribute("tmzncy")!

            const datestr = new Date().toLocaleDateString("en-US", { timeZone: "America/" + this.s.tmzncy })

            await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.type, this.s.intrv, this.s.nifl, this.s.ppf, this.s.aggr, this.s.tmzncy, this.s.ismdn, this.s.lowhigh, this.s.unitterms)

            this.dispatchEvent(new Event('hydrate'))

            this.dispatchEvent(new CustomEvent('frameset', { detail: {datestr}}))
        }, 10)
    }
}




stateChanged() {   Lit_Render(this.template(this.s), this);   }




private async set(begin:int, bucket:str, msr:str, fields:Field[], tags:Tag[], type:str, intrv:int, nifl:int, ppf:int, aggr:bool, tmzncy:str, ismdn:bool, lowhigh:str, unitterms:str) {   return new Promise(async (res, _rej)=> {

    const { fps, divisor } = await this.get_data(begin, bucket, msr, fields, tags, intrv, nifl, ppf, aggr, ismdn )

    this.stateChanged();

    this.render_graph_frame(type, fps, divisor, (intrv*nifl), tmzncy, lowhigh, unitterms )

    res(1)
})}




private get_data(begin:int, bucket:str, msr:str, fields:Field[], tags:Tag[], intrv:int, nifl:int, ppf:int, aggr:bool, ismdn:bool) {   return new Promise<any>(async (res, _rej)=> {

    let end = ismdn ? ( begin + 86400 ) : begin + (intrv * ppf)
    let divisor = ppf / nifl

    const fps:FPS[] = await this.grab_graph_data(bucket, msr, fields, tags, begin, end, intrv, aggr)

    res( { fps, divisor } ) 
})}




private grab_graph_data(bucket:str, msr: str, fields:Field[], tags:Tag[], begin:int, end:int, intrv:int, aggr:bool) {   return new Promise<FPS[]>(async (res, _rej)=> {

    let token = "";

    if (bucket === "PWT")
        token = 'DMXLf9z4x6mPlptmmvt0HM6i9oqPQFTQpSOjeORSa54Dm2O-dyFixw9qm6KCMYbaWB06ityzwy5iul0Oujspzg=='

    else if (bucket === "XEN")
        token = 'pcsqD8RR3DAYqxvGrUhFnC4i82pUMce1kuXRfQP4pvxJAnxwQBCgDlpUAM2dVvjEJ8XvrixQxdwOmKy0kYtvJg=='

    let fieldstr = "";
    let tagstr = "";
    let aggr_str = ""

    for(let i = 0; i < fields.length; i++) {
        fieldstr += `r["_field"] == "${fields[i].name}" or `
    }
    fieldstr = fieldstr.substring(0, fieldstr.length-4)

    for(let i = 0; i < tags.length; i++) {
        tagstr += `r["${tags[i].name}"] == "${tags[i].val}" or `
    }
    tagstr = tagstr.substring(0, tagstr.length-4)
    tagstr = tagstr ? `|> filter(fn: (r) => ` + tagstr + ')' : ''

    if (aggr) {
        aggr_str = `|> window(every: ${intrv}s)\n|> mean()\n|> duplicate(column: "_stop", as: "_time")\n|> window(every: inf)`
    }

    const obj:any = {
        method: "POST",
        headers: {
            'Authorization': `Token ${token}`,
            'Content-type': 'application/vnd.flux',
            'Accept': 'application/csv'
        },
        body: `from(bucket: "${bucket}") 
            |> range(start: ${begin-intrv}, stop: ${end}) 
            |> filter(fn: (r) => r["_measurement"] == "${msr}") 
            |> filter(fn: (r) => ${fieldstr}) 
            ${tagstr}
            |> aggregateWindow(every: ${intrv}s, fn: mean, createEmpty: false)
            |> yield(name: "mean")
            ${aggr_str}`
    };
      
    const d = await (window as any).FetchLassie(`https://us-central1-1.gcp.cloud2.influxdata.com/api/v2/query?org=accounts@risingtiger.com`, obj)
    const points = this.grab_graph_data_process_influx_data(fields, d, begin, end, intrv)
    res(points)      
})}




private grab_graph_data_process_influx_data(fields:Field[], data:any, begin:int, end:int, intrv:int) : FPS[] {

    const rawpoints:FPS[] = []
    const points:FPS[] = []

    for(let i = 0; i < fields.length; i++) {
        rawpoints.push( { f: fields[i], points:[] } )
        points.push(    { f: fields[i], points:[] } )
    }

    let x = data.substring(data.indexOf("\n") + 1);
    x.split("\n").forEach((m:any)=> {
        if (m.length < 20)
            return

        const c = m.split(",");
        const f = rawpoints.find(rp => rp.f.name === c[7].trim())
        const d = new Date(c[5].trim())
        f.points.push({x: Math.round(d.getTime()/1000), y: Number(c[6].trim()), d } )
    })

    // line up all points at interval between begin and end time stamps. 
    // at each while loop run through rawpoints looking for a match. if not found set that point at that time as null so 
    // we can show a visual gap on th graph chart

    let l = begin

    while (l <= end) {

        rawpoints.forEach((f, index)=> {

            let matchfound = false

            f.points.forEach(ff=> {
                if (ff.x >= l && ff.x < l+intrv) {
                    points[index].points.push({x: l, y: ff.y, d: ff.d})
                    matchfound = true
                    return
                }
            })

            if (!matchfound)
                points[index].points.push({x: l, y:null, d: new Date(l*1000)})
        })

        l = l + intrv
    }

    return points
}




private render_graph_frame(type:str, fps:FPS[], divisor:number, labelint:int, tmzncy:str, lowhigh:str, unitterms:str) : any {

    const low = Number(lowhigh.split(",")[0])
    const high = Number(lowhigh.split(",")[1])

    const y_ticks:int[] = []
    const increment = Math.round((high - low) / 10)
    let current = low
    while (current <= high) {
        y_ticks.push(current)
        current += increment
    }

    const series = fps.map(fp=> { 
        return {
            name: fp.f.name,
            data: fp.points
        }
    })

    let el = this.querySelector(`.ct-chart`)

    el.innerHTML = ""

    let opts = {
        showPoint: false,
        fullWidth: true,
        chartPadding: {
            right: 20
        },
        axisY: {
            onlyInteger: true,
            type: Chartist_FixedScaleAxis,
            ticks: y_ticks,
            low,
            high,
            labelInterpolationFnc: (val:int, _indx:int) => {
                return `${val}${unitterms.split(",")[1]}`
            }
        },
        axisX: {
            onlyInteger: true,
            type: Chartist_FixedScaleAxis,
            ticks: fps[0].points.map((p, _index)=> p.x),
            low: fps[0].points[0].x,
            high: fps[0].points[fps[0].points.length-1].x,
            showGrid: true,
            fullWidth: true,
            labelInterpolationFnc: (_unixstamp:number, index:number) => {
                const hrs = fps[0].points[index].d.getHours()
                let hr12 = ""

                if (hrs === 0)
                    hr12 = "12am"
                else if (hrs === 12)
                    hr12 = "12pm"
                else if (hrs < 12)
                    hr12 = hrs + "am"
                else
                    hr12 = (hrs - 12) + "pm"

                return index % 2 === 0 ? hr12 : null;
            }
        }
    }

    var data_ = {
        labels: fps[0].points.map((p, _index)=> p.x.toString()),
        series: series.map(s=> { return s.data.map(d=> d.y) })
    };

    var options_ = {
        fullWidth: true,
        chartPadding: {
            right: 20
        },
        high,
        low,
        axisY: {
            onlyInteger: true,
            labelInterpolationFnc: (val:int, _indx:int) => {
                return `${val}${unitterms.split(",")[1]}`
            }
        },
        axisX: {
            labelInterpolationFnc: function(value:any, index:any) {
                const hrs = fps[0].points[index].d.getHours()
                let hr12 = ""

                if (hrs === 0)
                    hr12 = "12am"
                else if (hrs === 12)
                    hr12 = "12pm"
                else if (hrs < 12)
                    hr12 = hrs + "am"
                else
                    hr12 = (hrs - 12) + "pm"

                return index % 2 === 0 ? hr12 : null;
            }
        }
    }

    const graph = (type === "line") ? new Chartist_LineChart(el, { series }, opts) : new Chartist_BarChart(el, data_, options_)    
    graph.update()
    return graph

    /*
    function renderit_line(elwrapper:HTMLElement, opts?:any) {
      let graph = new Chartist_LineChart(elwrapper, 
        { series },
        {
          showPoint: false,
          fullWidth: true,
          chartPadding: {
            right: 20
          },
          axisY: {
            onlyInteger: true,
            type: Chartist_FixedScaleAxis,
            ticks: y_ticks,
            low,
            high,
            labelInterpolationFnc: (val:int, _indx:int) => {
                return `${val}${unitterms.split(",")[1]}`
            }
          },
          axisX: {
            onlyInteger: true,
            type: Chartist_FixedScaleAxis,
            ticks: fps[0].points.map((p, _index)=> p.x),
            low: fps[0].points[0].x,
            high: fps[0].points[fps[0].points.length-1].x,
            showGrid: true,
            fullWidth: true,
            labelInterpolationFnc: (_unixstamp:number, index:number) => {
                const hrs = fps[0].points[index].d.getHours()
                let hr12 = ""

                if (hrs === 0)
                    hr12 = "12am"
                else if (hrs === 12)
                    hr12 = "12pm"
                else if (hrs < 12)
                    hr12 = hrs + "am"
                else
                    hr12 = (hrs - 12) + "pm"

                return hr12
            }
          },
        }
      )

      graph.update()

      return graph
    }
    */
}




  template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 

}




customElements.define('c-graphing', CGraphing);




export {  }
