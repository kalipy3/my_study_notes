qemu_xml用不了笔记本无线网卡的br0解决.md

    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2023-02-12 16:53

### 现象

配置netplan网络：

```
[I] kalipy@debian /m/k/k/xxx> sudo cat /etc/netplan/00-installer-config.yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp9s0:
      dhcp4: yes
    wlp8s0:
      dhcp4: yes
  bridges:
    br0:
      interfaces:
        - wlp8s0
      addresses: [192.168.0.123/24]
      nameservers:
          addresses: [223.5.5.5, 114.114.114.114]
```

让netplan配置生效：

```
[I] kalipy@debian /m/k/k/xxx> sudo netplan apply
[I] kalipy@debian /m/k/k/xxx> ip addr
3: br0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 20:1a:06:8b:65:41 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.123/24 brd 192.168.0.255 scope global br0
       valid_lft forever preferred_lft forever
    inet6 fe80::70b4:4ff:fea5:13d8/64 scope link 
       valid_lft forever preferred_lft forever
```

查看br0是否被加到`wlp8s0`这个interface下，发现居然没加上：

```
[I] kalipy@debian /m/k/k/xxx> sudo brctl show
bridge name     bridge id               STP enabled     interfaces
br0             8000.201a068b6541       no              
```

这是为什么呢？我们用命令手动加一下，发现操作不允许：

```
[I] kalipy@debian /m/k/k/xxx> sudo brctl addif br0 wlp8s0
can't add wlp8s0 to bridge br0: Operation not supporte
```

我百度网上说是无线网卡不支持混杂模式，而br必须要支持混杂，不过我感觉也是错的，因为：

```
[I] kalipy@debian /m/k/k/xxx> sudo ifconfig br0 promisc
[I] kalipy@debian /m/k/k/xxx> sudo brctl addif br0 wlp8s0
can't add wlp8s0 to bridge br0: Operation not supported
```

百度网上还说是无线网卡要关闭wifi的密码，然而我尝试了，还是一样不行。

---

### 方法一(如果不是用的无线网卡作为br网络，而是用有线网卡作为br网卡，方法一是完全ok的)

br0没被成功加到interface上，我们启动xx.qcow2试下，xml网络配置如下：

```
    <interface type='bridge'>
      <source bridge='br0'/>
      <model type='e1000'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x0a' function='0x0'/>
    </interface>
```

我们启动xx.qcow2，发现没有ip地址，宿主机和虚拟机之间网络完全ping不通:

![Image](./img/image_2023-02-12-17-09-39.png)

查看宿主机br网络如下:

```
3: br0: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 20:1a:06:8b:65:41 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.123/24 brd 192.168.0.255 scope global br0
       valid_lft forever preferred_lft forever
    inet6 fe80::70b4:4ff:fea5:13d8/64 scope link 
       valid_lft forever preferred_lft forever
4: wlp8s0: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether b8:ee:65:7b:b3:05 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.115/24 brd 192.168.0.255 scope global dynamic wlp8s0
       valid_lft 85609sec preferred_lft 85609sec
    inet6 fe80::baee:65ff:fe7b:b305/64 scope link 
       valid_lft forever preferred_lft forever
```

我们给虚拟机配置一个和宿主机br0相同网段的ip，发现现在虚拟机可以ping通宿主机了:

![Image](./img/image_2023-02-12-17-12-26.png)

宿主机也可以ping同虚拟机了：

```
[I] kalipy@debian ~/bb> ping 192.168.0.125
PING 192.168.0.125 (192.168.0.125) 56(84) bytes of data.
64 bytes from 192.168.0.125: icmp_seq=1 ttl=64 time=30.0 ms
64 bytes from 192.168.0.125: icmp_seq=2 ttl=64 time=0.434 ms
```

然而虚拟机还是不能ping通`www.baidu.com`(改/etc/resovl.conf文件也没用，原因是无线网卡的问题，无线网卡只要起了br网络，连在host宿主机上都ping不通192.168.0.1这个网关了，还玩个锤子！！)：

![Image](./img/image_2023-02-12-17-15-59.png)

### 用docker0作为虚拟机网桥试试(csm/centos 非netplan /etc/sysconfig/xx/为dhcp)

xml配置如下：

```
    <interface type='bridge'>
      <source bridge='docker0'/>
      <model type='e1000'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x0a' function='0x0'/>
    </interface>
```

宿主机网络如下：

