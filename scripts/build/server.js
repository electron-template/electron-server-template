const { spawn, exec } = require('child_process');
const { join } = require('path');
const { EOL } = require('os');
const Chalk = require('chalk');
const fs = require('fs').promises;
const util = require('util');
module.exports = createServer;

async function createServer (rootPath) {
  const nestPath = join(rootPath, 'server');
  // 不知道为什么执行这个会把当前项目的依赖污染,导致部分依赖被删除
  // await installNestDependencies(nestPath, rootPath);
  await buildNest(nestPath);

}

function installDependencies (dependencies, rootPath) {
  return new Promise((resolve, reject) => {
    const command = `pnpm install -f ${dependencies}`;
    console.log(`执行指令: ${command}`);
    exec(command,{
      cwd: rootPath
    }, (error, stdout, stderr) => {
      if (error) {
        console.error(`指令错误: ${error.message}`);
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        reject(error);
      } else {
        console.log(`stdout: ${stdout}`);
        resolve();
      }
    });
  });
}

async function installNestDependencies (nestPath, rootPath) {

  // 指定目录下的 package.json 文件路径
  const packageJsonPath = join(nestPath, 'package.json');

  try {
    // 读取 package.json 文件
    const packageJsonData = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonData);

    // 提取 dependencies
    const dependencies = Object.keys(packageJson.dependencies)
      .map(dep => `${dep}@${packageJson.dependencies[dep]}`)
      .join(' ');

    // 安装依赖
    await installDependencies(dependencies, rootPath);
    console.log('所有依赖安装成功');
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1); // 在出现错误时退出进程
  }
}

function buildNest (nestPath) {
  return new Promise((resolve, reject) => {
    const cwd = nestPath;
    // nestServiceProcess对象属性:
    // pid: 子进程的进程ID。
    // stdout: 一个可读流，表示子进程的标准输出。设置了stdio: 'inherit'时,为null
    // stderr: 一个可读流，表示子进程的标准错误输出。设置了stdio: 'inherit'时,为null
    // stdin: 一个可写流，表示子进程的标准输入。如果你需要与子进程进行交互，可以通过这个流发送数据。
    // signal: 如果子进程因为接收到信号而终止，这个属性会存储信号的名称。
    // exitCode: 子进程退出时的退出码。如果子进程还没有退出，这个属性会是null。
    // killed: 一个布尔值，表示子进程是否被父进程杀死。
    // spawnargs: 一个数组，包含用于启动子进程的命令行参数。
    // connected: 一个布尔值，表示父进程和子进程之间的标准输入输出是否已连接。
    const nestBuildPropress = spawn('npm', ['run', 'build'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true, // 在 Windows 上可能需要设置为 true
    });

    nestBuildPropress.stdout.on('data', data => {
      if (data == EOL) {
        return;
      }

      process.stdout.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString()));
    });

    nestBuildPropress.stderr.on('data', data =>
      process.stderr.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString())),
    );

    nestBuildPropress.on('exit', exitCode => {
      if (exitCode > 0) {
        reject(exitCode);
      } else {
        resolve();
      }
    });
  });
}
