---
title: 使用python连接hive数据库并进行数据操作
date: 2017-10-13 21:20:54 +0800
categories:
- Python
tags:
- python
- hive
- thrift
---
在数据抽取或者数据存取过程中难免会遇到用其他语言对`hive`数据库进行操作。如`python`远程对`hive`数据库进行操作，需要通过`thrift`服务进行操作。本文的环境是`python==3.6.1`， `hive==1.1.0`，`thfit==0.10.0`

## ThriftServer介绍

客户端对`hive`数据库进行操作可以通过`Cli`进行，在本地这种方式较好，但是在远程操作时会很麻烦，因此提供了`hiveserver`和`hiveserver2`，在不启动cli的情况下对`hive`进行操作，可以在远程通过其他语言(`java, python, php`等)向hive请求并返回结果。也就是利用`thrift`进行整个过程操作。

`hiveserver2`主要是向远程调用提供了接口，通过`thrift rpc`实现，进行远程的操作。可以实现远程并行操作`hive`数据库。启动`hiveserver2`如下：

```shell
nohup hive --service hiveserver2 &
```

在启动后`hiveserver2`默认监听的端口为`10000`，可以在hive的配置文件(`hive-site.xml`)中查看或者修改该端口。可以通过命令查看该端口是否被监听：`netstat -antp | grep 10000`<!--more-->

## 连接hive的框架

在连接`hive`时，可以选择`thrift`本身，`pyhive`，`pyhs2`和`impyla`。在使用过程中首先尝试了`thrift`本身，但是通过配置后在连接返回：`thrift.transport.TTransport.TTransportException: None`，据网友说这是连接`hiveserver2`出现的问题。因此弃用`thrift`直接连接`hive`，选择其他三个。

`pyhs2`是以前hive官方推荐使用的库，主要依赖了`thrift`和`sasl`。但是这个库后面没有维护了，因此在最新的`python`和`hive`下有很多问题，因此弃用。

`impyla`是通过`impala`来对操作`hive`，目前使用的环境中`impala`没有启用，因此该库就放弃使用了。因此只剩下的`pyhive`。但是网上的使用者反应，推荐使用`pyhive`和`impyla`。

## 配置pyhive的运行环境

因为通过比较选择了`pyhive`和`hive`进行交互，因此需要在客户端部署`pyhive`，不需要在服务端安装`pyhive`。本文中主要是针对`linux`系统上的部署，不考虑`windows`上的部署。

1. 安装依赖包`sasl`的环境. 当安装了下面的`sasl`相关的部署包才能正确安装sasl

```shell
# ubuntu
sudo apt-get install sasl2-bin libsasl2-2 libsasl2-dev libsasl2-modules
# centos
sudo yum install cyrus-sasl-devel cyrus-sasl-gssapi cyrus-sasl-md5 cyrus-sasl-plain
# 使用pip安装python下的sasl
pip install sasl==0.2.1
```

2. 安装`thrift`的`python`包：`pip install thrift==0.10.0`
3. 安装`thrift_sasl`，者个包依赖了`sasl`和`thrift`：`pip install thrift_sasl====0.3.0`
4. 如果是`ubuntu`，则会多出一个步骤，否则在引用`sasl`包时可能会报错：`_ZTVNSt7__cxx1118basic_stringstreamIcSt11char_traitsIcESaIcEEE`，因此需要对`python`使用的`libgcc`进行更新，因为我部署的`python`环境是`anaconda3`因此直接执行`conda install libgcc`即可。
5. 安装`pyhive`，`pyhive`的安装很简单：`pip install pyhive==0.5.0`

经过上面的安装可以进行包的测试：

```shell
python -c "import sasl"
python -c "import thrift"
python -c "import pyhive"
```

测试成功后就可以连接服务端操作hive：

```python
from pyhive import hive
from TCLIService.ttypes import TOperationState
cursor = hive.connect('localhost').cursor()
cursor.execute('SELECT * FROM table LIMIT 10', async=True)

status = cursor.poll().operationState
while status in (TOperationState.INITIALIZED_STATE, TOperationState.RUNNING_STATE):
    logs = cursor.fetch_logs()
    for message in logs:
        print message
    status = cursor.poll().operationState

print cursor.fetchall()
```

## 参考资料

[hive的hiveserver服务介绍](http://www.cnblogs.com/liu-yao/p/3hive-dethriftserver-fu-wu.html)

[pyhive的github官方地址](https://github.com/dropbox/PyHive)

[Python client driver for HiveServer2 fails to install](https://stackoverflow.com/questions/22838752/hadoop-python-client-driver-for-hiveserver2-fails-to-install)

[Python Hive: thrift.transport.TTransport.TTransportException: None](https://stackoverflow.com/questions/27147208/python-hive-thrift-transport-ttransport-ttransportexception-none)

[Thift在系统中的配置](http://blog.csdn.net/hjh00/article/details/64917226)

[[CentOS6.5下通过Thrift使用Python连接操作hive 安装配置记录](http://www.cnblogs.com/KattyJoy/p/6540125.html)]