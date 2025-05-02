#!/usr/bin/env node

/**
 * 依赖更新脚本
 * 用法: node scripts/automation/update-deps.js [--interactive]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// 日志函数
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ️ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️ ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

// 执行命令
function exec(command, options = {}) {
  logInfo(`执行命令: ${command}`);
  try {
    return execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options,
    });
  } catch (error) {
    logError(`命令执行失败: ${command}`);
    if (options.throwOnError !== false) {
      throw error;
    }
    return null;
  }
}

// 创建交互式问答
function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    question: (query) => new Promise((resolve) => rl.question(query, resolve)),
    close: () => rl.close(),
  };
}

// 检查过时的依赖
async function checkOutdatedDeps(directory, interactive = false) {
  logInfo(`检查 ${directory} 中的过时依赖`);

  try {
    const outdatedOutput = exec(
      `cd ${directory} && pnpm outdated --format json`,
      {
        silent: true,
        throwOnError: false,
      },
    );

    if (!outdatedOutput) {
      logWarning(`无法获取 ${directory} 的过时依赖信息`);
      return false;
    }

    let outdated;
    try {
      outdated = JSON.parse(outdatedOutput);
    } catch (e) {
      logWarning(`解析 ${directory} 的过时依赖信息失败`);
      return false;
    }

    const outdatedCount = Object.keys(outdated).length;

    if (outdatedCount === 0) {
      logSuccess(`${directory} 中的所有依赖都是最新的`);
      return false;
    }

    logWarning(`${directory} 中有 ${outdatedCount} 个过时的依赖`);

    // 显示过时依赖
    console.log('\n' + colors.cyan + '过时的依赖:' + colors.reset);
    for (const [pkg, info] of Object.entries(outdated)) {
      console.log(
        `  ${colors.yellow}${pkg}${colors.reset}: ${colors.red}${info.current}${colors.reset} → ${colors.green}${info.latest}${colors.reset}`,
      );
    }
    console.log();

    if (interactive) {
      const prompt = createPrompt();
      const answer = await prompt.question('是否更新这些依赖? (y/N): ');
      prompt.close();

      if (answer.toLowerCase() !== 'y') {
        logInfo(`跳过更新 ${directory} 的依赖`);
        return false;
      }
    }

    return true;
  } catch (error) {
    logError(`检查 ${directory} 中的过时依赖失败`);
    return false;
  }
}

// 更新依赖
function updateDependencies(directory) {
  logInfo(`更新 ${directory} 中的依赖`);
  exec(`cd ${directory} && pnpm update`);
  logSuccess(`${directory} 中的依赖已更新`);
}

// 运行测试
function runTests(directory) {
  logInfo(`在 ${directory} 中运行测试`);
  try {
    exec(`cd ${directory} && pnpm test`, { throwOnError: false });
    logSuccess(`${directory} 中的测试已通过`);
    return true;
  } catch (error) {
    logWarning(`${directory} 中的测试失败，请手动检查`);
    return false;
  }
}

// 主函数
async function main() {
  try {
    log('🔄 开始依赖更新流程', colors.bright + colors.cyan);

    // 判断是否是交互式模式
    const interactive = process.argv.includes('--interactive');

    // 检查并更新项目依赖
    const rootDir = process.cwd();
    const rendererDir = path.join(rootDir, 'renderer');

    // 1. 检查根目录依赖
    const shouldUpdateRoot = await checkOutdatedDeps(rootDir, interactive);
    if (shouldUpdateRoot) {
      updateDependencies(rootDir);
    }

    // 2. 检查渲染器依赖
    const shouldUpdateRenderer = await checkOutdatedDeps(
      rendererDir,
      interactive,
    );
    if (shouldUpdateRenderer) {
      updateDependencies(rendererDir);
    }

    // 3. 运行测试（如果有更新）
    if (shouldUpdateRoot || shouldUpdateRenderer) {
      runTests(rootDir);
    }

    // 4. 完成
    if (shouldUpdateRoot || shouldUpdateRenderer) {
      logSuccess('🎉 依赖更新完成!');
    } else {
      logSuccess('✨ 所有依赖都是最新的');
    }
  } catch (error) {
    logError('依赖更新过程中出错');
    console.error(error);
    process.exit(1);
  }
}

main();
