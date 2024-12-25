//存放窗口相关代码
import { app, BrowserWindow, session, shell } from 'electron';
import { join } from 'path';
import Chalk from 'chalk';

export default createWindow;

const preloadPath = join(__dirname, '..', 'preload.js'); // preload.js的path

let mainWindow;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: preloadPath,
      // Warning: 启用nodeIntegration并禁用上下文隔离在生产环境中是不安全的
      nodeIntegration: false,
      // 是否启用上下文隔离
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererPort = process.argv[2];
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
  } else {
    mainWindow.loadFile(join(app.getAppPath(), '/renderer', 'index.html'));
  }


  // 让所有链接都以浏览器打开，而不是以应用程序打开。
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log(`${Chalk.greenBright('=======================================')}`);
    console.log(`${Chalk.greenBright('窗口启动成功')}`);
    console.log(`${Chalk.greenBright('=======================================')}`);
  });
  mainWindow.webContents.on('did-fail-load', () => {
    console.log(`${Chalk.redBright('=======================================')}`);
    console.log(`${Chalk.redBright('窗口启动失败')}`);
    console.log(`${Chalk.redBright('=======================================')}`);
  });
  return mainWindow;
}
// 当尝试打开新窗口时触发,
app.on('second-instance', () => {
  if (mainWindow) {
    // 激活窗口并从最小化恢复为之前的样子
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
//当应用激活时,打开/创建一个窗口
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
// 保障只会启用一个窗口
// app.requestSingleInstanceLock()获取当前是否只有一个应用实例
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}


