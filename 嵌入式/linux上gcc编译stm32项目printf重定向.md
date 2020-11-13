```
:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-14 00:37
```

### 比如我这里用usart3串口

1. cubemx生成一个使能了usartx的项目模板

2. vim usart.c打开自动生成的usart.c文件，USER CODE BEGIN 0和USER CODE BEGIN 1中分别添加如下代码(注意第40行：你配的是usart几就是usart几,我这里是usart3):

    ```
    /* USER CODE BEGIN 0 */
    #include "stdio.h"
    #ifdef __GNUC__
    /* With GCC, small printf (option LD Linker->Libraries->Small printf
       set to 'Yes') calls __io_putchar() */
    #define PUTCHAR_PROTOTYPE int __io_putchar(int ch)
    #else
    #define PUTCHAR_PROTOTYPE int fputc(int ch, FILE *f)
    #endif /* __GNUC__ */
    
    __attribute__((weak)) int _write(int file, char *ptr, int len)
    {
    	int DataIdx;
    
    	for (DataIdx = 0; DataIdx < len; DataIdx++)
    	{
    		__io_putchar(*ptr++);
    	}
    	return len;
    }
    
    /* USER CODE END 0 */
    
    /* USER CODE BEGIN 1 */
    PUTCHAR_PROTOTYPE
    {
        HAL_UART_Transmit(&huart3, (uint8_t*)&ch, 1, 0xFFFF);       //40行
    }
    
    /* USER CODE END 1 */
    ```

3. vim main.c使用(注意：必须加\n，不然还是没用，因为\__io_putchar函数与fputc不同,__io_putchar不加\n不会自动更新缓冲区)
```
printf("hello usartx..\n");
```
