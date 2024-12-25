# 问题
打包后服务无法请求(由于mime包导致,下载mime: 1.6.0解决)

# 启动项目
pnpm installAll
pnpm dev

# 目录架构
```
node_modules
build            准备用来打包的文件,文件编译后的目录
    electron     electron主文件
    server       服务端文件
    renderer     前端文件

scripts         执行命令的脚本,可以自己手动执行
electron        electron相关脚本和预加载文件
renderer        前端页面
server          后端服务

```