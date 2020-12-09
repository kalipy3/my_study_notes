```
gdb调试linux0.11源码有时候看不到源码的问题解决.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-09 21:26
```

1. 现有源码目录结构如下:
    ```
    kalipy@debian ~/桌/L/init> pwd
    /home/kalipy/桌面/Linux-0.11-master/init
    kalipy@debian ~/桌/L/init> ls
    main.c  main.o
    
    ```

    比如,下面gdb是可以正确找到源码的
    ```
    (gdb)directory ./Linux-0.11-master //设置源码目录
    (gdb)b main //给main()下断点
    (gdb)c //运行到断点处
    ```

2. 又有源码目录结构如下:
    ```
    kalipy@debian ~/桌/L/mm> pwd
    /home/kalipy/桌面/Linux-0.11-master/mm
    kalipy@debian ~/桌/L/mm> ls
    Makefile  memory.c  memory.o  mm.o  page.o  page.s

    ```
    现在,下面gdb调试到memory.c里的代码时，却说找不到源码
    ```
    (gdb)directory ./Linux-0.11-master //设置源码目录
    (gdb)b xxx//给memory.c的xxx函数下断点
    (gdb)c //运行到断点处
    ```

    解决：
    ```
    (gdb)directory ./Linux-0.11-master //设置源码目录
    (gdb)directory ./Linux-0.11-master/mm 
    (gdb)b xxx//给memory.c的xxx函数下断点
    (gdb)c //运行到断点处
    ```

3. 当gdb说找不到linux0.11的某些代码时，就用directory加载不同父/子目录，多试几个目录即可，猜测可能是代码中的include的问题
