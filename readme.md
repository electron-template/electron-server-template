一个将前端,后端,electron打包,完全抽离的electron模板,
给开发者0electron体验,构建部分全部提到外层,由框架维护,
方便前后端分离开发,

# 问题
目前打包后,服务未随着electron应用启动而启动
# 目录架构
```
node_modules
build            准备用来打包的文件,文件编译后的目录
    main 
    server        
    renderer
electron         electron入口和预加载文件
```