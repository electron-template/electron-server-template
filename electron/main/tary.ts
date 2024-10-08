// 存放托盘相关代码
import { app, Menu, Tray } from 'electron'
import path from 'path'

export default createTray;
const iconPath = path.join(__dirname, '../static/icon/icon.png')

function createTray () {
  app.setAsDefaultProtocolClient('插件');
  const iconTary = new Tray(iconPath)
  const contextMenu = Menu.buildFromTemplate([
                                               {
                                                 label: '重启',
                                                 click: () => {
                                                   app.relaunch()
                                                   app.exit(0)
                                                 },
                                               },
                                               {
                                                 label: '退出',
                                                 click: () => {
                                                   app.quit()
                                                 },
                                               },
                                             ])
  iconTary.setToolTip(`我是electron`)
  iconTary.setContextMenu(contextMenu)
}