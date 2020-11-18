```
linux+openocd+arm-none-eabi-gdb调试stm32.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-18 12:56
```

### 比如你的stm32项目编译后生成了x.elf x.hex x.bin文件
1. 去官网下载交叉调试工具arm-none-eabi-gdb

2. 运行命令：
```
openocd -f openocd-stm32f4x.cfg     //(等待gdb的调试或telnet的连接)
```

3. `./arm-none-eabi-gdb x.elf`

4. target上去(openocd给gdb开的debug端口是3333)
```
(gdb)target remote 127.0.0.1:3333
```

5. 分别执行:
```
(gdb)monitor reset
(gdb)monitor halt
(gdb)load
```

6. 加载项目的代码目录
```
(gdb)directory ./Main
```

7. 下断点，比如给main()下个断点
```
(gdb)layout split //显示汇编窗口和源码窗口
(gdb)b main //main函数下断点
```

8. 开始调试
```
(gdb)c 
```
