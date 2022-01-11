### 分组函数

5个:

count
sun
avg
max
min

#### 注意: 分组函数在使用时必须先进行分组，才能使用

1. 分组函数自动忽略null,我们不要对null进行处理,不然效率低

    select count(comm) from emp;
    //select count(comm) from emp where comm is not null;

2. count(*)是整表记录数

3. 分组函数不能直接在where字句中

    select * from emp where sal > min(sal);//error

4. 所有分组函数可以组合起来一起用

    select sum(sal), min(sal), max(sal), avg(sal) from emp;


### p43

//执行不报错(mysql不报错，oracle报错)，但是没有任何意义
//因为ename在组内对应多个值，sum在组内只有一个值，ename的显示没有任何意义
select ename, job, sum(job) from emp group by job;

### p44

找出每个部门的最高工资

select deptno, max(sal) from emp group by deptno;

找出每个部门，不同工作岗位的最高工资

select deptno, job, max(sal) from emp group by deptno, job;

找出每个部门最高工资，要求显示最高工资大于3000的

select deptno, max(sal)
    from emp
    group by deptno
    having max(sal) > 3000;

上面having效率低，应该先将大于3000的都找出来，然后分组

select deptno, max(sal)
    from emp
    where sal > 3000
    group by deptno;

优化策略: where和having,优先选择where，where完成不了的，在选择having。

where没办法的??请看:

找出每个部门平均工资，要求显示平均工资高于2500的

select deptno, avg(sal)
    from emp
    group by deptno
    having avg(sal) > 2500


### p46

sql语句书写顺序:

select ..
from ..
join ..
on ..
where ..
group by ..
having ..
order by ..

执行顺序:

from
join
on
where
group by
having
select
order by

### p50

//distinct只能出现在所有字段的最前方
select ename, distinct job from emp;//error

ename和job整体去复
select distinct ename, job from emp;

统计工作岗位的数量
select count(distinct job) from emp;

### p55

找出每个员工的薪资等级，要求显示员工名，薪资，薪资等级

select e.ename, e.sal, s.grade
    from emp e
    join salgrade s
    on e.sal between s.losal and s.hisal;//非等值连接

### p56

查询员工的上级领导，要求显示员工名和对应领导名(错误写法)
select e1.ename as '员工名', e2.ename as '领导名'
    from emp e1
    join emp e2
    on e1.mgr = e2.empno;(没有king,因为最大boss的mgr是null,请看p57的解决方案)

### p57 外连接

//right代表将join关键字右边的表看成主表，主要查右边表
select e.ename, d.dname
    from emp e
    right join dept d
    on e.deptno = d.deptno;

//查询员工的上级领导，要求显示员工名和对应领导名
select e1.ename as '员工名', e2.ename as '领导名'
    from emp e1
    left join emp e2
    on e1.mgr = e2.empno;有king,最大boss的mgr是null)

### p58

//找出每个员工的部门名称以及工资等级，还有上级领导，要求显示员工名 领导名 部门名 薪资 薪资等级
select e.ename, d.dname, e.sal, s.grade, e2.ename
    from emp e
    join dept d
    on e.deptno = d.deptno
    join salgrade s
    on e.sal between s.losal and s.hisal
    left join emp e2
    on e.mgr = e2.empno;

### p59 子查询(select嵌套select语句)

子查询可以出现在哪??
1. select .. (select)
2. from .. (select)
3. where .. (select)


找出比最低工资高的员工姓名和工资

错误写法:
select e.name, e.sal
    from emp e
    where e.sal > min(sal);//error,where不能使用分组函数

正确写法:
select e.name, e.sal
    from emp e
    where e.sal > (select min(sal) from emp);

### p61 from中的子查询

注意: from后面的子查询，可以将子查询的查询结果当成一张临时表


找出每个岗位的平均工资的薪资等级

第一步: 找出每个岗位的平均工资

