```
debian10上用qemu运行alpine系统编译linux0.11源码.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-09 20:36
```

首先，安装alpine系统很简单，随便装，关键是qemu的网络实在不好配置,网上的所谓用网桥桥接的方法，基本只是针对于ubuntu上有用，而且教程都是一些复制粘贴的老版本qemu的教程(特别是嵌入式uboot的教程，基本只有在ubuntu上qemu才可以成功联网)

### qemu在其它linux系统上的通用最快(最好?也许,毕竟docker是个好东西)配置方法

1. 安装docker
    ```
    sudo apt-get install docker.io

    sudo systemctl start docker//或sudo service docker start
    ```

2. 查看docker服务起来没有
    ```
    kalipy@debian ~/桌/Linux-0.11-master> sudo ifconfig 
    docker0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
    inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
    inet6 fe80::42:fbff:fe47:5334  prefixlen 64  scopeid 0x20<link>
    ether 02:42:fb:47:53:34  txqueuelen 0  (Ethernet)
    RX packets 26173  bytes 15153270 (14.4 MiB)
    RX errors 0  dropped 0  overruns 0  frame 0
    TX packets 43692  bytes 83159527 (79.3 MiB)
    TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

    ```

3. 创建tap0
    ```
    sudo tunctl -t tap0

    sudo ifconfig tap0 up
    ```

4. 将tap0挂到docker0上去
    ```
    sudo brctl addif docker0 tap0
    ```

5. 查看是否挂上去了
    ```
    sudo brctl show
    ```

6. ok,接下来安装alpine

---------------------------------------

### 安装alpine

1. 下载
    ```
    http://dl-cdn.alpinelinux.org/alpine/v3.10/releases/x86_64/alpine-virt-3.10.1-x86_64.iso
    ```

2. 创建虚拟镜像(硬盘)
    ```
    qemu-img create -f qcow2 virt-alpine.img 5g

    ```

3. 带上刚才配置的网络参数用qemu启动alpine镜像文件
    ```
    sudo qemu-system-x86_64 -net nic -net tap,ifname=tap0,script=no,downscript=no -hda virt-alpine.img -cdrom alpine-virt-3.10.1-x86_64.iso -boot d -m 512 -nographic
    ```

4. 进到alpine系统后,将nameserver 8.8.8.8写入(alpine上的/etc/resolv.conf)
    ```
    vi /etc/resolv.conf

    nameserver 8.8.8.8
    ```

5. alpine上，执行
```
ifconfig eth0 127.17.0.222
```

6. 上面的ip地址怎么来的，在宿主机上，执行sudo ifconfig,只要和docker0这个路由器在同一个网络即可，随便填(但是一定要在同一个网络内，即前缀172.17要和docker0相同)
    ```
    kalipy@debian ~> sudo ifconfig
    docker0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
            inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
            inet6 fe80::42:fbff:fe47:5334  prefixlen 64  scopeid 0x20<link>
            ether 02:42:fb:47:53:34  txqueuelen 0  (Ethernet)
            RX packets 26174  bytes 15153326 (14.4 MiB)
            RX errors 0  dropped 0  overruns 0  frame 0
            TX packets 43724  bytes 83166343 (79.3 MiB)
            TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
    
    ```

7. alpine上，执行
    ```
    route add default gw 172.17.0.1 //即docker0的网关，也即docker0的ip
    ```

8. alpine上,执行
    ```
    ping www.baidu.com
    ```

9. 成功，再宿主机和alpine互相ping,都是可以成功通信的,接下来安装alpine(别忘了，刚才只是相当于进了alpine.iso,我的还要把它安装到alpine.img这个虚拟硬盘上去，请想象我们平时真机安装系统的步骤)

10. alpine上，执行setup-alpine安装alpine
    ```
    setup-alpine

    ```

11. 配置
    ```
    Select keyboard layout: cn (选择CN键盘布局)
    Select variant (cn)
    Enter system hostname: stageguard (输入hostname名称，随意)
    Which one do you want to initialize? (or '?' or 'done') [eth0]
    Ip address for eth0? (or 'dhcp', 'none', '?') [10.0.2.15] dhcp (选dhcp)
    Changing password for root (修改root用户密码)
    Which timezone are you in? ('?' for list) [UTC] Asia/Shanghai (时区填Asia/Shanghai)
    HTTP/FTP proxy URL? (e.g. 'http://proxy:8080', or 'none') [none] (代理地址，默认none)
    Enter mirror number (1-47) or URL to add (or r/f/e/done) [f]: 21 (选择软件源，21(清华源))
    Which SSH server? ('openssh', 'dropbear' or 'none') [openssh] (SSH服务器，选择openssh(默认))
    Which disk(s) would you like to use? (or '?' for help or 'none') [none]sda (安装在何处，选sda)
    How would you like to use it? ('sys', 'data', 'lvm' or '?' for help) [?] sys (安装方式，选sys)
    WARNING: Erase the above disk(s) and continue? [y/N]: y (清除整个硬盘，y(是))
    ```

12. 按照步骤11的配置安装,安装完成后，关闭alpine
    ```
    poweroff
    ```

13. 现在可以用qemu启动alpine.img了
    ```
    kalipy@debian ~/下载> sudo qemu-system-x86_64 -net nic -net tap,ifname=tap0,script=no,downscript=no -hda virt-alpine.img -boot c -m 512 -nographic
    ```


### 进阶

1. 如果你要在qemu上的alpine上又运行一个docker,为了不和宿主机的docker冲突，只要
    ```
    vim /etc/docker/daemon.json

    //改默认的配置
    "bip": 192.168.43.xxx

    ```

2. 这样宿主机的docker启动之后，docker0的地址就会变为192.168.43.xxx,就不会和qemu上的虚拟机(alpine)的docker冲突了

3. 完~
