const Chalk = require('chalk');
const Path = require('path');
const ChildProcess = require('child_process');
const Electron = require('electron');
const { EOL } = require('os');
const Chokidar = require('chokidar');
const compileTs = require('../private/tsc');
const copyStaticFiles = require('../private/static');

module.exports = ElectronManager;


// 监听electron目录文件变化并自动重启electron
function startWatcher (electronPath, copy, restartElectron) {
  const changeHandle = async (path) => {
    console.log(Chalk.blueBright(`[electron] `) + `Change in ${path}. reloading... 🚀`);

    if (path.startsWith(Path.join('static', '/'))) {
      await copy(path);
    }

    restartElectron();
  };
  const electronWatcher = Chokidar.watch(electronPath);
  // 不能监听添加,ts编译后不知道为什么还在触发添加
  // electronWatcher.on('add', (path)=>{
  // console.log('add');
  // changeHandle(path)
  // });
  electronWatcher.on('change', (path) => {
    // console.log('change');
    changeHandle(path);
  });
  electronWatcher.on('unlink', (path) => {
    // console.log('unlink');
    changeHandle(path);
  });
  return electronWatcher;
}

// electron 管理类
async function ElectronManager (rootPath, rendererPort, stopHandler = () => {}) {
  const electronPath = Path.join(rootPath, 'electron');
  const electronOutPath = Path.join(rootPath, 'build', 'electron');
  // 这个基本固定
  const electronMainPath = Path.join(electronOutPath, 'main', 'index.js');
  const copy = copyStaticFiles(electronPath, electronOutPath);

  await copy('static');
  console.log('electronPath', electronPath);



  let electronWatcher = null;
  let electronProcess = null;
  let electronProcessLocker = false;


  function stop () {
    stopHandler?.();
    electronWatcher?.close();
    process.exit();
  }

  async function startElectron () {
    if (electronProcess) { // single instance lock
      return;
    }

    try {
      await compileTs(electronPath);
      electronWatcher = startWatcher(electronPath, copy,restartElectron);
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

      process.stdout.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString()));
    });

    electronProcess.stderr.on('data', data =>
      process.stderr.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString())),
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
  };
}