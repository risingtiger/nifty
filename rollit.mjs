

// TODO Put media in service worker cache




import { writeFile, writeFileSync, readdir, readdirSync, readFileSync, existsSync, mkdirSync, copyFileSync, cpSync, promises as fspromises  } from 'fs';
import { extname } from 'path';
import { promisify } 		  from 'util';
import { exec as cpexec } from 'child_process';
import * as brotli        from 'brotli';
import { generateFonts }  from 'fantasticon';
import * as uglifyjs      from 'uglify-js';
import * as uglifycss     from 'uglifycss';




const exec = promisify(cpexec);




const _WHATAPPINSTANCE           = process.argv[2]
const _WHATACTION                = (process.argv[3].split("-")[0] || process.argv[3]).toLowerCase()
const _WHATACTION_DETAIL         = (process.argv[3].split("-")[1] || "").toLowerCase()
const _DEBUG                     = process.argv[4]

const SOURCE_MAIN_PATH           = "./static/";
const SOURCE_APP_INSTANCE_PATH   = `./${_WHATAPPINSTANCE}app/static/`;
const APP_ENGINE_PATH            = "./appengine/";
const OUTPUT_PATH_DEV            = `${APP_ENGINE_PATH}static_dev/`;
const OUTPUT_PATH_DIST           = `${APP_ENGINE_PATH}static_dist/`;




void async function() {

    if (_DEBUG) {
        process.stdin.on('data', async function () {
            handleAction_Init()
        })
    }

    else {
        handleAction_Init()
    }

}()




async function handleAction_Init() {

    if      (_WHATACTION === "alldev")     { await handleAction_AllDev(); }

    else if (_WHATACTION === "main")       { await handleAction_Main(); }

    else if (_WHATACTION === "lazy")       { await handleAction_Lazy(_WHATACTION_DETAIL); }

    else if (_WHATACTION === "media")     { await handleAction_Media(); }

    else if (_WHATACTION === "icons")      { await handleAction_Icons(); }

    else if (_WHATACTION === "appengine")  { await handleAction_AppEngine(); }

    else if (_WHATACTION === "runlisten")  { await handleAction_RunListen(); }

    else if (_WHATACTION === "dist")       { await handleAction_AppEngine(); await handleAction_Dist(); }

}




function handleAction_AllDev() {

    return new Promise(async res=> {

        await exec(`rm -rf ${OUTPUT_PATH_DEV} `);

        await handleAction_Main()

        await handleAction_AppEngine()

        await handleAction_RunListen()

        await handleAction_Lazy()

        await handleAction_Media()

        await handleAction_Icons()

        let exstr = `sd '../([a-z]+)app/appengine/src' '../${_WHATAPPINSTANCE}app/appengine/src' ${OUTPUT_PATH_DEV}../package.json && sd './([a-z]+)app/appengine/src/index_extend.js' './${_WHATAPPINSTANCE}app/appengine/src/index_extend.js' ${OUTPUT_PATH_DEV}../src/index.ts`;

        await exec(exstr); 

        res(1)

    })

}




function handleAction_Main() {   return new Promise(async res=> {

    let exstr   = `mkdir -p ${OUTPUT_PATH_DEV} && `
    exstr      += `cp ${SOURCE_MAIN_PATH}index.html ${OUTPUT_PATH_DEV}.`;
    let execP   =  exec(exstr);

    let manifestMain = JSON.parse(readFileSync(`${SOURCE_MAIN_PATH}app.webmanifest`))
    let manifestApp  = JSON.parse(readFileSync(`${SOURCE_APP_INSTANCE_PATH}app_xtend.webmanifest`))

    manifestMain.name = manifestApp.name
    manifestMain.short_name = manifestApp.short_name
    manifestMain.description = `App Version: ${manifestApp.version}`
    manifestMain.version = manifestApp.version.toString()

    const jsMainP         = process_js(`${SOURCE_MAIN_PATH}main.ts`)
    const jsSwP           = process_js(`${SOURCE_MAIN_PATH}sw.ts`)
    const jsAppInstanceP  = process_js(`${SOURCE_APP_INSTANCE_PATH}main_xtend.ts`)
    const cssMainP        = process_css(`${SOURCE_MAIN_PATH}main.css`)
    const cssAppInstanceP = process_css(`${SOURCE_APP_INSTANCE_PATH}main_xtend.css`)

    Promise.all([execP, jsMainP, jsSwP, jsAppInstanceP, cssMainP, cssAppInstanceP])

        .then(data=> {

            // hack to fix the shit fantastic css parser that doesn't handle escaped backslashes in content: properly

            let x = "\\\\" 
            let y = "\\"
            let replacedcss = data[4].replaceAll(`content: '${x}`, `content: '${y}`)

            writeFileSync(`${OUTPUT_PATH_DEV}main.js`, data[1] + "\n\n\n" + data[3])
            writeFileSync(`${OUTPUT_PATH_DEV}sw.js`, data[2])
            writeFileSync(`${OUTPUT_PATH_DEV}main.css`, replacedcss + "\n\n\n" + data[5])
            writeFileSync(`${OUTPUT_PATH_DEV}app.webmanifest`, JSON.stringify(manifestMain))

            res(1)

    })
})}




