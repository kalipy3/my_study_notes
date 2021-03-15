```
ssm整合.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2021-03-15 14:23
```

### 项目代码结构如下:
```
kalipy@debian ~/b/j/kuang_springmvc_study> tree src/
src/
├── main
│   ├── java
│   │   └── com
│   │       └── ly
│   │           ├── App.java
│   │           ├── controller
│   │           │   ├── BookController.java
│   │           │   └── HelloController.java
│   │           ├── dao
│   │           │   ├── BookMapper.java
│   │           │   └── BookMapper.xml
│   │           ├── pojo
│   │           │   └── Books.java
│   │           └── service
│   │               ├── BookServiceImpl.java
│   │               └── BookService.java
│   ├── resources
│   │   ├── applicationContext.xml
│   │   ├── db.properties
│   │   ├── mybatis-config.xml
│   │   ├── spring-dao.xml
│   │   ├── spring-mvc.xml
│   │   └── spring-service.xml
│   └── webapp
│       └── WEB-INF
│           ├── index.jsp
│           ├── jsp
│           │   ├── addBook.jsp
│           │   ├── allBook.jsp
│           │   ├── hello.jsp
│           │   └── updateBook.jsp
│           └── web.xml
└── test
    ├── java
    │   └── com
    │       └── ly
    │           └── AppTest.java
    └── resources
```

### ssm整合的配置文件如下:

1. BookMapper.xml
    ```
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE mapper
      PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
      "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
    <mapper namespace="com.ly.dao.BookMapper">
        
        <insert id="addBook" parameterType="Books">
            insert into ssmbuild.books (bookName, bookCounts, detail)
            values (#{bookName}, #{bookCounts}, #{detail});
        </insert>
    
        <delete id="deleteBookById" parameterType="int">
            delete from ssmbuild.books
            where bookId = #{bookId}
        </delete>
    
        <update id="updateBook" parameterType="Books">
            update ssmbuild.books
            set bookName=#{bookName}, bookCounts=#{bookCounts}, detail=#{detail}
            where bookId=#{bookId};
        </update>
    
        <select id="queryBookById" resultType="Books">
            select * from ssmbuild.books
            where bookId = #{bookId}
        </select>
        
        <select id="queryAllBook" resultType="Books">
            select * from ssmbuild.books
        </select>
    </mapper>
    ```

2. mybatis-config.xml
    ```
    <?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE configuration
      PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
      "http://mybatis.org/dtd/mybatis-3-config.dtd">
    <configuration>
    
        <!-- 默认日志(默认日志不需要额外导包) -->
        <settings>
            <setting name="logImpl" value="STDOUT_LOGGING" />
        </settings>
    
        <!-- 配置数据源，交给spring去做 -->
    
        <!-- 给实体类起别名 -->
        <typeAliases>
            <package name="com.ly.pojo" />
        </typeAliases>
    
        <!-- 绑定接口 -->
        <mappers>
            <mapper class="com.ly.dao.BookMapper" />
        </mappers>
    
    </configuration>
    ```

3. db.properties
    ```
    jdbc.driver=com.mysql.cj.jdbc.Driver
    jdbc.url=jdbc:mysql://127.0.0.1:3306/ssmbuild?useSSL=false&serverTimezone=UTC&characterEncoding=utf-8
    jdbc.username=root
    jdbc.password=Abcd1234
    ```

