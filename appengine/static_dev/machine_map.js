(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/views/machine_map/machine_map.ts
  var VMachineMap = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s, _lat, _lon) => {
        return Lit_Html`<style>

  v-machine-map #map_info {
    margin-top: 9px;
    display: flex;
    justify-content: space-evenly;
  }
v-machine-map #map_info > div {
      width: 40%;
      text-align: center;
      padding: 11px 12px;
      font-weight: bold;
    }
v-machine-map #map_info > div > ion-icon {
        font-size: 24px;
        position: relative;
        color: #10aa4c;
        top: 5px;
      }
v-machine-map #map_info > div > ion-icon.atstore {
        color: green;
      }
v-machine-map #map_info > div > ion-icon.notatstore {
        color: red;
      }
v-machine-map #map_info > div:nth-child(1) {
    }
v-machine-map #map_info > div:nth-child(2) {
    }


/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5lX21hcC9tYWNoaW5lX21hcC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7RUFJRTtJQUNFLGVBQWU7SUFDZixhQUFhO0lBQ2IsNkJBQTZCO0VBMEIvQjtBQXZCRTtNQUNFLFVBQVU7TUFDVixrQkFBa0I7TUFDbEIsa0JBQWtCO01BQ2xCLGlCQUFpQjtJQWNuQjtBQVpFO1FBQ0UsZUFBZTtRQUNmLGtCQUFrQjtRQUNsQixjQUFjO1FBQ2QsUUFBUTtNQUNWO0FBQ0E7UUFDRSxZQUFZO01BQ2Q7QUFDQTtRQUNFLFVBQVU7TUFDWjtBQUVGO0lBQ0E7QUFDQTtJQUNBIiwiZmlsZSI6InB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5lX21hcC9tYWNoaW5lX21hcC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJcblxudi1tYWNoaW5lLW1hcCB7XG5cbiAgJiAjbWFwX2luZm8ge1xuICAgIG1hcmdpbi10b3A6IDlweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtZXZlbmx5O1xuXG5cbiAgICAmID4gZGl2IHtcbiAgICAgIHdpZHRoOiA0MCU7XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICBwYWRkaW5nOiAxMXB4IDEycHg7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcblxuICAgICAgJiA+IGlvbi1pY29uIHtcbiAgICAgICAgZm9udC1zaXplOiAyNHB4O1xuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gICAgICAgIGNvbG9yOiAjMTBhYTRjO1xuICAgICAgICB0b3A6IDVweDtcbiAgICAgIH1cbiAgICAgICYgPiBpb24taWNvbi5hdHN0b3JlIHtcbiAgICAgICAgY29sb3I6IGdyZWVuO1xuICAgICAgfVxuICAgICAgJiA+IGlvbi1pY29uLm5vdGF0c3RvcmUge1xuICAgICAgICBjb2xvcjogcmVkO1xuICAgICAgfVxuICAgIH1cbiAgICAmID4gZGl2Om50aC1jaGlsZCgxKSB7XG4gICAgfVxuICAgICYgPiBkaXY6bnRoLWNoaWxkKDIpIHtcbiAgICB9XG4gIH1cblxufVxuXG4iXX0= */</style>

<c-overlay size="medium" closebtn="true" showheader="true" show="false">

<!--<span slot="headermiddle">Location</span>-->

  <iframe 
    width="100%" 
    height="80%" 
    frameborder="0" 
    src="https://www.google.com/maps/embed/v1/place?key=AIzaSyCGeIYK8t4IZuhyAf7z_xsFTjGZKIHePHI&q=${_lat},${_lon}&zoom=10&maptype=roadmap"
    allowfullscreen
    style="border-bottom: 3px solid #a0a0a0;">
  </iframe>

  <div id="map_info">
    <div>
      ${ _s.locatedvia === "celltower" ? Lit_Html`<ion-icon name="cellular"></ion-icon> Located Via Cellular` : Lit_Html`<ion-icon name="locate"></ion-icon> Located Via GPS` }
    </div>
  </div>

</c-overlay>
`;
      };
      this.$ = this.querySelector;
      this.s = {
        locatedvia: null
      };
    }
    async Activate() {
      return new Promise(async (res) => {
        this.particleaccount = this.getAttribute("paccount");
        this.particleid = this.getAttribute("pid");
        const lat = Number(this.getAttribute("lat")) || 0;
        const lon = Number(this.getAttribute("lon")) || 0;
        const type = Number(this.getAttribute("type")) || 0;
        const ts = Number(this.getAttribute("ts")) || 0;
        if (type === 2 && ts > Date.now() / 1e3 - 86400 && lat !== 0 && lon !== 0) {
          this.lat = lat;
          this.lon = lon;
          this.s.locatedvia = "gpschip";
        } else {
          const gpsreturndataP = await fetch(`/api/locatechip?particleaccount=${this.particleaccount}&particleid=${this.particleid}`);
          const gpsreturndata = await gpsreturndataP.json();
          this.lat = gpsreturndata[0];
          this.lon = gpsreturndata[1];
          this.s.locatedvia = "celltower";
        }
        this.stateChanged();
        res(1);
      });
    }
    stateChanged() {
      Lit_Render(this.template(this.s, this.lat, this.lon), this);
    }
  };
  customElements.define("v-machine-map", VMachineMap);
})();