```
[I] kalipy@debian /m/k/k/xxx> ip addr
91263: docker0: <BROADCAST,MULTICAST,PROMISC,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:3e:04:46:22 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:3eff:fe04:4622/64 scope link 
       valid_lft forever preferred_lft forever
91278: tap0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast master docker0 state DOWN group default qlen 1000
    link/ether 4a:c9:b9:99:0b:4c brd ff:ff:ff:ff:ff:ff
[I] kalipy@debian /m/k/k/xxx> sudo brctl show
bridge name     bridge id               STP enabled     interfaces
docker0         8000.02423e044622       no              tap0
```

启动虚拟机进入，发现还是没ip，宿主机和虚拟机互相ping不通：

![Image](./img/image_2023-02-12-17-21-31.png)

我们给虚拟机配置一个和宿主机docker0相同网段的ip，发现现在虚拟机可以ping通宿主机了

然而虚拟机还是不能ping通`www.baidu.com`(改/etc/resovl.conf文件也没用)

#### ubuntu在netplan下(无论netplan是dhcp还是非dhcp)，或者卸载了netplan情况下，都是：

host和qemu可以互通，可以Ping通baidu

### 笔记本无线网卡到底怎么让qemu虚拟机可以使用br呢？(csm/centos dhcp情况下)

我们使用qemu自带的default网络来创建br，执行如下命令编辑配置文件:

```
[I] kalipy@debian /m/k/k/xxx> sudo virsh --connect qemu:///system net-edit default
```

修改为如下内容(host中的ip会被传递给虚拟机，xx.qcow2的ip届时就会是这个ip地址)：

```
<network>
  <name>default</name>
  <uuid>eaf744a1-080c-4b56-b4f6-3b94b3cc19bf</uuid>
  <forward mode='nat'/>
  <bridge name='virbr0' stp='on' delay='0'/>
  <mac address='52:54:00:9e:d7:0c'/>
  <ip address='192.168.122.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.122.2' end='192.168.122.254'/>
      <host name='xx' ip='192.168.122.253'/>
    </dhcp>
  </ip>
</network>
```

启动刚才配置的br网络:

```
[I] kalipy@debian /m/k/k/xxx> sudo virsh --connect qemu:///system net-destroy default
[I] kalipy@debian /m/k/k/xxx> sudo virsh --connect qemu:///system net-start default
```

查看宿主机网络，发现多了一个virbr0和一个virbr0-nic:

```
I] kalipy@debian /m/k/k/xxx> ip addr
91944: virbr0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:9e:d7:0c brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
91945: virbr0-nic: <BROADCAST,MULTICAST> mtu 1500 qdisc pfifo_fast master virbr0 state DOWN group default qlen 1000
    link/ether 52:54:00:9e:d7:0c brd ff:ff:ff:ff:ff:ff
[I] kalipy@debian /m/k/k/xxx> sudo brctl show
bridge name     bridge id               STP enabled     interfaces
virbr0          8000.5254009ed70c       yes             virbr0-nic
```

xml配置如下：

```
    <interface type='bridge'>
      <source bridge='virbr0'/>
      <model type='e1000'/>
      <address type='pci' domain='0x0000' bus='0x00' slot='0x0a' function='0x0'/>
    </interface>
```

启动虚拟机：

```
I] kalipy@debian /m/k/k/xxx> sudo virsh undefine csm
Domain csm has been undefined

[I] kalipy@debian /m/k/k/xxx> sudo virsh define csm.xml
Domain csm defined from csm.xml

[I] kalipy@debian /m/k/k/xxx> sudo virsh start csm
Domain csm started
```

ok，现在虚拟机网络一切正常，可以ping通百度和宿主机：

![Image](./img/image_2023-02-12-17-34-28.png)

宿主机也可以ping同虚拟机：

```
[I] kalipy@debian /m/k/k/xxx> ping 192.168.122.17
PING 192.168.122.17 (192.168.122.17) 56(84) bytes of data.
64 bytes from 192.168.122.17: icmp_seq=1 ttl=64 time=0.364 ms
64 bytes from 192.168.122.17: icmp_seq=2 ttl=64 time=0.280 ms
```

发现问题，为什么虚拟机的ip不是我们配置的`<host name='xx' ip='192.168.122.253'/>`：

答：我看了下xxx.qcow2的`/etc/sysconfig/network-scripts/ifcfg-eth0`中用的也是dhcp啊，按道理由qemu的virbr0分配ip，把`<host name='xx' ip='192.168.122.253'/>`改为`<host name='csm' ip='192.168.122.253'/>`，然后reboot csm也还是不行

解决：

```
sudo virsh net-destroy default
sudo virsh net-edit default
#这里host name一定要是csm
<host name='csm' ip='192.168.122.253'/>
#这里一定要destroy/start重启csm，不能在csm的vnc中reboot，不然csm ip也不生效
sudo virsh destroy csm
sudo virsh start csm
```

