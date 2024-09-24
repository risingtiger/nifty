class CGraphing extends HTMLElement {
    s;
    m;
    shadow;
    static get observedAttributes() {
        return [
            'runupdate'
        ];
    }
    constructor(){
        super();
        this.s = {
            bucket: "",
            msr: "",
            fields: "",
            tags: "",
            type: "line",
            intrv: 300,
            ppf: 288,
            priors: "",
            ismdn: true,
            lowhigh: "",
            unitterms: "",
            begin: 0,
            tmzncy: ""
        };
        this.shadow = this.attachShadow({
            mode: 'open'
        });
    }
    async attributeChangedCallback(name, oldValue, newValue) {
        if (name === "runupdate" && newValue !== oldValue) {
            setTimeout(async ()=>{
                this.s.bucket = this.getAttribute("bucket");
                this.s.msr = this.getAttribute("measurement");
                this.s.fields = this.getAttribute("fields");
                this.s.tags = this.getAttribute("tags");
                this.s.type = this.getAttribute("type");
                this.s.intrv = Number(this.getAttribute("intrv"));
                this.s.ppf = Number(this.getAttribute("ppf"));
                this.s.priors = this.getAttribute("priors");
                this.s.ismdn = this.getAttribute("ismdn") === "true";
                this.s.lowhigh = this.getAttribute("lowhigh");
                this.s.unitterms = this.getAttribute("unitterms");
                this.s.begin = Number(this.getAttribute("begintime"));
                this.s.tmzncy = this.getAttribute("tmzncy");
                const end = this.s.ismdn ? this.s.begin + 86400 : this.s.begin + this.s.intrv * this.s.ppf;
                this.sc();
                // lets take an example. Say, at 2:03am the machine records 10 gallons and then again at 2:46am records 20 gallons. 
                //   The machine stores those records and then sums them at 3:00am. So now the telemetry's timestamp at 3:00am will show 30 gallons. 
                //   But those gallons didn't happen at 3:00am. They happened during the preceding hour. 
                // Now, the problem is that influxdb gets a telemetry point of 30 gallons at 3:00am and is assuming those gallons happened at 3:00am.
                // If you run a influx query and ask for gallons between 2:00am and 3:00am it actually returns 0 gallons because that timestamp is at 3:00am.
                // If you ask for gallons between 3:00am and 4:00am it returns 30 gallons which is not correct. 
                // The problem gets exasperated when you ask influx to aggregate the data into time windows. If you do that it actually aggregates the gallons 
                // to 4am instead of 3am. So, a reading that occured at 2:03am at the machine actually gets slotted at the 4am aggregated time window frame.
                // thats why I'm moving the begin and end dates around so the graph will actually show gallons at the 2am x frame, which is 2 frames back from influxdb aggregated time window
                // kinda funky I know.
                //const actual_begin = this.s.begin + this.s.intrv
                //const actual_end = end + this.s.intrv
                //const queries_list = await InfluxDB.Retrieve_Series(this.s.bucket, [actual_begin], [actual_end], [this.s.msr], [this.s.fields], [this.s.tags], [this.s.intrv], [this.s.priors])
                /*
                queries_list[0].forEach((q:any)=> {
                    q.points.forEach((p:any)=> {
                        const s = Math.floor(p.date.getTime() / 1000 - (this.s.intrv * 2))
                        p.date = new Date(s * 1000)
                    })
                })
                */ // .... AND now all that crap in previous comments is irrelevant 
                const queries_list = await InfluxDB.Retrieve_Series(this.s.bucket, [
                    this.s.begin
                ], [
                    end
                ], [
                    this.s.msr
                ], [
                    this.s.fields
                ], [
                    this.s.tags
                ], [
                    this.s.intrv
                ], [
                    this.s.priors
                ]);
                render_graph_frame(this.shadow.querySelector('.ct-chart'), this.s.type, queries_list[0], this.s.lowhigh, this.s.unitterms);
                this.sc();
                this.dispatchEvent(new Event('hydrated'));
            }, 10);
        }
    }
    sc() {
        Lit_Render(this.template(this.s, this.m), this.shadow);
    }
    template = (_s, _m)=>{
        return Lit_Html`<style>

:host {
    display: block;
}

.ct-label{fill:rgba(0,0,0,.4);color:rgba(0,0,0,.4);font-size:.75rem;line-height:1}.ct-chart-bar .ct-label,.ct-chart-line .ct-label{display:flex}.ct-chart-donut .ct-label,.ct-chart-pie .ct-label{dominant-baseline:central}.ct-label.ct-horizontal.ct-start{align-items:flex-end;justify-content:flex-start;text-align:left}.ct-label.ct-horizontal.ct-end{align-items:flex-start;justify-content:flex-start;text-align:left}.ct-label.ct-vertical.ct-start{align-items:flex-end;justify-content:flex-end;text-align:right}.ct-label.ct-vertical.ct-end{align-items:flex-end;justify-content:flex-start;text-align:left}.ct-chart-bar .ct-label.ct-horizontal.ct-start{align-items:flex-end;justify-content:center;text-align:center}.ct-chart-bar .ct-label.ct-horizontal.ct-end{align-items:flex-start;justify-content:center;text-align:center}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-horizontal.ct-start{align-items:flex-end;justify-content:flex-start;text-align:left}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-horizontal.ct-end{align-items:flex-start;justify-content:flex-start;text-align:left}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-vertical.ct-start{align-items:center;justify-content:flex-end;text-align:right}.ct-chart-bar.ct-horizontal-bars .ct-label.ct-vertical.ct-end{align-items:center;justify-content:flex-start;text-align:left}.ct-grid{stroke:rgba(0,0,0,.2);stroke-width:1px;stroke-dasharray:2px}.ct-grid-background{fill:none}.ct-point{stroke-width:10px;stroke-linecap:round}.ct-line{fill:none;stroke-width:4px}.ct-area{stroke:none;fill-opacity:.1}.ct-bar{fill:none;stroke-width:10px}.ct-slice-donut{fill:none;stroke-width:60px}.ct-series-a .ct-bar,.ct-series-a .ct-line,.ct-series-a .ct-point,.ct-series-a .ct-slice-donut{stroke:#d70206}.ct-series-a .ct-area,.ct-series-a .ct-slice-pie{fill:#d70206}.ct-series-b .ct-bar,.ct-series-b .ct-line,.ct-series-b .ct-point,.ct-series-b .ct-slice-donut{stroke:#f05b4f}.ct-series-b .ct-area,.ct-series-b .ct-slice-pie{fill:#f05b4f}.ct-series-c .ct-bar,.ct-series-c .ct-line,.ct-series-c .ct-point,.ct-series-c .ct-slice-donut{stroke:#f4c63d}.ct-series-c .ct-area,.ct-series-c .ct-slice-pie{fill:#f4c63d}.ct-series-d .ct-bar,.ct-series-d .ct-line,.ct-series-d .ct-point,.ct-series-d .ct-slice-donut{stroke:#d17905}.ct-series-d .ct-area,.ct-series-d .ct-slice-pie{fill:#d17905}.ct-series-e .ct-bar,.ct-series-e .ct-line,.ct-series-e .ct-point,.ct-series-e .ct-slice-donut{stroke:#453d3f}.ct-series-e .ct-area,.ct-series-e .ct-slice-pie{fill:#453d3f}.ct-series-f .ct-bar,.ct-series-f .ct-line,.ct-series-f .ct-point,.ct-series-f .ct-slice-donut{stroke:#59922b}.ct-series-f .ct-area,.ct-series-f .ct-slice-pie{fill:#59922b}.ct-series-g .ct-bar,.ct-series-g .ct-line,.ct-series-g .ct-point,.ct-series-g .ct-slice-donut{stroke:#0544d3}.ct-series-g .ct-area,.ct-series-g .ct-slice-pie{fill:#0544d3}.ct-series-h .ct-bar,.ct-series-h .ct-line,.ct-series-h .ct-point,.ct-series-h .ct-slice-donut{stroke:#6b0392}.ct-series-h .ct-area,.ct-series-h .ct-slice-pie{fill:#6b0392}.ct-series-i .ct-bar,.ct-series-i .ct-line,.ct-series-i .ct-point,.ct-series-i .ct-slice-donut{stroke:#e6805e}.ct-series-i .ct-area,.ct-series-i .ct-slice-pie{fill:#e6805e}.ct-series-j .ct-bar,.ct-series-j .ct-line,.ct-series-j .ct-point,.ct-series-j .ct-slice-donut{stroke:#dda458}.ct-series-j .ct-area,.ct-series-j .ct-slice-pie{fill:#dda458}.ct-series-k .ct-bar,.ct-series-k .ct-line,.ct-series-k .ct-point,.ct-series-k .ct-slice-donut{stroke:#eacf7d}.ct-series-k .ct-area,.ct-series-k .ct-slice-pie{fill:#eacf7d}.ct-series-l .ct-bar,.ct-series-l .ct-line,.ct-series-l .ct-point,.ct-series-l .ct-slice-donut{stroke:#86797d}.ct-series-l .ct-area,.ct-series-l .ct-slice-pie{fill:#86797d}.ct-series-m .ct-bar,.ct-series-m .ct-line,.ct-series-m .ct-point,.ct-series-m .ct-slice-donut{stroke:#b2c326}.ct-series-m .ct-area,.ct-series-m .ct-slice-pie{fill:#b2c326}.ct-series-n .ct-bar,.ct-series-n .ct-line,.ct-series-n .ct-point,.ct-series-n .ct-slice-donut{stroke:#6188e2}.ct-series-n .ct-area,.ct-series-n .ct-slice-pie{fill:#6188e2}.ct-series-o .ct-bar,.ct-series-o .ct-line,.ct-series-o .ct-point,.ct-series-o .ct-slice-donut{stroke:#a748ca}.ct-series-o .ct-area,.ct-series-o .ct-slice-pie{fill:#a748ca}.ct-square{display:block;position:relative;width:100%}.ct-square:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:100%}.ct-square:after{content:"";display:table;clear:both}.ct-square>svg{display:block;position:absolute;top:0;left:0}.ct-minor-second{display:block;position:relative;width:100%}.ct-minor-second:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:93.75%}.ct-minor-second:after{content:"";display:table;clear:both}.ct-minor-second>svg{display:block;position:absolute;top:0;left:0}.ct-major-second{display:block;position:relative;width:100%}.ct-major-second:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:88.8888888889%}.ct-major-second:after{content:"";display:table;clear:both}.ct-major-second>svg{display:block;position:absolute;top:0;left:0}.ct-minor-third{display:block;position:relative;width:100%}.ct-minor-third:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:83.3333333333%}.ct-minor-third:after{content:"";display:table;clear:both}.ct-minor-third>svg{display:block;position:absolute;top:0;left:0}.ct-major-third{display:block;position:relative;width:100%}.ct-major-third:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:80%}.ct-major-third:after{content:"";display:table;clear:both}.ct-major-third>svg{display:block;position:absolute;top:0;left:0}.ct-perfect-fourth{display:block;position:relative;width:100%}.ct-perfect-fourth:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:75%}.ct-perfect-fourth:after{content:"";display:table;clear:both}.ct-perfect-fourth>svg{display:block;position:absolute;top:0;left:0}.ct-perfect-fifth{display:block;position:relative;width:100%}.ct-perfect-fifth:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:66.6666666667%}.ct-perfect-fifth:after{content:"";display:table;clear:both}.ct-perfect-fifth>svg{display:block;position:absolute;top:0;left:0}.ct-minor-sixth{display:block;position:relative;width:100%}.ct-minor-sixth:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:62.5%}.ct-minor-sixth:after{content:"";display:table;clear:both}.ct-minor-sixth>svg{display:block;position:absolute;top:0;left:0}.ct-golden-section{display:block;position:relative;width:100%}.ct-golden-section:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:61.804697157%}.ct-golden-section:after{content:"";display:table;clear:both}.ct-golden-section>svg{display:block;position:absolute;top:0;left:0}.ct-major-sixth{display:block;position:relative;width:100%}.ct-major-sixth:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:60%}.ct-major-sixth:after{content:"";display:table;clear:both}.ct-major-sixth>svg{display:block;position:absolute;top:0;left:0}.ct-minor-seventh{display:block;position:relative;width:100%}.ct-minor-seventh:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:56.25%}.ct-minor-seventh:after{content:"";display:table;clear:both}.ct-minor-seventh>svg{display:block;position:absolute;top:0;left:0}.ct-major-seventh{display:block;position:relative;width:100%}.ct-major-seventh:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:53.3333333333%}.ct-major-seventh:after{content:"";display:table;clear:both}.ct-major-seventh>svg{display:block;position:absolute;top:0;left:0}.ct-octave{display:block;position:relative;width:100%}.ct-octave:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:50%}.ct-octave:after{content:"";display:table;clear:both}.ct-octave>svg{display:block;position:absolute;top:0;left:0}.ct-major-tenth{display:block;position:relative;width:100%}.ct-major-tenth:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:40%}.ct-major-tenth:after{content:"";display:table;clear:both}.ct-major-tenth>svg{display:block;position:absolute;top:0;left:0}.ct-major-eleventh{display:block;position:relative;width:100%}.ct-major-eleventh:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:37.5%}.ct-major-eleventh:after{content:"";display:table;clear:both}.ct-major-eleventh>svg{display:block;position:absolute;top:0;left:0}.ct-major-twelfth{display:block;position:relative;width:100%}.ct-major-twelfth:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:33.3333333333%}.ct-major-twelfth:after{content:"";display:table;clear:both}.ct-major-twelfth>svg{display:block;position:absolute;top:0;left:0}.ct-double-octave{display:block;position:relative;width:100%}.ct-double-octave:before{display:block;float:left;content:"";width:0;height:0;padding-bottom:25%}.ct-double-octave:after{content:"";display:table;clear:both}.ct-double-octave>svg{display:block;position:absolute;top:0;left:0}



    .ct-chart {

        & .ct-series { 
            & .ct-line {
                stroke-width: 1.5px;
            }

            & .ct-bar {
            }
        }
        & .ct-series-a .ct-line, & .ct-series-a .ct-bar { stroke: #0091e8; }
        & .ct-series-b .ct-line, & .ct-series-b .ct-bar { stroke: #1eeba7; }
        & .ct-series-c .ct-line, & .ct-series-c .ct-bar { stroke: #eb1e7c; }
        & .ct-series-d .ct-line, & .ct-series-d .ct-bar { stroke: #1ad0ff; }
    }

    .nodata_overlay {
        display: none;
        position: absolute;
        top: 75px;
        left: 50%;
        margin-left: -200px;
        width: 400px;
        height: 120px;
        background-color: #fff;
        padding: 20px 20px 2px 20px;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
        text-align: center;
    }
    .nodata_overlay.active {
        display: block;
    }

    #legend {
        margin: 0 18px 0 49px;
        padding: 10px 0 0 0;
        border-top: 1px solid #e2e2e2;

        & .fields {
            display: flex;

            & .field {
                padding-right: 14px;
                display: flex;

                & .color {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    position: relative;
                    top: 3px;
                    margin-right: 3px;
                }

                & .name {
                    color: #a3a3a3;
                    text-transform: lowercase;
                }
            }
            & .field:first-child {
                & .color {
                    background-color: #0091e8;
                }
            }
            & .field:nth-child(2) {
                & .color {
                    background-color: #1eeba7;
                }
            }

        }

    }





</style>

<div class="ct-chart ct-octave"></div>

`;
    };
}
customElements.define('c-graphing', CGraphing);
function render_graph_frame(el, type, series_list, y_lowhigh, unitterms) {
    const ylow = Number(y_lowhigh.split(",")[0]);
    const yhigh = Number(y_lowhigh.split(",")[1]);
    let data = {
        labels: [],
        series: []
    };
    let x_rangeticks = [];
    let x_disp_str = [];
    data = render_graph_frame___series_to_chartist_data(series_list);
    x_rangeticks = data.labels;
    x_disp_str = render_graph_frame___get_x_disp_str(series_list[0].points.map((p)=>p.date), x_rangeticks.length);
    const opts = render_graph_frame___set_common_opts(x_disp_str, ylow, yhigh, unitterms);
    el.innerHTML = "";
    const graph = type === "line" ? new Chartist_LineChart(el, data, opts) : new Chartist_BarChart(el, data, opts);
    graph.update();
    return graph;
}
function render_graph_frame___get_x_disp_str(point_dates, _ticks_count) {
    const x_disp_str = [];
    point_dates.forEach((d, _index)=>{
        const hrs = d.getHours();
        let hr12 = "";
        if (hrs === 0) hr12 = "12am";
        else if (hrs === 12) hr12 = "12pm";
        else if (hrs < 12) hr12 = hrs + "am";
        else hr12 = hrs - 12 + "pm";
        x_disp_str.push(hr12);
    });
    return x_disp_str;
}
function render_graph_frame___series_to_chartist_data(s) {
    const labels = s[0].points.map((p)=>Math.floor(p.date.getTime() / 1000));
    const series = s.map((ss)=>ss.points.map((p)=>p.val));
    return {
        labels,
        series
    };
}
function render_graph_frame___set_common_opts(x_disp_str, yl, yh, ut) {
    const short_hand_unit_term = ut.split(",")[1];
    return {
        fullWidth: true,
        showPoint: false,
        //chartPadding: {
        //    right: 20
        //},
        axisY: {
            onlyInteger: true,
            low: yl,
            high: yh,
            divisor: 10,
            labelInterpolationFnc: (val, _indx)=>{
                return `${val}${short_hand_unit_term}`;
            }
        },
        axisX: {
            labelInterpolationFnc: (_unixstamp, index)=>{
                return x_disp_str[index];
            }
        }
    };
}
export { };
