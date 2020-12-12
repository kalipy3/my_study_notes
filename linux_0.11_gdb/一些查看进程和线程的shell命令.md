```
一些查看进程和线程的shell命令.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-12 15:08
```

1. 查看当前运行的进程:`ps -aux | grep thread_test`

2. 查看当前运行的轻量级进程(即线程):`ps -aL | grep thread_test`

3. 查看主线程和新线程的关系:`pstree -p 主线程id`


