```
strace ltrace等调试命令.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-10 16:56
```

基本功能
    
    监控用户进程与内核进程的交互
    追踪进程的系统调用 信号传递 状态变化

常见系统调用简单分类
    
    文件和设备访问：open openat close read write ioctl等

    进程管理：fork clone execve exit等

    信号: signal kill等

    内存管理: brk mmap mlock等

    进程间通信: semget 信号量 消息队列

    网络通信: socket connect等

常用参数
    
    -c: count time,calls,and errors for each system call
    -d: show some debugging output of strace itself on the standard error
    -f/F: trace child processes created by currently traced processes
    -h: print the help summary
    -k: print the exexcution stack trace of the traced processes
    -r: print a relative timestamp upon entry to each system call
    -t: prefix each line of the trace with the time of day
    -tt: prefix each line of the trace with the time of day
    -T: show the time spent in system calls

    -e open,close: only trace open/close system calls
    -e ifle: only trace file system calls
    -e process: trace all system calls which involve process management
    -e network: trace all the netword related system calls
    -e signal: trace all signal related system calls
    -e desc: trace all ipc related system calls
    -e memory: trace all file descriptor related system calls
    -e set: trace only the specified subset of signals
    -o filename: write the trace output to the file filename
    -p pid: trace the process with the process ID pid

1. 安装
```
sudo apt-get install strace
```

2. 使用,以curl www.baidu.com为例(-e network:表示只显示与网络相关的system calls)
    ```
    kalipy@debian ~/g/strace> sudo strace -e network curl www.baidu.com              130
    socket(AF_INET6, SOCK_DGRAM, IPPROTO_IP) = 3
    socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 3
    setsockopt(3, SOL_TCP, TCP_NODELAY, [1], 4) = 0
    setsockopt(3, SOL_SOCKET, SO_KEEPALIVE, [1], 4) = 0
    setsockopt(3, SOL_TCP, TCP_KEEPIDLE, [60], 4) = 0
    setsockopt(3, SOL_TCP, TCP_KEEPINTVL, [60], 4) = 0
    connect(3, {sa_family=AF_INET, sin_port=htons(80), sin_addr=inet_addr("14.215.177.39")}, 16) = -1 EINPROGRESS (操作现在正在进行)
    getsockopt(3, SOL_SOCKET, SO_ERROR, [0], [4]) = 0
    getpeername(3, {sa_family=AF_INET, sin_port=htons(80), sin_addr=inet_addr("14.215.177.39")}, [128->16]) = 0
    getsockname(3, {sa_family=AF_INET, sin_port=htons(57642), sin_addr=inet_addr("10.1.88.49")}, [128->16]) = 0
    sendto(3, "GET / HTTP/1.1\r\nHost: www.baidu."..., 77, MSG_NOSIGNAL, NULL, 0) = 77
    recvfrom(3, "HTTP/1.1 200 OK\r\nAccept-Ranges: "..., 102400, 0, NULL, NULL) = 2781

    ```

3. 使用`-c`参数统计系统调用情况
    ```
    kalipy@debian ~/g/strace> sudo strace -c curl www.baidu.com
    % time     seconds  usecs/call     calls    errors syscall
    ------ ----------- ----------- --------- --------- ----------------
     47.21    0.005643           8       678           rt_sigaction
     45.97    0.005495          35       156           poll
      1.29    0.000154           3        40           close
      0.84    0.000101         101         1         1 connect
      0.73    0.000087          43         2           write
      0.69    0.000082          11         7           brk
      0.59    0.000071          35         2           socket
      0.33    0.000040          10         4           setsockopt
      0.33    0.000039           1        38         2 openat
      0.27    0.000032           3        10           futex
      0.22    0.000026          26         1           sendto
      0.21    0.000025           0        37           read
      0.20    0.000024          24         1           recvfrom
      0.19    0.000023           0        37           fstat
      0.18    0.000021          21         1           clone
      0.12    0.000014           7         2           fcntl
      0.11    0.000013           0       140           mmap
      0.09    0.000011          11         1           pipe
      0.08    0.000010           5         2           ioctl
      0.07    0.000008           8         1         1 stat
      0.06    0.000007           3         2         2 access
      0.05    0.000006           0        48           mprotect
      0.05    0.000006           6         1           getsockname
      0.05    0.000006           6         1           getpeername
      0.05    0.000006           6         1           getsockopt
      0.03    0.000004           4         1           getrandom
      0.00    0.000000           0         1           munmap
      0.00    0.000000           0         1           rt_sigprocmask
      0.00    0.000000           0         1           execve
      0.00    0.000000           0         1           arch_prctl
      0.00    0.000000           0         1           set_tid_address
      0.00    0.000000           0         1           set_robust_list
      0.00    0.000000           0         1           prlimit64
    ------ ----------- ----------- --------- --------- ----------------
    100.00    0.011954                  1222         6 total

    ```

