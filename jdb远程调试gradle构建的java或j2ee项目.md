```
jdb远程调试gradle构建的java或j2ee项目.txt

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-07 13:57
```

初级：
    见我的仓库jdbshell

进阶(这里以debug mybatis项目为例):
```
//1.先以非debug模式运行下，能成功后再测试debug模式
java -cp build/classes/java/test:build/classes/java/main:kk:build/resources/main  com.kuang.dao.UserDaoTest

//很不幸，以非debug模式运行失败,报错如下：
    java.lang.ClassNotFoundException: org.apache.xxx
    java.lang.ClassNotFoundException: xx.mysql.xxx
    java.io.IOException: Could not find resource mybatis-config.xml
    
    //解决：
        mkdir kk
        find .gradle/ -iname "*mysql*"//找到mysql.jar
        cp ~/.gradle/caches/modules-2/files-2.1/mysql/mysql-connector-java/8.0.21/53fd3a0887667aae7e40a3439fff2d03d93ec4c2/mysql-connector-java-8.0.21.jar kk/.
        cd kk
        unzip mysql-connector-java-8.0.21.jar
        find .gradle/ -iname "*mybatis*"//找到mybatis.jar
        cp ~/.gradle/caches/modules-2/files-2.1/org.mybatis/mybatis/3.5.3/941d248365b461a853f0c29c32752a0a290224bb/mybatis-3.5.3.jar kk/.
        cd kk
        unzip mybatis-3.5.3.jar
        
//2.以debug方式运行.class程序
java -Xdebug -Xrunjdwp:transport=dt_socket,address=8888,server=y,suspend=y  -cp build/classes/java/test:build/classes/java/main:kk:build/resources/main  com.kuang.dao.UserDaoTest

//3.调试
./jdbshell -attach 8888 -sourcepath ~/bak2/j2ee_study/kuansen_mybatis/src/test/java

//4.给main函数下个断点
stop in com.kuang.dao.UserDaoTest.main

```

java参数说明：
```
-cp:指定.class文件的搜索路径(路径都是包的根目录) 若有多个路径，以:号分隔

build/classes/java/test gradle的test目录下的.java文件编译为.class文件后，.class文件的存放路径

build/classes/java/main gradle的main目录下的.java文件编译为.class文件后，.class文件的存放路径

build/resources/main gradle的src/main/resources目录下的.xml和.property等配置文件gradle build命令构建后,.xml和.property等配置文件的存放路径
```

jdb调试说明：
```
main[1] l
25        public static void main(String args[]) {
26            SqlSession sqlSession = MybatisUtils.getSqlSession();
27            TeacherMapper mapper = sqlSession.getMapper(TeacherMapper.class);
28            Teacher teacher = mapper.getTeacher(1);
29 =>         System.out.println("gg");
30            sqlSession.close();
31        }
32    }
33
dump sqlSession
 sqlSession = {
    configuration: instance of org.apache.ibatis.session.Configuration(id=1457)
    executor: instance of org.apache.ibatis.executor.CachingExecutor(id=1458)
    autoCommit: true
    dirty: false
    cursorList: null
}

//可见，sqlSession里的内容都折叠了，比如怎么看configuration里的详细内容，这样,即以.号展开instance里面的内容：
main[1] dump sqlSession.configuration
 sqlSession.configuration = {
    environment: instance of org.apache.ibatis.mapping.Environment(id=1961)
    safeRowBoundsEnabled: false
    safeResultHandlerEnabled: true
    mapUnderscoreToCamelCase: false
    aggressiveLazyLoading: false
    multipleResultSetsEnabled: true
    useGeneratedKeys: false
    useColumnLabel: true
    cacheEnabled: true
    callSettersOnNulls: false
    useActualParamName: true
    returnInstanceForEmptyRow: false
    logPrefix: null
    logImpl: null
    vfsImpl: null
    localCacheScope: instance of org.apache.ibatis.session.LocalCacheScope(id=1962)
    jdbcTypeForNull: instance of org.apache.ibatis.type.JdbcType(id=1963)
    lazyLoadTriggerMethods: instance of java.util.HashSet(id=1964)
    defaultStatementTimeout: null
    defaultFetchSize: null
    defaultResultSetType: null
    defaultExecutorType: instance of org.apache.ibatis.session.ExecutorType(id=1965)
    autoMappingBehavior: instance of org.apache.ibatis.session.AutoMappingBehavior(id=1966)
    autoMappingUnknownColumnBehavior: instance of org.apache.ibatis.session.AutoMappingUnknownColumnBehavior$1(id=1967)
    variables: instance of java.util.Properties(id=1968)
    reflectorFactory: instance of org.apache.ibatis.reflection.DefaultReflectorFactory(id=1969)
    objectFactory: instance of org.apache.ibatis.reflection.factory.DefaultObjectFactory(id=1970)
    objectWrapperFactory: instance of org.apache.ibatis.reflection.wrapper.DefaultObjectWrapperFactory(id=1971)
    lazyLoadingEnabled: false
    proxyFactory: instance of org.apache.ibatis.executor.loader.javassist.JavassistProxyFactory(id=1972)
    databaseId: null
    configurationFactory: null
    mapperRegistry: instance of org.apache.ibatis.binding.MapperRegistry(id=1973)
    interceptorChain: instance of org.apache.ibatis.plugin.InterceptorChain(id=1974)
    typeHandlerRegistry: instance of org.apache.ibatis.type.TypeHandlerRegistry(id=1975)
    typeAliasRegistry: instance of org.apache.ibatis.type.TypeAliasRegistry(id=1976)
    languageRegistry: instance of org.apache.ibatis.scripting.LanguageDriverRegistry(id=1977)
    mappedStatements: instance of org.apache.ibatis.session.Configuration$StrictMap(id=1978)
    caches: instance of org.apache.ibatis.session.Configuration$StrictMap(id=1979)
    resultMaps: instance of org.apache.ibatis.session.Configuration$StrictMap(id=1980)
    parameterMaps: instance of org.apache.ibatis.session.Configuration$StrictMap(id=1981)
    keyGenerators: instance of org.apache.ibatis.session.Configuration$StrictMap(id=1982)
    loadedResources: instance of java.util.HashSet(id=1983)
    sqlFragments: instance of org.apache.ibatis.session.Configuration$StrictMap(id=1984)
    incompleteStatements: instance of java.util.LinkedList(id=1985)
    incompleteCacheRefs: instance of java.util.LinkedList(id=1986)
    incompleteResultMaps: instance of java.util.LinkedList(id=1987)
    incompleteMethods: instance of java.util.LinkedList(id=1988)
    cacheRefMap: instance of java.util.HashMap(id=1989)
}
main[1] dump sqlSession.configuration.resultMaps
 sqlSession.configuration.resultMaps = {
    serialVersionUID: -4950446264854982944
    name: "Result Maps collection"
    conflictMessageProducer: null
    java.util.HashMap.serialVersionUID: 362498820763181265
    java.util.HashMap.DEFAULT_INITIAL_CAPACITY: 16
    java.util.HashMap.MAXIMUM_CAPACITY: 1073741824
    java.util.HashMap.DEFAULT_LOAD_FACTOR: 0.75
    java.util.HashMap.TREEIFY_THRESHOLD: 8
    java.util.HashMap.UNTREEIFY_THRESHOLD: 6
    java.util.HashMap.MIN_TREEIFY_CAPACITY: 64
    java.util.HashMap.table: instance of java.util.HashMap$Node[16] (id=1991)
    java.util.HashMap.entrySet: null
    java.util.HashMap.size: 2
    java.util.HashMap.modCount: 2
    java.util.HashMap.threshold: 12
    java.util.HashMap.loadFactor: 0.75
    java.util.AbstractMap.keySet: null
    java.util.AbstractMap.values: null
}
```