### 方法三(csm/centos dhcp环境下)

使用isc-dhcp-server，我在笔记本上用netplan的无线网卡的br0试了下，发现csm是可以正常从isc-dhcpserver获取到ip的，host和csm之间也可以互相Ping通，但是无线网卡不支持br，所有会导致host和csm都ping不通baidu这种外网。

### 方法四(推荐，ubuntu/netplan中dhcp:yes的情况下试的)

网络环境如下：

```
[I] kalipy@debian /m/k/k/q/arm_64> ip addr
3: wlp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 2a:fb:b6:a1:95:27 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.166/24 brd 192.168.0.255 scope global dynamic wlp8s0
       valid_lft 67611sec preferred_lft 67611sec
28953: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 02:42:43:74:e8:de brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:43ff:fe74:e8de/64 scope link 
       valid_lft forever preferred_lft forever
28956: tap0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc pfifo_fast master docker0 state DOWN group default qlen 1000
    link/ether c6:fc:41:50:9a:e1 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::c4fc:41ff:fe50:9ae1/64 scope link 
       valid_lft forever preferred_lft forever
```

配置dhcp:

```
[I] kalipy@debian /m/k/k/q/arm_64> sudo more /etc/default/isc-dhcp-server
INTERFACESv4="docker0"
INTERFACESv6=""
```

注意，这里的subnet和range要和接口`docker0`同网段，不然dhcp-server会启动失败

```
[I] kalipy@debian /m/k/k/q/arm_64> sudo more /etc/dhcp/dhcpd.conf
subnet 172.17.0.0 netmask 255.255.0.0 {
  range 172.17.0.2 172.17.0.253;
  option routers 172.17.0.1;
  default-lease-time 600;
  max-lease-time 7200;
}
```

启动dhcp:

```
[I] kalipy@debian /m/k/k/q/arm_64> sudo systemctl restart isc-dhcp-server.service
[I] kalipy@debian /m/k/k/q/arm_64> sudo systemctl status isc-dhcp-server.service
● isc-dhcp-server.service - LSB: DHCP server
   Loaded: loaded (/etc/init.d/isc-dhcp-server; generated)
   Active: active (running) since Sat 2023-02-18 22:16:07 CST; 2s ago
     Docs: man:systemd-sysv-generator(8)
  Process: 28728 ExecStart=/etc/init.d/isc-dhcp-server start (code=exited, status=0/SUCCESS)
    Tasks: 1 (limit: 4915)
   Memory: 6.9M
   CGroup: /system.slice/isc-dhcp-server.service
           └─28741 /usr/sbin/dhcpd -4 -q -cf /etc/dhcp/dhcpd.conf docker0

2月 18 22:16:05 debian systemd[1]: Starting LSB: DHCP server...
2月 18 22:16:05 debian isc-dhcp-server[28728]: Launching IPv4 server only.
2月 18 22:16:05 debian dhcpd[28741]: Wrote 2 leases to leases file.
2月 18 22:16:05 debian dhcpd[28741]: Server starting service.
2月 18 22:16:07 debian isc-dhcp-server[28728]: Starting ISC DHCPv4 server: dhcpd.
2月 18 22:16:07 debian systemd[1]: Started LSB: DHCP server.
```

尝试启动qemu:

```
[I] kalipy@debian /m/k/k/q/arm_64> sudo qemu-system-aarch64 -m 2048 -cpu cortex-a72 -smp 2 -M virt \
                                                                                            -bios QEMU_EFI.fd -nographic \
                                                                                            -drive if=none,file=debian10.qcow2,id=hd0 \
                                                                                            -device virtio-blk-device,drive=hd0 \
                                                                                            -device virtio-scsi-device \
                                                                                             -net nic -net tap,ifname=tap0,script=no,downscript=no
```

效果如下(重点是192.168.0.1这个网关居然都能访问了，百度也能访问了)：

