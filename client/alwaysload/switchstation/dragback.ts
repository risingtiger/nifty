

//import { str, bool } from  "../definitions.js" 




const DUMMYEL = document.createElement("div")

enum ModeE { UP, DOWN, DRAG, TRIGGEREDBACK, CANCELED }

type StateT = {
    mode: ModeE
    x: number
    y: number
    touchdown_x: number
    touchdown_y: number
    active_view: HTMLElement
    previous_view: HTMLElement
    overlay: HTMLElement
    movementstart_x: number
    delta_x: number
    move_current_el: HTMLElement|null
    move_previous_el: HTMLElement|null
    speed_x: number
    interval_time: number
    x_positions: Array<{x:number,time:number}>
    x_positions_index: number
}

const X_SNAPSHOT_INTERVAL = 50
const X_POSITIONS_COUNT = 20

const s:StateT = {
    mode: ModeE.UP,
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
}

for (let i = 0; i < X_POSITIONS_COUNT; i++) {
    s.x_positions.push({x:0,time:0})
}




function TouchDown(e:TouchEvent) {

    s.x = e.changedTouches[0].clientX; 
    s.y = e.changedTouches[0].clientY;

    s.overlay = document.getElementById("switchstation_overlay") as HTMLElement

    if (s.mode !== ModeE.UP || s.x >=40 || s.y < 60 || s.overlay.style.display === "block") {
        return;
    }

    e.preventDefault()

    s.touchdown_x = s.x;
    s.touchdown_y = s.y;

    s.active_view = document.querySelector(".view[active]") as HTMLElement
    s.previous_view = document.querySelector(".view[previous]") as HTMLElement

    if (!s.active_view.hasAttribute("backhash") || !s.previous_view) {
        //console.log("CREATE A DUMMY PREVIOUS VIEW SO DRAGGING WILL WORK EVEN WHEN PREVIOUS ISNT LOADED UP")
        return;
    }

    s.mode = ModeE.DOWN
    s.overlay.style.display = "block"
}




function TouchUp(e:TouchEvent) {

    if (s.mode === ModeE.DRAG) {
        dragreleased(e)

    } else if (s.mode === ModeE.CANCELED) {
        s.mode = ModeE.UP
        s.overlay.style.display = "none"

    } else {
        s.mode = ModeE.UP
        s.overlay.style.display = "none"
    }
}




function TouchCancel(e:TouchEvent) {

    if (s.mode === ModeE.DRAG) {
        dragreleased(e)

    } else if (s.mode === ModeE.CANCELED) {
        s.mode = ModeE.UP
        s.overlay.style.display = "none"

    } else {
        s.mode = ModeE.UP
        s.overlay.style.display = "none"
    }
}




function TouchMove(e:TouchEvent) {

    if (s.mode === ModeE.DOWN) {

        s.x = e.changedTouches[0].clientX;
        s.y = e.changedTouches[0].clientY;

        if (Math.abs(s.y - s.touchdown_y) > 10) {
            s.mode = ModeE.CANCELED
            return;
        } 

        else if (   s.x - s.touchdown_x > 20) {

            s.mode = ModeE.DRAG
            s.movementstart_x = s.x

            s.active_view.classList.add("dragging")
            s.previous_view.classList.add("dragging")

            s.delta_x = s.x - s.movementstart_x;

            window.requestAnimationFrame(animate_frame)

            return
        }
    }

    else if (s.mode === ModeE.DRAG) {
        s.x = e.changedTouches[0].clientX;
        s.y = e.changedTouches[0].clientY;

        s.delta_x = s.x - s.movementstart_x;
    }

    else {
        // do nothing
    }
}




function animate_frame(timestamp:number) {

    if (s.mode === ModeE.DRAG) {

        if (timestamp - s.interval_time > X_SNAPSHOT_INTERVAL) {

            s.x_positions[s.x_positions_index] = {x:s.x, time:timestamp}            
            s.interval_time = timestamp

            const compare_to_index = animate_frame___get_compare_to_index(1)

            s.speed_x = (s.x_positions[s.x_positions_index].x - s.x_positions[compare_to_index].x) / (timestamp - s.x_positions[compare_to_index].time)

            if (s.x_positions_index === X_POSITIONS_COUNT) {
                s.x_positions_index = 0
            } else { 
                s.x_positions_index++
            }
        }

        s.active_view!.style.transform = `translate3d(${s.delta_x}px, 0, 0)`
        s.previous_view!.style.transform = `translate3d(${ (s.delta_x / 3) - 150}px, 0, 0)`

        window.requestAnimationFrame(animate_frame)
    } 
}

