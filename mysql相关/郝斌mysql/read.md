(视频p38中35:00有郝斌老师价值观)
(视频p39中28:00有郝斌老师的话)
(视频p41中2:30和3:50有郝斌老师的话)
(视频p42中9:40有郝斌老师的话)
(视频p43中7:50有郝斌老师的话)
(视频p54中12:00有郝斌老师的话)


### check约束

    create table student
    (
        stu_id int primary key,
        stu_sal int check (stu_sal>=1000 ans stu_sal<=8000),
    )
    
    insert into student values (1, 1000);//ok
    insert into student values (1, 10000);//error

### defalut约束

    create table student
    (
        stu_id int primary key,
        stu_sex nchar(1) default ('男')
    )
    
    insert into student(stu_id, stu_sex) values (1);//ok,没有填stu_sex的话,被dufault修饰的stu_sex为null这个默认值
    insert into student values (2, '男');//ok

### unique约束

    create table student
    (
        stu_id int primary key,
        stu_name nvarchar(200) unique
    )
    
    insert into student values (1, 'kalipy');//ok
    insert into student values (2, 'kalipy');//error,违反了unique约束
    insert into student values (3, null);//ok,unique最多可以有一个为null
    insert into student values (4, null);//error

### 主键和uniuqe键的区别及其两者如何配合使用

eg. 假设我们业务规定了stu_name不会相同，stu_name是不是就可以用来做主键了呢?

    create table stu
    (
        stu_name
        stu_addr
    )

    答: 别，千万不要把业务属性作为主键，应该用非业务相关字段来标识主键

应该这样,加一个与学生没有任何业务关系的字段作为主键,比如xx_id,然后把stu_name设置成unique键:

    create table stu
    (
        stu_id int primary key,
        stu_name nvarchar(50) unique not null,
        stu_addr nvarchar(50)
    )


### 关系之一对一(不常用)

### 关系之一对多

把A表(一)的主键作为B表(多)的外键(在多的一方添加外键)

### 关系之多对多

    --班级表
    create table banji
    (
        banji_id int primary key,
        banji_num int not null,//班级人数
        banji_name nvarchar(100)
    )
    
    --教师表
    create table teacher
    (
        teacher_id int primary key,
        teacher_name nvarchar(200)
    )
    
    --第三张表 用来模拟班级和教师的关系
    create table banji_teacher_mapping
    (   //constraint表示约束的意思，其后紧跟的字段为该约束的名字
        banji_id int constraint fk_banji_id foreign key references banji(banji_id),//该外键约束来自banji表的banji_id
        teacher_id int foreign key references teacher(teacher_id),
        kecheng nvarchar(20),
        constraint pk_banji_id_teacher_id primary key (banji_id, teacher_id, kecheng)//表示banji_id,teacher_id,kecheng三者整体是一个主键，这个整体不能重复。比如现在给banji_teacher_mapping表插入了一条数据(1,1001,C语言),然后再次插入(1,1001,C语言),则sql执行报错
    )

### 主键

能够唯一标识一个实物的一个字段或多个字段的组合,被称为主键

附注：
    主键通常都是整数 不建议使用字符串当主键(如果主键是用于集群服务，才考虑用字符串)
    主键的值通常都不允许修改，除非本记录被删除
    主键不要定义成id,而要定义成表名Id或者表名_id
    要用代理主键，不要用业务主键(建议在表中单独添加一个整型的编号充当主键字段)

### 外键

看郝斌文档


### group by

    //error
    select deptno, job, sal
        from emp
        group by deptno, job
    
    //ok
    select deptno, job, avg(sal) 
        from emp
        group by deptno, job

### p66

    输出部门平均工资大于2000的部门的部门编号和部门平均工资
    select deptno, avg(sal)
        from emp
        group by deptno
        having avg(sal) > 2000

### p77

    //error 列名不明确
    select * from emp, dept
        where deptno = 10
    
    //ok
    select * from emp, dept
        where emp.deptno = 10 --过滤条件不是连接条件

### p78

错误写法:

    select * from emp
        join dept
        on emp.deptno = dept.deptno
        having dept.deptno = 10 --error 因为having是对分组后的信息过滤

### 2

    select * from emp, dept
        where dept.deptno = 10 --过滤条件 不是连接条件

考虑把上面语句用sql99来实现

    --这样写不对
    select * 
        from emp
        join dept
        on emp.deptno = dept.deptno --不对，上面的where不是连接条件，所以这里不能连接
        having dept.deptno = 10 --error having是对分组后的过滤

正确写法:

    select *
        from emp
        join dept
        on 1=1
        where dept.deptno = 10

### p79

--输出工资最高的前三名的每个员工的姓名 工资 工资等级 部门名称

    select top 3 "E".ename, "E".sal, "S".grade, "D".dname
        from emp "E"
        join dept "E"
        on "E".deptno = "D".deptno
        join salgrade "S"
        on "E".sal between "S".losal and "S".hisal
        order by "E".sal desc

