const { EOL } = require('os')
const Chalk = require('chalk')
const ChildProcess = require('child_process')
module.exports = nestManager

// nest 管理类
function nestManager (nestPath,stopHandler = () => {}) {
  // nest工作目录
  const cwd = nestPath
  let nestServiceProcess = null
  let nestServiceProcessLocker = false

  function stop () {
    stopHandler?.()
  }

  async function startNest () {
    if (nestServiceProcess) { // single instance lock
      return
    }
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
    nestServiceProcess = ChildProcess.spawn('npm', ['run', 'dev'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true, // 在 Windows 上可能需要设置为 true
    })
    nestServiceProcessLocker = false
    nestServiceProcess.stdout.on('data', data => {
      if (data == EOL) {
        return
      }

      process.stdout.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString()))
    })

    nestServiceProcess.stderr.on('data', data =>
      process.stderr.write(Chalk.blueBright(`[nest] `) + Chalk.white(data.toString()))
    )

    nestServiceProcess.on('exit', (exitCode) => stop())
  }

  function reStartNest () {
    if (nestServiceProcess) {
      nestServiceProcess.removeAllListeners('exit')
      nestServiceProcess.kill()
      nestServiceProcess = null
    }

    if (!nestServiceProcessLocker) {
      nestServiceProcessLocker = true
      startNest()
    }
  }

  return {
    startNest,
    reStartNest
  }
}