#!/usr/bin/env node

/**
 * 自动化发布脚本
 * 用法: node scripts/automation/release.js [major|minor|patch]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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
    throw error;
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

// 更新版本号
async function updateVersion(type) {
  const validTypes = ['major', 'minor', 'patch'];

  if (!validTypes.includes(type)) {
    logWarning(`无效的版本类型 "${type}"`);
    const prompt = createPrompt();
    type = await prompt.question(`请指定版本类型 (${validTypes.join('/')}): `);
    prompt.close();

    if (!validTypes.includes(type)) {
      logError('版本类型无效，终止发布过程');
      process.exit(1);
    }
  }

  // 获取当前版本
  const packagePath = path.resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const currentVersion = packageJson.version;

  // 更新版本
  exec(`npm version ${type} --no-git-tag-version`);

  // 获取新版本
  const updatedPackageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const newVersion = updatedPackageJson.version;

  logSuccess(`版本已从 ${currentVersion} 更新到 ${newVersion}`);
  return newVersion;
}

// 更新渲染进程的版本
function updateRendererVersion(version) {
  const rendererPackagePath = path.resolve(
    process.cwd(),
    'renderer/package.json',
  );
  const rendererPackageJson = JSON.parse(
    fs.readFileSync(rendererPackagePath, 'utf-8'),
  );

  rendererPackageJson.version = version;
  fs.writeFileSync(
    rendererPackagePath,
    JSON.stringify(rendererPackageJson, null, 2) + '\n',
  );

  logSuccess(`渲染进程版本已更新到 ${version}`);
}

// 更新配置服务中的版本
function updateConfigServiceVersion(version) {
  const configServicePath = path.resolve(
    process.cwd(),
    'server/config/services/config.service.ts',
  );

  if (fs.existsSync(configServicePath)) {
    let configServiceContent = fs.readFileSync(configServicePath, 'utf-8');
    configServiceContent = configServiceContent.replace(
      /APP_VERSION: '[^']*'/,
      `APP_VERSION: '${version}'`,
    );
    fs.writeFileSync(configServicePath, configServiceContent);

    logSuccess(`配置服务版本已更新到 ${version}`);
  }
}

// 构建应用
function buildApp() {
  logInfo('清理旧构建文件');
  exec('rm -rf dist build', { shell: true });

  logInfo('安装最新依赖');
  exec('pnpm install');

  logInfo('构建应用');
  exec('pnpm build');

  logSuccess('应用构建完成');
}

// 创建Git标签
function createGitTag(version) {
  logInfo('提交版本变更到Git');
  exec('git add .');
  exec(`git commit -m "chore(release): v${version}"`);

  logInfo(`创建Git标签 v${version}`);
  exec(`git tag -a v${version} -m "Release v${version}"`);

  logSuccess(`Git标签 v${version} 创建成功`);
}

// 主函数
async function main() {
  try {
    log('📦 开始发布流程', colors.bright + colors.cyan);

    // 1. 检查Git工作区是否干净
    logInfo('检查Git工作区状态');
    const status = exec('git status --porcelain', { silent: true })
      .toString()
      .trim();
    if (status) {
      logWarning('Git工作区不干净，有未提交的更改');
      const prompt = createPrompt();
      const answer = await prompt.question('是否继续发布? (y/N): ');
      prompt.close();

      if (answer.toLowerCase() !== 'y') {
        logInfo('发布已取消');
        return;
      }
    }

    // 2. 确定版本类型
    const versionType = process.argv[2] || 'patch';

    // 3. 更新版本号
    const newVersion = await updateVersion(versionType);

    // 4. 更新相关文件中的版本号
    updateRendererVersion(newVersion);
    updateConfigServiceVersion(newVersion);

    // 5. 构建应用
    buildApp();

    // 6. Git提交和标签
    createGitTag(newVersion);

    // 7. 完成
    logSuccess(`🎉 发布 v${newVersion} 成功!`);
  } catch (error) {
    logError('发布过程中出错');
    console.error(error);
    process.exit(1);
  }
}

main();
