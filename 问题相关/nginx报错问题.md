nignx 作反向代理时，（Permission denied) while connecting to upstream
linux在安装时，默认会安装SeLinux。这是Linux的一个内核模块，作用是最大限度地减少系统中服务进程可访问的资源。

它的状态默认是开启的。

查看SeLinux

1、/usr/sbin/sestatus -v

如果SELinux status，说明SeLinux是开启的。

2、getenforce                 ##也可以用这个命令检查

关闭SeLinux

1、临时关闭命令

setenforce 0                  设置SELinux 成为permissive模式

2、永久关闭

修改/etc/selinux/config 文件

将SELINUX=enforcing改为SELINUX=disabled

重启服务器。


先安装控制工具：
sudo apt-get install -y selinux-utils setools
查看目前知SELinux的状态
getenforce
如果是临时关闭，则使用命令
setenfoce 0：
如果要开道机就不启用，则修内改配置文件/etc/selinux/config



