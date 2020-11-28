```
linux禁用和启用swap分区.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-28 16:21
```

### 禁用swap分区(不是swap分区文件)

1. 禁用命令  
`sudo swapoff -a`

2. 启用命令  
`sudo swapon -a`

3. 查看swap状态  
`sudo free -h`

4. 重启电脑后也有效，即永久禁用  
`sudo vim /etc/fstab`  
把swap分区的那行#注释掉

5. 删除swap分区(可选)

### 启用swap(分区文件形式)

1. 添加swap分区或者文件(这里我用文件演示,且创建为2g大小)  
`sudo dd if=/dev/zero of=/var/swapfile bs=1024 count=2048k`

2. 请耐心等待几分钟，不是卡死

3. 格式化并转化为swap分区文件  
`sudo mkswap /var/swapfile`

4. 挂载并激活  
`sudo swapon /var/swapfile`

5. 若要重启后也有效`sudo vim /etc/fstab`,添加一行
`/var/swapfile swap swap defaults 0 0`


### 禁用swap分区文件

1. 停止正在使用的swap分区文件  
`sudo swapoff /var/swapfile`

2. 删除swap分区文件  
`sudo rm /var/swapfile -rf`

3. 重启电脑后也有效，即永久禁用  
`sudo vim /etc/fstab`  
把swap分区文件的那行#注释掉

