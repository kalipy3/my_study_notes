### 终端中使用：
1. debian `sudo apt-get install fzf`

### vim中使用：
1. [官方地址](https://github.com/junegunn/fzf.vim)

2. 安装:
```
Plugin 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plugin 'junegunn/fzf.vim'
```
2. 安装Rg:`sudo apt-get install ripgrep`

2. 安装Ag:` apt-get install silversearcher-ag`

3. `apt-get install 安装的版本太低,vim中使用fzf报错`
    1. apt-get remove fzf

    2. vim 随便打开一个文件，fzf会检测到fzf未安装，是否选择安装，我们选择是

    3. 等待fzf自动安装完成

4. Commands:
```
Command 	List
:Files [PATH] 	Files (runs $FZF_DEFAULT_COMMAND if defined)
:GFiles [OPTS] 	Git files (git ls-files)
:GFiles? 	Git files (git status)
:Buffers 	Open buffers
:Colors 	Color schemes
:Ag [PATTERN] 	ag search result (ALT-A to select all, ALT-D to deselect all)
:Rg [PATTERN] 	rg search result (ALT-A to select all, ALT-D to deselect all)
:Lines [QUERY] 	Lines in loaded buffers
:BLines [QUERY] 	Lines in the current buffer
:Tags [QUERY] 	Tags in the project (ctags -R)
:BTags [QUERY] 	Tags in the current buffer
:Marks 	Marks
:Windows 	Windows
:Locate PATTERN 	locate command output
:History 	v:oldfiles and open buffers
:History: 	Command history
:History/ 	Search history
:Snippets 	Snippets (UltiSnips)
:Commits 	Git commits (requires fugitive.vim)
:BCommits 	Git commits for the current buffer
:Commands 	Commands
:Maps 	Normal mode mappings
:Helptags 	Help tags 1
:Filetypes 	File types
```
