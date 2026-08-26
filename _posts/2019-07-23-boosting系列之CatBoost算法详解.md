---
title: boosting系列之CatBoost算法详解
date: 2019-07-23 23:31:20 +0800
categories:
- 机器学习
tags:
- boosting
- target-statistics
- catboost
- categorical
- feature
---
CatBoost是由俄罗斯的搜索公司Yandex提出的一类boosting集成学习算法，该算法主要是解决类别型特征的学习，可以直接对字符型类别特征进行处理和学习，使用非常简单，实用。因此算法名称也叫做CatBoost（categorical和boosting两者的结合）,该算法支持GPU，以及训练过程可视化等，支持Python，R等建模，也支持其他语言的部署。官方的论文结构如下，本文主要对3，4两个部分进行说明。

```tex
---- 1.Introduction
---- 2.Background
---- 3.Categorical feature
--------Target statistics: Greedy TS, Holdout TS, Leave-one-out TS, Ordered TS
---- 4.Prediction shift and ordered boosting
--------Prediction shift
--------Ordered boosting
---- 5.Practical implementation of ordered boosting
```

## Categorical features(类别特征)

这部分主要是对类别特征转化为数值型特征，一般类别特征的最简单的方式就是通过对应标签的平均值来代替，而CatBoost则使用了自己设定的方式来进行转换，而且会进行特征组合，生成新的特征。

### Greedy TS

类别特征不能直接在boosting中使用，因此需要将类别特征转换为数值型特征，CatBoost处理Categorical features的方式有别于其他方式，首先会计算TS(target statistics)，而传统的方式是：
$$
\hat{x}_{k}^{i}=\frac{\sum_{j=1}^{n}\left[x_{j, k}=x_{i, k}\right] \cdot Y_{i}}{\sum_{j=1}^{n}\left[x_{j, k}=x_{i, k}\right]}
$$
CatBoost对该方法进行了优化，采用**Greedy TS**，添加先验分布项，这样可以减少噪声和低频率数据对于数据分布的影响（这个公式写的很奇怪，可能是俄罗斯人思维方式和我们的差异）：
$$
\hat{x}_{k}^{i}=\frac{\sum_{j=1}^{p-1}\left[x_{\sigma_{j}, k}=x_{\sigma_{p}, k}\right] Y_{\sigma, j}+a \cdot P}{\sum_{j=1}^{p-1}\left[x_{\sigma_{j}, k}=x_{\sigma_{p}, k}\right]}
$$
其中，$a$为大于0的参数，$P$一般是target值得均值(添加的先验项)。其中方括弧中即满足条件为1，否则为0。但是上面得式子会出现一个问题就是greedy导致target leakage，$\hat{x}_{k}^{i}$的计算需要使用$y_k$和$x_k$，这样会出现**target leakage**，即$E\left(\hat{x}^{i} | y=v\right)=E\left(\hat{x}_{k}^{i} | y_{k}=v\right)$不成立。解决办法就是去掉$x_k$：$$D_{k} \subset D-\left\{x_{k}\right\}$$的样本来估计$\hat{x}_{k}^{i}$的值，不使用全部数据集合$D$。<!--more-->

### Holdout TS

这种方法是将数据集分为两部分，D0和D1，D0用来计算TS，而D1用来训练，这种方式减少了用于训练的数据量和用来计算TS的的数据量，但是也存在问题：并未使用到所有的数据集来计算TS特征和学习模型。

### Leave-one-out TS

为了平衡训练和TS的计算，leave-one-out 的方式可能会更好，文中对该方式进行了简要的说明。

### Ordered TS

为了将所有样本用于训练，CatBoost给出了一种解决方案，这受在线学习算法的启发（在线学习算法按照时序来获取训练数据），即首先对所有样本进行随机排序，然后针对类别型特征中的某个取值，每个样本的该特征转为数值型时都是基于排在该样本之前的类别标签取均值，同时加入了优先级和优先级的权重系数。CatBoost在不同的梯度提升步中使用不同的排列。

