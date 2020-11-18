```
标准stm32库_keil5项目移植为gcc_makefile项目.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-18 12:07
```

### 生成或自己写makefile文件模板
1. 用cubemx生成一个空项目,找到它自动生成的makefile文件

2. 我们只要修改这个cubemx生成的makefile即可

3. 把这个makefile移动到你要移植的那个keil5项目文件夹里

### 怎么修改makefile
1. 其实keil5的xx.uvprojx本质就是一个xml格式的makefile文件，我们只要把xx.uvprojx中的文件一个一个对应到makefile即可(可以自己手动搬砖，也可以自己写个xml解析根据自动搬砖)

### 修改makefile

1. 在C_SOURCES中添加.c文件(根据xx.uvprojx文件)
```
C_SOURCES =  \
./Main/main.c \
./Main/stm32f4xx_it.c \
./Startup_config/system_stm32f4xx.c \
./USER/KEY/key.c \
./USER/LED/led.c \
./USER/LCD/lcd.c \
./USER/BEEP/beep.c \
./USER/usart3/usart3.c \
./STM32F4_FWLIB/src/misc.c \
./STM32F4_FWLIB/src/stm32f4xx_gpio.c \
./STM32F4_FWLIB/src/stm32f4xx_rcc.c \
./STM32F4_FWLIB/src/stm32f4xx_usart.c \
./STM32F4_FWLIB/src/stm32f4xx_fsmc.c \
...
....
```

2. ASM sources不要用keil5的，还是用cubemx生成的(或者哪个编译不报错用哪个)
```
# ASM sources
ASM_SOURCES =  \
startup_stm32f407xx.s
#./Startup_config/startup_stm32f40_41xxx.s
```

3. C defines不要用cubemx的，还是用xx.uvprojx的(或者哪个编译不报错用哪个)
```
# C defines
C_DEFS =  \
-DSTM32F40_41xxx \
-DUSE_STDPERIPH_DRIVER
#-DUSE_HAL_DRIVER \
#-DSTM32F407xx
```

4. 添加.h文件
```
# C includes
C_INCLUDES =  \
-I./gg
...
....
```

5. .ld文件用cubemx自动生成的，不用xx.uvprojx的(或者哪个编译不报错用哪个)
```
# link script
LDSCRIPT = STM32F407ZGTx_FLASH.ld
```
