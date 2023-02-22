(() => {
  // static/views/upgrade/upgrade.ts
  var VUpgrade = class extends HTMLElement {
    constructor() {
      super();
      this.template = (_s) => {
        return Lit_Html`<style>





v-machines ion-label {
  margin-top: 20px;
  margin-bottom: 20px;
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




/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0YXRpYy92aWV3cy91cGdyYWRlL3VwZ3JhZGUuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQU1BO0VBQ0UsZ0JBQWdCO0VBQ2hCLG1CQUFtQjtBQUNyQjtFQUNFO0lBQ0UsYUFBYTtFQUNmOztBQUVGO0VBQ0UsV0FBVztFQUNYLFlBQVk7QUFDZDtBQUNBO0VBQ0Usa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsVUFBVTtBQUNaOztBQUVBOztFQUVFO0lBQ0Usa0JBQWtCO0lBQ2xCLGFBQWE7RUFDZjtJQUNFO01BQ0UsbUJBQW1CO0lBQ3JCO0lBQ0E7TUFDRSxVQUFVO0lBQ1o7SUFDQTtNQUNFLFVBQVU7TUFDVixtQkFBbUI7TUFDbkIsZ0JBQWdCO01BQ2hCLHVCQUF1QjtJQUN6QjtJQUNBO01BQ0UsVUFBVTtJQUNaO0lBQ0E7TUFDRSxVQUFVO0lBQ1o7SUFDQTtNQUNFLFVBQVU7SUFDWjs7RUFFRjtJQUNFLGFBQWE7RUFDZjtJQUNFO01BQ0UsbUJBQW1CO0lBQ3JCO0lBQ0E7TUFDRSxVQUFVO01BQ1YsbUJBQW1CO01BQ25CLGdCQUFnQjtNQUNoQix1QkFBdUI7SUFDekI7SUFDQTtNQUNFLFVBQVU7TUFDVixzQkFBc0I7SUFDeEI7SUFDQTtNQUNFLFVBQVU7SUFDWjtJQUNBO01BQ0UsVUFBVTtJQUNaO0lBQ0E7TUFDRSxVQUFVO0lBQ1o7O0FBRUo7O0FBRUE7RUFDRTtJQUNFLGtCQUFrQjtFQUNwQjtFQUNBO0lBQ0UsZUFBZTtFQUNqQjtFQUNBO0lBQ0UsWUFBWTtFQUNkO0FBQ0YiLCJmaWxlIjoic3RhdGljL3ZpZXdzL3VwZ3JhZGUvdXBncmFkZS5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuXG5cblxuXG52LW1hY2hpbmVzIGlvbi1sYWJlbCB7XG4gIG1hcmdpbi10b3A6IDIwcHg7XG4gIG1hcmdpbi1ib3R0b206IDIwcHg7XG59XG4gIHYtbWFjaGluZXMgaW9uLWl0ZW06bnRoLWNoaWxkKDEpIGlvbi1sYWJlbCB7XG4gICAgbWFyZ2luLXRvcDogODtcbiAgfVxuXG52LW1hY2hpbmVzIGlvbi1hdmF0YXIge1xuICB3aWR0aDogMjdweDtcbiAgaGVpZ2h0OiAyN3B4O1xufVxudi1tYWNoaW5lcyBoMyArIHAge1xuICBwYWRkaW5nLWxlZnQ6IDEwcHg7XG59XG5cbnYtbWFjaGluZXMgLmlzb2ZmbGluZV90ZXh0IHtcbiAgY29sb3I6IHJlZDtcbn1cblxuQG1lZGlhIG9ubHkgc2NyZWVuXG5hbmQgKG1pbi1kZXZpY2Utd2lkdGg6IDc2OHB4KSB7XG4gIHYtbWFjaGluZXMgaDMge1xuICAgIHBhZGRpbmctbGVmdDogMTBweDtcbiAgICBkaXNwbGF5OiBmbGV4O1xuICB9XG4gICAgdi1tYWNoaW5lcyBoMyBzcGFuIHtcbiAgICAgIC8qZm9udC1zaXplOiAxNHB4OyovXG4gICAgfVxuICAgIHYtbWFjaGluZXMgaDMgc3Bhbi5maXJzdGNvbHVtbiB7XG4gICAgICB3aWR0aDogMjklO1xuICAgIH1cbiAgICB2LW1hY2hpbmVzIGgzIHNwYW4uc2Vjb25kY29sdW1uLCB2LW1hY2hpbmVzIGgyIHNwYW4udGhpcmRjb2x1bW4sIHYtbWFjaGluZXMgaDIgc3Bhbi5mb3VydGhjb2x1bW4ge1xuICAgICAgY29sb3I6Z3JheTtcbiAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgfVxuICAgIHYtbWFjaGluZXMgaDMgc3Bhbi5zZWNvbmRjb2x1bW4ge1xuICAgICAgd2lkdGg6IDIwJTtcbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyBzcGFuLnRoaXJkY29sdW1uIHtcbiAgICAgIHdpZHRoOiAyMCU7XG4gICAgfVxuICAgIHYtbWFjaGluZXMgaDMgc3Bhbi5mb3VydGhjb2x1bW4ge1xuICAgICAgd2lkdGg6IDIwJTtcbiAgICB9XG5cbiAgdi1tYWNoaW5lcyBoMyArIHAge1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gIH1cbiAgICB2LW1hY2hpbmVzIGgzICsgcCBzcGFuIHtcbiAgICAgIC8qZm9udC1zaXplOiAxNHB4OyovXG4gICAgfVxuICAgIHYtbWFjaGluZXMgaDMgKyBwIHNwYW4uZmlyc3Rjb2x1bW4ge1xuICAgICAgd2lkdGg6IDI5JTtcbiAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gICAgICBvdmVyZmxvdzogaGlkZGVuO1xuICAgICAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gICAgfVxuICAgIHYtbWFjaGluZXMgaDMgKyBwIHNwYW4uc2Vjb25kY29sdW1uLCB2LW1hY2hpbmVzIGgyICsgcCBzcGFuLnRoaXJkY29sdW1uLCB2LW1hY2hpbmVzIGgyICsgcCBzcGFuLmZvdXJ0aGNvbHVtbiB7XG4gICAgICBjb2xvcjpncmF5O1xuICAgICAgLypwYWRkaW5nLWxlZnQ6IDIxcHg7Ki9cbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyArIHAgc3Bhbi5zZWNvbmRjb2x1bW4ge1xuICAgICAgd2lkdGg6IDIwJTtcbiAgICB9XG4gICAgdi1tYWNoaW5lcyBoMyArIHAgc3Bhbi50aGlyZGNvbHVtbiB7XG4gICAgICB3aWR0aDogMjAlO1xuICAgIH1cbiAgICB2LW1hY2hpbmVzIGgzICsgcCBzcGFuLmZvdXJ0aGNvbHVtbiB7XG4gICAgICB3aWR0aDogMjAlO1xuICAgIH1cblxufVxuXG5AbWVkaWEgb25seSBzY3JlZW4gYW5kIChtYXgtZGV2aWNlLXdpZHRoOiA3NjdweCkge1xuICB2LW1hY2hpbmVzIGlvbi1hdmF0YXIge1xuICAgIG1hcmdpbi1yaWdodDogMTBweDtcbiAgfVxuICB2LW1hY2hpbmVzIGgzICsgcCB7XG4gICAgcGFkZGluZy1sZWZ0OiAwO1xuICB9XG4gIHYtbWFjaGluZXMgc3Bhbi54dHJhIHtcbiAgICBkaXNwbGF5Om5vbmU7XG4gIH1cbn1cblxuXG5cbiJdfQ== */</style>
<div>
    Doing Da Upgrade
</div>
`;
      };
      this.state = { propa: "" };
    }
    connectedCallback() {
    }
    activated(_urlmatch) {
      return new Promise((res, _rej) => {
        res(1);
      });
    }
    stateChanged() {
      Lit_Render(this.template(this.state), this);
    }
  };
  customElements.define("v-upgrade", VUpgrade);
})();
