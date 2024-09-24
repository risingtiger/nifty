import '../definitions.js';
var EListenerTypeT;
(function(EListenerTypeT) {
    EListenerTypeT["focus"] = "focus";
    EListenerTypeT["blur"] = "blur";
})(EListenerTypeT || (EListenerTypeT = {}));
const elisteners = [];
function Add_Listener(name, type_, callback_) {
    const type = type_ === 'focus' ? "focus" : "blur";
    const existing_listener = elisteners.find((l)=>l.type === type && l.name === name);
    if (existing_listener) {
        redirect_from_error("engagementlisten_already_exists", "AppFocus Listener with that name and type already exists");
        return;
    }
    elisteners.push({
        name: name,
        type: "focus",
        callback: callback_
    });
}
function Remove_Listener(name, type_) {
    const type = type_ === 'focus' ? "focus" : "blur";
    const i = elisteners.findIndex((l)=>l.name === name && l.type === type);
    if (i === -1) {
        return;
    }
    elisteners.splice(i, 1);
}
function Init() {
    window.onblur = ()=>{
        for (const l of elisteners.filter((l)=>l.type === "blur")){
            l.callback(false);
        }
    };
    window.onfocus = async ()=>{
        for (const l of elisteners.filter((l)=>l.type === "focus")){
            l.callback(false);
        }
    };
}
function IsDocFocused() {
    return document.hasFocus();
}
function redirect_from_error(errmsg, errmsg_long) {
    localStorage.setItem("errmsg", errmsg + " -- " + errmsg_long);
    window.location.href = `/index.html?errmsg=${errmsg}`;
}
window.EngagementListen = {
    Add_Listener,
    Remove_Listener,
    IsDocFocused
};
export default {
    Init,
    IsDocFocused
};
