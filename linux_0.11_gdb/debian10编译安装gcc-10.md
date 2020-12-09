```
debian10编译安装gcc-10.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-09 19:44

```

### 编译需求

最近重新学习linux0.11源码，首先想到用gcc带上-g参数编译linux0.11的源码，然后好用gdb调试着学习

原本我是在alpine上用gcc-9版本编译的，可以成功编译linux0.11源码，然而在debian10上用默认源的gcc-8却编译失败，make报错为:the system binary is too big

首先想到可能是gcc版本的问题，所以想着用高版本gcc编译，我一般喜欢用最新的稳定版，所以去gcc官网下载了gcc-10版本的源码,然后编译之

### 编译gcc-10

1. gcc官网下载,http://gcc.gnu.org,下载gcc-10.1.0.tar.gz

2. tar -xzvf gcc-10.1.0.tar.gz

3. 安装gcc之前，需要安装几个依赖包(必须)
    ```
    cd ~/gcc-10.1.0

    ./contrib/download_prerequisites//执行脚本自动安装
    ```
4. 建立目标目录并进去,比如我这里为gcc10_install_by_source:
    ```
    mkdir ~/gcc10_install_by_source

    cd ~/gcc10_install_by_source
    ```
5. 配置
    ```
    ~/gcc-10.1.0/configure --prefix=/gcc10_install_by_source/gg  --disable-checking  --enable-languages=c,c++  --disable-multilib//prefix为gcc编译后生成的文件的存放路径
    ```

6. 编译
    `make -j4`

7. 安装
    `make install`

8. 配置环境变量
    ```
    vim /etc/profile

    export PATH=/home/kalipy/gcc10_install_by_source/gg/bin:$PATH

    source /etc/profile
    ```

9. gcc -v查看现在的gcc版本
    ```
    kalipy@debian ~/下/gcc-10.1.0> gcc -v
    使用内建 specs。
    COLLECT_GCC=gcc
    COLLECT_LTO_WRAPPER=/home/kalipy/gcc10_install_by_source/gg/libexec/gcc/x86_64-pc-linux-gnu/10.1.0/lto-wrapper
    目标：x86_64-pc-linux-gnu
    配置为：/home/kalipy/下载/gcc-10.1.0/configure --prefix=/home/kalipy/gcc10_install_by_source/gg --disable-checking --enable-languages=c,c++ --disable-multilib
    线程模型：posix
    Supported LTO compression algorithms: zlib
    gcc 版本 10.1.0 (GCC)
    ```

10. 如果想用回原来的gcc-8版本，把刚才配置的/etc/profile gcc环境变量注释或另起一个shell终端即可

### make linux0.11的源码测试

1. 哭了，依然失败
    ```
    make[1]: 离开目录“/home/kalipy/桌面/Linux-0.11-master/kernel/blk_drv”
    make[1]: 进入目录“/home/kalipy/桌面/Linux-0.11-master/kernel/chr_drv”
    sync
    make[1]: 离开目录“/home/kalipy/桌面/Linux-0.11-master/kernel/chr_drv”
    make[1]: 进入目录“/home/kalipy/桌面/Linux-0.11-master/kernel/math”
    make[1]: 离开目录“/home/kalipy/桌面/Linux-0.11-master/kernel/math”
    make[1]: 进入目录“/home/kalipy/桌面/Linux-0.11-master/lib”
    make[1]: 离开目录“/home/kalipy/桌面/Linux-0.11-master/lib”
    记录了1+0 的读入
    记录了1+0 的写出
    512 bytes copied, 0.000146683 s, 3.5 MB/s
    记录了4+0 的读入
    记录了4+0 的写出
    2048 bytes (2.0 kB, 2.0 KiB) copied, 0.000109062 s, 18.8 MB/s
    the system binary is too big

    ```

2. 所以应该不是gcc版本的问题，而是系统的问题

3. 所以，我又去了下载alpine系统，安装，用当时可以成功的环境编译，请看(之所以不用virtualbox之类的，是因为那些虚拟机难安装，通常都要添加内核模块，内核这东西，容易把自己的系统搞崩溃，搞崩到不要紧，关键我这电脑上的数据和配置文件重要，而且在我的debian 4.19.0-10-amd64系统上，几乎没办法，virtualbox的成功运行需要linux-headers-4.19.0.10-amd64内核模块，然而这个模块，不用想了，没有，我找遍外网都没找到，4.19.0.6-8 4.19.0.11-13的随处都有，就是没有10版本的，哭啊啊啊啊)
    ```
    qemu运行alpine系统编译linux0.11源码.md
    ```
