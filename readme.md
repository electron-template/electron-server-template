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

# 项目结构
```js
├── server/  
│   ├── app.module.ts          # 根模块文件  
│   ├── main.ts                # 应用程序入口文件  
│   ├── config/                # 配置文件目录（如数据库配置、环境变量等）  
│   │   └── ...  
│   ├── core/                  # 核心功能模块，如认证、授权、全局守卫等  
│   │   ├── auth/  
│   │   │   ├── auth.module.ts  
│   │   │   ├── auth.service.ts  
│   │   │   ├── auth.controller.ts  
│   │   │   └── ...  
│   │   └── ...  
│   ├── shared/                # 共享功能模块或库，如DTOs、服务、工具类等  
│   │   ├── dto/  
│   │   ├── services/  
│   │   ├── utils/  
│   │   └── ...  
│   ├── modules/               # 业务功能模块，如用户管理、订单处理等  
│   │   ├── users/  
│   │   │   ├── users.module.ts  
│   │   │   ├── users.service.ts  
│   │   │   ├── users.controller.ts  
│   │   │   ├── users.gateway.ts（如果使用WebSocket）  
│   │   │   ├── entities/       # 数据库实体或模型  
│   │   │   │   └── user.entity.ts  
│   │   │   └── ...  
│   │   ├── orders/  
│   │   │   └── ...  
│   │   └── ...  
│   └── ...  
├── tests/                     # 测试文件目录  
│   ├── app.e2e-spec.ts        # 端到端测试  
│   ├── jest-e2e.json          # 端到端测试配置  
│   ├── ...                    # 其他测试文件或配置  
├── .gitignore                 # Git 忽略文件  
├── package.json               # 项目依赖和脚本  
├── tsconfig.json              # TypeScript 配置  
├── nest-cli.json              # Nest CLI 配置  
└── README.md                  # 项目说明文档
```