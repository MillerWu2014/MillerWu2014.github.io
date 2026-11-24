---
title: spark中job运行过程详解和job,stage,task解析
date: 2017-08-30 01:40:04 +0800
categories:
- spark
tags:
- spark
- stage
- job
- task
---
了解了spark的基础后一直想清楚在spark整个执行过程。在spark客户端提交任务后，从`job，stage，task`，在到`worker`上执行，整过流程必须清楚，对后续的调优，spark中job运行原理都有很大的帮助。下面对spark中job运行过程进行详细解析，整个过程如下图所示。

![enter description here](/assets/img/posts/spark中job运行过程详解和job,stage,task解析/spark运行流程解析.png)
<!--more-->
## Job运行流程
在client端提交Job，而Job会生成一个`sparkcontext`对象，该对象向集群申请Executor资源，将job分解成可并行的task，然后将task分发到各个`executor`上执行，执行完成后将`executor`的结果全部返回到`sparkcontext`中。下面对整个过程进行详细说明。

### Job到DAGScheduler过程
Job的概念：包含很多`task`的并行计算，可以认为是`Spark RDD` 里面的`action`，每个`action`的触发会生成一个job。而这个过程中主要是将RDD中的依赖关系形成DAG，并将DAG传递到`DAGScheduler`中。

### DAGScheduler对DAG的处理
`DAGSchedule`对DAG进行`stage`的划分，并在每个`Stage`内化为出一系列可并行处理的`task`,再将`task`传递到下一层; `DAGScheduler`会记录哪个RDD或者`Stage`会被物化，从而寻找一个最佳调度方案。将`TaskSet`提交给`Task Tracker`。重新提交输出`lost`的`Stage`。在这个过程中涉及到了很重要的环节—`stage`的划分,后面会着重进行说明。

### task运行
在1.2中生成了一系列的`task`，`task`和底层的资源交互，而这个资源交互的协调人就是`TaskScheduler`，`taskset`提交到`TaskScheduler`等待调度执行。`TaskScheduler`提供了对外的接口，`TaskScheduler`对接的是不同的`SchedulerBackend`的实现(比如`mesos`，`yarn`，`standalone`)，都是通过`TaskScheduler`来进行协作。`TaskScheduler`在初始化后会启动`SchedulerBackend`(yarn, mesos等)，它(`SchedulerBackend`)负责跟外界打交道，接收`Executor`的注册信息，并维护`Executor`的状态，所以说`SchedulerBackend`是管资源(`worker`)的，同时它在启动后会定期地去“询问”`TaskScheduler`有没有任务要运行，`TaskScheduler`在`SchedulerBackend`“问”它的时候，会从调度队列中按照指定的调度策略选择`TaskSetManager`去调度运行。

`TaskScheduler`支持两种调度策略，一种是`FIFO`，也是默认的调度策略，另一种是`FAIR`。这两种调度策略可以通过资料去查具体的实现方式。

Spark实现了三种不同的`TaskScheduler`，包括`LocalSheduler`、`ClusterScheduler`和`MesosScheduler`。`LocalSheduler`是一个在本地执行的线程池，`DAGScheduler`提交的所有task会在线程池中被执行，并将结果返回给`DAGScheduler`。`TaskScheduler`的启动会伴随`SparkDeploySchedulerBackend`的启动，而`backend`会将自己分为两个角色：首先是`driver`，`driver`是一个`local`运行的`actor`，负责与`remote`的`executor`进行通行，提交任务，控制`executor`；其次是`StandaloneExecutorBackend`，Spark会在每一个slave node上启动一个`StandaloneExecutorBackend`进程，负责执行任务，返回执行结果。具体过程如下图`TaskScheduler`部分所示：

![TaskScheduler详解](/assets/img/posts/spark中job运行过程详解和job,stage,task解析/TaskScheduler详解.png)

