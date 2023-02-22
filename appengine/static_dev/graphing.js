(() => {
  // static/components/graphing/graphing.ts
  var CGraphing = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s) => {
        return Lit_Html`<style>

c-graphing {
  display: block;
}
c-graphing .ct-chart .ct-series-a .ct-line {
      stroke-width: 2px;
      stroke: #0091e8;
    }






/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YXRpYy9jb21wb25lbnRzL2dyYXBoaW5nL2dyYXBoaW5nLmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0VBQ0UsY0FBYztBQVNoQjtBQUxJO01BQ0UsaUJBQWlCO01BQ2pCLGVBQWU7SUFDakIiLCJmaWxlIjoic3RhdGljL2NvbXBvbmVudHMvZ3JhcGhpbmcvZ3JhcGhpbmcuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbmMtZ3JhcGhpbmcge1xuICBkaXNwbGF5OiBibG9jaztcblxuICAmIC5jdC1jaGFydCB7XG5cbiAgICAmIC5jdC1zZXJpZXMtYSAuY3QtbGluZSB7XG4gICAgICBzdHJva2Utd2lkdGg6IDJweDtcbiAgICAgIHN0cm9rZTogIzAwOTFlODtcbiAgICB9XG4gIH1cbn1cblxuXG5cblxuXG4iXX0= */</style>

<div class="ct-chart ct-minor-sixth"></div>


<div class="ctrlbtns">
  <button class="btn" @click="${()=>this.goBackOneDay()}">PREVIOUS DAY</button>
  <button class="btn" @click="${()=>this.goNextOneDay()}">NEXT DAY</button>
</div>
`;
      };
      this.s = {
        bucket: "",
        msr: "",
        fields: [],
        tags: [],
        intrv: 300,
        nifl: 12,
        ppf: 288,
        ismdn: true,
        begin: 0,
        tmzncy: ""
      };
    }
    async connectedCallback() {
      const fieldsstr = this.getAttribute("fields");
      const tagsstr = this.getAttribute("tags") || "";
      this.s.bucket = this.getAttribute("bucket");
      this.s.msr = this.getAttribute("measurement");
      this.s.fields = (fieldsstr?.split(",")).map((f) => {
        return { name: f };
      });
      if (tagsstr)
        this.s.tags = (tagsstr?.split(",")).map((f) => {
          const sp = f.split(":");
          return { name: sp[0], val: sp[1] };
        });
      else
        this.s.tags = [];
      this.s.tmzncy = this.getAttribute("tmzncy");
      this.s.begin = this.getLocalizedMidnight(this.s.tmzncy);
      const datestr = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { timeZone: "America/" + this.s.tmzncy });
      await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.intrv, this.s.nifl, this.s.ppf, this.s.tmzncy, this.s.ismdn);
      this.dispatchEvent(new Event("hydrate"));
      this.dispatchEvent(new CustomEvent("frameset", { detail: { datestr } }));
    }
    stateChanged() {
      Lit_Render(this.template(this.s), this);
    }
    async goBackOneDay() {
      this.s.begin = this.s.begin - 86400;
      const datestr = new Date(this.s.begin * 1e3).toLocaleDateString("en-US", { timeZone: "America/" + this.s.tmzncy });
      await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.intrv, this.s.nifl, this.s.ppf, this.s.tmzncy, true);
      this.dispatchEvent(new CustomEvent("frameset", { detail: { datestr } }));
    }
    async goNextOneDay() {
      this.s.begin = this.s.begin + 86400;
      const datestr = new Date(this.s.begin * 1e3).toLocaleDateString("en-US", { timeZone: "America/" + this.s.tmzncy });
      await this.set(this.s.begin, this.s.bucket, this.s.msr, this.s.fields, this.s.tags, this.s.intrv, this.s.nifl, this.s.ppf, this.s.tmzncy, true);
      this.dispatchEvent(new CustomEvent("frameset", { detail: { datestr } }));
    }
    async set(begin, bucket, msr, fields, tags, intrv, nifl, ppf, tmzncy, ismdn) {
      return new Promise(async (res, _rej) => {
        const { fps, divisor } = await this.getData(begin, bucket, msr, fields, tags, intrv, nifl, ppf, ismdn);
        this.stateChanged();
        this.renderGraphFrame(fps, divisor, intrv * nifl, tmzncy);
        res(1);
      });
    }
    getLocalizedMidnight(city) {
      const timeLocalized = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + city });
      const nowUTC = Date.now() / 1e3;
      const s = timeLocalized.split(":");
      const hourseconds = Number(s[0]) * 3600;
      const minuteseconds = Number(s[1]) * 60;
      const seconds = Number(s[2]);
      const secondsPastMidnight = hourseconds + minuteseconds + seconds;
      return Math.floor(nowUTC - secondsPastMidnight);
    }
    getData(begin, bucket, msr, fields, tags, intrv, nifl, ppf, ismdn) {
      return new Promise(async (res, _rej) => {
        let end = ismdn ? begin + 86400 : begin + intrv * ppf;
        let divisor = this.s.ppf / nifl;
        const fps = await this.grabGraphData(bucket, msr, fields, tags, begin, end, intrv);
        res({ fps, divisor });
      });
    }
    grabGraphData(bucket, msr, fields, tags, begin, end, intrv) {
      return new Promise((res, _rej) => {
        let token = "";
        if (bucket === "PWT")
          token = "DMXLf9z4x6mPlptmmvt0HM6i9oqPQFTQpSOjeORSa54Dm2O-dyFixw9qm6KCMYbaWB06ityzwy5iul0Oujspzg==";
        else if (bucket === "XEN")
          token = "pcsqD8RR3DAYqxvGrUhFnC4i82pUMce1kuXRfQP4pvxJAnxwQBCgDlpUAM2dVvjEJ8XvrixQxdwOmKy0kYtvJg==";
        let fieldstr = "";
        let tagstr = "";
        for (let i = 0; i < fields.length; i++) {
          fieldstr += `r["_field"] == "${fields[i].name}" or `;
        }
        fieldstr = fieldstr.substring(0, fieldstr.length - 4);
        for (let i = 0; i < tags.length; i++) {
          tagstr += `r["${tags[i].name}"] == "${tags[i].val}" or `;
        }
        tagstr = tagstr.substring(0, tagstr.length - 4);
        tagstr = tagstr ? `|> filter(fn: (r) => ` + tagstr + ")" : "";
        const obj = {
          method: "POST",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-type": "application/vnd.flux",
            "Accept": "application/csv"
          },
          body: `from(bucket: "${bucket}") 
          |> range(start: ${begin - intrv}, stop: ${end - intrv}) 
          |> filter(fn: (r) => r["_measurement"] == "${msr}") 
          |> filter(fn: (r) => ${fieldstr}) 
          ${tagstr}
          |> aggregateWindow(every: ${intrv}s, fn: mean, createEmpty: false)
          |> yield(name: "mean")`
        };
        fetch(`https://us-central1-1.gcp.cloud2.influxdata.com/api/v2/query?org=accounts@risingtiger.com`, obj).then((response) => response.text()).then((data) => {
          let points = this.grabGraphData_processInfluxData(fields, data, begin, end, intrv);
          res(points);
        }).catch((_) => {
          window.location.href = "/?errmsg=graphingInfluxDBFail";
        });
      });
    }
    grabGraphData_processInfluxData(fields, data, begin, end, intrv) {
      const rawpoints = [];
      const points = [];
      for (let i = 0; i < fields.length; i++) {
        rawpoints.push({ f: fields[i], points: [] });
        points.push({ f: fields[i], points: [] });
      }
      let x = data.substring(data.indexOf("\n") + 1);
      x.split("\n").forEach((m) => {
        if (m.length < 20)
          return;
        const c = m.split(",");
        const f = rawpoints.find((i) => i.f.name === c[7].trim());
        f?.points.push({ x: Math.round(new Date(c[5].trim()).getTime() / 1e3), y: Number(c[6].trim()) });
      });
      let l = begin;
      while (l <= end) {
        rawpoints.forEach((f, index) => {
          let matchfound = false;
          f.points.forEach((ff) => {
            if (ff.x >= l && ff.x < l + intrv) {
              points[index].points.push({ x: new Date(l * 1e3), y: ff.y });
              matchfound = true;
              return;
            }
          });
          if (!matchfound)
            points[index].points.push({ x: new Date(l * 1e3), y: null });
        });
        l = l + intrv;
      }
      return points;
    }
    renderGraphFrame(fps, divisor, labelint, tmzncy) {
      let thisframebegin = Math.floor(fps[0].points[0].x.getTime() / 1e3);
      const series = fps.map((fp) => {
        return {
          name: fp.f.name,
          data: fp.points
        };
      });
      let graph = new Chartist_LineChart(
        this.querySelector(`.ct-chart`),
        { series },
        {
          showPoint: false,
          axisX: {
            onlyInteger: true,
            type: Chartist_FixedScaleAxis,
            divisor,
            showGrid: true,
            labelInterpolationFnc: (_unixstamp, index) => {
              const x = thisframebegin + labelint * index;
              const d = new Date(x * 1e3);
              const s = d.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + tmzncy });
              const sp = s.split(":");
              return sp[0];
            }
          }
        }
      );
      graph.update();
      return graph;
    }
  };
  customElements.define("c-graphing", CGraphing);
})();
