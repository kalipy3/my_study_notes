```
strace排除ping不通的问题.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-10 20:10
```

1. ping百度
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> ping www.baidu.com
    ping: www.baidu.com: 域名解析暂时失败
    ```

2. 首先想到ping网关
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> sudo route -n
    Kernel IP routing table
    Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
    0.0.0.0         10.1.255.254    0.0.0.0         UG    0      0        0 enp9s0
    10.1.0.0        0.0.0.0         255.255.0.0     U     0      0        0 enp9s0
    169.254.0.0     0.0.0.0         255.255.0.0     U     1000   0        0 enp9s0
    172.17.0.0      0.0.0.0         255.255.0.0     U     0      0        0 docker0
    kalipy@debian ~/b/m/linux_0.11_gdb> ping 10.1.255.254
    PING 10.1.255.254 (10.1.255.254) 56(84) bytes of data.
    64 bytes from 10.1.255.254: icmp_seq=1 ttl=64 time=0.509 ms
    64 bytes from 10.1.255.254: icmp_seq=2 ttl=64 time=0.599 ms
    ^C
    --- 10.1.255.254 ping statistics ---
    2 packets transmitted, 2 received, 0% packet loss, time 11ms
    rtt min/avg/max/mdev = 0.509/0.554/0.599/0.045 ms
    ```

3. ok,网关是可以ping通的,既然网关没问题，下面首先想到ping dns
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> ping 8.8.8.8
    PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
    64 bytes from 8.8.8.8: icmp_seq=1 ttl=114 time=77.1 ms
    64 bytes from 8.8.8.8: icmp_seq=2 ttl=114 time=75.9 ms

    ```

4. 发现dns也没问题,再排查dns是否配置好
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> sudo more /etc/resolv.conf
    ```

5. 果然，dns为空，压根没有配置

6. 配置dns为如下:
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> sudo more /etc/resolv.conf
    nameserver 114.114.114.114
    nameserver 8.8.8.8
    nameserver 1.1.1.1

    ```

7. 再次ping百度,发现现在可以ping通了，但是ping后却要等非常久才会收到百度的回复，显然速度不行，接下来用strace排查速度慢的原因
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> ping www.baidu.com
    PING www.a.shifen.com (14.215.177.39) 56(84) bytes of data.
    64 bytes from 14.215.177.39 (14.215.177.39): icmp_seq=1 ttl=54 time=27.1 ms
    64 bytes from 14.215.177.39 (14.215.177.39): icmp_seq=2 ttl=54 time=27.0 ms
    64 bytes from 14.215.177.39 (14.215.177.39): icmp_seq=3 ttl=54 time=27.1 ms

    ```

