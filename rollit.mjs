

// TODO Put images in service worker cache




import { writeFileSync, readdirSync, readFileSync, promises as fspromises  } from 'fs';
import { promisify } 		  from 'util';
import { exec as cpexec } from 'child_process';
import * as brotli        from 'brotli';


const exec = promisify(cpexec);
const sourcePath           = "./static/";
const outputPathDev        = "./appengine/static_dev/";
const outputPathDist       = "./appengine/static_dist/";
const cachableNonJSFiles   = "'index.html', 'main.css', 'pwt.webmanifest'"




void async function() {

  let what = process.argv[2];

  const views = readdirSync(sourcePath + "views", { withFileTypes:true})
    .filter(f=> f.isDirectory())
    .map(f=> f.name)


  if      (what === "alldev")     handleAllDev(views);

  else if (what === "main")       handleMain();

  else if (what === "thirdparty") handleThirdParty();

  else if (what === "images")     handleImages();

  else if (views.includes(what))  handleView(what);

  else if (what === "dist")       handleDist();
    

}();




async function handleAllDev(views) {

  await handleMain()

  await handleThirdParty()

  await handleImages()


  views
    .forEach(v=> handleView(v))

}




function handleMain() {   

  return new Promise(async res=> {

    let exstr   = `mkdir -p ${outputPathDev} && `;
    exstr      += `cp ${sourcePath}index.html ${outputPathDev}.  && `;
    exstr      += `cp ${sourcePath}pwt.webmanifest ${outputPathDev}.  && `;
    exstr      += `cp ${sourcePath}sw.js ${outputPathDev}.`;
    await exec(exstr);


    const jsP = await processJs(`${sourcePath}main.ts`);
    writeFileSync(`${outputPathDev}main.js`, jsP);


    const cssP  = await processCSS(`${sourcePath}main.css`);
    writeFileSync(`${outputPathDev}main.css`, cssP);


    res(1)

  })

}




async function handleThirdParty() {

  return new Promise(async res=> {

    readdirSync(sourcePath + "thirdparty", { withFileTypes:true })

      .filter(f=> f.name.includes(".ts"))

      .map(async (f) => {
        const x = await processJs(`${sourcePath}thirdparty/${f.name}`); 

        const newx = x.replace(/import '(.+.css)'/, (_match, p1)=> {
          let cssstr = "";

          if (p1.charAt(0) === '.' || p1.charAt(0) === '/') 
            cssstr = readFileSync(p1, "utf8");

          else 
            cssstr = readFileSync(`./node_modules/${p1}`, "utf8");
          
          cssstr = cssstr.replace(/\/\*# sourceMappingURL.+\*\//, "");

          return `window['__MRP__CSSSTR_${f.name.substring(0, f.name.length-3)}'] = \`${cssstr}\`;`   });


        writeFileSync(`${outputPathDev}${f.name.substring(0, f.name.length-3)}.js`, newx); 
      })

    res(1)

  })

}




async function handleImages() {

  return new Promise(async res=> {

    let exstr = `cp -r ${sourcePath}images ${outputPathDev}.`;

    await exec(exstr);


    res(1);

  })

}




async function handleView(view) {

  return new Promise(async res=> {

    const jsP   = await processJs(`${sourcePath}views/${view}/${view}.ts`);
    const htmlP = await processHTML(`${sourcePath}views/${view}/${view}.html`);
    const cssP  = await processCSS(`${sourcePath}views/${view}/${view}.css`);


    let [jsStr, htmlStr, cssStr] = await Promise.all([jsP, htmlP, cssP]);


    let jswithimports = jsStr.replace("{--htmlcss--}", `<style>${cssStr}</style>${htmlStr}`);


    writeFileSync(`${outputPathDev}${view}.js`, jswithimports);


    res(1)

  })

}




async function handleDist() {

  return new Promise(async res=> {

    await exec(`mkdir -p ${outputPathDist}`);


    readdirSync(outputPathDev, { withFileTypes:true })

      .forEach(async (f) => {   

        if (f.name.substring(f.name.length-3) === ".js" && f.name !== "sw.js") {

          const res = await exec(`rollup -c --environment DIST --environment JS ${outputPathDev}${f.name}`); 

          const compressedBuf = brotli.compress( Buffer.from(res.stdout, "utf8") );
          // const compressedBuf = res.stdout;

          writeFileSync(outputPathDist + f.name.substring(0, f.name.length-3) + ".min.js.br", compressedBuf);

        } 

      })


    await exec(`cp -r ${outputPathDev}index.html ${outputPathDev}main.css ${outputPathDev}images ${outputPathDev}pwt.webmanifest ${outputPathDev}sw.js ${outputPathDist} `)


    setCache();


    res(1)

  })

}




function processHTML(path) {   

  return new Promise(async (resolve, _reject) => {      
    resolve(fspromises.readFile(path, "utf8"));
  })

}




function processJs(path) {   

  return new Promise(async (resolve, _reject) => {      

    exec(`rollup -c --environment DEV --environment TS ${path}`)

      .then(result => {
        resolve(result.stdout);   })

      .catch(err => { throw new Error(err); })

  })

}




function processCSS(path) {   

  return new Promise(async (resolve, _reject) => {      

    exec(`rollup -c --environment DEV --environment CSS ${path}`)

      .then(result => {
        let match = result.stdout.match(/var css.+ = "((.|\n)*)";/);
        let str = match[1].replaceAll("\\n", " ");
        str = str.replaceAll("\\t", " ");
        resolve(str);   })

      .catch(err => {   throw new Error(err);   });

  })

}




async function setCache () {

  let webManifestStr = readFileSync(`${sourcePath}pwt.webmanifest`, "utf8");
  let vers           = Number(webManifestStr.match(/___([0-9]+)___/)[1]) + 1;


  let files = cachableNonJSFiles + ", " + getAllCachableJsFiles()


  let exstr = `
    sd '___[0-9]+___' '___${vers}___' ${sourcePath}pwt.webmanifest &&
    sd '___[0-9]+___' '___${vers}___' ${outputPathDist}pwt.webmanifest &&
    sd 'V__[0-9]+__' 'V${vers}' ${outputPathDist}sw.js &&
    sd 'cache_onload_replacestr' "${files}" ${outputPathDist}sw.js && 
    sd 'APPVERSION=0' 'APPVERSION=${vers}' ${outputPathDist}index.html &&
    sd 'APPVERSION \= [0-9]+' 'APPVERSION = ${vers}' ${outputPathDist}../app.js `;

  await exec(exstr); 




  function getAllCachableJsFiles() {
    
    const f = readdirSync(outputPathDev, { withFileTypes:true })
      
      .filter(f=> f.name.substring(f.name.length-3) === ".js" && f.name !== "sw.js")
      
      .map(f =>   `'${f.name}'`);


    return f.join(", ");

  }

}



