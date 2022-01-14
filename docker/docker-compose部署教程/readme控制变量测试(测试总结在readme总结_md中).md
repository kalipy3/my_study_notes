    readme.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2022-01-14 09:11

### eg1.

    kalipy@debian ~/b/m/docker> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED        SIZE
    kalipy3/ruoyi-monitor-test   1.0       f1e7791671c5   14 hours ago   719MB
    java                         8         d23bdf5b1b1b   4 years ago    643MB


不带build配置的docker-compose.yml文件：

    version : '3'
    services:
      ruoyi-mysql:
        container_name: c-ruoyi-mysql
        image: i-ruoyi-mysql
        command: --default-authentication-plugin=caching_sha2_password
        ports:
          - "3307:3306"
        volumes:
          - ./mysql/conf:/etc/mysql/conf.d
          - ./mysql/logs:/logs
          - ./mysql/data:/var/lib/mysql
        command: [
              'mysqld',
              '--innodb-buffer-pool-size=80M',
              '--character-set-server=utf8mb4',
              '--collation-server=utf8mb4_unicode_ci',
              '--default-time-zone=+8:00',
              '--lower-case-table-names=1'
            ]
        environment:
          MYSQL_PASS: 'Abcd1234'
          MYSQL_ROOT_PASSWORD: 'Abcd1234'
      ruoyi-redis:
        container_name: c-ruoyi-redis
        image: i-ruoyi-redis
        ports:
          - "6380:6379"
        volumes:
          - ./conf/redis.conf:/home/ruoyi/redis/redis.conf
          - ./redis/data:/data
        command: redis-server /home/ruoyi/redis/redis.conf
      ruoyi-nginx:
        container_name: c-ruoyi-nginx
        image: i-ruoyi-nginx
        ports:
          - "8081:8080"
        volumes:
          - ./html/dist:/home/ruoyi/projects/ruoyi-ui
          - ./conf/nginx.conf:/etc/nginx/nginx.conf
          - ./nginx/logs:/var/log/nginx
          - ./nginx/conf.d:/etc/nginx/conf.d
        depends_on:
          - ruoyi-server
        links:
          - ruoyi-server
      ruoyi-server:
        image: kalipy3/ruoyi-monitor-test:1.0
        container_name: c-ruoyi-server
        ports:
          - "9002:9001"
        volumes:
          - ./ruoyi/logs:/home/ruoyi/logs
          - ./ruoyi/uploadPath:/home/ruoyi/uploadPath
        depends_on:
          - ruoyi-mysql
          - ruoyi-redis
        links:
          - ruoyi-mysql
          - ruoyi-redis

结果(本地没有，自动去pull远程找)：

    kalipy@debian ~/桌/r/ruoyi_> sudo /home/kalipy/docker-compose-Linux-x86_64 up
    Pulling ruoyi-mysql (i-ruoyi-mysql:)...
    ERROR: The image for the service you're trying to recreate has been removed. If you continue, volume data could be lost. Consider backing up your data before continuing.
    
    Continue with the new image? [yN]y
    Pulling ruoyi-mysql (i-ruoyi-mysql:)...
    ...
    ...
    Creating c-ruoyi-server ... done
    Attaching to c-ruoyi-server
    c-ruoyi-server  | Application Version: 3.2.0
    c-ruoyi-server  | Spring Boot Version: 2.1.17.RELEASE
    c-ruoyi-server  | ////////////////////////////////////////////////////////////////////
    c-ruoyi-server  | ////////////////////////////////////////////////////////////////////
    c-ruoyi-server  | 
    c-ruoyi-server  | 01:14:58.580 [main] INFO  c.r.HswApplication - [logStarting,50] - Starting HswApplication on 9a3d887ebf6f with PID 1 (/home/ruoyi/ruoyi.jar started by root in /home/ruoyi)
    ^C
    Stopping c-ruoyi-server ... done

查看：

    kalipy@debian ~/桌/r/ruoyi_> sudo /home/kalipy/docker-compose-Linux-x86_64 images
      Container              Repository           Tag     Image Id       Size  
    ---------------------------------------------------------------------------
    c-ruoyi-server   kalipy3/ruoyi-monitor-test   1.0   f1e7791671c5   719.1 MB
    kalipy@debian ~/桌/r/ruoyi_> sudo /home/kalipy/docker-compose-Linux-x86_64 ps -a
         Name              Command          State     Ports
    -------------------------------------------------------
    c-ruoyi-server   java -jar ruoyi.jar   Exit 143  

    kalipy@debian ~/b/m/docker> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED        SIZE
    kalipy3/ruoyi-monitor-test   1.0       f1e7791671c5   14 hours ago   719MB
    java                         8         d23bdf5b1b1b   4 years ago    643MB
    CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
    kalipy@debian ~/b/m/docker> sudo docker ps -a
    CONTAINER ID   IMAGE                            COMMAND                 CREATED         STATUS                       PORTS     NAMES
    9a3d887ebf6f   kalipy3/ruoyi-monitor-test:1.0   "java -jar ruoyi.jar"   3 minutes ago   Exited (143) 3 minutes ago             c-ruoyi-server


### eg2

先删除eg1的残留数据

    kalipy@debian ~/桌/r/ruoyi_> sudo /home/kalipy/docker-compose-Linux-x86_64 rm
    Going to remove c-ruoyi-server
    Are you sure? [yN] y
    Removing c-ruoyi-server ... done
    kalipy@debian ~/桌/r/ruoyi_> sudo /home/kalipy/docker-compose-Linux-x86_64 ps
    Name   Command   State   Ports
    ------------------------------
    kalipy@debian ~/桌/r/ruoyi_> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi_> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED        SIZE
    kalipy3/ruoyi-monitor-test   1.0       f1e7791671c5   14 hours ago   719MB
    java                         8         d23bdf5b1b1b   4 years ago    643MB
    kalipy@debian ~/桌/r/ruoyi_> sudo docker ps -a
    CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