```
root@debian:~# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global dynamic enp0s1
       valid_lft 568sec preferred_lft 568sec
    inet 172.17.0.3/16 brd 172.17.255.255 scope global secondary dynamic enp0s1
       valid_lft 579sec preferred_lft 579sec
    inet6 fe80::5054:ff:fe12:3456/64 scope link 
       valid_lft forever preferred_lft forever
root@debian:~# ping 192.168.0.1
PING 192.168.0.1 (192.168.0.1) 56(84) bytes of data.
64 bytes from 192.168.0.1: icmp_seq=1 ttl=63 time=3.45 ms
64 bytes from 192.168.0.1: icmp_seq=2 ttl=63 time=3.00 ms
^C
--- 192.168.0.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 5ms
rtt min/avg/max/mdev = 2.995/3.221/3.448/0.233 ms
root@debian:~# ping 172.17.0.1
PING 172.17.0.1 (172.17.0.1) 56(84) bytes of data.
64 bytes from 172.17.0.1: icmp_seq=1 ttl=64 time=0.797 ms
^C
--- 172.17.0.1 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.797/0.797/0.797/0.000 ms
root@debian:~# ping www.baidu.com
PING www.a.shifen.com (39.156.66.14) 56(84) bytes of data.
64 bytes from 39.156.66.14 (39.156.66.14): icmp_seq=1 ttl=52 time=8.22 ms
64 bytes from 39.156.66.14 (39.156.66.14): icmp_seq=2 ttl=52 time=12.2 ms
64 bytes from 39.156.66.14 (39.156.66.14): icmp_seq=3 ttl=52 time=8.64 ms
64 bytes from 39.156.66.14 (39.156.66.14): icmp_seq=4 ttl=52 time=8.38 ms
```

说明(如果baidu这种外网无法访问，请手动加入如下内容，其实只加个223.5.5.5即可)：

```
root@debian:~# more /etc/resolv.conf
domain example.org
search example.org
nameserver 172.17.0.1
nameserver 223.5.5.5
nameserver 192.168.0.1
```

虚拟机网络情况如下：

```
root@debian:~# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global dynamic enp0s1
       valid_lft 364sec preferred_lft 364sec
    inet 172.17.0.3/16 brd 172.17.255.255 scope global secondary dynamic enp0s1
       valid_lft 378sec preferred_lft 378sec
    inet6 fe80::5054:ff:fe12:3456/64 scope link 
       valid_lft forever preferred_lft forever
root@debian:~# ip route
default via 172.17.0.1 dev enp0s1 
default via 172.17.0.1 dev enp0s1 proto dhcp src 172.17.0.2 metric 100 
172.17.0.0/16 dev enp0s1 proto kernel scope link src 172.17.0.2 
172.17.0.1 dev enp0s1 proto dhcp scope link src 172.17.0.2 metric 100 
root@debian:~# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 enp0s1
0.0.0.0         172.17.0.1      0.0.0.0         UG    100    0        0 enp0s1
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 enp0s1
172.17.0.1      0.0.0.0         255.255.255.255 UH    100    0        0 enp0s1
```

dhcp后台打印如下：

```
[I] kalipy@debian /m/k/k/q/arm_64> sudo systemctl status isc-dhcp-server.service
● isc-dhcp-server.service - LSB: DHCP server
   Loaded: loaded (/etc/init.d/isc-dhcp-server; generated)
   Active: active (running) since Sat 2023-02-18 22:16:07 CST; 6min ago
     Docs: man:systemd-sysv-generator(8)
  Process: 28728 ExecStart=/etc/init.d/isc-dhcp-server start (code=exited, status=0/SUCCESS)
    Tasks: 1 (limit: 4915)
   Memory: 6.9M
   CGroup: /system.slice/isc-dhcp-server.service
           └─28741 /usr/sbin/dhcpd -4 -q -cf /etc/dhcp/dhcpd.conf docker0

2月 18 22:19:19 debian dhcpd[28741]: ns1.example.org: host unknown.
2月 18 22:19:19 debian dhcpd[28741]: ns2.example.org: host unknown.
2月 18 22:19:19 debian dhcpd[28741]: DHCPOFFER on 172.17.0.2 to 52:54:00:12:34:56 (debian) via docker0
2月 18 22:19:19 debian dhcpd[28741]: DHCPREQUEST for 172.17.0.2 (172.17.0.1) from 52:54:00:12:34:56 (debian) via docker0
2月 18 22:19:19 debian dhcpd[28741]: DHCPACK on 172.17.0.2 to 52:54:00:12:34:56 (debian) via docker0
2月 18 22:19:28 debian dhcpd[28741]: DHCPDISCOVER from 52:54:00:12:34:56 via docker0
2月 18 22:19:29 debian dhcpd[28741]: DHCPOFFER on 172.17.0.3 to 52:54:00:12:34:56 (debian) via docker0
2月 18 22:19:29 debian dhcpd[28741]: DHCPREQUEST for 172.17.0.3 (172.17.0.1) from 52:54:00:12:34:56 (debian) via docker0
2月 18 22:19:29 debian dhcpd[28741]: DHCPACK on 172.17.0.3 to 52:54:00:12:34:56 (debian) via docker0
2月 18 22:22:08 debian dhcpd[28741]: DHCPRELEASE of 172.17.0.3 from 52:54:00:12:34:56 (debian) via docker0 (found)
```

### 方法五(推荐)

