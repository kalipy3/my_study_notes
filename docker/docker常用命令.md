```
docker常用命令.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-29 19:48
```

# docker常用命令01
```
docker info

docker --help
#查看已下载的镜像
docker images
docker images -aq

#搜索镜像
docker search mysql
docker search --help
#搜索stars大于1000的
docker search mysql --filter stars=1000

#下载mysql镜像
docker pull mysql
#版本有哪些在这里看hub.docker.com
docker pull mysql:8.0

#删除镜像
docker rmi -f id
docker rmi -f $(docker images -aq)

#启动并进入容器 -it什么意思? 参考docker run --help自己看
docker run -it centos /bin/bash
#查看正在运行的容器
docker ps
#查看曾经运行过的容器
docker ps -a
#删除容器
docker rm id
docker rm -f $(docker ps -aq)
#启动和停止容器
docker start id
docker restart id
docker stop id
docker kill id

#后台启动docker容器 用docker ps查看时，发现停止了
docker run -d centos
#进入正在运行的容器
#方式一
docker exec -it id bashshell
docker exec -it xxx /bin/bash
#方式二
docker attach id
#区别
docker exec # 进入容器后开启一个新的终端，可以在里面操作(常用)
docker attach 进入容器正在执行的终端，不会启动新的进程

#容器数据拷贝到主机
docker cp 0569081aa89c:/home/test.java ./. 

#查看资源占用
docker stats

#nginx运行测试
#-d 后台运行，--name 命名，-p 暴露端口，3344服务器、宿主机的端口，容器内部端口
docker run -d --name nginx01 -p:3344:80 nginx
#进入容器
docker exec -it nginx01 /bin/bash

#tomcat运行测试
#启动运行，应该加上版本号,不然会去pull最新版的
docker run -d -p 3355:8080 --name tomcat01 tomcat:9.0
#进入容器
docker exec -it tomcat01 /bin/bash
```

