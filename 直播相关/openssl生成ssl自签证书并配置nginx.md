    openssl生成ssl自签证书并配置nginx.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2022-06-19 13:46

### ssl自签证书生成

通过openssl生成私钥

    [I] kalipy@debian ~/g/yyy> openssl genrsa -out server.key 2048
    Generating RSA private key, 2048 bit long modulus (2 primes)
    .....................+++++
    ...................+++++
    e is 65537 (0x010001)

根据私钥生成证书申请文件csr

    [I] kalipy@debian ~/g/yyy> openssl req -new -key server.key -out server.csr
    You are about to be asked to enter information that will be incorporated
    into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
    -----
    Country Name (2 letter code) [AU]:CN
    State or Province Name (full name) [Some-State]:Shanghai
    Locality Name (eg, city) []:Shanghai
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:kalipy3
    Organizational Unit Name (eg, section) []:kalipy3
    Common Name (e.g. server FQDN or YOUR name) []:127.0.0.1
    Email Address []:3069087972@qq.com
    
    Please enter the following 'extra' attributes
    to be sent with your certificate request
    A challenge password []:
    An optional company name []:kalipy3

使用私钥对证书申请进行签名从而生成证书
    
    [I] kalipy@debian ~/g/yyy> openssl x509 -req -in server.csr -out server.crt -signkey server.key -days 3650
    Signature ok
    subject=C = CN, ST = Shanghai, L = Shanghai, O = kalipy3, OU = kalipy3, CN = 127.0.0.1, emailAddress = 3069087972@qq.com
    Getting Private key

    [I] kalipy@debian ~/g/yyy> ls
    server.crt  server.csr  server.key

### nginx ssl配置

如下，你只需要在http server下面加一个https server即可：

    http {
        include       mime.types;
        default_type  application/octet-stream;
    
        sendfile        on;
        keepalive_timeout  65;
        #gzip  on;
        #防止页面中文乱码一定要在utf-8前面加上gbk，顺序很重要    
        charset utf-8;
    	autoindex on;# 显示目录
    	autoindex_exact_size on;# 显示文件大小
    	autoindex_localtime on;# 显示文件时间
        #http
        server {
            listen       8081;
            server_name  localhost;
            client_max_body_size 100M;
            location / {
                root /home/kalipy/nginx_test;
                try_files $uri $uri/ home/kalipy/桌面/毕设/send_recv_fd/* /index.html;
                index  index.html index.htm;
            }
        }
    
        #https
        server {
            listen       8082 ssl;
            server_name  localhost;
        
            ssl_certificate      /home/kalipy/gg/yyy/server.crt;
            ssl_certificate_key  /home/kalipy/gg/yyy/server.key;
        
            ssl_session_timeout  5m;
        
            ssl_ciphers  HIGH:!aNULL:!MD5;
            ssl_prefer_server_ciphers  on;
        
            client_max_body_size 100M;
            location / {
                root /home/kalipy/nginx_test;
                try_files $uri $uri/ home/kalipy/桌面/毕设/send_recv_fd/* /index.html;
                index  index.html index.htm;
            }
        }
    }

### 报错

    the “ssl“ parameter requires ngx_http_ssl_module xx

解决(加入http_stub和http_ssl模块)：

    ./configure  --add-module=../nginx-http-flv-module --with-http_mp4_module --with-http_stub_status_module --with-http_ssl_module
