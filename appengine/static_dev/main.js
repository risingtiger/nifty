(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/lit-html/lit-html.js
  var lit_html_exports = {};
  __export(lit_html_exports, {
    _$LH: () => L,
    html: () => y,
    noChange: () => x,
    nothing: () => b,
    render: () => Z,
    svg: () => w
  });
  function P(t3, i3, s2 = t3, e4) {
    var o3, n2, l2, h2;
    if (i3 === x)
      return i3;
    let r2 = void 0 !== e4 ? null === (o3 = s2._$Co) || void 0 === o3 ? void 0 : o3[e4] : s2._$Cl;
    const u2 = d(i3) ? void 0 : i3._$litDirective$;
    return (null == r2 ? void 0 : r2.constructor) !== u2 && (null === (n2 = null == r2 ? void 0 : r2._$AO) || void 0 === n2 || n2.call(r2, false), void 0 === u2 ? r2 = void 0 : (r2 = new u2(t3), r2._$AT(t3, s2, e4)), void 0 !== e4 ? (null !== (l2 = (h2 = s2)._$Co) && void 0 !== l2 ? l2 : h2._$Co = [])[e4] = r2 : s2._$Cl = r2), void 0 !== r2 && (i3 = P(t3, r2._$AS(t3, i3.values), r2, e4)), i3;
  }
  var t, i, s, e, o, n, l, h, r, d, u, c, v, a, f, _, m, p, $, g, y, w, x, b, T, A, E, C, V, N, S, M, R, k, H, I, L, z, Z;
  var init_lit_html = __esm({
    "node_modules/lit-html/lit-html.js"() {
      i = window;
      s = i.trustedTypes;
      e = s ? s.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
      o = `lit$${(Math.random() + "").slice(9)}$`;
      n = "?" + o;
      l = `<${n}>`;
      h = document;
      r = (t3 = "") => h.createComment(t3);
      d = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
      u = Array.isArray;
      c = (t3) => u(t3) || "function" == typeof (null == t3 ? void 0 : t3[Symbol.iterator]);
      v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
      a = /-->/g;
      f = />/g;
      _ = RegExp(`>|[ 	
\f\r](?:([^\\s"'>=/]+)([ 	
\f\r]*=[ 	
\f\r]*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
      m = /'/g;
      p = /"/g;
      $ = /^(?:script|style|textarea|title)$/i;
      g = (t3) => (i3, ...s2) => ({ _$litType$: t3, strings: i3, values: s2 });
      y = g(1);
      w = g(2);
      x = Symbol.for("lit-noChange");
      b = Symbol.for("lit-nothing");
      T = /* @__PURE__ */ new WeakMap();
      A = h.createTreeWalker(h, 129, null, false);
      E = (t3, i3) => {
        const s2 = t3.length - 1, n2 = [];
        let h2, r2 = 2 === i3 ? "<svg>" : "", d2 = v;
        for (let i4 = 0; i4 < s2; i4++) {
          const s3 = t3[i4];
          let e4, u3, c2 = -1, g2 = 0;
          for (; g2 < s3.length && (d2.lastIndex = g2, u3 = d2.exec(s3), null !== u3); )
            g2 = d2.lastIndex, d2 === v ? "!--" === u3[1] ? d2 = a : void 0 !== u3[1] ? d2 = f : void 0 !== u3[2] ? ($.test(u3[2]) && (h2 = RegExp("</" + u3[2], "g")), d2 = _) : void 0 !== u3[3] && (d2 = _) : d2 === _ ? ">" === u3[0] ? (d2 = null != h2 ? h2 : v, c2 = -1) : void 0 === u3[1] ? c2 = -2 : (c2 = d2.lastIndex - u3[2].length, e4 = u3[1], d2 = void 0 === u3[3] ? _ : '"' === u3[3] ? p : m) : d2 === p || d2 === m ? d2 = _ : d2 === a || d2 === f ? d2 = v : (d2 = _, h2 = void 0);
          const y2 = d2 === _ && t3[i4 + 1].startsWith("/>") ? " " : "";
          r2 += d2 === v ? s3 + l : c2 >= 0 ? (n2.push(e4), s3.slice(0, c2) + "$lit$" + s3.slice(c2) + o + y2) : s3 + o + (-2 === c2 ? (n2.push(void 0), i4) : y2);
        }
        const u2 = r2 + (t3[s2] || "<?>") + (2 === i3 ? "</svg>" : "");
        if (!Array.isArray(t3) || !t3.hasOwnProperty("raw"))
          throw Error("invalid template strings array");
        return [void 0 !== e ? e.createHTML(u2) : u2, n2];
      };
      C = class {
        constructor({ strings: t3, _$litType$: i3 }, e4) {
          let l2;
          this.parts = [];
          let h2 = 0, d2 = 0;
          const u2 = t3.length - 1, c2 = this.parts, [v2, a2] = E(t3, i3);
          if (this.el = C.createElement(v2, e4), A.currentNode = this.el.content, 2 === i3) {
            const t4 = this.el.content, i4 = t4.firstChild;
            i4.remove(), t4.append(...i4.childNodes);
          }
          for (; null !== (l2 = A.nextNode()) && c2.length < u2; ) {
            if (1 === l2.nodeType) {
              if (l2.hasAttributes()) {
                const t4 = [];
                for (const i4 of l2.getAttributeNames())
                  if (i4.endsWith("$lit$") || i4.startsWith(o)) {
                    const s2 = a2[d2++];
                    if (t4.push(i4), void 0 !== s2) {
                      const t5 = l2.getAttribute(s2.toLowerCase() + "$lit$").split(o), i5 = /([.?@])?(.*)/.exec(s2);
                      c2.push({ type: 1, index: h2, name: i5[2], strings: t5, ctor: "." === i5[1] ? M : "?" === i5[1] ? k : "@" === i5[1] ? H : S });
                    } else
                      c2.push({ type: 6, index: h2 });
                  }
                for (const i4 of t4)
                  l2.removeAttribute(i4);
              }
              if ($.test(l2.tagName)) {
                const t4 = l2.textContent.split(o), i4 = t4.length - 1;
                if (i4 > 0) {
                  l2.textContent = s ? s.emptyScript : "";
                  for (let s2 = 0; s2 < i4; s2++)
                    l2.append(t4[s2], r()), A.nextNode(), c2.push({ type: 2, index: ++h2 });
                  l2.append(t4[i4], r());
                }
              }
            } else if (8 === l2.nodeType)
              if (l2.data === n)
                c2.push({ type: 2, index: h2 });
              else {
                let t4 = -1;
                for (; -1 !== (t4 = l2.data.indexOf(o, t4 + 1)); )
                  c2.push({ type: 7, index: h2 }), t4 += o.length - 1;
              }
            h2++;
          }
        }
        static createElement(t3, i3) {
          const s2 = h.createElement("template");
          return s2.innerHTML = t3, s2;
        }
      };
      V = class {
        constructor(t3, i3) {
          this.u = [], this._$AN = void 0, this._$AD = t3, this._$AM = i3;
        }
        get parentNode() {
          return this._$AM.parentNode;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        v(t3) {
          var i3;
          const { el: { content: s2 }, parts: e4 } = this._$AD, o3 = (null !== (i3 = null == t3 ? void 0 : t3.creationScope) && void 0 !== i3 ? i3 : h).importNode(s2, true);
          A.currentNode = o3;
          let n2 = A.nextNode(), l2 = 0, r2 = 0, d2 = e4[0];
          for (; void 0 !== d2; ) {
            if (l2 === d2.index) {
              let i4;
              2 === d2.type ? i4 = new N(n2, n2.nextSibling, this, t3) : 1 === d2.type ? i4 = new d2.ctor(n2, d2.name, d2.strings, this, t3) : 6 === d2.type && (i4 = new I(n2, this, t3)), this.u.push(i4), d2 = e4[++r2];
            }
            l2 !== (null == d2 ? void 0 : d2.index) && (n2 = A.nextNode(), l2++);
          }
          return o3;
        }
        p(t3) {
          let i3 = 0;
          for (const s2 of this.u)
            void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t3, s2, i3), i3 += s2.strings.length - 2) : s2._$AI(t3[i3])), i3++;
        }
      };
      N = class {
        constructor(t3, i3, s2, e4) {
          var o3;
          this.type = 2, this._$AH = b, this._$AN = void 0, this._$AA = t3, this._$AB = i3, this._$AM = s2, this.options = e4, this._$Cm = null === (o3 = null == e4 ? void 0 : e4.isConnected) || void 0 === o3 || o3;
        }
        get _$AU() {
          var t3, i3;
          return null !== (i3 = null === (t3 = this._$AM) || void 0 === t3 ? void 0 : t3._$AU) && void 0 !== i3 ? i3 : this._$Cm;
        }
        get parentNode() {
          let t3 = this._$AA.parentNode;
          const i3 = this._$AM;
          return void 0 !== i3 && 11 === t3.nodeType && (t3 = i3.parentNode), t3;
        }
        get startNode() {
          return this._$AA;
        }
        get endNode() {
          return this._$AB;
        }
        _$AI(t3, i3 = this) {
          t3 = P(this, t3, i3), d(t3) ? t3 === b || null == t3 || "" === t3 ? (this._$AH !== b && this._$AR(), this._$AH = b) : t3 !== this._$AH && t3 !== x && this.g(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : c(t3) ? this.k(t3) : this.g(t3);
        }
        O(t3, i3 = this._$AB) {
          return this._$AA.parentNode.insertBefore(t3, i3);
        }
        T(t3) {
          this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
        }
        g(t3) {
          this._$AH !== b && d(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(h.createTextNode(t3)), this._$AH = t3;
        }
        $(t3) {
          var i3;
          const { values: s2, _$litType$: e4 } = t3, o3 = "number" == typeof e4 ? this._$AC(t3) : (void 0 === e4.el && (e4.el = C.createElement(e4.h, this.options)), e4);
          if ((null === (i3 = this._$AH) || void 0 === i3 ? void 0 : i3._$AD) === o3)
            this._$AH.p(s2);
          else {
            const t4 = new V(o3, this), i4 = t4.v(this.options);
            t4.p(s2), this.T(i4), this._$AH = t4;
          }
        }
        _$AC(t3) {
          let i3 = T.get(t3.strings);
          return void 0 === i3 && T.set(t3.strings, i3 = new C(t3)), i3;
        }
        k(t3) {
          u(this._$AH) || (this._$AH = [], this._$AR());
          const i3 = this._$AH;
          let s2, e4 = 0;
          for (const o3 of t3)
            e4 === i3.length ? i3.push(s2 = new N(this.O(r()), this.O(r()), this, this.options)) : s2 = i3[e4], s2._$AI(o3), e4++;
          e4 < i3.length && (this._$AR(s2 && s2._$AB.nextSibling, e4), i3.length = e4);
        }
        _$AR(t3 = this._$AA.nextSibling, i3) {
          var s2;
          for (null === (s2 = this._$AP) || void 0 === s2 || s2.call(this, false, true, i3); t3 && t3 !== this._$AB; ) {
            const i4 = t3.nextSibling;
            t3.remove(), t3 = i4;
          }
        }
        setConnected(t3) {
          var i3;
          void 0 === this._$AM && (this._$Cm = t3, null === (i3 = this._$AP) || void 0 === i3 || i3.call(this, t3));
        }
      };
      S = class {
        constructor(t3, i3, s2, e4, o3) {
          this.type = 1, this._$AH = b, this._$AN = void 0, this.element = t3, this.name = i3, this._$AM = e4, this.options = o3, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = b;
        }
        get tagName() {
          return this.element.tagName;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        _$AI(t3, i3 = this, s2, e4) {
          const o3 = this.strings;
          let n2 = false;
          if (void 0 === o3)
            t3 = P(this, t3, i3, 0), n2 = !d(t3) || t3 !== this._$AH && t3 !== x, n2 && (this._$AH = t3);
          else {
            const e5 = t3;
            let l2, h2;
            for (t3 = o3[0], l2 = 0; l2 < o3.length - 1; l2++)
              h2 = P(this, e5[s2 + l2], i3, l2), h2 === x && (h2 = this._$AH[l2]), n2 || (n2 = !d(h2) || h2 !== this._$AH[l2]), h2 === b ? t3 = b : t3 !== b && (t3 += (null != h2 ? h2 : "") + o3[l2 + 1]), this._$AH[l2] = h2;
          }
          n2 && !e4 && this.j(t3);
        }
        j(t3) {
          t3 === b ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, null != t3 ? t3 : "");
        }
      };
      M = class extends S {
        constructor() {
          super(...arguments), this.type = 3;
        }
        j(t3) {
          this.element[this.name] = t3 === b ? void 0 : t3;
        }
      };
      R = s ? s.emptyScript : "";
      k = class extends S {
        constructor() {
          super(...arguments), this.type = 4;
        }
        j(t3) {
          t3 && t3 !== b ? this.element.setAttribute(this.name, R) : this.element.removeAttribute(this.name);
        }
      };
      H = class extends S {
        constructor(t3, i3, s2, e4, o3) {
          super(t3, i3, s2, e4, o3), this.type = 5;
        }
        _$AI(t3, i3 = this) {
          var s2;
          if ((t3 = null !== (s2 = P(this, t3, i3, 0)) && void 0 !== s2 ? s2 : b) === x)
            return;
          const e4 = this._$AH, o3 = t3 === b && e4 !== b || t3.capture !== e4.capture || t3.once !== e4.once || t3.passive !== e4.passive, n2 = t3 !== b && (e4 === b || o3);
          o3 && this.element.removeEventListener(this.name, this, e4), n2 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
        }
        handleEvent(t3) {
          var i3, s2;
          "function" == typeof this._$AH ? this._$AH.call(null !== (s2 = null === (i3 = this.options) || void 0 === i3 ? void 0 : i3.host) && void 0 !== s2 ? s2 : this.element, t3) : this._$AH.handleEvent(t3);
        }
      };
      I = class {
        constructor(t3, i3, s2) {
          this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i3, this.options = s2;
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        _$AI(t3) {
          P(this, t3);
        }
      };
      L = { P: "$lit$", A: o, M: n, C: 1, L: E, R: V, D: c, V: P, I: N, H: S, N: k, U: H, B: M, F: I };
      z = i.litHtmlPolyfillSupport;
      null == z || z(C, N), (null !== (t = i.litHtmlVersions) && void 0 !== t ? t : i.litHtmlVersions = []).push("2.5.0");
      Z = (t3, i3, s2) => {
        var e4, o3;
        const n2 = null !== (e4 = null == s2 ? void 0 : s2.renderBefore) && void 0 !== e4 ? e4 : i3;
        let l2 = n2._$litPart$;
        if (void 0 === l2) {
          const t4 = null !== (o3 = null == s2 ? void 0 : s2.renderBefore) && void 0 !== o3 ? o3 : null;
          n2._$litPart$ = l2 = new N(i3.insertBefore(r(), t4), t4, void 0, null != s2 ? s2 : {});
        }
        return l2._$AI(t3), l2;
      };
    }
  });

  // node_modules/lit-html/directive.js
  var t2, e2, i2;
  var init_directive = __esm({
    "node_modules/lit-html/directive.js"() {
      t2 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
      e2 = (t3) => (...e4) => ({ _$litDirective$: t3, values: e4 });
      i2 = class {
        constructor(t3) {
        }
        get _$AU() {
          return this._$AM._$AU;
        }
        _$AT(t3, e4, i3) {
          this._$Ct = t3, this._$AM = e4, this._$Ci = i3;
        }
        _$AS(t3, e4) {
          return this.update(t3, e4);
        }
        update(t3, e4) {
          return this.render(...e4);
        }
      };
    }
  });

  // node_modules/lit-html/directives/unsafe-html.js
  var unsafe_html_exports = {};
  __export(unsafe_html_exports, {
    UnsafeHTMLDirective: () => e3,
    unsafeHTML: () => o2
  });
  var e3, o2;
  var init_unsafe_html = __esm({
    "node_modules/lit-html/directives/unsafe-html.js"() {
      init_lit_html();
      init_directive();
      e3 = class extends i2 {
        constructor(i3) {
          if (super(i3), this.it = b, i3.type !== t2.CHILD)
            throw Error(this.constructor.directiveName + "() can only be used in child bindings");
        }
        render(r2) {
          if (r2 === b || null == r2)
            return this._t = void 0, this.it = r2;
          if (r2 === x)
            return r2;
          if ("string" != typeof r2)
            throw Error(this.constructor.directiveName + "() called with a non-string value");
          if (r2 === this.it)
            return this._t;
          this.it = r2;
          const s2 = [r2];
          return s2.raw = s2, this._t = { _$litType$: this.constructor.resultType, strings: s2, values: [] };
        }
      };
      e3.directiveName = "unsafeHTML", e3.resultType = 1;
      o2 = e2(e3);
    }
  });

  // static/thirdparty/lit-html.js
  var require_lit_html = __commonJS({
    "static/thirdparty/lit-html.js"(exports) {
      "use strict";
      exports.__esModule = true;
      var lit_html_1 = (init_lit_html(), __toCommonJS(lit_html_exports));
      var unsafe_html_js_1 = (init_unsafe_html(), __toCommonJS(unsafe_html_exports));
      window.Lit_Render = lit_html_1.render;
      window.Lit_Html = lit_html_1.html;
      window.Lit_UnsafeHtml = unsafe_html_js_1.unsafeHTML;
    }
  });

  // static/switchstation.ts
  var _hstack = [];
  var _intransitionLock = false;
  var Route = class {
    constructor(regexP, viewP) {
      this.regex = new RegExp(regexP);
      this.view = viewP;
    }
    attempToload(urlm) {
      return new Promise((res, rej) => {
        let flg = false;
        SuckInJs([this.view]).then((_2) => {
          const parentEl = document.querySelector("#views");
          let urstr = 'urlmatches = "' + urlm.join(",") + '"';
          parentEl.insertAdjacentHTML("beforeend", `<v-${this.view} class='view' ${urstr}></v-${this.view}>`);
          const el = parentEl.querySelector(`v-${this.view}`);
          el?.addEventListener("hydrate", () => {
            if (!flg) {
              flg = true;
              res(1);
            }
          });
        }).catch((_2) => {
          if (!flg) {
            flg = true;
            rej(1);
          }
        });
        setTimeout(() => {
          if (!flg) {
            flg = true;
            rej(1);
          }
        }, 4e3);
      });
    }
  };
  var _routes = [];
  function _doRoute(url, isGoingBack) {
    if (_intransitionLock)
      return false;
    _intransitionLock = true;
    document.querySelector("#loadviewoverlay").classList.add("active");
    const viewsEl = document.querySelector("#views");
    const [urlm, route] = _setMatchAndGetMatchAndRoute(url);
    route.attempToload(urlm).then(() => {
      let ch = viewsEl.children;
      if (ch.length === 2) {
        const anim = [
          {
            opacity: "0",
            transform: `translate3D(${isGoingBack ? "-" : ""}35px, 0, 0)`
          },
          {
            opacity: "1",
            transform: "translate3D(0%, 0, 0)"
          }
        ];
        const timing = {
          duration: 300,
          easing: "cubic-bezier(.42,0,.04,1)",
          iterations: 1
        };
        setTimeout(() => {
          let animate = ch[1].animate(anim, timing);
          animate.onfinish = (_e) => {
            ch[1].classList.add("active");
            posthash(ch[1]);
            viewsEl.removeChild(ch[0]);
          };
        }, 10);
      } else {
        ch[0].classList.add("active");
        posthash(ch[0]);
      }
      function posthash(el) {
        document.querySelector("#loadviewoverlay").classList.remove("active");
        if (window.location.hash.substring(1) === _hstack[_hstack.length - 2]) {
          _hstack.pop();
        } else {
          _hstack.push(url);
        }
        window.DDomObserve(el);
        _intransitionLock = false;
      }
    }).catch(() => {
      console.log(`/?errmsg=${encodeURIComponent("Unable to Load Page View")}`);
    });
  }
  function _setMatchAndGetMatchAndRoute(url) {
    for (let i3 = 0; i3 < _routes.length; i3++) {
      let urlmatchstr = url.match(_routes[i3].regex);
      if (urlmatchstr)
        return [urlmatchstr.slice(1), _routes[i3]];
    }
    return ["index".match(/index/g).slice(1), _routes.find((r2) => r2.view === "index")];
  }
  var InitInterval = () => {
    window.addEventListener("hashchange", () => hashChanged());
    hashChanged();
  };
  function hashChanged() {
    if (_intransitionLock) {
      return false;
    } else if (!_hstack.length) {
      if (window.location.hash === "") {
        window.location.hash = "index";
        _doRoute("index", false);
      } else {
        _doRoute(window.location.hash.substring(1), false);
      }
    } else if (window.location.hash.substring(1) !== _hstack[_hstack.length - 1]) {
      if (window.location.hash.substring(1) === _hstack[_hstack.length - 2]) {
        _doRoute(window.location.hash.substring(1), true);
      } else {
        _doRoute(window.location.hash.substring(1), false);
      }
    }
  }
  var AddRoute = (regexstr, view) => {
    _routes.push(new Route(regexstr, view));
  };

  // static/main.ts
  var import_lit_html2 = __toESM(require_lit_html());

  // static/libs/suckinjs.ts
  var suckedInJs = [];
  var SuckInJs2 = (filesArray) => {
    return new Promise((res, rej) => {
      let incr = 0;
      const allToSuckIn = filesArray;
      for (let i3 = 0; i3 < filesArray.length; i3++) {
        const di = window.__APPINSTANCE_DEPENDENCIES.find((d2) => d2.module === filesArray[i3]);
        const dm = window.__DEPENDENCIES.find((d2) => d2.module === filesArray[i3]);
        if (di)
          allToSuckIn.push(...di.dependencies);
        if (dm)
          allToSuckIn.push(...dm.dependencies);
      }
      for (let i3 = 0; i3 < allToSuckIn.length; i3++) {
        const f2 = allToSuckIn[i3];
        if (suckedInJs.includes(f2)) {
          res(1);
        } else {
          import(`./${f2}.js`).then(async (_module) => {
            suckedInJs.push(f2);
            document.head.insertAdjacentHTML("beforeend", `<style>${window["__MRP__CSSSTR_" + f2]}</style>`);
            incr++;
            if (incr === allToSuckIn.length)
              res(1);
          }).catch(() => {
            rej(1);
          });
        }
      }
    });
  };
  window.SuckInJs = SuckInJs2;

  // static/libs/firebase.ts
  function FSQss(queries, opts = { forceGetAll: false, limit: 100, orderBy: null, mktype: false }) {
    const preurl = `https://firestore.googleapis.com/v1/projects/${window.__APPINSTANCE.firebase.project}/databases/(default)/documents/`;
    const results = [];
    return new Promise((res, _rej) => {
      const fetchparams = queries.map((q) => _FSQss_getFetchParams(preurl, q));
      const orderByStr = opts.orderBy ? "orderBy=" + opts.orderBy : "";
      const qf = fetchparams.map((fp) => fetch(fp.fetchurl + "?pageSize=" + (opts.forceGetAll ? 300 : opts.limit) + "&" + orderByStr, fp.fetchopts).then((response) => response.json()));
      Promise.all(qf).then(async (qr) => {
        for (let i3 = 0; i3 < qr.length; i3++) {
          if (qr[i3] && (qr[i3].documents && qr[i3].documents.length || qr[i3].fields)) {
            if (qr[i3].nextPageToken && opts.forceGetAll)
              await _FSQss_getAllPaginatedData(fetchparams[i3].fetchurl, 300, qr[i3], qr[i3].documents);
            if (qr[i3].documents)
              results.push(qr[i3].documents.map((d2) => _FSQss_parse(d2, opts.mktype)));
            else
              results.push(_FSQss_parse(qr[i3], opts.mktype));
            if (results.length === queries.length)
              res(results);
          } else {
            results.push([]);
            if (results.length === queries.length)
              res(results);
          }
        }
      }).catch((err) => {
        console.log(err);
        console.log("errmsg=firestore FSQss Fail");
      });
    });
  }
  function FSGss(colletionName, docId, mask, data, _opts = { propa: false }) {
    return new Promise(async (res, _rej) => {
      const url = `https://firestore.googleapis.com/v1/projects/${window.__APPINSTANCE.firebase.project}/databases/(default)/documents/${colletionName}/${docId}`;
      const maskstr = "?" + mask.map((m2) => `updateMask.fieldPaths=${m2}`).join("&");
      const dataBody = { fields: {} };
      for (const prop in data)
        _FSGssCreateObj(prop, data[prop], dataBody.fields);
      const fetchopts = {
        method: "PATCH",
        body: JSON.stringify(dataBody)
        // headers: {
        //   'Authorization': 'Bearer aizasycdbd4fdbczbl03_m4k2mlpaidkuo32gii',
        //   'Content-Type': 'application/json',
        //   //'Origin': '',
        //   //'Host': 'api.producthunt.com'
        // }
      };
      fetch(url + maskstr, fetchopts).then((_rq) => {
        res(1);
      }).catch((_e) => {
        console.log("errmsg=firestore FSGss Fail");
      });
    });
  }
  function _FSGssCreateObj(propname, propval, dest) {
    if (typeof propval == "string") {
      dest[propname] = { stringValue: propval };
    } else if (typeof propval == "boolean") {
      dest[propname] = { booleanValue: propval };
    } else if (typeof propval == "number") {
      dest[propname] = { integerValue: propval };
    } else if (typeof propval == "object" && !Array.isArray(propval)) {
      dest[propname] = { mapValue: { fields: {} } };
      for (const prop in propval) {
        _FSGssCreateObj(prop, propval[prop], dest[propname].mapValue.fields);
      }
    } else if (typeof propval == "object" && Array.isArray(propval)) {
      dest[propname] = { arrayValue: { values: Array(propval.length) } };
      for (let i3 = 0; i3 < propval.length; i3++) {
        _FSGssCreateObj(i3, propval[i3], dest[propname].arrayValue.values);
      }
    }
  }
  function _FSQss_getFetchParams(preurl, w2) {
    let collection, constriction, specifity = "";
    if (Array.isArray(w2)) {
      collection = w2[0];
      constriction = w2[1];
      specifity = w2[2];
    } else {
      collection = w2;
      constriction = null;
      specifity = null;
    }
    let fetchurl = preurl + (constriction && constriction === "doc" ? collection + "/" + specifity : collection);
    const fetchopts = {
      method: "GET"
      // headers: {
      //   'Authorization': 'Bearer aizasycdbd4fdbczbl03_m4k2mlpaidkuo32gii',
      //   'Content-Type': 'application/json',
      //   //'Origin': '',
      //   //'Host': 'api.producthunt.com'
      // }
    };
    return { fetchurl, fetchopts };
  }
  function _FSQss_getAllPaginatedData(fetchurl, pagesize, dataIn, fillin) {
    return new Promise(async (res, _ref) => {
      fetch(fetchurl + "?pageSize=" + pagesize + "&pageToken=" + dataIn.nextPageToken, { method: "GET" }).then((response) => response.json()).then(async (response) => {
        if (response.nextPageToken) {
          await _FSQss_getAllPaginatedData(fetchurl, pagesize, response, fillin);
          fillin.push(...response.documents);
          res(1);
        } else {
          fillin.push(...response.documents);
          res(1);
        }
      });
    });
  }
  function _FSQss_parse(item, maketype = false) {
    const namesplit = item.name.split("/");
    const d2 = { id: namesplit[namesplit.length - 1] };
    for (const prop in item.fields)
      d2[prop] = _FSQssParseCore(item.fields[prop]);
    if (maketype)
      console.log(_FSQssParseType(item));
    return d2;
  }
  function _FSQssParseCore(obj) {
    if (obj.hasOwnProperty("integerValue")) {
      return Number(obj.integerValue);
    } else if (obj.hasOwnProperty("doubleValue")) {
      return Number(obj.doubleValue);
    } else if (obj.hasOwnProperty("stringValue")) {
      return obj.stringValue;
    } else if (obj.hasOwnProperty("booleanValue")) {
      return obj.booleanValue;
    } else if (obj.hasOwnProperty("referenceValue")) {
      const m2 = obj.referenceValue.match(/^projects\/.+\/databases\/\(default\)\/documents\/(.+)\/(.+)$/);
      return { collection: m2[1], id: m2[2] };
    } else if (obj.hasOwnProperty("arrayValue")) {
      return obj.arrayValue.values ? obj.arrayValue.values.map((m2) => _FSQssParseCore(m2)) : [];
    } else if (obj.hasOwnProperty("mapValue")) {
      const x2 = {};
      for (const prop in obj.mapValue.fields)
        x2[prop] = _FSQssParseCore(obj.mapValue.fields[prop]);
      return x2;
    }
  }
  function _FSQssParseType(items) {
    let typestr = `export type Type = { 
`;
    for (const prop in items.fields) {
      typestr += `${prop}: ${_FSQssParseTypeCore(items.fields[prop])}, `;
    }
    return typestr;
  }
  function _FSQssParseTypeCore(obj) {
    if (obj.hasOwnProperty("integerValue")) {
      return "number \n";
    } else if (obj.hasOwnProperty("doubleValue")) {
      return "number \n";
    } else if (obj.hasOwnProperty("stringValue")) {
      return "string \n";
    } else if (obj.hasOwnProperty("booleanValue")) {
      return "bool \n";
    } else if (obj.hasOwnProperty("referenceValue")) {
      const m2 = obj.referenceValue.match(/^projects\/.+\/databases\/\(default\)\/documents\/(.+)\/(.+)$/);
      return `${m2[1]}Type`;
    } else if (obj.hasOwnProperty("arrayValue")) {
      return _FSQssParseTypeCore(obj.arrayValue.values[0]) + "[] \n";
    } else if (obj.hasOwnProperty("mapValue")) {
      let x2 = "{ ";
      for (const prop in obj.mapValue.fields) {
        x2 += prop + ": ";
        x2 += _FSQssParseTypeCore(obj.mapValue.fields[prop]) + ",";
      }
      x2 += "}";
      return x2;
    }
  }
  window.FSQss = FSQss;
  window.FSGss = FSGss;

  // static/libs/ddom.ts
  var _elAnimations = [];
  var _animationSpecs = [
    {
      name: "fadein",
      cssprops: [
        { opacity: "0" },
        { opacity: "1" }
      ],
      props: {
        duration: 2380,
        easing: "cubic-bezier(.71,0,0,1)",
        fill: "both",
        iterations: 1
      }
    },
    {
      name: "shrinkin",
      cssprops: [
        { opacity: "0", transform: `translate3D(0, 70px, 0) scale(1.15)` },
        { opacity: "1", transform: "translate3D(0, 0, 0) scale(1)" }
      ],
      props: {
        duration: 2380,
        easing: "cubic-bezier(.71,0,0,1)",
        fill: "both",
        iterations: 1
      }
    }
  ];
  function DDomObserve(viewEl) {
    const observer = new MutationObserver((mlist) => {
      mlist.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "ddomgo") {
          const el = mutation.target;
          if (el.getAttribute("ddomgo") === "true")
            activate(el);
          else if (el.getAttribute("ddomgo") === "false")
            deactivate(el);
        }
      });
    });
    observer.observe(viewEl, {
      attributeFilter: ["ddomgo"],
      attributeOldValue: true,
      subtree: true
    });
  }
  async function activate(el) {
    document.getElementById("loadviewoverlay").classList.add("active");
    let isLoaded = false;
    setTimeout((_2) => {
      if (!isLoaded) {
        window.location.href = `/?errmsg=${encodeURIComponent("Unable to Load DDom")}`;
      }
    }, 5e3);
    const sy = el.tagName.toLowerCase().substring(0, 2);
    if (sy === "v-" || sy === "c-") {
      await SuckInJs([el.tagName.toLowerCase().substring(2).replace("-", "_")]);
      await el.Activate();
    }
    isLoaded = true;
    animateshow();
    function animateshow() {
      let wrapper = el.querySelector(":scope > c-overlay") || null;
      let animation = el.getAttribute("animation") || "fadein";
      if (wrapper) {
        el.style.display = "block";
        wrapper.addEventListener("requested_close", handleRequestedCloseEvent);
        wrapper.addEventListener("opened", handleWrapperOpenedEvent);
        setTimeout((_2) => wrapper.setAttribute("show", "true"), 10);
      } else {
        animateIn(el, animation);
      }
    }
  }
  function handleRequestedCloseEvent(ev) {
    ev.currentTarget.parentElement.dispatchEvent(new Event("requested_close"));
  }
  function handleWrapperOpenedEvent(_ev) {
    document.getElementById("loadviewoverlay").classList.remove("active");
  }
  function animateIn(el, animation) {
    attachAnimationIfNotAlready(el, animation);
    el.style.visibility = "hidden";
    el.style.display = "block";
    setTimeout(() => {
      el.style.visibility = "visible";
      const elanimation = _elAnimations.find((ea) => ea.elref === el);
      elanimation.animation.playbackRate = 1;
      elanimation.animation.currentTime = 0;
      elanimation.animation.play();
    }, 10);
  }
  function deactivate(el) {
    document.getElementById("loadviewoverlay").classList.add("active");
    let wrapper = el.querySelector(":scope > c-overlay") || null;
    let animation = el.getAttribute("animation") || "fadein";
    if (wrapper) {
      wrapper.setAttribute("show", "false");
      wrapper.addEventListener("closed", handleWrapperClosedEvent);
    } else {
      animateOut(el, animation);
    }
  }
  function handleWrapperClosedEvent(ev) {
    document.getElementById("loadviewoverlay").classList.remove("active");
    ev.currentTarget.parentElement.style.display = "none";
  }
  function animateOut(el, animation) {
    attachAnimationIfNotAlready(el, animation);
    const elanimation = _elAnimations.find((ea) => ea.elref === el);
    elanimation.animation.reverse();
  }
  function attachAnimationIfNotAlready(el, animation) {
    const elanimation = _elAnimations.find((ea) => ea.elref === el);
    if (elanimation) {
      return true;
    } else {
      const animationspec = _animationSpecs.find((a2) => a2.name === animation);
      const anim = el.animate(animationspec.cssprops, animationspec.props);
      anim.pause();
      _elAnimations.push({ elref: el, animation: anim });
      anim.addEventListener("finish", handleAnimationFinish);
    }
  }
  function handleAnimationFinish(ev) {
    document.getElementById("loadviewoverlay").classList.remove("active");
    const elanimation = _elAnimations.find((ea) => ea.animation === ev.currentTarget);
    if (elanimation.elref.getAttribute("ddomgo") === "false") {
      elanimation.elref.style.display = "none";
    }
  }
  window.DDomObserve = DDomObserve;

  // static/main.ts
  window.__DEPENDENCIES = [
    {
      module: "graphing",
      dependencies: ["chartist"]
    },
    {
      module: "auth",
      dependencies: ["overlay"]
    }
  ];
  window.addEventListener("load", async (_e) => {
    if (APPVERSION > 0)
      await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    __APPINSTANCE_ROUTES.forEach((r2) => AddRoute(r2[0], r2[1]));
    if (window.location.href.includes("errmsg")) {
      const errmsg = window.location.href.match(/errmsg=(.+)/)[1];
      confirm(decodeURIComponent(errmsg));
      window.location.href = "/";
    } else {
      InitInterval();
    }
  });
  window.addEventListener("focus", () => {
  });
})();
/*! Bundled license information:

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/unsafe-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/



(() => {
  // ../Clients/PW/Projects/WaterMachine/pwapp/static/main_xtend.ts
  window.__APPINSTANCE = {
    firebase: {
      project: "purewatertech"
    }
  };
  window.__APPINSTANCE_ROUTES = [
    ["^index$", "index"],
    ["^upgrade$", "upgrade"],
    ["^machines$", "machines"],
    ["^machine/([0-9A-Za-z_]+)$", "machine"],
    ["^machinetelemetry/([0-9A-Za-z_]+)$", "machinetelemetry"]
  ];
  window.__APPINSTANCE_DEPENDENCIES = [
    {
      module: "machine",
      dependencies: ["machine_statuses"]
    },
    {
      module: "machine_edit",
      dependencies: ["overlay"]
    },
    {
      module: "machine_map",
      dependencies: ["overlay"]
    },
    {
      module: "machinetelemetry",
      dependencies: ["graphing"]
    }
  ];
})();
