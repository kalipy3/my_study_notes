# nodejs 实现休眠 sleep
 
* 非阻塞形式
* 阻塞形式

nodejs 实现休眠有两张方式，一种是非阻塞形式，一种是阻塞形式

### 非阻塞形式
 
利用 setTimeout 实现假休眠，这种方式对于休眠时间把控可能并不准确，它受制于nodejs主线程的回调时机
```
 function sleepPromise(ms) {
     return new Promise(resolve => setTimeout(resolve, ms))
 }
 async function main(name) {
     for (let i = 0; i < 100; i++) {
         await sleepPromise(1000)
         console.log(`======= ${name} ${new Date().toISOString()} =======`);
     }
 }
 main("name1");
 main("name2");
 /*
 ======= name1 2019-12-20T07:53:01.736Z =======
 ======= name2 2019-12-20T07:53:01.739Z =======
 ======= name1 2019-12-20T07:53:02.739Z =======
 ======= name2 2019-12-20T07:53:02.739Z =======
 ======= name1 2019-12-20T07:53:03.739Z =======
 ======= name2 2019-12-20T07:53:03.739Z =======
 */
```
看打印结果，name1,name2是同时打印的，因为他是异步的，并没有阻塞主线程。


### 阻塞形式

这个方式是使用的nodejs的C扩展，但是高版本的nodejs已经集成了这个功能，这种方式会阻塞主线程，造成整个应用的停顿。
```
function sleep(n) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
}
function main1(name) {
    for (let i = 0; i < 2; i++) {
        sleep(1000)
        console.log(`======= ${name} ${new Date().toISOString()} =======`);
    }
}
main1("name1");
main1("name2");
/*
======= name1 2019-12-20T07:58:47.288Z =======
======= name1 2019-12-20T07:58:48.290Z =======
======= name2 2019-12-20T07:58:49.291Z =======
======= name2 2019-12-20T07:58:50.291Z =======
*/
```

看打印结果，name1的循环结束以后才打印name2的，因为他是同步阻塞的，此时主线程会停顿


转载自： https://www.putin.ink/post/nodejs-sleep.html