该测试例子mybaits目录结构参考(注意：用junit单元测试也是一样的道理，但是要记得把junit.jar放到kk目录下解压后-cp加到classpath里):
```
kalipy@debian ~/b/j/kuansen_mybatis> tree src/                              master!?
src/
├── main
│   ├── java
│   │   └── com
│   │       ├── App.java
│   │       └── kuang
│   │           ├── dao
│   │           │   ├── StudentMapper.java
│   │           │   └── TeacherMapper.java
│   │           ├── pojo
│   │           │   ├── Student.java
│   │           │   └── Teacher.java
│   │           └── utils
│   │               └── MybatisUtils.java
│   └── resources
│       ├── com
│       │   └── kuang
│       │       └── dao
│       │           ├── StudentMapper.xml
│       │           └── TeacherMapper.xml
│       ├── db.properties
│       ├── log4j.properties
│       └── mybatis-config.xml
└── test
    ├── java
    │   └── com
    │       ├── AppTest.java
    │       └── kuang
    │           └── dao
    │               └── UserDaoTest.java
    └── resources

--------------------------------------------------------------------------

kalipy@debian ~/b/j/kuansen_mybatis> tree build/classes                     master!?
build/classes
└── java
    ├── main
    │   └── com
    │       ├── App.class
    │       └── kuang
    │           ├── dao
    │           │   ├── StudentMapper.class
    │           │   └── TeacherMapper.class
    │           ├── pojo
    │           │   ├── Student.class
    │           │   └── Teacher.class
    │           └── utils
    │               └── MybatisUtils.class
    └── test
        └── com
            ├── AppTest.class
            └── kuang
                └── dao
                    └── UserDaoTest.class

--------------------------------------------------------------------------

kalipy@debian ~/b/j/kuansen_mybatis> tree build/resources                   master!?
build/resources
└── main
    ├── com
    │   └── kuang
    │       ├── dao
    │       │   ├── StudentMapper.xml
    │       │   └── TeacherMapper.xml
    │       ├── pojo
    │       └── utils
    ├── db.properties
    ├── log4j.properties
    └── mybatis-config.xml

--------------------------------------------------------------------------
kalipy@debian ~/b/j/kuansen_mybatis>
more src/test/java/com/kuang/dao/UserDaoTest.java
package com.kuang.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;


import com.kuang.dao.TeacherMapper;
import com.kuang.pojo.Teacher;
import com.kuang.utils.MybatisUtils;

/*
 * UserDaoTest.java
 * Copyright (C) 2020 2020-12-05 21:31 kalipy <kalipy@debian>
 *
 * Distributed under terms of the MIT license.
 */

public class UserDaoTest
{


    public static void main(String args[]) {
        SqlSession sqlSession = MybatisUtils.getSqlSession();
        TeacherMapper mapper = sqlSession.getMapper(TeacherMapper.class);
        Teacher teacher = mapper.getTeacher(1);
        System.out.println("gg");
        sqlSession.close();
    }
}

```

推荐用gradle，可以更简单:
```
gradle test --debug-jvm//debug单元测试 5005是gradle debug默认开的端口

jdbshell -attach 5005 -sourcepath ~/bak2/j2ee_study/kuansen_mybatis/src/test/java:/home/kalipy/bak2/j2ee_study/kuansen_mybatis/src/main/java:/home/kalipy/bak2/j2ee_study/kuansen_mybatis/gg
```
