const github = require('octonode');
const { getInstallationAccessToken } = require('./../auth');


const getPackageJSON = async repo => {
    const data = await repo.contentsAsync('package.json', 'master');
    const packageJSONJson = JSON.parse(Buffer.from(data[0].content, 'base64').toString());
    return packageJSONJson;
};

const updateVersion = (packageJSONObject, packageName, newPackageVersion) => ({
    ...packageJSONObject,
    dependencies: {
        ...packageJSONObject.dependencies,
        [packageName]: newPackageVersion
    }
})

const getPackageJSONString = packageJSONObject => JSON.stringify(packageJSONObject, null, 2);

const createBranch = async (repo, packageName, newPackageVersion) => {
    const commits = await repo.commitsAsync();
    const branchName = `${packageName}-updated-to-${newPackageVersion}`;
    await repo.createReferenceAsync(branchName, commits[0][0].sha);
    return branchName;
};

const commitUpdates = async (repo, content, packageName, newPackageVersion, branch) => {
    const sha = (await repo.contentsAsync('package.json', branch))[0].sha
    await repo.updateContentsAsync('package.json', `Updated ${packageName} to version ${newPackageVersion}`, content, sha, branch);
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
    const installationToken = await getInstallationAccessToken('knidarkness', 'test-repo');
    const githubAppClient = github.client(installationToken);
    const repo = githubAppClient.repo(repoLink);
    
    const data = await getPackageJSON(repo);
    const updatedData = updateVersion(data, packageName, newPackageVersion);
    const updateFileContents = getPackageJSONString(updatedData);
    const branch = await createBranch(repo, packageName, newPackageVersion);

    await commitUpdates(repo, updateFileContents, packageName, newPackageVersion, branch);
    await createPR(repo, packageName, newPackageVersion, branch);
};

module.exports = {
    updateRepo
};