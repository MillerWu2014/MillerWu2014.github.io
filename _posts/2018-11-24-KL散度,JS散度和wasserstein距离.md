---
title: KL散度,JS散度和wasserstein距离
date: 2018-11-24 22:36:09 +0800
categories:
- 机器学习
tags:
- GNN
- KL散度
- deep learning
- JS散度
- Wasserstein
---
最初了解信息度量是通过熵的概念，比如信息增益，GINI等都是基于熵。而这三者也是基于信息熵，在信息论中主要对分布的相似度（距离的度量），但是三者差异性也是很强的；对这三种信息度量的方式进行详细的说明。

## 1.KL散度

KL散度又称为相对熵，信息散度，信息增益。KL散度是是两个概率分布P和Q 差别的非对称性的度量。 KL散度是用来 度量使用基于Q的编码来编码来自P的样本平均所需的额外的位元数。 典型情况下，P表示数据的真实分布，Q表示数据的理论分布，模型分布，或P的近似分布。在之前了解KL散度的时候也写过[KL散度的博文](http://www.idataskys.com/2017/07/26/%E4%BF%A1%E6%81%AF%E8%AE%BA%E4%B8%ADKL%E6%95%A3%E5%BA%A6%E8%AF%A6%E8%A7%A3/).
$$
DL(p||q)=\sum_{i=1}^{n} p(x) \log{\frac{p(x)}{q(x)}}
$$
**KL散度性质**：

1. 因为对数函数是凸函数，所以KL散度的值为非负数。
2. KL散度不是对称的。
3. KL散度不满足三角不等式。

## 2.JS（Jensen-Shannon）散度

JS散度度量了两个概率分布的相似度，基于KL散度的变体，解决了KL散度非对称的问题。一般地，JS散度是对称的，其取值是0到1之间。定义如下：
$$
JS(P_1||P_2)={\frac {1} {2}} KL(P_1 || \frac {P_1+P_2} {2})+{\frac {1} {2}} KL(P_2 || \frac {P_1+P_2} {2}）
$$
如果P1，P2完全相同那么JS散度的值为0，否则为1. JS散度的时对称的而且是有界的[0, 1]。在深度学习中的GAN网络中会有JS散度的概念。

**KL散度和JS散度度量的时候有一个问题**：
如果两个分配P,Q离得很远，完全没有重叠的时候，那么KL散度值是没有意义的，而JS散度值是一个常数。这在学习算法中是比较致命的，这就意味这这一点的梯度为0。梯度消失了。<!--more-->

## 3.Wasserstein距离

Wasserstein距离又叫Earth-Mover距离(EM距离)，用于衡量两个分布之间的距离， 数学定义如下：
$$
W(P_1, P_2)=\inf_{\gamma \sim\Pi(P_1,P_2)} \mathbb E_{(x,y) \sim \gamma}[||x-y||]
$$
$\Pi(P_1,P_2)$是$P_1$和$P_2$分布组合起来的所有可能的联合分布的集合。对于每一个可能的联合分布$\gamma$，可以从中采样$(x,y)∼γ$得到一个样本$x$和$y$，并计算出这对样本的距离$||x−y||$，所以可以计算该联合分布$\gamma$下，样本对距离的期望值$\mathbb E_{(x,y) \sim \gamma}[||x-y||]$，在所有可能的联合分布中能够对这个期望值取到的下界$\inf_{\gamma \sim\Pi(P_1,P_2)} \mathbb E_{(x,y) \sim \gamma}[||x-y||] $就是Wasserstein距离。 

直观上可以把$\mathbb E_{(x,y) \sim \gamma}[||x-y||]$理解为在$\gamma$这个路径规划下把土堆$P_1$挪到土堆$P_2$所需要的消耗。而`Wasserstein`距离就是在最优路径规划下的最小消耗。所以`Wesserstein`距离又叫`Earth-Mover`距离。 

`Wessertein`距离相比KL散度和JS散度的优势在于：即使两个分布的支撑集没有重叠或者重叠非常少，仍然能反映两个分布的远近。而JS散度在此情况下是常量，KL散度可能无意义。

在GAN网络的优化网络WGAN网络就是基于Wasserstein距离进行的优化。最终才得到要一个能够训练，且快速的GAN网络，简称WGAN网络。

## Refrence

1. [维基百科-Wasserstein metric](https://en.wikipedia.org/wiki/Wasserstein_metric)
2. [JS散度（Jensen-Shannon divergence)](https://www.cnblogs.com/smuxiaolei/p/7400923.html)