上图中是一个完整的spark任务调度过程中`ApplicationMaster`、`Driver`以及`Executor`的交互过程。`Driver`初始化`SparkContext`过程中，会分别初始化`DAGScheduler`、`TaskScheduler`、`SchedulerBackend`以及`HeartbeatReceiver`，并启动`SchedulerBackend`以及`HeartbeatReceiver`。`SchedulerBackend`通过`ApplicationMaster`申请资源，并不断从`TaskScheduler`中拿到合适的`Task`分发到`Executor`执行。`HeartbeatReceiver`负责接收`Executor`的心跳信息，监控`Executor`的存活状况，并通知到`TaskScheduler`。

上面对spark中任务执行过程有了大概的了解之后，现在可以对其中部分的细节进行了解。如job，task，stage的划分等。其中stage的划分是非常重要的。

## job,stage和task理解

### job的理解
`job`是`rdd`的`action`所触发的一个动作，当`rdd`执行`action`的时候即触发一个`job`。在触发`job`后，`RDD`的`runJob`则在`SparkContext`的`runJob`中调用，`SparkContext`的`runJo`b底层会调用`DAGScheduler`的`runJob`方法。在`DAGScheduler`会将每个`job`划分为多个`stage`，并分析他们之间的关系，会寻找最优的运行策略，再进行下一步操作。

另外`job`也分为不含有`shuffle`和`reduce`，含有`shuffle`和`reduce`的`job`,对于两种`job`，第一种`job`只会产生一个`finalStage`，而第二种`job`会产生`finalStage`和`mapStage`。

### stage的划分
一个job会被分成1组或1组以上task，其中每组task就是一个stage，就像map stage和reduce stage一样。另外一个说法：stage是job的组成单元，一个job会被切分为一个或者多个stage。那么stage是怎么划分的呢？

官方的说明：调度器从`DAG`图末端出发，逆向遍历整个依赖关系链，遇到`ShuffleDependency`（宽依赖关系的一种叫法）就断开，遇到`NarrowDependency`就将其加入到当前`stage`。从触发`action`操作的`RDD`往前倒推，如果发现了某个`RDD`是宽依赖，那么就会将宽依赖的`RDD`创建为一个新的`stage`。那个`RDD`是新的`stage`中最后一个`RDD`，这样依次遍历，知道所有的`RDD`全部遍历。结合官方的图来解释。

![RDD中stage划分](/assets/img/posts/spark中job运行过程详解和job,stage,task解析/RDD中stage划分.jpg)

从图中可以看出在宽依赖关系处就会断开依赖链，划分`stage`，宽依赖的`RDD`是`stage`中的最后一个`RDD`。这里的`stage1`不需要计算，只需要计算`stage2`和`stage3`，就可以完成整个`Job`。

#### 宽依赖和窄依赖的定义
RDD每一次transformation都会生成一个新的RDD，这样就会建立RDD之间的前后依赖关系，在Spark中，依赖关系被定义为两种类型，分别是窄依赖和宽依赖：
- 窄依赖：父RDD的分区最多只会被子RDD的一个分区使用
- 宽依赖：父RDD的一个分区会被子RDD的多个分区使用

下图中为宽依赖和窄依赖的官方说明：

![宽依赖和窄依赖](/assets/img/posts/spark中job运行过程详解和job,stage,task解析/宽依赖和窄依赖.jpg)

下面根据stage划分的算法对`wordcount`进行`stage`划分示意图：

![wordcount的stage划分过程](/assets/img/posts/spark中job运行过程详解和job,stage,task解析/wordcount的stage划分过程.jpg)

### task的理解
`task`实在`stage`的基础上进行，计算是以`partition`为单元，`task`的数量和`partition`的数据相同。`partition`的划分依据很多，可以根据`key`划分，可以自定义，以文件的`block`来划分等。

## 参考资料
1. [Task调度算法，FIFO还是FAIR](https://ieevee.com/tech/2016/07/11/spark-scheduler.html)
2. [深入研究 spark 运行原理之 job, stage, task](https://litaotao.github.io/deep-into-spark-exection-model)
3. [Spark Scheduler内部原理剖析](http://sharkdtu.com/posts/spark-scheduler.html)
4. [Spark源码分析之-scheduler模块](http://jerryshao.me/architecture/2013/04/21/Spark%E6%BA%90%E7%A0%81%E5%88%86%E6%9E%90%E4%B9%8B-scheduler%E6%A8%A1%E5%9D%97/)

