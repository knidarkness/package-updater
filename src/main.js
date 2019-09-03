require('dotenv').config();
const { updateRepo } = require('./version-updater');

const validateArguments = () => {
    if (process.argv.length !== 5) {
        console.error('Missing required arguments: repository address, package name, and new package version');
        process.exit(-1);
    }
};

const main = async () => {
    validateArguments();
    await updateRepo(process.argv[2], process.argv[3], process.argv[4]);
};

main();
