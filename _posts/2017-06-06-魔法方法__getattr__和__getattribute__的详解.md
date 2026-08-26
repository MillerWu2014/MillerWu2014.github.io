---
title: 魔法方法__getattr__和__getattribute__的详解
date: 2017-06-06 17:35:30 +0800
categories:
- Python
tags:
- python
---
### `__getattr__()` 和 `__getattribute__()`的定义
python在属性访问上定义了`__getattr__()` 和 `__getattribute__()`两种方法。区别是很小，但是必须了解他们之间的区别，否则在使用的过程中会导致严重的后果。首先看这两个方法的定义：

1. 如果在类中定义了`__getattr__()`这个方法，那么在对象查询属性时,如果这个属性在类中定义了，如一个已经实例化的对象x定义了属性name，那么在使用x.name时就不会调用`__getattr__(`name`)`；会直接返回name已经定义好的值。简单的说：`__getattr__()`会在对象中不存在这个属性时被调用。
2. 如果在类定义了`__getattribute__()`方法，那么它无条件被调用。当实例化的对象每次引用属性和方法时都会先调用它。如果属性查找不到那么就会引发AttributeError的异常。除非在类中同时定义了`__getattribute__()`和`__getattr__()`两个方法。

下面来看一个`__setattr__`的实例：
```python
class MagicTest(object):
    def __init__(self):
        self.name = "Miller"
        self.age = 25

    def __getattr__(self, name):
        return None

if __name__ == "__main__":
    magic = MagicTest()
    print magic.name
    print magic.age
    print magic.sex
    
# ouput
Miller
25
None
```

<!--more-->

### `__getattribute__`的使用
从上面的代码中可以很清楚的知道，magic在引用sex不存在的属性时，调用了`__getattr__`方法。因此返回了None。那么现在存在一个问题：`__getattribute__ `是怎么样的呢？我们把上面的代码稍作修改看会怎么样。如下：
```python
class MagicTest1(object):
    def __init__(self):
        self.name = "Miller"
        self.age = 25

    def __getattribute__(self, name):
        print "__getattribute__"
        return super(MagicTest1, self).__getattribute__(name)     (1)

if __name__ == "__main__":
    magic1 = MagicTest1()
    print magic1.name
    print magic1.age
    print magic1.sex
    
# output
__getattribute__
Miller
__getattribute__
25
-------------------AttributeError Traceback (most recent call last)

AttributeError: `MagicTest1` object has no attribute `sex`  (2)
```


可以看出上面的代码中有几个地方很疑惑，在上面我已经进行了标记(1),(2)。首先来看第一个疑惑的地方：
(1)为什么要使用super来调用object的`__getattribute__`方法呢？首先，`__getattribute__`方法在新式类中才存在，在python2.x需要继承object才会有这个方法，python3.x全是新式类。其次，这样做的好处是防止无线循环查找属性。因为getattribute在访问属性的时候一直会被调用，自定义的getattribute方法里面同时需要返回相应的属性，通过`self.__dict__`取值会继续向下调用getattribute，造成循环调用.
(2)为什么会有AttributeError呢？因在上面代码中，`__getattribute__`会被无条件调用，当调用sex属性时，去实例对象magic1中查找是否具备该属性：`t.__dict__ `中查找，每个类和实例对象都有一个`__dict__`的属性，若在`t.__dict__`中找不到对应的属性，则去该实例的类中寻找，即`t.__class__.__dict__`。若在实例的类中也招不到该属性，则去父类中寻找，即`t.__class__.__bases__.__dict_`中寻找。若以上均无法找到，则会调用`__getattr__`方法，执行内部的命令（若未重载` __getattr__ `方法，则直接报错：AttributeError)。

总体来说查找过程是:`__dict__` ——> `__class__.__dict__` ——> `__class__.__bases__.__dict__`；如果都查找不到就会调用`__getattr__`方法。如果没有`__getattr__`方法则会引发异常AttributeError。
下面我们可以打印出对象的属性看里面的值：
```python
print magic1.__dict__
print magic1.__class__.__bases__.__dict__
print magic1.__class__.__dict__
__getattribute__
{`age`: 25, `name`: `Miller`}
__getattribute__
{`__module__`: `__main__`, `__getattribute__`: <function __getattribute__ at 0x00000000042C6E48>, `__dict__`: <attribute `__dict__` of `MagicTest1` objects>, `__weakref__`: <attribute `__weakref__` of `MagicTest1` objects>, `__doc__`: None, `__init__`: <function __init__ at 0x00000000042C6F28>}
__getattribute__
AttributeError: `tuple` object has no attribute `__dict__`
```

