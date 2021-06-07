    linux命令行串口调试.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2021-06-07 21:54

    #查看当前终端的参数
    stty

    #查看ttyUSB0设备的参数
    stty -F /dev/ttyUSB0

    #设置波特率，ispeed为input speed,ospeed为output speed
    stty -F /dev/ttyUSB0 ispeed 9600 ospeed 9600
    #或者
    stty -F /dev/ttyUSB0 9600

    #向串口写入数据
    kalipy@debian ~/b/m/docker> echo -c "AT+CFUN?\r\n" > /dev/ttyUSB0
    
    #读取串口返回的数据
    kalipy@debian ~/b/m/docker> cat /dev/ttyUSB0
