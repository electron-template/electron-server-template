import { app, Menu, Tray, BrowserWindow } from 'electron';
import path from 'path';
import { TrayMenuItem } from '../modules/types';

/**
 * 创建托盘图标和菜单
 * @param options 自定义选项
 * @returns 托盘实例
 */
export default function createTray(options?: {
  iconPath?: string;
  tooltip?: string;
  additionalMenuItems?: TrayMenuItem[];
}): Tray {
  // 设置默认值
  const iconPath =
    options?.iconPath || path.join(__dirname, '../../static/icon/icon.png');
  const tooltip = options?.tooltip || app.getName();

  // 注册自定义协议
  app.setAsDefaultProtocolClient(app.getName().toLowerCase());

  // 创建托盘实例
  const tray = new Tray(iconPath);

  // 默认菜单项
  const defaultMenuItems: TrayMenuItem[] = [
    {
      label: '重启应用',
      click: () => {
        app.relaunch();
        app.exit(0);
      },
    },
    {
      label: '退出应用',
      click: () => {
        app.quit();
      },
    },
  ];

  // 合并额外的菜单项
  const menuItems = options?.additionalMenuItems
    ? [...options.additionalMenuItems, ...defaultMenuItems]
    : defaultMenuItems;

  // 创建菜单
  const contextMenu = Menu.buildFromTemplate(menuItems);

  // 设置托盘属性
  tray.setToolTip(tooltip);
  tray.setContextMenu(contextMenu);

  // 在Windows上，点击托盘图标显示/隐藏应用
  if (process.platform === 'win32') {
    tray.on('click', () => {
      const windows = BrowserWindow.getAllWindows();
      if (windows.length > 0) {
        const mainWindow = windows[0];
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
  }

  return tray;
}
