1.说明：  
linux不同发行版本，不同的电源管理工具，电池剩余电量的位置不一。但存放电池剩余电量信息的文件名称不变：capacity，而且位置我们可以肯定它在/sys/目录下某处。因此，我们只需要使用：

`sudo find /sys/ -name capacity -exec cat {} \;`

命令便可以获取笔记本的剩余电量，而且这条十分简洁，无需记又臭又长的路径。

2.如果依然觉得这条命令太长，可以使用`alias capacity=‘sudo find /sys/ -name capacity -exec cat {} \;‘`来自定义一个capacity命令，然后就可以直接使用
`capacity`来查看电池剩余电量。
