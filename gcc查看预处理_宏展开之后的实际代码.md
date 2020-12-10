```
gcc查看预处理_宏展开之后的实际代码.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-10 16:13
```

1. 有如下代码(w.c)：
    ```
    #define Malloc(type,size) (type*)malloc(sizeof(type)*size)
    #define f(a,b) a##b   //##为连接 eg：X##Y   结果就是XY
    
    int main()
    {
        int a = f(1,2);
        int *p=Malloc(int,100);

        return 0;
    }
    
    ```

2. 使用gcc对w.c进行预处理
    ```
    kalipy@debian ~/g/strace> gcc w.c -E   
    # 1 "w.c"
    # 1 "<built-in>"
    # 1 "<命令行>"
    # 31 "<命令行>"
    # 1 "/usr/include/stdc-predef.h" 1 3 4
    # 32 "<命令行>" 2
    # 1 "w.c"
    # 11 "w.c"
    int main()
    {
        int a = 12;
        int *p=(int*)malloc(sizeof(int)*100);

        return 0;
    }
    
    ```

3. 上面步骤2只是输出到屏幕，如果想输出到文件里，可以加上`-o`参数
    ```
    kalipy@debian ~/g/strace> gcc w.c -E -o w.i
    kalipy@debian ~/g/strace> more w.i
    # 1 "w.c"
    # 1 "<built-in>"
    # 1 "<命令行>"
    # 31 "<命令行>"
    # 1 "/usr/include/stdc-predef.h" 1 3 4
    # 32 "<命令行>" 2
    # 1 "w.c"
    # 11 "w.c"
    int main()
    {
        int a = 12;
        int *p=(int*)malloc(sizeof(int)*100);

        return 0;
    }
    
    ```

4. 让gcc保留注释,加上`-C`参数
    ```
    kalipy@debian ~/g/strace> gcc w.c -E -C
    # 32 "<命令行>" 2
    # 1 "w.c"
    
    # 1 "w.c"
    /*
     * w.c
     * Copyright (C) 2020 2020-12-10 15:06 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    int main()
    {
        int a = 12;
        int *p=(int*)malloc(sizeof(int)*100);

        return 0;
    }
    ```

----------------------------------------------

### gcc生成可执行文件的实际完整流程

1. 预处理生成.i文件
    ```
    kalipy@debian ~/g/strace> ls 
    w.c
    kalipy@debian ~/g/strace> gcc w.c -E -o w.i
    kalipy@debian ~/g/strace> ls
    w.c  w.i
    
    预处理器处理阶段：
    （1）注释的删除
    （2）头文件的包含和插入
    （3）#define定义的标识符替换
    ```

2. 编译生成.s文件
    ```
    kalipy@debian ~/g/strace> ls
    w.c  w.i
    kalipy@debian ~/g/strace> gcc -S w.i
    w.c: 在函数‘main’中:
    w.c:14:18: 警告：隐式声明函数‘malloc’ [-Wimplicit-function-declaration]
       14 |     int *p=Malloc(int,100);
          |                  ^~~~~~
    w.c:14:18: 警告：隐式声明与内建函数‘malloc’不兼容
    w.c:11:1: 附注：include ‘<stdlib.h>’ or provide a declaration of ‘malloc’
       10 |
      +++ |+#include <stdlib.h>
       11 | int main()
    kalipy@debian ~/g/strace> ls
    w.c  w.i  w.s
    kalipy@debian ~/g/strace> more w.s
            .file   "w.c"
            .text
            .globl  main
            .type   main, @function
    main:
    .LFB0:
            .cfi_startproc
            pushq   %rbp
            .cfi_def_cfa_offset 16
            .cfi_offset 6, -16
            movq    %rsp, %rbp
            .cfi_def_cfa_register 6
            subq    $16, %rsp
            movl    $12, -4(%rbp)
            movl    $400, %edi
            call    malloc
            movq    %rax, -16(%rbp)
            movl    $0, %eax
            leave
            .cfi_def_cfa 7, 8
            ret
            .cfi_endproc
    .LFE0:
            .size   main, .-main
            .ident  "GCC: (GNU) 10.1.0"
            .section        .note.GNU-stack,"",@progbits
    ```

3. 汇编(预处理、编译、汇编)生成w.o文件(也可以直接用as汇编器)
    ```
    kalipy@debian ~/g/strace> ls
    w.c  w.i  w.s
    kalipy@debian ~/g/strace> gcc -c w.c
    w.c: 在函数‘main’中:
    w.c:8:34: 警告：隐式声明函数‘malloc’ [-Wimplicit-function-declaration]
        8 | #define Malloc(type,size) (type*)malloc(sizeof(type)*size)
          |                                  ^~~~~~
    w.c:14:12: 附注：in expansion of macro ‘Malloc’
       14 |     int *p=Malloc(int,100);
          |            ^~~~~~
    w.c:8:34: 警告：隐式声明与内建函数‘malloc’不兼容
        8 | #define Malloc(type,size) (type*)malloc(sizeof(type)*size)
          |                                  ^~~~~~
    w.c:14:12: 附注：in expansion of macro ‘Malloc’
       14 |     int *p=Malloc(int,100);
          |            ^~~~~~
    w.c:1:1: 附注：include ‘<stdlib.h>’ or provide a declaration of ‘malloc’
      +++ |+#include <stdlib.h>
        1 | /*
    kalipy@debian ~/g/strace> ls
    w.c  w.i  w.o  w.s
    
    或者
    kalipy@debian ~/g/strace> as -o w.o w.s
    kalipy@debian ~/g/strace> ls
    w.c  w.i  w.o  w.s
    ```

4. 链接生成可执行程序(也可以直接用ld链接器)
    ```
    kalipy@debian ~/g/strace> ls
    w.c  w.i  w.o  w.s
    kalipy@debian ~/g/strace> gcc -o w w.o
    kalipy@debian ~/g/strace> ls
    w  w.c  w.i  w.o  w.s
    ```

5. 运行w可执行程序
    ```
    kalipy@debian ~/g/strace> ./w
    ```
