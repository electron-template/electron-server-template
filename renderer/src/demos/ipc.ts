//主进程就是调用new BrowserWindow()的那个进程,也就是这里的electron/main/index.ts
//渲染进程就是管理每个窗口的那个进程,也就是new BrowserWindow()返回的win.webContents,同时也是src/main.js,因为创建窗口会调用主文件去构建应用

//也就是说,构建electron的是主进程
//构建页面的是渲染进程,但是页面不是,页面调用不了ipcRenderer
window.ipcRenderer.on('send-for-main-propress', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})
