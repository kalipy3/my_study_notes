    qemu启动系统报错问题.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2021-06-08 16:57

### 问题

qemu不能加载ui-gtk.so导致以vnc方式启动gui，因为版本不一致

    kalipy@debian ~/下/busybox-1.32.0> ./boot_with_lcd.sh 
    Failed to initialize module: /usr/lib/x86_64-linux-gnu/qemu/ui-gtk.so
    Note: only modules from the same build can be loaded.
    WARNING: Image format was not specified for 'rootfs.ext3' and probing guessed raw.
             Automatically detecting the format is dangerous for raw images, write operations on block 0 will be restricted.
             Specify the 'raw' format explicitly to remove the restrictions.
    Failed to initialize module: /usr/lib/x86_64-linux-gnu/qemu/audio-pa.so
    Note: only modules from the same build can be loaded.
    VNC server running on ::1:5900

### 解决

把qemu的相关东西更新一下，这样版本就一致了

    kalipy@debian ~/下/busybox-1.32.0> sudo apt install qemu-system-gui 
    [sudo] kalipy 的密码：
    正在读取软件包列表... 完成
    正在分析软件包的依赖关系树       
    正在读取状态信息... 完成       
    qemu-system-gui 已经是最新版 (1:3.1+dfsg-8+deb10u8)。
    
    kalipy@debian ~/下/busybox-1.32.0> sudo apt install qemu-system-arm 
    正在读取软件包列表... 完成
    正在分析软件包的依赖关系树       
    正在读取状态信息... 完成       
    下列软件包是自动安装的并且现在不需要了：
      bind9utils libhiredis0.14 libmsgpackc2 libnginx-mod-http-auth-pam
      libnginx-mod-http-cache-purge libnginx-mod-http-dav-ext libnginx-mod-http-echo
      libnginx-mod-http-fancyindex libnginx-mod-http-geoip
      libnginx-mod-http-headers-more-filter libnginx-mod-http-image-filter
      libnginx-mod-http-lua libnginx-mod-http-ndk libnginx-mod-http-perl
      libnginx-mod-http-subs-filter libnginx-mod-http-uploadprogress
      libnginx-mod-http-upstream-fair libnginx-mod-http-xslt-filter libnginx-mod-mail
      libnginx-mod-nchan libnginx-mod-stream libtermkey1 libunibilium4 libvterm0
      neovim-runtime nginx-common python-concurrent.futures python-greenlet
      python-neovim python-trollius python3-greenlet python3-msgpack python3-neovim
      python3-ply
    使用'sudo apt autoremove'来卸载它(它们)。
    建议安装：
      samba vde2 qemu-block-extra
    下列软件包将被升级：
      qemu-system-arm
    升级了 1 个软件包，新安装了 0 个软件包，要卸载 0 个软件包，有 201 个软件包未被升级。
    需要下载 6,563 kB 的归档。
    解压缩后会消耗 0 B 的额外空间。
