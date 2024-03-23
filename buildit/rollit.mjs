



import { writeFile, writeFileSync, readdirSync, readFileSync, existsSync, mkdirSync, cpSync, promises as fspromises  } from 'fs';
import { extname, parse } from 'path';
import { promisify } 		  from 'util';
import { exec as cpexec } from 'child_process';
import * as brotli        from 'brotli';
import { generateFonts }  from 'fantasticon';
import * as uglifyjs      from 'uglify-js';
import * as uglifycss     from 'uglifycss';
//import chokidar           from 'chokidar';




const exec = promisify(cpexec);




const INSTANCE                     = "pwt"
const ACTION                       = (process.argv[2].split("-")[0] || process.argv[2]).toLowerCase()
const ACTION_DETAIL                = (process.argv[2].split("-")[1] || "").toLowerCase()
const IS_DEBUG                     = process.argv[3]

const ABSOLUTE_PATH                = "/Users/dave/Code/nifty/";
const CLIENT_MAIN_SRC_PATH         = ABSOLUTE_PATH + "client/";
const CLIENT_INSTANCE_SRC_PATH     = `${CLIENT_MAIN_SRC_PATH}client_${INSTANCE}/`;

const SERVER_MAIN_PATH             = ABSOLUTE_PATH + "server/";
const SERVER_MAIN_SRC_PATH         = `${SERVER_MAIN_PATH}src/`;
const SERVER_INSTANCE_SRC_PATH     = `${SERVER_MAIN_SRC_PATH}server_${INSTANCE}/`;

const OUTPUT_STATIC_DEV_PATH       = `${SERVER_MAIN_PATH}static_dev/`;
const OUTPUT_STATIC_DIST_PATH      = `${SERVER_MAIN_PATH}static_dist/`;
const OUTPUT_BUILD_PATH            = `${SERVER_MAIN_PATH}build/`;




//let watcher_timeout = false