1. 比如安卓手机无法root(你用termux安装了arm64_linux也是需要root才能操作systemctl和br的)，操作不了systemctl(即使用不了libvirtd)，操作不了br0(要root权限才行)，推荐这种方法

2. 而且我们安卓手机也无法安装dhcp-server

3. 可能行不通的方法：我们用nat模式给qemu虚拟机分配网络，进qemu虚拟机内执行`ifconfig ethx ip/mask up`手动给虚拟机修改为一个和host宿主机相同网段的ip，但是此时虚拟机无法ping通host宿主机的网关(也即家庭路由器)，自然就算配置了dns为233.5.5.5或网关，也无法访问baidu这种外网。但是我们在虚拟机内安装frr虚拟路由器即可，这个frr虚拟路由器连接了host宿主机和qemu虚拟机。

4. 大有可能行得通的方法：或者我们用nat模式给qemu虚拟机分配网络，此时进去qemu虚拟机，是可以访问baidu这种外网的，但是此时host宿主机和qemu虚拟机由于使用的nat模式，也不再同一网段，无法互通，我们通过在qemu虚拟机里安装frr虚拟路由器让host和qemu虚拟机互通。

#### 教程

待更新..

#### 方法五额外的用途

把无法root的安卓手机当clash的旁路网关用，这样其它设备所有流量都能走vpn了，请参考：

`https://blog.serenader.me/shi-yong-pve-yun-xing-clash-pang-lu-you-xu-ni-ji-shi-xian-tou-ming-dai-li`

### 方法六(试过，在termux安装不了)

在termux中安装dhcp或virt-manager，然后在termux中配置，启动好服务，然后进termux的linux系统，linux系统应该有termux中启动的服务，然后linux系统中用virsh或qemu命令行+dhcp启动arm64虚拟机。

---

### 注意qemu的user模式虽然host和qemu不通，但是apt-get能访问外网(tap模式则是apt-get和ping baidu都不通，host和qemu也不通，但是tap模式能够自动生成arp，user模式不能自动生成arp，当然，user模式和tap模式都不能生成路由表)


ping不通baidu.com，但是apt-get能访问外网：

```
root@debian:~# ping www.baidu.com
PING www.a.shifen.com (39.156.66.18) 56(84) bytes of data.
^C
--- www.a.shifen.com ping statistics ---
4 packets transmitted, 0 received, 100% packet loss, time 65ms

root@debian:~# apt-get update
Hit:1 http://mirrors.tuna.tsinghua.edu.cn/debian buster InRelease
Get:2 http://mirrors.tuna.tsinghua.edu.cn/debian buster-updates InRelease [56.6 kB]
Get:3 http://security.debian.org/debian-security buster/updates InRelease [34.8 kB]
Get:4 http://security.debian.org/debian-security buster/updates/main Sources [306 kB]
Get:5 http://security.debian.org/debian-security buster/updates/main arm64 Packages [423 kB]
Fetched 821 kB in 29s (27.8 kB/s)                                              
Reading package lists... Done
root@debian:~# ping www.baidu.com
PING www.a.shifen.com (39.156.66.14) 56(84) bytes of data.
^C
--- www.a.shifen.com ping statistics ---
4 packets transmitted, 0 received, 100% packet loss, time 69ms

root@debian:~# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic enp0s1
       valid_lft 86131sec preferred_lft 86131sec
    inet6 fec0::5054:ff:fe12:3456/64 scope site dynamic mngtmpaddr noprefixroute 
       valid_lft 86301sec preferred_lft 14301sec
    inet6 fe80::5054:ff:fe12:3456/64 scope link 
       valid_lft forever preferred_lft forever
```

再看，为什么ping baidu.com不通，但是有网？kalipy推测apt-get可能走的是ipv6：

```
root@debian:~# apt-get update
Hit:1 http://mirrors.tuna.tsinghua.edu.cn/debian buster InRelease
Hit:2 http://mirrors.tuna.tsinghua.edu.cn/debian buster-updates InRelease
0% [Connecting to debian.map.fastlydns.net (2a04:4e42:12::644)]
```

再看：

```
root@debian:~# ping 192.168.0.1
PING 192.168.0.1 (192.168.0.1) 56(84) bytes of data.
^C
--- 192.168.0.1 ping statistics ---
1 packets transmitted, 0 received, 100% packet loss, time 0ms

root@debian:~# ip route
default via 10.0.2.2 dev enp0s1 
default via 10.0.2.2 dev enp0s1 proto dhcp src 10.0.2.15 metric 100 
10.0.2.0/24 dev enp0s1 proto kernel scope link src 10.0.2.15 
10.0.2.2 dev enp0s1 proto dhcp scope link src 10.0.2.15 metric 100 
root@debian:~# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.2.2        0.0.0.0         UG    0      0        0 enp0s1
0.0.0.0         10.0.2.2        0.0.0.0         UG    100    0        0 enp0s1
10.0.2.0        0.0.0.0         255.255.255.0   U     0      0        0 enp0s1
10.0.2.2        0.0.0.0         255.255.255.255 UH    100    0        0 enp0s1
```