4. 使用`-t或-tt`参数显示时间信息(-tt精确比-t精确,小写t是绝对时间，-T表示显示每条system call耗用的相对时间)
    ```
    kalipy@debian ~/g/strace> sudo strace -tt -T -e network  curl www.baidu.com
    18:06:55.163979 socket(AF_INET6, SOCK_DGRAM, IPPROTO_IP) = 3 <0.000020>
    18:07:10.292652 socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 3 <0.000079>
    18:07:10.292899 setsockopt(3, SOL_TCP, TCP_NODELAY, [1], 4) = 0 <0.000036>
    18:07:10.293046 setsockopt(3, SOL_SOCKET, SO_KEEPALIVE, [1], 4) = 0 <0.000024>
    18:07:10.293143 setsockopt(3, SOL_TCP, TCP_KEEPIDLE, [60], 4) = 0 <0.000024>
    18:07:10.293233 setsockopt(3, SOL_TCP, TCP_KEEPINTVL, [60], 4) = 0 <0.000023>
    18:07:10.293442 connect(3, {sa_family=AF_INET, sin_port=htons(80), sin_addr=inet_addr("14.215.177.39")}, 16) = -1 EINPROGRESS (操作现在正在进行) <0.000128>
    18:07:10.320834 getsockopt(3, SOL_SOCKET, SO_ERROR, [0], [4]) = 0 <0.000016>
    18:07:10.320969 getpeername(3, {sa_family=AF_INET, sin_port=htons(80), sin_addr=inet_addr("14.215.177.39")}, [128->16]) = 0 <0.000017>
    18:07:10.321077 getsockname(3, {sa_family=AF_INET, sin_port=htons(58218), sin_addr=inet_addr("10.1.88.49")}, [128->16]) = 0 <0.000017>
    18:07:10.321209 sendto(3, "GET / HTTP/1.1\r\nHost: www.baidu."..., 77, MSG_NOSIGNAL, NULL, 0) = 77 <0.000111>
    18:07:10.350555 recvfrom(3, "HTTP/1.1 200 OK\r\nAccept-Ranges: "..., 102400, 0, NULL, NULL) = 2781 <0.000073>

    ```

5. 使用`-o`参数把追踪的信息保存到日志文件
    ```
    kalipy@debian ~/g/strace> sudo strace -o x.log -e network  curl www.baidu.com
    kalipy@debian ~/g/strace> more x.log
    socket(AF_INET6, SOCK_DGRAM, IPPROTO_IP) = 3
    socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 3
    setsockopt(3, SOL_TCP, TCP_NODELAY, [1], 4) = 0
    setsockopt(3, SOL_SOCKET, SO_KEEPALIVE, [1], 4) = 0
    setsockopt(3, SOL_TCP, TCP_KEEPIDLE, [60], 4) = 0
    setsockopt(3, SOL_TCP, TCP_KEEPINTVL, [60], 4) = 0
    connect(3, {sa_family=AF_INET, sin_port=htons(80), sin_addr=inet_addr("14.215.177.38"
    )}, 16) = -1 EINPROGRESS (操作现在正在进行)
    getsockopt(3, SOL_SOCKET, SO_ERROR, [0], [4]) = 0
    getpeername(3, {sa_family=AF_INET, sin_port=htons(80), sin_addr=inet_addr("14.215.177
    .38")}, [128->16]) = 0
    getsockname(3, {sa_family=AF_INET, sin_port=htons(37942), sin_addr=inet_addr("10.1.88
    .49")}, [128->16]) = 0
    sendto(3, "GET / HTTP/1.1\r\nHost: www.baidu."..., 77, MSG_NOSIGNAL, NULL, 0) = 77
    recvfrom(3, "HTTP/1.1 200 OK\r\nAccept-Ranges: "..., 102400, 0, NULL, NULL) = 2781
    +++ exited with 0 +++

    ```

### 使用strace调试程序的例子

1. 有test.c程序如下:
    ```
    kalipy@debian ~/g/strace> more test.c                                       
    /*
     * test.c
     * Copyright (C) 2020 2020-12-10 18:14 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    
    #include <sys/types.h>
    #include <sys/stat.h>
    #include <fcntl.h>
    #include <stdio.h>
    #include <unistd.h>
    
    int main(void)
    {
        int fd1, fd2;
    
        fd1 = open("test.txt", O_RDONLY | O_CREAT);//如果没有这个文件，则自动创建
        if (fd1 == -1)
        {
            printf("open test.txt failed!\n");
            return -1;
        }
    
        fd2 = open("hello.txt", O_WRONLY);//如果没有这个文件，则fd2=-1
        if (fd2 == -1)
        {
            close(fd1);
            printf("open test.txt failed!\n");
            return -1;
        }
        close(fd1);
        close(fd2);
    
        return 0;
    }

    ```

2. 编译运行：
    ```
    kalipy@debian ~/g/strace> ls
    test.c
    kalipy@debian ~/g/strace> gcc test.c
    kalipy@debian ~/g/strace> ls
    a.out  test.c
    kalipy@debian ~/g/strace> ./a.out
    open test.txt failed!
    kalipy@debian ~/g/strace> ls                                                     255
    a.out  test.c  test.txt

    ```

