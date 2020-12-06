```
gradle下载jar的源码和javadocs.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-06 22:06
```

```
以mybatis为例,添加javadoc或sources分类为依赖关系：
dependencies {
    compile "org.mybatis:mybatis:3.5.3"
    compile "org.mybatis:mybatis:3.5.3:sources"
    compile "org.mybatis:mybatis:3.5.3:javadoc"
}
```
