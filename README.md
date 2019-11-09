# Package-updater

## Rationale
This package's intent is to automatically create pull requests after a version of given lib is updated. Each PR will be created in a repo which depends on the package which have updated and will suggest to merge a modified package.json file.

## Installation

To run this app you should follow such steps:
1. Clone this repository via `git clone git@github.com:knidarkness/package-updater.git` 
2. Install packages by `npm install`
3. Create .env file with following contents:
```
PRIVATE_KEY="-----BEGIN RSA PRIVATE\n... your private key for GithubApp"
GITHUB_APP_IDENTIFIER=your app id
GITHUB_WEBHOOK_SECRET=your webhook secret
```
4. Or ask @knidarkness to provide you with credentials for internal usage.

## Usage

When you have installed the package you should add the app [package-updater](https://github.com/apps/package-updater) and select to which repositories it will have access.

After that you (as admin of the application) can use it as following:
```
node ./src/main.js --repository nickname/repository --package package-name --ver package-version
```
For example, `node ./src/main.js -r knidarkness/test-repo -p express -v 1.51.16` will try to access repository knidarkness/test-repo and update version of express in package.json to 4.17.10.


## License

This utility script is distributed under the Apache 2.0 License
