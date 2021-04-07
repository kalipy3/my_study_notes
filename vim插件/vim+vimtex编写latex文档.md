```
vim+vimtex编写latex文档.md

:Author: kalipy
:Email: kalipy@debian
:Date: 2021-04-07 20:34
```
### 说明 

之所以推荐vimtex编写latex是因为，vimtex属于实时编译预览的插件(`vim-latex`和`latex-live-preview`的结合体)，使用起来更加方便


* vimtex: 实时编译，并预览
* vim-latex: 只是编译和预览，并不能实时呈现，需要每次`\ll`和`\lv`
* latex-live-preview: 可以实时预览，但是不能编译生成pdf文档

### 安装中文环境的latex和latex使用所必须的包

    texlive-latex-base //LaTex的基础包,有需要再安装其他的
    latex-cjk-all //中日韩等语言环境
    texlive-latex-extra //编译时需要
    texlive-xetex //编译带中文的文档
    texlive-publishers //support for publishers, theses, standards, conferences, etc.

    sudo apt-get install texlive-latex-base latex-cjk-all texlive-latex-extra
    sudo apt-get install texlive-xetex texlive-publishers
    sudo apt-get install latexmk

### 安装vimtex

    "vimtex实时编译并预览latex文档
    Plugin 'lervag/vimtex'

### 安装pdf阅读器zathura(如果使用okular可以不用安装zathura)

    sudo apt-get install zathura xdotool

### 配置vim-latex和latex-live-preview

    let g:tex_flavor='latex'
    "使用zathura预览文档(官方推荐)
    "let g:vimtex_view_method='zathura'
    "使用okular预览文档(我推荐)
    let g:Tex_ViewRule_pdf = 'okular --unique'
    let g:vimtex_quickfix_mode=0
    "对中文的支持
    let g:Tex_CompileRule_pdf = 'xelatex -synctex=1 --interaction=nonstopmode $*'
    let g:vimtex_compiler_latexmk_engines = {'_':'-xelatex'}
    let g:vimtex_compiler_latexrun_engines ={'_':'xelatex'}
    set conceallevel=2  "这里建议写成2，写1时替换后的效果不好看
    let g:tex_conceal='abdmg'

### 使用

编写中文版hello world 

vim test.tex

    %! Tex program = xelatex
    \documentclass{article}
    \usepackage[UTF8]{ctex}
    \begin{document}
    
    hello 中国
    
    \end{document}

编译生成`pdf`并预览

    \ll

预览生成的`pdf`

    \lv

### latex语法学习

基础语法

    https://blog.csdn.net/tianzong2019/article/details/106521432#hello_world_36

Latex-pgfplots绘制3维曲线图

    https://blog.csdn.net/tianzong2019/article/details/106665695

Latex-TiKZ绘制数学平面几何图

    https://blog.csdn.net/tianzong2019/article/details/106571723