4. spring-dao.xml
    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:mvc="http://www.springframework.org/schema/mvc"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/mvc
        https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <!-- 1. 关联配置文件 -->
        <context:property-placeholder location="classpath:db.properties" />
    
        <!-- 2. 连接池-->
    
        <bean id="dataSource" class="com.mchange.v2.c3p0.ComboPooledDataSource">
            <property name="driverClass" value="${jdbc.driver}"/>
            <property name="JdbcUrl" value="${jdbc.url}"/>
            <property name="user" value="${jdbc.username}"/>
            <property name="password" value="${jdbc.password}"/>
    
            <!-- c3p0连接池的私有属性-->
            <property name="maxPoolSize" value="30" />
            <property name="minPoolSize" value="10" />
            <!-- 关闭连接后不自动commit -->
            <property name="autoCommitOnClose" value="false" />
            <!-- 获取连接超时时间 -->
            <property name="checkoutTimeout" value="10000" />
            <!-- 当前连接失败重试次数 -->
            <property name="acquireRetryAttempts" value="2" />
        </bean>
    
        <!-- 3. sqlSessionFactory -->
        <bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
            <property name="dataSource" ref="dataSource"/>
            <!-- 绑定Mybatis的配置文件 -->
            <property name="configLocation" value="classpath:mybatis-config.xml" />
        </bean>
    
        <!-- 4. 配置dao接口扫描包，动态的实现了Dao接口可以注入到spirng容器中 -->
        <bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
            <!-- 注入sqlSessionFactory -->
            <property name="sqlSessionFactoryBeanName" value="sqlSessionFactory" />
            <!-- 要扫描的dao包 -->
            <property name="basePackage" value="com.ly.dao" />
        </bean>
    
    </beans>
    ```

5. spring-service.xml
    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:aop="http://www.springframework.org/schema/aop"
        xmlns:tx="http://www.springframework.org/schema/tx"
        xmlns:mvc="http://www.springframework.org/schema/mvc"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/aop
        https://www.springframework.org/schema/aop/spring-aop.xsd
        http://www.springframework.org/schema/tx
        https://www.springframework.org/schema/tx/spring-tx.xsd
        http://www.springframework.org/schema/mvc
        https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <!-- 1. 扫描service包 -->
        <context:component-scan base-package ="com.ly.service" />
    
        <!-- 2. 将我们的所有业务类，注入到spirng,可以通过配置文件或者注解实现-->
        <bean id="bookServiceImpl" class="com.ly.service.BookServiceImpl">
            <property name="bookMapper" ref="bookMapper"/>
        </bean>
    
        <!-- 3. 声明式事务配置 -->
        <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
            <!-- 注入数据源 -->
            <property name="dataSource" ref="dataSource"/>
        </bean>
    
        <!-- 4. aop事务支持 -->
        <!-- 结合aop实现事务的注入 -->
        <!-- 配置事务通知: -->
        <tx:advice id="txAdvice" transaction-manager="transactionManager">
            <!-- 给哪些方法配置事务 -->
            <!-- 配置事务的传播特性: new porpagation= -->
            <tx:attributes>
                <tx:method name="*" propagation="REQUIRED" />
            </tx:attributes>
        </tx:advice>
    
        <!-- 配置事务切入 -->
        <aop:config>
            <aop:pointcut id="txPointCut" expression="execution(* com.ly.dao.*.*(..))" />
            <aop:advisor advice-ref="txAdvice" pointcut-ref="txPointCut" />
        </aop:config>
    
    </beans>
    ```

6. spring-mvc.xml
    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:mvc="http://www.springframework.org/schema/mvc"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/mvc
        https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <!-- 自动扫描包，让指定包下的注解生效,由IOC容器统一管理  取代IOC配置-->
        <context:component-scan base-package="com.ly.controller"/>
    
            <!-- 让Spring MVC不处理静态资源 -->
        <mvc:default-servlet-handler />
            <!--
                支持mvc注解驱动
                在spring中一般采用@RequestMapping注解来完成映射关系
                要想使@RequestMapping注解生效
                必须向上下文中注册DefaultAnnotationHandlerMapping
                和一个AnnotationMethodHandlerAdapter实例
                这两个实例分别在类级别和方法级别处理。
                而annotation-driven配置帮助我们自动完成上述两个实例的注入。
                取代了映射器和适配器，使@RequestMapping生效
            -->
        <mvc:annotation-driven />
    
            <!-- 视图解析器 -->
        <bean class="org.springframework.web.servlet.view.InternalResourceViewResolver"
            id="internalResourceViewResolver">
            <!-- 前缀 -->
            <property name="prefix" value="/WEB-INF/jsp/" />
                <!-- 后缀 -->
            <property name="suffix" value=".jsp" />
        </bean>
    
    </beans>
    ```

7. applicationContext.xml 
    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <beans xmlns="http://www.springframework.org/schema/beans"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:context="http://www.springframework.org/schema/context"
        xmlns:mvc="http://www.springframework.org/schema/mvc"
        xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/context
        https://www.springframework.org/schema/context/spring-context.xsd
        http://www.springframework.org/schema/mvc
        https://www.springframework.org/schema/mvc/spring-mvc.xsd">
    
        <import resource="classpath:spring-dao.xml" />
        <import resource="classpath:spring-service.xml" />
        <import resource="classpath:spring-mvc.xml" />
    
    </beans>
    ```

