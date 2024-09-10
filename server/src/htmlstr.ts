

type str = string; //type int = number; //type bool = boolean;




import fs from "fs";



function runit(static_prefix:str, env:str)  {   

	return new Promise(async (resolve, _reject) => {

		const promises:Promise<string>[] = []

		const x = env === "dev" ? "dev/" : "dist/"

		promises.push(fs.promises.readFile(static_prefix + x + "index.html", 'utf8'))
		
		const r = await Promise.all(promises)
		
		const htmlstr = r[0]

		resolve(htmlstr)	
	}
)}




export default { runit }