8. 找到原因，发现是dns超时的原因
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb>
    sudo strace -e connect,socket,poll ping www.baidu.com
    socket(AF_INET, SOCK_DGRAM, IPPROTO_ICMP) = -1 EACCES (权限不够)
    socket(AF_INET, SOCK_RAW, IPPROTO_ICMP) = 3
    socket(AF_INET6, SOCK_DGRAM, IPPROTO_ICMPV6) = -1 EACCES (权限不够)
    socket(AF_INET6, SOCK_RAW, IPPROTO_ICMPV6) = 4
    socket(AF_UNIX, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 5
    connect(5, {sa_family=AF_UNIX, sun_path="/var/run/nscd/socket"}, 110) = -1 ENOENT (没有那个文件或目录)
    socket(AF_UNIX, SOCK_STREAM|SOCK_CLOEXEC|SOCK_NONBLOCK, 0) = 5
    connect(5, {sa_family=AF_UNIX, sun_path="/var/run/nscd/socket"}, 110) = -1 ENOENT (没有那个文件或目录)
    socket(AF_INET, SOCK_DGRAM|SOCK_CLOEXEC|SOCK_NONBLOCK, IPPROTO_IP) = 5
    connect(5, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("114.114.114.114")}, 16) = 0
    poll([{fd=5, events=POLLOUT}], 1, 0)    = 1 ([{fd=5, revents=POLLOUT}])
    poll([{fd=5, events=POLLIN}], 1, 5000)  = 1 ([{fd=5, revents=POLLIN}])
    poll([{fd=5, events=POLLIN}], 1, 4993)  = 1 ([{fd=5, revents=POLLIN}])
    poll([{fd=5, events=POLLIN}], 1, 4993)  = 0 (Timeout)
    poll([{fd=5, events=POLLOUT}], 1, 0)    = 1 ([{fd=5, revents=POLLOUT}])
    poll([{fd=5, events=POLLIN}], 1, 5000)  = 0 (Timeout)
    socket(AF_INET, SOCK_DGRAM|SOCK_CLOEXEC|SOCK_NONBLOCK, IPPROTO_IP) = 6
    connect(6, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("8.8.8.8")}, 16) = 0
    poll([{fd=6, events=POLLOUT}], 1, 0)    = 1 ([{fd=6, revents=POLLOUT}])
    poll([{fd=6, events=POLLIN}], 1, 3000)  = 1 ([{fd=6, revents=POLLIN}])
    poll([{fd=6, events=POLLOUT}], 1, 2992) = 1 ([{fd=6, revents=POLLOUT}])
    poll([{fd=6, events=POLLIN}], 1, 2992)  = 1 ([{fd=6, revents=POLLIN}])
    poll([{fd=6, events=POLLIN}], 1, 2992)  = 0 (Timeout)
    socket(AF_INET, SOCK_DGRAM|SOCK_CLOEXEC|SOCK_NONBLOCK, IPPROTO_IP) = 5
    connect(5, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("8.8.8.8")}, 16) = 0
    poll([{fd=5, events=POLLOUT}], 1, 0)    = 1 ([{fd=5, revents=POLLOUT}])
    poll([{fd=5, events=POLLIN}], 1, 3000)  = 1 ([{fd=5, revents=POLLIN}])
    socket(AF_INET, SOCK_DGRAM|SOCK_CLOEXEC|SOCK_NONBLOCK, IPPROTO_IP) = 5
    connect(5, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("8.8.8.8")}, 16) = 0
    poll([{fd=5, events=POLLOUT}], 1, 2992) = 1 ([{fd=5, revents=POLLOUT}])
    poll([{fd=5, events=POLLIN}], 1, 2992)  = 1 ([{fd=5, revents=POLLIN}])
    socket(AF_NETLINK, SOCK_RAW|SOCK_CLOEXEC, NETLINK_ROUTE) = 5
    socket(AF_INET, SOCK_DGRAM|SOCK_CLOEXEC, IPPROTO_IP) = 5
    connect(5, {sa_family=AF_INET, sin_port=htons(0), sin_addr=inet_addr("14.215.177.38")}, 16) = 0
    connect(5, {sa_family=AF_UNSPEC, sa_data="\0\0\0\0\0\0\0\0\0\0\0\0\0\0"}, 16) = 0
    connect(5, {sa_family=AF_INET, sin_port=htons(0), sin_addr=inet_addr("14.215.177.39")}, 16) = 0
    socket(AF_INET, SOCK_DGRAM, IPPROTO_IP) = 5
    connect(5, {sa_family=AF_INET, sin_port=htons(1025), sin_addr=inet_addr("14.215.177.38")}, 16) = 0
    PING www.a.shifen.com (14.215.177.38) 56(84) bytes of data.
    socket(AF_INET, SOCK_DGRAM|SOCK_CLOEXEC|SOCK_NONBLOCK, IPPROTO_IP) = 5
    connect(5, {sa_family=AF_INET, sin_port=htons(53), sin_addr=inet_addr("114.114.114.114")}, 16) = 0
    poll([{fd=5, events=POLLOUT}], 1, 0)    = 1 ([{fd=5, revents=POLLOUT}])
    poll([{fd=5, events=POLLIN}], 1, 5000)  = 1 ([{fd=5, revents=POLLIN}])
    64 bytes from 14.215.177.38 (14.215.177.38): icmp_seq=1 ttl=54 time=23.6 ms
    poll([{fd=3, events=POLLIN}], 1, 971)   = 0 (Timeout)
    64 bytes from 14.215.177.38 (14.215.177.38): icmp_seq=2 ttl=54 time=23.6 ms
    poll([{fd=3, events=POLLIN}], 1, 977^Cstrace: Process 14469 detached
    
     <detached ...>
    --- www.a.shifen.com ping statistics ---
    2 packets transmitted, 2 received, 0% packet loss, time 3ms
    rtt min/avg/max/mdev = 23.551/23.598/23.646/0.160 ms

    ```

9. 为什么说是dns超时，请看,可以发现poll...Timeout这种语句很多
    ```
    poll([{fd=5, events=POLLIN}], 1, 5000)  = 0 (Timeout)
    ```

10. 所以，换dns即可，比如换成阿里的`223.5.5.5`
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> sudo more /etc/resolv.conf
    nameserver 223.5.5.5
    #nameserver 114.114.114.114
    #nameserver 8.8.8.8
    #nameserver 1.1.1.1
    ```

11. 再次ping百度,这次发现百度的回复超级快，基本秒回
    ```
    kalipy@debian ~/b/m/linux_0.11_gdb> ping www.baidu.com
    PING www.a.shifen.com (14.215.177.38) 56(84) bytes of data.
    64 bytes from 14.215.177.38 (14.215.177.38): icmp_seq=1 ttl=54 time=23.8 ms
    64 bytes from 14.215.177.38 (14.215.177.38): icmp_seq=2 ttl=54 time=23.5 ms

    ```
