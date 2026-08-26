---
title: Convolutional Pose Machines论文记录
date: 2020-09-27 21:45:09 +0800
categories:
- deep learning
tags:
- deep-learning
- HPE
- CNN
- convolution
---
CPM模型的结构如下图所示。主要分为了不同的Stage。在**stage1**中，输入图片368×368，卷积层不改变feature maps的width和height，经三次 pooling 层，输出的feature maps大小46×46，共P+1个feature maps。stage≥2时，输入包括3部分，原始图片的特征X_z,前一stage输出的局部置信图(belief maps)和生成的center的Gaussian中心约束；网络的输出是一致的，都是46×46×(P+1)的feature maps。

![./CPM](/assets/img/posts/Convolutional-Pose-Machines论文记录/cpm_struct.png)

![CPM_CNN](/assets/img/posts/Convolutional-Pose-Machines论文记录/cpm_cnn.png)

Stage1：input是原始图像，经过全卷机网络，输出是一个P+1层的2Dmap。其中，全卷积网络中有7个卷积层，3个池化层，原始输入图片是 368*368 ，经过3次池化后得到 46*46 大小。又因为这里使用的数据库是半身结构，只有9个关节点，因此加上背景，输出的响应图大小应该是46*46*10。<!--more-->

Stage2：input是 Stage1 的 Output 响应谱，并且加上原始图像通过几层网络后的特征谱 feature map。输出是一个P+1层的2Dmap。其中，stage 2 融合了三部分的信息–一是stage1的响应图，二是原始图像的图像特征，三是高斯模版生成的中心约束。图像深度变为10+32+1=43。

Stage3：及其后面各个阶段的网络结构和 Stage 2 相似为了防止训练时出现梯度消失的问题：论文采用了中层监督（加入中层loss），加强反向传播。

- center map为一个高斯响应,因为cpm处理的是单人pose的问题，如果图片中有多人，那么center map可以告诉网络，目前要处理的那个人的位置。因为这样的设置，cpm也可以自底向上地处理多人pose的问题。

## 关键点

1. 在Stage2中将原始的图像X进行了变换，生成了X‘，再将X‘输入到stage≥2的网络中。
2. Center Map(生成的Center的Gaussian中心约束)是怎么样生成的？高斯模版生成的中心约束
3. 图像增强处理：随机旋转图片 [-40, 40]，图片缩放 [0.7, 1.3]，水平翻转
4. 中继监督：每个stage都进行loss计算，最终将每个stage的loss进行求和，作为总的loss。防止梯度小时，保证底层参数正常更新。

## 参考

[论文阅读：《Convolutional Pose Machines》CVPR 2016_青青韶华-CSDN博客](https://blog.csdn.net/qq_36165459/article/details/78321054)

[论文阅读笔记: 2016 cvpr Convolutional Pose Machines_ProYH-CSDN博客](https://blog.csdn.net/u010579901/article/details/79606257)