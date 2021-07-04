    kvm虚拟化入门.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2021-06-18 11:35

### 镜像文件离线访问工具

    kalipy@debian ~> sudo apt-get install guestfish
    [sudo] kalipy 的密码：
    正在读取软件包列表... 完成
    正在分析软件包的依赖关系树       
    正在读取状态信息... 完成       
    没有可用的软件包 guestfish，但是它被其它的软件包引用了。
    这可能意味着这个缺失的软件包可能已被废弃，
    或者只能在其他发布源中找到
    然而下列软件包会取代它：
      libguestfs-tools:i386 libguestfs-tools
    
    E: 软件包 guestfish 没有可安装候选
    kalipy@debian ~> sudo apt-get install libguestfs-tools
