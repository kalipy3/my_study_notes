```
:Author: kalipy
:Email: kalipy@debian
:Date: 2020-11-22 21:12
```

今天手残，不小心把linux的分区全删除了(开始-->程序-->工具-->打开管理驱动器及媒体，选择linux的所有分区，删除),好在我没有重启linux,不然就得用麻烦的u盘进拯救模式了

---

### 废话不多说，开始正题

1. 虽然删除了linux所有的分区(我这里是sda5和swap的sda6)后管理驱动器及媒体(UDisks 2.8.1)显示只有sda sda1 sda2 sda4,没有sda5和sda6了，但是通过`cat /proc/partitions`命令依然可以查看到刚刚已经被删除的sda5和sda6
    ```
    cat /proc/partitions
    major minor  #blocks  name
    
       8        0  488386584 sda
       8        1   61440000 sda1
       8        2   40958976 sda2
       8        4   48399360 sda4
       8        5  105707520 sda5
       8        6    4108288 sda6
    ```

2. 修复刚才删除的linux主分区sda5(abcdef六步,start和end按print显示的填)
    ```
    a. sudo parted /dev/sda5
    
    b. (parted) print
    Model: Unknown (unknown)
    Disk /dev/sda5: 108GB
    Sector size (logical/physical): 512B/4096B
    Partition Table: loop
    Disk Flags:
    
    Number  Start  End    Size   File system  Flags
     1      0.00B  108GB  108GB  ext4
    
    c. (parted) rescue
    
    d. Start? 0.00B
    
    e. End? 108GB
    
    f. (parted) quit
    
    ```

3. 修复刚才删除的linux swap分区sda6
    ```
    sudo parted /dev/sda6
    GNU Parted 3.2
    Using /dev/sda6
    Welcome to GNU Parted! Type 'help' to view a list of commands.
    (parted) rescue
    Start? quit
    Error: Invalid number.
    (parted) print
    Model: Unknown (unknown)
    Disk /dev/sda6: 4207MB
    Sector size (logical/physical): 512B/4096B
    Partition Table: loop
    Disk Flags:
    
    Number  Start  End     Size    File system     Flags
     1      0.00B  4207MB  4207MB  linux-swap(v1)
    
    (parted) rescue 0.00B
    End? 4207MB
    (parted) quit
    Information: You may need to update /etc/fstab.
    
    ```

4. 再次(开始-->程序-->工具-->打开管理驱动器及媒体),查看分区信息，发现sda5和swap分区的sda6回来了。

6. 完~
