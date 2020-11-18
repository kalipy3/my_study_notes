```
linux上编译gitee上的liteos报错疑难杂症.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-18 17:50
```

1. 报错：
```
arm-none-eabi-ld: cannot find -lsupc++
arm-none-eabi-ld: cannot find -lstdc++
```

2. 本来一般是这样可以解决的：
```
sudo apt-get install gcc--multilib
```

3. 然而，这次不行，找问题找了一下午，才发现是通过apt-get安装的arm-none-eabi-gcc自己的问题

4. 解决：卸载通过apt-get安装的
```
sudo apt-get remove gcc-arm-none-eabi
```

5. 重新去gcc官网下载二进制包

```
版本下载官方网站
https://launchpad.net/gcc-arm-embedded/+download

下载源码包后解压，如本机解压到目录/usr/lib/gcc

添加环境变量
vim /etc/profile
export PATH=$PATH:/usr/lib/gcc/gcc-arm-none-eabi-9-2020-q2-update/bin
source /etc/profile
```
