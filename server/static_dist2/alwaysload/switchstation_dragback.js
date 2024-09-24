//import { str, bool } from  "../definitions.js" 
const DUMMYEL = document.createElement("div");
var ModeE;
(function(ModeE) {
    ModeE[ModeE["UP"] = 0] = "UP";
    ModeE[ModeE["DOWN"] = 1] = "DOWN";
    ModeE[ModeE["DRAG"] = 2] = "DRAG";
    ModeE[ModeE["TRIGGEREDBACK"] = 3] = "TRIGGEREDBACK";
    ModeE[ModeE["CANCELED"] = 4] = "CANCELED";
})(ModeE || (ModeE = {}));
const X_SNAPSHOT_INTERVAL = 50;
const X_POSITIONS_COUNT = 20;
const s = {
    mode: 0,
    x: 0,
    y: 0,
    touchdown_x: 0,
    touchdown_y: 0,
    active_view: DUMMYEL,
    previous_view: DUMMYEL,
    overlay: DUMMYEL,
    movementstart_x: 0,
    delta_x: 0,
    move_current_el: null,
    move_previous_el: null,
    speed_x: 0,
    interval_time: 0,
    x_positions: [],
    x_positions_index: 0
};
for(let i = 0; i < X_POSITIONS_COUNT; i++){
    s.x_positions.push({
        x: 0,
        time: 0
    });
}
function TouchDown(e) {
    s.x = e.changedTouches[0].clientX;
    s.y = e.changedTouches[0].clientY;
    s.overlay = document.getElementById("switchstation_overlay");
    if (s.mode !== 0 || s.x >= 40 || s.y < 60 || s.overlay.style.display === "block") {
        return;
    }
    e.preventDefault();
    s.touchdown_x = s.x;
    s.touchdown_y = s.y;
    s.active_view = document.querySelector(".view[active]");
    s.previous_view = document.querySelector(".view[previous]");
    if (!s.active_view.hasAttribute("backhash") || !s.previous_view) {
        //console.log("CREATE A DUMMY PREVIOUS VIEW SO DRAGGING WILL WORK EVEN WHEN PREVIOUS ISNT LOADED UP")
        return;
    }
    s.mode = 1;
    s.overlay.style.display = "block";
}
function TouchUp(e) {
    if (s.mode === 2) {
        dragreleased(e);
    } else if (s.mode === 4) {
        s.mode = 0;
        s.overlay.style.display = "none";
    } else {
        s.mode = 0;
        s.overlay.style.display = "none";
    }
}
function TouchCancel(e) {
    if (s.mode === 2) {
        dragreleased(e);
    } else if (s.mode === 4) {
        s.mode = 0;
        s.overlay.style.display = "none";
    } else {
        s.mode = 0;
        s.overlay.style.display = "none";
    }
}
function TouchMove(e) {
    if (s.mode === 1) {
        s.x = e.changedTouches[0].clientX;
        s.y = e.changedTouches[0].clientY;
        if (Math.abs(s.y - s.touchdown_y) > 10) {
            s.mode = 4;
            return;
        } else if (s.x - s.touchdown_x > 20) {
            s.mode = 2;
            s.movementstart_x = s.x;
            s.active_view.classList.add("dragging");
            s.previous_view.classList.add("dragging");
            s.delta_x = s.x - s.movementstart_x;
            window.requestAnimationFrame(animate_frame);
            return;
        }
    } else if (s.mode === 2) {
        s.x = e.changedTouches[0].clientX;
        s.y = e.changedTouches[0].clientY;
        s.delta_x = s.x - s.movementstart_x;
    } else {
    // do nothing
    }
}
function animate_frame(timestamp) {
    if (s.mode === 2) {
        if (timestamp - s.interval_time > X_SNAPSHOT_INTERVAL) {
            s.x_positions[s.x_positions_index] = {
                x: s.x,
                time: timestamp
            };
            s.interval_time = timestamp;
            const compare_to_index = animate_frame___get_compare_to_index(1);
            s.speed_x = (s.x_positions[s.x_positions_index].x - s.x_positions[compare_to_index].x) / (timestamp - s.x_positions[compare_to_index].time);
            if (s.x_positions_index === X_POSITIONS_COUNT) {
                s.x_positions_index = 0;
            } else {
                s.x_positions_index++;
            }
        }
        s.active_view.style.transform = `translate3d(${s.delta_x}px, 0, 0)`;
        s.previous_view.style.transform = `translate3d(${s.delta_x / 3 - 150}px, 0, 0)`;
        window.requestAnimationFrame(animate_frame);
    }
}
function animate_frame___get_compare_to_index(stepsback) {
    return s.x_positions_index - stepsback < 0 ? X_POSITIONS_COUNT + (s.x_positions_index - stepsback) : s.x_positions_index - stepsback;
}
function dragreleased(_e) {
    if (s.speed_x < 0.1) {
        s.active_view.classList.remove("dragging");
        s.previous_view.classList.remove("dragging");
        s.active_view.offsetHeight;
        s.active_view.addEventListener("transitionend", transitionend_cancel);
        s.active_view.style.transform = `translate3d(0px, 0px, 0px)`;
        s.previous_view.style.transform = `translate3d(-150px, 0, 0)`;
        s.mode = 0;
    } else {
        s.mode = 3;
        s.active_view.classList.remove("dragging");
        s.previous_view.classList.remove("dragging");
        s.active_view.classList.add("released");
        s.previous_view.classList.add("released");
        s.active_view.offsetHeight;
        s.active_view.style.transform = `translate3d(calc(100% + 30px), 0, 0)`;
        s.previous_view.style.transform = `translate3d(0, 0, 0)`;
        s.active_view.addEventListener("transitionend", transitionend_back);
    }
    function transitionend_cancel() {
        s.mode = 0;
        s.overlay.style.display = "none";
        s.active_view.removeEventListener("transitionend", transitionend_cancel);
    }
    function transitionend_back() {
        s.mode = 0;
        // will get set to block from main switchstation but needed as a state reference
        s.overlay.style.display = "none";
        s.active_view.setAttribute("draggedback", "");
        s.previous_view.classList.remove("released");
        const backhash = s.active_view.getAttribute("backhash");
        window.location.hash = backhash;
        s.active_view.removeEventListener("transitionend", transitionend_back);
    }
}
export default {
    TouchDown,
    TouchUp,
    TouchCancel,
    TouchMove
};
