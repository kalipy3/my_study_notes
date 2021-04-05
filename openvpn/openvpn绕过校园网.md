```
openvpn绕过校园网.md

仅供学习，请勿用于非法用途!!

:Author: kalipy
:Email: kalipy@debian
:Date: 2021-04-04 21:43
```

### 必要条件

* 需要一台有公网ip的服务器
* 服务器上安装openvpn服务

### 绕过原理

* 当我们连接上某个需要web认证的热点或校园网时，网关会对http/https响应报文进行劫持并篡改302重定向到web认证或充值页面。
* 网关默认都放行dhcp(用于分配ip)和dns(用于劫持用户数据报)

### 寻找校园网的可用端口

#### 安装nslookup命令所需要的包

    //debian/ubuntu下
    sudo apt-get install dnsutils

#### 查看校园网是否开放53端口

    kalipy@debian ~/b/m/openvpn> nslookup baidu.com
    Server:         223.5.5.5
    Address:        223.5.5.5#53
    
    Non-authoritative answer:
    Name:   baidu.com
    Address: 39.156.69.79
    Name:   baidu.com
    Address: 220.181.38.148

说明:

* 如果服务器一栏不是`unknown`,说明开放了53端口
* 如果没开放53端口也不要担心，大部分校园网开放了另一个端口，即67端口

### 安装openvpn服务

#### 下载openvpn

    yum install git -y

    git clone https://github.com/angristan/openvpn-install

    cd openvpn

#### 安装openvpn

    ./openvpn-install.sh

#### 说明

* custom那一栏填53端口或67端口
* 选择UDP协议
* 其它的配置默认就好

#### 使用

安装成功后，会在/root下生成文件`xxx.ovpn`，把云服务器生成的`xxx.ovpn`下载到本地电脑或手机

##### win下

去下载openvpn的客户端程序，即`openvpn gui`

把xxx.ovpn复制到openvpn gui的config目录下

启动openvpn gui程序

输入云服务器的公网ip连接openvpn服务端

##### linux下

    //说明: 默认会安装openvpn server和openvpn client
    sudo apt-get install openvpn

把xxx.ovpn复制到当前目录下

    //使用命令行openvpn client连接公网服务器上的openvpn服务端
    sudo openvpn --config xxx.ovpn

##### 安卓手机下

下载openvpn.apk

把xxx.ovpn导入到设置

点击启动

##### test

退出校园网账号，我们发现不用登录也可以使用校园网了，不限速，23:00不断网！！

### 可能会有不能上网的问题

解决(在云服务器端操作):

需要将`ip forward`打开,不要用`echo 1 > /proc/sys/net/ipv4/ip_forward`的方式, 这种方式重启后无效. 先查看一下:

    sysctl -a | grep for 
    #查看结果: 
    net.ipv4.conf.tun0.mc_forwarding = 0 
    net.ipv4.conf.tun0.forwarding = 1 
    net.ipv4.conf.eth0.mc_forwarding = 0 
    net.ipv4.conf.eth0.forwarding = 1 
    net.ipv4.conf.lo.mc_forwarding = 0 
    net.ipv4.conf.lo.forwarding = 1 
    net.ipv4.conf.default.mc_forwarding = 0 
    net.ipv4.conf.default.forwarding = 1 
    net.ipv4.conf.all.mc_forwarding = 0 
    net.ipv4.conf.all.forwarding = 1 
    net.ipv4.ip_forward = 1

如果你的主机上列数值不是为1, 则要将其改成1

    sysctl -w net.ipv4.ip_forward=1
