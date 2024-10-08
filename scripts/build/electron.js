const compileTs = require('../private/tsc');
const Chalk = require('chalk')

module.exports=buildMain;

async function buildMain (electronPath) {
  console.log(electronPath)
  try {
    await compileTs(electronPath);
    return;
  } catch(e) {
    console.log(Chalk.redBright('Could not start Electron because of the above typescript error(s).'));
    console.log(Chalk.redBright('errorMsg:'), e);
  }
}