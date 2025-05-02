import { contextBridge, ipcRenderer } from 'electron';

// 创建缓存，减少重复IPC调用
const apiCache = new Map();
const EVENT_HANDLERS = new Map();

createPreload();

function createPreload() {
  createIpcRenderer();
  createLoading();
}

// 优化IPC通信：使用节流和缓存
function throttle(fn, delay = 100) {
  let lastCall = 0;
  return function(this: any, ...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

// 向Renderer进程公开一些API，这些api会挂在在window[apiKey]上，这里是window.ipcRenderer
function createIpcRenderer() {
  contextBridge.exposeInMainWorld('ipcRenderer', {
    //主进程就是调用new BrowserWindow()的那个进程,也就是这里的electron/main/index.ts
    //渲染进程就是管理每个窗口的那个进程,也就是new BrowserWindow()返回的win.webContents,同时也是src/main.js,因为创建窗口会调用主文件去构建应用

    //也就是说,构建electron的是主进程
    //构建页面的是渲染进程,但是页面不是,页面调用不了ipcRenderer

    // 监听渲染进程和主进程之间的消息通信 - 优化版本
    on(...args: Parameters<typeof ipcRenderer.on>) {
      const [channel, listener] = args;
      
      // 避免重复监听相同的事件
      if (EVENT_HANDLERS.has(channel)) {
        ipcRenderer.off(channel, EVENT_HANDLERS.get(channel));
      }
      
      const wrappedListener = (event, ...args) => {
        listener(event, ...args);
      };
      
      EVENT_HANDLERS.set(channel, wrappedListener);
      return ipcRenderer.on(channel, wrappedListener);
    },
    
    // 取消监听 - 优化版本
    off(...args: Parameters<typeof ipcRenderer.off>) {
      const [channel, ...omit] = args;
      
      if (EVENT_HANDLERS.has(channel)) {
        ipcRenderer.off(channel, EVENT_HANDLERS.get(channel));
        EVENT_HANDLERS.delete(channel);
      } else {
        return ipcRenderer.off(channel, ...omit);
      }
    },
    
    // 渲染进程和主进程之间的发送消息 - 节流版本
    send: throttle((...args: Parameters<typeof ipcRenderer.send>) => {
      const [channel, ...omit] = args;
      return ipcRenderer.send(channel, ...omit);
    }, 50),

    // 优化invoke调用，添加缓存功能
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...params] = args;
      
      // 对于一些可缓存的调用使用缓存
      if (channel.startsWith('get-') || channel.startsWith('fetch-')) {
        const cacheKey = `${channel}:${JSON.stringify(params)}`;
        
        // 检查缓存
        if (apiCache.has(cacheKey)) {
          return Promise.resolve(apiCache.get(cacheKey));
        }
        
        // 执行调用并缓存结果
        return ipcRenderer.invoke(channel, ...params).then(result => {
          apiCache.set(cacheKey, result);
          
          // 设置缓存过期时间
          setTimeout(() => {
            apiCache.delete(cacheKey);
          }, 30000); // 30秒缓存
          
          return result;
        });
      }
      
      // 非可缓存调用直接执行
      return ipcRenderer.invoke(channel, ...params);
    },

    // 兼容性API，优化后
    request(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args;
      return ipcRenderer.invoke(channel, ...omit);
    },

    // 暴露给渲染进程的API - 优化版本
    onChildOutput: (callback) => {
      // 清理之前的监听器
      if (EVENT_HANDLERS.has('child-output')) {
        ipcRenderer.off('child-output', EVENT_HANDLERS.get('child-output'));
      }
      
      const wrappedCallback = (event, output) => {
        callback(output);
      };
      
      EVENT_HANDLERS.set('child-output', wrappedCallback);
      ipcRenderer.on('child-output', wrappedCallback);
    },
    
    // 清除缓存API
    clearCache: () => {
      apiCache.clear();
    }
  });
}

function createLoading() {
  // --------- 优化DOM加载完毕检测 ---------
  function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
    return new Promise((resolve) => {
      // document.readySate:
      // "loading"：DOM在加载/解析中。
      // "interactive"：DOM已经加载完毕,可以操作DOM元素，但可能仍在加载样式表、图片和子框架等资源。
      // "complete"：DOM和其他资源均已加载并解析完毕

      // 如果dom已经加载完毕,则直接返回,否则等待dom加载完毕
      if (condition.includes(document.readyState)) {
        resolve(true);
      } else {
        document.addEventListener('readystatechange', () => {
          if (condition.includes(document.readyState)) {
            resolve(true);
          }
        });
      }
    });
  }

//#region 给electron加一个加载动画 - 优化性能版本
  const safeDOM = {
    append(parent: HTMLElement, child: HTMLElement) {
      if (!Array.from(parent.children).find(e => e === child)) {
        return parent.appendChild(child);
      }
    },
    remove(parent: HTMLElement, child: HTMLElement) {
      if (Array.from(parent.children).find(e => e === child)) {
        return parent.removeChild(child);
      }
    },
  };

  /**
   * https://tobiasahlin.com/spinkit
   * https://connoratherton.com/loaders
   * https://projects.lukehaas.me/css-loaders
   * https://matejkustec.github.io/SpinThatShit
   */
  function useLoading() {
    const className = `loaders-css__square-spin`;
    // 优化CSS动画性能
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
  will-change: transform;
  transform: translateZ(0);
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
    `;
    const oStyle = document.createElement('style');
    const oDiv = document.createElement('div');

    oStyle.id = 'app-loading-style';
    oStyle.innerHTML = styleContent;
    oDiv.className = 'app-loading-wrap';
    oDiv.innerHTML = `<div class="${className}"><div></div></div>`;

    return {
      appendLoading() {
        safeDOM.append(document.head, oStyle);
        safeDOM.append(document.body, oDiv);
      },
      removeLoading() {
        safeDOM.remove(document.head, oStyle);
        safeDOM.remove(document.body, oDiv);
      },
    };
  }

// ----------------------------------------------------------------------

  const { appendLoading, removeLoading } = useLoading();
  // 使用 requestIdleCallback 优化加载时机
  if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      domReady().then(appendLoading);
    });
  } else {
    domReady().then(appendLoading);
  }

  window.onmessage = (ev) => {
    if (ev.data.payload === 'removeLoading') {
      // 使用 requestAnimationFrame 确保在下一帧动画前移除loading
      requestAnimationFrame(() => {
        removeLoading();
      });
    }
  };

  // 超时保护，确保loading不会一直显示
  setTimeout(removeLoading, 5000);
  //#endregion
}


