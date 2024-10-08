import {contextBridge, ipcRenderer} from "electron";

createPreload()
function createPreload() {
    createIpcRenderer()
    createLoading()
}
// 向Renderer进程公开一些API，这些api会挂在在window[apiKey]上，这里是window.ipcRenderer
function createIpcRenderer(){
    contextBridge.exposeInMainWorld('ipcRenderer', {
        //主进程就是调用new BrowserWindow()的那个进程,也就是这里的electron/main/index.ts
        //渲染进程就是管理每个窗口的那个进程,也就是new BrowserWindow()返回的win.webContents,同时也是src/main.js,因为创建窗口会调用主文件去构建应用

        //也就是说,构建electron的是主进程
        //构建页面的是渲染进程,但是页面不是,页面调用不了ipcRenderer

        // 监听渲染进程和主进程之间的消息通信
        on(...args: Parameters<typeof ipcRenderer.on>) {
            const [channel, listener] = args
            return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
        },
        // 取消监听
        off(...args: Parameters<typeof ipcRenderer.off>) {
            const [channel, ...omit] = args
            return ipcRenderer.off(channel, ...omit)
        },
        // 渲染进程和主进程之间的发送消息,不返回,如果要接受反馈,需要通过on监听后端调用的ipcRenderer.send(channel, ...omit)
        send(...args: Parameters<typeof ipcRenderer.send>) {
            const [channel, ...omit] = args
            return ipcRenderer.send(channel, ...omit)
        },
        // 渲染进程和主进程之间的发送消息,并通过promise监听响应,返回promise,值为后端的响应值
        //后端示例:
        //const {ipcMain} = require('electron');
        //ipcMain.handle('get-data', async (event, arg) => {
        //    // 模拟数据处理过程
        //    const processedData = `Processed ${arg}`;
        //    return processedData; // 返回处理后的数据给渲染进程
        //});
        invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
            const [channel, ...omit] = args
            return ipcRenderer.invoke(channel, ...omit)
        },

        request(...args: Parameters<typeof ipcRenderer.invoke>) {
            const [channel, ...omit] = args
            return ipcRenderer.invoke(channel, ...omit)
        }
        // ...
    })

}

function createLoading() {
    // --------- 等待dom加载完毕 ---------
    function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
        return new Promise((resolve) => {
            // document.readySate:
            // "loading"：DOM在加载/解析中。
            // "interactive"：DOM已经加载完毕,可以操作DOM元素，但可能仍在加载样式表、图片和子框架等资源。
            // "complete"：DOM和其他资源均已加载并解析完毕

            // 如果dom已经加载完毕,则直接返回,否则等待dom加载完毕
            if (condition.includes(document.readyState)) {
                resolve(true)
            } else {
                document.addEventListener('readystatechange', () => {
                    if (condition.includes(document.readyState)) {
                        resolve(true)
                    }
                })
            }
        })
    }

//#region 给electron加一个加载动画
    const safeDOM = {
        append(parent: HTMLElement, child: HTMLElement) {
            if (!Array.from(parent.children).find(e => e === child)) {
                return parent.appendChild(child)
            }
        },
        remove(parent: HTMLElement, child: HTMLElement) {
            if (Array.from(parent.children).find(e => e === child)) {
                return parent.removeChild(child)
            }
        },
    }


    /**
     * https://tobiasahlin.com/spinkit
     * https://connoratherton.com/loaders
     * https://projects.lukehaas.me/css-loaders
     * https://matejkustec.github.io/SpinThatShit
     */
    function useLoading() {
        const className = `loaders-css__square-spin`
        const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
        const oStyle = document.createElement('style')
        const oDiv = document.createElement('div')

        oStyle.id = 'app-loading-style'
        oStyle.innerHTML = styleContent
        oDiv.className = 'app-loading-wrap'
        oDiv.innerHTML = `<div class="${className}"><div></div></div>`

        return {
            appendLoading() {
                safeDOM.append(document.head, oStyle)
                safeDOM.append(document.body, oDiv)
            },
            removeLoading() {
                safeDOM.remove(document.head, oStyle)
                safeDOM.remove(document.body, oDiv)
            },
        }
    }

// ----------------------------------------------------------------------

    const {appendLoading, removeLoading} = useLoading()
    domReady().then(appendLoading)

    window.onmessage = (ev) => {
        ev.data.payload === 'removeLoading' && removeLoading()
    }

    // setTimeout(removeLoading, 999)
    //#endregion
}


