

type int = number
type bool = boolean
type str = string


declare var Chartist_LineChart: any;
declare var Chartist_BarChart: any;
declare var Chartist_FixedScaleAxis: any;
declare var Lit_Render: any;
declare var Lit_Html: any;


export type InfluxDBPointT = {
  time: Date,
  value: number
}


type State = {
  bucket: str, // what influxdb  measurement. ex. PSI
  msr: str, // what influxdb  measurement. ex. PSI
  fields: Field[], // what influxdb fields in specified measurement to show. ex. City psi and/or After Filter Psi
  tags: Tag[], // what influxdb tags , Chip Id , etc
  type: str, // line or bar  
  intrv: number, // interval -- how many seconds per point. ex. For 5 minute interval set to 300 (300 seconds in 5 minutes) 
  nifl: number, // nthIntervalForLabel -- nth points to show label on x axis. ex. For showing every hour at the top of the hour for 5 minute increments, set to 12
  ppf: number, // points Per Frame. ex. For One Day with 5 minute increments it will be 288 points
  ismdn: bool, // startAtMidnight -- should graph be positioned where the left most x on the x axis is midnight of current day
  begin: int, // point in time at which graph starts. if ismdn=true, this will be at midnight of local time
  tmzncy: str // time zone city , used to show time in whatever time zone chosen 
}

// InfluxDB has multiple fields per measurement. ex. PSI has City and Afterfilter fields

type Field = { 
  name: str
}

type Tag = { 
  name: str
  val: str
}

// Field Points. Each Field has many points. ex. City PSI will have many points, each being a time stamped value

type FPS = { 
  f: Field, 
  points: {   x: Date|int, y: int|null   }[]
}




class CGraphing extends HTMLElement {

  s:State




  static get observedAttributes() { return ['fields']; }




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
      ismdn: true,
      begin: 0,
      tmzncy: ""
   }
  }




  async attributeChangedCallback(name:str, oldValue:str|bool|int, newValue:str|bool|int) {

    if (name === "fields" && newValue !== oldValue) {

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
        this.s.ismdn = this.getAttribute("ismdn") === "true" 

        if (tagsstr)
          this.s.tags = (tagsstr?.split(",") as str[]).map((f:str)=> { const sp = f.split(":"); return {name:sp[0], val:sp[1]}; } )
        else
          this.s.tags = []

        this.s.tmzncy = this.getAttribute("tmzncy")!

        this.s.begin = get_localized_midnight(this.s.tmzncy)

        const datestr = new Date().toLocaleDateString("en-US", { timeZone: "America/" + this.s.tmzncy })

        await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.type, this.s.intrv, this.s.nifl, this.s.ppf, this.s.tmzncy, this.s.ismdn)

        this.dispatchEvent(new Event('hydrate'))

        this.dispatchEvent(new CustomEvent('frameset', { detail: {datestr}}))
      }, 10)

    }

  }




  stateChanged() {

    Lit_Render(this.template(this.s), this);

  }




  async GoBackOneDay() {

    this.s.begin = this.s.begin - 86400
    const datestr = new Date(this.s.begin*1000).toLocaleDateString("en-US", { timeZone: "America/" + this.s.tmzncy })
    await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.type, this.s.intrv, this.s.nifl, this.s.ppf, this.s.tmzncy, true)
    this.dispatchEvent(new CustomEvent('frameset', { detail: {datestr}}))

  }




  async GoNextOneDay() {

    this.s.begin = this.s.begin + 86400
    const datestr = new Date(this.s.begin*1000).toLocaleDateString("en-US", { timeZone: "America/" + this.s.tmzncy })
    await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.type, this.s.intrv, this.s.nifl, this.s.ppf, this.s.tmzncy, true)
    this.dispatchEvent(new CustomEvent('frameset', { detail: {datestr}}))

  }




  async GoToSelectedDay(e:Event) {

    let datestr = (e.currentTarget as HTMLInputElement).value as str

    this.s.begin = set_begin_from_selected_day(datestr, this.s.tmzncy)

    await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.type, this.s.intrv, this.s.nifl, this.s.ppf, this.s.tmzncy, true)

    this.dispatchEvent(new CustomEvent('frameset', { detail: {datestr}}))

  }



  private async set(begin:int, bucket:str, msr:str, fields:Field[], tags:Tag[], type:str, intrv:int, nifl:int, ppf:int, tmzncy:str, ismdn:bool) {

    return new Promise(async (res, _rej)=> {
      const { fps, divisor } = await this.getData(begin, bucket, msr, fields, tags, intrv, nifl, ppf, ismdn )

      this.stateChanged();

      this.renderGraphFrame(type, fps, divisor, (intrv*nifl), tmzncy )

      res(1)
    })

  }




  private getData(begin:int, bucket:str, msr:str, fields:Field[], tags:Tag[], intrv:int, nifl:int, ppf:int, ismdn:bool) {

    return new Promise<any>(async (res, _rej)=> {
      let end = ismdn ? ( begin + 86400 ) : begin + (intrv * ppf)
      let divisor = ppf / nifl

      const fps:FPS[] = await this.grabGraphData(bucket, msr, fields, tags, begin, end, intrv)

      res( { fps, divisor } ) 
    })

  }




  private grabGraphData(bucket:str, msr: str, fields:Field[], tags:Tag[], begin:int, end:int, intrv:int) {

    return new Promise<FPS[]>((res, _rej)=> {

      let token = "";

      if (bucket === "PWT")
        token = 'DMXLf9z4x6mPlptmmvt0HM6i9oqPQFTQpSOjeORSa54Dm2O-dyFixw9qm6KCMYbaWB06ityzwy5iul0Oujspzg=='

      else if (bucket === "XEN")
        token = 'pcsqD8RR3DAYqxvGrUhFnC4i82pUMce1kuXRfQP4pvxJAnxwQBCgDlpUAM2dVvjEJ8XvrixQxdwOmKy0kYtvJg=='

      let fieldstr = "";
      let tagstr = "";

      for(let i = 0; i < fields.length; i++) {
        fieldstr += `r["_field"] == "${fields[i].name}" or `
      }
      fieldstr = fieldstr.substring(0, fieldstr.length-4)

      for(let i = 0; i < tags.length; i++) {
        tagstr += `r["${tags[i].name}"] == "${tags[i].val}" or `
      }
      tagstr = tagstr.substring(0, tagstr.length-4)
      tagstr = tagstr ? `|> filter(fn: (r) => ` + tagstr + ')' : ''


      const obj:any = {
        method: "POST",
        headers: {
          'Authorization': `Token ${token}`,
          'Content-type': 'application/vnd.flux',
          'Accept': 'application/csv'
        },
        body: `from(bucket: "${bucket}") 
          |> range(start: ${begin-intrv}, stop: ${end-intrv}) 
          |> filter(fn: (r) => r["_measurement"] == "${msr}") 
          |> filter(fn: (r) => ${fieldstr}) 
          ${tagstr}
          |> aggregateWindow(every: ${intrv}s, fn: mean, createEmpty: false)
          |> yield(name: "mean")`
      }

      
      fetch(`https://us-central1-1.gcp.cloud2.influxdata.com/api/v2/query?org=accounts@risingtiger.com`, obj)
        .then(response => response.text())
        .then(data=> {
          let points = this.grabGraphData_processInfluxData(fields, data, begin, end, intrv)
          res(points)      
        })

        .catch(_=> {
          if (!window.location.href.includes("localhost"))
            window.location.href = "/?errmsg=graphingInfluxDBFail";
        })

    })
    
  }




  private grabGraphData_processInfluxData(fields:Field[], data:any, begin:int, end:int, intrv:int) : FPS[] {

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
      const f = rawpoints.find(i => i.f.name === c[7].trim())
      f?.points.push({x: Math.round((new Date(c[5].trim())).getTime()/1000), y: Number(c[6].trim())} )
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
            points[index].points.push({x: new Date(l*1000), y: ff.y})
            matchfound = true
            return
          }
        })

        if (!matchfound)
          points[index].points.push({x: new Date(l*1000), y: null})

      })

      l = l + intrv

    }

    return points

  }




