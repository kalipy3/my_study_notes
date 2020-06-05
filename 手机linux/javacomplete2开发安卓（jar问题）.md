# vim java代码补全插件优化vim-javacomplete

1.简介:  
* javacomplete是一个vim上java语言的代码自动补全插件，借助ta和我的其它的一些命令行带源码调试程序的教程，在校大一大二（大学生刚开始我不推荐用ide，我们应该多加了解ide背后的大量隐藏细节）新手几乎可以完全抛弃android studio和ecplise及idea开发j2ee和安卓应用。

2.百度必应谷歌上安装存在的不足或问题：  
* 对第三方jar包支持不好，或者网上没讲清楚
* gradle绝大多数人不会用，以至于安卓代码无法补全或者通过gradle下载的.arr包不知道怎么让javacomplete识别，然后也补全不了


# 安装vim-javacomplete
* 这个比较简单，请直接参考网上的教程或者我们相关文章。/别打我，尽量自己多尝试嘛~嘿嘿嘿。


# 配置对第三方jar的支持和对gradle .arr的jar的支持
* 方法一：  
### 1.添加对第三方jar包代码补全的支持  
linux命令行输入：`sudo vim /etc/profile`在dt.jar后添加：  
`:/home/android/android_sdk/platforms/android-29/android.jar:bin/classes`  ,如下：

```
#openjdk
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-arm64
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib/tools.jar:${JRE_HOME}/lib/dt.jar:/home/android/android_sdk/platforms/android-29/android.jar:bin/classes
export PATH=${JAVA_HOME}/bin:${JAVA_HOME}/jre/bin:$PATH
```

***可以把自己要使用的任何jar包加入环境变量中，只要在CLASSPATH中javacomplete即可识别，因为其工作原理就是这样的***  
### 2.添加对gradle .arr的jar代码补全的支持  
找到gradle第三方jar的下载路径（请百度，很容易找到的），比如你要添加xx.jar包的代码补全，找到对应的xx.arr，解压，然后把解压出的classes.jar加到`vim /etc/profile`的java环境变量即可。  
***此方法存在的不足:***  
1.要向/etc/profile文件添加大量环境变量，以后看profile文件就痛苦了，全都是密密麻麻的配置  
2.要手动添加，麻烦得简直了

***注意！！！  
在src目录下存放你的java代码，可以是有很多子目录的很深的层级，但是`vim xx.java`一定要在src目录下执行，才可以识别代码补全。这个是javacomplete的默认配置***

方法二(推荐)：  

从方法一中我们有说，javacomplete对第三方jar的支持是通过添加环境变量的方式实现的，鉴于手动配置太麻烦，所以我们程序员自然想到偷懒，写自动化工具，而这个，其实官方已经帮我们写好啦，只是官方什么也没说，就给了个classpath.gradle文件而已，官方没说怎么用，谷歌也百度不到教程，所以很多人的gradle的安卓代码补全不了。

### 前置：先运行gradle build构建你的项目一遍
***1.vim-javacomplete插件中把classpath.gradle复制到你的项目xxx/里面  
2.把你项目的build.gradle备份为build.gradle.bk,改classpath.gradle名字为build.gradle  
3.xxx/中打开你的项目源代码，等待些许时间（javacomplete会自动执行gradle build,即把~/.gradle/xxx/xxx/xxx/巴拉巴拉下的所有.arr和.jar加到java环境变量中）***  

4.以后要构建编译xxx项目怎么办？  
答：把classpath.gradle备份，build.gradle.bk恢复备份，gradle build 

# 本教程完~


