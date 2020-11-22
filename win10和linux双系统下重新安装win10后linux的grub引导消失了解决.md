```
win10和linux双系统下重新安装win10后linux的grub引导消失了解决.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-22 21:42
```

1. 今天把win10重新安装后，重启发现linux的启动引导没了

### 解决办法：

1. 制作你原来那个发行版的linux的u盘启动盘

2. bios选择u盘启动

3. 启动后，选择拯救模式

4. 选择重新安装grub引导程序

5. 安装在主引导mbr上即可

