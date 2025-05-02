#!/usr/bin/env node

/**
 * 构建后清理脚本
 * 用于移除不必要的文件，减小安装包体积
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

/**
 * 递归删除目录下符合模式的文件
 * @param {string} dir 目录路径
 * @param {RegExp} pattern 匹配模式
 * @returns {number} 删除的文件数量
 */
function removeFiles(dir, pattern) {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  let count = 0;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      count += removeFiles(itemPath, pattern);
    } else if (pattern.test(item)) {
      fs.unlinkSync(itemPath);
      count++;
    }
  }

  return count;
}

/**
 * 递归删除空目录
 * @param {string} dir 目录路径
 * @returns {number} 删除的目录数量
 */
function removeEmptyDirs(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  let count = 0;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      count += removeEmptyDirs(itemPath);

      // 检查目录是否为空
      if (fs.readdirSync(itemPath).length === 0) {
        fs.rmdirSync(itemPath);
        count++;
      }
    }
  }

  return count;
}

// 主函数
async function main() {
  try {
    log('🧹 开始构建清理过程', colors.bright + colors.cyan);

    // 获取输出目录
    const buildDir = path.resolve(process.cwd(), 'dist');

    if (!fs.existsSync(buildDir)) {
      logWarning(`构建目录 ${buildDir} 不存在，跳过清理`);
      return;
    }

    logInfo(`清理构建目录: ${buildDir}`);

    // 1. 删除调试文件
    const debugFilesCount = removeFiles(
      buildDir,
      /\.(pdb|map|ilk|exp|lib|obj)$/i,
    );
    logInfo(`删除了 ${debugFilesCount} 个调试文件`);

    // 2. 删除文档和不必要的文件
    const docFilesCount = removeFiles(
      buildDir,
      /\.(md|markdown|txt|log|yml|yaml)$/i,
    );
    logInfo(`删除了 ${docFilesCount} 个文档文件`);

    // 3. 清理空目录
    const emptyDirsCount = removeEmptyDirs(buildDir);
    logInfo(`删除了 ${emptyDirsCount} 个空目录`);

    // 4. 压缩JS文件 (可选)
    // TODO: 添加JS压缩逻辑, 需要安装terser或其他压缩工具

    logSuccess('🎉 构建清理完成!');
  } catch (error) {
    logError('构建清理过程中出错');
    console.error(error);
    process.exit(1);
  }
}

main();
