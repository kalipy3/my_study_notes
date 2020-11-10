#! /bin/sh
#
# stm32fxx_telnet_start.sh
# Copyright (C) 2020 kalipy <kalipy@debian>
#
# Distributed under terms of the MIT license.
#

#启动仿真器
openocd -f /home/kalipy/openocd-stm32f4x.cfg &
sleep 2
#用telnet连接openocd,echo是给telnet内部传递命令，去掉echo的话，则是给linux shell传递命令，因为halt等命令是telnet的，不是shell的，所以要用echo
(
echo "halt"
sleep 2
echo "flash write_image erase /home/kalipy/3.hex"
sleep 8
echo "reset"
sleep 1
#退出telnet
echo "quit;"
echo "exit"
) | telnet 127.0.0.1 4444
sleep 1
#退出openocd
kill -9 $(ps -e | grep openocd | grep -v grep | awk '{print $1}')
