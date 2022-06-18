    haruka-bot推送的消息文字乱码.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2022-06-18 21:34

### 用chrome浏览器中文显示全是方框

    sudo apt-get install language-pack-zh-hans
    sudo apt-get install ttf-wqy-microhei  #文泉驿-微米黑
    sudo apt-get install ttf-wqy-zenhei  #文泉驿-正黑
    sudo apt-get install xfonts-wqy #文泉驿-点阵宋体*
    sudo locale-gen

###  修改环境文件

    vim /etc/profile
    LANG="zh_CN.UTF-8"

### 重启
