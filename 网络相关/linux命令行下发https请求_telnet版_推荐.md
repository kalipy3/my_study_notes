```
linux命令行下发https请求_telnet版.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-19 11:01
```

1. 请看:
    ```
    kalipy@debian ~> telnet www.baidu.com 80
    Trying 14.215.177.39...
    Connected to www.a.shifen.com.
    Escape character is '^]'.
    GET / HTTP/1.0

    ```

2. 百度返回的响应:
    ```
    HTTP/1.0 200 OK
    Accept-Ranges: bytes
    Cache-Control: no-cache
    Content-Length: 14615
    Content-Type: text/html
    Date: Sat, 19 Dec 2020 03:00:52 GMT
    P3p: CP=" OTI DSP COR IVA OUR IND COM "
    P3p: CP=" OTI DSP COR IVA OUR IND COM "
    Pragma: no-cache
    Server: BWS/1.1
    Set-Cookie: BAIDUID=98B1CF697970549689EDCCBFEB05291C:FG=1; expires=Thu, 31-Dec-37 23:55:55 GMT; max-age=2147483647; path=/; domain=.baidu.com
    Set-Cookie: BIDUPSID=98B1CF697970549689EDCCBFEB05291C; expires=Thu, 31-Dec-37 23:55:55 GMT; max-age=2147483647; path=/; domain=.baidu.com
    Set-Cookie: PSTM=1608346852; expires=Thu, 31-Dec-37 23:55:55 GMT; max-age=2147483647; path=/; domain=.baidu.com
    Set-Cookie: BAIDUID=98B1CF697970549677AFF656B3B9D312:FG=1; max-age=31536000; expires=Sun, 19-Dec-21 03:00:52 GMT; domain=.baidu.com; path=/; version=1; comment=bd
    Traceid: 1608346852028878081010820079113201748617
    Vary: Accept-Encoding
    X-Ua-Compatible: IE=Edge,chrome=1
    
    <!DOCTYPE html><!--STATUS OK-->
    <html>
    ```

3. 请再看(推荐):
    ```
    kalipy@debian ~> more q.txt
    GET / HTTP/1.0
    
    kalipy@debian ~> more 1.sh 
    #! /bin/sh
    #
    # stm32fxx_telnet_start.sh
    # Copyright (C) 2020 kalipy <kalipy@debian>
    #
    # Distributed under terms of the MIT license.
    #
    (
    cat q.txt
    sleep 3
    ) | telnet www.baidu.com 80
    kalipy@debian ~> ./1.sh
    Trying 14.215.177.38...
    Connected to www.a.shifen.com.
    Escape character is '^]'.
    HTTP/1.0 200 OK

    ```

### test

1. 请看:
    ```
    kalipy@debian ~> more 1.sh
    #! /bin/sh
    #
    # stm32fxx_telnet_start.sh
    # Copyright (C) 2020 kalipy <kalipy@debian>
    #
    # Distributed under terms of the MIT license.
    #
    (
    cat q.txt
    sleep 3
    ) | telnet cas.ycu.jx.cn 80
    kalipy@debian ~> more q.txt
    GET /lyuapServer/login?service=http%3A%2F%2Fmh.ycu.jx.cn%2Fc%2Fportal%2Flogin%3Fp_l_i
    d%3D101829%26_58_redirect%3D%252F HTTP/1.0
    
    Host: cas.ycu.jx.cn
    
    Connection: keep-alive
    
    Cache-Control: max-age=0
    
    Upgrade-Insecure-Requests: 1
    
    User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ch
    rome/87.0.4280.66 Safari/537.36
    
    Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,i
    mage/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
    
    Accept-Encoding: gzip, deflate
    
    Accept-Language: zh-CN,zh;q=0.9
    
    Cookie: JSESSIONID=37946C8FA67F382C6305D15F6978B1AD; CASTGC=TGT-9762-uHk49QXDVlbRgiKe
    MaqjBPqurxK2wzoRCuv1ktcK9lkObQwRVM-cas; JSESSIONID=FB01BD8FD1D1E74A8575FFF614990C95
    kalipy@debian ~> ./1.sh
    Trying 10.0.10.123...
    Connected to cas.ycu.jx.cn.
    Escape character is '^]'.
    HTTP/1.1 200 OK
    Server: Apache-Coyote/1.1
    Pragma: no-cache
    Expires: Thu, 01 Jan 1970 00:00:00 GMT
    Cache-Control: no-cache
    Cache-Control: no-store
    Set-Cookie: JSESSIONID=D893066141B30D60077BB037106E9C52; Path=/lyuapServer/; HttpOnly
    Content-Type: text/html;charset=UTF-8
    Content-Length: 5394
    Date: Sat, 19 Dec 2020 03:18:26 GMT
    Connection: close
    
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    
    ```