3. 虽然我们在有源代码的情况下很容易查错，但是在没有test.c只有a.out文件时却难以查错

4. 使用strace查错
    ```
    kalipy@debian ~/g/strace> strace -e openat ./a.out
    openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
    openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
    openat(AT_FDCWD, "test.txt", O_RDONLY|O_CREAT, 0127730) = 3
    openat(AT_FDCWD, "hello.txt", O_WRONLY) = -1 ENOENT (没有那个文件或目录)
    open test.txt failed!
+++ exited with 255 +++

    ```

5. 显然，是因为hello.txt这个文件没有，所以报错，异常退出

6. 所以，手动创建hello.txt这个文件后，不在报错
    ```
    kalipy@debian ~/g/strace> ls
    a.out  test.c  test.txt
    kalipy@debian ~/g/strace> touch hello.txt
    kalipy@debian ~/g/strace> ls
    a.out  hello.txt  test.c  test.txt
    kalipy@debian ~/g/strace> ./a.out
    kalipy@debian ~/g/strace>
    ```

-----------------------------------------------------

### ltrace

1. ltrace是什么?
    ```
    kalipy@debian ~/g/strace> man ltrace
    ltrace - A library call tracer

    DESCRIPTION
       ltrace is a program that simply runs the specified command until it  exits.
       It intercepts and records the dynamic library calls which are called by the
       executed process and the signals which are received by  that  process.   It
       can also intercept and print the system calls executed by the program.

       Its use is very similar to strace(1).
    ```

2. 安装
    ```
    sudo apt-get install ltrace
    ```

3. 使用
    ```
    kalipy@debian ~/g/strace> more test02.c
    /*
     * test02.c
     * Copyright (C) 2020 2020-12-10 18:40 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    
    #include <stdio.h>
    int main(void)
    {
        printf("Hello world!\n");
        return 0;
    }

    kalipy@debian ~/g/strace> gcc test02.c
    kalipy@debian ~/g/strace> ls
    a.out  test02.c
    kalipy@debian ~/g/strace> ltrace  ./a.out
    puts("Hello world!"Hello world!
    )                                = 13
    +++ exited (status 0) +++
    ```

4. 可见，printf函数实际调用的是puts这个库函数(puts则调用了write这个函数)

5. 和strace一样，ltrace也可以把系统调用打印出来:
    ```
    kalipy@debian ~/g/strace> man ltrace
    -S     Display system calls as well as library calls
    
    kalipy@debian ~/g/strace> ltrace -S  ./a.out
    SYS_brk(0)                                          = 0x662000
    SYS_access("/etc/ld.so.preload", 04)                = -2
    SYS_openat(0xffffff9c, 0x7f81a853b90f, 0x80000, 0)  = 3
    SYS_fstat(3, 0x7ffc853450d0)                        = 0
    SYS_mmap(0, 0x292ee, 1, 2)                          = 0x7f81a84f1000
    SYS_close(3)                                        = 0
    SYS_openat(0xffffff9c, 0x7f81a8544df0, 0x80000, 0)  = 3
    SYS_read(3, "\177ELF\002\001\001\003", 832)         = 832
    SYS_fstat(3, 0x7ffc85345130)                        = 0
    SYS_mmap(0, 8192, 3, 34)                            = 0x7f81a84ef000
    SYS_mmap(0, 0x1c0800, 1, 2050)                      = 0x7f81a832e000
    SYS_mprotect(0x7f81a8350000, 1658880, 0)            = 0
    SYS_mmap(0x7f81a8350000, 0x148000, 5, 2066)         = 0x7f81a8350000
    SYS_mmap(0x7f81a8498000, 0x4c000, 1, 2066)          = 0x7f81a8498000
    SYS_mmap(0x7f81a84e5000, 0x6000, 3, 2066)           = 0x7f81a84e5000
    SYS_mmap(0x7f81a84eb000, 0x3800, 3, 50)             = 0x7f81a84eb000
    SYS_close(3)                                        = 0
    SYS_arch_prctl(4098, 0x7f81a84f0500, 0x7f81a84f0e30, 144) = 0
    SYS_mprotect(0x7f81a84e5000, 16384, 1)              = 0
    SYS_mprotect(0x403000, 4096, 1)                     = 0
    SYS_mprotect(0x7f81a8542000, 4096, 1)               = 0
    SYS_munmap(0x7f81a84f1000, 168686)                  = 0
    puts("Hello world!" <unfinished ...>
    SYS_fstat(1, 0x7ffc85345d50)                        = 0
    SYS_brk(0)                                          = 0x662000
    SYS_brk(0x683000)                                   = 0x683000
    SYS_write(1, "Hello world!\n", 13Hello world!
    )                  = 13
    <... puts resumed> )                                = 13
    SYS_exit_group(0 <no return ...>
    +++ exited (status 0) +++
    ```

6. 注:我们看到它实际是用SYS_write系统调用来做打印输出,其实write()函数是SYS_write的封装,SYS_write是真正的系统调用
