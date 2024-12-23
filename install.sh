#!/bin/bash
echo "$(tput setaf 4)正在初始化electron项目... $(tput setaf 3)"
git checkout main && git pull
pnpm install

echo "$(tput setaf 4)正在初始化子模块中... $(tput setaf 3)"
git submodule init
git submodule update

echo "$(tput setaf 4)正在初始化renderer项目... $(tput setaf 3)"
cd renderer
git checkout main && git pull
pnpm install
cd ..