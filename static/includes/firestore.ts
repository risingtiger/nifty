



function Firestore_Get(whats:str[]|str, opts:any = {}) { return new Promise(async (res,rej)=> { 

    let id_token = localStorage.getItem('id_token')
    let refresh_token = localStorage.getItem('refresh_token')
    let token_expires_at = localStorage.getItem('token_expires_at')

    if (!id_token || !refresh_token || !token_expires_at) {
        console.log('No tokens found')
        rej('No tokens found')
        return
    }

    const body = { whats, opts, refresh_token: "" }

    if (Date.now()/1000 > parseInt(token_expires_at)-30) {
        body.refresh_token = refresh_token 
    }

    fetch('/api/firestore_get', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + id_token
        },
        body: JSON.stringify(body)

    }).then(async r=> {
        let data = await r.json()

        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token)
            localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.refresh_token_expires_in) ).toString() )
        }

        res(data.results)

    }).catch(err=> {
        rej(err)
    })
})}




function Firestore_Patch(what:str, mask:any[], data:any) { return new Promise(async (res,rej)=> { 

    let id_token = localStorage.getItem('id_token')
    let refresh_token = localStorage.getItem('refresh_token')
    let token_expires_at = localStorage.getItem('token_expires_at')

    if (!id_token || !refresh_token || !token_expires_at) {
        console.log('No tokens found')
        rej('No tokens found')
        return
    }

    const body = { what, mask, data, refresh_token: "" }

    if (Date.now()/1000 > parseInt(token_expires_at)-30) {
        body.refresh_token = refresh_token 
    }

    fetch('/api/firestore_patch', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + id_token
        },
        body: JSON.stringify(body)

    }).then(async r=> {
        let data = await r.json()

        if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token)
            localStorage.setItem('token_expires_at',  ( (Math.floor(Date.now()/1000)) + Number(data.refresh_token_expires_in) ).toString() )
        }

        if (data.err) {
            rej(data.err)
        } else {
            res(data)
        }

    }).catch(err=> {
        rej(err)
    })
})}




(window as any).Firestore_Get   = Firestore_Get;
(window as any).Firestore_Patch = Firestore_Patch;


