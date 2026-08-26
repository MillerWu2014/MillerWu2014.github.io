---
title: docker部署anaconda开发环境
date: 2017-07-09 10:04:38 +0800
categories:
- Python
tags:
- docker
- anaconda
---
由于在工作中使用`docker`部署一个科学计算的环境`anaconda`，如：`docker run -d -p 50001:22 anaconda2:ssh /usr/sbin/sshd -D`，可以简单的用脚本启动一个指定本地端口映射到容器`22`端口的一个容器环境，特别是在生成多个容器时。因此使用`python`写一个脚本能够实现该功能。避免在工作中重复使用`docker run`的命令来生成容器。该脚本还可以扩展一些功能，如获取容器的虚拟`IP`，获取容器的名称和容器`ID`，对容器的操作等等。<!--more-->下面为实现的脚本：
```python
#!/usr/bin/python

from __future__ import print_function
import commands
from optparse import OptionParser
import sys

def check_stats(stats_code):
    if not stats_code:
        return True
    return False

parse = OptionParser()
parse.add_option("-p", "--port", action="store", dest="port", help="Config location host port.")
parse.add_option("-i", "--image", action="store", dest="image_name",
                help="The image's name, use generate docker container.")
parse.add_option("-s", "--stop", action="store", dest="container_id",
                help="Stop the container from give container's id.")

option, args = parse.parse_args()

if len(args) == 1:
    print(args, "The number of args is 1, must have many parameter.")
if option.port:
    stats, process_line = commands.getstatusoutput("ps aux | grep daemon | grep docker | grep -v grep")
    if not stats:
        start_stats, _ = commands.getstatusoutput("service docker restart")
        if check_stats(start_stats):
            print("The docker daemon service start success.")
        else:
            print("The docker daemon service start error.")
            sys.exit(1)

    image_name = option.image_name if option.image_name else 'anaconda2-ssh:ssh'
    stat, values = commands.getstatusoutput("docker run -d -p {0}:22 {1} /usr/sbin/sshd -D".
                                            format(option.port, image_name))
    if check_stats(stat):
        container_id = commands.getoutput("docker ps -l -q")
        print(container_id)
    else:
        print("Failed to create container.")
        sys.exit(1)

elif option.container_id:
    mask_code, output_value = commands.getstatusoutput("docker stop {0}".format(option.container_id))
    if check_stats(mask_code):
        print("The container({0}) stop success.".format(option.container_id))
    else:
        print("Failed to stop container({0}).".format(option.container_id))
        sys.exit(1)
else:
    print("This script use error. Reference: \n Usage: file.py [options]")
    sys.exit(1)
```
