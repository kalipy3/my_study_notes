android@localhost:~$ sudo qemu-system-x86_64 -hda virt-alpine.img -boot c -m 1G --accel tcg,thread=multi -smp 8,cores=4,threads=2,sockets=1 -nographic
