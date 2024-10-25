const compileTs = require('../private/tsc');
const copyStaticFiles = require('../private/static');
const Chalk = require('chalk')
const Path = require('path');

module.exports=buildMain;

function copyStaticFilesHandler (electronPath, electronOutPath) {
  const copy = copyStaticFiles(electronPath, electronOutPath)
  const staticFileNames = ['static']
  const copyCallbacks = staticFileNames.map(copy);
  return Promise.all(copyCallbacks)
}
async function buildMain (rootPath) {
  const electronPath = Path.join(rootPath, 'electron')
  const electronOutPath = Path.join(rootPath, 'build', 'main')
  try {
    await compileTs(electronPath);
    await copyStaticFilesHandler(electronPath, electronOutPath);
  } catch(e) {
    console.log(Chalk.redBright('Could not start Electron because of the above typescript error(s).'));
    console.log(Chalk.redBright('errorMsg:'), e);
  }
}