(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/views/machinetelemetry/machinetelemetry.ts
  var VMachineTelemetry = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s) => Lit_Html`<style>

  v-machinetelemetry c-graphing {
    width: 100%;
    box-sizing: border-box;
    padding-left: 12px;
  }







/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5ldGVsZW1ldHJ5L21hY2hpbmV0ZWxlbWV0cnkuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBSUU7SUFDRSxXQUFXO0lBQ1gsc0JBQXNCO0lBQ3RCLGtCQUFrQjtFQUNwQiIsImZpbGUiOiJwd2FwcC9zdGF0aWMvdmlld3MvbWFjaGluZXRlbGVtZXRyeS9tYWNoaW5ldGVsZW1ldHJ5LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG52LW1hY2hpbmV0ZWxlbWV0cnkge1xuXG4gICYgYy1ncmFwaGluZyB7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBwYWRkaW5nLWxlZnQ6IDEycHg7XG4gIH1cblxufVxuXG5cblxuXG5cblxuIl19 */</style>

<header class="viewheader">
  <a class="left" @click="${()=>window.history.back()}"><span>‸</span><span>machines</span></a>
  <div class="middle"><h1>${_s.mchId} Filter PSI -- ${_s.datestr}</h1></div>
</header>

<div class="content">

  <div class="ct-chart"></div>

  <c-graphing tmzncy="Denver" bucket="PWT" measurement="PSI" fields="Filter" tags="mchId:${_s.mchId}"></c-graphing>

</div>


`;
      this.$ = this.querySelector;
      this.s = {
        mchId: "",
        begintime: 0,
        datestr: "",
        timezone: ""
      };
      this.graphingel = null;
    }
    connectedCallback() {
      this.s.mchId = this.getAttribute("urlmatches");
      this.s.timezone = this.getAttribute("timezone") || "Denver";
      this.s.begintime = this.getMachinesMidnightUTCTime(this.s.timezone);
      this.s.datestr = this.getLocalizedDateStr(this.s.begintime, this.s.timezone);
      this.stateChanged();
      this.graphingel = this.$("c-graphing");
      this.graphingel.addEventListener("frameset", (ev) => {
        this.s.datestr = ev.detail.datestr;
        this.stateChanged();
      });
      this.graphingel.addEventListener("hydrate", () => this.dispatchEvent(new Event("hydrate")));
    }
    stateChanged() {
      Lit_Render(this.template(this.s), this);
    }
    getLocalizedDateStr(begintime, city) {
      return new Date(begintime * 1e3).toLocaleDateString("en-US", { timeZone: "America/" + city });
    }
    getMachinesMidnightUTCTime(city) {
      const timeLocalized = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + city });
      const nowUTC = Date.now() / 1e3;
      const s = timeLocalized.split(":");
      const hourseconds = Number(s[0]) * 3600;
      const minuteseconds = Number(s[1]) * 60;
      const seconds = Number(s[2]);
      const secondsPastMidnight = hourseconds + minuteseconds + seconds;
      const localizedMidnight = Math.floor(nowUTC - secondsPastMidnight);
      return localizedMidnight;
    }
  };
  customElements.define("v-machinetelemetry", VMachineTelemetry);
})();