select job, avg(sal)
    from emp
    group by job;

第二步，把上面临时表和工资等级连接
select t.*, s.grade
    from (
        select job, avg(sal) as avg_sal
            from emp
            group by job
    ) t
    join salgrade s
    on t.avg_sal between s.losal and s.hisal;//这里一定要用别名,不能t.avg(sal),不然语法错误

### p62 select后面的子查询(不要求掌握)

找出每个员工的部门名称，要求显示员工名，部门名
//ok
select e.ename, (select d.dname from dept d where e.deptno = d.deptno) as dname
    from emp e;

//error,注意:对于select后面的子查询来说，这个子查询只能返回一条结果，多于一条就报错。
select e.ename, (select dname from dept) as dname
    from emp e;

### union合并查询结果集

查找工作岗位是N和G的员工

//写法一ok
select ename, job
    from emp
    where job = 'N' or job = 'G';

//写法二ok
select ename, job
    from emp
    where job in('N', 'G');

//写法三ok
select ename, job from emp where job = 'N'
union
select ename, job from emp where job = 'G';

总结: 
    union效率高些。union可以减少笛卡尔积次数,减少次数的同时，还可以完成两个结果集的拼接


//error,union在进行结果集合并的时候，要求两个结果集的列数相同
select ename, job from emp where job = 'N'
union
select ename from emp where job = 'G';

### p65 limit(注意:!!!limit在order by后执行)

完整用法: limit startIndex, length(不要当成区间，length是取个数, startIndex起始位置用0算)
缺省用法: limit

按照薪资降序，取出排名在前5的员工
//写法一
select ename, sal
    from emp
    order by sal desc
    limit 5;

//写法二
select ename, sal
    from emp
    order by sal desc
    limit 0, 5;

取出工资排名在[3-5]名的员工
select ename, sal
    from emp
    order desc
    limit 2, 3;

### p66 通用分页(请一定记住这个公式)

分页

比如每页显示3条记录(请自己手动写一遍,找规律而已)
第1页: limit 0, 3  [0 1 2]
第2页: limit 3, 3  [3 4 5]
第3页: limit 6, 3  [6 7 8]
第4页: limit 9, 3  [9 10 11]

每页显示pageSize条记录
第pageNo页: limit (pageNo-1)*pageSize, pageSize

public static void main(String[] args) {
    //用户提交过来一个页码，以及每页显示的记录条数
    int pageNo = 5;//第5页
    int pageSize = 10;//每页显示10条

    int startIndex = (pageNo-1)*pageSize;
    String sql = "select ..limit"+startIndex+","+pageSize;
}

### p68 数据类型

数据类型:

varchar(10),动态分配空间
char(10)直接分配10个字符空间,多余的用空格填充

怎么选择????

性别: char(1)
姓名: varchar

char: 最长255
int: 等价于java int,最长11
bigint: 等介于java的long
float
double
date: 短日期(只包括年月日)
datetime: 长日期(还有时分秒)
clob:字符大对象，最多可以存4G字符串
blob: 二进制大对象,图片，声音，视频

### 删除表

//如果这张表存在的话，删除
drop table t_student if exists;

### insert插入日期

str_to_date: 将字符串varchar类型装换成为date类型
date_format: 将date类型转换为具有一定格式和varchar字符串类型

create table t_user (
    id int,
    birth date
);
插入数据?
//error
insert into t_user(id, birth) value(1, '01-10-1990');//这里出问题了:原因是类型不匹配，数据库birth是date类型，这里给了一个字符串varchar

怎么办??可以使用str_to_date函数，将字符串类型转换成date类型:
    str_to_date('字符串日期', '日期格式')

mysql日期格式:
%Y
%m
%d
%h
%i
%s

//ok
insert into t_user(id, birth) value(1, str_to_date('01-10-1990'), '%d-%m-%Y');

