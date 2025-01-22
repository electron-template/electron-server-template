#!/bin/bash
echo "$(tput setaf 4)正在更新electron-server-template项目... $(tput setaf 3)"
# 切换到主分支
git checkout main
# 拉取主分支的最新更改
git pull

echo "$(tput setaf 4)正在下载依赖... $(tput setaf 3)"
pnpm install

# 初始化子模块的配置文件
echo "$(tput setaf 4)正在初始化子模块中... $(tput setaf 3)"
git submodule init

# 同步子模块的远程URL和分支信息（如果需要的话，这一步通常不是必需的，除非远程仓库的URL或分支发生了变化）
echo "$(tput setaf 4)正在同步子模块到.git/config中... $(tput setaf 3)"
git submodule sync

# 更新子模块到其远程跟踪分支的最新提交（使用 --rebase 可以避免合并提交，保持历史干净）
# 注意：这里使用了 --rebase，但您也可以根据需要选择 --merge
echo "$(tput setaf 4)正在更新子模块... $(tput setaf 3)"
git submodule update --remote --rebase

echo "$(tput setaf 4)正在拉取子模块... $(tput setaf 3)"
git submodule foreach "git pull && pnpm install"

echo "$(tput setaf 2)子模块拉取下载完毕"
