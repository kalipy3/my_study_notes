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

5. 选择linux的那个盘，比如我这里是/dev/sda3,如果不知道是sda几的话，就一个一个试，可以进去成功安装grub(有安装grub菜单选项的那个分区)的那个就是

6. 选择重新安装grub引导程序

7. 安装在主引导mbr上即可

### 扩展

如果被拯救的机器是因为rm /bin -rf导致开启panic怎么办?

方法一：

答：

依然进拯救模式，选择/dev/sdax，哪个进去是/目录(也可以参考linux系统大小)，就选哪个/dev/sdax，然后选择"在/dev/sdax中运行shell"是会失败的，因为rm /bin -rf了，此时可以选择"在安装程序环境中运行shell"，进去后，df -h查看，/dev/sadx通常是挂载到/target目录下了，而cdrom即iso文件通常是挂载到/cdrom目录下来，此时cp /bin /target/ -rf即可恢复rm /bin rf删除了的/bin文件

方法二(qemu中修复qcow2的方法)：

答：

直接安装qemu-nbd工具，connect要被修复的qcow2为/dev/nbdx，然后mount挂载/dev/nbd1px(至于能不能被挂载，用fdisk -l看下是不是linux文件系统即可，如果是，就可以)到/mnt，之后cd /mnt，把bin中的文件补上(可以把原始iso挂载到/media，然后cp /media/bin /mnt/bin -rf)

### 原理

其实我们仔细想想这个rescue会发现，所谓rescue 模式只是一个带shell 的linux 运行环境而已，然后通过mount 和 chroot进入要修复的系统的。

```
硬盘上的系统已经被找到，并挂载在/mnt/sysimage 下，按提示chroot /mnt/sysimage

chroot 之后你就可以已经在你的要被拯救的系统下了。

grub挂了的，grub-install /dev/hdxx

配置文件改错的,vi /etc/fstab vi /etc/inittab ..................

软件包被毁的 rpm -F xxx.rpm

完成修复工作后,exit命令退出chroot，exit退出rescue shell 系统重启。

备注：

如果你硬盘上的系统是非rhel系统如debian的，那么在第4步时，rescue 程序会找步不到硬盘上的系统，所以我们这是选择"跳过"，直接进入shell。假设现在硬盘上的有一个debian 系统 /dev/hda1 为/boot 分区 /dev/hda5 为 / 分区 /dev/hda6 为swap。那么我们现在这么做。

# fdisk -l (查看分区情况)
# mkdir /mnt/linux
# mkdir /mnt/linux/boot (根据fdisk -l 得到的信息创建目录)
# mount -t ext3 /dev/hda5 /mnt/linux
# mount -t ext3 /dev/hda1 /mnt/linux/boot (挂载硬盘上的文件系统)
# chroot /mnt/linux (chroot 改变工作系统)

自此我们顺利进入硬盘上的debian系统,剩下来到就和先前一样了，有冤的报冤有仇的报仇。

另：

如果你的系统是文件系统损坏那么就不用挂载，chroot 系统了。
直接 fsck /dev/hdxx 即可。

其实我们仔细想想这个rescue会发现，所谓rescue 模式只是一个带shell 的linux 运行环境而已，然后通过mount 和 chroot进入要修复的系统的。

所以在没有rescue 盘的情况下我可以利用 Linux livecd 或软盘版的linux 进入shell 环境然后重做

# fdisk -l (查看分区情况)
# mkdir /mnt/linux
# mkdir /mnt/linux/boot (根据fdisk -l 得到的信息创建目录)
# mount -t ext3 /dev/hda5 /mnt/linux
# mount -t ext3 /dev/hda1 /mnt/linux/boot (挂载硬盘上的文件系统)
```