可以知道。上面输出是还是调用了`__getattribute__`方法，因此在输出时才会打印`__getattribute__`。输出的`__dict__`如上面输出所示。
因为在上面的MagicTest1中我们定义了name和age属性。我改变代码并并显式定义个属性sex并进行赋值看会是什么结果？
```python
class MagicTest1(object):
    def __init__(self):
        self.name = "Miller"
        self.age = 25

    def __getattribute__(self, name):
        print "__getattribute__"
        if name == "sex":
            return "Women"
        return object.__getattribute__(self, name)

if __name__ == "__main__":
    magic1 = MagicTest1()
    magic1.sex = "man"
    print magic1.sex
__getattribute__
Women
```
从结果中可以看出，给sex属性赋值后并没有生效。这是因为在访问属性和方法时会被无条件的调用，因此导致sex属性的值并未生效。因此一定要注意防止这种情况发生。如果定义了类的`__getattribute__()`方法，你可能还想定义一个`__setattr__()`方法，并在两者之间进行协同，以跟踪属性的值。否则，在创建实例之后所设置的值将会消失在黑洞中。如下的代码：
```python
class MagicTest1(object):
    def __init__(self):
        self.name = "Miller"
        self.age = 25

    def __getattribute__(self, name):
        print "__getattribute__"
        if name == "sex":
            try:
                return self.__dict__[name]
            except:
                raise AttributeError("This object has no attribute!")
        return object.__getattribute__(self, name)

    def __setattr__(self, name, value):
        self.__dict__[name] = value

if __name__ == "__main__":
    magic1 = MagicTest1()
    magic1.sex = "man"
    print magic1.sex
```

### 定义三种方法
假设我们在一个类中定义了`__getattribute__`，`__setattr__`，`__getattr__`这三个方法：
```python
class CardHolder(object):
    acctlen = 8  # Class data
    retireage = 59.5

    def __init__(self, acct, name, age, addr):
        self.acct = acct  # Instance data
        self.name = name  # These trigger __setattr__ too
        self.age = age  # acct not mangled: name tested
        self.addr = addr  # addr is not managed

    def __getattr__(self, name):
        return None

    def __getattribute__(self, name):
        superget = object.__getattribute__  # Don`t loop: one level up
        if name == "acct": # On all attr fetches
            return superget(self, 'acct')[:-3] + "***"
        elif name == "remain":
            return superget(self, "retireage") - superget(self, "age")
        else:
            print "This variable %s is not exists." % name
            return superget(self, name)  # name, age, addr: stored

    def __setattr__(self, name, value):
        if name == "name":  # On all attr assignments
            value = value.lower().replace("", "_")  # addr stored directly
        elif name == "age":
            if value < 0 or value > 150:
                raise ValueError(`invalid age`)
        elif name == "acct":
            value = value.replace("-", "")
            if len(value) != self.acctlen:
                raise TypeError("invald acct number")
        elif name == "remain":
            raise TypeError("cannot set remain")
        self.__dict__[name] = value  # Avoid loops, orig names
```

上面的代码中：在属性赋值时首先会调用`__setattr__`方法，即使是在`__init__`中赋值也会调用`__setattr__`。`__getattribute__`实现了对部分属性值的计算，在`__setattr__`也可以实现值的计算或者类型检测等操作。在实际应用中有利于统一接口，使整个类更加的严谨等很多好处。

### 总结
当访问某个实例属性时，`__getattribute__`会被无条件调用，如未实现自己的`__getattr__`方法，会抛出AttributeError提示找不到这个属性，如果自定义了自己__getattr__方法的话，方法会在这种找不到属性的情况下被调用，比如上面的例子中的情况。所以在找不到属性的情况下通过实现自定义的getattr方法来实现一些功能是一个不错的方式，因为它不会像`__getattribute__`方法每次都会调用可能会影响一些正常情况下的属性访问。
参考文档：
- [Python `__getattribute__` vs `__getattr__` 浅谈](http://python.jobbole.com/84095/)
- [可爱的 Python: Python 之优雅与瑕疵，第 2 部分](https://www.ibm.com/developerworks/cn/linux/l-python-elegance-2.html)