private renderGraphFrame(type:str, fps:FPS[], divisor:number, labelint:int, tmzncy:str) : any {

    let thisframebegin = Math.floor( (fps[0].points[0].x as Date).getTime() / 1000)

    const series = fps.map(fp=> { 
      return {
        name: fp.f.name,
        data: fp.points
      }
    })

    let el = this.querySelector(`.ct-chart`)

    el.innerHTML = ""


    let thegraph = (type === "line") ? renderit_line(this.querySelector(`.ct-chart`)) : renderit_bar(this.querySelector(`.ct-chart`))

    return thegraph


    function renderit_line(elwrapper:HTMLElement) {
      let graph = new Chartist_LineChart(elwrapper, 
        { series },
        {
          showPoint: false,
          axisX: {
            onlyInteger: true,
            type: Chartist_FixedScaleAxis,
            divisor:  divisor,
            showGrid: true,

            labelInterpolationFnc: (_unixstamp:number, index:number) => {
              const x = thisframebegin + ( labelint * index )
              const d = new Date(x * 1000)
              const s = d.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + tmzncy }) 

              const sp = s.split(":")

              return sp[0]
            }

          }
        }
      )

      graph.update()

      return graph
    }


    function renderit_bar(elwrapper:HTMLElement) {
      let graph = new Chartist_BarChart(elwrapper, 
        { series },
        {
          showPoint: false,
          axisX: {
            onlyInteger: true,
            type: Chartist_FixedScaleAxis,
            divisor:  divisor,
            showGrid: true,

            labelInterpolationFnc: (_unixstamp:number, index:number) => {
              const x = thisframebegin + ( labelint * index )
              const d = new Date(x * 1000)
              const s = d.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + tmzncy }) 

              const sp = s.split(":")

              return sp[0]
            }

          }
        }
      )

      graph.update()

      return graph
    }

}




  template = (_s:State) => { return Lit_Html`{--htmlcss--}`; }; 

}




function set_begin_from_selected_day(datestr:str, tmzncy:str) : int {

  const begin = get_localized_midnight_from_datestr(tmzncy, datestr)

  return begin

}




function get_localized_midnight(city:str) : int {

  const timeLocalized = new Date().toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + city })

  return Math.floor( (Date.now() - get_milliseconds_past_midnight(timeLocalized)) / 1000 )

}




function get_localized_midnight_from_datestr(city:str, datestr:str) : int {

  const d = new Date(datestr)

  const timeLocalized = d.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + city })
  const utcstamp = d.getTime() 

  return Math.floor( (utcstamp + get_milliseconds_past_midnight(timeLocalized)) / 1000 )

}




function get_milliseconds_past_midnight(timeLocalized:str) : int {

  const s = timeLocalized.split(":")
  const hourseconds = Number(s[0]) * 3600
  const minuteseconds = Number(s[1]) * 60
  const seconds = Number(s[2])
  const seconds_past_midnight = hourseconds + minuteseconds + seconds

  return seconds_past_midnight * 1000

}




customElements.define('c-graphing', CGraphing);




export {  }
