/**
 * 依赖审计和更新脚本
 * 用于检查项目中的依赖是否有安全漏洞，以及是否有可用的更新
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);
const rootDir = path.resolve(__dirname, '../');
const packagePaths = [
  path.join(rootDir, 'package.json'),
  path.join(rootDir, 'renderer', 'package.json')
];

// 颜色输出辅助函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * 执行安全审计
 */
async function runSecurityAudit(packagePath) {
  const packageDir = path.dirname(packagePath);
  const packageName = path.basename(packageDir) || 'root';
  
  console.log(`${colors.blue}正在为 ${packageName} 项目执行依赖安全审计...${colors.reset}`);
  
  try {
    const { stdout } = await execPromise('pnpm audit', { cwd: packageDir });
    console.log(`${colors.green}[${packageName}] 安全审计完成:${colors.reset}`);
    console.log(stdout);
  } catch (error) {
    // pnpm audit 发现漏洞时会返回非零退出码
    console.log(`${colors.yellow}[${packageName}] 安全审计发现问题:${colors.reset}`);
    console.log(error.stdout);
  }
}

/**
 * 检查过时依赖
 */
async function checkOutdatedDeps(packagePath) {
  const packageDir = path.dirname(packagePath);
  const packageName = path.basename(packageDir) || 'root';
  
  console.log(`${colors.blue}正在为 ${packageName} 项目检查过时依赖...${colors.reset}`);
  
  try {
    const { stdout } = await execPromise('pnpm outdated', { cwd: packageDir });
    if (stdout.trim()) {
      console.log(`${colors.yellow}[${packageName}] 发现过时的依赖:${colors.reset}`);
      console.log(stdout);
    } else {
      console.log(`${colors.green}[${packageName}] 所有依赖已是最新版本${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}[${packageName}] 检查过时依赖时出错:${colors.reset}`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(`${colors.blue}===== 开始依赖审计和更新检查 =====${colors.reset}`);
  
  for (const packagePath of packagePaths) {
    if (fs.existsSync(packagePath)) {
      await runSecurityAudit(packagePath);
      await checkOutdatedDeps(packagePath);
      console.log('\n');
    } else {
      console.log(`${colors.red}找不到 package.json 文件: ${packagePath}${colors.reset}`);
    }
  }
  
  console.log(`${colors.blue}===== 依赖审计和更新检查完成 =====${colors.reset}`);
}

main().catch(error => {
  console.error(`${colors.red}执行过程中出错:${colors.reset}`, error);
  process.exit(1);
}); 