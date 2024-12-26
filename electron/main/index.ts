import { app, session } from 'electron';
import os from 'node:os';
import createTray from './tary';
import createWindow from './mainWindow';
import createRequest from './request';
import createServer from './server';
import Chalk from 'chalk';


let stopServerHandler;
app.whenReady().then(async () => {
  createTray();
  createRequest();
  await createWindow();
  stopServerHandler = await createServer();
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['script-src \'self\''],
      },
    });
  });
});

// 关闭Windows 7的GPU加速
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration();

// 设置Windows 10+通知的应用程序名称
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

// 当窗口全部关闭时,退出electron应用,关闭进程
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopServerHandler?.();
    app.quit();
    // process.exit();
  }
});

app.on('before-quit', () => {
  stopServerHandler?.();
});
