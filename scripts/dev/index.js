process.env.NODE_ENV = 'development'
const Path = require('path')
const Chalk = require('chalk')
const Chokidar = require('chokidar')

const rootPath = Path.join(__dirname, '..', '..')
const electronPath = Path.join(rootPath, 'electron')
const electronOutPath = Path.join(rootPath, 'build', 'main')
const viteConfigFile = Path.join(rootPath, 'view', 'vite.config.js')

const startRenderer = require('./renderer')

const copyStaticFiles = require('./static')

const electronManager = require('./electron')

start()

async function start () {
  console.log(`${Chalk.greenBright('=======================================')}`)
  console.log(`${Chalk.greenBright('Starting Electron + Vite Dev Server...')}`)
  console.log(`${Chalk.greenBright('=======================================')}`)

  //#region renderer
  const { viteDevServer, devServer } = await startRenderer(viteConfigFile, process.env.NODE_ENV)
  //#endregion

  //#region static
  const copy = copyStaticFiles(electronPath, electronOutPath)

  copy('static')
  //#endregion

  //#region electron
  const { startElectron, restartElectron } = electronManager(
    electronPath,
    electronOutPath,
    devServer.config.server.port,
    () => {
      viteDevServer.close()
    })
  await startElectron()

  // 监听electron目录文件变化
  Chokidar.watch(electronPath, {
    cwd: electronPath,
  }).on('change', (path) => {
    console.log(Chalk.blueBright(`[electron] `) + `Change in ${path}. reloading... 🚀`)

    if (path.startsWith(Path.join('static', '/'))) {
      copy(path)
    }

    restartElectron()
  })
  //#endregion
}


