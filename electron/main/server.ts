import  {join} from "path";
import {fork, spawn, exec} from 'child_process';
import {EOL} from "os";
import Chalk from "chalk";
import {app} from "electron";

function createServer(mainWindow) {
    function createServerHandle(serverPath,mainWindow,...args) {
        const [command,arg=[]]=args;
        mainWindow.webContents.send('send-for-main-propress', `正在启动服务...,路径为${serverPath}`);
        const child = spawn(command, arg, {
            stdio: ['ignore', 'pipe', 'pipe'], // 忽略输入，将标准输出和标准错误重定向到管道
            shell: true, // 在 Windows 上可能需要设置为 true
        });

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
            mainWindow.webContents.send('send-for-main-propress', data.toString());
            process.stdout.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString()))
        });

        // 监听子进程的标准错误
        child.stderr.on('data', (data) => {
            process.stderr.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString()))
            mainWindow.webContents.send('send-for-main-propress', data.toString());
        });

        // 监听子进程的关闭事件
        child.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            stop()
        });
        child.on('exit', (code) => {
            console.log(`child process exited with code ${code}`);
            stop()
        });
    }

    if(process.env.NODE_ENV !== 'development'){
        const serverPath = join(app.getAppPath(), '/server', 'main.js')
        createServerHandle(serverPath,mainWindow, 'node ' + serverPath)
    }else{
        const serverPath =join(__dirname, '..', '..','..', 'server')
        createServerHandle(serverPath,mainWindow,'npm', ['run', 'dev'])
    }

}

export default createServer;