8. web.xml
    ```
    <?xml version="1.0" encoding="UTF-8"?>
    <web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd"
        version="4.0">
    
        <!--1.注册servlet-->
        <servlet>
            <servlet-name>SpringMVC</servlet-name>
            <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
                <!--通过初始化参数指定SpringMVC配置文件的位置，进行关联-->
            <init-param>
                <param-name>contextConfigLocation</param-name>
                <param-value>classpath:applicationContext.xml</param-value>
            </init-param>
            <!-- 启动顺序，数字越小，启动越早 -->
            <load-on-startup>1</load-on-startup>
        </servlet>
    
        <!--所有请求都会被springmvc拦截 -->
        <servlet-mapping>
            <servlet-name>SpringMVC</servlet-name>
            <url-pattern>/</url-pattern>
        </servlet-mapping>
    
        <!-- 乱码过滤 -->
        <filter>
            <filter-name>encodingFilter</filter-name>
            <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
            <init-param>
                <param-name>encoding</param-name>
                <param-value>utf-8</param-value>
            </init-param>
        </filter>
        <filter-mapping>
            <filter-name>encodingFilter</filter-name>
            <url-pattern>/*</url-pattern>
        </filter-mapping>
    
        <!-- Session -->
        <session-config>
            <session-timeout>15</session-timeout>
        </session-config>
    
    </web-app>
    ```

9. build.gradle
    ```
    /*
     * This file was generated by the Gradle 'init' task.
     *
     * This generated file contains a sample Java project to get you started.
     * For more details take a look at the Java Quickstart chapter in the Gradle
     * User Manual available at https://docs.gradle.org/6.5/userguide/tutorial_java_projects.html
     */
    
    plugins {
        // Apply the java plugin to add support for Java
        id 'java'
    
        // Apply the application plugin to add support for building a CLI application.
        id 'application'
        
        id 'war'
    }
    
    repositories {
        maven { url 'https://maven.aliyun.com/repository/public' }
        maven { url 'https://maven.aliyun.com/repository/central'}
        maven { url 'https://maven.aliyun.com/repository/google'}
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin'}
        maven { url 'https://maven.aliyun.com/repository/spring'}
        maven { url 'https://maven.aliyun.com/repository/spring-plugin'}
        maven { url 'https://maven.aliyun.com/repository/apache-snapshots'}
    
        mavenLocal()
        mavenCentral()
    }
    
    dependencies {
        implementation "javax.servlet.jsp:jsp-api:2.2"
        implementation "javax.servlet:jstl:1.2"
        implementation "javax.servlet:servlet-api:2.5"
        implementation "org.springframework:spring-aop:5.1.9.RELEASE"
        implementation "org.springframework:spring-beans:5.1.9.RELEASE"
        implementation "org.springframework:spring-context:5.1.9.RELEASE"
        implementation "org.springframework:spring-core:5.1.9.RELEASE"
        implementation "org.springframework:spring-expression:5.1.9.RELEASE"
        implementation "org.springframework:spring-jcl:5.1.9.RELEASE"
        implementation "org.springframework:spring-web:5.1.9.RELEASE"
        implementation "org.springframework:spring-webmvc:5.1.9.RELEASE"
        implementation "commons-logging:commons-logging:1.2"
    
        //implementation "mysql:mysql-connector-java:5.1.47"
        implementation "mysql:mysql-connector-java:8.0.21"
        implementation "com.mchange:c3p0:0.9.5.2"//数据库连接池
        implementation "org.mybatis:mybatis:3.5.2"
        implementation "org.mybatis:mybatis-spring:2.0.2"
        implementation "org.springframework:spring-jdbc:5.1.9.RELEASE"
        implementation "org.aspectj:aspectjweaver:1.8.13"//aop事务支持
    
        // Use JUnit test framework
        testImplementation 'junit:junit:4.13'
    }
    
    application {
        // Define the main class for the application.
        mainClassName = 'com.ly.App'
    }
    
    //问题：gradle找不到java目录里的mybatis的xml文件
    //方法一：
    sourceSets.main.resources {
        srcDirs = ["src/main/resources","src/main/java"]; excludes ["**/*.java"]
    }
    war {
        from('src/main/java') {
            include '**/*.xml'
        }
    }
    ```

### 业务测试代码如下:

1. Books.java
    ```
    package com.ly.pojo;
    
    /*
     * Books.java
     * Copyright (C) 2021 2021-03-04 10:54 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    
    public class Books
    {
        private int bookId;
        private String bookName;
        private int bookCounts;
        private String detail;
    
        public Books() {
        }
    
        public int getBookId() {
            return bookId;
        }
    
        public void setBookId(int bookId) {
            this.bookId = bookId;
        }
    
        public String getBookName() {
            return bookName;
        }
    
        public void setBookName(String bookName) {
            this.bookName = bookName;
        }
    
        public int getBookCounts() {
            return bookCounts;
        }
    
        public void setBookCounts(int bookCounts) {
            this.bookCounts = bookCounts;
        }
    
        public String getDetail() {
            return detail;
        }
    
        public void setDetail(String detail) {
            this.detail = detail;
        }
    
        public Books(int bookId, String bookName, int bookCounts, String detail) {
            this.bookId = bookId;
            this.bookName = bookName;
            this.bookCounts = bookCounts;
            this.detail = detail;
        }
    
        @Override
        public String toString() {
            return "Books{" +
                "bookID = " + getBookId() +
                ", bookName = " + getBookName() +
                ", bookCounts = " + getBookCounts() +
                ", detail = " + getDetail() +
                "}";
        }
    
    }
    ```

