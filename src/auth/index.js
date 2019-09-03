const { App } = require("@octokit/app");
const fetch = require('node-fetch');

const APP_ID = process.env.GITHUB_APP_IDENTIFIER;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const app = new App({ id: APP_ID, privateKey: PRIVATE_KEY });
const jwt = app.getSignedJsonWebToken();

const getInstallationAccessToken = async (owner, repo) => {
    const result = await fetch(`https://api.github.com/repos/${owner}/${repo}/installation`,
        {
            headers: {
                authorization: `Bearer ${jwt}`,
                accept: "application/vnd.github.machine-man-preview+json"
            }
        });
    
    const installationId = (await result.json()).id;

    const installationAccessToken = await app.getInstallationAccessToken({
        installationId
    });

    return installationAccessToken;
};

module.exports = {
    getInstallationAccessToken,
};