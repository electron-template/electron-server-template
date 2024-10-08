const Vite = require('vite')

async function startRenderer (viteConfigFile,mode) {
  const viteDevServer = await Vite.createServer({
                                               configFile: viteConfigFile,
                                               mode,
                                             })

  const devServer =await viteDevServer.listen();
  return {
    viteDevServer,
    devServer
  }
}
module.exports = startRenderer