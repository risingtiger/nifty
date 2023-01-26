function GetSecretsKey(secretsClient, nameP) {
    return new Promise(async (resp) => {
        let n = `projects/purewatertech/secrets/${nameP}/versions/latest`;
        const [accessResponse] = await secretsClient.accessSecretVersion({ name: n });
        resp(accessResponse.payload.data.toString('utf8'));
    });
}
;
export { GetSecretsKey };
//# sourceMappingURL=utils.js.map