```
win10和linux双系统下重新安装win10后linux的grub引导消失了解决.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-22 21:42
修改 2020-11-22 1:59
```

1. 今天把win10重新安装后，重启发现linux的启动引导没了

### 解决办法：

1. 制作你原来那个发行版的linux的u盘启动盘

2. bios选择u盘启动

3. 启动后，选择拯救模式

4. 从主菜单中选择进入拯救模式

5. 选择linux的那个盘，比如我这里是/dev/sda3,如果不知道是sda几的话，就一个一个试，可以进去成功安装grub的那个就是

6. 选择重新安装grub引导程序

7. 安装在主引导mbr上即可

