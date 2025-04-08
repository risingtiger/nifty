

import { $NT, LoggerTypeE, LoggerSubjectE } from "../defs.js"


declare var $N: $NT;


enum DeviceTypeE {
	desktop = "dsk",
	mobile = "mbl",
	tablet = "tbl"
}


enum BrowserE {
	chrome = "chr",
	firefox = "frx",
	safari = "saf",
	other = "otr"
}




function Log(type:LoggerTypeE, subject:LoggerSubjectE, message:string) {

	if ( window.location.hostname === "localhost" )
		return


	const logs = localStorage.getItem("logs") || ""
	const ts = Math.floor(Date.now() / 1000)

	const newlog = `${type},${subject},${message},${ts}-`

	localStorage.setItem("logs", logs + newlog)
}




async function Save() {

	if ( window.location.hostname === "localhost" )
		return


	let logs = localStorage.getItem("logs")
	let user_email = localStorage.getItem("user_email")

	if (!user_email || !logs) 
		return


	let device = get_device()
	let browser = get_browser()

	if (logs.length > 10) {

		logs = logs.slice(0, -1)

		const url = "/api/logger/save"

		const fetchopts = {   
			method: "POST",
			headers: { 
				"Content-Type": "application/json",
			},
			body: JSON.stringify({user_email, device, browser, logs}),
		}

		const fr = await fetch(url, (fetchopts as any))

		if (fr.ok) {
			localStorage.setItem("logs", "")
		}
		// if not ok then just leave the logs in localstorage to be sent next time
	}
}




async function Get() {

	let user_email = localStorage.getItem("user_email")

	if (!user_email) 
		return


	let is_localhost = window.location.hostname === "localhost"

	const url = "/api/logger/get?user_email=" + user_email + "&is_localhost=" + is_localhost

    const csvstr = await $N.FetchLassie(url, { headers: { 'Content-Type': 'text/csv', 'Accept': 'text/csv' } }, {  } )

	$N.Utils.CSV_Download(csvstr, "logs")
}




async function logger_ticktock() {
	setTimeout(()=> {
		Save()
		logger_ticktock()
	}, 1000 * 60 * 20)
}




function get_device() {

	const ua = navigator.userAgent;

	const isTablet = /iPad|Tablet|PlayBook|Nexus 7|Nexus 10|KFAPWI/i.test(ua) ||
		   (/(Android)/i.test(ua) && !/Mobile/i.test(ua));

	const isMobile = /Mobi|Mobile|iPhone|iPod|BlackBerry|Windows Phone|Opera Mini/i.test(ua);

	if (isTablet) {
		return DeviceTypeE.tablet
	} else if (isMobile) {
		return DeviceTypeE.mobile
	} else {
		return DeviceTypeE.desktop
	}
}




function get_browser() {

  const ua = navigator.userAgent;
  let browser = BrowserE.other;

  if (/Firefox\/\d+/.test(ua)) {
    browser = BrowserE.firefox;
  } else if (/Edg\/\d+/.test(ua)) {
    browser = BrowserE.chrome;
  } else if (/Chrome\/\d+/.test(ua) && !/Edg\/\d+/.test(ua) && !/OPR\/\d+/.test(ua)) {
    browser = BrowserE.chrome;
  } else if (/Safari\/\d+/.test(ua) && !/Chrome\/\d+/.test(ua) && !/OPR\/\d+/.test(ua) && !/Edg\/\d+/.test(ua)) {
    browser = BrowserE.safari;
  } else if (/OPR\/\d+/.test(ua)) {
    browser = BrowserE.chrome;
  }

  return browser;
}


logger_ticktock()




if (!(window as any).$N) {   (window as any).$N = {};   }
((window as any).$N as any).Logger = { Log, Save, Get };
