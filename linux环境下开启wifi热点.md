```
:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-12 18:45
```

### Linux环境下开启wifi热点

1. 安装create_ap
```
git clone https://github.com/oblique/create_ap
cd create_ap
sudo make install
```

2. 此程序依赖hostapd,iptables,dnsmasq，如果没有安装，请先安装
```
sudo apt-get install hostapd iptables dnsmasq
```

3. 如果你的无线网卡名是wlan0,有线网卡名是eth0,你想创建的热点是myhost,密码是12345678
```
    sudo create_ap wlan0 eth0 myhost 12345678 #开启热点但是依赖终端，和下条命令二选其一
    sudo nohup create_ap wlan0 eth0 myhost 12345678 &  #开启热点并后台运行，可以关闭终端
```

4. 如何卸载
```
make uninstall
```