--输出姓名不包含A的所有员工工资最高的前三名的每个员工的姓名 工资 工资等级 部门名称

    select top 3 "E".ename, "E".sal, "S".grade, "D".dname
        from emp "E"
        join dept "E"
        on "E".deptno = "D".deptno
        join salgrade "S"
        on "E".sal between "S".losal and "S".hisal
        where "E".ename not like '%A%'
        order by "E".sal desc

### p80

    --求出每个员工的姓名 部门编号 薪水 薪水等级
    select "E".ename, "D".deptno, "E".sal, "S".salgradle
        from emp "E"
        join salgrade "S"
        on "E".sal between "S".losal and "S".hisal

### p81

--查找每个部门的编号 该部门所有员工的平均工资 平均工资的等级

    select "T".deptno, "T".avg_sal "部门平均工资", "S".grade "工资等级" 
        from (
            select deptno, avg(sal) as "avg_sal"
            from emp
            group by deptno
        ) "T"
    join salgrade "S"
    on "T".avg_sal between "S".losal and "S".hisal

等价于

    select "T".deptno, "T".avg_sal "部门平均工资", "S".grade "工资等级" 
        from salgrade "S", (
            select deptno, avg(sal) as "avg_sal"
            from emp
            group by deptno
        ) "T"
        where "T".avg_sal between "S".losal and "S".hisal


#### 2

查找每个部门的编号 部门名称 该部门所有员工的平均工资 平均工资的等级

    select "T".deptno, "D".dname, "T".avg_sal, "S".grade from
    (
        select deptno, avg(sal) as "avg_sal"
            from emp
            group by deptno
    ) "T"
    join salgrade "S"
    on "T".avg_sal between "S".losal and "S".hisal
    join dept "D"
    on "T".deptno = "D".deptno

### p82(都存在有null的问题)

    求出emp表中所有领导的姓名
    select ename from emp
        where empno in (select mgr from emp)


    求出emp表中所有非领导的姓名
    select ename from emp
        where empno not in (select mgr from emp)

### p83

求出平均薪水最高的部门的编号和部门的平均工资

    select top 1 deptno "部门编号", avg(sal) "平均工资"
        from emp
        group by deptno
        order by avg(sal) desc

写法二:

    select "E".*
        from (
            select deptno, avg(sal) "avg_sal"
                from emp
                group by deptno
        ) "E"
        where "E"."avg_sal" = (
            select max("avg_sal") from (select deptno, avg(sal) "avg_sal" from emp group by deptno)
        )

### p84

//把工资大于所有员工中工资最低的前三个人的姓名 工资 部门编号 部门名称 工资等级 输出
有一个人工资最低 把这个人排除掉
剩下的人中工资最低的前3个人的姓名 工资 部门编号 部门名称 工资等级 输出

    //error
    select *
        from emp "E"
        where sal > (select min(sal) from emp) --error where不能写在join之前
        join dept "D"
        on "E".deptno = "D".deptno

正确写法:

    select top 3 "E".ename, "E".sal, "E".deptno, "D".dname, "S".grade
        from (
            select *
                from emp "E" --153行
                where sal > (select min(sal) from emp)
        ) "E" --这里的"E"和153行的"E"是没有冲突的，因为范围不一样
        join dept "D"
        on "E".deptno = "D".deptno
        join salgrade "S"
        on "E".sal between "S".losal and "S".hisal
        order by "E".sal asc

### p85

    --考虑下面语法是否错误?
    select * from emp
        join dept
        on emp.deptno = dept.deptno and emp.sal>2000 --ok
    等价于
    select *
        from dept, emp
        where dept.deptno = emp.deptno and emp.sal>2000 --ok

#### 2(超难)

--把工资大于1500的所有的员工按部门分组 把部门平均工资大于2000的前2个的部门的编号 部门名称 部门平均工资的等级

    select "T".*, "D".dname, "S".grade 
        from dept "D"
        join (
            select top 2 deptno, avg(sal) as "avg_sal"
            from emp
            where sal > 1500
            group by deptno
            having avg(sal) > 2000
            order by "avg_sal" desc
        ) "T"
        on "D".deptno = "T".deptno
        join salgrade "S"
        on "T"."avg_sal" between "S".losal and "S".hisal

### p86和p87左右连接和交叉连接看视频(简单)

### p88

用聚合函数 求薪水最高的员工的信息:

    select * from emp where sal = (select max(sal) from emp)

用自连接:
    
    --不准用聚合函数 求薪水最高的员工的信息
    select * from emp
        where empno not in (
            select distinct "E1".empno
            from emp "E1"
            join emp "E2"
            on "E1".sal<"E2".sal
        )


    select * from emp
        where empno not in (
            select distinct "E1".empno
                from emp "E1"
                join emp "E2"
                on "E1".sal<"E2".sal
        )

### p89

看pdf

### p91

    create table stu3
    (
        stu_id int primary key identity(100, 5),--主键自增长,start和步长
        stu_name nvarchar(200) not null
    )
