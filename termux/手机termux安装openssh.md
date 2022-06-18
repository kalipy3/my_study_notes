    手机termux安装openssh.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2022-06-17 15:06

### 安装

    pkg install openssh

### 启动sshd

    sshd

### 配置

    将pc机的公钥id_rsa.pub的内容拷贝到Termux中的 ~/.ssh/authorized_keys

### termux上查看手机的用户名

    whoami

### pc机连接手机termux

    ssh username@ip -p 8022