function animate_frame___get_compare_to_index(stepsback:number) {
    return s.x_positions_index - stepsback < 0 ? X_POSITIONS_COUNT + (s.x_positions_index - stepsback) : s.x_positions_index - stepsback
}




function dragreleased(_e:Event) {

    if (s.speed_x < 0.1) {

        s.active_view.classList.remove("dragging")
        s.previous_view.classList.remove("dragging")

        s.active_view.offsetHeight

        s.active_view.addEventListener("transitionend", transitionend_cancel)

		/*
		s.active_view.style.transitionDuration = `${duration}s`
		s.active_view.style.transitionTimingFunction = `cubic-bezier(${cubic_bezier})`
		*/

        s.active_view.style.transform = `translate3d(0px, 0px, 0px)`
        s.previous_view.style.transform = `translate3d(-150px, 0, 0)`

        s.mode = ModeE.UP
    } 

    else {

        s.mode = ModeE.TRIGGEREDBACK

        s.active_view.classList.remove("dragging")
        s.previous_view.classList.remove("dragging")

        s.active_view.classList.add("released")
        s.previous_view.classList.add("released")

        s.active_view.offsetHeight

        s.active_view.style.transform = `translate3d(calc(100% + 30px), 0, 0)`
        s.previous_view.style.transform = `translate3d(0, 0, 0)`

        s.active_view.addEventListener("transitionend", transitionend_back)

		/*
		const cubic_beziers = [
			"0.76, 0, 0.37, 1",
			"0.47, 0, 0.37, 1",
			"0.09, 0.19, 0.37, 1",
			"0.04, 0.51, 0.37, 1",
			"0.01, 0.78, 0.37, 1"
		]
		const durations = [
			0.9, 0.7, 0.5, 0.4, 0.3
		]

		let cubic_bezier = cubic_beziers[0]
		let duration = durations[0]

		if (s.x < window.innerWidth / 4) {
			console.log("less than 1/4")
			duration = durations[0]
		} else if (s.x < window.innerWidth / 3) {
			console.log("less than 1/3")
			duration = durations[1]
		} else if (s.x < window.innerWidth / 2) {
			console.log("less than 1/2")
			duration = durations[2]
		} else if (s.x < window.innerWidth / 1.5) {
			console.log("less than 1.5")
			duration = durations[3]
		} else {
			console.log("greater than 1.5")
			duration = durations[4]
		}

		if (s.speed_x < 0.5) {
			cubic_bezier = cubic_beziers[0]
			console.log("0.5")
		} else if (s.speed_x < 0.8) {
			console.log("0.8")
			cubic_bezier = cubic_beziers[1]
		} else if (s.speed_x < 1.2) {
			console.log("1.2")
			cubic_bezier = cubic_beziers[2]
		} else if (s.speed_x < 1.8) {
			console.log("1.8")
			cubic_bezier = cubic_beziers[3]
		} else {
			console.log("greater 1.8")
			cubic_bezier = cubic_beziers[4]
		}
		*/
    }


    function transitionend_cancel() {
        s.mode = ModeE.UP
        s.overlay.style.display = "none"
        s.active_view.removeEventListener("transitionend", transitionend_cancel)
    }

    function transitionend_back() {
        s.mode = ModeE.UP;

        // will get set to block from main switchstation but needed as a state reference
        s.overlay.style.display = "none"

        s.active_view.setAttribute("draggedback", "")

        s.previous_view.classList.remove("released")

        const backhash = s.active_view.getAttribute("backhash") as string

        window.location.hash = backhash;

        s.active_view.removeEventListener("transitionend", transitionend_back)
    }
}



export default { TouchDown, TouchUp, TouchCancel, TouchMove } 

