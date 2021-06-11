    gdb花屏问题.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2021-06-11 13:45

### 为什么会花屏

在gdb调试到printf语句后，由于printf本身会在屏幕打印信息，这样就和gdb上窗口的信息杂和在一起了，导致花屏

### 解决

每次花屏出现后，只需`ctrl + l`清屏一下即可
