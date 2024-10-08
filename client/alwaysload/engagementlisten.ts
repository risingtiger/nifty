

import '../definitions.js'

enum EListenerTypeT {
    focus = "focus",
    blur = "blur"
}

type EListenerT = {
    name: string,
    type: EListenerTypeT,
    callback:(isfocused:boolean)=>void
}

const elisteners:EListenerT[] = []




function Add_Listener(name:string, type_:'focus'|'blur', callback_:()=>void) {

    const type = type_ === 'focus' ? EListenerTypeT.focus : EListenerTypeT.blur

    const existing_listener = elisteners.find(l=> l.type === type && l.name === name)

    if (existing_listener) {
        redirect_from_error("AppFocus Listener with that name and type already exists")
        return
    }

    elisteners.push({
        name: name,
        type: EListenerTypeT.focus,
        callback: callback_
    })
}




function Remove_Listener(name:string, type_:'focus'|'blur') {   

    const type = type_ === 'focus' ? EListenerTypeT.focus : EListenerTypeT.blur
    const i = elisteners.findIndex(l=> l.name === name && l.type === type)

    if (i === -1) {
        redirect_from_error("AppFocus Listener with that name and type does not exist")
        return
    }

    elisteners.splice(i, 1)   
}




function Init() {

    window.onblur = () => {
        for(const l of elisteners.filter(l=> l.type === EListenerTypeT.blur)) {
            l.callback(false)
        }
    }

    window.onfocus = async () => {
        for(const l of elisteners.filter(l=> l.type === EListenerTypeT.focus)) {
            l.callback(false)
        }
    }
}




function IsDocFocused() {
    return document.hasFocus()
}




function redirect_from_error(errmsg:string) {
    console.info(`/?errmsg=SSE Error: ${errmsg}`)
    if ((window as any).APPVERSION > 0) {
        window.location.href = `/?errmsg=SSE Error: ${errmsg}`
    }
}




(window as any).EngagementListen = { Add_Listener, Remove_Listener, IsDocFocused }

export default { Init, IsDocFocused }


