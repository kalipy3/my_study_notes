#! /usr/bin/env python
# -*- coding: utf-8 -*-
# vim:fenc=utf-8
#
# Copyright © 2020 2020-11-11 16:46 kalipy <kalipy@debian>
#
# Distributed under terms of the MIT license.

# -*- coding: utf-8 -*-

import os
import time

# 点亮手机
os.system("adb shell input keyevent 224")
time.sleep(1)

# 启动相机
os.system("adb shell am start -a android.media.action.STILL_IMAGE_CAMERA")
time.sleep(3) #多留点时间自动对焦

# camera键 拍照
os.system("adb shell input keyevent 27")
time.sleep(1) #留点时间存储照片 以免死机

#myfilename = os.popen("adb shell ls /storage/sdcard0/DCIM/Camera/ | head -n 1 | tr -d '\n' ").read()
#因为脚本输出文件名后面带了个换行符号 所以用 tr -d '\n' 来删掉换行符，有一些换行符是\r
#print("--")
#print(myfilename) 
#print("--") #debug看看前后是否有换行符
time.sleep(1)

os.system("adb shell mv '/storage/sdcard0/DCIM/Camera/*.jpg' '/storage/sdcard0/DCIM/Camera/1.jpg'")

# 将这个文件pull到本地电脑上
#adbcode = "adb pull /storage/sdcard0/DCIM/Camera/"+str(myfilename)
adbcode = "adb pull /storage/sdcard0/DCIM/Camera/1.jpg"
os.system(adbcode)
time.sleep(1)

os.system("adb shell rm /storage/sdcard0/DCIM/Camera/*")

# back键 暂退相机
os.system("adb shell input keyevent 4")
time.sleep(1)

# Power键 黑屏
os.system("adb shell input keyevent 26")


