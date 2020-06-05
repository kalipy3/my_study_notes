# GDB+Qemu调试Linux-0.11的代码
 
1.下载内核源码和根文件系统镜像  
http://oldlinux.org/Linux.old/bochs/linux-0.11-devel-040809.zip  


2.Linux-0.11内核源码的改进版，可以在gcc-4.72下顺利编译通过，原生代码只能在gcc-1.4下编译：  
https://github.com/yuanxinyu/Linux-0.11  


### 编译Linux-0.11
1.解压Linux-0.11-master.zip，进入Linux-0.11-master目录中，直接执行make就可以编译内核,会生成2个文件，一个是内核Image， 一个是内核符号文件tools/system。  

### qemu启动虚拟机
1.提取出linux-0.11-devel-040809.zip中的hdc-0.11.img  
2.按下面命令执行：  
```
/*pc-bios是qemu源码目录中文件，包含bios文件，vgabios文件和keymap */  
$qemu-system-x86_64  -m 16M  -boot a -fda Image -hda hdc-0.11.img -vnc :0 -s -S
```
3.在另外一个控制台中，执行  
`#gdb system`,结果如下：  

```
(gdb)target remote localhost:1234 //连接gdbserer
(gdb)directory ./Linux-0.11-master //设置源码目录
(gdb)set architecture i8086 //设置成i8086模式，用来调试16位实模式代码
(gdb)set disassembly-flavor intel    //讲汇编显示成INTEL格式，好看一些
(gdb)b *0x7c00 //在地址0x7c00处打断点，因为系统加电后，BIOS会把MBR中的代码加载到内  存中的0x7c00的位置，并从0x7c00处开始执行bootsect.s的代码


(gdb)c 
(gdb)x /16b 0x7df0 //观察0x7DFE和0x7DFF的值是否为0x55，0xAA
(gdb)layout split //显示汇编窗口和源码窗口
(gdb)b main //main函数下断点
```