# docker常用命令02
```
#docker的镜像都是只读的,当容器启动时，一个新的可写层被加载到镜像的顶部，做一层为容器层

#提交一个镜像
docker commit -m="提交说明" -a="作者" 容器id 目标镜像名:[tag]

#容器数据卷 容器删除数据不会丢失 即容器数据自动和容器外同步持久化的一个数据共享技术
#使用方式一 -v 挂载 无论如何 内容都会双向同步
docker run -it -v 主机目录:容器内的目录
docker run -it -v ~/gg/temp:/home centos /bin/bash

#mysql数据持久化测试
sudo docker run -d -p 3311:3306 -v ~/gg/temp/mysql/conf:/etc/mysql/conf.d -v ~/gg/temp/mysql/data:/var/lib/mysql --name mysql02 -e MYSQL_ROOT_PASSWORD=Abcd1234 mysql:8.0

#匿名挂载与具名挂载
#匿名挂载 -v 容器内路径
docker run -d -P --name nginx01 -v /etc/nginx nginx
#查看所有的volume的情况
docker volume ls

#具名挂载(常用) -v 卷名:容器内路径
docker run -d -P --name nginx02 -v juming-nginx:/etc/nginx nginx
docker volume ls

#所有的docker容器内的卷，没有指定目录的情况下都是在/var/lib/docker/volumes/xxx/_data,具名挂载可以方便的找到一个卷
docker volume inspect juming-nginx

#总结
#匿名挂载
-v 容器内路径

#具名挂载
-v 卷名:容器内路径

#指定路径挂载
-v /宿主机的路径:容器内路径

#只读挂载 ro:这个路径只能通过宿主机来操作，容器无权限写
docker run -d -P --name nginx03 -v juming-nginx:/etc/nginx:ro nginx

#可读可写挂载
docker run -d -P --name nginx04 -v juming-nginx:/etc/nginx:rw nginx

#多个容器之间数据共享同步
sudo docker run -d -p 3310:3306 -v ~/gg/temp/mysql/conf:/etc/mysql/conf.d -v ~/gg/temp/mysql/data:/var/lib/mysql --name mysql01 -e MYSQL_ROOT_PASSWORD=Abcd1234 mysql:8.0
sudo docker run -d -p 3311:3306 --name mysql02 --volumes-from mysql01 -e MYSQL_ROOT_PASSWORD=Abcd1234 mysql:8.0
```
# docker常用命令03
```
#dockerfile的一般步骤
1.编写dockerfile
2.docker build 构建生成镜像
3.docker run 运行镜像
4.docker push 发布镜像

#每个保留关键字都必须大写 每条命令都会创建提交为一个新的镜像层
#eg.可写容器(container)-->镜像(tomcat)-->镜像(jdk)-->rootfs基础镜像(centos)-->bootfs

#dockerfile的命令有:
FROM            #基础镜像，一切的起点
MAINTAINER      #镜像谁写的,姓名+邮箱
RUN             #镜像构建时要运行的命令
ADD             #添加的内容
WORKDIR         #镜像的工作目录
VOLUME          #挂载目录
EXPOSE          #对外暴露的端口
CMD             #指定这个容器启动时要运行的命令
ENTRYPOINT      #同上 区别后面讲
ONBUILD         #
COPY            #类似ADD,将文件copy到镜像
ENV             #构建的时候要设置的环境变量

#test构建一个自己的centos
#1.编写dockerfile文件
FROM centos
MAINTAINER kalipy3<3069087972@qq.com>
ENV MYPATH /usr/local
WORKDIR $MYPATH
RUN yum -y install vim
RUN yum -y install net-tools
EXPOSE 80
CMD echo $MYPATH
CMD echo "---end---"
CMD /bin/bash

#build 如果你发现build没反应，请用strace命令调试一下就知道了
sudo docker build -t mycentos:0.1 .

#运行自己构建的image
docker run -it mycentos:0.1
#查看容器怎么构建过来的
docker history 容器id
```
# docker常用命令04
```
#构建tomcat镜像 并测试我的01Servlet项目 麻烦的地方为mysql使用的是docker mysql8.0的，要把我debian中mysql8.0的数据先导入到docker的mysql8.0中，在这里会有大量的mysql报错问题
1.准备好tomcat和jdk的压缩包

2.编写Dockerfile
FROM centos
MAINTAINER kalipy3<3069087972@qq.com>
COPY readme.txt /usr/local/readme.txt
COPY jdk1.8.0_251 /usr/local/
ADD apache-tomcat-9.0.38.tar.gz /usr/local/
ENV MYPATH /usr/local
WORKDIR $MYPATH
ENV JAVA_HOME /usr/local/jdk1.8.0_251
ENV CLASSPATH $JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
ENV CATALINA_HOME /usr/local/apache-tomcat-9.0.38
ENV CATALINA_BASH /usr/local/apache-tomcat-9.0.38
ENV PATH $PATH:$JAVA_HOME/bin:$CATALINA_HOME/lib:$CATALINA_HOME/bin
EXPOSE 8080
CMD /usr/local/apache-tomcat-9.0.38/bin/startup.sh && tail -F /usr/local/apache-tomcat-9.0.38/bin/logs/catalina.out

3.运行
sudo docker run -d -p 9090:8080 --name tamcat_kaliy3 -v ~/gg/temp/mytomcat:/usr/local/apache-tomcat-9.0.38/webapps/ -v ~/gg/temp/mytomcat/logs/:/usr/local/apache-tomcat-9.0.38/logs mytomcat:0.1

#先停止宿主机的mysql8.0
4.sudo docker run -d -p 3306:3306 -v ~/gg/temp/mysql/conf:/etc/mysql/conf.d -v ~/gg/temp/mysql/data:/var/lib/mysql --name mysql8.0 -e MYSQL_ROOT_PASSWORD=Abcd1234 mysql:8.0

#mysql8.0报错问题
1. mysql8之前的版本使用的密码加密规则是mysql_native_password，但是在mysql8则是caching_sha2_password，所以需要修改密码加密规则。
2.我使用的是docker容器，安装了最新版的mysql。 客户端使用的是dbever,可能是驱动版本较低
3. 修改数据库中的密码加密规则：
root@b8b62eff723a:/# mysql -p
Enter password:
alter user 'root' @'localhost' identified with mysql_native_password by 'Abcd1234'; by后面输入密码，可以通过该语句修改密码，若不需要修改密码则输入原来的密码
这里root @localhost 修改后连接ok,但是导入.sql文件就会报错
修改为root @% 后就可以导入成功了
alter user 'root'@'%' identified with mysql_native_password by 'Abcd1234';
最后更新到硬盘
FLUSH PRIVILEGES;

5.WEB-INF/classes/c3p0-config.xml修改ip为docker的mysql8.0的ip ip用sudo docker inspect 容器id查看
<property name="jdbcUrl">jdbc:mysql://172.17.0.3:3306/bookstore_01</property>

6.浏览器访问127.0.0.1:9090

7.tomcat报错问题
The driver has not received any packets from the server
原因：驱动程序没有收到来自服务器的任何数据包，说人话就是数据库服务停止了。
请把.xml或xx.property的localhost改为docker中mysql的ip

8.mysql报错问题
MySql Host is blocked because of many connection errors; unblock with 'mysqladmin flush-hosts' 解决方法
错误：Host is blocked because of many connection errors; unblock with 'mysqladmin flush-hosts'

原因：

　　同一个ip在短时间内产生太多（超过mysql数据库max_connection_errors的最大值）中断的数据库连接而导致的阻塞；

解决方法：

1、提高允许的max_connection_errors数量（治标不治本）：

　　① 进入Mysql数据库查看max_connection_errors： show variables like '%max_connection_errors%';

　   ② 修改max_connection_errors的数量为1000： set global max_connect_errors = 1000;

　　③ 查看是否修改成功：show variables like '%max_connection_errors%';

2、使用mysqladmin flush-hosts 命令清理一下hosts文件（不知道mysqladmin在哪个目录下可以使用命令查找：whereis mysqladmin）；

　　① 在查找到的目录下使用命令修改：/usr/bin/mysqladmin flush-hosts -h192.168.1.1 -P3308 -uroot -prootpwd;

　　备注：

　　　　其中端口号，用户名，密码都可以根据需要来添加和修改；

　　　　配置有master/slave主从数据库的要把主库和从库都修改一遍的（我就吃了这个亏明明很容易的几条命令结果折腾了大半天）；

　　　　第二步也可以在数据库中进行，命令如下：flush hosts;

原因

该host上部署的服务因数据库帐号配置错误，导致短时间内连接MySQL服务失败次数超过max_connection_errors参数设定值(默认10)，从而被拒绝。

解决方法

方法一：

刷新记录报错host的文件

mysqladmin  -uroot -p  -h192.168.1.1 flush-hosts

或

mysql>flush hosts;

注意：数据库主从服务器要确定是被哪个MySQL服务拒绝了，刷新对应的服务器即可,不确定的话就都刷新吧。

方法二：

进入数据库将max_connection_errors参数调高，也可以在my.cnf文件中修改不过需要重启MySQL。

mysql>show variables like '%max_connection_errors%';

mysql>set global max_connect_errors = 1000;

mysql>show variables like '%max_connection_errors%';
```

# docker常用命令05
```
网络篇，简单，直接看视频截图
```
