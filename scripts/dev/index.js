process.env.NODE_ENV = 'development'
const Path = require('path')
const Chalk = require('chalk')

const rootPath = Path.join(__dirname, '..', '..')

const startRenderer = require('./renderer')

const electronManager = require('./electron')

start()

async function start () {
  console.log(`${Chalk.greenBright('=======================================')}`)
  console.log(`${Chalk.greenBright('Starting Electron + Vite Dev Server...')}`)
  console.log(`${Chalk.greenBright('=======================================')}`)

  //#region renderer
  const { viteDevServer, devServer } = await startRenderer(rootPath, process.env.NODE_ENV)
  //#endregion

  //#region electron
  const { startElectron } = await electronManager(
    rootPath,
    devServer.config.server.port,
    () => {
      viteDevServer.close()
    })
  await startElectron()
  //#endregion
}


