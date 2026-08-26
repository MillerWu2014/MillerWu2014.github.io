---
title: 深度学习-详解RNN网络及TensorFlow实现
date: 2018-05-01 10:04:38 +0800
categories:
- deep learning
tags:
- RNN
- deep learning
- tensorflow
- SGD
---
## 1.RNN是什么

RNN在[维基](https://zh.wikipedia.org/zh-hans/%E9%80%92%E5%BD%92%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C)上面有两种定义，但是一般默认的为时间递归神经网络，全称为(`Recurrent Neural Network`，简称为RNN)。RNN主要解决序列数据的处理，如文本，语音，视频等。典型应用在语言模型中，比如下面的示例：

```tex
我昨天上学迟到了，老师批评了____。
```

让机器在空的地方填词，这儿填写的词最有可能是"我"，但对于这样的模型通过什么来实现呢？RNN就是很好的选择，它很擅长处理序列数据。

传统的神经网络是层与层之间进行连接，但是每层之间的神经元是没有连接的（假设各个数据之间是相互独立的）。而RNN的结构就是当前层的数据和之前的输出也有关系，即每层之间的神经元不再是无连接，而是有连接的。基本结构可以通过下面表示：

![nn](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\rnn_struct.png) 

上面的结构中非常清晰的表示了layer的结构，主要针对序列型的数据，各个神经元之间存在关联，每个时刻的状态会输入到后续的时刻中。

## 2.RNN结构

RNN的大体结构如上图所示，也可以更加详细的表示，如下图中，输入，输出，状态项等。如下图中，存在一个循环结构，每个时间点的状态进行了下一时间点输入。

![RNN01](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\rnn_01.jpg) 

在上图中，输入单元（`input units`）为：$x_{t-1}, x_t, x_{t+1}$，输出单元（`output units`）为：$o_{t-1}, o_t, o_{t+1}$，隐藏单元（`hidden units`）为：$s_{t-1}, s_t, s_{t+1}$。

在某个时刻的隐层单元的输出：$s_t=f(Ws_{t-1}+Ux_t)$ ，其中$f$函数为激活函数，一般为`sigmoid,tanh,relu`等函数。在计算$s_0$时需要前面的状态，但是并不存在，因此一般设置为0向量。

某个时刻$t$的输出为：$o_t=softmax(Vs_t)=softmax(V(f(Ws_{t-1}+Ux_t)))$，其中$s_t$为时刻$t$的记忆单元。$s_t$包含了前面所有步的记忆，但是在实际使用过程中，$s_t$只会包含前面若干步的记忆，而不是所有步。

RNN中，每输入一步，每一层都共享参数$U,V,W$，RNN中主要在于隐藏层，在隐藏层能够捕捉到序列的关键信息。
<!--more-->
## 3.RNN的泛化结构

RNN的变体有很多，如双向RNN，多层双向RNN，多对多的RNN，一对多的RNN等等。下面对各种结构进行展示，并对这些结构进行简要说明。

### 3.1 一对一

即一个输入对应一个输出的结构，如上图中的结构。

### 3.2 多对一的结构

![Many to one](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\RNN_02.png) 

多个输入对应一个输出，比如情感分析。如一段话，判断这段话的情感。其中，$x_1, x_2, ..., x_{t-1}, x_t$表示句子中的$t$个词语，$o$表示最终的情感输出标签。

### 3.3 一对多的结构

![One to Many](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\RNN_03.png) 

这个结构和3.2中的多对一的结构类似。

### 3.4 多对多结构

![Many to Many](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\RNN_04.png) 

### 3.5 双向RNN

前面的结构均为单向的RNN，$s_t$都只是记录了之前的信息，未考虑后面的信息。基于这种情况，于是出现了双向RNN，这种结构可以用到机器翻译，需要根据上下文的情况，给出翻译结果。

![RNN](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\RNN_05.png) 

双向RNN的结构要复杂一些，如前向计算：
$$
o_t=w^{os}_ts_t+w^{oh}_th_t=w^{os}_t(w_{t-1}^{sh}s_{t-1}+w_{t-1}^{sx}x_{t})+w^{oh}_t(w_{t}^{hx}s_{t+1}+w_{t}^{hh}x_{t})
$$

### 3.6 多层RNN

前面的结构中多只是单层的state形式RNN，深度网络肯定是深层次结构会有更好的效果。因此可以是多层的RNN，多层次的RNN结构如下：

![æ·±å±çRNN](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\RNN_06.png) 

## 4.Back Propagation Through Time(BPTT)训练

### 4.1 符号说明

现在根据上面的1对1结构，如下图所示，说明反向传播过程。在整个模型过程中有部分激励函数来对节点进行计算：

![RNNåºæ¬ç»æ](http://lawlite.me/assets/blog_images/RNN/RNN_09.png) 

$\phi$ ：隐藏层的激活函数

$\varphi$ ：输出层的变换函数

$L_t=L_t(o_t, y_t)$：模型的损失函数

其中$y_t$为一个one-hot向量。

### 4.2 反向传播过程

上面的损失函数只是计算了某个时刻的损失，当接受完序列后，再统一计算损失，此时模型的总损失为（假设输入序列的长度为$n$时）：
$$
L=\sum_{t=1}^n{L_t}
$$
下面对整个结构细化后：

![RNN](http://lawlite.me/assets/blog_images/RNN/RNN_10.png) 

$o_t=\varphi(Vs_t)=\varphi(V(Ux_t+ws_{t-1}))$

其中$s_0=(0, 0, 0, ......, 0)^T$

令：$o_t^=Vs_t$，$s_t^=Us_t+ws_{t-1}$，即就是没有经过激励函数和变换函数前 ，则有：$o_t=\varphi(o_t^), s_t=\phi(s_t^)$

#### 4.2.1 矩阵V的更新

对于V的更新和传统的神经网络更新方式一致，主要通过链式法则来进行求导：
$$
\frac{\partial{L_t}}{\partial{s_t^,}}=\frac{\partial{L_t}}{\partial{Vs_t}}\times\frac{\partial{V^Ts^T}}{\partial{s_t}}\times\frac{\partial{s_t}}{\partial{s_t^,}}=V^T(\frac{\partial{L_t}}{\partial{o_t}}\varphi'(o_t^,))\\
\frac{\partial{L_t}}{\partial{s_{k-1}^,}}=\frac{\partial{L_t}}{\partial{s_{k}^,}}\times\frac{\partial{s_k^,}}{\partial{s_{k-1}^,}}=W^T\times(\frac{\partial{L_t}}{\partial{s_{k}^,}}\varphi'(s_{k-1}^,)), k=1,2,3,4,......,t
$$
因为$L=\sum_{t=1}^n{L_t}$，所以对应矩阵V的更新导数为：
$$
\frac{\partial{L}}{\partial{V}}=\sum_{t=1}^n(\frac{\partial{L_t}}{\partial{o_t}}{\varphi}'(o_t))\times{s_t^T}
$$

#### 4.2.2 矩阵U和W的更新

因为RNN和BP网络不同的是各个神经元之间(state)存在通信，因此再计算梯度的时候和BP网络计算梯度有一定的差异。可以通过循环来计算各个梯度，时间t从n到1进行循环。

首先计算某个时间点上的梯度：
$$
\frac{\partial{L_t}}{\partial{s_t^,}}=\frac{\partial{L_t}}{\partial{Vs_t}}\times\frac{\partial{V^Ts^T}}{\partial{s_t}}\times\frac{\partial{s_t}}{\partial{s_t^,}}=V^T(\frac{\partial{L_t}}{\partial{o_t}}\varphi'(o_t^,))\\
\frac{\partial{L_t}}{\partial{s_{k-1}^,}}=\frac{\partial{L_t}}{\partial{s_{k}^,}}\times\frac{\partial{s_k^,}}{\partial{s_{k-1}^,}}=W^T\times(\frac{\partial{L_t}}{\partial{s_{k}^,}}varphi'(s_{k-1}^,)), k=1,2,3,4,......,t
$$
利用巨补梯度计算U和W的梯度：
$$
\frac{\partial{L_t}}{\partial{U}}+=\sum_{k=1}^t\frac{\partial{L_t}}{\partial{s_k^,}}\times\frac{\partial{s_k^,}}{\partial{U}}=\sum_{k=1}^t\frac{\partial{L_t}}{\partial{s_k^,}}\times{x_t^T}\\
\frac{\partial{L_t}}{\partial{W}}+=\sum_{k=1}^t\frac{\partial{L_t}}{\partial{s_k^,}}\times\frac{\partial{s_k^,}}{\partial{W}}=\sum_{k=1}^t\frac{\partial{L_t}}{\partial{s_k^,}}\times{s_{t-1}^T}
$$

### 4.3 训练问题

从上面的参数更新可以看出，在更新权重时都需要计算一个激活函数的倒数，如果时间长度较长时，而梯度时累积的，因此会造成度消失或梯度爆炸

RNN的作用主要是存在记忆的功能，但是梯度问题又反应出了不能使用太长的时间长度，即不能记忆太久的信息，这样就存在一定矛盾，改进的思路主要有：

1. 使用一些trick，比如合适的励函数不使用tanh, sigmod等函数，使用relu类似的)，初始化，BN等
2. 改进RNN中tate的传递方式比如RNN的升级版本LSTM模型。

## 5. RNN结构详解

![RNN结构详解](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/RNNs结构详解图.png)

## 6. RNN基于mnist的实现

基于mnist数据实现RNN模型，对结果的预测。mnist的图片为2828的矩阵，因此在RNN输入时：`time_step=28`，`depth=28`，目标序列的长度为10，RNN种的隐藏神经元个数在本实例中定义为128，即：`state_size=128`。

```python
"""
Recurrent Neural Network. A Recurrent Neural Network (RNN) implementation example using TensorFlow library.
"""
from __future__ import division, print_function
from tensorflow.examples.tutorials.mnist import input_data

import tensorflow as tf
import os


os.environ['TF_MIN_GPU_MULTIPROCESSOR_COUNT'] = '2'
mnist = input_data.read_data_sets('/opt/workspace/project/deep-st-nn/data/MNIST_DATA', one_hot=True)

# defined train parameters
learning_rate = 0.02
train_step = 10000
batch_size = 100

# defined network parameters
time_steps = 28  # the mnist image size 28  28
depth = 28  # singe input vector length: depth
hidden_num = 128  # state_size
num_classes = 10  # mnist total class

# graph inputs
with tf.name_scope("inputs"):
    X = tf.placeholder(tf.float32, shape=(None, time_steps, depth), name="X")
    Y = tf.placeholder(tf.float32, shape=(None, num_classes), name="Y")

    with tf.name_scope("variables"), tf.device("/cpu:0"):
        # defined variables
        weights = {"out": tf.Variable(tf.random_normal((hidden_num, num_classes)), trainable=True,
                                      name="out_weights")}
        bias = {"out": tf.Variable(tf.random_normal([num_classes]),
                                   name="out_bias")}


def rnn_model(x, weights_, bias_):
    """
    parameters
    ----------
        x: tensor, model inputs, shape is [batch_size, time_steps, depth]
        weights_: dict variable, the output transform parameter, shape is [state_size, output_length or class_num]
        bias_: dict variable, the output transform bias, shape is [output_length or class_num]

    return
    ------
        tensor, model output, the shape is [batch_size, class_num]
    """
    # inputs_ = tf.unstack(x, axis=1)  # to list [batch_size, depth]
    cell = tf.nn.rnn_cell.BasicLSTMCell(hidden_num, forget_bias=1.0)
    # cell = tf.nn.rnn_cell.BasicRNNCell(hidden_num)
    outputs, states = tf.nn.dynamic_rnn(cell, x, dtype=tf.float32,
                                        initial_state=cell.zero_state(batch_size=batch_size, dtype=tf.float32))
    outputs = tf.unstack(outputs, axis=1)
    return tf.matmul(outputs[-1], weights_.get("out")) + bias_.get("out")


def mul_rnn_model(x, weights_, bias_):
    """
    parameters
    ----------
        x: tensor, model inputs, shape is [batch_size, time_steps, depth]
        weights_: dict variable, the output transform parameter, shape is [state_size, output_length or class_num]
        bias_: dict variable, the output transform bias, shape is [output_length or class_num]

    return
    ------
        tensor, model output, the shape is [batch_size, class_num]
    """
    with tf.name_scope("hidden"):
        mul_cell = tf.nn.rnn_cell.MultiRNNCell([tf.nn.rnn_cell.BasicRNNCell(hidden_num) for _ in range(3)])
        # dropout wrapper
        dropper_cell = tf.nn.rnn_cell.DropoutWrapper(mul_cell, output_keep_prob=1, state_keep_prob=0.7)
        outputs, states = tf.nn.dynamic_rnn(dropper_cell, x, dtype=tf.float32)
        outputs = tf.unstack(outputs, axis=1)
        # tf.summary.histogram("hidden_last_ouput", outputs[-1])
        return tf.matmul(outputs[-1], weights_.get("out")) + bias_.get("out")


with tf.name_scope("loss"):
    with tf.device("/gpu:1"):
        logits = mul_rnn_model(X, weights, bias)  # rnn_model(X, weights, bias)
        prediction = tf.nn.softmax(logits)
        loss_op = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits(logits=logits, labels=Y))

with tf.name_scope("train"):
    with tf.device("/gpu:0"):
        optimizer = tf.train.GradientDescentOptimizer(learning_rate=learning_rate)
        train_op = optimizer.minimize(loss_op)

correct_predict = tf.equal(tf.argmax(prediction, axis=1), tf.argmax(Y, axis=1))
accuracy = tf.reduce_mean(tf.cast(correct_predict, tf.float32))

tf.summary.scalar("loss", loss_op)
tf.summary.scalar("acc", accuracy)
tf.summary.histogram("weight_out", weights.get("out"))
tf.summary.histogram("bias_out", bias.get("out"))
merged = tf.summary.merge_all()

init_variable = tf.global_variables_initializer()

# starting train
# config = tf.ConfigProto(allow_soft_placement=True)
with tf.Session() as sess:
    sess.run(init_variable)
    writer = tf.summary.FileWriter("." + '/rnn', sess.graph)
    for step in range(1, train_step+1):
        batch_x, batch_y = mnist.train.next_batch(batch_size)
        batch_x = batch_x.reshape((batch_size, time_steps, depth))
        sess.run(train_op, feed_dict={X: batch_x, Y: batch_y})
        if step % 100 == 0:
            loss, acc = sess.run([loss_op, accuracy], feed_dict={X: batch_x, Y: batch_y})
            print("The step: %d; Minibatch loss: %f; Train accuracy: %f" % (step, loss, acc))
        res = sess.run(merged, feed_dict={X: batch_x, Y: batch_y})
        writer.add_summary(res, global_step=step)
    print("Optimization Finished!")

    # test model
    test_len = 100
    test_datas = mnist.test.images[:test_len].reshape((-1, time_steps, depth))
    test_lable = mnist.test.labels[:test_len]
    print("Test accuracy: %f" % (sess.run(accuracy, feed_dict={X: test_datas, Y: test_lable})))
```

## 7.TensorFlow中RNN的实现

在TensorFlow中对RNN模型进行了基本实现，下面对tensorflow中的实现细节进行说明，主要包括cell`的实现环(多步执行)实现，以及多层rnn的实现。并对cell中的输入，输出进行详解。

RNN模型中的基本`cell`主要通过`tf.nn.rnn_cell.RNNCell`, `tf.nn.rnn_cell.BasicRNNCell` ,`tf.nn.rnn_cell.BasicLSTMCell`三个模块实现，后面两个cell模型就是基于前面模块的实现，`RNNCell`是一个抽象类(`abstract class`)。主要需要实现`state_size`，`output_size`，`build`等方法。下面从RNN中最基本的cell开始。

### 7.1 单步RNN：RNNCell

RNNCell是RNN模型中的基本单元，这个cell就是上图中的一个长方形模块，也是tensorflow中实现RNN的基本单元，每个RNNCell都有一个`call`方法以及`__call__`方法，使用方式：`output, next_state = call(inputs, state)`，调用一次`call`方法就会计算当前时间步的输出和状态两个值，调用一次`RNNCell.call`方法相当于在时间轴上推进了一步。上面说了`BasicRNNCell` 和`BasicLSTMCell`是基于`RNNCell`抽象类的实现，因此一般在使用时都只是使用后面两个cell。首先用代码测试cell：

```python
import os
import tensorflow as tf
import numpy as np

os.environ['TF_MIN_GPU_MULTIPROCESSOR_COUNT'] = '2'

cell = tf.nn.rnn_cell.BasicRNNCell(12, reuse=True)  # defined rnn cell, the parameter num_units(hidden_units_num or state_size)
state_size = cell.state_size  # the state size in rnn model
print("The rnn model state size is %d." % state_size)  # 12

rnn_inputs = tf.placeholder(tf.float32, shape=(100, 10), name="rnn_inputs_x")  # 10 is vector depth
inputs = rnn_inputs
h0 = cell.zero_state(100, tf.float32)  # size: 100, 12
out1, h1 = cell(inputs, h0)  # inputs size is (batch_size, depth)

print("The state size:", h1.shape)

# ------------------output----------------------------#
The rnn model state size is 12.
The state size: (100, 12) The output size: (100, 12)
The state shape: (100, 12)
```

上面的代码中定义了一个基本的`RNNCell`，传入了一个参数`num_units=12`，这个参数是定义`cell`中的隐藏单元的数量，即上图中的`state_size`大小，而另外一个参数`reuse=True`主要是觉得cell的参数是否共享。`state size`可以通过cell的`state_size`来获取。从上面的程序中也可以看出是和输入的``num_units`值相同。

`state`的初始化，在前面也说过，当在第一个时刻时，状态通过0来初始化一个`h0(state)`来输入到第一个时刻，cell中也提供了初始化的方法`zero_state(batch_size, dtype)`，初始化后`h0`的`shape`是`(batch_size, state_size)`。

`RNNCell`的`call`方法主要接收两个参数`inputs and state `，参数`inputs`主要是某时刻的输入值，`shape`是`(batch_size, depth)`，这儿的`depth`就是上面图中的`k`值。参数`state`就是通过`cell`的方法`zero_state(batch_size, dtype`生成的`state`。调用`call`后返回`output, state`，它们的size都是`(batch_size, state_size)`.

下面看下`RNNCell`的`call`方法源码：

```python
def call(self, inputs, state):
    gate_inputs = math_ops.matmul(array_ops.concat([inputs, state], 1), self._kernel)
    # _kernel shape: (depth+state_size, state_size)
    gate_inputs = nn_ops.bias_add(gate_inputs, self._bias)  # _bias size: state_size
    output = self._activation(gate_inputs)  # default `tanh` function
    return output, output
```

可以看出，在实现过程中实际上是对`inputs`和`state`进行了`concat`，形成了`(batch_size, depth+state_size)`大小的tensor。然后再和参数进行乘积运算(_kernel的size是`(depth+state_size, state_size)`)，再加上了一个bias(size是：`(state_size)`)。再通过激活函数运算，再没有给定激活函数情况下，tensorflow默认使用的是`tanh`。

上面整个过程单步的RNNCell就运算结束了。下面进行多部RNNCell计算。

### 7.2 循环起来：一次执行多步RNNCell

单步RNNCell只能计算一个步骤，如果序列长度为100，那么就需要循环调用100次的RNNCell，如x1，h0得到o1，h1；x2，h1得到o2，h2；x3，h2得到o3，h3，这样依次执行。而TensorFlow中也提供一个函数(`tf.nn.dynamic_rnn `)来实现这个过程。这个函数是直接通过（h0, x1, x2, ...,x100）得到(h1, h2, h3, h4, ..., h100)等。下面看`dynamic_rnn `的参数：

```python
def dynamic_rnn(cell, inputs, sequence_length=None, initial_state=None, dtype=None, 
                parallel_iterations=None, swap_memory=False, time_major=False, scope=None):
    """
    cell: An instance of RNNCell.
    inputs: The RNN inputs.
      If `time_major == False` (default), this must be a `Tensor` of shape:`[batch_size, max_time, ...]`, or a nested tuple of such elements.
      If `time_major == True`, this must be a `Tensor` of shape: `[max_time, batch_size, ...]`, or a nested tuple of such elements.
    initial_state: (optional) An initial state for the RNN.
      If `cell.state_size` is an integer, this must be a `Tensor` of appropriate type and shape `[batch_size, cell.state_size]`.
      If `cell.state_size` is a tuple, this should be a tuple of tensors having shapes `[batch_size, s] for s in cell.state_size`.
    """
```

参数`cell`接收RNNCell实例化对象，如`BasicRNNCell` ，`BasicLSTMCell`实例化对象，也可以接收`MultiRNNCell`实例化对象等。参数`inputs`为输入序列，`inputs`的`shape`是`(batch_size, time_steps, depth)`，其中`depth`就是上图中的`k`，这个参数的shape主要取决于另外也给参数`time_major`，默认为`False`；这儿输入后再进入到cell的`inputs`时进行了转换，可以通过`unstack`的方式转换成`time_steps(bathc_size, depth)`，cell每次接收的inputs是`(batch_size, depth)`。下面是一个完整测试：

```python
# defined rnn cell, the parameter num_units(hidden_units_num or state_size)
cell = tf.nn.rnn_cell.BasicRNNCell(12, reuse=None)  
state_size = cell.state_size  # the state size in rnn model
print("The rnn model state size is %d." % state_size)  # 12

rnn_inputs = tf.placeholder(tf.float32, shape=(100, 20, 10), name="rnn_inputs_x")  # 20 is time steps, 10 is vector depth
inputs = tf.unstack(rnn_inputs, axis=1)

h0 = cell.zero_state(100, tf.float32)  # size: 100, 12
out1, h1 = cell(inputs[0], h0)  # inputs size is (batch_size, depth)
print("The state size:", h1.shape, "The output size:", out1.shape)

# dynamic_rnn: one time execute many time steps
output, state = tf.nn.dynamic_rnn(cell, rnn_inputs, initial_state=h0) 
print("The state shape:", state.shape)  # (100, 12)
```

上面得到得output得shape是：`(batch_size, time_steps, cell.output_size) `，在上面得例子中，输出得shape是：`(100, 20, 12)`。

### 7.3 MultiRNNCell：多层RNNCell

上面的过程都只是单层的RNN模型，但是在实际应用中会使用多层RNN模型，因此需要基于RNNCell来堆叠多层的RNN，第一层RNN输出的(h1, h2, h3, ...)，作为下一层的输入，这样以此类推。在TensorFlow中通过`MultiRNNCell`实现该功能：

```python
def get_a_cell(num):
    return tf.nn.rnn_cell.BasicRNNCell(num_units=num)

# 用tf.nn.rnn_cell MultiRNNCell创建3层RNN
cell = tf.nn.rnn_cell.MultiRNNCell([get_a_cell(i) for i in [128, 256, 128]])  # 3层RNN
print(cell.state_size)  # (128, 256, 128)

inputs = tf.placeholder(np.float32, shape=(32, 100))  # 32是batch_size, 10为depth
h0 = cell.zero_state(32, np.float32)  # 通过zero_state得到一个全0的初始状态
output_multi, h1 = cell.call(inputs, h0)
print(h1)  # tuple中含有3个32x128的向量
```

上面的测试代码中，创建了3层的`RNN`模型，每层的`state_size`是`(128, 256, 128)`，`MultiRNNCell`得到的cell其实也是`RNNCell`的子类，然后调用`call`方法后输出了`output`和`h1`，输出后的`h1`是一个tuple，其中每个元素对应的是一个tensor，tensor的大小分别是`((32, 128), (32, 256), (32, 128))`。

`MultiRNNCell`只是创建了单步的多层RNN，但在实际应用中肯定是多步的，因此还需要进行多步执行多层RNN，每层的time_steps是相同的。在TensorFlow中还是通过`dynamic_rnn`来实现的，下面是TensorFlow的官方示例：

```python
# create 2 LSTMCells
rnn_layers = [tf.nn.rnn_cell.LSTMCell(size) for size in [128, 256]]

# create a RNN cell composed sequentially of a number of RNNCells
multi_rnn_cell = tf.nn.rnn_cell.MultiRNNCell(rnn_layers)

# 'outputs' is a tensor of shape [batch_size, max_time, 256]
# 'state' is a N-tuple where N is the number of LSTMCells containing a tf.contrib.rnn.LSTMStateTuple for each cell
outputs, state = tf.nn.dynamic_rnn(cell=multi_rnn_cell, inputs=data, dtype=tf.float32)
```

### 7.4 误区

#### 7.4.1 误区一：cell中的ouput

从上面单步RNN中的源码中可以看出，output和state都是一样的，这儿cell的output并非在实际应用中的Y值。还需要经过处理、计算才能输出最终的output。在RNNCell中的output只是当前cell的output，并非最终模型输出的Y值，因此Y值得size和cell得output_size也并非相等。需要对cell得output再定义新得变换才能转换成希望得输出Y。

#### 7.4.2 误区二：RNN中的dropout

在RNN模型中也可以通过 dropout来有效得防止过拟合，在RNN中的dropout和其他的有一定的差异，在RNN中在时间序列方向不进行dropout，也就是在循环的部分不会进行dropout，如下图中，实线的部分不会进行dropout，在虚线的部分进行dropout。在实现时主要通过dropoutwrapper实现dropout功能。

![RNN简化结构](/assets/img/posts/深度学习-详解RNN网络及TensorFlow实现/\uploads\dropoutwrapper.png)



## 8.Refrence

(1).[基于TensorFlow关于各种网络结构的实战案例](http://www.tensorflownews.com/category/course/)

(2).[详解循环神经网络(Recurrent Neural Network)](https://www.jianshu.com/p/39a99c88a565)

(3).[零基础入门循环神经网络](https://zybuluo.com/hanbingtao/note/541458)

(4).[循环神经网络RNN介绍1：什么是RNN、为什么需要RNN、前后向传播详解、Keras实现](https://zhuanlan.zhihu.com/p/32755043)

(5).[深度学习-TensorFlow实现RNN](https://blog.csdn.net/chenvast/article/details/79133127)

(6).[循环神经网络RNN基础](http://lawlite.me/2017/06/14/RNN-%E5%BE%AA%E7%8E%AF%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C%E5%92%8CLSTM-01%E5%9F%BA%E7%A1%80/)

(7).[解读TensorFlow下实现的RNN](https://blog.csdn.net/mydear_11000/article/details/52414342)

(8).[RNN-循环神经网络-02Tensorflow中的实现 ](http://lawlite.me/2017/06/16/RNN-%E5%BE%AA%E7%8E%AF%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C-02Tensorflow%E4%B8%AD%E7%9A%84%E5%AE%9E%E7%8E%B0/#1-%E5%AE%9E%E7%8E%B0%E8%BF%87%E7%A8%8B)

(9).[RNN-LSTM循环神经网络-03Tensorflow进阶实现](http://lawlite.me/2017/06/21/RNN-LSTM%E5%BE%AA%E7%8E%AF%E7%A5%9E%E7%BB%8F%E7%BD%91%E7%BB%9C-03Tensorflow%E8%BF%9B%E9%98%B6%E5%AE%9E%E7%8E%B0/)

