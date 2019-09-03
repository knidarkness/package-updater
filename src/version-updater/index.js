const github = require('octonode');
const logger = require('./logger');
const { getInstallationAccessToken } = require('./auth');


const getPackageJSONAsObject = async repo => {
    logger.info('Will receive package.json from the remote repository');
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
    logger.info('Receiving commits from the remote repository.');
    const commits = await repo.commitsAsync();
    const branchName = `${packageName}-updated-to-${newPackageVersion}`;
    logger.info(`Will create branch ${branchName} on the remote repository`);
    await repo.createReferenceAsync(branchName, commits[0][0].sha);
    return branchName;
};

const commitUpdates = async (repo, content, packageName, newPackageVersion, branch) => {
    logger.info('Receiving sha-hash for the pakage.json');
    const sha = (await repo.contentsAsync('package.json', branch))[0].sha
    logger.info('Will commit package.json to the remote repository');
    await repo.updateContentsAsync('package.json', 
        `Updated ${packageName} to version ${newPackageVersion}`,
        content,
        sha,
        branch
    );
};

const createPR = async (repo, packageName, newPackageVersion, branch, targetBranch='master') => {
    logger.info('Will create PR on the remote repository');
    await repo.prAsync({
        'title': `Updated ${packageName} to version ${newPackageVersion}`,
        'body': `Updated ${packageName} to version ${newPackageVersion} by automated package-updater.`,
        'head': branch,
        'base': targetBranch
    });
};

/**
 * @param repoLink In format like 'knidarkness/package-updater', i.e. no github part, just user/repo
 * 
 */
const getRepositoryClient = async (repoLink) => {
    const userName = repoLink.split('/')[0];
    const repoName = repoLink.split('/')[1];

    logger.info('Will acquire installation token and create github API client with it');
    const installationToken = await getInstallationAccessToken(userName, repoName);
    const githubAppClient = github.client(installationToken);
    return githubAppClient.repo(repoLink);
};

/**
 * @param repoLink In format like 'knidarkness/package-updater', i.e. no github part, just user/repo
 * 
 */
const updateRepo = async (repoLink, packageName, newPackageVersion) => {
    let repo;

    try {
        repo = await getRepositoryClient(repoLink);
        logger.info('Auth token received, proceeding to data processing');
    } catch (err) {
        logger.error('Encountered problem during token acquisition, exiting');
        logger.error(err);
        throw err;
    }
    
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