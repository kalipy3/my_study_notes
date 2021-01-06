```
linux amd独立显卡驱动安装及使用.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2021-01-02 14:51
```

# 安装
```
参考官网教程https://wiki.debian.org/AtiHowTo

1. apt purge *nvidia*

2. Add "contrib" and "non-free" components to /etc/apt/sources.list, for example:
# Debian 10 "Buster"
deb http://deb.debian.org/debian buster main contrib non-free
Update the list of available packages:

3. apt update

#这里会报警告说xx模块没有，不要理会，不影响驱动的成功安装和使用
4. apt-get install firmware-linux-nonfree libgl1-mesa-dri libglx-mesa0 mesa-vulkan-drivers xserver-xorg-video-all

5. reboot
```

# 查看是否安装成功
```
#注意：有的系统使用lspci -nn | egrep -i "vga"显示不出来，用下面命令即可
kalipy@debian ~> lspci -nn | egrep -i "3d|display|vga"
00:02.0 VGA compatible controller [0300]: Intel Corporation 4th Gen Core Processor Integrated Graphics Controller [8086:0416] (rev 06)
01:00.0 Display controller [0380]: Advanced Micro Devices, Inc. [AMD/ATI] Jet PRO [Radeon R5 M230] [1002:6665]

#查看显卡详细信息
kalipy@debian ~> lspci -v -s 01:00.0
01:00.0 Display controller: Advanced Micro Devices, Inc. [AMD/ATI] Jet PRO [Radeon R5 M230]
        Subsystem: Lenovo Jet PRO [Radeon R5 M230 / R7 M260DX / Radeon 520 Mobile]
        Flags: bus master, fast devsel, latency 0, IRQ 27
        Memory at b0000000 (64-bit, prefetchable) [size=128M]
        Memory at b8000000 (64-bit, non-prefetchable) [size=256K]
        I/O ports at 4000 [size=256]
        Expansion ROM at b8040000 [disabled] [size=128K]
        Capabilities: <access denied>
        Kernel driver in use: radeon
        Kernel modules: radeon, amdgpu
```

# 查看独立显卡
```
查看驱动情况如下(请不要在fzf或fish下使用DRI_PRIME命令，不然报错)：
显示集显：（一般会提示没有安装glxinfo, sudo apt-get install mesa-utils即可）
kalipy@debian:~$ DRI_PRIME=0  glxinfo | grep "OpenGL renderer"
OpenGL renderer string: Mesa DRI Intel(R) Haswell Mobile

显示独显：
kalipy@debian:~$ DRI_PRIME=1  glxinfo | grep "OpenGL renderer"
OpenGL renderer string: AMD HAINAN (DRM 2.50.0, 4.19.0-10-amd64, LLVM 7.0.1)

# 查看是否在使用独立显卡 可以看到dis为dynoff目前不在使用 因为默认是使用igd集成显卡
# 其中“IGD”表示集成显卡，“DIS”表示独立显卡；加号（“+”）表示当前用作输出（或称“连接上”（connected））的显卡；“Pwr”代表正在供电，“Off”代表已关闭。如果看到两个显卡都显示“Pwr”，则说明都在消耗着电能。
root@debian:/home/kalipy# cat /sys/kernel/debug/vgaswitcheroo/switch
0:IGD:+:Pwr:0000:00:02.0
1:DIS: :DynOff:0000:01:00.0
```

# 使用
```
使用独立显卡
在启动需要使用独立显卡的应用或命令时，在终端最前面先输入：DRI_PRIME=1

例如使用启动超级玛丽：
kalipy@debian:~$ DRI_PRIME=1
kalipy@debian ~> supertuxkart

用了几天后发现问题：
当直接运行
kalipy@debian:~$ DRI_PRIME=1
此时并不能保证切换显卡，你可以试一下：
kalipy@debian:~$ DRI_PRIME=1
kalipy@debian:~$ glxinfo | grep "OpenGL renderer"
OpenGL renderer string: Mesa DRI Intel(R) Haswell Mobile

kalipy@debian ~> supertuxkart
root@debian:/home/kalipy# cat /sys/kernel/debug/vgaswitcheroo/switch
0:IGD:+:Pwr:0000:00:02.0
1:DIS: :DynOff:0000:01:00.0
结果发现，显示依然是在使用集成显卡。

我使用这种命令解决该问题，加上export运行
kalipy@debian:~$ export DRI_PRIME=1
kalipy@debian:~$ glxinfo | grep "OpenGL renderer"
OpenGL renderer string: AMD HAINAN (DRM 2.50.0, 4.19.0-10-amd64, LLVM 7.0.1)
可以发现成功切换成独立显卡了。
每次启动终端，可以先运行$ export DRI_PRIME=1，这样在下面运行什么都是在独立显卡上运行了。
```

# 切换显卡
```
网上的修改/sys/kernel/debug/vgaswitcheroo/switch的方法在我的deian10上无论如何都不能成功,改/etc/init.d/xx都没用
```

# 那怎么办? kde使用独立显卡的方法
```
1. kalipy@debian:~$ export DRI_PRIME=1

# 关闭kde 或直接杀死kde(killall plasmashell)
2. kquitapp5 plasmashell

# 重启kde
3. kstart plasmashell

# 另开一个cmd,查看是否在使用独立显卡
4. kalipy@debian:~$ sudo cat /sys/kernel/debug/vgaswitcheroo/switch
0:DIS: :DynPwr:0000:01:00.0
1:IGD:+:Pwr:0000:00:02.0

5. ok，现在kde终于不卡了
```
