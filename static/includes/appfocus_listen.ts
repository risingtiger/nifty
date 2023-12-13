

type AppFocus_ListenerT = {
    name: str,
    callback:(isfocused:bool)=>void
}

const appfocus_listeners:AppFocus_ListenerT[] = []




function AppFocus_Add_Listener(name:str, callback_:(isfocused:bool)=>void) {

    const is_already_listener = appfocus_listeners.find(l=> l.name === name) ? true : false

    if (is_already_listener) {
        redirect_from_error("AppFocus Listener with that name already exists")
        return
    }

    appfocus_listeners.push({
        name: name,
        callback: callback_
    })
}




function AppFocus_Remove_Listener(name:str) {   appfocus_listeners.splice(appfocus_listeners.findIndex(l=> l.name === name), 1)   }




function AppFocus_Init() {
    
    window.onblur = () => {
        for(const l of appfocus_listeners) {
            l.callback(false)
        }
    }

    window.onfocus = async () => {

        for(const l of appfocus_listeners) {
            l.callback(true)
        }
    }
}




export { AppFocus_Init, AppFocus_Add_Listener, AppFocus_Remove_Listener }


