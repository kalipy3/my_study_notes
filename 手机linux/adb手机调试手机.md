# 手机终端或手机linux adb调试手机

### 前提：
1.被调试的手机开启了开发者选项和usb调试  
2.完全不用数据线的前提，被调试的手机在root情况下本地终端(非手机linux)运行：  
```
su
setprop service.adb.tcp.port 5555
stop adbd
start adbd
```
3.被调试的a手机无法root,那么只需电脑(手机otg也可以，即手机连手机)usb数据线连接手机一次，依次运行：  
* `adb tcpip 5555`  
* `adb connect ip`  
然后`adb devices`即可看到无线调试可用了  
* 断开usb线，用其它任意n手机都可以调试该a手机了,而且还不用导adbkey和adbkey.pub
* 顺便一提：只要手机没有开关机，那么以后就可以都不用连数据线啦
* 如果提示offline，那么参见后面的“一些问题：手机调试手机提示offline”中的a)


### 手机adb手机报错`outhoxx`无法验证的问题  
解决：  
* 1.把C:\Users\bossliu\.android路径下的adbkey和adbkey.pub删除  
* 2.先在电脑端usb连接手机，运行adb devices，电脑会在C:\Users\bossliu\.android下生成adbkey和adbkey.pub两个文件  
* 3.a)如果是在手机linux下调试本手机或者调试其他人的手机，就把这两个文件放到~/.android目录(linux环境下的)里面  
* b)如果是在手机终端下(非手机linux环境)，则把这两个文件放到手机内置存储卡的.android目录下  
* 4.adb devices或者adb connect ip即可

### 一些问题：手机调试手机提示offline
***a)wifi adb connect后adb devices提示offline***  
* 解决：开关手机开发者模式下的usb调试，然后此时不要运行adb devices，不然它会默认连接usb的devices(开了usb模式，wifi自然就是offline了)，所以，此时要直接运行adb connect ip，然后wifi的devices就是不是offline啦

***b)手机linux(猜测是linux adb版本的问题)***
* 1.`adb kill-server`
* 2.关闭手机开发者模式下的usb调试
* 3.`adb connect ip`
* 4.开启手机开发者模式下的usb调试
* 5.再次`adb connect ip`
* 6.adb devices查看wifi不是offline状态而是devices可调试了  
注意：ip填你被调试的手机的自己的ip,如：192.168.43.1之类的

### 见下例子：

```
android@localhost:~/.android$ adb kill-server
cannot connect to daemon at tcp:5037: Connection refused
android@localhost:~/.android$ adb connect 192.168.43.1
* daemon not running; starting now at tcp:5037
* daemon started successfully
unable to connect to 192.168.43.1:5555: Connection refused

android@localhost:~/.android$ adb devices
List of devices attached

android@localhost:~/.android$ adb connect 192.168.43.1
connected to 192.168.43.1:5555
android@localhost:~/.android$ adb devices
List of devices attached
192.168.43.1:5555       device
```

### 推荐做法：
* 1.每次使用完adb后建议运行adb kill-server进行收尾工作，不然别的手机去调试可能就offline了
* 2.出了错误建议运行adb kill-server和开关手机的usb调试
