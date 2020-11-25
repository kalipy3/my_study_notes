```
ctags和cscope的java代码跳转.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-25 21:20
```

---
### cscope

1. `find ./src -iname "*.java" > cscope.file`

2. `cscope -bkq -i cscope.file  //-i 指定输入文件` 

---
### ctags
1. `ctags -R`

---
### 进阶：比如我们不但要查看自己的src下的代码，关键还想查看j2ee各种框架和jdk的jar源码怎么办?解决：

1. find命令找到源码jar包,比如我这里是用的gradle来管理下载jar包,且以activemq-all.jar为例：
```
$ find ~/.gradle -iname "activemq*.jar"  //~/.gradle是gradle的根目录                                    
/home/kalipy/.gradle/caches/modules-2/files-2.1/org.apache.activemq/activemq-all/5.9.1/a2b5134755895edc9e0217f1998467d0bfbfe833/activemq-all-5.9.1.jar
```
2. 在你的jave项目根目录随便新建一个文件夹，比如我这里
`mkdir gg   //目录结构见5`

3. 复制activemq.jar到gg目录并解压
```
cp /home/kalipy/.gradle/caches/modules-2/files-2.1/org.apache.activemq/activemq-all/5.9.1/a2b5134755895edc9e0217f1998467d0bfbfe833/activemq-all-5.9.1.jar gg/.
unzip activemq-all-5.9.1.jar
```

4. 在java项目根目录下
```
find ./src -iname "*.java" > cscope.file //建议cscope的只加src，不要加入框架和jdk的源码，这样cscope用来搜索自己写的java代码,ctags用来搜索跳转框架和jdk的源码,不然cscope搜索到的东西实在太多了
cscope -bkq -i cscope.file  //-i 指定输入文件
ctags -R
```

5. 目录结构如下：
```
$ tree -L 2                                                                  
.
├── build
│   ├── classes
│   ├── distributions
│   ├── generated
│   ├── libs
│   ├── reports
│   ├── scripts
│   ├── test-results
│   └── tmp
├── build.gradle
├── cscope.file
├── cscope.in.out
├── cscope.out
├── cscope.po.out
├── gg
│   ├── activemq-all-5.9.1.jar
│   ├── activemq.xsd
│   ├── activemq.xsd.html
│   ├── activemq.xsd.wiki
│   ├── javax
│   ├── META-INF
│   └── org
├── gradle
│   └── wrapper
├── gradlew
├── gradlew.bat
├── settings.gradle
├── src
│   ├── main
│   └── test
└── tags
```
