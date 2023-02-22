(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/views/machine_edit/machine_edit.ts
  var VMachineEdit = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s, _machine) => {
        return Lit_Html`<style>

  v-machine-edit .savingstate {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }


v-machine-edit .savingstate h4 {
      position: absolute;
      width: 100%;
      text-align: center;
      font-size: 20px;
      color: gray;
      top: 171px;
    }


v-machine-edit .checkcircle {
    position: absolute;
    top: 41px;
    left: 0;
    width: 100%;
    margin: 0 auto 10px auto;
    text-align: center;
  }


v-machine-edit .checkcircle .icon-checkcircle {
      font-size: 98px;
      color: purple;
    }


v-machine-edit .spinnerhldr {
  }


v-machine-edit .spinner {
    position: absolute;
    display: block;
    width: 64px;
    height: 64px;
    top: 67px;
    left: calc(50% - 32px);
	}


v-machine-edit .spinner .container1 > div, v-machine-edit .spinner .container2 > div, v-machine-edit .spinner .container3 > div {
      width: 10px;
      height: 10px;
      background-color: #b833da;

      border-radius: 100%;
      position: absolute;
      animation: bouncedelay 1.2s infinite ease-in-out;
      /* Prevent first frame from flickering when animation starts */
      animation-fill-mode: both;
    }


v-machine-edit .spinner .spinner-container {
      position: absolute;
      width: 100%;
      height: 100%;
    }


v-machine-edit .spinner .container2 {
      transform: rotateZ(45deg);
    }


v-machine-edit .spinner .container3 {
      transform: rotateZ(90deg);
    }


v-machine-edit .spinner .circle1 { top: 0; left: 0; }


v-machine-edit .spinner .circle2 { top: 0; right: 0; }


v-machine-edit .spinner .circle3 { right: 0; bottom: 0; }


v-machine-edit .spinner .circle4 { left: 0; bottom: 0; }


v-machine-edit .spinner .container2 .circle1 {
      animation-delay: -1.1s;
    }


v-machine-edit .spinner .container3 .circle1 {
      animation-delay: -1.0s;
    }


v-machine-edit .spinner .container1 .circle2 {
      animation-delay: -0.9s;
    }


v-machine-edit .spinner .container2 .circle2 {
      animation-delay: -0.8s;
    }


v-machine-edit .spinner .container3 .circle2 {
      animation-delay: -0.7s;
    }


v-machine-edit .spinner .container1 .circle3 {
      animation-delay: -0.6s;
    }


v-machine-edit .spinner .container2 .circle3 {
      animation-delay: -0.5s;
    }


v-machine-edit .spinner .container3 .circle3 {
      animation-delay: -0.4s;
    }


v-machine-edit .spinner .container1 .circle4 {
      animation-delay: -0.3s;
    }


v-machine-edit .spinner .container2 .circle4 {
      animation-delay: -0.2s;
    }


v-machine-edit .spinner .container3 .circle4 {
      animation-delay: -0.1s;
    }


v-machine-edit .savingstate_bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ffffffdb;
  }


@-webkit-keyframes bouncedelay {
  40% { transform: scale(1.0) }
}

@-webkit-keyframes bouncedelay {
  0%, 80%, 100% { 
    transform: scale(0.0);
  } 40% { 
    transform: scale(1.0);
  }
}



/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5lX2VkaXQvbWFjaGluZV9lZGl0LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztFQUlFO0lBQ0Usa0JBQWtCO0lBQ2xCLE1BQU07SUFDTixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7RUFVWDs7O0FBUkU7TUFDRSxrQkFBa0I7TUFDbEIsV0FBVztNQUNYLGtCQUFrQjtNQUNsQixlQUFlO01BQ2YsV0FBVztNQUNYLFVBQVU7SUFDWjs7O0FBR0Y7SUFDRSxrQkFBa0I7SUFDbEIsU0FBUztJQUNULE9BQU87SUFDUCxXQUFXO0lBQ1gsd0JBQXdCO0lBQ3hCLGtCQUFrQjtFQU1wQjs7O0FBSkU7TUFDRSxlQUFlO01BQ2YsYUFBYTtJQUNmOzs7QUFHSDtFQUNDOzs7QUFFRDtJQUNHLGtCQUFrQjtJQUNsQixjQUFjO0lBQ2QsV0FBVztJQUNYLFlBQVk7SUFDWixTQUFTO0lBQ1Qsc0JBQXNCO0NBNEV6Qjs7O0FBMUVHO01BQ0UsV0FBVztNQUNYLFlBQVk7TUFDWix5QkFBeUI7O01BRXpCLG1CQUFtQjtNQUNuQixrQkFBa0I7TUFDbEIsZ0RBQWdEO01BQ2hELDhEQUE4RDtNQUM5RCx5QkFBeUI7SUFDM0I7OztBQUVBO01BQ0Usa0JBQWtCO01BQ2xCLFdBQVc7TUFDWCxZQUFZO0lBQ2Q7OztBQUVBO01BQ0UseUJBQXlCO0lBQzNCOzs7QUFFQTtNQUNFLHlCQUF5QjtJQUMzQjs7O0FBRUEsbUNBQWEsTUFBTSxFQUFFLE9BQU8sRUFBRTs7O0FBQzlCLG1DQUFhLE1BQU0sRUFBRSxRQUFRLEVBQUU7OztBQUMvQixtQ0FBYSxRQUFRLEVBQUUsU0FBUyxFQUFFOzs7QUFDbEMsbUNBQWEsT0FBTyxFQUFFLFNBQVMsRUFBRTs7O0FBRWpDO01BQ0Usc0JBQXNCO0lBQ3hCOzs7QUFFQTtNQUNFLHNCQUFzQjtJQUN4Qjs7O0FBRUE7TUFDRSxzQkFBc0I7SUFDeEI7OztBQUVBO01BQ0Usc0JBQXNCO0lBQ3hCOzs7QUFFQTtNQUNFLHNCQUFzQjtJQUN4Qjs7O0FBRUE7TUFDRSxzQkFBc0I7SUFDeEI7OztBQUVBO01BQ0Usc0JBQXNCO0lBQ3hCOzs7QUFFQTtNQUNFLHNCQUFzQjtJQUN4Qjs7O0FBRUE7TUFDRSxzQkFBc0I7SUFDeEI7OztBQUVBO01BQ0Usc0JBQXNCO0lBQ3hCOzs7QUFFQTtNQUNFLHNCQUFzQjtJQUN4Qjs7O0FBR0Y7SUFDRSxrQkFBa0I7SUFDbEIsTUFBTTtJQUNOLE9BQU87SUFDUCxRQUFRO0lBQ1IsU0FBUztJQUNULHFCQUFxQjtFQUN2Qjs7O0FBSUY7RUFDRSxNQUFNLHNCQUFzQjtBQUM5Qjs7QUFFQTtFQUNFO0lBQ0UscUJBQXFCO0VBQ3ZCLEVBQUU7SUFDQSxxQkFBcUI7RUFDdkI7QUFDRiIsImZpbGUiOiJwd2FwcC9zdGF0aWMvdmlld3MvbWFjaGluZV9lZGl0L21hY2hpbmVfZWRpdC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJcblxudi1tYWNoaW5lLWVkaXQge1xuXG4gICYgLnNhdmluZ3N0YXRlIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgcmlnaHQ6IDA7XG4gICAgYm90dG9tOiAwO1xuXG4gICAgJiBoNCB7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgICAgIGZvbnQtc2l6ZTogMjBweDtcbiAgICAgIGNvbG9yOiBncmF5O1xuICAgICAgdG9wOiAxNzFweDtcbiAgICB9XG4gIH1cblxuICAmIC5jaGVja2NpcmNsZSB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogNDFweDtcbiAgICBsZWZ0OiAwO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIG1hcmdpbjogMCBhdXRvIDEwcHggYXV0bztcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG5cbiAgICAmIC5pY29uLWNoZWNrY2lyY2xlIHtcbiAgICAgIGZvbnQtc2l6ZTogOThweDtcbiAgICAgIGNvbG9yOiBwdXJwbGU7XG4gICAgfVxuICB9XG5cblx0JiAuc3Bpbm5lcmhsZHIge1xuICB9XG5cblx0JiAuc3Bpbm5lciB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHdpZHRoOiA2NHB4O1xuICAgIGhlaWdodDogNjRweDtcbiAgICB0b3A6IDY3cHg7XG4gICAgbGVmdDogY2FsYyg1MCUgLSAzMnB4KTtcblxuICAgICYgLmNvbnRhaW5lcjEgPiBkaXYsICYgLmNvbnRhaW5lcjIgPiBkaXYsICYgLmNvbnRhaW5lcjMgPiBkaXYge1xuICAgICAgd2lkdGg6IDEwcHg7XG4gICAgICBoZWlnaHQ6IDEwcHg7XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjYjgzM2RhO1xuXG4gICAgICBib3JkZXItcmFkaXVzOiAxMDAlO1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgYW5pbWF0aW9uOiBib3VuY2VkZWxheSAxLjJzIGluZmluaXRlIGVhc2UtaW4tb3V0O1xuICAgICAgLyogUHJldmVudCBmaXJzdCBmcmFtZSBmcm9tIGZsaWNrZXJpbmcgd2hlbiBhbmltYXRpb24gc3RhcnRzICovXG4gICAgICBhbmltYXRpb24tZmlsbC1tb2RlOiBib3RoO1xuICAgIH1cblxuICAgICYgLnNwaW5uZXItY29udGFpbmVyIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgaGVpZ2h0OiAxMDAlO1xuICAgIH1cblxuICAgICYgLmNvbnRhaW5lcjIge1xuICAgICAgdHJhbnNmb3JtOiByb3RhdGVaKDQ1ZGVnKTtcbiAgICB9XG5cbiAgICAmIC5jb250YWluZXIzIHtcbiAgICAgIHRyYW5zZm9ybTogcm90YXRlWig5MGRlZyk7XG4gICAgfVxuXG4gICAgJiAuY2lyY2xlMSB7IHRvcDogMDsgbGVmdDogMDsgfVxuICAgICYgLmNpcmNsZTIgeyB0b3A6IDA7IHJpZ2h0OiAwOyB9XG4gICAgJiAuY2lyY2xlMyB7IHJpZ2h0OiAwOyBib3R0b206IDA7IH1cbiAgICAmIC5jaXJjbGU0IHsgbGVmdDogMDsgYm90dG9tOiAwOyB9XG5cbiAgICAmIC5jb250YWluZXIyIC5jaXJjbGUxIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTEuMXM7XG4gICAgfVxuXG4gICAgJiAuY29udGFpbmVyMyAuY2lyY2xlMSB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0xLjBzO1xuICAgIH1cblxuICAgICYgLmNvbnRhaW5lcjEgLmNpcmNsZTIge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC45cztcbiAgICB9XG5cbiAgICAmIC5jb250YWluZXIyIC5jaXJjbGUyIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuOHM7XG4gICAgfVxuXG4gICAgJiAuY29udGFpbmVyMyAuY2lyY2xlMiB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjdzO1xuICAgIH1cblxuICAgICYgLmNvbnRhaW5lcjEgLmNpcmNsZTMge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC42cztcbiAgICB9XG5cbiAgICAmIC5jb250YWluZXIyIC5jaXJjbGUzIHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuNXM7XG4gICAgfVxuXG4gICAgJiAuY29udGFpbmVyMyAuY2lyY2xlMyB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjRzO1xuICAgIH1cblxuICAgICYgLmNvbnRhaW5lcjEgLmNpcmNsZTQge1xuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAtMC4zcztcbiAgICB9XG5cbiAgICAmIC5jb250YWluZXIyIC5jaXJjbGU0IHtcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogLTAuMnM7XG4gICAgfVxuXG4gICAgJiAuY29udGFpbmVyMyAuY2lyY2xlNCB7XG4gICAgICBhbmltYXRpb24tZGVsYXk6IC0wLjFzO1xuICAgIH1cblx0fVxuXG4gICYgLnNhdmluZ3N0YXRlX2JnIHtcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgcmlnaHQ6IDA7XG4gICAgYm90dG9tOiAwO1xuICAgIGJhY2tncm91bmQ6ICNmZmZmZmZkYjtcbiAgfVxufVxuXG5cbkAtd2Via2l0LWtleWZyYW1lcyBib3VuY2VkZWxheSB7XG4gIDQwJSB7IHRyYW5zZm9ybTogc2NhbGUoMS4wKSB9XG59XG5cbkAtd2Via2l0LWtleWZyYW1lcyBib3VuY2VkZWxheSB7XG4gIDAlLCA4MCUsIDEwMCUgeyBcbiAgICB0cmFuc2Zvcm06IHNjYWxlKDAuMCk7XG4gIH0gNDAlIHsgXG4gICAgdHJhbnNmb3JtOiBzY2FsZSgxLjApO1xuICB9XG59XG5cblxuIl19 */</style>

<c-overlay size="small" closebtn="true" showheader="true" show="false">

  <span slot="headermiddle">Edit Machine</span>
  <span slot="headerright"><a @click="${()=>this.save()}">save</a></span>

  <form name="machineedit">
    <ul class="items">

      <li>
        <label class="text" for="isactive">Active</label>
        <input class="apple-switch" type="checkbox" name="isactive" id="isactive" .checked="${_machine.state.active}">
      </li>

      <li>
        <label class="text" for="mchid">Machine ID</label>
        <input type="text" name="mchid" id="mchid" value="${_machine.mchId}">
        <label class="action" for="mchid"><i class="icon-edit1"></i></label>
      </li>

      <li>
        <label class="text" for="storename">Store Name</label>
        <input type="text" name="storename" id="storename" value="${_machine.store.name}">
        <label class="action" for="storename"><i class="icon-edit1"></i></label>
      </li>

      <li>
        <label class="text" for="storeid">Store ID</label>
        <input type="text" name="storeid" id="storeid" value="${_machine.store.id}">
        <label class="action" for="storid"><i class="icon-edit1"></i></label>
      </li>

      <li>
        <label class="text" for="incrs">Gallon Increment</label>
        <input type="text" name="incrs" id="incrs" value="${_machine.incrs[0]}">
        <label class="action" for="incrs"><i class="icon-edit1"></i></label>
      </li>

    </ul>
  </form>


  <div class="savingstate_bg" ddomgo="${_s.savingState === 1 || _s.savingState === 2}" animation="fadein"></div>

  <div class="savingstate spinnerhldr" ddomgo="${_s.savingState === 1}" animation="shrinkin">
    <div class="spinner">
      <div class="spinner-container container1">
        <div class="circle1"></div>
        <div class="circle2"></div>
        <div class="circle3"></div>
        <div class="circle4"></div>
      </div>
      <div class="spinner-container container2">
        <div class="circle1"></div>
        <div class="circle2"></div>
        <div class="circle3"></div>
        <div class="circle4"></div>
      </div>
      <div class="spinner-container container3">
        <div class="circle1"></div>
        <div class="circle2"></div>
        <div class="circle3"></div>
        <div class="circle4"></div>
      </div>
    </div>
    <h4>Saving...</h4>
  </div>


  <div class="savingstate check" ddomgo="${_s.savingState === 2}" animation="shrinkin">
    <div class="checkcircle">
      <i class="icon-checkcircle"></i>
    </div>

    <h4>Saved</h4>
  </div>
</c-overlay>






`;
      };
      this.$ = this.querySelector;
      this.s = {
        savingState: 0
      };
      this.machine;
    }
    async Activate() {
      return new Promise(async (res) => {
        this.s.savingState = 0;
        const alldatain = await FSQss([["machines", "doc", this.getAttribute("machine")]]);
        this.machine = alldatain[0];
        this.stateChanged();
        res(1);
      });
    }
    stateChanged() {
      Lit_Render(this.template(this.s, this.machine), this);
    }
    async save() {
      const formel = this.querySelector("form[name='machineedit']");
      const els = formel.elements;
      const data = this.verifyAndCorrectInput(els);
      if (!data)
        return false;
      this.s.savingState = 1;
      this.stateChanged();
      const qr = FSGss("machines", this.machine.id, ["mchId", "state.active", "store.id", "store.name", "incrs"], data);
      const tr = new Promise((r) => setTimeout((_) => r(1), 1e3));
      await Promise.all([qr, tr]);
      this.s.savingState = 2;
      this.stateChanged();
      setTimeout((_) => {
        this.s.savingState = 0;
        this.stateChanged();
        this.dispatchEvent(new Event("requested_close"));
      }, 1e3);
    }
    verifyAndCorrectInput(els) {
      let flag = false;
      let mchId = els.mchid.value;
      let state = { active: els.isactive.checked };
      let store = { id: els.storeid.value, name: els.storename.value };
      let incrs = els.incrs.value;
      if (mchId.trim().length === 0 || mchId.length > 4 || !/^[_0-9]+$/.test(mchId)) {
        alert("machine id should contain only numeric characters or _ and should be 4 in length");
        flag = true;
      } else {
        mchId = mchId.trim().padStart(4, "0");
      }
      if (store.id.trim().length === 0 || store.id.length > 4 || !/^[_0-9]+$/.test(store.id)) {
        alert("store id should be a number and no more than 4 digits long");
        flag = true;
      } else {
        store.id = store.id.trim().padStart(4, "0");
      }
      if (store.name.trim().length === 0 || store.id.length > 20 || store.name.search(/[^A-Za-z ]+/) !== -1) {
        alert("store name should be no longer than 20 characters. And should only contain A-Z or a-z");
        flag = true;
      } else {
        store.name = store.name.trim();
      }
      if (incrs.trim().length === 0 || !(Number(incrs) === 1 || Number(incrs) === 10)) {
        alert("gallong increment should be 1 or 10");
        flag = true;
      } else {
        incrs = Array(5).fill(Number(incrs));
      }
      return !flag ? { mchId, state, store, incrs } : false;
    }
  };
  customElements.define("v-machine-edit", VMachineEdit);
})();
