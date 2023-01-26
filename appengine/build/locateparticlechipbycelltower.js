//type int  = number;
import { GetSecretsKey } from "./components/utils.js";
import fetch from "node-fetch";
const LocateParticleChipByCellTower = (_db, particleAccount, particleId, secretsClient) => {
    return new Promise(async (res, _rej) => {
        let token = await GetSecretsKey(secretsClient, "pa_" + particleAccount);
        const diagnosticsP = await fetch(`https://api.particle.io/v1/diagnostics/${particleId}/last?access_token=${token}`, { headers: { 'Content-Type': 'application/json' } });
        const diagnostics = await diagnosticsP.json();
        const cellular = diagnostics?.diagnostics?.payload?.device?.network?.cellular;
        const cellGlobalIdentity = diagnostics?.diagnostics?.payload?.device?.network?.cellular?.cell_global_identity;
        if (cellular && cellGlobalIdentity) {
            let googleapiObjToSend = {
                homeMobileCountryCode: cellGlobalIdentity.mobile_country_code,
                homeMobileNetworkCode: cellGlobalIdentity.mobile_network_code,
                radioType: "gsm",
                carrier: cellular.operator.includes("AT&T") ? "AT&T" : "Not handled yet -- probably need to come back for Verizon",
                considerIp: false,
                cellTowers: [
                    {
                        "cellId": cellGlobalIdentity.cell_id,
                        "locationAreaCode": cellGlobalIdentity.location_area_code,
                        "mobileCountryCode": cellGlobalIdentity.mobile_country_code,
                        "mobileNetworkCode": cellGlobalIdentity.mobile_network_code
                    }
                ]
            };
            const googlAPIResponseP = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyCdBd4FDBCZbL03_M4k2mLPaIdkUo32giI`, { method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(googleapiObjToSend) });
            const googlAPIResponse = await googlAPIResponseP.json();
            if (googlAPIResponse && googlAPIResponse.location) {
                const gps = [Number(googlAPIResponse.location.lat.toFixed(4)), Number(googlAPIResponse.location.lng.toFixed(4))];
                res(gps);
            }
        }
    });
};
export { LocateParticleChipByCellTower };
//# sourceMappingURL=locateparticlechipbycelltower.js.map