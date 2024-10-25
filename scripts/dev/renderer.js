const Vite = require('vite');
const Path = require('path');

async function startRenderer (rootPath, mode) {
  const viteConfigFile = Path.join(rootPath, 'renderer', 'vite.config.js');

  const viteDevServer = await Vite.createServer({
                                                  configFile: viteConfigFile,
                                                  mode,
                                                });

  const devServer = await viteDevServer.listen();
  return {
    viteDevServer,
    devServer,
  };
}

module.exports = startRenderer;