--- 

宿主机：

```
[I] kalipy@debian ~/b/my_study_notes> sudo route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.0.1     0.0.0.0         UG    0      0        0 wlp8s0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
192.168.0.0     0.0.0.0         255.255.255.0   U     0      0        0 wlp8s0
[I] kalipy@debian ~/b/my_study_notes> sudo ip route
default via 192.168.0.1 dev wlp8s0 
172.17.0.0/16 dev docker0 proto kernel scope link src 172.17.0.1 linkdown 
192.168.0.0/24 dev wlp8s0 proto kernel scope link src 192.168.0.166
```

虚拟机：

```
root@debian:~# more /etc/netplan/00-installer-config.yaml 
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s1:
      dhcp4: no
      addresses: [192.168.0.67/24]
      nameservers:
          addresses: [223.5.5.5]
      gateway4: 192.168.0.1
root@debian:~# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.67/24 brd 192.168.0.255 scope global enp0s1
       valid_lft forever preferred_lft forever
    inet6 fec0::5054:ff:fe12:3456/64 scope site dynamic mngtmpaddr noprefixroute 
       valid_lft 86261sec preferred_lft 14261sec
    inet6 fe80::5054:ff:fe12:3456/64 scope link 
       valid_lft forever preferred_lft forever
root@debian:~# ip route
default via 192.168.0.1 dev enp0s1 proto static 
192.168.0.0/24 dev enp0s1 proto kernel scope link src 192.168.0.67 
root@debian:~# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.0.1     0.0.0.0         UG    0      0        0 enp0s1
192.168.0.0     0.0.0.0         255.255.255.0   U     0      0        0 enp0s1
```

可以看到，在虚拟机中，依然什么都ping不通

手动给虚拟机添加arp条目也不行(宿主机也加了)：

```
root@debian:~# arp -i enp0s1 -s 192.168.0.166 2a:fb:b6:a1:95:27
root@debian:~# arp -i enp0s1 -s 192.168.0.1 04:95:e6:3e:14:a0
root@debian:~# arp
Address                  HWtype  HWaddress           Flags Mask            Iface
192.168.0.1              ether   04:95:e6:3e:14:a0   CM                    enp0s1
192.168.0.166            ether   2a:fb:b6:a1:95:27   CM                    enp0s1
```

### 奇怪！！！！！！！！！！！！！！！！！！！！

在我debian电脑上，user模式下(用wifi的情况下)，把qemu内的netplan卸载情况下，啥都ping不通(apt-get update用的ipv6可以访问外网除外)

在我安卓手机上(开了wifi的情况下)，user模式下，没安装过netplan和nmcli情况下，啥都可以ping通，包括192.168.0.1网关，ip addr显示ip为10.2.xx.xx这样的

### 测试得控制变量

netplan、nmcli、qemu内的dhcp、宿主机isc-dhcp的dhcp、ubuntu/centos、不开docker/tap0和开docker/tap0，root和非root运行qemu-system-aarch64，pc的br0是否用netplan启用过然后手动brctl删除恢复过(不知道不重启电脑的情况下，会不会对qemu获取网络造成影响)

### 总结

宿主机机器环境不同，效果就会不同，完了，我什么都不懂了，哭/(ㄒoㄒ)/~~

### 最好的方法



[I] kalipy@debian ~/b/my_study_notes> sudo systemctl status isc-dhcp-server.service
● isc-dhcp-server.service - LSB: DHCP server
   Loaded: loaded (/etc/init.d/isc-dhcp-server; generated)
   Active: inactive (dead) since Sun 2023-02-19 12:52:09 CST; 2h 52min ago

root@debian ~# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: enp0s1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.3/16 brd 172.17.255.255 scope global enp0s1
       valid_lft forever preferred_lft forever
3: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:12:34:58 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.67/24 brd 192.168.0.255 scope global enp0s3
       valid_lft forever preferred_lft forever
4: enp0s2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:12:34:57 brd ff:ff:ff:ff:ff:ff
    inet 192.168.0.66/24 brd 192.168.0.255 scope global enp0s2
       valid_lft forever preferred_lft forever
