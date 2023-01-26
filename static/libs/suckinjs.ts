

const suckedInJs:Array<str> = [];




const SuckInJs = (filesArray:str[]) => { 

  return new Promise((res, rej)=> {

    let incr = 0
    const allToSuckIn = filesArray

    for(let i = 0; i < filesArray.length; i++) {
      const di = (window as any).__APPINSTANCE_DEPENDENCIES.find((d:any)=> d.module === filesArray[i])
      const dm = (window as any).__DEPENDENCIES.find((d:any)=> d.module === filesArray[i])

      if (di)
        allToSuckIn.push(...di.dependencies)

      if (dm)
        allToSuckIn.push(...dm.dependencies)
    }

    for(let i = 0; i < allToSuckIn.length; i++) {
      const f = allToSuckIn[i]

      if (suckedInJs.includes(f)) {
        res(1);
      } 

      else {
        import(`./${f}.js`)

          .then(async _module => {

            suckedInJs.push(f);
            document.head.insertAdjacentHTML("beforeend", `<style>${(window as any)['__MRP__CSSSTR_'+f]}</style>`);

            incr++

            if (incr === allToSuckIn.length)
              res(1)
            
          })

          .catch(()=> {
            rej(1)
          })	

      }
    }

  })

}




(window as any).SuckInJs = SuckInJs;








