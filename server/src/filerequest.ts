

type str = string; //type int = number; //type bool = boolean;




import fs from "fs";
//import { promisify } 		  from 'util';
//import { exec as cpexec } from 'child_process';
import * as path_util from "path";


//const exec = promisify(cpexec);



function runit(fileurl:str, res:any, env:str, static_prefix:str)  {   return new Promise(async (resolve, _reject) => {

	res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')


    let path = fileurl.replace("/assets/", "");

    let absolute_prefix = process.cwd() + "/" + static_prefix + (env === "dev" ? "dev/" : "dist/");

    let extension = path_util.extname(path);
    extension = extension === "" ? ".html" : extension;

    if (extension === "" || extension === ".html") {
        extension = ".html"
    }

    switch (extension) {

        case ".html" : // will only ever be index.html

            res.set('Content-Type', 'text/html; charset=UTF-8');
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')

            path = absolute_prefix + "index.html"

            /*
            if (env === "dist") {
                path = path + ".br"
                res.set('Content-Encoding', 'br');
            }
            */

            res.sendFile(path)
            break;

        case ".js":
            js(absolute_prefix, path, extension, env, res)
            break;

        case ".css": 
            css(absolute_prefix, path, extension, env, res)
            break;

        case ".png":
            res.set('Content-Type', 'image/png');
            res.sendFile(absolute_prefix + path)
            break;

        case ".jpg":
            res.set('Content-Type', 'image/jpeg');
            res.sendFile(absolute_prefix + path)
            break;

        case ".svg":
            res.set('Content-Type', 'image/svg+xml');
            res.sendFile(absolute_prefix + path)
            break;

        case ".gif":
            res.set('Content-Type', 'image/gif');
            res.sendFile(absolute_prefix + path)
            break;

        case ".ico":
            res.set('Content-Type', 'image/x-icon');
            res.sendFile(absolute_prefix + path)
            break;

        case ".woff2":
            res.set('Content-Type', 'font/woff2');
            res.sendFile(absolute_prefix + path)
            break;

        case ".webmanifest":
            res.set('Content-Type', 'application/manifest; charset=UTF-8');
            res.sendFile(absolute_prefix + path)
            break;
    }

    resolve(true)
})}




async function js(absolute_path:str, jspath:str, jsextension:str, env:str, res:any) {

    const path_without_extension = jspath.substring(0, jspath.length - jsextension.length)

    res.set('Content-Type', 'application/javascript; charset=UTF-8');

    if (env === "dev") {

        if (jspath.includes("lazy/") && (jspath.includes("views/") || jspath.includes("components/")) ) {

            const htmlpromise = fs.promises.readFile(absolute_path + path_without_extension + ".html", 'utf8')
            const jspromise = fs.promises.readFile(absolute_path + path_without_extension + ".js", 'utf8')

            const linkcsspath = "/assets/" + path_without_extension + ".css"

            let [htmlstr, jsstr] = await Promise.all([htmlpromise, jspromise])

			const css_replace = jspath.includes("views/") ? `<link rel="stylesheet" href="/assets/main.css"><link rel="stylesheet" href="${linkcsspath}">` : `<link rel="stylesheet" href="${linkcsspath}">`

            jsstr = jsstr.replace("{--html--}", `${htmlstr}`)
            //jsstr = jsstr.replace("{--devservercss--}", `<link rel="stylesheet" href="${linkmaincsspath}"><link rel="stylesheet" href="${linkcsspath}">`)
            jsstr = jsstr.replace("{--css--}", css_replace)

            res.send(jsstr)

        } else {
            res.sendFile(absolute_path + jspath);
        }

    } else if (env === 'dist' || env === 'gcloud') {   

        let is_br_file = await fs.promises.access(absolute_path + path_without_extension + `.min${jsextension}.br`).then(()=> true).catch(()=> false)

        if (is_br_file) {
            jspath = path_without_extension + `.min${jsextension}.br`
            res.set('Content-Encoding', 'br');

        } else {
            jspath = path_without_extension + `.min${jsextension}`
        }

        res.sendFile(absolute_path + jspath);
    }
}




async function css(absolute_path:str, csspath:str, cssextension:str, env:str, res:any) {

	res.set('Content-Type', 'text/css; charset=UTF-8');

	if (env === "dev") {
		csspath = absolute_path + csspath
		res.sendFile(csspath)
	}

	else if(env === "dist" || env === "gcloud") { 

		const path_without_extension = csspath.substring(0, csspath.length - cssextension.length)

        let is_br_file = await fs.promises.access(absolute_path + path_without_extension + `.min${cssextension}.br`).then(()=> true).catch(()=> false)

		if (is_br_file) {
			csspath = absolute_path + path_without_extension + `.min${cssextension}.br`
			res.set('Content-Encoding', 'br');
		} else {
			csspath = absolute_path + path_without_extension + `.min${cssextension}`
		}

		res.sendFile(csspath);
	}
}







/*
async function lazy_embed_html_and_css_into_js(jspath:str, res:any, env:str, static_prefix:str) {   return new Promise<str>(async (promise_res, _reject) => {

    const promises:any[] = []
    
    const js_path = jspath
    const html_path = jspath.substring(0, jspath.length - 3) + ".html"
    const css_path = jspath.substring(0, jspath.length - 3) + ".css"

    //const abs_css_path_to_server = "/assets" + css_path.split(`${static_prefix}${env}`)[1]

    promises.push(fs.promises.readFile(js_path, 'utf8'))
    promises.push(fs.promises.readFile(html_path, 'utf8'))
    promises.push(fs.promises.readFile(css_path, 'utf8'))

    const strs = await Promise.all(promises)

    let js_str = strs[0]
    let html_str = strs[1]
    let css_str = strs[2]

    //js_str = js_str.replace("{--htmlcss--}", `<link rel='stylesheet' href='${abs_css_path_to_server}'>${html_str}`)
    js_str = js_str.replace("{--html--}", `${html_str}`)
    js_str = js_str.replace("{--css--}", `${css_str}`)

    //js_str = `` + js_str

    //js_str = js_str + "\n\n\n\n\n" + `document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<link rel='stylesheet' href='${abs_css_path_to_server}'>")`
    //js_str = js_str + "\n\n\n\n\n" + `<link rel='stylesheet' href='${abs_css_path_to_server}'>`

    res.send(js_str)

    promise_res("done")
})}
*/




/*
async function convert_path_to_br_or_just_min(path:str, extension:str, res:any) {   return new Promise<str>(async (resolve, _reject) => {

    let url = ""

    const path_without_extension = path.substring(0, path.length - extension.length)

    let is_br_file = await fs.promises.access(path_without_extension + `.min${extension}.br`).then(()=> true).catch(()=> false)

    if (is_br_file) {
        url = path_without_extension + `.min${extension}.br`
        res.set('Content-Encoding', 'br');

    } else {
        url = path_without_extension + `.min${extension}`
    }

    resolve( url )
})}
*/




export default { runit }





