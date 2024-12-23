const Path = require('path');
const Chalk = require('chalk');
const FileSystem = require('fs');

const electronBuild = require('./electron');
const rendererBuild = require('./renderer');

process.env.NODE_ENV = 'production';

const rootPath = Path.join(__dirname, '..', '..');

async function deleteBuild (rootPath) {
  const buildOutPath = Path.join(rootPath, 'build');
  // 删除build文件夹
  await FileSystem.promises.rm(buildOutPath, {
    recursive: true,  // 如果路径是一个目录，并且设置了此选项，则删除目录及其内容
    force: true,       // 如果目录不为空，并且设置了此选项（注意：在某些Node.js版本中可能是 deprecated，使用 recursive: true 通常就足够了）
  });
  console.log(Chalk.blueBright('build目录删除成功'));
}

deleteBuild(rootPath).then(async () => {
  console.log(Chalk.blueBright('Transpiling renderer & main...'));
  await deleteBuild(rootPath);
  await Promise.all([
                      electronBuild(rootPath),
                      rendererBuild(rootPath, process.env.NODE_ENV),
                    ]);
  console.log(Chalk.greenBright('Renderer & main successfully transpiled! (ready to be built with electron-builder)'));
});