root@debian ~# more /etc/netplan/00-installer-config.yaml 
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s1:
      dhcp4: no
      addresses: [172.17.0.3/16]
      gateway4: 172.17.0.1
    enp0s2:
      dhcp4: no
      addresses: [192.168.0.66/24]
      gateway4: 172.17.0.1
    enp0s3:
      dhcp4: no
      addresses: [192.168.0.67/24]
      gateway4: 172.17.0.1

root@debian ~# route add -net 192.168.0.0 netmask 255.255.255.0 gw 172.17.0.1
root@debian ~# ip route
default via 172.17.0.1 dev enp0s1 
default via 172.17.0.1 dev enp0s1 proto static 
172.17.0.0/16 dev enp0s1 proto kernel scope link src 172.17.0.3 
192.168.0.0/24 via 172.17.0.1 dev enp0s1 
192.168.0.0/24 dev enp0s2 proto kernel scope link src 192.168.0.66 
192.168.0.0/24 dev enp0s3 proto kernel scope link src 192.168.0.67 
root@debian ~# route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 enp0s1
0.0.0.0         172.17.0.1      0.0.0.0         UG    0      0        0 enp0s1
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 enp0s1
192.168.0.0     172.17.0.1      255.255.255.0   UG    0      0        0 enp0s1
192.168.0.0     0.0.0.0         255.255.255.0   U     0      0        0 enp0s2
192.168.0.0     0.0.0.0         255.255.255.0   U     0      0        0 enp0s3
root@debian ~# ping 192.168.0.1
PING 192.168.0.1 (192.168.0.1) 56(84) bytes of data.
64 bytes from 192.168.0.1: icmp_seq=1 ttl=63 time=2.33 ms
64 bytes from 192.168.0.1: icmp_seq=2 ttl=63 time=4.43 ms
^C
--- 192.168.0.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 5ms
rtt min/avg/max/mdev = 2.334/3.381/4.429/1.049 ms
root@debian ~# ping 192.168.0.102
PING 192.168.0.102 (192.168.0.102) 56(84) bytes of data.
64 bytes from 192.168.0.102: icmp_seq=1 ttl=63 time=422 ms
64 bytes from 192.168.0.102: icmp_seq=2 ttl=63 time=394 ms
^C
--- 192.168.0.102 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 4ms
rtt min/avg/max/mdev = 393.854/407.754/421.655/13.915 ms
root@debian ~# 

root@debian ~# ping www.baidu.com
PING www.a.shifen.com (39.156.66.18) 56(84) bytes of data.
64 bytes from 39.156.66.18 (39.156.66.18): icmp_seq=1 ttl=52 time=10.1 ms
64 bytes from 39.156.66.18 (39.156.66.18): icmp_seq=2 ttl=52 time=10.7 ms




root@debian ~# ping 192.168.0.1
PING 192.168.0.1 (192.168.0.1) 56(84) bytes of data.
64 bytes from 192.168.0.1: icmp_seq=1 ttl=63 time=2.56 ms
64 bytes from 192.168.0.1: icmp_seq=2 ttl=63 time=1.97 ms
64 bytes from 192.168.0.1: icmp_seq=3 ttl=63 time=2.46 ms
^C
--- 192.168.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 18ms
rtt min/avg/max/mdev = 1.974/2.328/2.556/0.256 ms
root@debian ~# arp
Address                  HWtype  HWaddress           Flags Mask            Iface
192.168.0.1                      (incomplete)                              enp0s2
172.17.0.1               ether   02:42:fc:14:f4:75   C                     enp0s3
172.17.0.1               ether   a2:f0:9a:8d:fc:61   C                     enp0s1


但是我们发现现在虚拟机ping 宿主机192.168.0.xx和百度都没问题了，但是宿主机Ping不通虚拟机怎么办，解决：

宿主机执行：


[I] kalipy@debian ~/b/my_study_notes> sudo route add -net 192.168.0.0 netmask 255.255.255.0 gw 172.17.0.1
[I] kalipy@debian ~/b/my_study_notes> ping 192.168.0.67
PING 192.168.0.67 (192.168.0.67) 56(84) bytes of data.
From 172.17.0.1 icmp_seq=1 Destination Host Unreachable
From 172.17.0.1 icmp_seq=2 Destination Host Unreachable
From 172.17.0.1 icmp_seq=3 Destination Host Unreachable
^C
--- 192.168.0.68 ping statistics ---
5 packets transmitted, 0 received, +3 errors, 100% packet loss, time 102ms
pipe 4
[I] kalipy@debian ~/b/my_study_notes> ping 192.168.0.66
PING 192.168.0.66 (192.168.0.66) 56(84) bytes of data.
64 bytes from 192.168.0.66: icmp_seq=1 ttl=64 time=2.29 ms
64 bytes from 192.168.0.66: icmp_seq=2 ttl=64 time=1.37 ms
^C
--- 192.168.0.66 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 2ms
rtt min/avg/max/mdev = 1.370/1.828/2.287/0.460 ms
[I] kalipy@debian ~/b/my_study_notes> ping 192.168.0.67
PING 192.168.0.67 (192.168.0.67) 56(84) bytes of data.
64 bytes from 192.168.0.67: icmp_seq=1 ttl=64 time=2.53 ms
64 bytes from 192.168.0.67: icmp_seq=2 ttl=64 time=0.986 ms