好消息，如果你提供的日期是这个格式，就可以省略str_to_date了!!!
//ok
insert into t_user(1, '1990-1-1');

### p73

查询的时候可以以某个特定的日期格式展示吗?
date_format,这个函数可以将日期类型转换为特定格式的字符串

select id, date_format(birth, '%d/%m/%Y') as birth from t_user;

select id, date_format(birth, '%d-%m-%Y') as birth from t_user;

select id, date_format(birth, '%Y/%m/%d') as birth from t_user;

### 快速创建表

//把emp创建为emp2,emp的数据自动导入mep2;
create table emp2 as select * from emp;

### 快速删除表中数据(不是删除表)

delete from dept_bak;

delete语句删除数据原理
    表中的数据被删除了，硬盘空间不会释放
    效率低
    后悔了可以找回

truncate语句
truncate table dept_bak;
删除上亿条数据,只需1秒钟不到，无法恢复

#### 删除表

drop table 表名;

### 主键
推荐:
int
bigint
char

不推荐: varchar,主键一般是定长的

create table t_user (
    id int primary key auto_increment,//auto_increment表示自增,从1开始,以1递增
    name varchar(255)
)

### 事务

只有DML语句才有事务一说:
insert
delete
update
只有这三个

### 事务是如何实现的

### p114 索引概述

select * from t_user where name = 'jack';

以上这条sql语句会去name字段上扫描，为什么?
因为查询条件是: name = 'jack'

如果name字段上没有添加索引,或者说没有给name字段创建索引，mysql会全表扫描

### 索引实现原理

假设有一张用户表: t_user
id(PK)      name        每一行记录在硬盘上都有物理存储编号 
100         gg          0x11111
200         g2          0x22222
2           gf          0x33333
140         fdfas       0x44444

注意: 在任何数据库当中主键上都会自动添加索引对象，另外在mysql中,一个字段上如果有unique约束，也会自动创建索引

innoDB中，索引存储在tablespace中，索引以树的形式存在

任何一条记录在硬盘上都有一个物理编号

                 100(0x11111)
                /          \
               /            \
              2(0x33333)    200(0x22222)
select * from t_user where id = 2;
mysql发现id字段上有索引对象，所以会通过索引对象index进行查找

通过index索引定位到: 2
通过2得出物理磁盘编号: 0x3333,此时sql语句转换为:
select * from t_user where 物理编号 = 0x33333

### 什么情况考虑加索引

1. 数据了大
2. 该字段经常出现在where后面，以条件的形式存在，也就是这个字段经常被访问
3. 该字段很少的DML操作(insert delete update)操作。(因为DML后，索引需要重新排序)

### 索引怎么创建，怎么删除

创建:
create index emp_ename_index on emp(ename);
给emp表的ename字段添加索引，起名: emp_ename_index

删除:
drop index emp_ename_index on emp;

### 怎么查看一个sql语句是否使用了索引进行检索

explain select * from emp where ename = 'king';


### 34到作业练习

#### 取得每个部门最高薪水的人员名称

第一步: 取每个部门最高薪水
select deptno, max(sal) as maxsal from emp group by deptno;

第二步: 将以上结果作为临时表t

select e.ename, t.*
    from emp e
    join (select deptno, max(sal) as maxsal from emp group by deptno) t
    on t.deptno = e.deptno and t.maxsal = e.sal;

#### 哪些人的薪水在部门的平均薪水之上

第一步: 取得每个部门平均薪水

select deptno, avg(sal) as avg_sal
    from emp
    group by deptno


第二步:

select t.*, e.ename, e.sal
    from emp e
    join (select deptno, avg(sal) as avg_sal
            from emp
            group by deptno
    ) t
    on t.deptno = e.deptno and e.sal > t.avg_sal

#### 取得部门中(所有人的)平均的薪水等级

平均的薪水等级: 先计算每一个薪水的等级，在找到薪水等级的平均值
平均薪水的等级: 先计算平均薪水，在找到每个平均薪水的等级值

