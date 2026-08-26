---
title: numba加速python程序运行
date: 2017-07-09 23:15:15 +0800
categories:
- Python
tags:
- numba
- numpy
---
`python`作为一个动态语言，在运行效率上为一大缺陷，但是作为一门成熟的语言，有很多方式可以提高`python`的运行效率，如:`cpython, pypy,numba,LLVMPy`。个人主要用户`python`处理数据和写一些数据挖掘方面的算法，因此使用`numba`较为方便。因此对`numba`说明下，并作为笔记记录以便以后查阅。`numba`的来源主要，`NumPy`的创始人`Travis Oliphant`在离开`Enthought`之后，创建了`CONTINUUM`，致力于将`Python`大数据处理方面的应用。最近推出的`Numba`项目能够将处理`NumPy`数组的`Python`函数`JIT`编译为机器码执行，从而上百倍的提高程序的运算速度。<!--more-->下面看一个简单的例子：
```python
import numba as nb
from numba import jit

@jit('f8(f8[:])')
def sum1d(array):
    s = 0.0
    n = array.shape[0]
    for i in range(n):
        s += array[i]
    return s

import numpy as np
array = np.random.random(10000)
%timeit sum1d(array)
%timeit np.sum(array)
%timeit sum(array
```
输出：
```
10000 loops, best of 3: 38.9 us per loop
10000 loops, best of 3: 32.3 us per loop
100 loops, best of 3: 12.4 ms per loop
```
`numba`中提供了修饰器利用`JIT`将其修饰的函数便以为机器函数，变返回一个可在`python`中调用机器码的包装对象。为了能够将`python`函数编译成能告诉执行的机器码，需要告诉`JIT`编译器函数的各个参数和返回值的类型。我们可以通过多种方式指定类型信息，在上面的例子中，类型信息由一个字符串`f8(f8[:])`指定。其中`f8`表示8个字节双精度浮点数，括号前面的`f8`表示返回值类型，括号里的表示参数类型，`[:]`表示一维数组。因此整个类型字符串表示`sum1d()`是一个参数为双精度浮点数的一维数组，返回值是一个双精度浮点数。需要注意的是JIT函数只能对指定的类型参数进行运算。

如果希望`JIT`能够对所有的类型进行运算，可以所有`autojit`。但是该函数的运算速度远不及`JIT`，因为`autojit`在运算前需要判断类型，因此大大降低了效率。在`numba`中基本是使用`JIT`和`autojit`这两个函数装饰自己的函数。下面是`numba`模块所支持的所有类型：
```
[type for type in dir(numba.types)]

['Any', 'Array', 'CPointer', 'CharSeq', 'Complex', 'Dispatcher', 'Dummy', 'Float', 'Function', 'FunctionPointer', 'Integer', 'Kind', 'Macro', 'Method', 'Module', 'Object', 'OpaqueType', 'Optional', 'Prototype', 'Record', 'Tuple', 'Type', 'UniTuple', 'UniTupleIter', 'UnicodeCharSeq', 'VarArg', '__all__', '__builtins__', '__doc__', '__file__', '__name__', '__package__', '_autoincr', '_make_signed', '_make_unsigned', '_typecache', 'abs_type', 'absolute_import', 'b1', 'bool_', 'boolean', 'byte', 'c16', 'c8', 'char', 'complex128', 'complex64', 'complex_domain', 'defaultdict', 'division', 'double', 'exception_type', 'f4', 'f8', 'float32', 'float64', 'float_', 'i1', 'i2', 'i4', 'i8', 'int16', 'int32', 'int64', 'int8', 'int_', 'intc', 'integer_domain', 'intp', 'len_type', 'long_', 'longlong', 'neg_type', 'none', 'number_domain', 'numpy', 'print_function', 'print_item_type', 'print_type', 'pyobject', 'range_iter32_type', 'range_iter64_type', 'range_state32_type', 'range_state64_type', 'range_type', 'real_domain', 'short', 'sign_type', 'signed_domain', 'slice3_type', 'slice_type', 'string', 'u1', 'u2', 'u4', 'u8', 'uchar', 'uint', 'uint16', 'uint32', 'uint64', 'uint8', 'uintc', 'uintp', 'ulong', 'ulonglong', 'unsigned_domain', 'ushort', 'void', 'voidptr']
```
下面通过一个例子，利用`jit`和`autojit`进行对比，看效率如何：下面的例子中通过读取`ecexl`中的数据，再对数据进行处理（找出某个元素的索引，并返回其索引值。）
```python
import xlrd
import numpy as np
import numba
from time import clock

@numba.jit('int64(char[:])')   #@autojit
def get_array_table(path):
    book = xlrd.open_workbook(filename=path)
    table = book.sheets()[0]
    nrows = table.nrows
    data_array = []
    columns = []
    for i in range(nrows):
        if i == 0:
            columns = table.row_values(i)
        else:
            data_array.append(table.row_values(i))
    data = np.array(data_array)
    return data

@numba.jit('int64(int64[:])')   #@autojit
def get_array_index(number): #找到满足条件的元素的索引index，并返回这个索引
    index = 0
    try：
        for k in range(len(data2)):
            if data2[k,0] == number:
                index = k
                busi_amount = sum(data2[index:,0]*data2[index:,1]) #busi amount, 大于阈值业务量的值
                user_amount = sum(data2[index:,1])                 #大于阈值的用户量      
                break
            else:
                index = 0
                continue
        return index
    except Exception as e:
        print "THere is error:%s ！" % e  

if __name__ == "__main__":
    start_time = clock()
    path1 = "f:\\TEST1.xlsx"    #file2 in path, sample data, normal user in cp
    path2 = "f:\\TEST2.xlsx"    #file1 in path, all data  
    data1 = get_array_table(path1)
    data2 = get_array_table(path2)
    all_busi_cnt = sum(data2[:,0]*data2[:,1])
    all_user_cnt = sum(data2[:,1])
  
    index = get_array_index(200)
    end_time = clock()
  
    print data2[:,0][np.where(data2[:,0] > 200)]    #通过where找出符合条件的数据集
    print data2[:,0].tolist().index(200)            #将array转化为list进行index
    print data2[index,:]

    print "This process have to time %s second!" % (end_time-start_time)  
```
输出为：
```
199
[ 200.  261.]
This process have to time 2.8969633643 second!
#@autojit
199
[ 200.  261.]
This process have to time 8.33246232783 second!
```
可以看出`JIT`比`AUTOJIT`要快一些。当数据量大时差距会更加的大。另外`numba`和`numpy`配合使用效果最佳。可以通过`google`查询`cpython` ,`pypy` 和`numba`的效率比较,有很多这样文章。
