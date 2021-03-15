```
gradle下载jar的源码和javadocs.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2020-12-06 22:06
```

### 正常情况

```
以mybatis为例,添加javadoc或sources分类为依赖关系：
dependencies {
    compile "org.mybatis:mybatis:3.5.3"
    compile "org.mybatis:mybatis:3.5.3:sources"
    compile "org.mybatis:mybatis:3.5.3:javadoc"
}
```

### 进阶

1. springboot的依赖如下:  
    ```
    plugins {
    	id 'org.springframework.boot' version '2.4.3'
    	id 'io.spring.dependency-management' version '1.0.11.RELEASE'
    	id 'java'
    }
    
    group = 'com.example'
    version = '0.0.1-SNAPSHOT'
    sourceCompatibility = '1.8'
    
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
        implementation 'org.springframework.boot:spring-boot-starter-web'
            testImplementation 'org.springframework.boot:spring-boot-starter-test'
            
            implementation 'org.springframework.boot:spring-boot-starter-web:2.4.3:sources'
    }
    
    test {
        useJUnitPlatform()
    }
    
    ```

2. 因为spring全家桶很多依赖都是省略了版本号的，直接这样写`implementation 'org.springframework.boot:spring-boot-starter-web:sources`会报错说找不到源码包,我们这时就要手动添加版本号如下:
    ```
    //这样就可以成功下载springboot的源码了
    implementation 'org.springframework.boot:spring-boot-starter-web:2.4.3:sources'
    ```

3. 虽然成功下了springboot-starter-web的源码，但是我们解压查看，发现由于springboot的依赖存在很多父子依赖，这样下载的并不是真正的源码  

4. 解决方案:  
    ```
    ### springboot源码阅读
    
    1. 方法一(失败，因为springboot的依赖有很多父子依赖，这样下载的并不是真正的源码):  
        通过gradle的build.gradle中添加:`testImplementation 'org.springframework.boot:spring-boot-starter-web:2.4.3:sources'`
    
    2. 方法二(通过github下载,ok):  
        下载地址: `https://github.com/spring-projects/spring-boot/tree/2.4.x`
    
    ```
