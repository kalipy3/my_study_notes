```
javacomplete2代码补全的坑3.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-28 00:24
```

### 关于java包之间的代码补全问题

1. 包结构如下：
    ```
    kalipy@debian ~/b/gradle_javaweb> tree src/main/java/
    src/main/java/
    └── com
        ├── bean
        │   └── User.java
        ├── servlet
        │   ├── RegistServlet.java
        └── utils
            └── WebUtils.java
    ```

2. WebUtils.java文件内容：
    ```
    package com.utils;  //1行
    
    public class WebUtils
    {
        public static<T> T param2bean(T  t) {
            //封装对象，并返回
            return null;
        }
    }
    ```

3. RegistServlet.java文件内容： 
    ```
    package com.servlet;    //2行
    import com.bean.User;   //3行
    import com.utils.WebUtils;  //4行
    public class RegistServlet
    {
        protected void doPost() {
            WebUtils.      //5行
        }
    }
    
    ```

### 问题
1. 只要WebUtils.java的1行的上面有import之类的代码，5行将不能代码补全

2. WebUtils.java的1行没有写，5行也可以代码补全

3. 只要RegistServlet.java的4行没有写，5行将不能代码补全

4. 5行不能ctral-z键+空格键自动import包,即只能手动导包4行代码

### 奇怪的情况
1. 有的类上面的问题4又可以自动导包


### 问题(extends BaseDao<Book>中的`<xx>`会导致所有补全失效)
```
public class BookDaoImpl extends BaseDao<Book> implements BookDao

```


解决：
    需要补全时把`<xx>`先注释掉，补全完了后再手动取消注释

    再如:
        Page/*<Book>*/ page = new Page<Book>();
        page.getPageSize();//这里想要补全需要把<Book>注释掉，补全后再加上,new Page<Book>的可以不用注释

