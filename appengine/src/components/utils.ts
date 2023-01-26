

function GetSecretsKey(secretsClient:any, nameP:string) { return new Promise(async (resp:any) => { 
  let n = `projects/purewatertech/secrets/${nameP}/versions/latest`;
  const [accessResponse] = await secretsClient.accessSecretVersion({ name:n });
  resp(accessResponse.payload.data.toString('utf8'));
})};




export { GetSecretsKey };




