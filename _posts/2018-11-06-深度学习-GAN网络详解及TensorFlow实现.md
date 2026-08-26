---
title: 深度学习-GAN网络详解及TensorFlow实现
date: 2018-11-06 23:06:41 +0800
categories:
- deep learning
tags:
- GNN
- generator
- deep learning
- tensorflow
- discriminator
---
## GAN的基本介绍

2014 年，Ian Goodfellow 及其蒙特利尔大学的同事引入了生成对抗网络（GAN）。这是一种学习数据的基本分布的全新方法，让生成出的人工对象可以和真实对象之间达到惊人的相似度。

### 基本概念

GAN（Generative Adversarial Networks），是一种生成式的，对抗网络。再具体一点，就是通过对抗的方式，去学习数据分布的生成式模型。所谓的对抗，指的是生成网络和判别网络的互相对抗。生成网络尽可能生成逼真样本，判别网络则尽可能去判别该样本是真实样本，还是生成的假样本。示意图如下：

![img](/assets/img/posts/深度学习-GAN网络详解及TensorFlow实现/640.png)

### 基本原理

生成器和判别器两个网络彼此博弈，目标是生成器生成与真实数据几乎没有区别的样本。生成器$G$的目标是基于噪声变量$z$生成一个对象$x^{'}$，并使其看起来和真的$x$一样。而判别器$D$的目标就是找到生成出的结果和真实$x$之间的差异，差异越小越好。如上图所示。隐变量$ z $（通常为服从高斯分布的随机噪声）通过 Generator 生成 $X_{fake}$, 判别器负责判别输入的 data 是生成的样本 $X_{fake}$还是真实样本 $X_{real}$。通过公式描述如下所示：
$$
\min _{G} \max _{D} V(D, G)=\mathbb{E}_{\boldsymbol{x} \sim p_{\operatorname{tat}}(\boldsymbol{x})}[\log D(\boldsymbol{x})]+\mathbb{E}_{\boldsymbol{z} \sim p_{\boldsymbol{z}}(\boldsymbol{z})}[\log (1-D(G(\boldsymbol{z})))]
$$
对于判别器 $D$ 来说，这是一个二分类问题，$V(D,G)$ 为二分类问题中常见的交叉熵损失。对于生成器 $G$ 来说，为了尽可能欺骗 $D$，所以需要最大化生成样本的判别概率 $D(G(z))$，即最小化 $log(1-D(G(z)))$，注意：$log(D(x))$ 一项与生成器 $G$ 无关，所以可以忽略。

实际训练时，生成器和判别器采取交替训练，即先训练 $D$，然后训练 $G$，不断往复。值得注意的是，对于生成器，其最小化的是$\max _{D} V(D, G)$，即最小化$V(D,G)$ 的最大值，这样形成一个对抗的过程。<!--more-->

### 目标函数

GAN网络的提出者Ian Goodfellow证明了，当经典GAN在最优化时就是最小化两个分布的JS散度。但在实际使用中，衡量两个分布的相似性有很多方式，如KL散度，JS散度，F散度，Bregman散度，Wasserstein距离等。因此可以定义不同的距离度量方式来定义目标函数。Wasserstein距离如下：
$$
W(p, q)=\inf _{\gamma \sim \Pi(p, q)} \mathbb{E}_{(x, y) \sim \gamma}[\|x-y\|]
$$

## GAN的训练过程

前面说过GAN包含了生成器和判别器，实际上是两个网络：生成网络和判别网络。那么在整个网络中，怎么来对网络进行训练呢？

### 生成器

对于生成器（生成网络）来说，输入一个$n$维向量，输出目标大小的样本，因此首先需要得到一个输入向量。以图片为例，可以输入一个分布的向量，输出图片像素大小的图片。

> 这里的生成器可以是任意可以输出图片的模型，比如最简单的全连接神经网络，又或者是反卷积网络等。

一般输入向量用随机输入即可，随机输入最好满足常见的分布，如高斯分布，均值分布等。输入向量经过生成网络后输出一个目标样本。

### 判别器

判别器一般采用常用的判别器，输入真实图片和生成的图片，辨别它们之间的差异。判别器可以为任意的判别器模型，如全连接网络，CNN网络等。

### 训练过程

上面对生成器和判别器进行了说明，下面可以说明如何训练，对基本流程进行简要的说明。基本训练流程如下：

- 初始化判别器的参数$\theta_{D}$和生成器$G$的参数$\theta_{G}$
- 从真实样本中采样 $m$个样本$\left\{x^{1}, x^{2}, \ldots x^{m}\right\}$，从先验分布噪声中采样$m$个噪声样本$\{z^{1}, z^{2}, \ldots, z^{m}\}$并通过生成器获取 $m$个生成样本$\left\{\tilde{x}^{1}, \tilde{x}^{2}, \ldots, \tilde{x}^{m}\right\}$固定生成器$G$，训练判别器$D$尽可能好地准确判别真实样本和生成样本，尽可能大地区分正确样本和生成的样本。
- **循环$k$次更新判别器之后，使用较小的学习率来更新一次生成器的参数**，训练生成器使其尽可能能够减小生成样本与真实样本之间的差距，也相当于尽量使得判别器判别错误。
- 多次更新迭代之后，最终理想情况是使得判别器判别不出样本来自于生成器的输出还是真实的输出。亦即最终样本判别概率均为0.5。使得生成器和判别器之间达到平衡（这点也被Ian Goodfellow证明会达到[纳什均衡]([https://zh.wikipedia.org/zh-hans/%E7%B4%8D%E4%BB%80%E5%9D%87%E8%A1%A1%E9%BB%9E](https://zh.wikipedia.org/zh-hans/納什均衡點))）。

> 之所以要训练k次判别器，再训练生成器，是因为要先拥有一个好的判别器，使得能够教好地区分出真实样本和生成样本之后，才好更为准确地对生成器进行更新。下面是GAN的论文中对训练过程的描述，如下图所示。

![img](/assets/img/posts/深度学习-GAN网络详解及TensorFlow实现/gan_train_p.jpg)

> 注：图中的**黑色虚线**表示真实的样本的分布情况，**蓝色虚线**表示判别器判别概率的分布情况，**绿色实线**表示生成样本的分布。 $Z$ 表示噪声， $Z$到 $x$表示通过生成器之后的分布的映射情况。
>
> 我们的目标是使用生成样本分布（绿色实线）去拟合真实的样本分布（黑色虚线），来达到生成以假乱真样本的目的。
>
> 可以看到在**（a）**状态处于最初始的状态的时候，生成器生成的分布和真实分布区别较大，并且判别器判别出样本的概率不是很稳定，因此会先训练判别器来更好地分辨样本。
> 通过多次训练判别器来达到**（b）**样本状态，此时判别样本区分得非常显著和良好。然后再对生成器进行训练。训练生成器之后达到**（c）**样本状态，此时生成器分布相比之前，逼近了真实样本分布。
> 经过多次反复训练迭代之后，最终希望能够达到**（d）**状态，生成样本分布拟合于真实样本分布，并且判别器分辨不出样本是生成的还是真实的（判别概率均为0.5）。也就是说我们这个时候就可以生成出非常真实的样本啦，目的达到。  

## GAN存在的问题

GAN网络在理论上偏于完美，但是在实践过程中还是存在较多的问题，主要存在以下问题：

1. GAN 提出者 Ian Goodfellow 在理论中虽然证明了 GAN 是可以达到纳什均衡的。可是我们在实际实现中，我们是在参数空间优化，而非函数空间，这导致理论上的保证在实践中是不成立的。 

2. 不收敛（non-convergence）的问题，所有的理论都认为 GAN 应该在纳什均衡（Nash equilibrium）上有卓越的表现，但梯度下降只有在凸函数的情况下才能保证实现纳什均衡。当博弈双方都由神经网络表示时，在没有实际达到均衡的情况下，让它们永远保持对自己策略的调整是可能的。

3. GAN 的优化目标是一个极小极大（minmax）问题，即$\min _{G} \max _{D} V(G, D)$，也就是说，优化生成器的时候，最小化的是$\max _{D} V(G, D)$。可是我们是迭代优化的，要保证 $V(G,D)$ 最大化，就需要迭代非常多次，这就导致训练时间很长。如果我们只迭代一次判别器，然后迭代一次生成器，不断循环迭代。这样原先的极小极大问题，就容易变成极大极小（maxmin）问题，可二者是不一样的，会出现mode collapse（模型崩溃）。即：
   $$
   \min _{G} \max _{D} V(G, D) \neq \max _{D} \min _{G} V(G, D)
   $$

针对上面的主要问题，很多其他GAN网络对经典的GAN网络进行了优化，如WGAN，StackGAN等，都是在GAN的基础上进行优化，扩展，时期应用更广泛。

## GAN常见的模型结构

### DCGAN

DCGAN 提出使用 CNN 结构来稳定 GAN 的训练，并使用了以下一些 trick： 

- Batch Normalization
- 使用 Transpose convlution 进行上采样 
- 使用 Leaky ReLu 作为激活函数

### [StackGAN](<https://arxiv.org/abs/1612.03242>)

StackGAN—构建两个GAN，第一个GAN（Stage-IGAN）用于根据文本描述生成一张分辨率低的图像，包括目标物体的大致形状和颜色。 第二个GAN 将Stage-I 生成的低分辨率图片和text作为输入, 修正之前生成的图并添加细节生成高分辨率的更加细致的图片。

![stackgan](/assets/img/posts/深度学习-GAN网络详解及TensorFlow实现/stack_gan_struct.png)

### [WGAN](https://arxiv.org/abs/1701.07875)

WGAN 提出了一种全新的距离度量方式——地球移动距离（EM, Earth-mover distance），也叫 `Wasserstein` 距离。即散度定义其中方式之一。`Wessertein`距离相比KL散度和JS散度的优势在于：即使两个分布的支撑集没有重叠或者重叠非常少，仍然能反映两个分布的远近。而JS散度在此情况下是常量，KL散度可能无意义。WGAN也是基于这个对经典GAN进行了优化。

还有很多GAN的结构，这儿只是列出了冰山一角，针对不同的应用场景有不同的网络结构。但都是基于经典的GAN模型基础上进行的结构优化，优化trick等。

## GAN的应用

GAN 在生成样本过程成不需要显式建模任何数据分布就可以生成`real-like` 的样本，所以 GAN 在图像，文本，语音等诸多领域都有广泛的应用。

在图像领域，在图像翻译，超分辨率，目标监测，图像联合分布学习，视频生成等。也可以做序列生成，音乐生成；语言和语音转换等。下面对各个领域的应用进行了总结：

![1558418520398](/assets/img/posts/深度学习-GAN网络详解及TensorFlow实现/1558418520398.png)

## GAN的TensorFlow实现

下面时对GAN网络的基础实现，生成器和判别器均是使用2层全连接的网络结构，在训练过程中先训练判别器再训练生成器，1-1的训练（即训练一次判别器后训练一次生成器），在每迭代10000步就生成一批图片。损失函数也是使用原始论文中的形式。具体代码参考如下：

```python
import tensorflow as tf
import numpy as np
import matplotlib.gridspec as gridspec

from typing import List
from matplotlib import pyplot as plt
from tensorflow.examples.tutorials.mnist import input_data

weight_std = 0.1  # 参数初始化分布参数


def variable_init(size: List):
    return tf.truncated_normal(shape=size, stddev=weight_std)


X = tf.placeholder(tf.float32, shape=[None, 784])

# 定义判别器的权重矩阵和偏置项向量, 由此可知判别网络为三层全连接网络
d_w1 = tf.Variable(variable_init([784, 128]))
d_b1 = tf.Variable(variable_init([128]))

d_w2 = tf.Variable(variable_init([128, 1]))
d_b2 = tf.Variable(variable_init([1]))
theta_d = [d_w1, d_w2, d_b1, d_b2]

# 定义生成器的输入噪声为100维度的向量组，None根据批量大小确定
Z = tf.placeholder(tf.float32, shape=[None, 100])


def sample_z(m, n):
    return np.random.normal(0, 1, size=(m, n)).astype(np.float32)


def generator(z):
    """生成器:输出层为784个神经元, 并输出手写字体图片"""
    g_w1 = tf.Variable(variable_init([100, 128]))
    g_b1 = tf.Variable(variable_init([128]))
    g_h1 = tf.nn.relu(tf.matmul(z, g_w1)+g_b1)

    g_w2 = tf.Variable(variable_init([128, 784]))
    g_b2 = tf.Variable(tf.zeros(shape=[784]))
    g_h2 = tf.matmul(g_h1, g_w2) + g_b2
    theta_g = [g_w1, g_w2, g_b1, g_b2]
    return tf.nn.tanh(g_h2), theta_g  # None, 784


def discriminator(x):
    """判别器"""
    d_h1 = tf.nn.relu(tf.matmul(x, d_w1)+d_b1)
    d_h2 = tf.matmul(d_h1, d_w2) + d_b2
    return tf.nn.sigmoid(d_h2), d_h2  # (batch_size, 1)


def plot(samples):
    fig = plt.figure(figsize=(4, 4))
    gs = gridspec.GridSpec(4, 4)
    gs.update(wspace=0.05, hspace=0.05)

    for i, sample in enumerate(samples):
        ax = plt.subplot(gs[i])
        plt.axis('off')
        ax.set_xticklabels([])
        ax.set_yticklabels([])
        ax.set_aspect('equal')
        plt.imshow(sample.reshape(28, 28), cmap='Greys_r')
    return fig


g_sample, theta_g = generator(Z)  # batch_size, 784
d_real, d_logit_real = discriminator(X)
d_fake, d_logit_fake = discriminator(g_sample)

# 以下为原论文的判别器损失和生成器损失
d_loss = -(tf.log(d_real) + tf.log(1. - d_fake))
g_loss = -tf.log(d_fake)

D_solver = tf.train.AdamOptimizer(learning_rate=0.0001).minimize(d_loss, var_list=theta_d)
G_solver = tf.train.AdamOptimizer(learning_rate=0.0001).minimize(g_loss, var_list=theta_g)

batch_size = 128
z_dims = 100
mnist = input_data.read_data_sets("../../data/mnist", one_hot=True)


with tf.Session() as sess:
    sess.run(tf.global_variables_initializer())
    i = 0
    for it in range(100000):
        if it % 10000 == 0:
            samples = sess.run(g_sample, feed_dict={Z: sample_z(16, z_dims)})

            fig = plot(samples)
            plt.savefig('./out/{}.png'.format(str(i).zfill(3)), bbox_inches='tight')
            i += 1
            plt.close(fig)

        X_mb, _ = mnist.train.next_batch(batch_size)
        _, D_loss_curr = sess.run([D_solver, d_loss], feed_dict={X: X_mb, Z: sample_z(batch_size, z_dims)})
        _, G_loss_curr = sess.run([G_solver, g_loss], feed_dict={Z: sample_z(batch_size, z_dims)})

        if it % 2000 == 0:
            print('Iter: {}'.format(it))
            print()

```

最终训练后，生成的图片如下:

![](/assets/img/posts/深度学习-GAN网络详解及TensorFlow实现/reult009.png)

## Reference

1. 到底什么是生成对抗网络GAN？： <https://www.msra.cn/zh-cn/news/features/gan-20170511>
2. 通俗理解生成对抗网络GAN： <https://zhuanlan.zhihu.com/p/33752313>
3. 简单理解和试验生成对抗网络GAN： <https://blog.csdn.net/on2way/article/details/72773771>
4. GAN入门及TF源码实现： <https://blog.csdn.net/qq_31456593/article/details/71113926>
5. GAN完整理论推导与实现： <https://www.jiqizhixin.com/articles/2017-10-1-1>
6. CNN反向传播过程详解： <https://zhuanlan.zhihu.com/p/40951745>
7. GAN完整理论推导和实现： <https://www.jiqizhixin.com/articles/2017-10-1-1>
8. GAN学习指南：从原理入门到制作生成Demo： <https://zhuanlan.zhihu.com/p/24767059>
9. Generative Adversarial Nets（译）： <https://blog.csdn.net/wspba/article/details/54577236>
10. 2018 年最棒的三篇 GAN 论文：<https://www.leiphone.com/news/201901/k1ogqdXFO6arLA5L.html>
11. GAN论文综述： <https://www.jiqizhixin.com/articles/2019-03-19-12>