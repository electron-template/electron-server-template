import { join } from "path";
import { fork, spawn, exec } from 'child_process';
import { EOL } from "os";
import Chalk from "chalk";
import electron, { app } from 'electron';

function threadCommunication(child) {
  // 监听来自子进程的消息
  child.on('message', (args) => {
    const { api, handleName, arg,id } = args;
    let res;
    // if (handleName) {
    //   res = electron[api][handleName](arg);
    // } else {
    //   res = electron[api](arg);
    // }
    child.send({
      res:1,
      id
    });
  });
}
function sendMessageToRenderer(mainWindow,msg) {
  mainWindow?.webContents.send('send-for-main-propress', msg);
}
function createServerHandle(serverPath, mainWindow, ...args) {
  const [command, arg = []] = args;
  sendMessageToRenderer(mainWindow, `正在启动服务...,路径为${serverPath}`)
  const child = spawn(command, arg, {
    cwd: serverPath,
    stdio: ['ignore', 'pipe', 'pipe'], // 忽略输入，将标准输出和标准错误重定向到管道
    shell: true, // 在 Windows 上可能需要设置为 true
  });
  threadCommunication(child);
  function stop() {
    if (child) {
      child.removeAllListeners('exit')
      child.kill()
    }
  }

  // 监听子进程的标准输出
  child.stdout.on('data', (data) => {
    if (data == EOL) {
      return
    }
    sendMessageToRenderer(mainWindow, data.toString())
    process.stdout.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString()))
  });

  // 监听子进程的标准错误
  child.stderr.on('data', (data) => {
    sendMessageToRenderer(mainWindow, data.toString())
    process.stderr.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString()))
  });

  // 监听子进程的关闭事件
  child.on('close', (code) => {
    sendMessageToRenderer(mainWindow, '服务已关闭')
    console.log(`child process exited with code ${code}`);
    stop()
  });
  child.on('exit', (code) => {
    sendMessageToRenderer(mainWindow, '服务已关闭')
    console.log(`child process exited with code ${code}`);
    stop()
  });
}

function createServer(mainWindow) {
  if (process.env.NODE_ENV !== 'development') {
    const serverPath = join(app.getAppPath(), '/server', 'main.js')
    createServerHandle(serverPath, mainWindow, 'node ' + serverPath)
  } else {
    const serverPath = join(__dirname, '..', '..', '..', 'server')
    console.log('serverPath', serverPath);
    createServerHandle(serverPath, mainWindow, 'npm', ['run', 'dev'])
  }

}

export default createServer;