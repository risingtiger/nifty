

// TODO Put images in service worker cache




import { writeFileSync, readdirSync, readFileSync, promises as fspromises  } from 'fs';
import { promisify } 		  from 'util';
import { exec as cpexec } from 'child_process';
import * as brotli        from 'brotli';




const _WHATAPPINSTANCE     = process.argv[2]
const _WHATACTION          = process.argv[3]




const exec = promisify(cpexec);
const sourceMainPath           = "./static/";
const sourceAppInstancePath    = `./${_WHATAPPINSTANCE}app/static/`;
const outputPathDev            = "./appengine/static_dev/";
const outputPathDist       = "./appengine/static_dist/";
const cachableNonJSFiles   = "'index.html', 'main.css', 'pwt.webmanifest'"








void async function() {

  const viewsMain        = readdirSync(sourceMainPath + "views", { withFileTypes:true}).filter(f=> f.isDirectory()).map(f=> { return {is: 'main', name:f.name};})
  const viewsAppInstance = readdirSync(sourceAppInstancePath + "views", { withFileTypes:true}).filter(f=> f.isDirectory()).map(f=> { return {is: 'appinstance', name:f.name};})
  const views = [ ...viewsMain, ...viewsAppInstance ]



  if      (_WHATACTION === "alldev")     { handleAction_AllDev(views); }

  else if (_WHATACTION === "main")       { handleAction_Main(); }

  else if (_WHATACTION === "thirdparty") { handleAction_ThirdParty(); }

  else if (_WHATACTION === "images")     { handleAction_Images(); }

  else if (_WHATACTION === "dist")       { handleAction_Dist(); }


  else {
    debugger
    let v = views.find(v=> v.name === _WHATACTION)

    if (v)
      handleAction_View(v)
    else
      console.log("no action found")
  }


}();




async function handleAction_AllDev(views) {

  await handleAction_Main()

  await handleAction_ThirdParty()

  await handleAction_Images()


  views
    .forEach(v=> handleAction_View(v))

}




function handleAction_Main() {   

  return new Promise(async res=> {

    // just doing straight save of index and sw.js after creating output file 
    
    let exstr   = `rm -rf ${outputPathDev} && `;
    exstr      += `mkdir -p ${outputPathDev} && `
    exstr      += `cp ${sourceMainPath}index.html ${outputPathDev}.  && `;
    exstr      += `cp ${sourceMainPath}sw.js ${outputPathDev}.`;
    let execP   =  exec(exstr);



    // web manifest file -- pulling values from app instance to populate into main and saving to output 

    let manifestMain = JSON.parse(readFileSync(`${sourceMainPath}app.webmanifest`))
    let manifestApp  = JSON.parse(readFileSync(`${sourceAppInstancePath}app_xtend.webmanifest`))

    manifestMain.name = manifestApp.name
    manifestMain.short_name = manifestApp.short_name
    manifestMain.description = `App Version: ___${manifestApp.version}___`

    writeFileSync(`${outputPathDev}app.webmanifest`, JSON.stringify(manifestMain))



    // js and css. parsing both main and appinstance and then inserting app instance into main before saving to output 

    const jsMainP         = processJs(`${sourceMainPath}main.ts`);
    const jsAppInstanceP  = processJs(`${sourceAppInstancePath}main_xtend.ts`);
    const cssMainP        = processCSS(`${sourceMainPath}main.css`);
    const cssAppInstanceP = processCSS(`${sourceAppInstancePath}main_xtend.css`);

    Promise.all([execP, jsMainP, jsAppInstanceP, cssMainP, cssAppInstanceP])

      .then(data=> {
        writeFileSync(`${outputPathDev}main.js`, data[1] + "\n\n\n" + data[2])
        writeFileSync(`${outputPathDev}main.css`, data[3] + "\n\n\n" + data[4])

        res(1)

      })

  })

}




async function handleAction_ThirdParty() {

  return new Promise(async res=> {

    let a = readdirSync(sourceMainPath + "thirdparty", { withFileTypes:true }).filter(f=> f.name.includes(".ts")).map(f=> { return {what: "main", name: f.name}})
    let b = readdirSync(sourceAppInstancePath + "thirdparty", { withFileTypes:true }).filter(f=> f.name.includes(".ts")).map(f=> { return {what: "appinstance", name: f.name}})

    let files = [...a, ...b]



    for(let i = 0; i < files.length; i++) {

      const f = files[i]

      const x = await processJs(`${f.what === "main" ? sourceMainPath : sourceAppInstancePath}thirdparty/${f.name}`); 



      const newx = x.replace(/import '(.+.css)'/, (_match, p1)=> {
        let cssstr = "";

        if (p1.charAt(0) === '.' || p1.charAt(0) === '/') 
          cssstr = readFileSync(p1, "utf8");

        else 
          cssstr = readFileSync(`./node_modules/${p1}`, "utf8");
        
        cssstr = cssstr.replace(/\/\*# sourceMappingURL.+\*\//, "");

        return `window['__MRP__CSSSTR_${f.name.substring(0, f.name.length-3)}'] = \`${cssstr}\`;`   
      });



      writeFileSync(`${outputPathDev}${f.name.substring(0, f.name.length-3)}.js`, newx); 
    }



    res(1)

  })

}




async function handleAction_Images() {

  return new Promise(async res=> {

    let exstr = `cp -r ${sourceMainPath}images ${outputPathDev}. && cp -r ${sourceAppInstancePath}images/* ${outputPathDev}images/.`;

    await exec(exstr);


    res(1);

  })

}




async function handleAction_View(view) {

  return new Promise(async res=> {

    let path = view.is === "main" ? sourceMainPath : sourceAppInstancePath

    const jsP   = await processJs(`${path}views/${view.name}/${view.name}.ts`);
    const htmlP = await processHTML(`${path}views/${view.name}/${view.name}.html`);
    const cssP  = await processCSS(`${path}views/${view.name}/${view.name}.css`);


    let [jsStr, htmlStr, cssStr] = await Promise.all([jsP, htmlP, cssP]);


    let jswithimports = jsStr.replace("{--htmlcss--}", `<style>${cssStr}</style>${htmlStr}`);


    writeFileSync(`${outputPathDev}${view.name}.js`, jswithimports);


    res(1)

  })

}




async function handleAction_Dist() {

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



