```
gradle跳过junitTest.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-06 22:11
```

```
Web项目中不长会写JunitTest，但也会写。gradle build的时候会自动执行test 这项task。如果想跳过，通常有几种方法：

1.在build.gradle 文件中禁用task

test {

　　enable = false

}

2.在gradle 命令中增加参数

gradle build -x test
```

