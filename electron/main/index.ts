/*
 * @Author: moluoxixi 1983531544@qq.com
 * @Date: 2025-04-21 19:38:05
 * @LastEditors: moluoxixi 1983531544@qq.com
 * @LastEditTime: 2025-04-21 20:00:53
 * @FilePath: \electron-server-template\electron\main\index.ts
 * @Description:
 *
 * Copyright (c) 2025 by ${git_name_email}, All Rights Reserved.
 */
import { app } from 'electron';
import {
  setupPerformance,
  setupGarbageCollection,
  cleanupResources,
} from './modules/performance';
import { setupSecurityPolicies } from './modules/security';
import { ensureSingleInstance, setupAppLifecycle } from './modules/lifecycle';
import { ServerStopHandler } from './modules/types';
import createTray from './ui/tray';
import createWindow, { setupWindowHandlers } from './ui/window';
import createRequest from './api/request';
import createServer from './api/server';
import Chalk from 'chalk';

/**
 * 应用启动类
 * 集中管理应用的初始化和生命周期
 */
class ElectronApp {
  private stopServerHandler: ServerStopHandler | undefined;

  /**
   * 构造函数
   */
  constructor() {
    // 确保只有一个实例运行
    if (!ensureSingleInstance()) {
      return;
    }

    // 初始化应用
    this.initialize();
  }

  /**
   * 初始化应用
   */
  private initialize(): void {
    // 设置应用性能优化
    setupPerformance();

    // 设置窗口处理程序
    setupWindowHandlers();

    // 启动应用
    this.startApp();
  }

  /**
   * 启动应用
   */
  private startApp(): void {
    // 等待应用就绪后启动
    app.whenReady().then(async () => {
      try {
        await this.startServices();
        await this.createUI();
      } catch (error) {
        console.error('应用启动失败:', error);
        app.quit();
      }
    });

    // 设置应用生命周期
    setupAppLifecycle(async () => {
      await this.stopServerHandler?.();
      cleanupResources();
    });

    // 设置定期垃圾回收
    setupGarbageCollection();
  }

  /**
   * 启动底层服务
   */
  private async startServices(): Promise<void> {
    // 并行初始化各个服务模块
    const initPromises = [];

    // 1. 创建托盘图标
    initPromises.push(
      Promise.resolve(
        createTray({
          tooltip: '电子服务器模板',
        }),
      ),
    );

    // 2. 设置请求处理
    initPromises.push(Promise.resolve(createRequest()));

    // 3. 启动服务器
    const serverPromise = createServer().then((handler) => {
      this.stopServerHandler = handler;
      return handler;
    });
    initPromises.push(serverPromise);

    // 等待关键初始化完成
    await Promise.all(initPromises);

    // 4. 设置安全策略
    setupSecurityPolicies();
  }

  /**
   * 创建用户界面
   */
  private async createUI(): Promise<void> {
    try {
      // 创建主窗口
      const mainWindow = await createWindow({
        width: 1024,
        height: 768,
        backgroundColor: '#f5f5f5',
        showOnReady: true,
        title: app.getName(),
      });

      // 窗口创建成功后的操作
      console.log('应用启动成功');
    } catch (error) {
      console.error('创建窗口失败:', error);
      throw error;
    }
  }
}

// 启动应用
new ElectronApp();

// 当窗口全部关闭时,退出electron应用,关闭进程
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
