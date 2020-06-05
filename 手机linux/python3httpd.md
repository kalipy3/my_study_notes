开启Web服务
1.基本方式

Python中自带了简单的服务器程序，能较容易地打开服务。
在python3中将原来的SimpleHTTPServer命令改为了http.server，使用方法如下：

1. cd www目录
2. python -m http.server

开启成功，则会输出“Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) …”，表
示在本机8000端口开启了服务。
如果需要后台运行，可在命令后加"&"符号，Ctrl+C不会关闭服务，如下：

python -m http.server &

如果要保持服务，则在命令前加nohup以忽略所有挂断信号，如下：

nohup python -m http.server 8001
2.指定端口

如果不使用默认端口，可在开启时附带端口参数，如：

python -m http.server 8001

则会在8001端口打开http服务。
使用Web服务

可以使用http://0.0.0.0:8000/查看www目录下的网页文件，若无index.html则会显示目录下的文件。
也可以使用ifconfig命令查看本机IP并使用。
