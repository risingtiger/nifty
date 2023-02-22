(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/views/machines/machines.ts
  var VMachines = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s, _machines) => {
        return Lit_Html`<style>



  v-machines form.searchandfilter {
    position:relative;
    padding: 7px 12px 7px 8px;
  }




  v-machines form.searchandfilter input {
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      padding-left: 41px;
    }




  v-machines form.searchandfilter i {
      position: absolute;
      top: 11px;
      left: 15px;
      font-size: 20px;
    }




  v-machines ul.items li .thumbnail img {
        }




  v-machines ul.items li .title {
        width: 200px;
      }




  v-machines ul.items li .aux1 {
        width: 240px;
      }




  v-machines ul.items li .aux2 {
        width: 230px;
      }




  v-machines ul.items li .aux3 {
        width: 220px;
      }




  v-machines ul.items li .aux4 {
        width: 220px;
      }




  v-machines ul.items li .action {
      }




  v-machines ul.items li h5 {
        font-size: 14px;
        font-weight: 700;
        width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }




  v-machines ul.items li h6 {
        font-size: 14px;
        font-weight: 400;
      }




  v-machines ul.items li p {
        font-weight: 300;
        color: var(--textcolor-fade)
      }




  v-machines #machines.list h6
	{
	    font-size: 15px;
	}




  v-machines #machines.list p
	{
	    font-size: 14px;
	    color: var(--textcolor-fade);
	}




  v-machines #machines.list li > div
	{
	    box-sizing: border-box;
	}




  v-machines #machines.list li > div:nth-child(1)
	{
	    width: 6%;
	    padding-left: 12px;
	    box-sizing: border-box;
	}




  v-machines #machines.list li > div:nth-child(2)
	{
	    width: 34%;
	}




  v-machines #machines.list li > div:nth-child(2) p
	    {
		color: #f87c31;
	    }




  v-machines #machines.list li > div:nth-child(3)
	{
	    width: 20%;
	}




  v-machines #machines.list li > div:nth-child(4)
	{
	    width: 20%
	}




  v-machines #machines.list li > div:nth-child(4)
	{
	    width: 20%
	}




  v-machines ion-item:nth-child(1) ion-label {
    margin-top: 8;
  }

v-machines ion-avatar {
  width: 27px;
  height: 27px;
}
v-machines h3 + p {
  padding-left: 10px;
}

v-machines .isoffline_text {
  color: red;
}

@media only screen
and (min-device-width: 768px) {
  v-machines h3 {
    padding-left: 10px;
    display: flex;
  }
    v-machines h3 span {
      /*font-size: 14px;*/
    }
    v-machines h3 span.firstcolumn {
      width: 29%;
    }
    v-machines h3 span.secondcolumn, v-machines h2 span.thirdcolumn, v-machines h2 span.fourthcolumn {
      color:gray;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    v-machines h3 span.secondcolumn {
      width: 20%;
    }
    v-machines h3 span.thirdcolumn {
      width: 20%;
    }
    v-machines h3 span.fourthcolumn {
      width: 20%;
    }

  v-machines h3 + p {
    display: flex;
  }
    v-machines h3 + p span {
      /*font-size: 14px;*/
    }
    v-machines h3 + p span.firstcolumn {
      width: 29%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    v-machines h3 + p span.secondcolumn, v-machines h2 + p span.thirdcolumn, v-machines h2 + p span.fourthcolumn {
      color:gray;
      /*padding-left: 21px;*/
    }
    v-machines h3 + p span.secondcolumn {
      width: 20%;
    }
    v-machines h3 + p span.thirdcolumn {
      width: 20%;
    }
    v-machines h3 + p span.fourthcolumn {
      width: 20%;
    }

}

@media only screen and (max-device-width: 767px) {
  v-machines ion-avatar {
    margin-right: 10px;
  }
  v-machines h3 + p {
    padding-left: 0;
  }
  v-machines span.xtra {
    display:none;
  }
}




/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5lcy9tYWNoaW5lcy5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztFQU1FO0lBQ0UsaUJBQWlCO0lBQ2pCLHlCQUF5QjtFQWUzQjs7Ozs7RUFiRTtNQUNFLFdBQVc7TUFDWCxzQkFBc0I7TUFDdEIsZ0JBQWdCO01BQ2hCLGtCQUFrQjtJQUNwQjs7Ozs7RUFFQTtNQUNFLGtCQUFrQjtNQUNsQixTQUFTO01BQ1QsVUFBVTtNQUNWLGVBQWU7SUFDakI7Ozs7O0VBV0k7UUFDQTs7Ozs7RUFHRjtRQUNFLFlBQVk7TUFDZDs7Ozs7RUFFQTtRQUNFLFlBQVk7TUFDZDs7Ozs7RUFFQTtRQUNFLFlBQVk7TUFDZDs7Ozs7RUFFQTtRQUNFLFlBQVk7TUFDZDs7Ozs7RUFFQTtRQUNFLFlBQVk7TUFDZDs7Ozs7RUFFQTtNQUNBOzs7OztFQUVBO1FBQ0UsZUFBZTtRQUNmLGdCQUFnQjtRQUNoQixZQUFZO1FBQ1osbUJBQW1CO1FBQ25CLGdCQUFnQjtRQUNoQix1QkFBdUI7TUFDekI7Ozs7O0VBRUE7UUFDRSxlQUFlO1FBQ2YsZ0JBQWdCO01BQ2xCOzs7OztFQUVBO1FBQ0UsZ0JBQWdCO1FBQ2hCO01BQ0Y7Ozs7O0VBT0w7O0tBRUksZUFBZTtDQUNuQjs7Ozs7RUFFQTs7S0FFSSxlQUFlO0tBQ2YsNEJBQTRCO0NBQ2hDOzs7OztFQUVBOztLQUVJLHNCQUFzQjtDQUMxQjs7Ozs7RUFFQTs7S0FFSSxTQUFTO0tBQ1Qsa0JBQWtCO0tBQ2xCLHNCQUFzQjtDQUMxQjs7Ozs7RUFDQTs7S0FFSSxVQUFVO0NBTWQ7Ozs7O0VBSkk7O0VBRUgsY0FBYztLQUNYOzs7OztFQUVKOztLQUVJLFVBQVU7Q0FDZDs7Ozs7RUFDQTs7S0FFSTtDQUNKOzs7OztFQUNBOztLQUVJO0NBQ0o7Ozs7O0VBT0M7SUFDRSxhQUFhO0VBQ2Y7O0FBRUY7RUFDRSxXQUFXO0VBQ1gsWUFBWTtBQUNkO0FBQ0E7RUFDRSxrQkFBa0I7QUFDcEI7O0FBRUE7RUFDRSxVQUFVO0FBQ1o7O0FBRUE7O0VBRUU7SUFDRSxrQkFBa0I7SUFDbEIsYUFBYTtFQUNmO0lBQ0U7TUFDRSxtQkFBbUI7SUFDckI7SUFDQTtNQUNFLFVBQVU7SUFDWjtJQUNBO01BQ0UsVUFBVTtNQUNWLG1CQUFtQjtNQUNuQixnQkFBZ0I7TUFDaEIsdUJBQXVCO0lBQ3pCO0lBQ0E7TUFDRSxVQUFVO0lBQ1o7SUFDQTtNQUNFLFVBQVU7SUFDWjtJQUNBO01BQ0UsVUFBVTtJQUNaOztFQUVGO0lBQ0UsYUFBYTtFQUNmO0lBQ0U7TUFDRSxtQkFBbUI7SUFDckI7SUFDQTtNQUNFLFVBQVU7TUFDVixtQkFBbUI7TUFDbkIsZ0JBQWdCO01BQ2hCLHVCQUF1QjtJQUN6QjtJQUNBO01BQ0UsVUFBVTtNQUNWLHNCQUFzQjtJQUN4QjtJQUNBO01BQ0UsVUFBVTtJQUNaO0lBQ0E7TUFDRSxVQUFVO0lBQ1o7SUFDQTtNQUNFLFVBQVU7SUFDWjs7QUFFSjs7QUFFQTtFQUNFO0lBQ0Usa0JBQWtCO0VBQ3BCO0VBQ0E7SUFDRSxlQUFlO0VBQ2pCO0VBQ0E7SUFDRSxZQUFZO0VBQ2Q7QUFDRiIsImZpbGUiOiJwd2FwcC9zdGF0aWMvdmlld3MvbWFjaGluZXMvbWFjaGluZXMuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbnYtbWFjaGluZXMge1xuXG5cblxuICAmIGZvcm0uc2VhcmNoYW5kZmlsdGVyIHtcbiAgICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgICBwYWRkaW5nOiA3cHggMTJweCA3cHggOHB4O1xuXG4gICAgJiBpbnB1dCB7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuICAgICAgcGFkZGluZy1sZWZ0OiA0MXB4O1xuICAgIH1cblxuICAgICYgaSB7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICB0b3A6IDExcHg7XG4gICAgICBsZWZ0OiAxNXB4O1xuICAgICAgZm9udC1zaXplOiAyMHB4O1xuICAgIH1cbiAgfVxuXG5cblxuICAmIHVsLml0ZW1zIHtcblxuICAgICYgbGkge1xuXG4gICAgICAmIC50aHVtYm5haWwge1xuXG4gICAgICAgICYgaW1nIHtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAmIC50aXRsZSB7XG4gICAgICAgIHdpZHRoOiAyMDBweDtcbiAgICAgIH1cblxuICAgICAgJiAuYXV4MSB7XG4gICAgICAgIHdpZHRoOiAyNDBweDtcbiAgICAgIH1cblxuICAgICAgJiAuYXV4MiB7XG4gICAgICAgIHdpZHRoOiAyMzBweDtcbiAgICAgIH1cblxuICAgICAgJiAuYXV4MyB7XG4gICAgICAgIHdpZHRoOiAyMjBweDtcbiAgICAgIH1cblxuICAgICAgJiAuYXV4NCB7XG4gICAgICAgIHdpZHRoOiAyMjBweDtcbiAgICAgIH1cblxuICAgICAgJiAuYWN0aW9uIHtcbiAgICAgIH1cblxuICAgICAgJiBoNSB7XG4gICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDcwMDtcbiAgICAgICAgd2lkdGg6IDE1MHB4O1xuICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgICAgIH1cblxuICAgICAgJiBoNiB7XG4gICAgICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDQwMDtcbiAgICAgIH1cblxuICAgICAgJiBwIHtcbiAgICAgICAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgICAgICAgY29sb3I6IHZhcigtLXRleHRjb2xvci1mYWRlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgICAmICNtYWNoaW5lcy5saXN0XG4gICAge1xuXHQmIGg2XG5cdHtcblx0ICAgIGZvbnQtc2l6ZTogMTVweDtcblx0fVxuXG5cdCYgcFxuXHR7XG5cdCAgICBmb250LXNpemU6IDE0cHg7XG5cdCAgICBjb2xvcjogdmFyKC0tdGV4dGNvbG9yLWZhZGUpO1xuXHR9XG5cblx0JiBsaSA+IGRpdlxuXHR7XG5cdCAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuXHR9XG5cblx0JiBsaSA+IGRpdjpudGgtY2hpbGQoMSlcblx0e1xuXHQgICAgd2lkdGg6IDYlO1xuXHQgICAgcGFkZGluZy1sZWZ0OiAxMnB4O1xuXHQgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcblx0fVxuXHQmIGxpID4gZGl2Om50aC1jaGlsZCgyKVxuXHR7XG5cdCAgICB3aWR0aDogMzQlO1xuXG5cdCAgICAmIHBcblx0ICAgIHtcblx0XHRjb2xvcjogI2Y4N2MzMTtcblx0ICAgIH1cblx0fVxuXHQmIGxpID4gZGl2Om50aC1jaGlsZCgzKVxuXHR7XG5cdCAgICB3aWR0aDogMjAlO1xuXHR9XG5cdCYgbGkgPiBkaXY6bnRoLWNoaWxkKDQpXG5cdHtcblx0ICAgIHdpZHRoOiAyMCVcblx0fVxuXHQmIGxpID4gZGl2Om50aC1jaGlsZCg0KVxuXHR7XG5cdCAgICB3aWR0aDogMjAlXG5cdH1cbiAgICB9XG59XG5cblxuXG5cbiAgdi1tYWNoaW5lcyBpb24taXRlbTpudGgtY2hpbGQoMSkgaW9uLWxhYmVsIHtcbiAgICBtYXJnaW4tdG9wOiA4O1xuICB9XG5cbnYtbWFjaGluZXMgaW9uLWF2YXRhciB7XG4gIHdpZHRoOiAyN3B4O1xuICBoZWlnaHQ6IDI3cHg7XG59XG52LW1hY2hpbmVzIGgzICsgcCB7XG4gIHBhZGRpbmctbGVmdDogMTBweDtcbn1cblxudi1tYWNoaW5lcyAuaXNvZmZsaW5lX3RleHQge1xuICBjb2xvcjogcmVkO1xufVxuXG5AbWVkaWEgb25seSBzY3JlZW5cbmFuZCAobWluLWRldmljZS13aWR0aDogNzY4cHgpIHtcbiAgdi1tYWNoaW5lcyBoMyB7XG4gICAgcGFkZGluZy1sZWZ0OiAxMHB4O1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gIH1cbiAgICB2LW1hY2hpbmVzIGgzIHNwYW4ge1xuICAgICAgLypmb250LXNpemU6IDE0cHg7Ki9cbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyBzcGFuLmZpcnN0Y29sdW1uIHtcbiAgICAgIHdpZHRoOiAyOSU7XG4gICAgfVxuICAgIHYtbWFjaGluZXMgaDMgc3Bhbi5zZWNvbmRjb2x1bW4sIHYtbWFjaGluZXMgaDIgc3Bhbi50aGlyZGNvbHVtbiwgdi1tYWNoaW5lcyBoMiBzcGFuLmZvdXJ0aGNvbHVtbiB7XG4gICAgICBjb2xvcjpncmF5O1xuICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyBzcGFuLnNlY29uZGNvbHVtbiB7XG4gICAgICB3aWR0aDogMjAlO1xuICAgIH1cbiAgICB2LW1hY2hpbmVzIGgzIHNwYW4udGhpcmRjb2x1bW4ge1xuICAgICAgd2lkdGg6IDIwJTtcbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyBzcGFuLmZvdXJ0aGNvbHVtbiB7XG4gICAgICB3aWR0aDogMjAlO1xuICAgIH1cblxuICB2LW1hY2hpbmVzIGgzICsgcCB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgfVxuICAgIHYtbWFjaGluZXMgaDMgKyBwIHNwYW4ge1xuICAgICAgLypmb250LXNpemU6IDE0cHg7Ki9cbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyArIHAgc3Bhbi5maXJzdGNvbHVtbiB7XG4gICAgICB3aWR0aDogMjklO1xuICAgICAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgICAgIG92ZXJmbG93OiBoaWRkZW47XG4gICAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyArIHAgc3Bhbi5zZWNvbmRjb2x1bW4sIHYtbWFjaGluZXMgaDIgKyBwIHNwYW4udGhpcmRjb2x1bW4sIHYtbWFjaGluZXMgaDIgKyBwIHNwYW4uZm91cnRoY29sdW1uIHtcbiAgICAgIGNvbG9yOmdyYXk7XG4gICAgICAvKnBhZGRpbmctbGVmdDogMjFweDsqL1xuICAgIH1cbiAgICB2LW1hY2hpbmVzIGgzICsgcCBzcGFuLnNlY29uZGNvbHVtbiB7XG4gICAgICB3aWR0aDogMjAlO1xuICAgIH1cbiAgICB2LW1hY2hpbmVzIGgzICsgcCBzcGFuLnRoaXJkY29sdW1uIHtcbiAgICAgIHdpZHRoOiAyMCU7XG4gICAgfVxuICAgIHYtbWFjaGluZXMgaDMgKyBwIHNwYW4uZm91cnRoY29sdW1uIHtcbiAgICAgIHdpZHRoOiAyMCU7XG4gICAgfVxuXG59XG5cbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC1kZXZpY2Utd2lkdGg6IDc2N3B4KSB7XG4gIHYtbWFjaGluZXMgaW9uLWF2YXRhciB7XG4gICAgbWFyZ2luLXJpZ2h0OiAxMHB4O1xuICB9XG4gIHYtbWFjaGluZXMgaDMgKyBwIHtcbiAgICBwYWRkaW5nLWxlZnQ6IDA7XG4gIH1cbiAgdi1tYWNoaW5lcyBzcGFuLnh0cmEge1xuICAgIGRpc3BsYXk6bm9uZTtcbiAgfVxufVxuXG5cblxuIl19 */</style>

<header class="viewheader">
  <a class="left" @click="${()=>window.location.hash='index'}"><span>‸</span><span>home</span></a>
  <div class="middle"><h1>Machines</h1></div>
  <div class="right">
    <i class="icon-refresh" @click="${()=>{ this.refresh(); }}"></i>
  </div>
</header>


<div class="content">

  <form class="searchandfilter">
    <input name="searchandfilterstring" @keyup="${(e)=>this.searchandfilterKeyUp(e)}" type="text" placeholder="Search by Machine ID or Store Name"></input>
    <i class="icon-search"></i>
  </form>

  <ul class="items">

    ${_machines.map(m => Lit_Html`
    <li onclick="window.location.hash='machine/${m.id}'">
	    <div class="thumbnail"><img src="/images/bubble_${m.stateToShowColor}.svg"></div>

	    <div class="title">
        <h5>${m.store.name}</h5>
        <p>${m.msg}</p>
      </div>

	    <div class="aux1">
        <h6>${m.mchId} / ${m.store.id} / ${m.particle.account === 'accounts_risingtiger_com' ? 'west' : 'east'}</h6>
        <p>machine / store / acc.</p>
	    </div>

	    <div class="aux2">
        <h6>${m.meters[0]} / ${(m.meters[1] + m.meters[3])} / ${(m.meters[2] + m.meters[4])}</h6>
        <p>store / ro / min gals</p>
	    </div>

	    <div class="aux3">
        <h6>${m.particle.product === 11723 ? 'Boron' : 'BSeries'} / ${m.particle.serial.substring(m.particle.serial.length-4)} / ${m.particle.codeversion || '--'}</h6>
        <p>chip / serial / version</p>
	    </div>

	    <div class="aux4">
        <h6>${m.cell[0]} & ${m.cell[1]} / ${m.d}</h6>
        <p>cellular / last call</p>
	    </div>


	    <div class="action">
        <i class="icon-arrowright2"></i> 
	    </div>
    </li>
    `)}

  </ul>
</div>
`;
      };
      this.machines = [];
      this.filteredSortedMachines = [];
      this.s = { sortby: "state", filterby: [] };
    }
    async connectedCallback() {
      const allDataIn = await FSQss(["machines"]);
      this.machines = allDataIn[0];
      this._addAuxDataToMachines();
      this.filteredSortedMachines = this.getFilteredSortedMachines(this.s.sortby, this.s.filterby, this.machines);
      this.stateChanged();
      this.dispatchEvent(new Event("hydrate"));
    }
    stateChanged() {
      Lit_Render(this.template(this.s, this.filteredSortedMachines), this);
    }
    async refresh() {
      const allDataIn = await FSQss(["machines"]);
      this.machines = allDataIn[0];
      this._addAuxDataToMachines();
      this.filteredSortedMachines = this.getFilteredSortedMachines(this.s.sortby, this.s.filterby, this.machines);
      this.stateChanged();
      alert("Refreshed");
    }
    searchandfilterKeyUp(e) {
      if (e.key === "Shift")
        return false;
      let generalsearch = this.s.filterby.find((f) => f.what === "generalsearch");
      if (!generalsearch) {
        this.s.filterby.push({ what: "generalsearch", val: "" });
        generalsearch = this.s.filterby.find((f) => f.what === "generalsearch");
      }
      generalsearch.val = this.querySelector("form.searchandfilter").elements.searchandfilterstring.value.toLowerCase();
      let raw = this.querySelector("form.searchandfilter").elements.searchandfilterstring.value.toLowerCase();
      if (!isNaN(generalsearch.val))
        generalsearch.val = Number(generalsearch.val);
      if (raw.length >= 3) {
        this.filteredSortedMachines = this.getFilteredSortedMachines(this.s.sortby, this.s.filterby, this.machines);
      } else if (raw.length < 3) {
        this.filteredSortedMachines = this.machines;
      }
      this.stateChanged();
    }
    _addAuxDataToMachines() {
      this.machines.forEach((m) => {
        const now = Date.now();
        const mts = new Date(m.ts * 1e3);
        const { errmsg, warnmsg, infomsg } = this.parseAndGetStates(m.state.latest);
        m.d = this.get_last_callin(m.tsS);
        m.stateToShow = 5;
        m.stateToShowColor = "recovered";
        if (!m.state.active) {
          m.stateToShow = 7;
          m.stateToShowColor = "inactive";
        } else if (Number(m.mchId) <= 10) {
          m.stateToShow = 6;
          m.stateToShowColor = "testing";
        } else if (mts.getTime() < now - 864e5 * 2) {
          m.stateToShow = 1;
          m.stateToShowColor = "offline";
        } else if (errmsg) {
          m.stateToShow = 2;
          m.stateToShowColor = "error";
        } else if (warnmsg) {
          m.stateToShow = 3;
          m.stateToShowColor = "warn";
        } else if (infomsg) {
          m.stateToShow = 4;
          m.stateToShowColor = "info";
        }
        if (errmsg)
          m.msg = errmsg;
        else if (warnmsg)
          m.msg = warnmsg;
        else if (infomsg)
          m.msg = infomsg;
        else if (m.stateToShow === 1)
          m.msg = "Offline";
        else
          m.msg = "Ok";
      });
    }
    parseAndGetStates(bitStr) {
      const snB1 = bitStr.charCodeAt(0);
      const snB2 = bitStr.charCodeAt(1);
      const snB3 = bitStr.charCodeAt(2);
      const bitsXp = {
        procpwr: snB2 >> 4 & 1,
        drppan: snB1 >> 5 & 1,
        tnklvl: snB1 >> 4 & 1,
        afltlw: snB1 >> 3 & 1,
        dsppwr1: snB2 >> 5 & 1,
        nzl1: snB1 >> 0 & 1,
        smpovr1: snB1 >> 2 & 1,
        uvblb1: snB1 >> 1 & 1,
        srvdr1: snB2 >> 3 & 1,
        nzl2: snB3 >> 5 & 1,
        smpovr2: snB2 >> 2 & 1,
        uvblb2: snB2 >> 1 & 1,
        srvdr2: snB2 >> 0 & 1,
        loramia: snB3 >> 4 & 1
      };
      let errmsg = "";
      let warnmsg = "";
      let infomsg = "";
      if (bitsXp.procpwr)
        errmsg = "Processor Power";
      else if (bitsXp.drppan)
        errmsg = "Drip Pan";
      else if (bitsXp.tnklvl)
        warnmsg = "Tank Level";
      else if (bitsXp.afltlw)
        warnmsg = "After Filter";
      else if (bitsXp.dsppwr1)
        errmsg = "Dispenser Power";
      else if (bitsXp.loramia)
        infomsg = "LoRa MIA";
      else if (bitsXp.nzl1 || bitsXp.nzl2)
        errmsg = "Nozzle Stuck";
      else if (bitsXp.smpovr1 || bitsXp.smpovr2)
        errmsg = "Sump Over";
      else if (bitsXp.uvblb1 || bitsXp.uvblb2)
        errmsg = "UV Bulb";
      else if (bitsXp.srvdr1 || bitsXp.srvdr1)
        infomsg = "Service Door";
      return { errmsg, warnmsg, infomsg };
    }
    getFilteredSortedMachines(sortby, filterby, allMachines) {
      let subsetMachines = [];
      if (filterby.find((f) => f.what === "generalsearch")) {
        let filter = filterby.find((f) => f.what === "generalsearch");
        if (typeof filter.val === "string") {
          subsetMachines = allMachines.filter((m) => m.store.name.toLowerCase().includes(filter.val));
        } else if (typeof filter.val === "number") {
          subsetMachines = allMachines.filter((m) => m.mchId.includes(filter.val.toString()));
        }
        if (sortby === "state") {
          subsetMachines.sort((a, b) => {
            return a.stateToShow > b.stateToShow ? 1 : -1;
          });
        }
        return subsetMachines;
      } else {
        if (sortby === "state") {
          allMachines.sort((a, b) => {
            return a.stateToShow > b.stateToShow ? 1 : -1;
          });
        }
        return allMachines;
      }
    }
    get_last_callin(machine_tsS) {
      const date = new Date(machine_tsS * 1e3);
      const dstr = month_abbr[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
      return dstr;
    }
  };
  customElements.define("v-machines", VMachines);
  var month_abbr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
})();
