# node环境变量配置

1.在nodejs官网上下载nodejs源码node-v5.1.0-linux-x64.tar.gz，到/xxx目录下  

2.进入/xxx目录输入命令,将文件解压到当前目录:  
`$ tar -zxf node-v5.1.0-linux-x64.tar.gz`  

3.（该步骤可省）输入命令：  
`mv node-v5.1.0-linux-x64.tar.gz node`，将文件改名为node  

4.输入命令：  
`sudo vim /etc/profile`  在末尾追加添加以下三行:  

```
export NODE_HOME=/xxx/node

export PATH=$PATH:$NODE_HOME/bin 

export NODE_PATH=$NODE_HOME/lib/node_modules
```  

5.按Esc键，并输入“：wq!”命令保存配置并退出  

6.在命令行输入：  
`source /etc/profile`,然后在命令行输入：  
`node -v`，返回版本信息vx.x.x，说明环境变量配置生效了  

7.但是，你发现进入root账户，配置并没有生效  

8.在命令行输入：  
`vim /root/.bashrc`,并在文件末尾加入一行:  
`source etc/profile`  

9.保存，退出。
