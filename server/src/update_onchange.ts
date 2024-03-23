

type str = string; //type int = number; //type bool = boolean;




//import fs from "fs";
import { promisify } 		  from 'util';
import { exec as cpexec } from 'child_process';
import Chokidar from "chokidar";

const exec = promisify(cpexec);




function init()  {   return new Promise(async (resolve, _reject) => {

    Chokidar.watch("/Users/dave/Code/nifty/client/**/*", {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
    }).on('change', async path => {
        clientchanged(path)
    })



    Chokidar.watch("/Users/dave/Code/nifty/server/src/**/*", {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
    }).on('change', async path => {
        serverchanged(path)
    })


    resolve(true)
})}




async function clientchanged(path:str) {
    let aux = path.includes("/lazy/") ? "lazy" : "main"
    let cmdstr = `/Users/dave/Code/nifty/buildit/buildit file ${aux} ${path}`
    console.log(cmdstr)
    await exec(cmdstr)
}




async function serverchanged(path:str) {
    let cmdstr = `/Users/dave/Code/nifty/buildit/buildit file server ${path}`
    console.log(cmdstr)
    await exec(cmdstr)
}







export default { init }





