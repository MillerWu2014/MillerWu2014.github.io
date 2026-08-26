---
title: TensorBoard的使用教程
date: 2018-04-26 22:04:38 +0800
categories:
- tensorflow
tags:
- tensorflow
- tensorboard
---
TensorFlow 可用于训练大规模深度神经网络所需的计算，使用该工具涉及的计算往往复杂而深奥。很多人也认为NN为一个黑盒，对训练过程种的很多东西不太了解。因此Google推出了基于TensorFlow的深度学习可视化工具TensorBoard 。您可以用 TensorBoard 来展现 TensorFlow 图，绘制图像生成的定量指标图以及显示附加数据（如其中传递的图像），也可以通过该工具了解模型训练过程种参数的收敛过程，判断模型是否过拟合，是否是欠拟合等。

## 1.summary

首先明确一点,`summary`也是`op`。要对某些变量或值进行可视化，就必须在创建图的过程中将这些变量或标量给记录下来，后续将训练过程得记录给写入log，再通过tensorboard进行展示。

### 1.1 标量可视化

如果我们想对标量在训练中可视化，可以使用`tf.summary.scalar()`，比如损失loss，accuracy等。这个API得接口如下所示，主要用于标量，会得到一个标量得summary：

```python
tf.summary.scalar(name, tensor, collections=None, family=None)
"""
调用这个函数来观察Tensorflow的Graph中某个节点
parameters
----------
tensor: 想要在TensorBoard中观察的节点
name: 为该节点设置名字，在TensorBoard中我们观察的曲线将会以name命名
"""
```
<!--more-->
### 1.2 参数可视化

使用`tf.summary.histogram()`可以对参数进行可视化，如权重，偏置项等。可以通过该API可视化参数的分布情况，每次迭代的分布情况等。

```python
tf.summary.histogram(name, values, collections=None, family=None)
"""
return
------
A scalar Tensor of type string. The serialized Summary protocol buffer.

parameters
----------
	name: A name for the generated node. Will also serve as a series name in TensorBoard.
	values: A real numeric Tensor. Any shape. Values to use to build the histogram.
	collections: Optional list of graph collections keys. The new summary op is added to these collections. 	Defaults to [GraphKeys.SUMMARIES].
	family: Optional; if provided, used as the prefix of the summary tag name, which controls the tab name used for display on Tensorboard.
"""
```

### 1.3 其他(images, text, audio)的可视化

TensorBoard也可以对图片，文本和音频等近可视化，具体API可以查看官方文档。

## 2.对所有的summary进行merge

在 TensorFlow 中，只有当您运行指令时，指令才会执行，或者另一个 op 依赖于指令的输出时，指令才会运行。我们刚才创建的这些总结节点都围绕着您的图：您目前运行的 op 都不依赖于这些节点的结果。因此，为了生成总结信息，我们需要运行所有这些总结节点。这样的手动操作是枯燥而乏味的，因此可以使用 [`tf.summary.merge_all`](https://www.tensorflow.org/api_docs/python/tf/summary/merge_all?hl=zh-cn) 来将这些操作合并为一个 op，从而生成所有总结数据，生成一个`summary`对象，供后面`File_Writer`的` add_summary`使用。**和初始化所有的变量用法相似**。

然后您可以执行该合并的总结 op，它会在特定步骤将所有总结数据生成一个序列化的 `summary protobuf` 对象。最后，要将此总结数据写入磁盘，请将此总结 protobuf 对象传递给 [`tf.summary.FileWriter`](https://www.tensorflow.org/api_docs/python/tf/summary/FileWriter?hl=zh-cn)。

## 3.FileWriter

这个步骤主要是将summary的结果（protobuf序列化后的数据）写入磁盘。后面启动TensorBoard服务时好使用该数据，在前端进行可视化。下面在训练过程中会通过`add_summary(summary, global_step=None)`将summary添加到FileWriter对象中。

```python
Class FileWriter:
    """
    Writes Summary protocol buffers to event files.
    """
	def __init__(logdir, graph=None, max_queue=10, flush_secs=120, graph_def=None, filename_suffix=None)
		"""
		parameters
		----------
		logdir: string, directory where event file will be written.
		graph: A Graph object, such as sess.graph.
		max_queue: Integer. 在向disk写数据之前，最大能够缓存event的个数
         flush_secs: Number. 每多少秒像disk中写数据，并清空对象缓存.
		graph_def: DEPRECATED: Use the graph argument instead.
		filename_suffix: A string. Every event file's name is suffixed with suffix.
		"""

# example
writer = tf.summary.FileWriter("." + '/train', session.graph)
```

### 3.1 add_summary

因为前面说明了summary也是一个OP，因此在需要session中，每个训练步（或者多个训练步）将summary对象添加到FileWriter中。summary对象是通过前面merge步骤中生成。因此一般会执行下面两个步骤：

```python
summary = session.run(merged, feed_dict={x: X, y: Y})
wiriter.add_summary(summary, global_step=train_step)
```

下面再看下`add_summary`的api接口：

```python
def add_summary(summary, global_step=None):
    """
    parameters
    ----------
    summary: A Summary protocol buffer, optionally serialized as a string.
    global_step: Number. Optional global step value to record with the summary.
    """
```

> **note**：
>
> 1. 如果使用`writer.add_summary(summary，global_step)`时没有传`global_step`参数,会使`scarlar_summary`变成一条直线。
> 2. 只要是在计算图上的`Summary op`，都会被`merge_all`捕捉到， 不需要考虑变量生命周期问题。
> 3. 如果执行一次，`disk`上没有保存`Summary`数据的话，可以尝试下`file_writer.flush()`

## 4.启动TensorBoard服务

训练完成后，就可以进入到命令行启动TensorBoard，可以指定到某个logdir，指定TensorBoard服务监听的IP，监听的端口等。只需要再命令行指定，如下：

```shell
tensorboard --logdir tain --host 0.0.0.0 --port 88888
tensorboard --logdir /tmp/train
```

启动服务后就可以再浏览器中查看深度网络的可视化。

## 5.配合`name_scope`使用

当网络比较复杂时，整体网络的图看上去就会比较混乱，为了解决这个问题，TensorFlow中加入了name_scope，这样TensorBoard的可视化网络看上去更有层次性。如下使用：

```python
with tf.name_scope("weight"):
    w = tf.Variable(initial_value=tf.random_uniform([784, 10], -1, 1), name="weight")
with tf.name_scope("bias"):
    b = tf.Variable(initial_value=tf.random_uniform(shape=[10]), name="bias")
```

## 6.Refrence

[1]. [TensorBoard - Visualize your learning](https://jhui.github.io/2017/03/12/TensorBoard-visualize-your-learning/)

[2].[TensorFlow可视化](https://blog.csdn.net/u012436149/article/details/53184847)

[3].[TensorBoard可视化学习](http://www.tensorfly.cn/tfdoc/how_tos/summaries_and_tensorboard.html)

[4].[Hands on TensorBoard](https://www.youtube.com/watch?v=eBbEDRsCmv4)

