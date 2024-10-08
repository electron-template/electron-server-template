const Path = require('path')
const Chalk = require('chalk')
const FileSystem = require('fs')

const serverBuild=require('./server')
const electronBuild = require('./electron')
const rendererBuild = require('./renderer')
const copyStaticFiles = require('./static')

process.env.NODE_ENV = 'production'

const rootPath = Path.join(__dirname, '..', '..')
const nestPath=Path.join(rootPath,'server');
const electronPath = Path.join(rootPath, 'electron')
const electronOutPath = Path.join(rootPath, 'build', 'main')
const buildOutPath = Path.join(rootPath, 'build')
const viteConfigFile = Path.join(rootPath, 'view', 'vite.config.js')

function copyStaticFilesHandler () {
  const copy = copyStaticFiles(electronPath, electronOutPath)
  const staticFileNames = ['static']
  staticFileNames.forEach(copy)
}

// 删除build文件夹
FileSystem.rmSync(buildOutPath, {
  recursive: true,
  force: true,
})

console.log(Chalk.blueBright('Transpiling renderer & main...'))
Promise.allSettled([
                     copyStaticFilesHandler(),
                     electronBuild(electronPath),
                     rendererBuild(viteConfigFile, buildOutPath, process.env.NODE_ENV),
                     serverBuild(nestPath)
                   ]).then(() => {
  console.log(Chalk.greenBright('Renderer & main successfully transpiled! (ready to be built with electron-builder)'))
})
