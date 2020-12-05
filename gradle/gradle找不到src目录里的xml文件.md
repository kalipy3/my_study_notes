```
gradle找不到src目录里的xml文件.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-05 22:27
```

```
//问题：gradle找不到src目录里的mybatis的xml文件
//因为idea只编译java，gradle也默认只编译java，所以xml被忽略了。
//方法一：
sourceSets.main.resources {
    srcDirs = ["src/main/resources","src/main/java"]; excludes ["**/*.java"]
}
war {
    from('src/main/java') {
        include '**/*.xml'
    }
}

//方法二：
processResources {
    from('src/main/java') {
        include '**/*.xml'
    }
}
```