问题：
一旦宿主机添加了上面的路由，那么虚拟机和宿主机就会都无法ping通192.168.0.1了，但是不影响访问baidu和互相用192.168.0.xx ping通，但是宿主机和虚拟机之外的192.168.0.yy，虚拟机和宿主机都无法ping通了


解决：

宿主机执行：

[I] kalipy@debian ~/b/my_study_notes> sudo route add -net 192.168.0.0 netmask 255.255.255.0 gw 0.0.0.0
SIOCADDRT: 无效的参数
[I] kalipy@debian ~/b/my_study_notes> sudo route add -net 192.168.0.0 netmask 255.255.255.0 gw 192.168.0.1
[I] kalipy@debian ~/b/my_study_notes> sudo route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.0.1     0.0.0.0         UG    0      0        0 wlp8s0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
192.168.0.0     192.168.0.1     255.255.255.0   UG    0      0        0 docker0
192.168.0.0     172.17.0.1      255.255.255.0   UG    0      0        0 docker0
192.168.0.0     0.0.0.0         255.255.255.0   U     0      0        0 wlp8s0
[I] kalipy@debian ~/b/my_study_notes> ping 192.168.0.102
PING 192.168.0.102 (192.168.0.102) 56(84) bytes of data.
From 172.17.0.1 icmp_seq=1 Destination Host Unreachable
From 172.17.0.1 icmp_seq=2 Destination Host Unreachable
From 172.17.0.1 icmp_seq=3 Destination Host Unreachable
^C
--- 192.168.0.102 ping statistics ---
5 packets transmitted, 0 received, +3 errors, 100% packet loss, time 111ms
pipe 4
[I] kalipy@debian ~/b/my_study_notes> sudo route add -net 192.168.0.0 netmask 255.255.255.0 gw 192.168.0.1 wlp8s0
[I] kalipy@debian ~/b/my_study_notes> sudo route -n
Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.0.1     0.0.0.0         UG    0      0        0 wlp8s0
172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
192.168.0.0     192.168.0.1     255.255.255.0   UG    0      0        0 wlp8s0
192.168.0.0     192.168.0.1     255.255.255.0   UG    0      0        0 docker0
192.168.0.0     172.17.0.1      255.255.255.0   UG    0      0        0 docker0
192.168.0.0     0.0.0.0         255.255.255.0   U     0      0        0 wlp8s0
[I] kalipy@debian ~/b/my_study_notes> ping 192.168.0.102
PING 192.168.0.102 (192.168.0.102) 56(84) bytes of data.
64 bytes from 192.168.0.102: icmp_seq=1 ttl=64 time=301 ms
From 192.168.0.1: icmp_seq=2 Redirect Host(New nexthop: 192.168.0.102)
64 bytes from 192.168.0.102: icmp_seq=2 ttl=64 time=221 ms
64 bytes from 192.168.0.102: icmp_seq=3 ttl=64 time=146 ms
64 bytes from 192.168.0.102: icmp_seq=4 ttl=64 time=66.2 ms
^C
--- 192.168.0.102 ping statistics ---
5 packets transmitted, 4 received, 20% packet loss, time 6ms
rtt min/avg/max/mdev = 66.152/183.526/301.368/87.345 ms
[I] kalipy@debian ~/b/my_study_notes> ping 192.168.0.1
PING 192.168.0.1 (192.168.0.1) 56(84) bytes of data.
64 bytes from 192.168.0.1: icmp_seq=1 ttl=64 time=7.85 ms
64 bytes from 192.168.0.1: icmp_seq=2 ttl=64 time=3.32 ms
^C
--- 192.168.0.1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1ms
rtt min/avg/max/mdev = 3.323/5.586/7.850/2.264 ms
[I] kalipy@debian ~/b/my_study_notes> ping 192.168.0.102
PING 192.168.0.102 (192.168.0.102) 56(84) bytes of data.
64 bytes from 192.168.0.102: icmp_seq=1 ttl=64 time=130 ms
From 192.168.0.1: icmp_seq=2 Redirect Host(New nexthop: 192.168.0
