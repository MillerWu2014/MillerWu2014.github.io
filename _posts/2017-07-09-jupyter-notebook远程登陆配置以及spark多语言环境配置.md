---
title: jupyter-notebook远程登陆配置以及spark多语言环境配置
date: 2017-07-09 10:51:07 +0800
categories:
- Python
tags:
- jupyter
- spark
---
`jupyter notebook`是一个基于浏览器的`python`数据分析工具，使用起来非常方便，具有极强的交互方式和富文本的展示效果。`jupyter`是它的升级版，它的安装也非常方便，一般`Anaconda`安装包中会自带。安装好以后直接输入`jupyter notebook`便可以在浏览器中使用。但是它默认只能在本地访问，如果想把它安装在服务器上，然后在本地远程访问，则需要进行如下配置：<!--more-->
1. 登陆远程服务器
2. 生成配置文件`$jupyter notebook --generate-config`
3. 生成密码打开`ipython`，创建一个密文的密码：
   ```shell
   In [1]: from notebook.auth import passwd
   In [2]: passwd()
     Enter password:
     Verify password:
   Out[2]: 'sha1:ce23d945972f:34769685a7ccd3d08c84a18c63968a41f1140274'
   ```
   把生成的密文`sha1:ce… `复制下来

4. 修改默认配置文件
  `$vim ~/.jupyter/jupyter_notebook_config.py`
  进行如下修改：
```shell
c.NotebookApp.ip='*'
c.NotebookApp.password = u'sha:ce...  # 刚才复制的那个密文'
c.NotebookApp.open_browser = False
c.NotebookApp.port =8888 #随便指定一个端口
```
5. 启动`jupyter notebook：$jupyter notebook`
6. 远程访问
  此时应该可以直接从本地浏览器直接访问`http://address_of_remote:8888`就可以看到`jupyter`的登陆界面。
7. 建立`ssh`通道
   如果登陆失败，则有可能是服务器防火墙设置的问题，此时最简单的方法是在本地建立一个`ss`h通道：在本地终端中输入`ssh username@address_of_remote -L127.0.0.1:1234:127.0.0.1:8888`便可以在`localhost:1234`直接访问远程的`jupyter`了。
8. 给`jupyter-notebook`服务器换个皮肤
```
pip install jupyterthemes
jt -l`  #　看看有哪些皮肤，再用
jt -t {皮肤名} -cellw 960 -T -tfs 11 -f source -nf ubuntu -tf source -fs 10
```
重启`jupyter-notebook`服务器，即可享受新皮肤。

9. 给`jupyter`安装插件  
```
# 安装`Jupyter Notebook extensions`
conda install -c conda-forge jupyter_contrib_nbextensions 
or
pip install https://github.com/ipython-contrib/IPython-notebook-xtensions/archive/master.zip --user
pip install jupyter_contrib_nbextensions
jupyter contrib nbextension install --user
```
运行`Jupyter Notebook`, 在打开的`Notebook`界面里, 你会发现多了一个`Nbextensions`,点击这个`tab`勾选`Table of Contents` (有的版本是`toc2`). 然后创建或者打开一个`Jupter Notebook`。

10. 部署不同版本的spark jupyter-notes

为了使用`jupyter`开发`spark`,需要对`spark`的`jupyter`环境进行开发,一般可以使用`toree`进行安装，方便快捷。也可以安装组件,但是相对复杂。使用`apache`的`toree`来安装`jupyter-scala`和`jupyter-spark`，很方便实用。既可以安装`pyspark`还是可以安装`scala`版本的`jupyter-spark`。主要安装过程如下：

```
pip install toree   # 安装toree`包
jupyter toree install --spark_home=$SPARK_HOME  # 用户jupyter配置Apache Toree
"""
    $ jupyter kernelspec list
    Available kernels:
    python3 /Users/myuser/Library/Jupyter/kernels/python3
    apache_toree_scala /usr/local/share/jupyter/kernels/apache_toree_scala
"""
# 安装jupyter notebook 和 pyspark
jupyter toree install --interpreters=PySpark
or
jupyter toree install --spark_home=$SPARK_HOME --interpreters=PySpark
or
jupyter toree install --spark_home=$SPARK_HOME --interpreters=Scala,PySpark,SparkR,SQL
```
