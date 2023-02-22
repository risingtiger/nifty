(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/views/machine/machine.ts
  var VMachine = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s, _machine) => {
        return Lit_Html`<style>

v-machine {



}


/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5lL21hY2hpbmUuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7Ozs7QUFJQSIsImZpbGUiOiJwd2FwcC9zdGF0aWMvdmlld3MvbWFjaGluZS9tYWNoaW5lLmNzcyIsInNvdXJjZXNDb250ZW50IjpbIlxuXG52LW1hY2hpbmUge1xuXG5cblxufVxuXG4iXX0= */</style>

<header class="viewheader">
  <a class="left" @click="${()=>window.location.hash='machines'}"><span>‸</span><span>machines</span></a>
  <div class="middle"><h1>${_machine.store.name} - ${_machine.mchId}</h1></div>
  <div class="right">
    <i class="icon-refresh" @click="${()=>{ this._refresh(); }}" style="font-size: 20px;padding-right: 11px;"></i>
    <i class="icon-edit1" @click="${()=>{ this._showEditUI(); }}" style="font-size: 25px;position: relative;top: -2px; padding-right: 4px;"></i>
    <i class="icon-location" @click="${()=>{ this._showMap(); }}" style="font-size: 19px;position: relative;top: 1px; padding-right: 8px;"></i>
    <i class="icon-graph" @click="${()=>{ window.location.hash='machinetelemetry/'+_machine.mchId; }}" style="font-size: 19px;position: relative;top: 1px;"></i>
  </div>
</header>


<div class="content">

  <v-machine-statuses machineid="${_machine.id}" mchId="${_machine.mchId}" totalmeters="${JSON.stringify(_machine.meters)}" incrs="${JSON.stringify(_machine.incrs)}" timezone="${_machine.timezone}"></v-machine-statuses>

</div>



<v-machine-edit machine="${_machine.id}" ddomgo="${_s.showEdit}"></v-machine-edit>

<v-machine-map ddomgo="${_s.showMap}" paccount="${_machine.particle.account}" pid="${_machine.particle.id}" lat="${_machine.gps[0]}" lon="${_machine.gps[1]}" type="${_machine.gps[2]}" ts="${_machine.gps[3]}"></v-machine-map>

<v-machine-telemetry ddomgo="${_s.showTelemetry}" mchId="${_machine.mchId}" timezone="${_machine.timezone}"></v-machine-telemetry>




`;
      };
      this.$ = this.querySelector;
      this.s = {
        showEdit: false,
        showMap: false
      };
      this.machine = null;
    }
    async connectedCallback() {
      this.machine = await this.get_machine_data();
      this.stateChanged();
      this.$("v-machine-map").addEventListener("requested_close", () => {
        this.s.showMap = false;
        this.stateChanged();
      });
      this.$("v-machine-edit").addEventListener("requested_close", () => {
        this.s.showEdit = false;
        this.stateChanged();
      });
      this.$("v-machine-statuses").addEventListener("hydrate", () => this.dispatchEvent(new Event("hydrate")));
    }
    stateChanged() {
      Lit_Render(this.template(this.s, this.machine), this);
    }
    get_machine_data() {
      return new Promise(async (res, _rej) => {
        const alldatain = await FSQss([["machines", "doc", this.getAttribute("urlmatches")]]);
        res(alldatain[0]);
      });
    }
    async _refresh() {
      this.machine = await this.get_machine_data();
      this.$("v-machine-statuses").setAttribute("refresh", Math.random);
      this.stateChanged();
      alert("Refreshed");
    }
    _showEditUI() {
      this.s.showEdit = true;
      this.stateChanged();
    }
    async _showMap() {
      this.s.showMap = true;
      this.stateChanged();
    }
  };
  customElements.define("v-machine", VMachine);
})();
