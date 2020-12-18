```
async_await.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-18 17:17
```
### test01

1. 有如下代码:
    ```
    kalipy@debian ~/gg> more md.js 
    async function rf() {
      a();
      b();
      c();
    }
    
    rf()
    
    function a() {
      console.log("a\r\n");
    }

    function b() {
      for (var i = 0; i < 100000; i++) {
        for (var j = 0; j < 100000; j++) {
          2+2;
        }
        1+1;
      }
      console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\r\n");
    }

    function c() {
      console.log("c\r\n");
    }
    ```

2. `node md.js`运行结果如下:
    ```
    kalipy@debian ~/gg> node md.js
    a
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    c
    ```

3. 即正常的由我们自己实现的函数是同步的

### test02

1. 又有代码如下:
    ```
    kalipy@debian ~/gg> more md.js
    var exec = require('child_process').execFile;
    var exec_py = require('child_process').exec
    
    function paizao_with_adb() {
      exec_py('python3 adb.py',{encoding:'utf8'}, function (err,stdout,stderr){
        if (err){
          console.log("err:"+err);
          return;
        }
        console.log("ok:"+stdout)
      });
    }
    async function rf() {
      await paizao_with_adb();
      a();
      b();
      c();
    }
    
    rf()
    
    function a() {
      console.log("a\r\n");
    }
    function b() {
      console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\r\n");
    }
    function c() {
      console.log("c\r\n");
    }

    ```

2. 运行结果如下:
    ```
    kalipy@debian ~/gg> node md.js
    a
    bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    c
    ok:adb: error: failed to get feature set: no devices/emulators found
    ```

3. 我们发现，即使用了async await，但是代码却还是异步执行的，显然和想象中的不一样

### 解决 test03

1. test02异步执行的原因:
    async await只对promise函数有效，而我们写的paizao_with_adb()显然不是promise函数。那怎么办?只需用promisify这个包把其封装为promise函数即可

2. 代码改为:
    ```
    kalipy@debian ~/gg> more md.js
    var exec = require('child_process').execFile;
    var exec_py = require('child_process').exec
    const promisify = require("util").promisify;
    const adb= promisify(paizao_with_adb);
    
    function paizao_with_adb() {
      exec_py('python3 adb.py',{encoding:'utf8'}, function (err,stdout,stderr){
        if (err){
          console.log("err:"+err);
          return;
        }
        console.log("ok:"+stdout)
      });
    }
    async function rf() {
      a();
      await adb();
      b();
      c();
    }
    
    rf()
    
    function a() {
      console.log("a\r\n");
    }
    function b() {
      console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\r\n");
    }
    function c() {
      console.log("c\r\n");
    }

    ```

3. ok,现在方法终于同步运行了,请看:
    ```
    kalipy@debian ~/gg> node md.js
    a
    ok:adb: error: failed to get feature set: no devices/emulators found
    ```
