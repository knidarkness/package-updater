require('dotenv').config();
const { updateRepo } = require('./version-updater');

const args = require('yargs')
    .option('repository', {
        alias: 'r',
        require: true,
        description: 'username/repository, which should be parsed (e.g. knidarkness/package-updater)'
    })
    .option('package', {
        alias: 'p',
        description: 'A name of the package to update'
    })
    .option('ver', {
        alias: 'v',
        description: 'A version to which package should be updated'
    })
    .demandOption(['r', 'p', 'v'])
    .argv;

updateRepo(args.repository, args.package, args.ver);
