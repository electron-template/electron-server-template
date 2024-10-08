const Vite = require('vite')
const Path = require('path')
module.exports = buildRenderer

async function buildRenderer (viteConfigFile, buildOutPath, mode) {
  const outDir = Path.join(buildOutPath, 'renderer')
  console.log(viteConfigFile, outDir, mode)
  return Vite.build({
                      configFile: viteConfigFile,
                      base: './',
                      build: {
                        outDir,
                        emptyOutDir: true
                      },
                      mode
                    })
}