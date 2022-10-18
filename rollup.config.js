
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";
import postcss from 'rollup-plugin-postcss';
import postcssNesting from 'postcss-nesting';
import html from '@web/rollup-plugin-html';




const devHTML = {
    preserveEntrySignatures: false,
    plugins: [
	html()
    ]
};




const devJS = {
  preserveEntrySignatures: false,
  plugins: [   nodeResolve(), typescript()   ]
};




const devCSS = {
  preserveEntrySignatures: false,
  plugins: [
    postcss({
      plugins: [postcssNesting()]
    })
  ]
};




const distJS = {
    preserveEntrySignatures: false,
    plugins: [   terser()   ]
};




let fexport; 
if (process.env.DIST) 
{
  if (process.env.JS)
    fexport = distJS;

} 
else if (process.env.DEV) 
{
    if (process.env.HTML)
	fexport = devHTML;
    else if (process.env.TS)
	fexport = devJS;
    else if (process.env.CSS)
	fexport = devCSS;
}




export default fexport;