第一步: 找出每个人的薪水等级

select e.deptno, s.grade
    from emp e
    join salgrade s
    on e.sal between s.losal and s.hisal;

第二步: 基于以上的结果继续按照deptno分组，求grade的平均值

select e.deptno, avg(s.grade)
    from emp e
    join salgrade s
    on e.sal between s.losal and s.hisal;
    group by e.deptno;

#### 不准用组函数Max,取得最高薪水

方法一:

select e.sal
    from emp e
    order by sal desc
    limit 1;

方法二:

select sal
    from emp
    where sal not in (
        select e.sal
            from emp e1
            join emp e2
            on e1.sal < e2.sal
    )

#### 取得平均薪水最高的部门的部门编号

//如果最高的同时有多个，这种方法就不对
select deptno, avg(sal) as avg_sal
    from emp e
    group by deptno
    order by avg_sal desc
    limit 1;

//方法二
select deptno, avg(sal) as avg_sal
    from emp
    group by deptno
    having avg_sal = (
        select max(t.avg_sal)
            from (select avg(sal) as avg_sal from emp group by deptno)
    );

#### 取得平均薪水最高的部门的部门名称

select d.dname, avg(e.sal) as avg_sal
    from emp e
    join dept d
    on e.deptno = d.deptno
    group by d.dname
    order by avg_sal desc
    limit 1;

#### 求平均薪水的等级最低的部门的部门名称

select t.*, s.grade
    from (
        select d.dname, avg(e.sal) as avg_sal
        from emp e
        join dept d
        on e.deptno = d.deptno
        group by d.dname
    )
    join salgrade s
    on t.avg_sal between s.losal and s.hisal
    where s.grade = (select grade from salgrade where(select avg(sal) as avg_sal from emp group by deptno order by avg_sal asc limit 1) bewteen s.losal and s.hisal);


#### 取得比普通员工的最高薪水还要高的领导人姓名

第一步: 找出普通员工最高薪水
select max(sal) from emp where empno not in(select distinct mgr from emp where mgr is not null)

第二步：比普通员工最高薪水还要高的一定是领导

select ename, sal
    from emp
    where sal > (select max(sal) from emp where empno not in(select distinct mgr from emp where mgr is not null));

#### 取得最高薪水的前五名

select ename, sal
    from emp
    order by sal desc
    limit 5;

#### 取得最后入职的5名员工

select ename, hiredate
    from emp
    order by hiredate desc
    limit 5;

#### 取得每个薪水等级有多少员工

第一步: 找出员工薪水等级
select e.ename, e.sal, s.grade
    from emp e
    join salgrade s
    on e.sal between s.losal and s.hisal

第二步: 分组计算

select count(*), s.grade
    from emp e
    join salgrade s
    on e.sal between s.losal and s.hisal
    group by s.grade

#### 列出所有员工及领导的名字

select a.ename, b.ename
    from emp a
    left join
    emp b
    on a.mrg = b.empno;

#### 列出雇佣日期早于其直接上级的所有员工的编号，姓名，部门名称

select
    a.ename, b.ename, a.hiredate, b.hiredate, d.dname
    from emp a
    join
    emp b
    on a.mgr = b.empno
    join dept d
    on a.deptno = d.deptno
    where a.hiredate < b.hiredate

#### 列出部门名称和这些部门的员工信息，同时列出那些没有员工的部门

select e.*, d.*
    from emp e
    right join
    dept d
    on e.deptno = d.deptno;

#### 列出至少有5个员工的所有部门

select deptno
    from emp
    group by deptno
    having count(*) >= 5;

#### 列出薪水比"gg"多的所有员工信息

select e.*
    from emp
    where sal > (select sal from emp where ename = 'gg');

#### 列出所有"cl"(办事员)的姓名及部门名称，部门人数