void async function() {

    if (IS_DEBUG) {
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

    if (       ACTION === "media")      { await handleAction_Media(ACTION_DETAIL); }
    else if (  ACTION === "server")     { await handleAction_Server(); }
    else if (  ACTION === "dist")       { await handleAction_Dist(); }
}




function handleAction_Media(specific_aspect = "") {  return new Promise(async res=> {

    if (!existsSync(OUTPUT_STATIC_DEV_PATH)) {
        console.log("OUTPUT_STATIC_DEV_PATH does not exist. Run main first");
        return false
    }

    if (specific_aspect === "icons") {
        await doicons()

    } else {

        await exec(`rm -r ${OUTPUT_STATIC_DEV_PATH}media || true && mkdir ${OUTPUT_STATIC_DEV_PATH}media`);

        await exec(`cp -r ${CLIENT_MAIN_SRC_PATH}media ${OUTPUT_STATIC_DEV_PATH}.`);

        await exec(`cp -r ${CLIENT_INSTANCE_SRC_PATH}media/* ${OUTPUT_STATIC_DEV_PATH}media/.`);

        await doicons()
    }

    res(1);


    function doicons() {   return new Promise(async res=> {

        await generateFonts({
            inputDir: `${CLIENT_MAIN_SRC_PATH}media/icons`,
            outputDir: `${OUTPUT_STATIC_DEV_PATH}media/icons`,
            fontTypes: ['woff2'],
            fontsUrl: `${OUTPUT_STATIC_DEV_PATH}/fonts`,
            name: `icons`
        })
        res(1);
    })}
})}




function handleAction_Server() {   return new Promise(async res=> {

    const instance_index_extend_str = readFileSync(`${SERVER_INSTANCE_SRC_PATH}index_extend.ts`, "utf8");
    const server_index_str         = readFileSync(`${SERVER_MAIN_SRC_PATH}index.ts`, "utf8");

    const imports_start = instance_index_extend_str.indexOf("//{--app_imports--}") + 19
    const imports_end   = instance_index_extend_str.indexOf("//{--end_app_imports--}")
    const imports_str   = instance_index_extend_str.substring(imports_start, imports_end)

    const declarations_start = instance_index_extend_str.indexOf("//{--app_declarations--}") + 25
    const declarations_end   = instance_index_extend_str.indexOf("//{--end_app_declarations--}")
    const declarations_str   = instance_index_extend_str.substring(declarations_start, declarations_end)

    const routes_start = instance_index_extend_str.indexOf("//{--app_routes--}") + 19
    const routes_end   = instance_index_extend_str.indexOf("//{--end_app_routes--}")
    const routes_str   = instance_index_extend_str.substring(routes_start, routes_end)

    const modded_imports_str = imports_str.replace(/import (.+) from \"(.+)\"/g, `import $1 from "./server_${INSTANCE}/$2"`)

    let newindexstr = server_index_str.replace("//{--app_imports--}", "//{--app_imports--}\n" + modded_imports_str);
    newindexstr = newindexstr.replace("//{--app_declarations--}", "//{--app_declarations--}\n" + declarations_str);
    newindexstr = newindexstr.replace("//{--app_routes--}", "//{--app_routes--}\n" + routes_str);

    writeFileSync(`${SERVER_MAIN_SRC_PATH}index_hldr.ts`, newindexstr);

    const fpath = `${SERVER_MAIN_SRC_PATH}`

    await exec(`rm -r ${OUTPUT_BUILD_PATH} || true && npx swc ${fpath} --config-file ${SERVER_MAIN_PATH}.swcrc -d ${OUTPUT_BUILD_PATH}`)

    await exec(`
        mv ${OUTPUT_BUILD_PATH}src/index_hldr.js ${OUTPUT_BUILD_PATH}src/index.js &&
        mv ${OUTPUT_BUILD_PATH}src/* ${OUTPUT_BUILD_PATH}. &&
        rm -r ${OUTPUT_BUILD_PATH}src
    `)

    res(1);   
})}




function handleAction_Dist() {

    return new Promise(async res=> {

        let app_version = get_app_version()

        await exec(`if [ -e "${OUTPUT_STATIC_DIST_PATH}" ];then rm -rf "${OUTPUT_STATIC_DIST_PATH}" ; fi && mkdir -p ${OUTPUT_STATIC_DIST_PATH}`);

        mkdirSync(OUTPUT_STATIC_DIST_PATH+"lazy")
        mkdirSync(OUTPUT_STATIC_DIST_PATH+"lazy/views")
        mkdirSync(OUTPUT_STATIC_DIST_PATH+"lazy/components")
        mkdirSync(OUTPUT_STATIC_DIST_PATH+"lazy/libs")
        mkdirSync(OUTPUT_STATIC_DIST_PATH+"lazy/thirdparty")

        let lp = OUTPUT_STATIC_DEV_PATH+"lazy/"
        let sp = OUTPUT_STATIC_DIST_PATH+"lazy/"

        const js_lazy_views        = readdirSync(lp + "views", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=>      { return {opath:`${lp}views/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}views/${f.name.substring(0, f.name.length-3)}`};})
        const js_lazy_components   = readdirSync(lp + "components", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=> { return {opath:`${lp}components/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}components/${f.name.substring(0, f.name.length-3)}` };})
        const js_lazy_libs         = readdirSync(lp + "libs", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=>       { return {opath:`${lp}libs/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}libs/${f.name.substring(0, f.name.length-3)}`};})
        const js_lazy_thirdparty   = readdirSync(lp + "thirdparty", { withFileTypes:true }).filter(f=> extname(f.name).toLowerCase() === '.js').map(f=> { return {opath:`${lp}thirdparty/${f.name.substring(0, f.name.length-3)}`, spath: `${sp}thirdparty/${f.name.substring(0, f.name.length-3)}`};})

        const js_files = [ ...js_lazy_views, ...js_lazy_components, ...js_lazy_libs, ...js_lazy_thirdparty ]

        js_files.push({
            opath:`${OUTPUT_STATIC_DEV_PATH}sw`, 
            spath: `${OUTPUT_STATIC_DIST_PATH}sw`,
            append_app_version_to_filename: false,
            hookfunc: (str)=> str.replace('cacheV__0__', `cacheV__${app_version}__`)
        })

        js_files.push({
            opath:`${OUTPUT_STATIC_DEV_PATH}main`, 
            spath: `${OUTPUT_STATIC_DIST_PATH}main`,
            hookfunc: (str)=> {
                let appversion_replaced = str.replace(/APPVERSION = 0;/, `APPVERSION=${app_version};`)

                let appupdate_ts_replaced = appversion_replaced.replace(/APPUPDATE_TS = 0;/, `APPUPDATE_TS=${Date.now()}`)

                //return appupdate_ts_replaced.replace('navigator.serviceWorker.register("/sw.js"', `navigator.serviceWorker.register("/sw-v${app_version}.js"`)
                return appupdate_ts_replaced.replace('navigator.serviceWorker.register("/sw.js"', `navigator.serviceWorker.register("/sw.js"`)
            }
        })

        js_files.forEach(jsfile => js_to_dist(jsfile, app_version))   

        index_html_file_to_dist(app_version)
        main_css_file_to_dist(app_version)
        webmanifest_file_to_dist(app_version)
        media_folder_to_dist(app_version)
        server_index_js_to_dist(app_version)

        await exec(`sd 'version": [0-9]+' 'version": ${app_version}' ${CLIENT_INSTANCE_SRC_PATH}app_xtend.webmanifest`); 

        res(1)

    })


    function get_app_version() {

        let web_manifest_str = readFileSync(`${CLIENT_INSTANCE_SRC_PATH}app_xtend.webmanifest`, "utf8");
        let vers             = Number(web_manifest_str.match(/version\"\: ([0-9]+)/)[1]) + 1;

        return vers
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

        const append_app_version_to_filename = f.append_app_version_to_filename === undefined ? true : f.append_app_version_to_filename
        const fpath_appversion = append_app_version_to_filename ? "-v"+app_version : ""
        
        if (js_compressed) {
            writeFile(f.spath + fpath_appversion + ".min.js.br", js_compressed, {}, ()=>{})
        }

        else {
            writeFile(f.spath + fpath_appversion + ".min.js", js_uglified.code, {}, ()=>{})
        }
    }

    function index_html_file_to_dist(app_version) {

        let index_html_str = readFileSync(`${OUTPUT_STATIC_DEV_PATH}index.html`, "utf8");

        index_html_str = replace_media_urls(index_html_str, app_version)

        index_html_str = index_html_str.replace('href="/app.webmanifest"', `href="/app-v${app_version}.webmanifest"`)

        writeFileSync(`${OUTPUT_STATIC_DIST_PATH}index-v${app_version}.html`, index_html_str, {})

    }

    function main_css_file_to_dist(app_version) {

        let main_css_str = readFileSync(`${OUTPUT_STATIC_DEV_PATH}main.css`, "utf8");

        main_css_str = replace_media_urls(main_css_str, app_version)

        let css_uglified = uglifycss.processString(main_css_str)

        if (css_uglified.error) {
            console.info('css_uglified.error: ')
            console.info(css_uglified.error)
        }

        let main_css_str_compressed = brotli.compress( Buffer.from(css_uglified, "utf8") )

        writeFileSync(`${OUTPUT_STATIC_DIST_PATH}main-v${app_version}.min.css.br`, main_css_str_compressed, {})
    }

    function webmanifest_file_to_dist(app_version) {

        let webmanifest_str = readFileSync(`${OUTPUT_STATIC_DEV_PATH}app.webmanifest`, "utf8");

        webmanifest_str = replace_media_urls(webmanifest_str, app_version)

        writeFileSync(`${OUTPUT_STATIC_DIST_PATH}app-v${app_version}.webmanifest`, webmanifest_str, {})

    }

    async function media_folder_to_dist(app_version) {

        cpSync(`${OUTPUT_STATIC_DEV_PATH}media`, `${OUTPUT_STATIC_DIST_PATH}/media`, { recursive: true })

        let media_files_extensions = ["png", "jpg", "gif", "svg", "ico", "woff2"]
        
        for(let i=0;i<media_files_extensions.length;i++) {

            let mfe = media_files_extensions[i]
        
            await exec(`fd . ${OUTPUT_STATIC_DIST_PATH}media/ -e '${mfe}' -x rename 's/.${mfe}/-v${app_version}.${mfe}/' {}`)
        
        }

    }

    async function server_index_js_to_dist(app_version) {

        let exstr = `sd 'APPVERSION \= 0' 'APPVERSION = ${app_version}' ${OUTPUT_BUILD_PATH}index.js `
        await exec(exstr); 
    }

    function replace_media_urls(str, app_version) {

        return str.replace(/(\"|\'|\`)\/assets\/([^"'`]+)\.([_a-z0-9]+)(\"|\'|\`)/g,`$1/assets/$2-v${app_version}.$3$4`)

    }

}

