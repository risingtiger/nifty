

// TODO Put images in service worker cache




import { writeFileSync, readdirSync, readFileSync, promises as fspromises  } from 'fs';
import { promisify } 		  from 'util';
import { exec as cpexec } from 'child_process';
//import * as brotli        from 'brotli';
import { generateFonts }  from 'fantasticon';




const _WHATAPPINSTANCE     = process.argv[2]
const _WHATACTION          = process.argv[3]
const _DEBUG               = process.argv[4]




const exec = promisify(cpexec);
const sourceMainPath           = "./src";
const sourceAppInstancePath    = `../${_WHATAPPINSTANCE}app/appengine/src`;
const outputPathDev            = "./build";




void async function() {

  if (_DEBUG) {
    process.stdin.on('data', async function () {
      debugger
      handleAction_Init()
    })
  }

  else {
    handleAction_Init()
  }

}()




async function handleAction_Init() {

  const viewsMain        = readdirSync(sourceMainPath + "views", { withFileTypes:true}).filter(f=> f.isDirectory()).map(f=> { return {is: 'main', name:f.name};})
  const viewsAppInstance = readdirSync(sourceAppInstancePath + "views", { withFileTypes:true}).filter(f=> f.isDirectory()).map(f=> { return {is: 'appinstance', name:f.name};})
  const views = [ ...viewsMain, ...viewsAppInstance ]

  const componentsMain        = readdirSync(sourceMainPath + "components", { withFileTypes:true}).filter(f=> f.isDirectory()).map(f=> { return {is: 'main', name:f.name};})
  const componentsAppInstance = readdirSync(sourceAppInstancePath + "components", { withFileTypes:true}).filter(f=> f.isDirectory()).map(f=> { return {is: 'appinstance', name:f.name};})
  const components = [ ...componentsMain, ...componentsAppInstance ]



  if      (_WHATACTION === "alldev")     { await handleAction_AllDev(views, components); }

  else if (_WHATACTION === "main")       { await handleAction_Main(); }

  else if (_WHATACTION === "appengine")  { await handleAction_AppEngine(); }

  else if (_WHATACTION === "noncore")    { await handleAction_ThirdParty(); }

  else if (_WHATACTION === "images")     { await handleAction_Images(); }

  else if (_WHATACTION === "icons")      { await handleAction_Icons(); }

  else if (_WHATACTION === "dist")       { await handleAction_Dist(); }


  else {
    let v = views.find(v=> v.name === _WHATACTION)
    let c = components.find(c=> c.name === _WHATACTION)

    if (v)
      await handleAction_View_Or_Component("views", v)

    else if (c)
      await handleAction_View_Or_Component("components", c)

    else
      console.log("no action found")
  }

}




function handleAction_AllDev(views, components) {

  return new Promise(async res=> {

    await exec(`rm -rf ${outputPathDev} `);

    await handleAction_Main()

    await handleAction_AppEngine()

    await handleAction_ThirdParty()

    await handleAction_Images()

    await handleAction_Icons()

    for(let i = 0; i < views.length; i++) 
      await handleAction_View_Or_Component("views", views[i])

    for(let i = 0; i < components.length; i++) 
      await handleAction_View_Or_Component("components", components[i])

    res(1)

  })

}




function handleAction_Main() {   

  return new Promise(async res=> {

    let exstr   = `mkdir -p ${outputPathDev}`
    let execP   =  exec(exstr);

    await exec(`npx swc ${sourceMainPath} -d ${outputPathDev}`)
    await exec(`npx swc ${sourceAppInstancePath} -d ${outputPathDev}`)

    const jsMainP         = processJs(`${sourceMainPath}main.ts`)

    Promise.all([execP])

      .then(data=> {

        // hack to fix the shit fantastic css parser that doesn't handle escaped backslashes in content: properly

        let x = "\\\\" 
        let y = "\\"
        let replacedcss = data[3].replaceAll(`content: '${x}`, `content: '${y}`)

        writeFileSync(`${outputPathDev}main.js`, data[1] + "\n\n\n" + data[2])
        writeFileSync(`${outputPathDev}main.css`, replacedcss + "\n\n\n" + data[4])
        writeFileSync(`${outputPathDev}app.webmanifest`, JSON.stringify(manifestMain))

        res(1)

      })

  })

}




function handleAction_AppEngine () {   

  return new Promise(async res=> {

    // placeholder -- will need to find a way to suck in specific app appengine into main nifty appengine runtime

    res(1)

  })

}




