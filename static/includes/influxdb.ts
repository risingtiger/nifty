

function Retrieve_Series(bucket:str, begins:int[], ends:int[], msrs:str[], fields:str[], tags:str[], intrv:int[], priors:str[]) {   
    return new Promise<any>(async (res, _rej)=> { 
        const body = { bucket, begins, ends, msrs, fields, tags, intrv, priors } 
        const parsed_data = await influx_fetch_paths("retrieve", body)

        for (let i=0; i<parsed_data.length; i++) {
            for (let ii=0; ii<parsed_data[i].length; ii++) {
                for (let iii=0; iii<parsed_data[i][ii].points.length; iii++) {
                    parsed_data[i][ii].points[iii].date = new Date(parsed_data[i][ii].points[iii].date)
                }
            }
        }
        res(parsed_data) 
    })
}




function Retrieve_Points(bucket:str, begins:int[], ends:int[], msrs:str[], fields:str[], tags:str[]) {   
    return new Promise<any>(async (res, _rej)=> { 
        const body = { bucket, begins, ends, msrs, fields, tags} 
        const parsed_data = await influx_fetch_paths("retrieve_points", body)

        for (let i=0; i<parsed_data.length; i++) {
            parsed_data[i].date = new Date(parsed_data[i].date)
            parsed_data[i].val = parsed_data[i].val === "true" ? true : false
        }

        res(parsed_data) 
    })
}




function Retrieve_Medians(bucket:str, begins:int[], ends:int[], dur_amounts:int[], dur_units:str[], msrs:str[], fields:str[], tags:str[], aggregate_fn:str[]) {   
    return new Promise<any>(async (res, _rej)=> { 
        const body = { bucket, begins, ends, dur_amounts, dur_units, msrs, fields, tags, aggregate_fn}
        const parsed_data = await influx_fetch_paths("retrieve_medians", body)
        res(parsed_data) 
    })
}




function influx_fetch_paths(path:str, body:any) {   return new Promise<any>(async (res)=> {

    const opts = {   method: "POST",  body: JSON.stringify(body)   }
    const data = await FetchLassie('/api/influxdb_'+path, opts)
    res(data)
})}




(window as any).InfluxDB = { Retrieve_Series, Retrieve_Points, Retrieve_Medians }


