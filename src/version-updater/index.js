const github = require('octonode');
const { getInstallationAccessToken } = require('./auth');


const getPackageJSONAsObject = async repo => {
    const data = await repo.contentsAsync('package.json', 'master');
    const packageJSONJson = JSON.parse(Buffer.from(data[0].content, 'base64').toString());
    return packageJSONJson;
};

const updatePackageJSONObject = (packageJSONObject, packageName, newPackageVersion) => ({
    ...packageJSONObject,
    dependencies: {
        ...packageJSONObject.dependencies,
        [packageName]: newPackageVersion
    }
})

const createBranch = async (repo, packageName, newPackageVersion) => {
    const commits = await repo.commitsAsync();
    const branchName = `${packageName}-updated-to-${newPackageVersion}`;
    await repo.createReferenceAsync(branchName, commits[0][0].sha);
    return branchName;
};

const commitUpdates = async (repo, content, packageName, newPackageVersion, branch) => {
    const sha = (await repo.contentsAsync('package.json', branch))[0].sha
    await repo.updateContentsAsync('package.json', 
        `Updated ${packageName} to version ${newPackageVersion}`,
        content,
        sha,
        branch
    );
};

const createPR = async (repo, packageName, newPackageVersion, branch, targetBranch='master') => {
    await repo.prAsync({
        'title': `Updated ${packageName} to version ${newPackageVersion}`,
        'body': `Updated ${packageName} to version ${newPackageVersion} by automated package-updater.`,
        'head': branch,
        'base': targetBranch
    });
};

const updateRepo = async (repoLink, packageName, newPackageVersion) => {
    const userName = repoLink.split('/')[0];
    const repoName = repoLink.split('/')[1];
    
    const installationToken = await getInstallationAccessToken(userName, repoName);
    const githubAppClient = github.client(installationToken);
    const repo = githubAppClient.repo(repoLink);
    
    const data = await getPackageJSONAsObject(repo);
    const updatedData = updatePackageJSONObject(data, packageName, newPackageVersion);
    const updateFileContents = JSON.stringify(updatedData, null, 2);

    const branchName = await createBranch(repo, packageName, newPackageVersion);

    await commitUpdates(repo, updateFileContents, packageName, newPackageVersion, branchName);
    await createPR(repo, packageName, newPackageVersion, branchName);
};

module.exports = {
    updateRepo
};