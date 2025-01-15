

import { } from "../defs.js"




function CSV_Download(csvstr:string, filename:string) {

    const blob = new Blob([csvstr], { type: 'text/csv' }); 
  
    const url = window.URL.createObjectURL(blob) 
  
    const a = document.createElement('a') 
  
    a.setAttribute('href', url) 
  
    a.setAttribute('download', `${filename}.csv`); 
  
    a.click()
}




if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).Utils = { CSV_Download };
