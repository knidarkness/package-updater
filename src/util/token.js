const fs = require('fs');
const fetch = require('node-fetch');

const getPersonalAccessToken = (tokenFile='config/token.json') => JSON.parse(fs.readFileSync(tokenFile).toString())['PAM'];

const validatePersonalAccessToken = async () => {
    const token = getPersonalAccessToken();
    const result = await fetch('https://api.github.com/user', {headers: {'Authorization': `Bearer ${token}`}});
    return result.status === 200;
};

module.exports = {
    getPersonalAccessToken,
    validatePersonalAccessToken
};