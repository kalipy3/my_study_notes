```
gdb调试多进程.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-12 12:23
```

1. 有test.c如下:
    ```
    kalipy@debian ~/g/gdb> more test.c
    /*
     * test.c
     * Copyright (C) 2020 2020-12-12 12:25 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    #include <stdio.h>
    #include <stdlib.h>
    #include <unistd.h>
    
    int main(void)
    {
        printf("main_start\n");
    
        int res = -1;
        res = fork();
        printf("res:%d\n", res);
        if (res != 0) {
            printf("我是父进程:pid=%d,ppid=%d\n", getpid(), getppid());
    
            int i;
            for (i = 0; i < 5; i++)
            {
                printf("i=%d\n", i);
                sleep(1);
            }
            exit(0);
        } else {
            printf("我是子进程:pid=%d, ppid=%d\n", getpid(), getppid());
    
            int j;
            for (j = 0; j < 5; j++)
            {
                printf("j=%d\n", j);
                sleep(1);
            }
            exit(0);
        }
    
        return 0;
    }
    
    ```

2. 正常编译运行情况如下:
    ```
    kalipy@debian ~/g/gdb> gcc test.c
    kalipy@debian ~/g/gdb> ./a.out
    main_start
    res:20991
    我是父进程:pid=20990,ppid=18878
    i=0
    res:0
    我是子进程:pid=20991, ppid=20990
    j=0
    i=1
    j=1
    i=2
    j=2
    i=3
    j=3
    i=4
    j=4
    
    //请注意fork的原理，即它会返回2次
    //On  success
    //the PID of the child process is returned in the parent, and 0 is returned in the child.
    //On failure
    //-1 is returned in the parent,no child process is created, and errno is set appropriately.
    ```

### 接下来用gdb调试

1. 先看gdb命令
    ```
    调试父进程: set follow-fork-mode parent(缺省)
    调试子进程: set follow-fork-mode child

    设置调试模式: set detach-on-fork[on|off]
        缺省为on表示调试当前进程的时候，其他的进程继续运行
        如果用off,表示调试当前进程的时候，其他的进程被gdb挂起

    查看调试的进程: info inferiors

    切换当前调试的进程: inferior 进程的id或gdb给的编号
    ```

2. 请观察现象
    ```
    kalipy@debian ~/g/gdb> gdb a.out
    Reading symbols from a.out...done.
    (gdb) b 12
    Breakpoint 1 at 0x40118b: file test.c, line 13.
    (gdb) r
    Starting program: /home/kalipy/gg/gdb/a.out

    Breakpoint 1, main () at test.c:13
    13          printf("main_start\n");
    (gdb) n
    main_start
    15          int res = -1;
    (gdb) n
    16          res = fork();
    (gdb) n
    [Detaching after fork from child process 22277]
    res:0
    我是子进程:pid=22277, ppid=22261
    j=0
    17          printf("res:%d\n", res);
    (gdb) j=1
    j=2
    j=3
    j=4

    res:22277
    18          if (res != 0) {
    (gdb) n
    19              printf("我是父进程:pid=%d,ppid=%d\n", getpid(), getppid());
    (gdb) n
    我是父进程:pid=22261,ppid=22245
    22              for (i = 0; i < 5; i++)
    (gdb) n
    24                  printf("i=%d\n", i);

    ```

3. 上面缺省是调试父进程，接下来我们调试子进程
    ```
    kalipy@debian ~/g/gdb> gdb a.out
    (gdb) b 13
    Breakpoint 1 at 0x40118b: file test.c, line 13.
    (gdb) set follow-fork-mode child
    (gdb) r
    Starting program: /home/kalipy/gg/gdb/a.out

    Breakpoint 1, main () at test.c:13
    13          printf("main_start\n");
    (gdb) n
    main_start
    15          int res = -1;
    (gdb) n
    16          res = fork();
    (gdb) n
    [Attaching after process 22724 fork to child process 22730]
    [New inferior 2 (process 22730)]
    [Detaching after fork from parent process 22724]
    [Inferior 1 (process 22724) detached]
    res:22730
    我是父进程:pid=22724,ppid=22697
    i=0
    [Switching to process 22730]
    main () at test.c:17
    17          printf("res:%d\n", res);
    (gdb) i=1
    i=2
    i=3
    i=4

    res:0
    18          if (res != 0) {
    (gdb) n
    29              printf("我是子进程:pid=%d, ppid=%d\n", getpid(), getppid());
    (gdb) n
    我是子进程:pid=22730, ppid=1
    32              for (j = 0; j < 5; j++)
    (gdb) n
    34                  printf("j=%d\n", j);
    (gdb) n
    j=0
    35                  sleep(1);
    (gdb) n
    32              for (j = 0; j < 5; j++)
    (gdb) n
    34                  printf("j=%d\n", j);
    ```

4. 步骤2和步骤3虽然可以分别调试父子进程，但是却是互斥的调试，即调试父进程时，子进程不受gdb控制的马上运行完了;调试子进程时，父进程不受gdb控制的继续运行了。有没有什么办法让gdb同时分别调试父进程和子进程呢?见步骤5

5. 
    ```
    kalipy@debian ~/g/gdb> gdb a.out
    Reading symbols from a.out...done.
    (gdb) b 13
    Breakpoint 1 at 0x40118b: file test.c, line 13.
    (gdb) set detach-on-fork off
    (gdb) r
    Starting program: /home/kalipy/gg/gdb/a.out

    Breakpoint 1, main () at test.c:13
    13          printf("main_start\n");
    (gdb) n
    main_start
    15          int res = -1;
    (gdb) n
    16          res = fork();
    (gdb) n
    [New inferior 2 (process 24235)]
    Reading symbols from /home/kalipy/gg/gdb/a.out...done.
    Reading symbols from /usr/lib/debug/.build-id/18/b9a9a8c523e5cfe5b5d946d605d09242f09798.debug...done.
    Reading symbols from /usr/lib/debug/.build-id/f2/5dfd7b95be4ba386fd71080accae8c0732b711.debug...done.
    17          printf("res:%d\n", res);
    (gdb) n
    res:24235
    18          if (res != 0) {
    (gdb) n
    19              printf("我是父进程:pid=%d,ppid=%d\n", getpid(), getppid());
    (gdb) n
    我是父进程:pid=24229,ppid=24208
    22              for (i = 0; i < 5; i++)
    (gdb) n
    24                  printf("i=%d\n", i);
    (gdb) n
    i=0
    25                  sleep(1);
    (gdb) n
    22              for (i = 0; i < 5; i++)
    (gdb) n
    24                  printf("i=%d\n", i);
    (gdb) info inferiors
    Num  Description       Executable
    * 1    process 24229     /home/kalipy/gg/gdb/a.out
    2    process 24235     /home/kalipy/gg/gdb/a.out
    (gdb) inferior 2
    [Switching to inferior 2 [process 24235] (/home/kalipy/gg/gdb/a.out)]
    [Switching to thread 2.1 (process 24235)]
    49      ../sysdeps/unix/sysv/linux/arch-fork.h: 没有那个文件或目录.
    (gdb) n
    53      in ../sysdeps/unix/sysv/linux/arch-fork.h
    (gdb) c
    Continuing.
    res:0
    我是子进程:pid=24235, ppid=24229
    j=0
    j=1
    j=2
    j=3
    j=4
    [Inferior 2 (process 24235) exited normally]
    ```