async function handleAction_ThirdParty() {

  return new Promise(async res=> {

    let a = readdirSync(sourceMainPath + "thirdparty", { withFileTypes:true }).filter(f=> f.name.includes(".ts")).map(f=> { return {what: "main", name: f.name, type: 'thirdparty'}})
    let b = readdirSync(sourceAppInstancePath + "thirdparty", { withFileTypes:true }).filter(f=> f.name.includes(".ts")).map(f=> { return {what: "appinstance", name: f.name, type:'thirdparty'}})

    let files = [...a, ...b]



    for(let i = 0; i < files.length; i++) {

      const f = files[i]

      const fpath = `${f.what === "main" ? sourceMainPath : sourceAppInstancePath}${f.type}/${f.name}`

      const tsFileAsStr = readFileSync(fpath, {encoding: "utf8"})

      // will only replace if string exists. otherwise newTsFileAsStr contains exactly what is tsFileAsStr
      
      const newTsFileAsStr = tsFileAsStr.replace(/\/\/{--(.+.css)--}/, (_match, p1)=> {
        let cssstr = "";

        if (p1.charAt(0) === '.' || p1.charAt(0) === '/') 
          cssstr = readFileSync(p1, "utf8");

        else 
          cssstr = readFileSync(`./node_modules/${p1}`, "utf8");
        
        cssstr = cssstr.replace(/\/\*# sourceMappingURL.+\*\//, "");

        return `window['__MRP__CSSSTR_${f.name.substring(0, f.name.length-3)}'] = \`${cssstr}\`;`   
      });

      writeFileSync(fpath, newTsFileAsStr, {encoding: "utf8"})



      const x = await processJs(fpath); 

      writeFileSync(`${outputPathDev}${f.name.substring(0, f.name.length-3)}.js`, x); 
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




async function handleAction_Icons() {

  return new Promise(async res=> {

    const results = await generateFonts({
      inputDir: `${sourceMainPath}images/icons`,
      outputDir: `${outputPathDev}images/icons`,
      fontTypes: ['woff2'],
      fontsUrl: `${outputPathDev}/fonts`,
      name: `icons`
    })
    
    res(1);

  })

}




async function handleAction_View_Or_Component(what, module) {

  return new Promise(async res=> {

    let path = module.is === "main" ? sourceMainPath : sourceAppInstancePath

    const jsP   = await processJs(`${path}${what}/${module.name}/${module.name}.ts`);
    const htmlP = await processHTML(`${path}${what}/${module.name}/${module.name}.html`);
    const cssP  = await processCSS(`${path}${what}/${module.name}/${module.name}.css`);


    let [jsStr, htmlStr, cssStr] = await Promise.all([jsP, htmlP, cssP]);


    let jswithimports = jsStr.replace("{--htmlcss--}", `<style>${cssStr}</style>${htmlStr}`);


    writeFileSync(`${outputPathDev}${module.name}.js`, jswithimports);

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

          writeFileSync(outputPathDist + f.name.substring(0, f.name.length-3) + ".min.js.br", compressedBuf);

        } 

      })


    await exec(`cp -r ${outputPathDev}index.html ${outputPathDev}main.css ${outputPathDev}images ${outputPathDev}app.webmanifest ${outputPathDev}sw.js ${outputPathDist} `)


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

    exec(`./node_modules/.bin/esbuild ${path} --bundle --target=es2020`).then(result => {
      resolve(result.stdout);   
    })

  })

}




function processCSS(path) {   

  return new Promise(async (resolve, _reject) => {      

    const exec_str = `./node_modules/.bin/postcss ${path} --use postcss-nesting`

    exec(exec_str).then(result => {
      // let match = result.stdout.match(/var css.+ = "((.|\n)*)";/);
      // let str = match[1].replaceAll("\\n", " ");
      // str = str.replaceAll("\\t", " ");
      resolve(result.stdout);   
    })

  })

}




async function setCache () {

  let webManifestStr = readFileSync(`${sourceAppInstancePath}app_xtend.webmanifest`, "utf8");
  let vers           = Number(webManifestStr.match(/version\"\: ([0-9]+)/)[1]) + 1;


  let files = cachableNonJSFiles + ", " + getAllCachableJsFiles()


  let exstr = `
    sd '___[0-9]+___' '___${vers}___' ${sourceAppInstancePath}app_xtend.webmanifest &&
    sd '___[0-9]+___' '___${vers}___' ${outputPathDist}app.webmanifest &&
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


