(() => {
  // node_modules/lit-html/lit-html.js
  var t;
  var i = window;
  var s = i.trustedTypes;
  var e = s ? s.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
  var o = `lit$${(Math.random() + "").slice(9)}$`;
  var n = "?" + o;
  var l = `<${n}>`;
  var h = document;
  var r = (t3 = "") => h.createComment(t3);
  var d = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
  var u = Array.isArray;
  var c = (t3) => u(t3) || "function" == typeof (null == t3 ? void 0 : t3[Symbol.iterator]);
  var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
  var a = /-->/g;
  var f = />/g;
  var _ = RegExp(`>|[ 	
\f\r](?:([^\\s"'>=/]+)([ 	
\f\r]*=[ 	
\f\r]*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
  var m = /'/g;
  var p = /"/g;
  var $ = /^(?:script|style|textarea|title)$/i;
  var g = (t3) => (i3, ...s2) => ({ _$litType$: t3, strings: i3, values: s2 });
  var y = g(1);
  var w = g(2);
  var x = Symbol.for("lit-noChange");
  var b = Symbol.for("lit-nothing");
  var T = /* @__PURE__ */ new WeakMap();
  var A = h.createTreeWalker(h, 129, null, false);
  var E = (t3, i3) => {
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
  var C = class {
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
  function P(t3, i3, s2 = t3, e4) {
    var o3, n2, l2, h2;
    if (i3 === x)
      return i3;
    let r2 = void 0 !== e4 ? null === (o3 = s2._$Co) || void 0 === o3 ? void 0 : o3[e4] : s2._$Cl;
    const u2 = d(i3) ? void 0 : i3._$litDirective$;
    return (null == r2 ? void 0 : r2.constructor) !== u2 && (null === (n2 = null == r2 ? void 0 : r2._$AO) || void 0 === n2 || n2.call(r2, false), void 0 === u2 ? r2 = void 0 : (r2 = new u2(t3), r2._$AT(t3, s2, e4)), void 0 !== e4 ? (null !== (l2 = (h2 = s2)._$Co) && void 0 !== l2 ? l2 : h2._$Co = [])[e4] = r2 : s2._$Cl = r2), void 0 !== r2 && (i3 = P(t3, r2._$AS(t3, i3.values), r2, e4)), i3;
  }
  var V = class {
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
  var N = class {
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
  var S = class {
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
  var M = class extends S {
    constructor() {
      super(...arguments), this.type = 3;
    }
    j(t3) {
      this.element[this.name] = t3 === b ? void 0 : t3;
    }
  };
  var R = s ? s.emptyScript : "";
  var k = class extends S {
    constructor() {
      super(...arguments), this.type = 4;
    }
    j(t3) {
      t3 && t3 !== b ? this.element.setAttribute(this.name, R) : this.element.removeAttribute(this.name);
    }
  };
  var H = class extends S {
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
  var I = class {
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
  var z = i.litHtmlPolyfillSupport;
  null == z || z(C, N), (null !== (t = i.litHtmlVersions) && void 0 !== t ? t : i.litHtmlVersions = []).push("2.5.0");
  var Z = (t3, i3, s2) => {
    var e4, o3;
    const n2 = null !== (e4 = null == s2 ? void 0 : s2.renderBefore) && void 0 !== e4 ? e4 : i3;
    let l2 = n2._$litPart$;
    if (void 0 === l2) {
      const t4 = null !== (o3 = null == s2 ? void 0 : s2.renderBefore) && void 0 !== o3 ? o3 : null;
      n2._$litPart$ = l2 = new N(i3.insertBefore(r(), t4), t4, void 0, null != s2 ? s2 : {});
    }
    return l2._$AI(t3), l2;
  };

  // node_modules/lit-html/directive.js
  var t2 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
  var e2 = (t3) => (...e4) => ({ _$litDirective$: t3, values: e4 });
  var i2 = class {
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

  // node_modules/lit-html/directives/unsafe-html.js
  var e3 = class extends i2 {
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
  var o2 = e2(e3);

  // static/thirdparty/lit-html.ts
  window.Lit_Render = Z;
  window.Lit_Html = y;
  window.Lit_UnsafeHtml = o2;
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
