process.env.NODE_ENV = 'development';
const Path = require('path');
const Chalk = require('chalk');
const fs = require('fs');

const rootPath = Path.join(__dirname, '..', '..');

const startRenderer = require('./renderer');
const electronManager = require('./electron');

// 优化日志输出
function logInfo(message) {
  console.log(Chalk.cyan(`[INFO] ${message}`));
}

function logSuccess(message) {
  console.log(Chalk.green(`[SUCCESS] ${message}`));
}

function logWarning(message) {
  console.log(Chalk.yellow(`[WARNING] ${message}`));
}

function logError(message, error) {
  console.error(Chalk.red(`[ERROR] ${message}`));
  if (error) {
    console.error(Chalk.red(error.stack || error.message || error));
  }
}

// 确保目录存在
function ensureDirectoryExists(path) {
  if (!fs.existsSync(path)) {
    logInfo(`Creating directory: ${path}`);
    fs.mkdirSync(path, { recursive: true });
  }
}

// 确保构建目录存在
function ensureBuildDirectories() {
  const dirs = [
    Path.join(rootPath, 'build'),
    Path.join(rootPath, 'build/electron'),
    Path.join(rootPath, 'build/electron/main'),
    Path.join(rootPath, 'build/electron/static'),
    Path.join(rootPath, 'build/renderer'),
    Path.join(rootPath, 'build/server'),
  ];

  dirs.forEach(ensureDirectoryExists);
}

// 启动开发环境
async function start() {
  try {
    console.log(
      `${Chalk.greenBright('=======================================')}`,
    );
    console.log(
      `${Chalk.greenBright('Starting Electron + Vite Dev Server...')}`,
    );
    console.log(
      `${Chalk.greenBright('=======================================')}`,
    );

    // 确保构建目录存在
    ensureBuildDirectories();

    logInfo('Starting renderer process (Vue + Vite)...');

    //#region renderer
    const { viteDevServer, devServer } = await startRenderer(
      rootPath,
      process.env.NODE_ENV,
    );
    logSuccess(
      `Renderer started at http://localhost:${devServer.config.server.port}`,
    );
    //#endregion

    logInfo('Starting Electron process...');

    //#region electron
    const { startElectron } = await electronManager(
      rootPath,
      devServer.config.server.port,
      () => {
        logInfo('Shutting down Vite server...');
        viteDevServer
          .close()
          .then(() => {
            logInfo('Vite server closed');
          })
          .catch((err) => {
            logError('Error closing Vite server', err);
          });
      },
    );

    await startElectron();
    logSuccess('Electron started');
    //#endregion

    // 设置终止处理程序
    const exitHandler = (options, exitCode) => {
      if (options.cleanup) {
        logInfo('Cleaning up...');
        viteDevServer.close();
      }
      if (exitCode || exitCode === 0) {
        logInfo(`Exit with code: ${exitCode}`);
      }
      if (options.exit) {
        process.exit();
      }
    };

    // 优雅地处理进程终止
    process.on('exit', exitHandler.bind(null, { cleanup: true }));
    process.on('SIGINT', exitHandler.bind(null, { exit: true }));
    process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
    process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));
    process.on('uncaughtException', (err) => {
      logError('Uncaught exception', err);
      exitHandler({ exit: true });
    });
  } catch (error) {
    logError('Failed to start development server', error);
    process.exit(1);
  }
}

start();
