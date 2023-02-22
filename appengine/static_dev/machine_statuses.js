(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/views/machine_statuses/machine_statuses.ts
  var VMachineStatuses = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s, _parsed_statuses, _day_meter_telems, _totalStoreMeters, _totalPureMeters, _totalMinMeters) => {
        return Lit_Html`<style>

  v-machine-statuses .content {
    overflow-y: hidden;
  }
v-machine-statuses .statusheader { 
    display: flex;
    border-bottom: 3px solid #c5decf;
    background: white;
    box-sizing: border-box;
    width: 100%;
    height: 103px;
  }
v-machine-statuses .statusheader > #auxheaderspace_a { 
      display:flex;
      width: 324px;
    }
v-machine-statuses .statusheader > #auxheaderspace_a > div { 
        font-size: 12px;
        padding-top: 62px;
      }
v-machine-statuses .statusheader > #auxheaderspace_a > div strong { 
          display: inline-block;
          padding-bottom: 3px;
          font-size: 14px;
          font-weight: 600;
        }
v-machine-statuses .statusheader > #auxheaderspace_a > div:nth-child(1) { width: 15px; }
v-machine-statuses .statusheader > #auxheaderspace_a > div:nth-child(2) { width: 103px; }
v-machine-statuses .statusheader > #auxheaderspace_a > div:nth-child(3) { width: 64px; }
v-machine-statuses .statusheader > #auxheaderspace_a > div:nth-child(4) { width: 64px; }
v-machine-statuses .rotate {
    display: flex;
    flex-grow: 1;
    position: relative;
  }
v-machine-statuses .rotate > div {
      position: relative;
      width:10%;
      height: 100px;
      white-space: nowrap;
      text-align: left;
    }
v-machine-statuses .rotate > div > div {
        transform: rotate(300deg);
        transform-origin: bottom left;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 58%;
        height: 25px;
      }
v-machine-statuses .rotate > div > div > span {
          /*border-bottom: 8px solid #c6decf;	*/
          font-weight: 700;
        }
v-machine-statuses .no_statuses {
    text-align: center;
    padding: 40px;
    font-size: 21px;
  }
v-machine-statuses ul.statuses {
    list-style: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    padding-top: 0;
    display: block;
    width: 100%;
    height: calc(100% - 103px);
    overflow-x: hidden;
    overflow-y: scroll;
  }
v-machine-statuses ul.statuses > li {
      display: flex;
      margin: 0;
      padding: 0;
      height: 38px;
      background-image: linear-gradient(180deg, transparent, transparent 48%, #c6decf 48%, #c6decf 52%, transparent 52%);
    }
v-machine-statuses ul.statuses > li > aside {
        display:flex;
        width: 324px;
      }
v-machine-statuses ul.statuses > li > aside .datetime {
          color: #7b7b7b;
          width: 107px;
          font-size: 13px;
          padding: 4px 0 0 8px;
          margin: 6px 0 0 5px;
          height: 26px;
          box-sizing: border-box;
          border-radius: 8px 0 0 8px;
          background: white;
          border-radius: 8px 0 0 8px;
          border-width: 1px 0 1px 1px;
          border-color: #dee7f1;
          border-style: solid;
        }
v-machine-statuses ul.statuses > li > aside > .gallons {
          display: flex;
          font-size: 13px;
          padding: 6px 0px 0 0px;
        }
v-machine-statuses ul.statuses > li > aside > .gallons > div {
            width: 63px;
            height: 26px;
            color: #7b7b7b;
            font-weight: normal;
            padding: 4px 0 0 8px;
            background: white;
            box-sizing: border-box;
            border-radius: 0;
            border-width: 0;
            border-color: #dee7f1;
            border-style: solid;
          }
v-machine-statuses ul.statuses > li > aside > .gallons > div:nth-child(1) {
            border-radius: 0;
            border-width: 1px 0 1px 0;
          }
v-machine-statuses ul.statuses > li > aside > .gallons > div:nth-child(2) {
            border-radius: 0;
            border-width: 1px 0 1px 0;
          }
v-machine-statuses ul.statuses > li > aside > .gallons > div:nth-child(3) {
            border-radius: 0 8px 8px 0;
            border-width: 1px 1px 1px 0;
          }
v-machine-statuses ul.statuses > li > .statuses {
        flex-grow: 1;
        display: flex;
      }
v-machine-statuses ul.statuses > li > .statuses > div {
          position: relative;
          text-align: center;
          width: 10%;
          background-image: linear-gradient(90deg, transparent, transparent 49%, #d9e8e0 49%, #d9e8e0 50%, transparent 50%);
        }
v-machine-statuses ul.statuses > li > .statuses > div > span.single {
            display: inline-block;
            padding-top: 6px;
          }
v-machine-statuses ul.statuses > li > .statuses > div > span.single > img {
              width: 24px;
            }
v-machine-statuses ul.statuses > li > .statuses > div > span.double {
            position: absolute;
            top: 6px;
            display: block;
            left: 50%;
            z-index: 2;
          }
v-machine-statuses ul.statuses > li > .statuses > div > span.double > img {
              width: 24px;
            }
v-machine-statuses ul.statuses > li > .statuses > div > span.double:nth-child(1) {
            margin-left: -18px;
          }
v-machine-statuses ul.statuses > li > .statuses > div > span.double:nth-child(2) {
            margin-left: -7px;
          }
v-machine-statuses ul.statuses > li > .statuses > div > span.double.ok {
            z-index: 1;
          }
v-machine-statuses ul.statuses > li.totalsrow {
      margin-bottom: 36px;
      margin-top: 36px;
    }
v-machine-statuses ul.statuses > li.totalsrow > aside .datetime {
          font-weight: bold;
          color: #5a8cca;
          background-color: #ebeef2;
        }
v-machine-statuses ul.statuses > li.totalsrow > aside > .gallons > div {
            color: white;
            font-weight: bold;
            border-width: 0;
            padding-top: 5px;
          }
v-machine-statuses ul.statuses > li.totalsrow > aside > .gallons > div:nth-child(1) {
            background-color: #5b88bf;
            border-right: 2px solid #d3e5fc;
          }
v-machine-statuses ul.statuses > li.totalsrow > aside > .gallons > div:nth-child(2) {
            background-color: #5b88bf;
            border-right: 2px solid #d3e5fc;
          }
v-machine-statuses ul.statuses > li.totalsrow > aside > .gallons > div:nth-child(3) {
            background-color: #5b88bf;
          }


/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5lX3N0YXR1c2VzL21hY2hpbmVfc3RhdHVzZXMuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0VBSUU7SUFDRSxrQkFBa0I7RUFDcEI7QUFFQTtJQUNFLGFBQWE7SUFDYixnQ0FBZ0M7SUFDaEMsaUJBQWlCO0lBQ2pCLHNCQUFzQjtJQUN0QixXQUFXO0lBQ1gsYUFBYTtFQXNCZjtBQXBCRTtNQUNFLFlBQVk7TUFDWixZQUFZO0lBaUJkO0FBZkU7UUFDRSxlQUFlO1FBQ2YsaUJBQWlCO01BUW5CO0FBTkU7VUFDRSxxQkFBcUI7VUFDckIsbUJBQW1CO1VBQ25CLGVBQWU7VUFDZixnQkFBZ0I7UUFDbEI7QUFFRiwwRUFBdUIsV0FBVyxFQUFFO0FBQ3BDLDBFQUF1QixZQUFZLEVBQUU7QUFDckMsMEVBQXVCLFdBQVcsRUFBRTtBQUNwQywwRUFBdUIsV0FBVyxFQUFFO0FBS3hDO0lBQ0UsYUFBYTtJQUNiLFlBQVk7SUFDWixrQkFBa0I7RUF3QnBCO0FBdEJFO01BQ0Usa0JBQWtCO01BQ2xCLFNBQVM7TUFDVCxhQUFhO01BQ2IsbUJBQW1CO01BQ25CLGdCQUFnQjtJQWdCbEI7QUFkRTtRQUNFLHlCQUF5QjtRQUN6Qiw2QkFBNkI7UUFDN0IsV0FBVztRQUNYLGtCQUFrQjtRQUNsQixTQUFTO1FBQ1QsU0FBUztRQUNULFlBQVk7TUFNZDtBQUpFO1VBQ0UscUNBQXFDO1VBQ3JDLGdCQUFnQjtRQUNsQjtBQU1OO0lBQ0Usa0JBQWtCO0lBQ2xCLGFBQWE7SUFDYixlQUFlO0VBQ2pCO0FBR0E7SUFDRSxnQkFBZ0I7SUFDaEIsVUFBVTtJQUNWLFNBQVM7SUFDVCxzQkFBc0I7SUFDdEIsY0FBYztJQUNkLGNBQWM7SUFDZCxXQUFXO0lBQ1gsMEJBQTBCO0lBQzFCLGtCQUFrQjtJQUNsQixrQkFBa0I7RUEwSXBCO0FBeElFO01BQ0UsYUFBYTtNQUNiLFNBQVM7TUFDVCxVQUFVO01BQ1YsWUFBWTtNQUNaLGtIQUFrSDtJQStGcEg7QUE3RkU7UUFDRSxZQUFZO1FBQ1osWUFBWTtNQWlEZDtBQS9DRTtVQUNFLGNBQWM7VUFDZCxZQUFZO1VBQ1osZUFBZTtVQUNmLG9CQUFvQjtVQUNwQixtQkFBbUI7VUFDbkIsWUFBWTtVQUNaLHNCQUFzQjtVQUN0QiwwQkFBMEI7VUFDMUIsaUJBQWlCO1VBQ2pCLDBCQUEwQjtVQUMxQiwyQkFBMkI7VUFDM0IscUJBQXFCO1VBQ3JCLG1CQUFtQjtRQUNyQjtBQUVBO1VBQ0UsYUFBYTtVQUNiLGVBQWU7VUFDZixzQkFBc0I7UUEyQnhCO0FBekJFO1lBQ0UsV0FBVztZQUNYLFlBQVk7WUFDWixjQUFjO1lBQ2QsbUJBQW1CO1lBQ25CLG9CQUFvQjtZQUNwQixpQkFBaUI7WUFDakIsc0JBQXNCO1lBQ3RCLGdCQUFnQjtZQUNoQixlQUFlO1lBQ2YscUJBQXFCO1lBQ3JCLG1CQUFtQjtVQUNyQjtBQUNBO1lBQ0UsZ0JBQWdCO1lBQ2hCLHlCQUF5QjtVQUMzQjtBQUNBO1lBQ0UsZ0JBQWdCO1lBQ2hCLHlCQUF5QjtVQUMzQjtBQUNBO1lBQ0UsMEJBQTBCO1lBQzFCLDJCQUEyQjtVQUM3QjtBQUlKO1FBQ0UsWUFBWTtRQUNaLGFBQWE7TUFxQ2Y7QUFuQ0U7VUFDRSxrQkFBa0I7VUFDbEIsa0JBQWtCO1VBQ2xCLFVBQVU7VUFDVixpSEFBaUg7UUE4Qm5IO0FBNUJFO1lBQ0UscUJBQXFCO1lBQ3JCLGdCQUFnQjtVQUtsQjtBQUhFO2NBQ0UsV0FBVztZQUNiO0FBRUY7WUFDRSxrQkFBa0I7WUFDbEIsUUFBUTtZQUNSLGNBQWM7WUFDZCxTQUFTO1lBQ1QsVUFBVTtVQUtaO0FBSEU7Y0FDRSxXQUFXO1lBQ2I7QUFFRjtZQUNFLGtCQUFrQjtVQUNwQjtBQUNBO1lBQ0UsaUJBQWlCO1VBQ25CO0FBQ0E7WUFDRSxVQUFVO1VBQ1o7QUFLTjtNQUNFLG1CQUFtQjtNQUNuQixnQkFBZ0I7SUErQmxCO0FBM0JJO1VBQ0UsaUJBQWlCO1VBQ2pCLGNBQWM7VUFDZCx5QkFBeUI7UUFDM0I7QUFJRTtZQUNFLFlBQVk7WUFDWixpQkFBaUI7WUFDakIsZUFBZTtZQUNmLGdCQUFnQjtVQUNsQjtBQUNBO1lBQ0UseUJBQXlCO1lBQ3pCLCtCQUErQjtVQUNqQztBQUNBO1lBQ0UseUJBQXlCO1lBQ3pCLCtCQUErQjtVQUNqQztBQUNBO1lBQ0UseUJBQXlCO1VBQzNCIiwiZmlsZSI6InB3YXBwL3N0YXRpYy92aWV3cy9tYWNoaW5lX3N0YXR1c2VzL21hY2hpbmVfc3RhdHVzZXMuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbnYtbWFjaGluZS1zdGF0dXNlcyB7XG5cbiAgJiAuY29udGVudCB7XG4gICAgb3ZlcmZsb3cteTogaGlkZGVuO1xuICB9XG5cbiAgJiAuc3RhdHVzaGVhZGVyIHsgXG4gICAgZGlzcGxheTogZmxleDtcbiAgICBib3JkZXItYm90dG9tOiAzcHggc29saWQgI2M1ZGVjZjtcbiAgICBiYWNrZ3JvdW5kOiB3aGl0ZTtcbiAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIGhlaWdodDogMTAzcHg7XG5cbiAgICAmID4gI2F1eGhlYWRlcnNwYWNlX2EgeyBcbiAgICAgIGRpc3BsYXk6ZmxleDtcbiAgICAgIHdpZHRoOiAzMjRweDtcblxuICAgICAgJiA+IGRpdiB7IFxuICAgICAgICBmb250LXNpemU6IDEycHg7XG4gICAgICAgIHBhZGRpbmctdG9wOiA2MnB4O1xuXG4gICAgICAgICYgc3Ryb25nIHsgXG4gICAgICAgICAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xuICAgICAgICAgIHBhZGRpbmctYm90dG9tOiAzcHg7XG4gICAgICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA2MDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgICYgPiBkaXY6bnRoLWNoaWxkKDEpIHsgd2lkdGg6IDE1cHg7IH1cbiAgICAgICYgPiBkaXY6bnRoLWNoaWxkKDIpIHsgd2lkdGg6IDEwM3B4OyB9XG4gICAgICAmID4gZGl2Om50aC1jaGlsZCgzKSB7IHdpZHRoOiA2NHB4OyB9XG4gICAgICAmID4gZGl2Om50aC1jaGlsZCg0KSB7IHdpZHRoOiA2NHB4OyB9XG4gICAgfVxuICB9XG5cblxuICAmIC5yb3RhdGUge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgZmxleC1ncm93OiAxO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcblxuICAgICYgPiBkaXYge1xuICAgICAgcG9zaXRpb246IHJlbGF0aXZlO1xuICAgICAgd2lkdGg6MTAlO1xuICAgICAgaGVpZ2h0OiAxMDBweDtcbiAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgICB0ZXh0LWFsaWduOiBsZWZ0O1xuXG4gICAgICAmID4gZGl2IHtcbiAgICAgICAgdHJhbnNmb3JtOiByb3RhdGUoMzAwZGVnKTtcbiAgICAgICAgdHJhbnNmb3JtLW9yaWdpbjogYm90dG9tIGxlZnQ7XG4gICAgICAgIHdpZHRoOiAxMDAlO1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgIGJvdHRvbTogMDtcbiAgICAgICAgbGVmdDogNTglO1xuICAgICAgICBoZWlnaHQ6IDI1cHg7XG5cbiAgICAgICAgJiA+IHNwYW4ge1xuICAgICAgICAgIC8qYm9yZGVyLWJvdHRvbTogOHB4IHNvbGlkICNjNmRlY2Y7XHQqL1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiA3MDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gICYgLm5vX3N0YXR1c2VzIHtcbiAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgcGFkZGluZzogNDBweDtcbiAgICBmb250LXNpemU6IDIxcHg7XG4gIH1cblxuXG4gICYgdWwuc3RhdHVzZXMge1xuICAgIGxpc3Qtc3R5bGU6IG5vbmU7XG4gICAgcGFkZGluZzogMDtcbiAgICBtYXJnaW46IDA7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICBwYWRkaW5nLXRvcDogMDtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICB3aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IGNhbGMoMTAwJSAtIDEwM3B4KTtcbiAgICBvdmVyZmxvdy14OiBoaWRkZW47XG4gICAgb3ZlcmZsb3cteTogc2Nyb2xsO1xuXG4gICAgJiA+IGxpIHtcbiAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICBtYXJnaW46IDA7XG4gICAgICBwYWRkaW5nOiAwO1xuICAgICAgaGVpZ2h0OiAzOHB4O1xuICAgICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KDE4MGRlZywgdHJhbnNwYXJlbnQsIHRyYW5zcGFyZW50IDQ4JSwgI2M2ZGVjZiA0OCUsICNjNmRlY2YgNTIlLCB0cmFuc3BhcmVudCA1MiUpO1xuXG4gICAgICAmID4gYXNpZGUge1xuICAgICAgICBkaXNwbGF5OmZsZXg7XG4gICAgICAgIHdpZHRoOiAzMjRweDtcblxuICAgICAgICAmIC5kYXRldGltZSB7XG4gICAgICAgICAgY29sb3I6ICM3YjdiN2I7XG4gICAgICAgICAgd2lkdGg6IDEwN3B4O1xuICAgICAgICAgIGZvbnQtc2l6ZTogMTNweDtcbiAgICAgICAgICBwYWRkaW5nOiA0cHggMCAwIDhweDtcbiAgICAgICAgICBtYXJnaW46IDZweCAwIDAgNXB4O1xuICAgICAgICAgIGhlaWdodDogMjZweDtcbiAgICAgICAgICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweCAwIDAgOHB4O1xuICAgICAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDhweCAwIDAgOHB4O1xuICAgICAgICAgIGJvcmRlci13aWR0aDogMXB4IDAgMXB4IDFweDtcbiAgICAgICAgICBib3JkZXItY29sb3I6ICNkZWU3ZjE7XG4gICAgICAgICAgYm9yZGVyLXN0eWxlOiBzb2xpZDtcbiAgICAgICAgfVxuXG4gICAgICAgICYgPiAuZ2FsbG9ucyB7XG4gICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICBmb250LXNpemU6IDEzcHg7XG4gICAgICAgICAgcGFkZGluZzogNnB4IDBweCAwIDBweDtcblxuICAgICAgICAgICYgPiBkaXYge1xuICAgICAgICAgICAgd2lkdGg6IDYzcHg7XG4gICAgICAgICAgICBoZWlnaHQ6IDI2cHg7XG4gICAgICAgICAgICBjb2xvcjogIzdiN2I3YjtcbiAgICAgICAgICAgIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gICAgICAgICAgICBwYWRkaW5nOiA0cHggMCAwIDhweDtcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IHdoaXRlO1xuICAgICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDA7XG4gICAgICAgICAgICBib3JkZXItd2lkdGg6IDA7XG4gICAgICAgICAgICBib3JkZXItY29sb3I6ICNkZWU3ZjE7XG4gICAgICAgICAgICBib3JkZXItc3R5bGU6IHNvbGlkO1xuICAgICAgICAgIH1cbiAgICAgICAgICAmID4gZGl2Om50aC1jaGlsZCgxKSB7XG4gICAgICAgICAgICBib3JkZXItcmFkaXVzOiAwO1xuICAgICAgICAgICAgYm9yZGVyLXdpZHRoOiAxcHggMCAxcHggMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgJiA+IGRpdjpudGgtY2hpbGQoMikge1xuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMDtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMXB4IDAgMXB4IDA7XG4gICAgICAgICAgfVxuICAgICAgICAgICYgPiBkaXY6bnRoLWNoaWxkKDMpIHtcbiAgICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDAgOHB4IDhweCAwO1xuICAgICAgICAgICAgYm9yZGVyLXdpZHRoOiAxcHggMXB4IDFweCAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAmID4gLnN0YXR1c2VzIHtcbiAgICAgICAgZmxleC1ncm93OiAxO1xuICAgICAgICBkaXNwbGF5OiBmbGV4O1xuXG4gICAgICAgICYgPiBkaXYge1xuICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICAgICAgd2lkdGg6IDEwJTtcbiAgICAgICAgICBiYWNrZ3JvdW5kLWltYWdlOiBsaW5lYXItZ3JhZGllbnQoOTBkZWcsIHRyYW5zcGFyZW50LCB0cmFuc3BhcmVudCA0OSUsICNkOWU4ZTAgNDklLCAjZDllOGUwIDUwJSwgdHJhbnNwYXJlbnQgNTAlKTtcblxuICAgICAgICAgICYgPiBzcGFuLnNpbmdsZSB7XG4gICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICBwYWRkaW5nLXRvcDogNnB4O1xuXG4gICAgICAgICAgICAmID4gaW1nIHtcbiAgICAgICAgICAgICAgd2lkdGg6IDI0cHg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgICYgPiBzcGFuLmRvdWJsZSB7XG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICAgICAgICB0b3A6IDZweDtcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgICAgICAgICAgbGVmdDogNTAlO1xuICAgICAgICAgICAgei1pbmRleDogMjtcblxuICAgICAgICAgICAgJiA+IGltZyB7XG4gICAgICAgICAgICAgIHdpZHRoOiAyNHB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAmID4gc3Bhbi5kb3VibGU6bnRoLWNoaWxkKDEpIHtcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAtMThweDtcbiAgICAgICAgICB9XG4gICAgICAgICAgJiA+IHNwYW4uZG91YmxlOm50aC1jaGlsZCgyKSB7XG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogLTdweDtcbiAgICAgICAgICB9XG4gICAgICAgICAgJiA+IHNwYW4uZG91YmxlLm9rIHtcbiAgICAgICAgICAgIHotaW5kZXg6IDE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgICYgPiBsaS50b3RhbHNyb3cge1xuICAgICAgbWFyZ2luLWJvdHRvbTogMzZweDtcbiAgICAgIG1hcmdpbi10b3A6IDM2cHg7XG5cbiAgICAgICYgPiBhc2lkZSB7XG5cbiAgICAgICAgJiAuZGF0ZXRpbWUge1xuICAgICAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgICAgICAgIGNvbG9yOiAjNWE4Y2NhO1xuICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNlYmVlZjI7XG4gICAgICAgIH1cblxuICAgICAgICAmID4gLmdhbGxvbnMge1xuXG4gICAgICAgICAgJiA+IGRpdiB7XG4gICAgICAgICAgICBjb2xvcjogd2hpdGU7XG4gICAgICAgICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICAgICAgICAgIGJvcmRlci13aWR0aDogMDtcbiAgICAgICAgICAgIHBhZGRpbmctdG9wOiA1cHg7XG4gICAgICAgICAgfVxuICAgICAgICAgICYgPiBkaXY6bnRoLWNoaWxkKDEpIHtcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICM1Yjg4YmY7XG4gICAgICAgICAgICBib3JkZXItcmlnaHQ6IDJweCBzb2xpZCAjZDNlNWZjO1xuICAgICAgICAgIH1cbiAgICAgICAgICAmID4gZGl2Om50aC1jaGlsZCgyKSB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjNWI4OGJmO1xuICAgICAgICAgICAgYm9yZGVyLXJpZ2h0OiAycHggc29saWQgI2QzZTVmYztcbiAgICAgICAgICB9XG4gICAgICAgICAgJiA+IGRpdjpudGgtY2hpbGQoMykge1xuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzViODhiZjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuIl19 */</style>

<div class="statusheader">
  <div id="auxheaderspace_a">
    <div>&nbsp;</div>
    <div @click="${()=>this.switchtimezone()}"><strong>Timezone ${_s.timezone_set_to_headquarters ? 'hq' : 'm'}</strong><br>${_s.timezone}</div>
    <div><strong>Store</strong><br>${_totalStoreMeters.toLocaleString("en-US")}</div>
    <div><strong>Pure</strong><br>${ _totalPureMeters.toLocaleString("en-US")}</div>
    <div><strong>Min</strong><br>${ _totalMinMeters.toLocaleString("en-US")}</div>
  </div>

  <div class="rotate">
    <div><div><span>After Filter</span></div></div>
    <div><div><span>Disp Pwr</span></div></div>
    <div><div><span>Drip Pan</span></div></div>
    <div><div><span>Sump</span></div></div>
    <div><div><span>Tank</span></div></div>
    <div><div><span>UV Bulb</span></div></div>
    <div><div><span>Proc Pwr</span></div></div>
    <div><div><span>Nozzle</span></div></div>
    <div><div><span>LoRa MIA</span></div></div>
    <div><div><span>Door</span></div></div>
  </div>
</div>

<ul class="statuses">

  <li style="background:none;height: 19px;">
    <aside></aside>

    <div class="statuses">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </li>

  ${_day_meter_telems.map(d => Lit_Html`

    ${_parsed_statuses.map(s => (s.month === d.month && s.day_of_month === d.day_of_month) ? Lit_Html`

      <li>

        <aside>
          <div class="datetime">${s.dDateStr}&nbsp${s.dTimeStr}</div>

          <div class="gallons">
            <div>${s.metersStore}</div>
            <div>${s.metersPure}</div>
            <div>${s.metersMin}</div>
          </div>
        </aside>


        <div class="statuses">
          <div>${Lit_UnsafeHtml(s.indicators.afltlw)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.dsppwr)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.drppan)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.smpovr)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.tnklvl)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.uvblb)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.procpwr)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.nzl)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.loramia)}</div>
          <div>${Lit_UnsafeHtml(s.indicators.srvdr)}</div>
        </div>

      </li>

    ` : '')}

    <li class="totalsrow">

      <aside>
        <div class="datetime"><span></span><span>${d.month.toString().padStart(2,"0")}/${d.day_of_month.toString().padStart(2,"0")} Totals</span></div>

        <div class="gallons">
          <div>${d.meters.find(m=>m.name==='Store').total}</div>
          <div>${d.meters.find(m=>m.name==='Pure1').total + d.meters.find(m=>m.name==='Pure2').total}</div>
          <div>${d.meters.find(m=>m.name==='Mineral1').total + d.meters.find(m=>m.name==='Mineral2').total}</div>
        </div>

      </aside>

      <div class="statuses"></div>
    </li>
  `)}

</ul>




`;
      };
      this.$ = this.querySelector;
      this.s = {
        timezone: "",
        timezone_at_machine: "",
        timezone_at_headquarters: "Los_Angeles",
        timezone_set_to_headquarters: false,
        machineid: "",
        mchId: "",
        totalmeters: [],
        incrs: []
      };
      this.parsed_statuses = [];
      this.day_meter_telems = [];
    }
    static get observedAttributes() {
      return ["refresh"];
    }
    async connectedCallback() {
      this.s.machineid = this.getAttribute("machineid");
      this.s.mchId = this.getAttribute("mchId");
      this.s.timezone = this.getAttribute("timezone");
      this.s.timezone_at_machine = this.s.timezone;
      this.s.totalmeters = JSON.parse(this.getAttribute("totalmeters"));
      this.s.incrs = JSON.parse(this.getAttribute("incrs"));
      const { parsed_statuses, day_meter_telems } = await this.get_parsed_all(this.s.mchId, this.s.incrs, this.s.timezone);
      this.parsed_statuses = parsed_statuses;
      this.day_meter_telems = day_meter_telems;
      this.stateChanged();
      this.dispatchEvent(new Event("hydrate"));
    }
    async attributeChangedCallback(name, _oldValue, _newValue) {
      if (name === "refresh") {
        console.log("refreshed");
        const { parsed_statuses, day_meter_telems } = await this.get_parsed_all(this.s.mchId, this.s.incrs, this.s.timezone);
        this.parsed_statuses = parsed_statuses;
        this.day_meter_telems = day_meter_telems;
        this.stateChanged();
      }
    }
    stateChanged() {
      const totalStoreMeters = this.s.totalmeters[0];
      const totalPureMeters = this.s.totalmeters[1] + this.s.totalmeters[3];
      const totalMinMeters = this.s.totalmeters[2] + this.s.totalmeters[4];
      Lit_Render(this.template(this.s, this.parsed_statuses, this.day_meter_telems, totalStoreMeters, totalPureMeters, totalMinMeters), this);
    }
    async switchtimezone() {
      console.log("switched");
      this.s.timezone_set_to_headquarters = this.s.timezone_set_to_headquarters ? false : true;
      this.s.timezone = this.s.timezone_set_to_headquarters ? this.s.timezone_at_headquarters : this.s.timezone_at_machine;
      const { parsed_statuses, day_meter_telems } = await this.get_parsed_all(this.s.mchId, this.s.incrs, this.s.timezone);
      this.parsed_statuses = parsed_statuses;
      this.day_meter_telems = day_meter_telems;
      this.stateChanged();
    }
    get_parsed_all(mchId, incrs, timezone) {
      return new Promise(async (res, _rej) => {
        Promise.all([this.get_statuses(incrs, timezone), this.get_day_meter_telems(mchId, timezone)]).then((data) => {
          if (data[0].length && data[1].length) {
            const parsed_statuses = data[0];
            const day_meter_telems = data[1];
            res({ parsed_statuses, day_meter_telems });
          } else if (data[0]) {
            res({ parsed_statuses: [], day_meter_telems: [] });
          } else {
            res({ parsed_statuses: [], day_meter_telems: [] });
          }
        });
      });
    }
    get_statuses(incrs, timezone) {
      return new Promise(async (res, _rej) => {
        const alldatain = await FSQss([`machines/${this.s.machineid}/statuses`], { forceGetAll: false, limit: 100, orderBy: "ts desc", mktype: false });
        if (alldatain[0].length) {
          const { parsed_statuses } = this.parse_statuses(alldatain[0], incrs, timezone);
          res(parsed_statuses);
        } else {
          res([]);
        }
      });
    }
    parse_statuses(statuses, incrs, timezone) {
      const parsed_statuses = [];
      for (let i = 0; i < statuses.length; i++) {
        const s = statuses[i];
        const d = new Date(s.ts * 1e3);
        const x = d.toLocaleDateString("en-US", { timeZone: "America/" + timezone });
        const y = x.split("/");
        y[0] = y[0].padStart(2, "0");
        y[1] = y[1].padStart(2, "0");
        const day_of_month = Number(y[1]);
        const month = Number(y[0]);
        const dDateStr = y[0] + "/" + y[1];
        const dTimeStr = d.toLocaleTimeString("en-US", { hour12: false, timeZone: "America/" + timezone });
        const meters = s.meterIncrs.map((mi, index) => mi * incrs[index]);
        const metersStore = meters[0];
        const metersPure = meters[1] + meters[3];
        const metersMin = meters[2] + meters[4];
        const bitsXp = this.parse_bits(s.bits);
        parsed_statuses.push({
          id: s.id,
          bitsXp,
          meters,
          metersStore,
          metersPure,
          metersMin,
          dDateStr,
          dTimeStr,
          date: d,
          day_of_month,
          month
        });
      }
      for (let i = parsed_statuses.length - 1; i >= 0; i--) {
        const s = parsed_statuses[i];
        const snext = parsed_statuses[i + 1] || null;
        s.indicators = this.parse_indicators(s.bitsXp, snext?.bitsXp);
      }
      return { parsed_statuses };
    }
    get_day_meter_telems(mchId, timezone) {
      return new Promise(async (res, _rej) => {
        const telems = await this.grab_day_meter_telems(mchId, timezone);
        const telems_by_day = this.parse_day_meter_telems(telems);
        res(telems_by_day);
      });
    }
    grab_day_meter_telems(mchId, timezone) {
      return new Promise((res, _rej) => {
        let token = "DMXLf9z4x6mPlptmmvt0HM6i9oqPQFTQpSOjeORSa54Dm2O-dyFixw9qm6KCMYbaWB06ityzwy5iul0Oujspzg==";
        const obj = {
          method: "POST",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-type": "application/vnd.flux",
            "Accept": "application/csv"
          },
          body: `import "timezone" 
        option location = timezone.location(name: "America/${timezone}")
        from(bucket: "PWT") 
          |> range(start: -30d, stop: 1d) 
          |> filter(fn: (r) => r["_measurement"] == "MTR") 
          |> filter(fn: (r) => r["_field"] == "Store" or r["_field"] == "Pure1" or r["_field"] == "Mineral1" or r["_field"] == "Pure2" or r["_field"] == "Mineral2") 
          |> filter(fn: (r) => r["mchId"] == "${mchId}") 
          |> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
          |> sort(columns: ["_time"], desc: true)
          |> timeShift(duration: -1d, columns: ["_time"])`
        };
        fetch(`https://us-central1-1.gcp.cloud2.influxdata.com/api/v2/query?org=accounts@risingtiger.com`, obj).then((response) => response.text()).then((data) => {
          res(data);
        }).catch((_) => {
          window.location.href = "/?errmsg=graphingInfluxDBFail";
        });
      });
    }
    parse_day_meter_telems(telems) {
      const x = telems.substring(telems.indexOf("\n") + 1);
      const days = [];
      x.split("\n").forEach((m) => {
        if (m.length < 20)
          return false;
        const c = m.split(",");
        if (c[3].substring(14, 19) !== "00:00")
          return false;
        const total = Number(c[9]);
        const metername = c[6].trim();
        const day_of_month = Number(c[3].substring(8, 10));
        const month = Number(c[3].substring(5, 7));
        let thisday = days.find((d) => d.day_of_month === day_of_month);
        if (!thisday) {
          days.push({ day_of_month, month, meters: [] });
          thisday = days[days.length - 1];
        }
        thisday.meters.push({ total, name: metername });
      });
      return days;
    }
    group_parsed_statuses_byday(statuses, day_meter_telems) {
      const parsed_statuses_byday = [];
      for (let i = 0; i < statuses.length; i++) {
        const s = statuses[i];
        let this_day = parsed_statuses_byday.find((ps) => ps.day_meter_telem.day_of_month == s.day_of_month);
        if (!this_day) {
          const day_meter_telem = day_meter_telems.find((dmt) => dmt.day_of_month == s.day_of_month);
          if (!day_meter_telem) {
            break;
          }
          parsed_statuses_byday.push({ day_meter_telem, statuses: [] });
          this_day = parsed_statuses_byday[parsed_statuses_byday.length - 1];
        }
        this_day.statuses.push(s);
      }
      return parsed_statuses_byday;
    }
    parse_bits(bitStr) {
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
      return bitsXp;
    }
    parse_indicators(sBitsXp, sNextBitsXp) {
      const procpwr = htmlstr(1, "error", sBitsXp.procpwr, sNextBitsXp?.procpwr, null, null);
      const drppan = htmlstr(1, "error", sBitsXp.drppan, sNextBitsXp?.drppan, null, null);
      const tnklvl = htmlstr(1, "warn", sBitsXp.tnklvl, sNextBitsXp?.tnklvl, null, null);
      const afltlw = htmlstr(1, "warn", sBitsXp.afltlw, sNextBitsXp?.afltlw, null, null);
      const dsppwr = htmlstr(1, "error", sBitsXp.dsppwr1, sNextBitsXp?.dsppwr1, null, null);
      const nzl = htmlstr(2, "error", sBitsXp.nzl1, sNextBitsXp?.nzl1, sBitsXp.nzl2, sNextBitsXp?.nzl2);
      const smpovr = htmlstr(2, "error", sBitsXp.smpovr1, sNextBitsXp?.smpovr1, sBitsXp.smpovr2, sNextBitsXp?.smpovr2);
      const uvblb = htmlstr(2, "error", sBitsXp.uvblb1, sNextBitsXp?.uvblb1, sBitsXp.uvblb2, sNextBitsXp?.uvblb2);
      const srvdr = htmlstr(2, "info", sBitsXp.srvdr1, sNextBitsXp?.srvdr1, sBitsXp.srvdr2, sNextBitsXp?.srvdr2);
      const loramia = htmlstr(1, "info", sBitsXp.loramia, sBitsXp?.loramia, null, null);
      return { procpwr, drppan, tnklvl, afltlw, dsppwr, nzl, smpovr, uvblb, srvdr, loramia };
      function htmlstr(classt, wstr, bit1, nbit1, bit2, nbit2) {
        let str = "";
        if (classt === 1) {
          const x = bit1 ? wstr : nbit1 ? "recovered" : "";
          str = x ? `<span class='single'><img src='/images/bubble_${x}.svg' /></span>` : "";
        } else if (classt === 2) {
          if (!bit1 && !nbit1 && !bit2 && !nbit2) {
            str = "";
          } else {
            const x1 = bit1 ? wstr : nbit1 ? "recovered" : "ok";
            const x2 = bit2 ? wstr : nbit2 ? "recovered" : "ok";
            str = `<span class='double ${x1}'><img src='/images/bubble_${x1}.svg' /></span>`;
            str += `<span class='double ${x2}'><img src='/images/bubble_${x2}.svg' /></span>`;
          }
        }
        return str;
      }
    }
  };
  customElements.define("v-machine-statuses", VMachineStatuses);
})();
