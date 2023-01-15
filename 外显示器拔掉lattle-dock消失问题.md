外显示器拔掉lattle-dock消失问题.md

    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2022-11-20 09:50

请看日志：

```
[I] kalipy@debian ~> latte-dock --replace -d
[debug 9:48:51.771771] - package is valid true
[debug 9:48:51.771771] - connector : "eDP-1"  -  "10"
[debug 9:48:51.771771] - Known Screen -  "eDP-1"  -  10
[debug 9:48:51.771771] - connector : "HDMI-1"  -  "11"
[debug 9:48:51.771771] - Known Screen -  "HDMI-1"  -  11

[debug 9:40:58.922922] - LOADING CORONA LAYOUT: "/home/kalipy/.config/latte/kalipy.layout.latte"
[info 9:40:58.958958] - Applet preload policy set to 1
[debug 9:40:58.9797] - Layout ::::  "kalipy"  ::: addDock was called... m_containments ::  1
[debug 9:40:58.9797] - step 1...
[debug 9:40:58.9797] - step 2...
[debug 9:40:58.9797] - step 3...
[debug 9:40:58.9797] - add dock - containment id:  12  ,screen :  11  -  "HDMI-1"  ,onprimary: false  -  "eDP-1"  ,forceOnPrimary: false
[debug 9:40:58.9797] - add dock - connector :  "HDMI-1"
[debug 9:40:58.9797] - reject : adding explicit dock, screen not available ! :  "HDMI-1"
```

解决：

```
//把lastScreen=11改为lastScreen=10即可
[I] kalipy@debian ~> vim /home/kalipy/.config/latte/kalipy.layout.latte
```
