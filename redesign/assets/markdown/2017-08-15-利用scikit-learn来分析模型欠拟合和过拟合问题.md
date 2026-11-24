---
title: 利用scikit-learn来分析模型欠拟合和过拟合问题
date: 2017-08-15 23:33:31 +0800
categories:
- 机器学习
tags:
- scikit-learn
- overfit
- underfit
---
当你运行一个学习算法时，如果这个算法的表现不理想，那么多半是出现两种情况：要么是偏差比较大、要么是方差比较大。换句话说，出现的情况要么是欠拟合、要么是过拟合问题。在建模的过程中经常会遇到模型拟合度不够或者过拟合，但是怎么去分析模型是否存在欠拟合和过拟合呢？一般通过模型的学习曲线和评估曲线来分析欠拟合和过拟合。并在实际应用中针对性的提出解决方案。下图为理论上识别欠拟合和过拟合的方法，如下：
![polynline.png](/assets/img/posts/利用scikit-learn来分析模型欠拟合和过拟合问题/poly_nihe.png)

### 1. 使用学习曲线判别偏差和方差问题
如果一个模型过于复杂，则参数太多，可能导致模型过拟合。解决过拟合问题，可以通过增加训练数据集，降低模型复杂度，交叉检验等。根据上图中，我们可以逐渐增加模型训练集，观察模型的偏差和方差变化，确定这种方式是否有效。
![biasvariance.png](/assets/img/posts/利用scikit-learn来分析模型欠拟合和过拟合问题/bias_variance.png)
上图中左上角的情况，模型偏差较大，训练和测试效果曲线都很差，精度太低，可能是欠拟合，解决欠拟合问题：一般通过增加模型参数，增加特征或者减小正则项等。

下面通过`python`中`scikit-learn`的学习曲线来对欠拟合和过拟合进行说明，主要通过不同的数据量来逐步分析模型效果，看欠拟合和过拟合的情况。
<!--more-->

```python
import numpy as np
import random

from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import learning_curve, validation_curve
from matplotlib import pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score, make_scorer

load_data = load_iris()
X, Y = load_data.data, load_data.target

index = range(150)
random.shuffle(index)

random_x = X[index, :]
random_y = Y[index]

estimator = LogisticRegression(penalty='l2', C=1.0, fit_intercept=True)

f1 = make_scorer(f1_score)
train_size, train_scores, test_scores = learning_curve(estimator, X=random_x, y=random_y,
                                                       train_sizes=np.linspace(0.1, 1.0, 10), cv=10, 
                                                       scoring='accuracy')

train_mean = np.mean(train_scores, axis=1)
train_std = np.std(train_scores, axis=1)

test_mean = np.mean(test_scores, axis=1)
test_std = np.std(test_scores, axis=1)

fig = plt.figure(figsize=(9, 6))
ax = fig.add_subplot(111)

ax.plot(train_size, train_mean, linestyle='--', color="green", marker='o', markersize=5,label="train line")
ax.fill_between(train_size, train_mean+train_std, train_mean-train_std, alpha=0.3, color="green")

ax.plot(train_size, test_mean, linestyle='-', marker='s', markersize=5, color="blue", label="test line")
ax.fill_between(train_size, test_mean+test_std, test_mean-test_std, alpha=0.3, color="blue")

plt.legend(loc="lower right")
plt.show()
```

![png](/assets/img/posts/利用scikit-learn来分析模型欠拟合和过拟合问题/output_5_0.png)

`learning_curve`中的`train_sizes`参数控制产生学习曲线的训练样本的绝对/相对数量，此处，我们设置的`train_sizes=np.linspace(0.1, 1.0, 10)`，将训练集大小划分为10个相等的区间。`learning_curve`默认使用分层k折交叉验证计算交叉验证的准确率，我们通过cv设置k。从上图中可以看出模型的效果非常好，在数据量达到80以上时，训练和测试的准确率基本重合。因此基本是没有过拟合情况，而模型的整个准确率在95%以上，因此模型也不存在欠拟合的情况。

### 2. 用验证曲线解决过拟合和欠拟合

验证曲线可以调整模型的参数，从而解决过拟合或者欠拟合问题，验证曲线和学习曲线近似，但是意义不一样，可以通过`validation_curve`来实现。还能对模型进行优化，加强模型的精度以及泛化能力。下图(借用网上一张图表示)中则为模型的随着参数的不同，模型效果变化。
1. 当`cross validation error (Jcv)` 跟`training error(Jtrain)`差不多，且`Jtrain`较大时，当前模型更可能存在欠拟合。
2. 当`Jcv >> Jtrain`且`Jtrain`较小时，当前模型更可能存在过拟合
![parambiasvariance.png](/assets/img/posts/利用scikit-learn来分析模型欠拟合和过拟合问题/param_bias_variance.png)


```python
param_c = [0.001, 0.01, 0.1, 0.5, 0.8, 1, 2, 3, 10]
train_scores, test_scores = validation_curve(estimator, X=random_x, y=random_y, param_name='C', param_range=param_c, cv=10, 
                 scoring='accuracy')
train_mean = train_scores.mean(axis=1)
train_std = train_scores.std(axis=1)
test_mean = test_scores.mean(axis=1)
test_std = test_scores.std(axis=1)

fig = plt.figure(figsize=(9, 6))
ax = fig.add_subplot(111)

ax.plot(param_c, train_mean, marker='o', markersize=5, color='blue', label="train_acc")
ax.fill_between(param_c, train_mean+train_std, train_mean-train_std, color='blue', alpha=0.3)

ax.plot(param_c, test_mean, marker='*', markersize=5, color='green', label="test_acc")
ax.fill_between(param_c, test_mean+test_std, test_mean-test_std, color='green', alpha=0.3)
plt.bar(left=param_c, height=10*(train_mean-test_mean), width=0.2, 
        color='0.2', yerr=test_std, align='center')

plt.xticks(map(lambda x: round(x, 1), param_c))
plt.grid()
plt.legend(loc="center right")
plt.show()
```
![png](/assets/img/posts/利用scikit-learn来分析模型欠拟合和过拟合问题/output_8_0.png)

### 3. 参考文档
[斯坦福机器学习课程 第六周 (2)偏差VS方差](http://studyai.site/2016/10/24/%E6%96%AF%E5%9D%A6%E7%A6%8F%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0%E8%AF%BE%E7%A8%8B%20%E7%AC%AC%E5%85%AD%E5%91%A8%20%282%29%E5%81%8F%E5%B7%AEVS%E6%96%B9%E5%B7%AE/)
[斯坦福机器学习课程 第三周 (4)正则化：解决过拟合问题](http://studyai.site/2016/09/04/%E6%96%AF%E5%9D%A6%E7%A6%8F%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0%E8%AF%BE%E7%A8%8B%20%E7%AC%AC%E4%B8%89%E5%91%A8%20%284%29%E6%AD%A3%E5%88%99%E5%8C%96%EF%BC%9A%E8%A7%A3%E5%86%B3%E8%BF%87%E6%8B%9F%E5%90%88%E9%97%AE%E9%A2%98/)
[欠拟合还是过拟合的判断](http://www.cnblogs.com/instant7/p/4135416.html)
[使用学习曲线和验证曲线 调试算法](https://ljalphabeta.gitbooks.io/python-/content/debugging.html)


