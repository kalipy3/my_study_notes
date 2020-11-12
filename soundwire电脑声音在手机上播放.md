```
:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-12 19:32
```

### 手机端

下载soundwire安卓版本.apk文件并安装

### 电脑端

1. 从soundwire官网官网下载对应Linux版本.tar.gz压缩文件解压soundwire.tar.gz，得到的文件夹里面有install.txt，安装文档，里面有详细的安装方法、步骤，按照里面的步骤来就行了

2. 确保59010 & 59011端口不被占用

3. `sudo apt-get install pavucontrol`

4. 为了能在命令行使用Soundwire，将Soundwire文件夹添加到环境变量
```
sudo vim /etc/profile
```

5. 在末尾添加: `export PATH=$PATH:/home/xx/xx/SoundWireServer`

6. 使配置生效: `source /etc/profile`

7. 使用: `SoundWireServer`

8. 如果不想使用图形界面，可以加上-nogui参数：
`SoundWireServer -nogui`