2. BookMapper.java
    ```
    package com.ly.dao;
    
    import java.util.List;
    
    import org.apache.ibatis.annotations.Param;
    
    import com.ly.pojo.Books;
    
    /*
     * BookMapper.java
     * Copyright (C) 2021 2021-03-04 10:58 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    
    public interface BookMapper
    {
        int addBook(Books books);
    
        int deleteBookById(@Param("bookId") int id);
    
        int updateBook(Books books);
    
        Books queryBookById(@Param("bookId") int id);
    
        List<Books> queryAllBook();
    }
    ```

3. BookService.java
    ```
    package com.ly.service;
    
    import java.util.List;
    import com.ly.pojo.Books;
    /*
     * BookService.java
     * Copyright (C) 2021 2021-03-04 11:20 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    
    public interface BookService
    {
        public int addBook(Books books);//这里是public才有代码补全
    
        int deleteBookById(int id);
    
        int updateBook(Books books);
    
        Books queryBookById(int id);
    
        List<Books> queryAllBook();
    }
    
    ```

4. BookServiceImpl.java
    ```
    package com.ly.service;
    
    import java.util.List;
    
    import com.ly.dao.BookMapper;
    import com.ly.pojo.Books;
    import com.ly.service.BookService;
    
    /*
     * BookServiceImpl.java
     * Copyright (C) 2021 2021-03-04 11:22 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    
    public class BookServiceImpl implements BookService  {
    
        private BookMapper bookMapper;
        //让spring通过调用set方法注入
        public void setBookMapper(BookMapper bookMapper) {
            this.bookMapper = bookMapper;
        }
    
        public int addBook(Books books) {
            return bookMapper.addBook(books);
        }
    
        public int deleteBookById(int id) {
            return bookMapper.deleteBookById(id);
        }
    
        public int updateBook(Books books) {
            return bookMapper.updateBook(books);
        }
    
        public Books queryBookById(int id) {
            return bookMapper.queryBookById(id);
        }
    
        public List<Books> queryAllBook() {
            return bookMapper.queryAllBook();
        }
    }
    
    ```

5. BookController.java
    ```
    package com.ly.controller;
    
    import java.util.List;
    
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.beans.factory.annotation.Qualifier;
    
    import org.springframework.stereotype.Controller;
    import org.springframework.ui.Model;
    
    import org.springframework.web.bind.annotation.PathVariable;
    import org.springframework.web.bind.annotation.RequestMapping;
    
    import com.ly.pojo.Books;
    import com.ly.service.BookService;
    
    /*
     * BookController.java
     * Copyright (C) 2021 2021-03-04 17:21 kalipy <kalipy@debian>
     *
     * Distributed under terms of the MIT license.
     */
    
    @Controller
    @RequestMapping("/book")
    public class BookController
    {
        @Autowired
        @Qualifier("bookServiceImpl")
        private BookService bookService;
    
        @RequestMapping("/allBook")
        public String list(Model model) {
            List<Books> list = bookService.queryAllBook();
            model.addAttribute("list", list);
            return "allBook";
        }
    
        //跳转到增加书籍页面
        @RequestMapping("/toAddBook")
        public String toAddPager() {
            return "addBook";
        }
    
        //添加图书请求
        @RequestMapping("/addBook")
        public String addBook(Books books) {
            bookService.addBook(books);
            return "redirect:/book/allBook";
        }
        
        //跳转到修改图书页面
        @RequestMapping("/toUpdate")
        public String toUpdatePager(int id, Model model) {
            Books book = bookService.queryBookById(id);
            model.addAttribute("book", book);
            return "updateBook";
        }
    
        //修改书籍请求
        @RequestMapping("/updateBook")
        public String updateBook(Books books) {
            bookService.updateBook(books);
            return "redirect:/book/allBook";
        } 
    
        //删除书籍 resfull风格
        @RequestMapping("/deleteBook/{bookId}")
        public String deleteBook(@PathVariable("bookId") int id) {
            bookService.deleteBookById(id);
            return "redirect:/book/allBook";
        }
    }
    
    ```
