```
gdb调试多线程.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-12 14:24
```

### test

1. 必要的说明:
    ```
    pthread_join 
    函数pthread_join用来等待一个线程的结束,线程间同步的操作。头文件 ： #include <pthread.h>
    函数定义： int pthread_join(pthread_t thread, void **retval);
    描述 ：pthread_join()函数，以阻塞的方式等待thread指定的线程结束。当函数返回时，被等待线程的资源被收回。如果线程已经结束，那么该函数会立即返回。并且thread指定的线程必须是joinable的。
    参数 ：thread: 线程标识符，即线程ID，标识唯一线程。retval: 用户定义的指针，用来存储被等待线程的返回值。
    返回值 ： 0代表成功。 失败，返回的则是错误号。
    ----------------------------------------------------------------
    linux中的应用
    在Linux中，默认情况下是在一个线程被创建后，必须使用此函数对创建的线程进行资源回收，但是可以设置Threads attributes来设置当一个线程结束时，直接回收此线程所占用的系统资源，详细资料查看Threads attributes。
    其实在Linux中，新建的线程并不是在原先的进程中，而是系统通过一个系统调用clone()。该系统调用copy了一个和原先进程完全一样的进程，并在这个进程中执行线程函数。不过这个copy过程和fork不一样。 copy后的进程和原先的进程共享了所有的变量，运行环境。这样，原先进程中的变量变动在copy后的进程中便能体现出来。
    pthread_join的应用
    pthread_join使一个线程等待另一个线程结束。
    代码中如果没有pthread_join主线程会很快结束从而使整个进程结束，从而使创建的线程没有机会开始执行就结束了。加入pthread_join后，主线程会一直等待直到等待的线程结束自己才结束，使创建的线程有机会执行。
    ```

1. 有如下demo:
    ```
    kalipy@debian ~/g/gdb> nl test_thread.c
     1  /*
     2   * test_thread.c
     3   * Copyright (C) 2020 2020-12-12 13:42 kalipy <kalipy@debian>
     4   *
     5   * Distributed under terms of the MIT license.
     6   */
     7  #include <stdio.h>
     8  #include <unistd.h>
     9  #include <pthread.h>

    10  int x = 0, y = 0;//用于线程一，y用于线程二
    11  pthread_t pthid1, pthid2;

    12  //第一个线程的主函数
    13  void * pth1_main(void *arg);

    14  //第二个线程的主函数
    15  void * pth2_main(void *arg);

    16  int main(void)
    17  {
    18      //创建线程一
    19      //RETURN VALUE
    20      //On  success, pthread_create() returns 0; on error, it returns an error num‐ber, and the contents of *thread are undefined.
    21      if (pthread_create(&pthid1, NULL, pth1_main, (void*)0) != 0)
    22      {
    23         printf("pthread_create pthid1 failed.\n");
    24         return -1;
    25      }
    26
    27      //创建线程二
    28      if (pthread_create(&pthid2, NULL, pth2_main, (void*)0) != 0)
    29      {
    30         printf("pthread_create pthid2 failed.\n");
    31         return -1;
    32      }

    33      printf("111\n");
    34      pthread_join(pthid1, NULL);
    35
    36      printf("222\n");
    37      pthread_join(pthid2, NULL);
    38
    39      printf("333\n");

    40      return 0;
    41  }

    42  //第一个线程的主函数
    43  void * pth1_main(void *arg)
    44  {
    45      for (x = 0; x < 3; x++)
    46      {
    47          printf("pth1_main_x=%d\n", x);
    48          sleep(1);
    49      }
    50      pthread_exit(NULL);
    51  }

    52  //第二个线程的主函数
    53  void * pth2_main(void *arg)
    54  {
    55      for (y = 0; y < 3; y++)
    56      {
    57          printf("pth2_main_y=%d\n", y);
    58          sleep(1);
    59      }
    60      pthread_exit(NULL);
    61  }
    62  //注意:用gcc编译时带上参数
    63  //man 3 pthread
    64  //Compile and link with -pthread
    ```

2. 编译运行情况如下:
    ```
    kalipy@debian ~/g/gdb> gcc test_thread.c -o thread_test -g -pthread
    kalipy@debian ~/g/gdb> ./thread_test
    111
    pth2_main_y=0
    pth1_main_x=0
    pth1_main_x=1
    pth2_main_y=1
    pth1_main_x=2
    pth2_main_y=2
    222
    333
    kalipy@debian ~/g/gdb> ./thread_test
    pth2_main_y=0
    pth1_main_x=0
    111
    pth2_main_y=1
    pth1_main_x=1
    pth2_main_y=2
    pth1_main_x=2
    222
    333
    kalipy@debian ~/g/gdb> ./thread_test
    pth1_main_x=0
    111
    pth2_main_y=0
    pth1_main_x=1
    pth2_main_y=1
    pth1_main_x=2
    pth2_main_y=2
    222
    333
    ```

### 一些查看进程和线程的shell命令
    1. 查看当前运行的进程:`ps -aux | grep thread_test`

    2. 查看当前运行的轻量级进程(即线程):`ps -aL | grep thread_test`

    3. 查看主线程和新线程的关系:`pstree -p 主线程id`

### gdb调试

1. 线程调试命令:

    查看线程:`info threads`

    切换线程:`thread 线程id`

    只运行当前线程(其它线程被挂起):`set scheduler-locking on`

    运行全部的线程:`set scheduler-locking off`

    指定某个线程执行某个gdb命令:`thread apply 线程id cmd`

    全部线程都执行某个gdb命令:`thread apply all cmd`

2. 用法跟调试多进程差不多，参见多进程调试
