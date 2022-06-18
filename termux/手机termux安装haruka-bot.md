    手机termux安装haruka-bot.md
    
    :Author: kalipy
    :Email: kalipy@debian
    :Date: 2022-06-17 14:58

### 报错1

    Running setup.py install for uvloop ... error
      error: subprocess-exited-with-error
    
      × Running setup.py install for uvloop did not run successfully.

    checking if gcc supports -Wstrict-prototypes flag... yes
          checking for ar... no                             
          checking for lib... no
          checking for link... link -lib
          checking the archiver (link -lib) interface... unknown
          configure: error: could not determine link -lib interface

#### 解决

1.从报错信息中发现`checking for ar... no`

2.尝试安装gcc

    pkg install gcc
    However the following packages replace it:
      libllvm
    
    E: Package 'gcc' has no installation candidate

3.尝试安装libllvm

    pkg install libllvm

4.ok，现在gcc已经有了

    ~/qq $ gcc
    clang-14: error: no input files

5.尝试安装ar

    ~/qq $ pkg install ar
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    E: Unable to locate package ar

    ~/qq $ ar
    The program ar is not installed. Install it by executing:
    pkg install binutils                             

    ~/qq $ pkg install binutils

    ~/qq $ link
    link: missing operand
    Try 'link --help' for more information.

6.再次尝试安装uvloop

    ok

### 报错2

     × Running setup.py install for pillow did not run successfully.
      │ exit code: 1
      ╰─> [180 lines of output]
    
    running build_ext
          
          The headers or library files could not be found for jpeg,
          a required dependency when compiling Pillow from source.
          
          Please see the install instructions at:
             https://pillow.readthedocs.io/en/latest/installation.html
    
          The headers or library files could not be found for jpeg,
          a required dependency when compiling Pillow from source.
          
          Please see the install instructions at:
             https://pillow.readthedocs.io/en/latest/installation.html

#### 解决

1.访问`https://pillow.readthedocs.io/en/latest/installation.html`寻找线索

2.找到它的github地址为`https://github.com/python-pillow/Pillow/blob/main/setup.py`

3.去setup.py看看

4.发现如下线索

    class pil_build_ext(build_ext):
        class feature:
            features = [
                "zlib",
                "jpeg",
                "tiff",
                "freetype",
                "raqm",
                "lcms",
                "webp",
                "webpmux",
                "jpeg2000",
                "imagequant",
                "xcb",
            ]
    
            required = {"jpeg", "zlib"}
            vendor = set()

5.用pkg找找看

    u0_a121@localhost ~/qq [100]> pkg search jpeg
    Sorting... Done
    Full Text Search... Done
    jhead/stable 3.04-1 aarch64
      Exif Jpeg header manipulation tool
    
    jp2a/stable 1.1.1 aarch64
      A simple JPEG to ASCII converter
    
    jpegoptim/stable 1.4.6-2 aarch64
      JPEG optimizer that recompresses image files to a smaller size, without losing any information
    
    libjasper/stable 3.0.4 aarch64
      Library for manipulating JPEG-2000 files
    
    libjasper-utils/stable 3.0.4 aarch64
      JPEG-2000 utilities
    
    libjpeg-turbo/stable 2.1.3 aarch64
      Library for reading and writing JPEG image files
    
    libjpeg-turbo-progs/stable 2.1.3 aarch64
      Programs for manipulating JPEG files
    
    libjpeg-turbo-static/stable 2.1.3 aarch64
      Static libraries for libjpeg-turbo
    
    libjxl/stable 0.6.1-1 aarch64
      JPEG XL image format reference implementation
    
    libjxl-progs/stable 0.6.1-1 aarch64
      Programs for manipulating JPEG XL files
    
    openjpeg/stable 2.5.0 aarch64
      JPEG 2000 image compression library
    
    openjpeg-tools/stable 2.5.0 aarch64
      Command-line tools using the JPEG 2000 library

6.猜测和`JPEG-2000`有关，尝试下这个包

    u0_a121@localhost ~/qq> pkg install libjasper-utils

7.再次尝试安装

    u0_a121@localhost ~/qq> pip3 install pillow -i https://pypi.tuna.tsinghua.edu.cn/simple/
    Looking in indexes: https://pypi.tuna.tsinghua.edu.cn/simple/
    Collecting pillow
      Using cached https://pypi.tuna.tsinghua.edu.cn/packages/43/6e/59853546226ee6200f9ba6e574d11604b60ad0754d2cbd1c8f3246b70418/Pillow-9.1.1.tar.gz (49.8 MB)
      Preparing metadata (setup.py) ... done
    Using legacy 'setup.py install' for pillow, since package 'wheel' is not installed.
    Installing collected packages: pillow
      Running setup.py install for pillow ... done
    Successfully installed pillow-9.1.1

8.ok



