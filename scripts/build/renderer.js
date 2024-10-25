const Vite = require('vite');
const Path = require('path');
module.exports = buildRenderer;

async function buildRenderer (rootPath, mode) {
  const buildOutPath = Path.join(rootPath, 'build');
  const viteConfigFile = Path.join(rootPath, 'renderer', 'vite.config.js');
  const outDir = Path.join(buildOutPath, 'renderer');
  return Vite.build({
                      configFile: viteConfigFile,
                      base: './',
                      build: {
                        outDir,
                        emptyOutDir: true,
                      },
                      mode,
                    });
}