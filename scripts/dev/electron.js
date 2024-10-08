const Chalk = require('chalk')
const Path = require('path')
const ChildProcess = require('child_process')
const Electron = require('electron')
const { EOL } = require('os')
const compileTs = require('../private/tsc');

module.exports = ElectronManager
// electron 管理类
function ElectronManager(electronPath, electronOutPath, rendererPort,stopHandler=()=>{}) {
  let electronProcess = null;
  let electronProcessLocker = false;

  const electronMainPath= Path.join(electronOutPath,'main', 'index.js');

  function stop () {
    stopHandler?.();
    process.exit();
  }

  async function startElectron () {
    if (electronProcess) { // single instance lock
      return;
    }

    try {
      await compileTs(electronPath);
    } catch {
      console.log(Chalk.redBright('Could not start Electron because of the above typescript error(s).'));
      electronProcessLocker = false;
      return;
    }

    const args = [
      electronMainPath,
      rendererPort,
    ];
    electronProcess = ChildProcess.spawn(Electron, args);
    electronProcessLocker = false;

    electronProcess.stdout.on('data', data => {
      if (data == EOL) {
        return;
      }

      process.stdout.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString()))
    });

    electronProcess.stderr.on('data', data =>
      process.stderr.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString()))
    );

    electronProcess.on('exit', () => stop());
  }

  function restartElectron () {
    if (electronProcess) {
      electronProcess.removeAllListeners('exit');
      electronProcess.kill();
      electronProcess = null;
    }

    if (!electronProcessLocker) {
      electronProcessLocker = true;
      startElectron();
    }
  }


  return {
    startElectron,
    restartElectron
  }
}