function handleAction_Lazy(specific_file = "") {

    const viewsMain        = readdirSync(SOURCE_MAIN_PATH + "lazy/views", { withFileTypes:true }).filter(f=> f.isDirectory()).map(f=> { return {is: 'main', name:f.name, subfolder: "views"};})
    const viewsAppInstance = readdirSync(SOURCE_APP_INSTANCE_PATH + "lazy/views", { withFileTypes:true }).filter(f=> f.isDirectory()).map(f=> { return {is: 'appinstance', name:f.name, subfolder: "views"};})
    const views = [ ...viewsMain, ...viewsAppInstance ]

    const componentsMain        = readdirSync(SOURCE_MAIN_PATH + "lazy/components", { withFileTypes:true }).filter(f=> f.isDirectory()).map(f=> { return {is: 'main', name:f.name, subfolder: "components"};})
    const componentsAppInstance = readdirSync(SOURCE_APP_INSTANCE_PATH + "lazy/components", { withFileTypes:true }).filter(f=> f.isDirectory()).map(f=> { return {is: 'appinstance', name:f.name, subfolder: "components"};})
    const components = [ ...componentsMain, ...componentsAppInstance ]

    const thirdpartyMain        = readdirSync(SOURCE_MAIN_PATH + "lazy/thirdparty", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.ts').map(f=> { return {is: 'main', name:f.name.substring(0, f.name.length-3), subfolder: "thirdparty"};})
    const thirdpartyAppInstance = readdirSync(SOURCE_APP_INSTANCE_PATH + "lazy/thirdparty", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.ts').map(f=> { return {is: 'appinstance', name:f.name.substring(0, f.name.length-3), subfolder: "thirdparty"};})
    const thirdparty = [ ...thirdpartyMain, ...thirdpartyAppInstance ]

    const libsMain        = readdirSync(SOURCE_MAIN_PATH + "lazy/libs", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.ts').map(f=> { return {is: 'main', name:f.name.substring(0, f.name.length-3), subfolder: "libs"};})
    const libsAppInstance = readdirSync(SOURCE_APP_INSTANCE_PATH + "lazy/libs", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.ts').map(f=> { return {is: 'appinstance', name:f.name.substring(0, f.name.length-3), subfolder: "libs"};})
    const libs = [ ...libsMain, ...libsAppInstance ]

    if (!existsSync(OUTPUT_PATH_DEV+"lazy")) 
        mkdirSync(OUTPUT_PATH_DEV+"lazy")

    if (!existsSync(OUTPUT_PATH_DEV+"lazy/views")) 
        mkdirSync(OUTPUT_PATH_DEV+"lazy/views")

    if (!existsSync(OUTPUT_PATH_DEV+"lazy/components")) 
        mkdirSync(OUTPUT_PATH_DEV+"lazy/components")

    if (!existsSync(OUTPUT_PATH_DEV+"lazy/libs")) 
        mkdirSync(OUTPUT_PATH_DEV+"lazy/libs")

    if (!existsSync(OUTPUT_PATH_DEV+"lazy/thirdparty")) 
        mkdirSync(OUTPUT_PATH_DEV+"lazy/thirdparty")

    return new Promise(async res=> {

        if (specific_file) {

            let v = views.find(v=> v.name === specific_file)
            let c = components.find(c=> c.name === specific_file)
            let t = thirdparty.find(c=> c.name === specific_file)
            let l = libs.find(c=> c.name === specific_file)

            if (v)
                await process_lazy_view_or_component(v)

            else if (c)
                await process_lazy_view_or_component(c)

            else if (t)
                await process_lazy_thirdparty_or_lib(t) 

            else if (l)
                await process_lazy_thirdparty_or_lib(l) 

            else
                console.info("no action found")

        }

        else {

            let all_lazy_files = [...views, ...components, ...thirdparty, ...libs]
            const promises = []

            for(let i = 0; i < all_lazy_files.length; i++) {

                if (all_lazy_files[i].subfolder === "views" || all_lazy_files[i].subfolder === "components")
                    promises.push(process_lazy_view_or_component(all_lazy_files[i]))

                else if (all_lazy_files[i].subfolder === "thirdparty" || all_lazy_files[i].subfolder === "libs")
                    promises.push(process_lazy_thirdparty_or_lib(all_lazy_files[i])) 
            }

            await Promise.all(promises)
        }

        res(1)

    })

}




function handleAction_Media() {

    return new Promise(async res=> {

        let exstr = `cp -r ${SOURCE_MAIN_PATH}media ${OUTPUT_PATH_DEV}. && cp -r ${SOURCE_APP_INSTANCE_PATH}media/* ${OUTPUT_PATH_DEV}media/.`;

        await exec(exstr);

        res(1);

    })

}




function handleAction_Icons() {

    return new Promise(async res=> {

        await generateFonts({
            inputDir: `${SOURCE_MAIN_PATH}media/icons`,
            outputDir: `${OUTPUT_PATH_DEV}media/icons`,
            fontTypes: ['woff2'],
            fontsUrl: `${OUTPUT_PATH_DEV}/fonts`,
            name: `icons`
        })

        res(1);

    })

}




function handleAction_AppEngine() {

    return new Promise(async res=> {

        await exec(`npx swc ${APP_ENGINE_PATH}src -d ${APP_ENGINE_PATH}build && npx swc ./${_WHATAPPINSTANCE}app/appengine/src -d ${APP_ENGINE_PATH}build`);

        let exstr = `
            sd '__APPINSTANCE/appengine/src/index_extend' '${_WHATAPPINSTANCE}.js' ${APP_ENGINE_PATH}/build/index.js`

        await exec(exstr); 

        res(1)

    })

}




function handleAction_RunListen() {

    return new Promise(async res=> {

        await exec(`npx swc runlisten/src -d runlisten/build`);

        res(1)

    })

}




function handleAction_Dist() {

    return new Promise(async res=> {

        let app_version = await get_app_version()

        await exec(`if [ -e "${OUTPUT_PATH_DIST}" ];then rm -rf "${OUTPUT_PATH_DIST}" ; fi && mkdir -p ${OUTPUT_PATH_DIST}`);

        mkdirSync(OUTPUT_PATH_DIST+"lazy")
        mkdirSync(OUTPUT_PATH_DIST+"lazy/views")
        mkdirSync(OUTPUT_PATH_DIST+"lazy/components")
        mkdirSync(OUTPUT_PATH_DIST+"lazy/libs")
        mkdirSync(OUTPUT_PATH_DIST+"lazy/thirdparty")

        let lp = OUTPUT_PATH_DEV+"lazy/"
        let sp = OUTPUT_PATH_DIST+"lazy/"

        const js_lazy_views        = readdirSync(lp + "views", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=>      { return {opath:`${lp}views/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}views/${f.name.substring(0, f.name.length-3)}`};})
        const js_lazy_components   = readdirSync(lp + "components", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=> { return {opath:`${lp}components/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}components/${f.name.substring(0, f.name.length-3)}` };})
        const js_lazy_libs         = readdirSync(lp + "libs", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=>       { return {opath:`${lp}libs/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}libs/${f.name.substring(0, f.name.length-3)}`};})
        const js_lazy_thirdparty   = readdirSync(lp + "thirdparty", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=> { return {opath:`${lp}thirdparty/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}thirdparty/${f.name.substring(0, f.name.length-3)}`};})

        const js_files = [ ...js_lazy_views, ...js_lazy_components, ...js_lazy_libs, ...js_lazy_thirdparty ]

        js_files.push({
            opath:`${OUTPUT_PATH_DEV}sw`, 
            spath: `${OUTPUT_PATH_DIST}sw`,
            hookfunc: (str)=> str.replace('cacheV__0__', `cacheV__${app_version}__`)
        })

        js_files.push({
            opath:`${OUTPUT_PATH_DEV}main`, 
            spath: `${OUTPUT_PATH_DIST}main`,
            hookfunc: (str)=> {
                let appversion_replaced = str.replace(/APPVERSION.*=.*0/, `APPVERSION=${app_version}`)

                let appupdate_ts_replaced = appversion_replaced.replace(/APPUPDATE_TS.*=.*0/, `APPUPDATE_TS=${Date.now()}`)

                return appupdate_ts_replaced.replace('navigator.serviceWorker.register("/sw.js"', `navigator.serviceWorker.register("/sw-v${app_version}.js"`)
            }
        })

        js_files.forEach(jsfile => js_to_dist(jsfile, app_version))   

        index_html_file_to_dist(app_version)
        main_css_file_to_dist(app_version)
        webmanifest_file_to_dist(app_version)
        media_folder_to_dist(app_version)

        let exstr = `
            sd 'version": [0-9]+' 'version": ${app_version}' ${SOURCE_APP_INSTANCE_PATH}app_xtend.webmanifest &&
            sd 'App Version: [0-9]+' 'App Version: ${app_version}' ${OUTPUT_PATH_DIST}app_${app_version}.webmanifest &&
            sd 'APPVERSION \= [0-9]+' 'APPVERSION = ${app_version}' ${APP_ENGINE_PATH}build/src/index.js `;

        await exec(exstr); 

        res(1)

    })


    function get_app_version() {

        return new Promise(res=> {

            //let web_manifest_str = readFileSync(`${SOURCE_APP_INSTANCE_PATH}app_xtend.webmanifest`, "utf8");
            //let vers             = Number(web_manifest_str.match(/version\"\: "([0-9]+)"/)[1]) + 1;

            //res(vers);
            res(1140)
        })
    }


    function js_to_dist(f, app_version) {

        let js_str = readFileSync(`${f.opath}.js`, "utf8"); 

        js_str = replace_media_urls(js_str, app_version)

        if (f.hookfunc)
            js_str = f.hookfunc(js_str)

        let js_uglified = uglifyjs.minify(js_str)

        if (js_uglified.error) {
            console.info('js_uglified.error: ')
            console.info(js_uglified.error)
        }

        const js_compressed = brotli.compress( Buffer.from(js_uglified.code, "utf8") )
        
        if (js_compressed) {
            writeFile(f.spath + "-v"+app_version + ".min.js.br", js_compressed, {}, ()=>{})
        }

        else {
            writeFile(f.spath + "-v" + app_version + ".min.js", js_uglified.code, {}, ()=>{})
            writeFile(f.spath + "-v"+app_version + ".min.js", js_str, {}, ()=>{})
        }

    }

    function index_html_file_to_dist(app_version) {

        let index_html_str = readFileSync(`${OUTPUT_PATH_DEV}index.html`, "utf8");

        index_html_str = replace_media_urls(index_html_str, app_version)

        index_html_str = index_html_str.replace('href="/app.webmanifest"', `href="/app-v${app_version}.webmanifest"`)

        writeFileSync(`${OUTPUT_PATH_DIST}index-v${app_version}.html`, index_html_str, {})

    }

    function main_css_file_to_dist(app_version) {

        let main_css_str = readFileSync(`${OUTPUT_PATH_DEV}main.css`, "utf8");

        main_css_str = replace_media_urls(main_css_str, app_version)

        let css_uglified = uglifycss.processString(main_css_str)

        if (css_uglified.error) {
            console.info('css_uglified.error: ')
            console.info(css_uglified.error)
        }

        let main_css_str_compressed = brotli.compress( Buffer.from(css_uglified, "utf8") )

        writeFileSync(`${OUTPUT_PATH_DIST}main-v${app_version}.min.css.br`, main_css_str_compressed, {})
    }

    function webmanifest_file_to_dist(app_version) {

        let webmanifest_str = readFileSync(`${OUTPUT_PATH_DEV}app.webmanifest`, "utf8");

        webmanifest_str = replace_media_urls(webmanifest_str, app_version)

        writeFileSync(`${OUTPUT_PATH_DIST}app-v${app_version}.webmanifest`, webmanifest_str, {})

    }

    async function media_folder_to_dist(app_version) {

        cpSync(`${OUTPUT_PATH_DEV}media`, `${OUTPUT_PATH_DIST}/media`, { recursive: true })

        let media_files_extensions = ["png", "jpg", "gif", "svg", "ico", "woff2"]
        
        for(let i=0;i<media_files_extensions.length;i++) {

            let mfe = media_files_extensions[i]
        
            await exec(`fd . ${OUTPUT_PATH_DIST}media/ -e '${mfe}' -x rename 's/.${mfe}/-v${app_version}.${mfe}/' {}`)
        
        }

    }

    function replace_media_urls(str, app_version) {

        return str.replace(/(\"|\'|\`)\/assets\/([^"'`]+)\.([a-z0-9]+)(\"|\'|\`)/g,`$1/assets/$2-v${app_version}.$3$4`)

    }

}




function process_lazy_view_or_component(file) {

    return new Promise(async res=> {

        let dir = `${file.is === "main" ? SOURCE_MAIN_PATH : SOURCE_APP_INSTANCE_PATH}lazy/${file.subfolder}/${file.name}`
        let path = `${file.is === "main" ? SOURCE_MAIN_PATH : SOURCE_APP_INSTANCE_PATH}lazy/${file.subfolder}/${file.name}/${file.name}`

        const promises = []

        promises.push(readsubs(dir))
        promises.push(process_js(path+".ts"))
        promises.push(process_html(path+".html"))
        promises.push(process_css(path+".css"))

        let [subdirs, js_str, html_str, css_str] = await Promise.all(promises);

        js_str = await process_subview_if_any(dir, js_str, subdirs)

        js_str = js_str.replace("{--htmlcss--}", `<style>${css_str}</style>${html_str}`);

        writeFileSync(`${OUTPUT_PATH_DEV}lazy/${file.subfolder}/${file.name}.js`, js_str);

        res(1)
    })

    
    function readsubs(directory) { return new Promise(res=> {
        readdir(directory, { withFileTypes: true }, (_err, files) => {
            const subs = files.filter(d => d.isDirectory()).map(d => d.name)
            res(subs)
        })
    })}


    function process_subview_if_any(dir, jsstr, subdirs) { return new Promise(async res=> {

        if (subdirs.length === 0) {
            res(jsstr)
            return
        }

        const promises = []

        for(let i = 0; i < subdirs.length; i++) {
            promises.push(process_html(`${dir}/${subdirs[i]}/${subdirs[i]}.html`))
            promises.push(process_css(`${dir}/${subdirs[i]}/${subdirs[i]}.css`))
        }

        const pr = await Promise.all(promises)

        for(let i = 0; i < subdirs.length; i++) {
            const stri1 = jsstr.indexOf("{--htmlcss--}")
            const stri2 = jsstr.indexOf("customElements.define(\"vc-", stri1)

            if (jsstr.substring(stri2+26, stri2+26+subdirs[i].length) === subdirs[i]) {
                jsstr = jsstr.replace("{--htmlcss--}", `<style>${pr[i*2+1]}</style>${pr[i*2]}`)
            }
        }

        res(jsstr)

    })}
}




function process_lazy_thirdparty_or_lib(file) {

    return new Promise(async res=> {

        let pathfs = `${file.is === "main" ? SOURCE_MAIN_PATH : SOURCE_APP_INSTANCE_PATH}lazy/${file.subfolder}/${file.name}.ts`

        const processed_js = await process_js(pathfs)

        writeFileSync(`${OUTPUT_PATH_DEV}lazy/${file.subfolder}/${file.name}.js`, processed_js); 

        res(1)

    })

}




function process_html(path) {   

    return new Promise(async (resolve, _reject) => {      

        resolve(fspromises.readFile(path, "utf8"));

    })

}




function process_js(path) {   

    return new Promise(async (resolve, _reject) => {      

        exec(`./node_modules/.bin/esbuild ${path} --bundle --target=es2021,chrome110`).then(result => {
            resolve(result.stdout);   
        })

    })

}




function process_css(path) {   

    return new Promise(async (resolve, _reject) => {      

        const exec_str = `./node_modules/.bin/postcss ${path} --no-map --use postcss-nesting`

        exec(exec_str)

            .then(result => {
                resolve(result.stdout);   
            })

    })

}



