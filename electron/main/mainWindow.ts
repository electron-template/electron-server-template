//存放窗口相关代码
import {app, BrowserWindow, session, shell} from "electron";
import {join} from "path";

export default createWindow;

let mainWindow: BrowserWindow | null = null;
const preloadPath = join(__dirname, '..','preload.js'); // preload.js的path

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: preloadPath,
            // Warning: 启用nodeIntegration并禁用上下文隔离在生产环境中是不安全的
            nodeIntegration: false,
            // 是否启用上下文隔离
            contextIsolation: true,
        }
    });

    if (process.env.NODE_ENV === 'development') {
        const rendererPort = process.argv[2];
        mainWindow.loadURL(`http://localhost:${rendererPort}`);
    } else {
        mainWindow.loadFile(join(app.getAppPath(), '/renderer', 'index.html'));
    }
    // 监听web加载完毕
    mainWindow.webContents.on('did-finish-load', () => {
        // 测试主动将消息推送到Electron渲染器进程
        // mainWindow?.webContents.send('send-for-main-propress', new Date().toLocaleString())
    })

    // 让所有链接都以浏览器打开，而不是以应用程序打开。
    mainWindow.webContents.setWindowOpenHandler(({url}) => {
        if (url.startsWith('https:')) shell.openExternal(url)
        return {action: 'deny'}
    })
}

// 保障只会启用一个窗口
// app.requestSingleInstanceLock()获取当前是否只有一个应用实例
if (!app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
}
// 当尝试打开新窗口时触发,
app.on('second-instance', () => {
    if (mainWindow) {
        // 激活窗口并从最小化恢复为之前的样子
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    }
})
//当应用激活时,打开/创建一个窗口
app.on('activate', () => {
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length) {
        allWindows[0].focus()
    } else {
        createWindow()
    }
})

