    安卓手机安装termux.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2022-06-17 15:11

### 去github下载最新版termux

wget https://github.com/termux/termux-app/releases/download/v0.118.0/termux-app_v0.118.0+github-debug_arm64-v8a.apk

### 安装

是个人都会，省略

### 换清华源

    sed -i 's@^\(deb.*stable main\)$@#\1\ndeb https://mirrors.tuna.tsinghua.edu.cn/termux/apt/termux-main stable main@' $PREFIX/etc/apt/sources.list

### 更新软件包

    apt update && apt upgrade
