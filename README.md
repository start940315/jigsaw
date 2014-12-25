jigsaw —— 一个H5的拼图游戏
======
代码结构解释
---
源码主要由package.json、Gruntfile.js、index.ejs.html和src文件夹组成，下载后需要自行安装node包。之后需要自己grunt来处理代码。现有的grunt方法只支持default和release两种方式，default即本地调试模式，生成的index.html的资源位于src中；release为线上模式，会将src中的js和css压缩到static目录下，将img中的png压缩到static目录下，其他资源需要手动复制移动，生成的index.html的资源文件指向static。
