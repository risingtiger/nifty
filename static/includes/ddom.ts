



type ElAnimationT = {
  elref:HTMLElement,
  animation: Animation
}

type AnimationSpecT = {
  name:str,
  cssprops: Array<any>,
  props: any,
}


const _elAnimations:ElAnimationT[] = []

const _animationSpecs:AnimationSpecT[] = [
  {
    name: "fadein",
    cssprops: [
      {opacity: '0'},
      {opacity: '1'}
    ],
    props: {
      duration: 2380,
      easing: "cubic-bezier(.71,0,0,1)",
      fill: "both",
      iterations: 1
    }
  },
  {
    name: "shrinkin",
    cssprops: [
      {opacity: '0', transform: `translate3D(0, 70px, 0) scale(1.15)`},
      {opacity: '1', transform: "translate3D(0, 0, 0) scale(1)"}
    ],
    props: {
      duration: 2380,
      easing: "cubic-bezier(.71,0,0,1)",
      fill: "both",
      iterations: 1
    }
  }
] as any




function DDomObserve(viewEl:HTMLElement) {

  const observer = new MutationObserver((mlist=> {

    mlist.forEach(mutation => {

      if (mutation.type === "attributes" && mutation.attributeName === "ddomgo") {
        const el = (mutation.target as HTMLElement)

        if (el.getAttribute("ddomgo") === "true")
          activate(el)

        else if (el.getAttribute("ddomgo") === "false")
          deactivate(el)
      }

    })

  }))

  observer.observe(viewEl, {
    attributeFilter: [ "ddomgo" ],
    attributeOldValue: true,
    subtree: true
  }) 
}




async function activate(el:HTMLElement) {

  document.getElementById("loadviewoverlay")!.classList.add("active")

  let isLoaded = false
  setTimeout(()=> {   
    if (!isLoaded && !window.location.href.includes("localhost")) {   
      window.location.href = `/?errmsg=${encodeURIComponent('Unable to Load DDom')}`; 
    }   
  }, 5000)

  const sy = el.tagName.toLowerCase().substring(0,2)
  if (sy === "c-") {
    await LazyLoad([{what:"components", name:el.tagName.toLowerCase().substring(2).replace("-", "_")}])
    await (el as any).Activate()
  }

  isLoaded = true
  animateshow()


  function animateshow() {
    let wrapper:HTMLElement|null = el.querySelector(":scope > c-overlay") || null
    let animation = el.getAttribute("animation") || "fadein"

    if (wrapper) {
      el.style.display = "block"
      wrapper.addEventListener("requested_close", handleRequestedCloseEvent)
      wrapper.addEventListener("opened", handleWrapperOpenedEvent)
      setTimeout(()=> wrapper!.setAttribute("show", "true"), 10)
    }
    else  {
      animateIn(el, animation)
    }
  }

}




function handleRequestedCloseEvent(ev:any) {

  ev.currentTarget.parentElement.dispatchEvent(new Event('requested_close'));

}




function handleWrapperOpenedEvent(_ev:any) {

  document.getElementById("loadviewoverlay")!.classList.remove("active")

}




function animateIn(el:HTMLElement, animation:str) {

  attachAnimationIfNotAlready(el, animation)

  el.style.visibility = "hidden"
  el.style.display = "block"

  setTimeout(()=> {
    el.style.visibility = "visible"
    const elanimation = _elAnimations.find(ea=>ea.elref===el)!
    elanimation.animation.playbackRate = 1
    elanimation.animation.currentTime = 0
    elanimation.animation.play()
  }, 10)

} 




function deactivate(el:HTMLElement) {

  document.getElementById("loadviewoverlay")!.classList.add("active")

  let wrapper:HTMLElement|null = el.querySelector(":scope > c-overlay") || null
  let animation = el.getAttribute("animation") || "fadein"

  if (wrapper) {
    wrapper.setAttribute("show", "false")
    wrapper.addEventListener("closed", handleWrapperClosedEvent)
  }
  else  {
    animateOut(el, animation)
  }

} 




function handleWrapperClosedEvent(ev:any) {

  document.getElementById("loadviewoverlay")!.classList.remove("active")
  ev.currentTarget.parentElement.style.display = "none"

}




function animateOut(el:HTMLElement, animation:str) {

  attachAnimationIfNotAlready(el, animation)

  const elanimation = _elAnimations.find(ea=>ea.elref===el)!

  elanimation.animation.reverse()

} 




function attachAnimationIfNotAlready(el:HTMLElement, animation:str) {

  const elanimation = _elAnimations.find(ea=> ea.elref === el)

  if (elanimation) {
    return true
  }
  else {
    const animationspec = _animationSpecs.find(a=> a.name === animation)!
    const anim = el.animate(animationspec.cssprops, animationspec.props)
    anim.pause()
    _elAnimations.push({elref: el, animation: anim})

    anim.addEventListener("finish", handleAnimationFinish)
  }

}




function handleAnimationFinish(ev:any) {

  document.getElementById("loadviewoverlay")!.classList.remove("active")

  const elanimation = _elAnimations.find(ea=> ea.animation === ev.currentTarget)!

  if (elanimation.elref.getAttribute("ddomgo") === "false") {
    elanimation.elref.style.display = "none" 
  }

}






















(window as any).DDomObserve = DDomObserve;