带build配置的docker-compose.yml文件：

    version : '3'
    services:
      ruoyi-mysql:
        container_name: c-ruoyi-mysql
        image: i-ruoyi-mysql
        command: --default-authentication-plugin=caching_sha2_password
        build:
          context: .
          dockerfile: mysql-dockerfile
        ports:
          - "3307:3306"
        volumes:
          - ./mysql/conf:/etc/mysql/conf.d
          - ./mysql/logs:/logs
          - ./mysql/data:/var/lib/mysql
        command: [
              'mysqld',
              '--innodb-buffer-pool-size=80M',
              '--character-set-server=utf8mb4',
              '--collation-server=utf8mb4_unicode_ci',
              '--default-time-zone=+8:00',
              '--lower-case-table-names=1'
            ]
        environment:
          MYSQL_PASS: 'Abcd1234'
          MYSQL_ROOT_PASSWORD: 'Abcd1234'
      ruoyi-redis:
        container_name: c-ruoyi-redis
        image: i-ruoyi-redis
        build:
          context: .
          dockerfile: redis-dockerfile
        ports:
          - "6380:6379"
        volumes:
          - ./conf/redis.conf:/home/ruoyi/redis/redis.conf
          - ./redis/data:/data
        command: redis-server /home/ruoyi/redis/redis.conf
      ruoyi-nginx:
        container_name: c-ruoyi-nginx
        image: i-ruoyi-nginx
        build:
          context: .
          dockerfile: nginx-dockerfile
        ports:
          - "8081:8080"
        volumes:
          - ./html/dist:/home/ruoyi/projects/ruoyi-ui
          - ./conf/nginx.conf:/etc/nginx/nginx.conf
          - ./nginx/logs:/var/log/nginx
          - ./nginx/conf.d:/etc/nginx/conf.d
        depends_on:
          - ruoyi-server
        links:
          - ruoyi-server
      ruoyi-server:
        container_name: c-ruoyi-server
        image: kalipy3/ruoyi-monitor-test:1.0
        build:
          context: .
          dockerfile: ruoyi-dockerfile
        ports:
          - "9002:9001"
        volumes:
          - ./ruoyi/logs:/home/ruoyi/logs
          - ./ruoyi/uploadPath:/home/ruoyi/uploadPath
        depends_on:
          - ruoyi-mysql
          - ruoyi-redis
        links:
          - ruoyi-mysql
          - ruoyi-redis


先把本地kalipy3/ruoyi-monitor-test:1.0删除：

    kalipy@debian ~/b/m/docker> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED        SIZE
    kalipy3/ruoyi-monitor-test   1.0       f1e7791671c5   14 hours ago   719MB
    java                         8         d23bdf5b1b1b   4 years ago    643MB
    kalipy@debian ~/b/m/docker> sudo docker ps -a
    CONTAINER ID   IMAGE                            COMMAND                 CREATED         STATUS                       PORTS     NAMES
    9a3d887ebf6f   kalipy3/ruoyi-monitor-test:1.0   "java -jar ruoyi.jar"   3 minutes ago   Exited (143) 3 minutes ago             c-ruoyi-server
    kalipy@debian ~/b/m/docker> sudo docker rmi f1e7791671c5
    kalipy@debian ~/b/m/docker> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED        SIZE
    kalipy3/ruoyi-monitor-test   1.0       f1e7791671c5   14 hours ago   719MB
    java                         8         d23bdf5b1b1b   4 years ago    643MB


