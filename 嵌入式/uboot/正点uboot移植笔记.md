    正点uboot移植笔记.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2021-06-08 13:16

### 什么是uboot

* `uboot`是一个裸机程序
* `uboot`是一个`bootloader`,作用是启动linux或者其它系统,最主要的工作是初始化`DDR`,因为linux是运行在`DDR`中的。一般linux镜像`zImage(uImage)`+`设备树(.dtb)`存放在`SD卡`、`EMMC`、`NAND`、`SPI FLASH`等外置存储设备上。需要将linux镜像从外置flash拷贝到DDR中，再去启动
* uboot不仅仅能启动linux,也可以启动其它系统
* linux也不仅仅通过uboot启动
* uboot是个通用的bootloader,它支持多种架构

#### uboot获取

1. uboot官网,缺点是支持少，比如某一款具体的芯片驱动不完善等

2. SOC厂家会从uboot官网下载某一个版本的uboot,然后在这个uboot上加入相应的SOC以及驱动,这就是SOC厂商定制版的uboot

3. 做开发板的厂商，他们会参考SOC厂商的板子。开发板厂商的开发板必然会和SOC官方的板子不一样，所以开发板厂商又会修改SOC厂商的uboot,以适应自己板子。