## Order Boosting

### Prediction shift

在梯度提升的过程中，存在`Prediction Shift`的问题，主要是应为特征的target leakage导致，处理的方式还是和`ordered ts`处理方式相同。
$$
h_{t}=\operatorname{argmin}_{\{h \in H\}} \frac{1}{n} \sum_{k=1}^{n}\left(-g^{t}\left(x_{k}, y_{k}\right)-h\left(x_{k}\right)\right)
$$
论文中对链式偏移（chain of shifts）进行了描述：

（1）梯度的条件分布和测试数据的分布存在偏移。

（2）$h_t$的估计和式子$h^{t}=\underset{h \in H}{\arg \min } \mathbb{E}\left(-g^{t}(\mathbf{x}, y)-h(\mathbf{x})\right)^{2}$存在偏差。

（3）最终会影响学习到的函数$F^t$的泛化能力。

### Order Boosting

为了解决上面的问题，CatBoost提出了order boosting的方案，具体算法如下图所示，首先是生成随机排列$\sigma$，随机配列用于下面的模型训练。在计算第$M_i$个模型时，使用排列中的前$i$个样本训练模型。在迭代（每次迭代使用的排列都不相同）的过程中，为了得到第$j$个样本的残差估计值，使用$M_{j-1}$模型进行估计。

![1563784395054](/assets/img/posts/boosting系列之CatBoost算法详解/order-boosting.png)

下图中对模型构建过程进行了简要可视化：

![1563789737273](/assets/img/posts/boosting系列之CatBoost算法详解/order_boost_compute.png)

论文中也分析了模型训练过程中的时间和空间复杂度，总体而言时间复杂度较高，因此，boosting tree构建过程必须进行改进和优化。

## 主要实现

### 树的构建

CatBoost 使用决策树，每次分裂节点均使用相同的策略。在Ordered Mode下，在计算梯度或者计算某个叶子节点平均梯度值，均只利用前 $i$个样本的信息。而在Plain Mode下，流程和GBDT算法类似，但是对于分类变量，计算其TS时仍会使用带permutation的模式（使用随机排列$\sigma^0$)。CatBoost实现了 gradient boosting，完全使用二叉树作为基础树形结构，而且是对称的二叉树。论文中认为使用这种树为了避免过拟合。

### 叶子节点值

在所有树结构都建立好的情况下，最终模型 $F$的叶子节点值是通过标准的梯度提升处理得到的，对于分类变量就需要使用随机排列 $\sigma^o$ 计算TS值。

具体的构建树的算法过程就不详细说明了，可以参考[官方论文](https://arxiv.org/pdf/1706.09516.pdf)中伪代码。

## CatBoost优点

- 性能卓越：在性能方面可以匹敌任何先进的机器学习算法
- 鲁棒性/强健性：它减少了对很多超参数调优的需求，并降低了过度拟合的机会，这也使得模型变得更加具有通用性
- 易于使用：提供与scikit集成的Python接口，以及R和命令行界面
- 实用：可以处理类别型、数值型特征
- 可扩展：支持自定义损失函数

## 参考文档

1. [CatBoost github main page](https://github.com/catboost/catboost)
2. [CatBoost AI Documentation](https://catboost.ai/)
3. [CatBoost原始Paper地址](https://arxiv.org/pdf/1706.09516.pdf)
4. [论文笔记-1](https://blog.csdn.net/u014686462/article/details/83543609)
5. [CatBoost一个简单实用的boosting算法](https://www.jianshu.com/p/49ab87122562)
6. [CatBoost原文解读](https://blog.csdn.net/appleyuchi/article/details/85413352)
7. [XGBoost、LightGBM和CatBoost的同与不同](https://lonepatient.top/2017/03/18/boosting.html)
8. [机器学习算法之Catboost](https://www.biaodianfu.com/catboost.html)