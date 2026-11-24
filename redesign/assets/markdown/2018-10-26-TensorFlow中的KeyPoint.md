---
title: TensorFlow中的KeyPoint
date: 2018-10-26 10:34:13 +0800
categories:
- tensorflow
tags:
- tensorflow
- Queue
- Coordinator
- Dataset
- collection
- 共享变量
---
## 1.线程，队列和流水线

在TensorFlow中也会使用线程和队列，主要在模型开始训练时对数据的处理时，通过多线程来读取数据，一个线程来消费数据(模型训练)。在TensorFlow中的线程主要通过Coordinator和QueueRunner来进行配合管理，队列Queue主要有四种队列。

一句话概括就是：`Queue`->（构建图阶段）创建队列；`QueueRunner`->（构建图阶段）创建线程进行入队操作；`f.train.start_queue_runners()`->（执行图阶段）填充队列；`tf.train.Coordinator()` 在线程出错时关闭之。 

### 1.1 线程管理-Coordinator

`Coordinator`类主要对多线程进行同步停止。它和TensorFlow内的队列没有必然关系，可以和python的线程(threading)配合使用。`Coordinator`类主要有三个方法：

- [`tf.train.Coordinator.should_stop`](https://www.tensorflow.org/api_docs/python/tf/train/Coordinator#should_stop)：如果线程停止，则返回True。
- [`tf.train.Coordinator.request_stop`](https://www.tensorflow.org/api_docs/python/tf/train/Coordinator#request_stop)：请求线程停止。
- [`tf.train.Coordinator.join`](https://www.tensorflow.org/api_docs/python/tf/train/Coordinator#join)：等待直到指定的线程停止。

在使用Coordinator时，首先创建一个Coordinator对象，再创建一些Coordinator使用的线程。线程通常一直循环运行，直到should_stop()返回True时停止。任何线程也可以被请求停止，只需要Coordinator对象调用`request_stop`方法，调用该方法时，其他线程下的`should_stop`都被返回为True，其他线程停止。如下，通过Coordinator管理python的线程：

```python
# -*- coding: utf-8 -*-
import tensorflow as tf
import threading


def thread_func(coord, id_num):
    """
    :param coord: tensorflow Coordinator object.
    :param id_num: int, the constant number
    :return:
        id_num, int
    """
    while not coord.should_stop():
        print("This thread id is %d" % id_num)
        if id_num >= 9:
            print("Stop thread id is %d" % id_num)
            coord.request_stop()


# init coord object
coord_object = tf.train.Coordinator()

# create 10 threads and run thread function
threads = [threading.Thread(target=thread_func, args=(coord_object, num)) for num in range(10)]
for t in threads:
    t.start()

coord_object.join()
```

Coordinator还支持捕获和报告异常，如`try:.......except Exception as error: coord.request_stop(errr) finally: coord.request_stop()`。
<!--more-->
### 1.2 队列-Queue

像TensorFlow中的所有组件一样，队列是TensorFlow图中的一个**节点**。它是一个**有状态**的节点，像变量一样：**其他节点可以修改其内容**。特别地，节点可以将新元素插入队列，或者从现有队列中取出队列。在TensorFlow中，队列主要有四种类型：

- `tf.FIFOQueue` ：按入列顺序出列的队列，先进先出队列
- `tf.RandomShuffleQueue`： 随机顺序出列的队列
- `tf.PaddingFIFOQueue` ：以固定长度批量出列的队列
- `tf.PriorityQueue` ：带优先级出列的队列

这些队列的使用方法都是一样，主要有：`dequeue`，`enqueue`，`enqueue_many`，`dequeue_many`等方法。enqueue操作返回计算图中的一个Operation节点，dequeue操作返回一个Tensor值，队列操作同样只是声明或定义，要通过session来运行，才能获取这个值。下面时操作queue：

```python
queue = tf.FIFOQueue(10, tf.int32)
# 如果队列中的值超过了queue size, 在enqueue会卡主,直到queue中的值被消费
queue_init = queue.enqueue_many(([0],), name="init_queue")  
x = queue.dequeue()
with tf.Session() as sess:
    sess.run(queue_init)
    for i in range(9):
        print("--- the %d times enqueue ---" % (i+1))
        sess.run(queue.enqueue([i+1]))
    for j in range(10):
        # 对一个已经取空的队列使用dequeue操作也会卡住,直到有新的数据写入
        print("Get value from queue:", sess.run(x), "The queue size:", sess.run(queue.size()))
```

还可以将上面的代码进行修改：

```python
index = tf.placeholder(tf.int32)

queue = tf.FIFOQueue(10, tf.int32)
queue_init = queue.enqueue_many(([0],), name="init_queue")
x = queue.dequeue()
enqueue_op = queue.enqueue([index+1], name="enqueue")
with tf.Session() as sess:
    sess.run(queue_init)
    for i in range(9):
        print("--- the %d times enqueue ---" % (i+1))
        sess.run(enqueue_op, feed_dict={index: i})
    for j in range(10):
        print("Get value from queue:", sess.run(x), "The queue size:", sess.run(queue.size()))
```

### 1.3 QueueRunner

Tensorflow的计算主要在使用CPU/GPU和内存，而数据读取涉及磁盘操作，速度远低于前者操作。因此通常会使用多个线程读取数据，然后使用一个线程消费数据。QueueRunner就是来管理这些读写队列的线程的（创建线程，对队列进行enqueue或dequeue操作），QueueRunner是一个不存在于代码中的东西，而是后台运作的一个概念；可以通过两种方式来使用QueueRunner；一种是显示的使用QueueRunner，另外一种是隐式使用：`tf.train.start_queue_runners`。下面是一个多线程读取文件的例子：

![img](http://wiki.jikexueyuan.com/project/tensorflow-zh/images/AnimatedFileQueues.gif)

QueueRunner的API和关键方法create_threads的api说明：

```python
def __init__(self, queue=None, enqueue_ops=None, close_op=None, cancel_op=None, 
             queue_closed_exception_types=None, queue_runner_def=None, import_scope=None):
    """
    queue：为tensorflow的队列对象,如FIFOQueue, RandomShuffleQueue等
    enqueue_ops: 为入队操作(enqueue ops)的列表，列表的长度为定义的线程数
    """
    
def create_threads(self, sess, coord=None, daemon=False, start=False):
    """
    parameters
    ----------
    sess: A session
    coord: Optional `Coordinator` object 
    start: Boolean.  If `True` starts the threads.  If `False` the caller must call the `start()` method of the returned threads.
    
    return
    ------
    A list of threads.
    """
```

下面使用队列和QueueRunner：

```python
q = tf.FIFOQueue(10, "float")
counter = tf.Variable(0.0)  # 定义计数器

increment_op = tf.assign_add(counter, 1.0)  # 给计数器加一
enqueue_op = q.enqueue(counter)  # 将计数器加入队列

# 创建QueueRunner, 用多个线程向队列添加数据, 这里实际上定义了4个线程, 两个增加计数, 两个执行入队, 但是还没有执行
qr = tf.train.QueueRunner(q, enqueue_ops=[increment_op, enqueue_op] * 2)
with tf.Session() as sess:
    tf.global_variables_initializer().run()
    qr.create_threads(sess, start=True)  # 启动入队线程,开始执行
    for i in range(20):
        print(sess.run(q.dequeue()))
```

上面的运行结束会产生异常，但是整个运行过程是正确的。因此，QueueRunner和Coordinator会配合使用，避免这种情况。下面一起合使用。

### 1.4 输入流水线（线程队列配合使用）

下面将1.3中的示例稍加修改就可以避免后面异常的情况。修改后的代码如下所示。通过Coordinator来对所有线程进行同步和停止。

#### 1.4.1 Coordinator和QueueRunner配合使用

```python
q = tf.FIFOQueue(10, "float")
counter = tf.Variable(0.0)  # 定义计数器

increment_op = tf.assign_add(counter, 1.0)  # 给计数器加一
enqueue_op = q.enqueue(counter)  # 将计数器加入队列

qr = tf.train.QueueRunner(q, enqueue_ops=[increment_op, enqueue_op] * 2)  # 创建多个线程
with tf.Session() as sess:
    tf.global_variables_initializer().run()
    coord = tf.train.Coordinator()
    enqueue_threads = qr.create_threads(sess, coord=coord, start=True)  # 启动入队线程
    for i in range(20):
        print(sess.run(q.dequeue()))

    coord.request_stop()
    coord.join(enqueue_threads)
```

使用QueueRunner有两种方式，一种是显示的使用QueueRunner，如上面的示例所示，另外一种就是隐式的使用，后面的例子中都是通过隐式（`tf.train.start_queue_runners`）的使用，在隐式的使用中也是调用的`QueueRunner.create_threads`的方法。下面将mnist的数据进行流水线操作：

```python
from tensorflow.examples.tutorials.mnist import input_data
import tensorflow as tf
import numpy as np

mnist = input_data.read_data_sets("/opt/workspace/project/deep-st-nn/data/MNIST_DATA", one_hot=True)
all_data = mnist.train.images
all_target = mnist.train.labels
queue = tf.FIFOQueue(capacity=50, dtypes=[tf.float32, tf.float32], shapes=[[784], [10]])

enqueue_op = queue.enqueue_many([all_data, all_target])

data_sample, label_sample = queue.dequeue()
qr = tf.train.QueueRunner(queue, [enqueue_op] * 4)
with tf.Session() as sess:
    # create a coordinator, launch the queue runner threads.
    coord = tf.train.Coordinator()
    enqueue_threads = qr.create_threads(sess, coord=coord, start=True)
    for step in range(100):
        # do to 100 iterations
        if coord.should_stop():
            break
        one_data, one_label = sess.run([data_sample, label_sample])
        print(one_data.shape, one_label.shape)
    coord.request_stop()
    coord.join(enqueue_threads)
```

#### 1.4.2 流水线

tensorflow的输入流水线：**准备文件名 -> 创建一个`Reader`从文件中读取数据 -> 定义文件中数据的解码规则 -> 解析数据**。下面是官方给的一个例子，下面的代码中对关键部分进行了注释

```python
import tensorflow as tf


# 一个Queue,用来保存文件名字.对此Queue,只读取,不dequeue
filename_queue = tf.train.string_input_producer(["/opt/workspace/project/deep-st-nn/data/file0.csv",
                                                 "/opt/workspace/project/deep-st-nn/data/file1.csv"])

reader = tf.TextLineReader()  # 用来从文件中读取数据, LineReader, 每次读一行
key, value = reader.read(filename_queue)

# Default values, in case of empty columns. Also specifies the type of the
record_defaults = [[1.0], [1.0], [1.0], [1.0], [1.0]]
col1, col2, col3, col4, col5 = tf.decode_csv(value, record_defaults=record_defaults)  # 如果有控制就会用record_defaults填充缺失值
features = tf.stack([col1, col2, col3, col4])

with tf.Session() as sess:
    coord = tf.train.Coordinator()
    threads = tf.train.start_queue_runners(coord=coord)  # 启动线程, 返回所有的线程

    for i in range(10):
        # Retrieve a single instance:
        example, label = sess.run([features, col5])
        print("The times: %d\n" % i, example, label)
    coord.request_stop()
    coord.join(threads)
```

再对上面的代码进行解析：

（1）`tf.train.string_input_producer(['file0.csv', 'file1.csv'])`，下面是该函数的关键代码：

```python
q = data_flow_ops.FIFOQueue(capacity=capacity,
                                dtypes=[input_tensor.dtype.base_dtype],
                                shapes=[element_shape],
                                shared_name=shared_name, name=name)
    enq = q.enqueue_many([input_tensor])
    queue_runner.add_queue_runner(
        queue_runner.QueueRunner(
            q, [enq], cancel_op=cancel_op))
    if summary_name is not None:
      summary.scalar(summary_name,
                     math_ops.to_float(q.size()) * (1. / capacity))
    return q
```

上面，首先创建了一个queue，进行了入队(enqueue)操作；通过QueueRunner创建了一个线程来执行enqueue_op，并将QueueRunner放入了一个collections中。并返回queue。

（2）定义了数据解析的OP，主要通过TextLineReader来按行进行解析。解析完成后返回了一个Tensor的label和data。`TextLineReader.read()`方法直接接收一个Queue对象。

（3）通过session来获取到真实的数据，并进行下一步操作。在session中通过`start_queue_runners`方法启动所有的线程，并返回所有线程。获取自己需要的值。

#### 1.4.3 流水线的过程中准备minibatch数据

在数据输入流水线的过程中，利用多线程来准备好batch数据，并通过dequeue的方式来获取一个minibatch的数据集，在TensorFlow中也实现了，如下所示将上面的代码进行修改：

```python
# -*- coding: utf-8 -*-
import tensorflow as tf


def read_my_file_format(filename_queue):
    """定义数据的读取与解析规则"""
    reader = tf.TextLineReader()
    key, record_string = reader.read(filename_queue)
    col1, col2, col3, col4, label = tf.decode_csv(record_string, 
                                                  record_defaults=[[1.0], [1.0], [1.0], [1.0], [1.0]])
    processed_example = tf.stack([col1, col2, col3, col4])
    return processed_example, label


def input_pipeline(filenames, batch_size, num_epochs=None):
    filename_queue = tf.train.string_input_producer(filenames, num_epochs=num_epochs, shuffle=True)
    example, label = read_my_file_format(filename_queue)
    min_after_dequeue = 10000
    capacity = min_after_dequeue + 3 * batch_size  # queue size
    example_batch, label_batch = tf.train.shuffle_batch([example, label], batch_size=batch_size,
                                                        capacity=capacity,
                                                        min_after_dequeue=min_after_dequeue)
    return example_batch, label_batch


files = ["/opt/workspace/project/deep-st-nn/data/file0.csv", 
         "/opt/workspace/project/deep-st-nn/data/file1.csv"]
x, y = input_pipeline(files, 5)

with tf.Session() as sess:
    coord = tf.train.Coordinator()
    threads = tf.train.start_queue_runners(sess=sess, coord=coord, start=True)
    for num_step in range(10):
        data, label = sess.run([x, y])
        print(data, label)
    coord.request_stop()
    coord.join(threads)
```

上面代码中最关键的部分为`shuffle_batch`方法，shuffle_batch接受的参数如下所示，该方法所做的事情主要有：

1. 创建一个`RandomShuffleQueue`用来保存样本。
2. 使用`QueueRunner`创建多个`enqueue`线程向`Queue`中放数据。
3. 创建一个`dequeue_many` OP。
4. 返回`dequeue_many` OP。

然后我们就可以使用`dequeue`出来的`mini-batch`来训练网络了。

```python
def shuffle_batch(tensors, batch_size, capacity, min_after_dequeue, num_threads=1, seed=None, 
                  enqueue_many=False, shapes=None, allow_smaller_final_batch=False, shared_name=None, 
                  name=None):
    """
    parameters
    ----------
    	tensors: The list of tensors, this tensor will to enqueue.
    	batch_size: The new batch size pulled from the queue.
    	capacity: An integer. The maximum number of elements in the queue. 
    	min_after_dequeue: Minimum number elements in the queue after a dequeue, used to ensure a level of mixing of elements.
    	num_threads: The number of threads enqueuing `tensor_list`.
    
    return
    ------
    Returns:
    A list or dictionary of tensors with the types as `tensors`.
    """
```

通过`shuff_batch`来实现mnist数据的队列就更加方便了：

```python
mnist = input_data.read_data_sets("/opt/workspace/project/deep-st-nn/data/MNIST_DATA", one_hot=True)
all_data = mnist.train.images
all_target = mnist.train.labels

with tf.Session() as sess:
    batch_x, batch_y = tf.train.shuffle_batch([all_data, all_target], batch_size=100, capacity=300+1000,
                                              min_after_dequeue=1000)
    coord = tf.train.Coordinator()
    threads = tf.train.start_queue_runners(sess=sess, coord=coord, start=True)
    for i in range(21):
        print(batch_x.shape, batch_y.shape)
    coord.request_stop()
    coord.join(threads)
```



另外再介绍一个常用的方法，再后续可能会经常用到。`tf.train.slice_input_producer`，该方法的API为：·`slice_input_producer(tensor_list, num_epochs=None, shuffle=True, seed=None, capacity=32, shared_name=None, name=None)`，接收一个tensor的list，再看他的源码：

```python
with ops.name_scope(name, "input_producer", tensor_list):
    tensor_list = ops.convert_n_to_tensor_or_indexed_slices(tensor_list)
    if not tensor_list:
      raise ValueError(
          "Expected at least one tensor in slice_input_producer().")
    range_size = array_ops.shape(tensor_list[0])[0]
    # TODO(josh11b): Add an assertion that the first dimension of
    # everything in TensorList matches. Maybe just check the inferred shapes?
    queue = range_input_producer(range_size, num_epochs=num_epochs,
                                 shuffle=shuffle, seed=seed, capacity=capacity,
                                 shared_name=shared_name)
    index = queue.dequeue()
    output = [array_ops.gather(t, index) for t in tensor_list]
    return output
```

该方法再内部调用`range_input_producer`方法，生成一个队列，并将出队的结果进行组合，形成一个list，返回（`A list of tensors, one for each element of tensor_list.  If the tensor n tensor_list has shape [N, a, b, .., z], then the corresponding outputtensor will have shape [a, b, ..., z].`）。返回的是一个出队后的元素。

### 1. 5 Refrence

[1].[Tensorflow并行计算：多核(multicore)，多线程(multi-thread)，图分割(Graph Partition)](https://blog.csdn.net/rockingdingo/article/details/55652662)

[2].[TensorFlow中的多线程使用](https://www.jianshu.com/p/c29965e6c40c)

[3].[TensorFlow的线程和队列](http://cwiki.apachecn.org/pages/viewpage.action?pageId=10029441)

[4].[输入流水线](https://blog.csdn.net/u012436149/article/details/72353313)

[5].[TENSORFLOW INPUT PIPELINE EXAMPLE](https://ischlag.github.io/2016/06/19/tensorflow-input-pipeline-example/)

[6].[tensorflow 管道队列模式（pipeline）读取文件](http://www.enpeizhao.com/?p=514)

[7].[数据读取](http://wiki.jikexueyuan.com/project/tensorflow-zh/how_tos/reading_data.html)

[8].[TensorFlow-input pipeline](https://www.jianshu.com/p/f1aeb7ef75ca)



## 2.共享变量

在深度学习网络中，随模型复杂程度增加，模型的参数会不断的增加，因此训练模型过程中会涉及到**变量共享**。这样减小模型中参数的量，甚至在部分模型中需要共享变量，才能达到好的效果。

### 2.1 问题的提出

假设，我们创建一个图像过滤模型，设置模型中为2个卷积，现在要将同一个模型(相同参数的模型)应用到不同的图片下，实现大量图片的过滤。如果通过`tf.Variable()`实现如下：

```python
def my_image_filter(input_images):
    conv1_weights = tf.Variable(tf.random_normal([5, 5, 32, 32]), name="conv1_weights")
    conv1_biases = tf.Variable(tf.zeros([32]), name="conv1_biases")
    conv1 = tf.nn.conv2d(input_images, conv1_weights, strides=[1, 1, 1, 1], padding='SAME')
    relu1 = tf.nn.relu(conv1 + conv1_biases)
 
    conv2_weights = tf.Variable(tf.random_normal([5, 5, 32, 32]), name="conv2_weights")
    conv2_biases = tf.Variable(tf.zeros([32]), name="conv2_biases")
    conv2 = tf.nn.conv2d(relu1, conv2_weights, strides=[1, 1, 1, 1], padding='SAME')
    return tf.nn.relu(conv2 + conv2_biases)
```

在这个模型中，我们有四个变量：`conv1_weight,conv1_biases,conv2_weights,conv2_biases`，当我们应用在每个图片上时，如下，我们应用在2个图片上：

```python
result1 = my_image_filter(image1)  # First call creates one set of 4 variables.
result2 = my_image_filter(image2)  # Another set of 4 variables is created in the second call.
```

这样调用2次，那么会创建2组变量，每组4个变量，生成8个变量。这样就出现了问题，每张图片应用的模型是不一样的。因此需要通过共享变量的模式。那么怎么来实现呢？

### 2.2 python实现共享变量

在python中也是可以实现的，通过字典提前将变量进行定义，如下：

```python
parameters_dict = {"conv1_weights": tf.Variable(tf.random_normal([5, 5, 32, 32]), name="conv1_weights"),
                  "conv1_biases": tf.Variable(tf.zeros([32]), name="conv1_biases"),
                  "conv2_weights": tf.Variable(tf.random_normal([5, 5, 32, 32]), name="conv2_weights"),
                  "conv2_biases": tf.Variable(tf.zeros([32]), name="conv2_biases")}

def my_image_filter(input_images, variables_dict):
    conv1 = tf.nn.conv2d(input_images, variables_dict["conv1_weights"], strides=[1, 1, 1, 1], padding='SAME')
    relu1 = tf.nn.relu(conv1 + variables_dict["conv1_biases"])
 
    conv2 = tf.nn.conv2d(relu1, variables_dict["conv2_weights"], strides=[1, 1, 1, 1], padding='SAME')
    return tf.nn.relu(conv2 + variables_dict["conv2_biases"])

# Both calls to my_image_filter() now use the same variables
result1 = my_image_filter(image1, variables_dict)
result2 = my_image_filter(image2, variables_dict)
```

这样是可以实现共享变量，但是对代码的**封装不好**，在构建模型时，**需要提前创建好变量**的名称，大小，类型等，当网络非常大时，需要维护一个非常长的参数列表，这样代码显得非常冗余；同时，这样代码显得比较死板，不灵活，扩展性很弱。因此TensorFlow提供了更加轻便的方式来实现共享变量。

### 2.3 在TensorFlow中实现共享变量

在TensorFlow中通过`tf.get_variable()`和``tf.variable_scope()`配合使用，实现变量共享。这两个方法的作用主要如下所示，下面通过这两个方法来实现变量共享。

```python
tf.get_variable(<name>, <shape>, <initializer>)  # 创建或返回具有给定名称的变量
tf.variable_scope(<scope_name>)  # 管理传递给的名称的名称空间tf.get_variable()
```

对上面的过滤模型进行修改，如下：

```python
def conv_relu(input_tensor, kernel_shape, bias_shape):
    # Create variable named "weights".
    weights = tf.get_variable("weights", kernel_shape, initializer=tf.random_normal_initializer())
    # Create variable named "biases".
    biases = tf.get_variable("biases", bias_shape, initializer=tf.constant_initializer(0.0))
    conv = tf.nn.conv2d(input, weights, strides=[1, 1, 1, 1], padding='SAME')
    return tf.nn.relu(conv + biases)

def my_image_filter(input_images):
    with tf.variable_scope("conv1"):
        # Variables created here will be named "conv1/weights", "conv1/biases".
        relu1 = conv_relu(input_images, [5, 5, 32, 32], [32])
    with tf.variable_scope("conv2"):
        # Variables created here will be named "conv2/weights", "conv2/biases".
        return conv_relu(relu1, [5, 5, 32, 32], [32])
    
result1 = my_image_filter(image1)
result2 = my_image_filter(image2)
```

上面对模型应用到两个图片上面，会提示一个错误：`Raises ValueError(... conv1/weights already exists ...)`；在conv2中会引发错误，主要因为`tf.get_variable()`默认变量是不共享的，只是检查变量名，防止重复，因此在conv2中调用的时候，发现已经存在了变量。需要共享变量，必须指定某个变量域内进行共享变量：

```python
with tf.variable_scope("image_filters") as scope:
    result1 = my_image_filter(image1)
    scope.reuse_variables()
    result2 = my_image_filter(image2)
```

经过上面的修改，变量共享就已经完成了。不需要在函数外定义变量，只需要添加变量域，tensorflow就会自动帮我管理变量。代码也非常直观。

### 2.4 共享变量的方式

通过`tf.get_variable()`和``tf.variable_scope()`有两种方式来进行共享变量。第一种就是上述所示的，通过设置域下面的共享：`scope.reuse_variables()`；还有一种方式，如下：

```python
with tf.variable_scope("image_filters", reuse=tf.AUTO_REUSE) as scope:
    result1 = my_image_filter(image1)
    result2 = my_image_filter(image2)
```

这种方式会自动去共享变量，当系统检测到当期变量域下之前定义了一个重名的变量，那么该变量就共享，否则就创建新的变量。这是非常智能的写法。这种方式也解决了一个问题，比如部分模型，前半部分需要共享变量，后半部分不需要共享变量，可以通过这种方式来实现。

### 2.5 变量域（variable_scope）的工作机制

#### 2.5.1 get_variable的理解 

首先，对`tf.get_variable()`进行理解，该方法的使用主要取决于调用的域的设置：`tf.get_variable_scope().reuse == False or tf.get_variable_scope().reuse == True`。当结果值 为False时，这是`tf.get_variable()`就会初始化一个变量，并且会判断这个变量在这个域下是否存在，如果存在就会引发`ValueError`，否则就会初始化一个变量出来：

```python
with tf.variable_scope("foo"):
    v = tf.get_variable("v", [1])
assert v.name == "foo/v:0"
```

而如果 `tf.get_variable_scope().reuse == True`，那么 TensorFlow 会执行相反的动作，就是到程序里面寻找变量名为 `scope name + name` 的变量，如果变量不存在，会抛出 `ValueError` 异常，否则，就返回找到的变量：

```python
with tf.variable_scope("foo"):
    v = tf.get_variable("v", [1])
with tf.variable_scope("foo", reuse=True):
    v1 = tf.get_variable("v", [1])
assert v1 is v
```

#### 2.5.2 variable_scope的基本使用

变量域时可以嵌套使用的，嵌套后，变量名会以此加上变量域作为路径。如下代码：

```python
with tf.variable_scope("foo"):
    with tf.variable_scope("bar"):
        v = tf.get_variable("v", [1])
assert v.name == "foo/bar/v:0"
```

我们也可以通过 `tf.get_variable_scope()` 来获得当前的变量域对象，并通过 `reuse_variables()` 方法来设置是否共享变量。不过，TensorFlow 并不支持将 `reuse` 值设为 `False`，如果你要停止共享变量，可以选择离开当前所在的变量域，或者再进入一个新的变量域（比如，再进入一个 `with` 语句，然后指定新的域名）。

还需注意的一点是，一旦在一个变量域内将 `reuse` 设为 `True`，那么这个变量域的子变量域也会继承这个 `reuse` 值，自动开启共享变量：

```python
with tf.variable_scope("root"):
    # At start, the scope is not reusing.
    assert tf.get_variable_scope().reuse == False
    with tf.variable_scope("foo"):
        assert tf.get_variable_scope().reuse == False
    with tf.variable_scope("foo", reuse=True):
        assert tf.get_variable_scope().reuse == True
        with tf.variable_scope("bar"):
            assert tf.get_variable_scope().reuse == True
    assert tf.get_variable_scope().reuse == False
```

变量域也可以 作为一个对象，这样方便使用变量域，跳出当前变量域等。如下面的代码所示：

```python
with tf.variable_scope("foo") as foo_scope:
    assert foo_scope.name == "foo"
with tf.variable_scope("bar")
    with tf.variable_scope("baz") as other_scope:
        assert other_scope.name == "bar/baz"
        with tf.variable_scope(foo_scope) as foo_scope2:
            assert foo_scope2.name == "foo"  # Not changed.
```

#### 2.5.3 在变量域内初始化变量

每次初始化变量时都要传入一个 `initializer`，这实在是麻烦，而如果使用变量域的话，就可以批量初始化参数了，如下代码所示：

```python
with tf.variable_scope("foo", initializer=tf.constant_initializer(0.4)):
    v = tf.get_variable("v", [1])
    assert v.eval() == 0.4  # Default initializer as set above.
    w = tf.get_variable("w", [1], initializer=tf.constant_initializer(0.3)):
    assert w.eval() == 0.3  # Specific initializer overrides the default.
    with tf.variable_scope("bar"):
        v = tf.get_variable("v", [1])
        assert v.eval() == 0.4  # Inherited default initializer.
    with tf.variable_scope("baz", initializer=tf.constant_initializer(0.2)):
        v = tf.get_variable("v", [1])
        assert v.eval() == 0.2  # Changed default initializer.
```



## 3. 最新的数据处理类—data.Dataset

这部分和1中对线程和队列的功能有些类似，但是这部分更多在数据输入部分，第一部分中的还有在其他方面使用。`Dataset`API是TensorFlow在版本1.3中引入的模块，1.4版本中已经作为一个核心的模块。主要服务于数据读取，构建数据的pipeline。前面说了可以通过队列和线程构建，但是整个过程还是比较繁琐，TensorFlow便可以通过这种方式来构建。主要支持从内存和硬盘读取数。

### 3.1 使用`Dataset`的步骤

在数据输入中用`Dataset`模块，需要三个步骤：

1. 导入数据，从一些数据来构建dataset，创建dataset对象， 可以通过`from_tensors`，`from_tensors_slice`
2. 实例化，将dataset实例化为**Iterator**，下图中为dataset下几个实例的关系：

![Dataset API 下的类图](http://img.blog.csdn.net/20171114112942700)

3. 消费数据，在Iterator的基础上对数据进行消费，进行下一步的计算或训练

### 3.2 基本使用

在最开始使用时可以只关注Dataset和Iterator这两个类，再进行逐步的扩展到其他类的使用。Dataset可以看作是相同类型“元素”的有序列表。在实际使用时，单个“元素”可以是向量，也可以是字符串、图片，甚至是tuple或者dict。

在消费数据的时候，是通过get_next方法获取数据。不论通过什么方式创建数据集，在返回数据时都是返回一行或多行数据。下面的几个dataset就可以看出返回数据的规律。

#### 3.2.1 from numpy的数据

从numpy下的array读取数据到dataset：

```python
dataset = tf.data.Dataset.from_tensor_slices(np.random.uniform(size=(5, 3)))  # 1.import data
iterator = dataset.make_one_shot_iterator()  # 2.从dataset实例化一个iterator
one_element = iterator.get_next()  # 3.消费数据
with tf.Session() as sess:
    try:
        for i in range(6):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")
# ---------------------- output ----------------------
# 每次返回一行数据, 共返回5次, 相当于5个样本，3个特征
```

#### 3.2.2 从字典中创建dataset

```python
dataset = tf.data.Dataset.from_tensor_slices(
    {
        "a": np.array([1.0, 2.0, 3.0, 4.0, 5.0]),  # "可以将key-a当做label的序列"
        "b": np.random.uniform(size=(5, 2))
    }
)
dataset = dataset.map(lambda x: {"a": x["a"], "b": 10 * x["b"]})
iterator = dataset.make_one_shot_iterator()  # 从dataset实例化一个iterator
one_element = iterator.get_next()

with tf.Session() as sess:
    try:
        for i in range(6):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")

# ------------------ output -----------------------
{'a': 1.0, 'b': array([4.18069729, 3.36752717])}  # 每次会一个lable所对应的sample，共返回5次
{'a': 2.0, 'b': array([7.37556694, 1.79710602])}
{'a': 3.0, 'b': array([1.76684338, 0.48396737])}
{'a': 4.0, 'b': array([6.21267904, 5.28298128])}
{'a': 5.0, 'b': array([8.36019678, 2.08220728])}
```

#### 3.2.3 从tuple中创建dataset

```python
dataset = tf.data.Dataset.from_tensor_slices(
  (np.array([1.0, 2.0, 3.0, 4.0, 5.0]), np.random.uniform(size=(5, 2)))
)
dataset = dataset.map(lambda x, y: (x, y*10))
iterator = dataset.make_one_shot_iterator()  # 从dataset实例化一个iterator
one_element = iterator.get_next()

with tf.Session() as sess:
    try:
        for i in range(6):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")
# ---------------------- output ------------------------
(1.0, array([2.45236335, 9.04392201]))  # 这个返回方式和字典类似
(2.0, array([5.16675082, 4.89549424]))
(3.0, array([3.66104816, 3.01531896]))
(4.0, array([8.56580726, 3.77034437]))
(5.0, array([8.18391386, 6.2216879 ]))
```

#### 3.2.4 从生成器创建dataset

```python
sequence = np.array([[1, 2, 2.3464],[2, 3, 45.253],[3, 4, 455.22]])
def generator():
    for el in sequence:
        yield el
dataset = tf.data.Dataset().from_generator(generator,
                                           output_types=tf.float32)
iterator = dataset.make_one_shot_iterator()  # 从dataset实例化一个iterator
one_element = iterator.get_next()

with tf.Session() as sess:
    try:
        for i in range(6):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")
# ---------------------- output ---------------------
[1.     2.     2.3464]  # 这个返回方式和第一种方式类似
[ 2.     3.    45.253]
[  3.     4.   455.22]
```

### 3.3 在dataset中进行数据处理

dataset中也可以对数据进行处理，变换等。主要有的方法：map，cache，shuffle，repeat，batch，prefetch，fileter，flat_map等。这些方法在处理数据时会经常用大。

#### 3.3.1 map的使用

dataset中的map和python的map用法一致，接受一个处理函数。再返回处理后的数据。map主要接收两个参数，它的的api是：`map(map_func, num_parallel_calls=None)`，第一参数为map函数，用来变换数据；第二个参数为并发数，一般为cpu的线程数。如：

```python
dataset = tf.data.Dataset.from_tensor_slices(
  (np.array([1.0, 2.0, 3.0, 4.0, 5.0]), np.random.uniform(size=(5, 2)))
)
dataset = dataset.map(lambda x, y: (x, y*10), num_parallel_calls=4)  # map的使用，线程数为4
iterator = dataset.make_one_shot_iterator() 
one_element = iterator.get_next()

with tf.Session() as sess:
    try:
        for i in range(6):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")
```

需要注意的是，dataset有**map和apply**两个方法，它们是有一定**区别**的，map是将map_function应用到每一个函数。而apply是将function应用到整个dataset。map的参数是一个element ，而apply的函数参数是dataset，apply可用的方法[在这儿](https://www.tensorflow.org/versions/master/api_guides/python/input_dataset#Transformations_on_existing_datasets)。如下：

```python
dataset = tf.data.Dataset.from_tensor_slices(
  (np.array([1.0, 2.0, 3.0, 4.0, 5.0]), np.random.uniform(size=(5, 2)))
)
dataset = dataset.apply(tf.contrib.data.map_and_batch(lambda x, y: (x, y * 100), 2))
iterator = dataset.make_one_shot_iterator() 
one_element = iterator.get_next()

with tf.Session() as sess:
    try:
        for i in range(5):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")
```

#### 3.3.2 cache的使用

cache主要是将数据进行缓存，可以缓存到内存，也可以缓存到磁盘。默认为缓存到内存中。比较好理解，具体就不介绍了。

#### 3.3.3 shuffle的使用

shuffle的功能为打乱dataset中的元素，它有一个参数buffersize，表示打乱时使用的buffer的大小，建议舍的不要太小，一般建议是dataset的size+1，即样本数+1。如下代码，输出的顺序被打乱了。

```python
dataset = tf.data.Dataset.from_tensor_slices(
  (np.array([1.0, 2.0, 3.0, 4.0, 5.0]), np.random.uniform(size=(5, 2)))
)
dataset = dataset.map(lambda x, y: (x, y*10), num_parallel_calls=4).shuffle(buffer_size=6)
iterator = dataset.make_one_shot_iterator()  # 从dataset实例化一个iterator
one_element = iterator.get_next()

with tf.Session() as sess:
    try:
        for i in range(5):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")
# --------------------- output ------------------------
(4.0, array([2.57439552, 3.38879843]))
(2.0, array([7.25460172, 3.86126726]))
(1.0, array([9.08901095, 1.75219504]))
(5.0, array([5.04888193, 3.89428254]))
(3.0, array([9.78304135, 3.44271984]))
```

#### 3.3.4 repeat的使用

repeat的功能就是将整个序列重复多次，主要用来处理机器学习中的epoch，假设原先的数据是一个epoch，使用repeat(2)就可以将之变成2个epoch：

```python
dataset = tf.data.Dataset.from_tensor_slices({"a": np.array([1.0, 2.0, 3.0, 4.0, 5.0]), 
                                              "b": np.random.uniform(size=(5, 2))})
 
dataset = dataset.repeat(2) # repeat
 
iterator = dataset.make_one_shot_iterator()
one_element = iterator.get_next()
with tf.Session() as sess:
    try:
        while True:
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end!")
# --------------------- output --------------------
{'a': 1.0, 'b': array([0.13072499, 0.81223459])}
{'a': 2.0, 'b': array([0.67836451, 0.02996121])}
{'a': 3.0, 'b': array([0.17338524, 0.73540362])}
{'a': 4.0, 'b': array([0.57598212, 0.11428893])}
{'a': 5.0, 'b': array([0.55184749, 0.8721738 ])}
{'a': 1.0, 'b': array([0.13072499, 0.81223459])}
{'a': 2.0, 'b': array([0.67836451, 0.02996121])}
{'a': 3.0, 'b': array([0.17338524, 0.73540362])}
{'a': 4.0, 'b': array([0.57598212, 0.11428893])}
{'a': 5.0, 'b': array([0.55184749, 0.8721738 ])}
```

#### 3.3.5 batch的使用

batch就是将多个样本组合成batch，如API所说，按照输入元素第一个维度进行组合成一个batch：

```python
# batch的使用
dataset = tf.data.Dataset.from_tensor_slices(
  (np.array([1.0, 2.0, 3.0, 4.0, 5.0]), np.random.uniform(size=(5, 2)))
)
dataset = dataset.map(lambda x, y: (x, y*10), num_parallel_calls=4).shuffle(buffer_size=6).batch(3)
iterator = dataset.make_one_shot_iterator()  # 从dataset实例化一个iterator
one_element = iterator.get_next()

with tf.Session() as sess:
    try:
        for i in range(5):
            print(sess.run(one_element))
    except tf.errors.OutOfRangeError:
        print("end")
# ------------------------- output ------------------------
(array([4., 3., 5.]), 
 array([[6.32798625, 3.34494733],
       [8.6747479 , 6.6041502 ],
       [2.96699653, 9.73854298]]))
(array([1., 2.]), 
 array([[4.75347977, 5.51553647],
       [4.12808918, 6.81227941]]))
```

这些操作都可以组合起来使用。如上面的例子，将map，shuffle，batch进行组合使用。

### 3.4 模拟读取文件并通过dataset进行处理

可以将第一部分中读取文件数据的例子近修改，通过dataset的方式进行处理。下面再dataset中存入的是每张图片的路径，后面通过map读取数据，并后续继续使用。具体代码如下：

```python
def _parse_function(filename, label):
    image_string = tf.read_file(filename)
    image_decoded = tf.image.decode_image(image_string)
    image_resized = tf.image.resize_images(image_decoded, [28, 28])
    return image_resized, label
 
filenames = tf.constant(["/var/data/image1.jpg", "/var/data/image2.jpg", ...])
labels = tf.constant([0, 37, ...])
dataset = tf.data.Dataset.from_tensor_slices((filenames, labels))
dataset = dataset.map(_parse_function)
dataset = dataset.shuffle(buffersize=1000).batch(32).repeat(10)
```

### 3.5 创建dataset的其他方法

除了`tf.data.Dataset.from_tensor_slices`外，目前Dataset API还提供了另外三种创建Dataset的方式：

- tf.data.TextLineDataset()：这个函数的输入是一个文件的列表，输出是一个dataset。dataset中的每一个元素就对应了文件中的一行。可以使用这个函数来读入CSV文件。
- tf.data.FixedLengthRecordDataset()：这个函数的输入是一个文件的列表和一个record_bytes，之后dataset的每一个元素就是文件中固定字节数record_bytes的内容。通常用来读取以二进制形式保存的文件，如CIFAR10数据集就是这种形式。
- tf.data.TFRecordDataset()：顾名思义，这个函数是用来读TFRecord文件的，dataset中的每一个元素就是一个TFExample。

### 3.6 将dataset实例化为iterator的其他方法

除了这种one shot iterator外，还有三个更复杂的Iterator，即：`initializable iterator, reinitializable iterator, feedable iterator`.

#### 3.6.1 initializable iterator实例化

`initializable iterator`方法要在使用前通过`sess.run()`来初始化，使用initializable iterator，可以将placeholder代入Iterator中，实现更为灵活的数据载入，实际上占位符引入了dataset对象创建中，我们可以通过feed来控制数据集合的实际情况。示例代码如下：

```python
limit = tf.placeholder(dtype=tf.int32, shape=[])
dataset = tf.data.Dataset.from_tensor_slices(tf.range(start=0, limit=limit))
iterator = dataset.make_initializable_iterator()
next_element = iterator.get_next()
 
with tf.Session() as sess:
    sess.run(iterator.initializer, feed_dict={limit: 10})
    for i in range(10):
      value = sess.run(next_element)
      print(value)
      assert i == value
# output:0 1 2 3 4 5 6 7 8 9
```

`initializable iterator`还有一个功能：读入较大的数组。在使用`tf.data.Dataset.from_tensor_slices(array)`时，实际上发生的事情是将`array`作为一个`tf.constants`保存到了计算图中。当`array`很大时，会导致计算图变得很大，给传输、保存带来不便。这时，我们可以用一个`placeholder`取代这里的`array`，并使用`initializable iterator`，只在需要时将`array`传进去，这样就可以避免把大数组保存在图里，示例代码为（来自官方例程）：

```python
with np.load("/var/data/training_data.npy") as data:
    features = data["features"]
    labels = data["labels"]
 
features_placeholder = tf.placeholder(features.dtype, features.shape)
labels_placeholder = tf.placeholder(labels.dtype, labels.shape)
 
dataset = tf.data.Dataset.from_tensor_slices((features_placeholder, labels_placeholder))
iterator = dataset.make_initializable_iterator()
sess.run(iterator.initializer, feed_dict={features_placeholder: features, labels_placeholder: labels})
```

可见，在上面程序中，feed也遵循着类似字典一样的规则，创建两个占位符(keys)，给`data_holder`去feed数据文件，给`label_holder`去feed标签文件。

#### 3.6.2 reinitializable iterator实例化

`reinitializable iterator`可以从多个不同的Dataset对象处初始化。例如，你可能有一个training input pipeline（它对输入图片做随机扰动来提高泛化能力）；以及一个validation input pipeline（它会在未修改过的数据上进行预测的评估）。这些pipeline通常使用不同的Dataset对象，但它们具有相同的结构（例如：对每个component相同的types和shapes）。

```python
# Define training and validation datasets with the same structure.
training_dataset = tf.data.Dataset.range(100).map(lambda x: x + tf.random_uniform([], -10, 10, tf.int64))
validation_dataset = tf.data.Dataset.range(50)

# A reinitializable iterator is defined by its structure. We could use the
# `output_types` and `output_shapes` properties of either `training_dataset`
# or `validation_dataset` here, because they are compatible.
iterator = tf.data.Iterator.from_structure(training_dataset.output_types, training_dataset.output_shapes)
next_element = iterator.get_next()

training_init_op = iterator.make_initializer(training_dataset)
validation_init_op = iterator.make_initializer(validation_dataset)

# Run 20 epochs in which the training dataset is traversed, followed by the
# validation dataset.
for _ in range(20):
    # Initialize an iterator over the training dataset.
    sess.run(training_init_op)
    for _ in range(100):
        sess.run(next_element)

        # Initialize an iterator over the validation dataset.
        sess.run(validation_init_op)
        for _ in range(50):
            sess.run(next_element)
```

### 3.7 Refrence

[1].[tensorflow中的dataset](http://d0evi1.com/tensorflow/datasets/)

[2].[How to use Dataset in TensorFlow](https://towardsdatascience.com/how-to-use-dataset-in-tensorflow-c758ef9e4428)

[3].[TensorFlow』数据读取类_data.Dataset](https://www.cnblogs.com/hellcat/p/8569651.html)



## 4.collection

TensorFlow中有一个集合叫collection，collection主要是提供tensorflow全局存储的机制，不会受到变量名空间的影响，在一个地方保存，任何地方可用。

TensorFlow自身会维护一些自己的collection，如`tf.GraphKeys.SUMMARIES`，`ops.GraphKeys.QUEUE_RUNNERS`(`from tensorflow.python.framework import ops`)，`GLOBAL_VARIABLES`，`ops.GraphKyes.LOCAL_VARIABLES`等等。在使用TensorFlow的过程中也可以获取这些collection。

### 4.1 向collection中存入数据

在编程过程中可以向collection存入数据，主要通过`add_to_collection`方法将数据加入collection中。该方法是`tf.add_to_collection(name, value)`。该方法``tf.add_to_collection` 的作用是将value以name的名称存储在收集器(`self._collections`)中。另外还可以同时将一个value增加到多个collection中，通过方法`tf.add_to_collections(names, value)`。

### 4.2 从collection中获取数据

如果要从collection中获取数据，需要通过`tf.get_collection(name, scope=None)`来获取集合中的变量值。将返回一个list，list中的值都是之前存入的（如果name不存在，则返回一个空的list）。必须给定一个name参数，来指定获取collection下某个name下的值。scope参数用来过滤某个scope下的值。下面是一个完整的示例：

```python
import numpy as np
import tensorflow as tf


x = tf.constant(np.random.random(10) * 10, dtype=tf.float32, name="const")

with tf.name_scope("scope_y"):
    z = tf.constant(np.random.random(5) * 100, dtype=tf.float32, name="const")

x_ = x * 10
tf.add_to_collection("x", x_)
tf.add_to_collection("x", x)  # 向一个name增加多个值, 如果增加[x, x_], 那么输出的是[[x, x_]]
with tf.Session() as sess:
    print(sess.run(x_))
    # tf.graph.add_to_collection("x", x_)
    print(sess.run(tf.get_collection("x")))
    print(sess.run(tf.get_collection("y")))
    print(sess.run(tf.get_collection("x", scope="scope_y")))  # 只返回这个scope下的值
```

输出如下：

```python
# --------------------------- x_ --------------------------------
[
22.296236  89.52586   94.95532   82.79374    4.5324626 99.39854  54.841103  50.33739   95.65411  95.163025 
]
# ------------------------ collection ---------------------------
[
    array([22.296236 , 89.52586  , 94.95532  , 82.79374  ,  4.5324626,
       99.39854  , 54.841103 , 50.33739  , 95.65411  , 95.163025 ], dtype=float32), 
	array([2.2296236 , 8.952586  , 9.495532  , 8.279374  , 0.45324627,
       9.939854  , 5.4841104 , 5.033739  , 9.565412  , 9.516302  ], dtype=float32),
    array([19.762728, 97.20074 , 35.839146, 82.53057 , 63.590633], dtype=float32)
]
# ----------------------- name is not exists ---------------------
[]
# ----------------------- scope is used --------------------------
[array([19.762728, 97.20074 , 35.839146, 82.53057 , 63.590633], dtype=float32)]
```