测试(没有镜像，docker-compose会自动先build构建镜像[并不会去pull远程的kalipy3/ruoyi-monitor-test:1.0]，然后再up):

    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 up
    Building ruoyi-mysql
    Sending build context to Docker daemon  215.2MB
    Step 1/3 : FROM mysql:5.7
    5.7: Pulling from library/mysql
    70deed891d42: Pull complete 
    Digest: sha256:f2ad209efe9c67104167fc609cca6973c8422939491c9345270175a300419f94
    Status: Downloaded newer image for mysql:5.7
     ---> c20987f18b13
    Step 2/3 : MAINTAINER ruoyi
     ---> Running in 9604f042d906
    Removing intermediate container 9604f042d906
     ---> 60161edaa34d
    Step 3/3 : ADD ./db/*.sql /docker-entrypoint-initdb.d/
     ---> b4a3c9ac3883
    Successfully built b4a3c9ac3883
    Successfully tagged i-ruoyi-mysql:latest
    WARNING: Image for service ruoyi-mysql was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
    Building ruoyi-redis
    Sending build context to Docker daemon  215.2MB
    Step 1/6 : FROM redis
    latest: Pulling from library/redis
    1abfd3011519: Pull complete 
    Digest: sha256:db485f2e245b5b3329fdc7eff4eb00f913e09d8feb9ca720788059fdc2ed8339
    Status: Downloaded newer image for redis:latest
     ---> 7614ae9453d1
    Step 2/6 : MAINTAINER ruoyi
     ---> Running in 0741c36bddcc
    Removing intermediate container 0741c36bddcc
     ---> 1339c5be8780
    Step 3/6 : VOLUME /home/ruoyi/redis
     ---> Running in 0f14a0018930
    Removing intermediate container 0f14a0018930
     ---> e93aff866b43
    Step 4/6 : RUN mkdir -p /home/ruoyi/redis
     ---> Running in b93a277c802b
    Removing intermediate container b93a277c802b
     ---> 1c82463174fa
    Step 5/6 : WORKDIR /home/ruoyi/redis
     ---> Running in ca13a4944866
    Removing intermediate container ca13a4944866
     ---> 7e5587ea2a9e
    Step 6/6 : COPY ./conf/redis.conf /home/ruoyi/redis/redis.conf
     ---> 660f24f42f69
    Successfully built 660f24f42f69
    Successfully tagged i-ruoyi-redis:latest
    WARNING: Image for service ruoyi-redis was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
    Building ruoyi-server
    Sending build context to Docker daemon  215.2MB
    Step 1/7 : FROM java:8
     ---> d23bdf5b1b1b
    Step 2/7 : MAINTAINER ruoyi
     ---> Running in 0470b9b12e34
    Removing intermediate container 0470b9b12e34
     ---> 0986eeed246b
    Step 3/7 : VOLUME /home/ruoyi
     ---> Running in 03f4125993f1
    Removing intermediate container 03f4125993f1
     ---> 19fc57b4b30a
    Step 4/7 : RUN mkdir -p /home/ruoyi
     ---> Running in 750710905ddf
    Removing intermediate container 750710905ddf
     ---> f311426a21e9
    Step 5/7 : WORKDIR /home/ruoyi
     ---> Running in 9213da150b3b
    Removing intermediate container 9213da150b3b
     ---> 51b966bf0f43
    Step 6/7 : COPY ./jar/*.jar /home/ruoyi/ruoyi.jar
     ---> fde242623486
    Step 7/7 : ENTRYPOINT ["java","-jar","ruoyi.jar"]
     ---> Running in 785dea234de1
    Removing intermediate container 785dea234de1
     ---> 96ec33e2ef79
    Successfully built 96ec33e2ef79
    Successfully tagged kalipy3/ruoyi-monitor-test:1.0
    WARNING: Image for service ruoyi-server was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
    Building ruoyi-nginx
    Sending build context to Docker daemon  215.2MB
    Step 1/7 : FROM nginx
    latest: Pulling from library/nginx
    a2abf6c4d29d: Already exists 
    a9edb18cadd1: Pull complete 
    589b7251471a: Pull complete 
    186b1aaa4aa6: Pull complete 
    b4df32aa5a72: Pull complete 
    a0bcbecc962e: Pull complete 
    Digest: sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31
    Status: Downloaded newer image for nginx:latest
     ---> 605c77e624dd
    Step 2/7 : MAINTAINER ruoyi
     ---> Running in 3c114c430284
    Removing intermediate container 3c114c430284
     ---> 26c17b5602a2
    Step 3/7 : VOLUME /home/ruoyi/projects/ruoyi-ui
     ---> Running in eeb085c6aada
    Removing intermediate container eeb085c6aada
     ---> 28fb01a60691
    Step 4/7 : RUN mkdir -p /home/ruoyi/projects/ruoyi-ui
     ---> Running in 85d65c52d31f
    Removing intermediate container 85d65c52d31f
     ---> 22abcd9694ce
    Step 5/7 : WORKDIR /home/ruoyi/projects/ruoyi-ui
     ---> Running in 88f5ba1482be
    Removing intermediate container 88f5ba1482be
     ---> e30800e6433d
    Step 6/7 : COPY ./conf/nginx.conf /etc/nginx/nginx.conf
     ---> bc67c4595686
    Step 7/7 : COPY ./html/dist /home/ruoyi/projects/ruoyi-ui
     ---> 435ca5d6b795
    Successfully built 435ca5d6b795
    Successfully tagged i-ruoyi-nginx:latest
    WARNING: Image for service ruoyi-nginx was built because it did not already exist. To rebuild this image you must use `docker-compose build` or `docker-compose up --build`.
    Creating c-ruoyi-mysql ... done
    Creating c-ruoyi-redis ... done
    Creating c-ruoyi-server ... done
    Creating c-ruoyi-nginx  ... 
    Creating c-ruoyi-nginx  ... done


结果(kalipy3/ruoyi-monitor-test:1.0并不是从远程pull过来的，而是docker-compose自己根据docker-compose.yml中的build配置来构建的)：

    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
      Container              Repository            Tag       Image Id       Size  
    ------------------------------------------------------------------------------
    c-ruoyi-mysql    i-ruoyi-mysql                latest   b4a3c9ac3883   449.8 MB
    c-ruoyi-nginx    i-ruoyi-nginx                latest   435ca5d6b795   153.2 MB
    c-ruoyi-redis    i-ruoyi-redis                latest   660f24f42f69   112.8 MB
    c-ruoyi-server   kalipy3/ruoyi-monitor-test   1.0      96ec33e2ef79   719.1 MB
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 ps -a
         Name                   Command                State     Ports
    ------------------------------------------------------------------
    c-ruoyi-mysql    docker-entrypoint.sh mysql ...   Exit 137        
    c-ruoyi-nginx    /docker-entrypoint.sh ngin ...   Exit 1          
    c-ruoyi-redis    docker-entrypoint.sh redis ...   Exit 137        
    c-ruoyi-server   java -jar ruoyi.jar              Exit 143        
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED         SIZE
    i-ruoyi-nginx                latest    435ca5d6b795   5 minutes ago   153MB
    kalipy3/ruoyi-monitor-test   1.0       96ec33e2ef79   6 minutes ago   719MB
    i-ruoyi-redis                latest    660f24f42f69   6 minutes ago   113MB
    i-ruoyi-mysql                latest    b4a3c9ac3883   7 minutes ago   450MB
    nginx                        latest    605c77e624dd   2 weeks ago     141MB
    redis                        latest    7614ae9453d1   3 weeks ago     113MB
    mysql                        5.7       c20987f18b13   3 weeks ago     448MB
    java                         8         d23bdf5b1b1b   4 years ago     643MB
    kalipy@debian ~/桌/r/ruoyi> sudo docker ps -a
    CONTAINER ID   IMAGE                            COMMAND                  CREATED         STATUS                       PORTS     NAMES
    754e6690c834   i-ruoyi-nginx                    "/docker-entrypoint.…"   5 minutes ago   Exited (1) 5 minutes ago               c-ruoyi-nginx
    0ef9504fcdf7   kalipy3/ruoyi-monitor-test:1.0   "java -jar ruoyi.jar"    5 minutes ago   Exited (143) 5 minutes ago             c-ruoyi-server
    5f7fc87c609f   i-ruoyi-redis                    "docker-entrypoint.s…"   5 minutes ago   Exited (137) 5 minutes ago             c-ruoyi-redis
    a3e918f3eb50   i-ruoyi-mysql                    "docker-entrypoint.s…"   5 minutes ago   Exited (137) 5 minutes ago             c-ruoyi-mysql
    


### eg3

清除eg2的残留数据

    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
    java         8         d23bdf5b1b1b   4 years ago   643MB
    kalipy@debian ~/桌/r/ruoyi> sudo docker ps -a
    CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 ps -a
    Name   Command   State   Ports
    ------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------


    version : '3'
    services:
      ruoyi-server:
        container_name: c-ruoyi-server
        image: kalipy3/ruoyi-monitor-test:1.0
        build:
          context: .
          dockerfile: ruoyi-dockerfile
        ports:
          - "9002:9001"
        volumes:
          - ./ruoyi/logs:/home/ruoyi/logs
          - ./ruoyi/uploadPath:/home/ruoyi/uploadPath

测试(pull命令，本地没有，会去远程仓库找并pull下来)：

    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 pull
    Pulling ruoyi-server ... done
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 ps -a
    Name   Command   State   Ports
    ------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED        SIZE
    kalipy3/ruoyi-monitor-test   1.0       f1e7791671c5   14 hours ago   719MB
    java                         8         d23bdf5b1b1b   4 years ago    643MB
    

再次build(会把刚才pull下来的覆盖掉):

    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 build
    Building ruoyi-server
    Sending build context to Docker daemon  227.8MB
    Step 1/7 : FROM java:8
     ---> d23bdf5b1b1b
    Step 2/7 : MAINTAINER ruoyi
     ---> Running in 26f9e4d35664
    Removing intermediate container 26f9e4d35664
     ---> 5bef2b83fbef
    Step 3/7 : VOLUME /home/ruoyi
     ---> Running in 5404cea8f418
    Removing intermediate container 5404cea8f418
     ---> 647bcd99b4b0
    Step 4/7 : RUN mkdir -p /home/ruoyi
     ---> Running in 6d06175bc34c
    Removing intermediate container 6d06175bc34c
     ---> 86170b738afb
    Step 5/7 : WORKDIR /home/ruoyi
     ---> Running in 84725ea42dd6
    Removing intermediate container 84725ea42dd6
     ---> 05bf16a31933
    Step 6/7 : COPY ./jar/*.jar /home/ruoyi/ruoyi.jar
     ---> 93a71dbe5497
    Step 7/7 : ENTRYPOINT ["java","-jar","ruoyi.jar"]
     ---> Running in 48b43c025bfe
    Removing intermediate container 48b43c025bfe
     ---> 034e1b813f79
    Successfully built 034e1b813f79
    Successfully tagged kalipy3/ruoyi-monitor-test:1.0
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY                   TAG       IMAGE ID       CREATED         SIZE
    kalipy3/ruoyi-monitor-test   1.0       034e1b813f79   5 seconds ago   719MB
    kalipy3/ruoyi-monitor-test   <none>    f1e7791671c5   14 hours ago    719MB
    java                         8         d23bdf5b1b1b   4 years ago     643MB


eg4.

    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
    java         8         d23bdf5b1b1b   4 years ago   643MB
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 ps -a
    Name   Command   State   Ports
    ------------------------------


    version : '3'
    services:
      ruoyi-mysql:
        container_name: c-ruoyi-mysql
        image: i-ruoyi-mysql
        command: --default-authentication-plugin=caching_sha2_password
        build:
          context: .
          dockerfile: mysql-dockerfile
        ports:
          - "3307:3306"
        volumes:
          - ./mysql/conf:/etc/mysql/conf.d
          - ./mysql/logs:/logs
          - ./mysql/data:/var/lib/mysql
        command: [
              'mysqld',
              '--innodb-buffer-pool-size=80M',
              '--character-set-server=utf8mb4',
              '--collation-server=utf8mb4_unicode_ci',
              '--default-time-zone=+8:00',
              '--lower-case-table-names=1'
            ]
        environment:
          MYSQL_PASS: 'Abcd1234'
          MYSQL_ROOT_PASSWORD: 'Abcd1234'
      ruoyi-redis:
        container_name: c-ruoyi-redis
        image: i-ruoyi-redis
        build:
          context: .
          dockerfile: redis-dockerfile
        ports:
          - "6380:6379"
        volumes:
          - ./conf/redis.conf:/home/ruoyi/redis/redis.conf
          - ./redis/data:/data
        command: redis-server /home/ruoyi/redis/redis.conf
      ruoyi-nginx:
        container_name: c-ruoyi-nginx
        image: i-ruoyi-nginx
        build:
          context: .
          dockerfile: nginx-dockerfile
        ports:
          - "8081:8080"
        volumes:
          - ./html/dist:/home/ruoyi/projects/ruoyi-ui
          - ./conf/nginx.conf:/etc/nginx/nginx.conf
          - ./nginx/logs:/var/log/nginx
          - ./nginx/conf.d:/etc/nginx/conf.d
        depends_on:
          - ruoyi-server
        links:
          - ruoyi-server
      ruoyi-server:
        container_name: c-ruoyi-server
        image: i-ruoyi-server
        build:
          context: .
          dockerfile: ruoyi-dockerfile
        ports:
          - "9002:9001"
        volumes:
          - ./ruoyi/logs:/home/ruoyi/logs
          - ./ruoyi/uploadPath:/home/ruoyi/uploadPath
        depends_on:
          - ruoyi-mysql
          - ruoyi-redis
        links:
          - ruoyi-mysql
          - ruoyi-redis


测试：

kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 build

结果：

    Building ruoyi-mysql
    Sending build context to Docker daemon  227.8MB
    Step 1/3 : FROM mysql:5.7
    5.7: Pulling from library/mysql
    72a69066d2fe: Pull complete 
    93619dbc5b36: Pull complete 
    99da31dd6142: Pull complete 
    626033c43d70: Pull complete 
    37d5d7efb64e: Pull complete 
    ac563158d721: Pull complete 
    d2ba16033dad: Pull complete 
    0ceb82207cd7: Pull complete 
    37f2405cae96: Pull complete 
    e2482e017e53: Pull complete 
    70deed891d42: Pull complete 
    Digest: sha256:f2ad209efe9c67104167fc609cca6973c8422939491c9345270175a300419f94
    Status: Downloaded newer image for mysql:5.7
     ---> c20987f18b13
    Step 2/3 : MAINTAINER ruoyi
     ---> Running in 612bdd7113ca
    Removing intermediate container 612bdd7113ca
     ---> 8ed5dd6994cd
    Step 3/3 : ADD ./db/*.sql /docker-entrypoint-initdb.d/
     ---> 1e75fce6d5c0
    Successfully built 1e75fce6d5c0
    Successfully tagged i-ruoyi-mysql:latest
    Building ruoyi-redis
    Sending build context to Docker daemon  227.8MB
    Step 1/6 : FROM redis
    latest: Pulling from library/redis
    a2abf6c4d29d: Pull complete 
    c7a4e4382001: Pull complete 
    4044b9ba67c9: Pull complete 
    c8388a79482f: Pull complete 
    413c8bb60be2: Pull complete 
    1abfd3011519: Pull complete 
    Digest: sha256:db485f2e245b5b3329fdc7eff4eb00f913e09d8feb9ca720788059fdc2ed8339
    Status: Downloaded newer image for redis:latest
     ---> 7614ae9453d1
    Step 2/6 : MAINTAINER ruoyi
     ---> Running in 5e6f29b3803a
    Removing intermediate container 5e6f29b3803a
     ---> 62c0cdf5898b
    Step 3/6 : VOLUME /home/ruoyi/redis
     ---> Running in 832c6aa3db67
    Removing intermediate container 832c6aa3db67
     ---> 3411ddcff7ff
    Step 4/6 : RUN mkdir -p /home/ruoyi/redis
     ---> Running in 965fa49dc9c4
    Removing intermediate container 965fa49dc9c4
     ---> a3146ee7ac9a
    Step 5/6 : WORKDIR /home/ruoyi/redis
     ---> Running in 844e77f4895a
    Removing intermediate container 844e77f4895a
     ---> 5cb4f353dcf2
    Step 6/6 : COPY ./conf/redis.conf /home/ruoyi/redis/redis.conf
     ---> 5878d4b9eeef
    Successfully built 5878d4b9eeef
    Successfully tagged i-ruoyi-redis:latest
    Building ruoyi-server
    Sending build context to Docker daemon  227.8MB
    Step 1/7 : FROM java:8
     ---> d23bdf5b1b1b
    Step 2/7 : MAINTAINER ruoyi
     ---> Running in 6a350096f0b9
    Removing intermediate container 6a350096f0b9
     ---> 53f34122e253
    Step 3/7 : VOLUME /home/ruoyi
     ---> Running in 35a079ccfcd1
    Removing intermediate container 35a079ccfcd1
     ---> ce28abbbddbe
    Step 4/7 : RUN mkdir -p /home/ruoyi
     ---> Running in b68bad2c148f
    Removing intermediate container b68bad2c148f
     ---> e0f99ff102de
    Step 5/7 : WORKDIR /home/ruoyi
     ---> Running in 50c2476264f3
    Removing intermediate container 50c2476264f3
     ---> 107b76ad05f4
    Step 6/7 : COPY ./jar/*.jar /home/ruoyi/ruoyi.jar
     ---> 4e3d3385589f
    Step 7/7 : ENTRYPOINT ["java","-jar","ruoyi.jar"]
     ---> Running in ecc8ca1bd096
    Removing intermediate container ecc8ca1bd096
     ---> 660ccbd90544
    Successfully built 660ccbd90544
    Successfully tagged i-ruoyi-server:latest
    Building ruoyi-nginx
    Sending build context to Docker daemon  227.8MB
    Step 1/7 : FROM nginx
    latest: Pulling from library/nginx
    a2abf6c4d29d: Already exists 
    a9edb18cadd1: Pull complete 
    589b7251471a: Pull complete 
    186b1aaa4aa6: Pull complete 
    b4df32aa5a72: Pull complete 
    a0bcbecc962e: Pull complete 
    Digest: sha256:0d17b565c37bcbd895e9d92315a05c1c3c9a29f762b011a10c54a66cd53c9b31
    Status: Downloaded newer image for nginx:latest
     ---> 605c77e624dd
    Step 2/7 : MAINTAINER ruoyi
     ---> Running in 399b1cf4db71
    Removing intermediate container 399b1cf4db71
     ---> ed545c83c75a
    Step 3/7 : VOLUME /home/ruoyi/projects/ruoyi-ui
     ---> Running in 82b30ee8d073
    Removing intermediate container 82b30ee8d073
     ---> 7b2d0815501d
    Step 4/7 : RUN mkdir -p /home/ruoyi/projects/ruoyi-ui
     ---> Running in cf8753a1a8e5
    Removing intermediate container cf8753a1a8e5
     ---> ccdba728f1ae
    Step 5/7 : WORKDIR /home/ruoyi/projects/ruoyi-ui
     ---> Running in 8b4e238fb5e8
    Removing intermediate container 8b4e238fb5e8
     ---> 5feabe7d8d49
    Step 6/7 : COPY ./conf/nginx.conf /etc/nginx/nginx.conf
     ---> 57a1d6f6f5b2
    Step 7/7 : COPY ./html/dist /home/ruoyi/projects/ruoyi-ui
     ---> 30a5f778ff1a
    Successfully built 30a5f778ff1a
    Successfully tagged i-ruoyi-nginx:latest

效果：

    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 ps -a
    Name   Command   State   Ports
    ------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY       TAG       IMAGE ID       CREATED              SIZE
    i-ruoyi-nginx    latest    30a5f778ff1a   About a minute ago   153MB
    i-ruoyi-server   latest    660ccbd90544   2 minutes ago        719MB
    i-ruoyi-redis    latest    5878d4b9eeef   2 minutes ago        113MB
    i-ruoyi-mysql    latest    1e75fce6d5c0   3 minutes ago        450MB
    nginx            latest    605c77e624dd   2 weeks ago          141MB
    redis            latest    7614ae9453d1   3 weeks ago          113MB
    mysql            5.7       c20987f18b13   3 weeks ago          448MB
    java             8         d23bdf5b1b1b   4 years ago          643MB


### eg5.


    version : '3'
    services:
      ruoyi-mysql:
        container_name: c-ruoyi-mysql
        image: i-ruoyi-mysql
        command: --default-authentication-plugin=caching_sha2_password
        build:
          context: .
          dockerfile: mysql-dockerfile
        ports:
          - "3307:3306"
        volumes:
          - ./mysql/conf:/etc/mysql/conf.d
          - ./mysql/logs:/logs
          - ./mysql/data:/var/lib/mysql
        command: [
              'mysqld',
              '--innodb-buffer-pool-size=80M',
              '--character-set-server=utf8mb4',
              '--collation-server=utf8mb4_unicode_ci',
              '--default-time-zone=+8:00',
              '--lower-case-table-names=1'
            ]
        environment:
          MYSQL_PASS: 'Abcd1234'
          MYSQL_ROOT_PASSWORD: 'Abcd1234'
      ruoyi-redis:
        container_name: c-ruoyi-redis
        image: i-ruoyi-redis
        build:
          context: .
          dockerfile: redis-dockerfile
        ports:
          - "6380:6379"
        volumes:
          - ./conf/redis.conf:/home/ruoyi/redis/redis.conf
          - ./redis/data:/data
        command: redis-server /home/ruoyi/redis/redis.conf
      ruoyi-nginx:
        container_name: c-ruoyi-nginx
        image: i-ruoyi-nginx
        build:
          context: .
          dockerfile: nginx-dockerfile
        ports:
          - "8081:8080"
        volumes:
          - ./html/dist:/home/ruoyi/projects/ruoyi-ui
          - ./conf/nginx.conf:/etc/nginx/nginx.conf
          - ./nginx/logs:/var/log/nginx
          - ./nginx/conf.d:/etc/nginx/conf.d
        depends_on:
          - ruoyi-server
        links:
          - ruoyi-server
      ruoyi-server:
        container_name: c-ruoyi-server
        image: i-ruoyi-server
        build:
          context: .
          dockerfile: ruoyi-dockerfile
        ports:
          - "9002:9001"
        volumes:
          - ./ruoyi/logs:/home/ruoyi/logs
          - ./ruoyi/uploadPath:/home/ruoyi/uploadPath
        depends_on:
          - ruoyi-mysql
          - ruoyi-redis
        links:
          - ruoyi-mysql
          - ruoyi-redis


清除eg4残留数据

    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 ps -a
    Name   Command   State   Ports
    ------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY       TAG       IMAGE ID       CREATED              SIZE
    i-ruoyi-nginx    latest    30a5f778ff1a   About a minute ago   153MB
    i-ruoyi-server   latest    660ccbd90544   2 minutes ago        719MB
    i-ruoyi-redis    latest    5878d4b9eeef   2 minutes ago        113MB
    i-ruoyi-mysql    latest    1e75fce6d5c0   3 minutes ago        450MB
    nginx            latest    605c77e624dd   2 weeks ago          141MB
    redis            latest    7614ae9453d1   3 weeks ago          113MB
    mysql            5.7       c20987f18b13   3 weeks ago          448MB
    java             8         d23bdf5b1b1b   4 years ago          643MB

测试(push必须打tag才可以,tag是你的dockerhub账号名)：

    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 push
    Pushing ruoyi-mysql (i-ruoyi-mysql:latest)...
    The push refers to repository [docker.io/library/i-ruoyi-mysql]
    ed3e62f3f4cc: Preparing
    e889c671872c: Preparing
    789f3aa31b3f: Preparing
    35ba198e64f5: Preparing
    9b64bb048d04: Preparing
    aad27784b762: Waiting
    0d17fee8db40: Waiting
    d7a777f6c3a4: Waiting
    a0c2a050fee2: Waiting
    0798f2528e83: Waiting
    fba7b131c5c3: Waiting
    ad6b69b54919: Waiting
    ERROR: denied: requested access to the resource is denied

    kalipy@debian ~/桌/r/ruoyi> sudo docker push i-ruoyi-nginx
    Using default tag: latest
    The push refers to repository [docker.io/library/i-ruoyi-nginx]
    9ecbb0d57140: Preparing 
    3a2498ecd521: Preparing 
    fc7129fb1679: Preparing 
    d874fd2bc83b: Preparing 
    32ce5f6a5106: Preparing 
    f1db227348d0: Waiting 
    b8d6e692a25e: Waiting 
    e379e8aedd4d: Waiting 
    2edcec3590a4: Waiting 
    denied: requested access to the resource is denied
    kalipy@debian ~/桌/r/ruoyi> sudo docker tag i-ruoyi-nginx kalipy3/i-ruoyi-nginx:latest
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY              TAG       IMAGE ID       CREATED          SIZE
    kalipy3/i-ruoyi-nginx   latest    30a5f778ff1a   13 minutes ago   153MB
    i-ruoyi-nginx           latest    30a5f778ff1a   13 minutes ago   153MB
    i-ruoyi-server          latest    660ccbd90544   14 minutes ago   719MB
    i-ruoyi-redis           latest    5878d4b9eeef   14 minutes ago   113MB
    i-ruoyi-mysql           latest    1e75fce6d5c0   15 minutes ago   450MB
    nginx                   latest    605c77e624dd   2 weeks ago      141MB
    redis                   latest    7614ae9453d1   3 weeks ago      113MB
    mysql                   5.7       c20987f18b13   3 weeks ago      448MB
    java                    8         d23bdf5b1b1b   4 years ago      643MB
    kalipy@debian ~/桌/r/ruoyi> sudo docker tag i-ruoyi-redis kalipy3/i-ruoyi-redis:latest
    kalipy@debian ~/桌/r/ruoyi> sudo docker tag i-ruoyi-mysql kalipy3/i-ruoyi-mysql:latest
    kalipy@debian ~/桌/r/ruoyi> sudo docker tag i-ruoyi-server kalipy3/i-ruoyi-server:latest
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
    kalipy3/i-ruoyi-nginx    latest    30a5f778ff1a   15 minutes ago   153MB
    i-ruoyi-nginx            latest    30a5f778ff1a   15 minutes ago   153MB
    i-ruoyi-server           latest    660ccbd90544   15 minutes ago   719MB
    kalipy3/i-ruoyi-server   latest    660ccbd90544   15 minutes ago   719MB
    kalipy3/i-ruoyi-redis    latest    5878d4b9eeef   15 minutes ago   113MB
    i-ruoyi-redis            latest    5878d4b9eeef   15 minutes ago   113MB
    kalipy3/i-ruoyi-mysql    latest    1e75fce6d5c0   16 minutes ago   450MB
    i-ruoyi-mysql            latest    1e75fce6d5c0   16 minutes ago   450MB
    nginx                    latest    605c77e624dd   2 weeks ago      141MB
    redis                    latest    7614ae9453d1   3 weeks ago      113MB
    mysql                    5.7       c20987f18b13   3 weeks ago      448MB
    java                     8         d23bdf5b1b1b   4 years ago      643MB
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 push
    Pushing ruoyi-mysql (i-ruoyi-mysql:latest)...
    The push refers to repository [docker.io/library/i-ruoyi-mysql]
    ed3e62f3f4cc: Preparing
    e889c671872c: Preparing
    789f3aa31b3f: Preparing
    35ba198e64f5: Preparing
    9b64bb048d04: Preparing
    aad27784b762: Waiting
    0d17fee8db40: Waiting
    d7a777f6c3a4: Waiting
    a0c2a050fee2: Waiting
    0798f2528e83: Waiting
    fba7b131c5c3: Waiting
    ad6b69b54919: Waiting
    ERROR: denied: requested access to the resource is denied


我们发现docker-compose push还是会失败，解决：

docker-copose.yml中的image全部加上dockerhub的用户名:


    version : '3'
    services:
      ruoyi-mysql:
        container_name: c-ruoyi-mysql
        image: kalipy3/i-ruoyi-mysql
        command: --default-authentication-plugin=caching_sha2_password
        build:
          context: .
          dockerfile: mysql-dockerfile
        ports:
          - "3307:3306"
        volumes:
          - ./mysql/conf:/etc/mysql/conf.d
          - ./mysql/logs:/logs
          - ./mysql/data:/var/lib/mysql
        command: [
              'mysqld',
              '--innodb-buffer-pool-size=80M',
              '--character-set-server=utf8mb4',
              '--collation-server=utf8mb4_unicode_ci',
              '--default-time-zone=+8:00',
              '--lower-case-table-names=1'
            ]
        environment:
          MYSQL_PASS: 'Abcd1234'
          MYSQL_ROOT_PASSWORD: 'Abcd1234'
      ruoyi-redis:
        container_name: c-ruoyi-redis
        image: kalipy3/i-ruoyi-redis
        build:
          context: .
          dockerfile: redis-dockerfile
        ports:
          - "6380:6379"
        volumes:
          - ./conf/redis.conf:/home/ruoyi/redis/redis.conf
          - ./redis/data:/data
        command: redis-server /home/ruoyi/redis/redis.conf
      ruoyi-nginx:
        container_name: c-ruoyi-nginx
        image: kalipy3/i-ruoyi-nginx
        build:
          context: .
          dockerfile: nginx-dockerfile
        ports:
          - "8081:8080"
        volumes:
          - ./html/dist:/home/ruoyi/projects/ruoyi-ui
          - ./conf/nginx.conf:/etc/nginx/nginx.conf
          - ./nginx/logs:/var/log/nginx
          - ./nginx/conf.d:/etc/nginx/conf.d
        depends_on:
          - ruoyi-server
        links:
          - ruoyi-server
      ruoyi-server:
        container_name: c-ruoyi-server
        image: kalipy3/i-ruoyi-server
        build:
          context: .
          dockerfile: ruoyi-dockerfile
        ports:
          - "9002:9001"
        volumes:
          - ./ruoyi/logs:/home/ruoyi/logs
          - ./ruoyi/uploadPath:/home/ruoyi/uploadPath
        depends_on:
          - ruoyi-mysql
          - ruoyi-redis
        links:
          - ruoyi-mysql
          - ruoyi-redis
    

再次测试(ok，成功push)：


    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 push
    Pushing ruoyi-mysql (kalipy3/i-ruoyi-mysql:latest)...
    The push refers to repository [docker.io/kalipy3/i-ruoyi-mysql]
    ed3e62f3f4cc: Pushed
    e889c671872c: Pushed
    789f3aa31b3f: Pushed
    35ba198e64f5: Pushed
    9b64bb048d04: Pushed
    aad27784b762: Pushed
    0d17fee8db40: Pushed
    d7a777f6c3a4: Pushed
    a0c2a050fee2: Pushed
    0798f2528e83: Pushed
    fba7b131c5c3: Pushed
    ad6b69b54919: Pushed
    latest: digest: sha256:1d3e56e12899fa7cd98566fefa94f83aa3febf43a9bcf806c8cec15059b6ea77 size: 2831
    Pushing ruoyi-redis (kalipy3/i-ruoyi-redis:latest)...
    The push refers to repository [docker.io/kalipy3/i-ruoyi-redis]
    678403ca3d19: Pushed
    6571f9549153: Pushed
    8e5669d83291: Mounted from library/redis
    9975392591f2: Mounted from library/redis
    529cdb636f61: Mounted from library/redis
    4b8e2801e0f9: Mounted from library/redis
    9b24afeb7c2f: Mounted from library/redis
    2edcec3590a4: Pushed
    latest: digest: sha256:deb3a052ef4014591b7d6166e524d9164598be69c236acd16123aada8a376d3b size: 1989
    Pushing ruoyi-server (kalipy3/i-ruoyi-server:latest)...
    The push refers to repository [docker.io/kalipy3/i-ruoyi-server]
    09a06762b630: Pushed
    619fcc4a05b1: Pushed
    35c20f26d188: Mounted from kalipy3/ruoyi-monitor-test
    c3fe59dd9556: Mounted from kalipy3/ruoyi-monitor-test
    6ed1a81ba5b6: Mounted from kalipy3/ruoyi-monitor-test
    a3483ce177ce: Mounted from kalipy3/ruoyi-monitor-test
    ce6c8756685b: Mounted from kalipy3/ruoyi-monitor-test
    30339f20ced0: Mounted from kalipy3/ruoyi-monitor-test
    0eb22bfb707d: Mounted from kalipy3/ruoyi-monitor-test
    a2ae92ffcd29: Mounted from kalipy3/ruoyi-monitor-test
    latest: digest: sha256:9b43d55fd8d38dde07ecc82a3f5c838178d0ca3e73cb6822806d0552ac3d6ba4 size: 2419
    Pushing ruoyi-nginx (kalipy3/i-ruoyi-nginx:latest)...
    The push refers to repository [docker.io/kalipy3/i-ruoyi-nginx]
    9ecbb0d57140: Pushed
    3a2498ecd521: Pushed
    fc7129fb1679: Pushed
    d874fd2bc83b: Pushed
    32ce5f6a5106: Pushed
    f1db227348d0: Pushed
    b8d6e692a25e: Pushed
    e379e8aedd4d: Pushed
    2edcec3590a4: Mounted from kalipy3/i-ruoyi-redis
    latest: digest: sha256:8ce87b47e8e7f0d85bf06502f9ac004f02bb0bab4e8fc41d1c9689e09ebbe470 size: 2195


### eg6.

    version : '3'
    services:
      ruoyi-mysql:
        container_name: c-ruoyi-mysql
        image: kalipy3/i-ruoyi-mysql
        command: --default-authentication-plugin=caching_sha2_password
        build:
          context: .
          dockerfile: mysql-dockerfile
        ports:
          - "3307:3306"
        volumes:
          - ./mysql/conf:/etc/mysql/conf.d
          - ./mysql/logs:/logs
          - ./mysql/data:/var/lib/mysql
        command: [
              'mysqld',
              '--innodb-buffer-pool-size=80M',
              '--character-set-server=utf8mb4',
              '--collation-server=utf8mb4_unicode_ci',
              '--default-time-zone=+8:00',
              '--lower-case-table-names=1'
            ]
        environment:
          MYSQL_PASS: 'Abcd1234'
          MYSQL_ROOT_PASSWORD: 'Abcd1234'
      ruoyi-redis:
        container_name: c-ruoyi-redis
        image: kalipy3/i-ruoyi-redis
        build:
          context: .
          dockerfile: redis-dockerfile
        ports:
          - "6380:6379"
        volumes:
          - ./conf/redis.conf:/home/ruoyi/redis/redis.conf
          - ./redis/data:/data
        command: redis-server /home/ruoyi/redis/redis.conf
      ruoyi-nginx:
        container_name: c-ruoyi-nginx
        image: kalipy3/i-ruoyi-nginx
        build:
          context: .
          dockerfile: nginx-dockerfile
        ports:
          - "8081:8080"
        volumes:
          - ./html/dist:/home/ruoyi/projects/ruoyi-ui
          - ./conf/nginx.conf:/etc/nginx/nginx.conf
          - ./nginx/logs:/var/log/nginx
          - ./nginx/conf.d:/etc/nginx/conf.d
        depends_on:
          - ruoyi-server
        links:
          - ruoyi-server
      ruoyi-server:
        container_name: c-ruoyi-server
        image: kalipy3/i-ruoyi-server
        build:
          context: .
          dockerfile: ruoyi-dockerfile
        ports:
          - "9002:9001"
        volumes:
          - ./ruoyi/logs:/home/ruoyi/logs
          - ./ruoyi/uploadPath:/home/ruoyi/uploadPath
        depends_on:
          - ruoyi-mysql
          - ruoyi-redis
        links:
          - ruoyi-mysql
          - ruoyi-redis
    

    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY   TAG       IMAGE ID   CREATED   SIZE
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 pull
    Pulling ruoyi-mysql  ... done
    Pulling ruoyi-redis  ... done
    Pulling ruoyi-server ... done
    Pulling ruoyi-nginx  ... done
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 images
    Container   Repository   Tag   Image Id   Size
    ----------------------------------------------
    kalipy@debian ~/桌/r/ruoyi> sudo docker images
    REPOSITORY               TAG       IMAGE ID       CREATED          SIZE
    kalipy3/i-ruoyi-nginx    latest    30a5f778ff1a   35 minutes ago   153MB
    kalipy3/i-ruoyi-server   latest    660ccbd90544   35 minutes ago   719MB
    kalipy3/i-ruoyi-redis    latest    5878d4b9eeef   36 minutes ago   113MB
    kalipy3/i-ruoyi-mysql    latest    1e75fce6d5c0   36 minutes ago   450MB
    kalipy@debian ~/桌/r/ruoyi> sudo /home/kalipy/docker-compose-Linux-x86_64 up
    Creating c-ruoyi-redis ... done
    Creating c-ruoyi-mysql ... done
    Creating c-ruoyi-server ... done
    Creating c-ruoyi-nginx  ... done



