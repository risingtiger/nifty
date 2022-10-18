

type str = string;   




const suckedInJs:Array<str> = [];




const SuckInJs = (filesstr:str) => { return new Promise((res, rej)=> {

  if (suckedInJs.includes(filesstr)) {
    res(1);

  } else {

    import(`./${filesstr}.js`)

      .then(_module => {

        suckedInJs.push(filesstr);
        document.head.insertAdjacentHTML("beforeend", `<style>${(window as any)['__MRP__CSSSTR_'+filesstr]}</style>`);
        res(1);})

      .catch(()=> rej());	
  }

})}



(window as any).SuckInJs = SuckInJs;








