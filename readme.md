一个将前端,后端,electron打包,完全抽离的electron模板,
给开发者0electron体验,构建部分全部提到外层,由框架维护,
方便前后端分离开发,

# 问题
目前服务,页面已经正常启动,server端未能完全分离,依赖未能打包进来,需要优化

# 启动项目


# 目录架构
```
node_modules
build            准备用来打包的文件,文件编译后的目录
    main         electron主文件
    server       服务端文件
    renderer     前端文件

scripts         执行命令的脚本,可以自己手动执行
electron        electron相关脚本和预加载文件
renderer        前端页面
server          后端服务

```