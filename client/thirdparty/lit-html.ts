

import { render, html } from "lit-html"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";





(window as any).Lit_Render = render;
(window as any).Lit_Html   = html;
(window as any).Lit_UnsafeHtml   = unsafeHTML;


