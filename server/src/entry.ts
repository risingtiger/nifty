

type str = string; //type int = number; //type bool = boolean;




import fs from "fs";



const runit = (instance:str, static_prefix:str, env:str) => new Promise(async (resolve, _reject) => {

	if (env === "dev") {

		const promises:Promise<string>[] = []

		promises.push(fs.promises.readFile(static_prefix + "dev/" + "entry/entry.html", 'utf8'))
		promises.push(fs.promises.readFile(static_prefix + "dev/" + "entry/entry.js", 'utf8'))
		promises.push(fs.promises.readFile(static_prefix + "dev/" + "entry/entry.css", 'utf8'))

		promises.push(fs.promises.readFile(static_prefix + "dev/" + "client_" + instance + "/entry/entry.html", 'utf8'))
		promises.push(fs.promises.readFile(static_prefix + "dev/" + "client_" + instance + "/entry/entry.js", 'utf8'))
		promises.push(fs.promises.readFile(static_prefix + "dev/" + "client_" + instance + "/entry/entry.css", 'utf8'))
		
		const r = await Promise.all(promises)
		
		const html = r[0]
		const js = r[1]
		const css = r[2]

		const instance_html = r[3]
		const instance_js = r[4]
		const instance_css = r[5]

		const a = html.replace("{--js--}", js)
		const b = a.replace("{--instance_js--}", instance_js)
		const c = b.replace("{--css--}", css)
		const d = c.replace("{--instance_css--}", instance_css)
		const e = d.replace("{--instance_html--}", instance_html)

		resolve(e)	
	}

	else {

		const htmlstr = await fs.promises.readFile(static_prefix + "dist/" + "entry.html", 'utf8')
		resolve(htmlstr)	
	}
})




export default { runit }