第一步:
select e.ename, e.job, d.dname
    from emp e
    join dept d
    on e.deptno = d.deptno
    where e.job = "cl";

第二步:每个部门人数

select deptno, count(*) as deptcount from emp group by deptno;

//ok
select t1.*, t2.deptcount
    from () t1
    join () t2
    on t1.deptno = t2.deptno;

#### 列出最低薪资大于1500的各种工作及从事此工作的全部雇员人数

第一步: 按照工作岗位分组求最小值

select job, count(*) from emp group by job having min(sal) > 1500;

#### 列出在部门"GG"(销售部)工作的员工的姓名,假定不知道销售部的部门编号

select deptno from dept where dname = 'GG'

select e.ename
    from emp e
    where deptno = (t);

#### 列出薪资高于公司平均薪资的所有员工，所在部门，上级领导，雇员的工资等级

select e.ename, d.dname, l.ename, s.s.grade
    from emp e
    join dept d
    on e.deptno = d.deptno
    left join emp l
    on e.mgr = l.empno
    join salgrade s
    on e.sal between s.losal and s.hisal
    where e.sal > (select avg(sal) from emp);

#### 列出与"S"从事相同工作的所有员工及部门名称

select job from emp where ename = 'S'

select e.ename, e.job, d.dname
    from emp e
    join dept d
    on e.deptno = d.deptno
    where e.job = (t) and e.ename <> 'S';

#### 列出薪资等于部门30中员工的薪资的其它员工的姓名和薪资

select distinct sal from emp where deptno = 30

select ename, sal
    from emp
    where sal in(t) and deptno <> 30;

#### 列出薪资高于在部门30工作的所有员工的薪资的员工姓名和薪资，部门名称

select max(sal) from emp where deptno = 30

select e.ename, e.sal, d.dname
    from emp e
    join dept d
    on e.deptno = d.deptno
    where e.sal > (t);

#### 列出在每个部门工作的员工数量，平均工资和平均服务期限
没有员工的部门，部门人数是0

第一步:
select d.deptno, count(e.ename), ifnull(avg(e.sal),0), avg(系统当前年份-入职年份)
    from emp e
    right join
    dept d
    on e.deptno = d.deptno
    group by d.deptno

第二步:

select d.deptno, count(e.ename), ifnull(avg(e.sal),0), avg(YEAR, hiredate, now)
    from emp e
    right join
    dept d
    on e.deptno = d.deptno
    group by d.deptno

#### 列出所有部门的详细信息和人数

select d.deptno, d.dname, d.loc, count(e.ename)
    from emp e
    right join dept d
    on e.deptno = d.deptno
    group by d.deptno, d.dname, d.loc;//只有分完组的信息才可以向select里面放

#### 列出各种工作的最低工资及从事此工作的员工姓名

select job, min(sal) as min_sal
    from emp
    group by
    job

select e.ename, t.*
    from emp e
    join t
    on e.job = t.job and e.sal = t.min_sal;

#### 列出各个部门的领导(MANAGER)的最低工资

select deptno, min (sal)
    from emp
    where job = 'MANAGER'
    group by deptno;

#### 列出所有员工的年工资，按年薪从低到高排序

select ename, (sal+ifnull(comm,0))*12 as yearsal
    from emp
    order by yearsal asc;

#### 求出员工领导的薪水超过3000的员工名称和领导

select a.ename, b.ename
    from emp a
    join emp b
    on a.mgr = b.empno
    where b.sal > 3000;

#### 求出部门名称中，带's'字符的部门员工的工资合计 部门人数

select d.*, count(e.ename), ifnull(sum(e.sal),0)
    from emp e
    right join dept d
    on e.deptno = d.deptno
    where d.dname like '%s%'
    group by d.deptno, d.dname, d.loc;

#### 给任职日期超过30年的员工加薪10%

update emp set sal = sal * 1.1 where timestampdiff(YEAR,hiredate,now()) > 30



