---
title: arrow的性能分析及在python中的使用
date: 2019-01-21 10:34:13 +0800
categories:
- Python
tags:
- arrow
- ray
---
Apache Arrow 是 Apache 基金会全新孵化的一个顶级项目。它设计的目的在于作为一个跨平台的数据层，来加快大数据分析项目的运行速度。

现在大数据处理模型很多，用户在应用大数据分析时，除了将 Hadoop 等大数据平台作为一个存储和批处理平台之外，同样也得关注系统的扩展性和性能。过去开源社区已经发布了很多工具来完善大数据分析的生态系统，这些工具包含了数据分析的各个层面，例如列式存储格式（Parquet，ORC），内存计算模型（Drill，Spark，Impala 和 Storm）以及其强大的 API 接口。而 Arrow 则是最新加入的一员，它提供了一种跨平台应用的内存数据交换格式。
![使用arrow之前](/assets/img/posts/arrow的性能分析及在python中的使用/arrow_f.png)
![使用arrow之后](/assets/img/posts/arrow的性能分析及在python中的使用/arrow_b.png)<!--more-->

## arrow的python版本安装

arrow是apache下的一个顶级项目，它是一个跨平台的内存数据交换格式。通过conda来进行安装：`conda install -c conda-forge pyarrow`，官方的安装推荐使用conda，具体可以见[apache arrow documentation](https://arrow.apache.org/docs/python/install.html).


```python
import pyarrow as pa

data = b'ddgkdfkgfdlgl8439495435043050883483495'
buf = pa.py_buffer(data)
buf
```


    <pyarrow.lib.Buffer at 0x7f46706d0ab0>


```python
buf.size  # 38
```

### 结合numpy使用


```python
import numpy as np

data = np.random.random((100, 10)).reshape(-1)
pa_array = pa.array(data)
pa_array
```


    <pyarrow.lib.DoubleArray object at 0x7f467b68aea8>
    [
      0.688175,
      0.979032,
      0.91343,
      0.725985,
      0.469235,
      0.373089,
      0.792048,
      0.472252,
      0.615361,
      0.693604,
      ...
      0.240511,
      0.162609,
      0.518071,
      0.816558,
      0.736163,
      0.509702,
      0.914533,
      0.879404,
      0.979877,
      0.883003
    ]


```python
np_array = pa_array.to_numpy().reshape((100, 10))
np_array
```

### 结合pandas使用


```python
import pandas as pd

df = pd.DataFrame(data=np.random.randint(1, 10, (10, 4)), columns=["column_a", "column_b", "column_c", "column_d"])
pa_df = pa.Table.from_pandas(df)
[m for m in dir(pa_df) if not m.startswith('__')]
```


    ['_column',
     '_validate',
     'add_column',
     'append_column',
     'cast',
     'column',
     'columns',
     'drop',
     'equals',
     'flatten',
     'from_arrays',
     'from_batches',
     'from_pandas',
     'itercolumns',
     'num_columns',
     'num_rows',
     'remove_column',
     'replace_schema_metadata',
     'schema',
     'set_column',
     'shape',
     'to_batches',
     'to_pandas',
     'to_pydict']


```python
pa_df.to_pandas()
```

### 导入csv格式的数据


```python
from pyarrow import csv

csv_file_path = '/opt/workspace/project/ModisResistModule/data/FirmsPoint/fire_nrt_V1_21640.csv'

def to_df_arrow(file_path):
    table = csv.read_csv(file_path)

%timeit df_pa = to_df_arrow(csv_file_path)
```

    26 ms ± 97.9 µs per loop (mean ± std. dev. of 7 runs, 10 loops each)

```python
%timeit df = pd.read_csv(csv_file_path)
```

    164 ms ± 1.18 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)


## arrow的IO操作


```python
def py_write(string):
    with open("./test_py_string.dat", "wb") as writer:
        writer.write(string)
        
def pa_write(string):
    with pa.OSFile("./test_pa_string.dat", "wb") as writer:
        writer.write(string)

s = b"abvndjfklfljklluuillllldjdsfhdsfjhdskf2r73564385435934953475742742"        
%timeit py_write(s)
%timeit pa_write(s)
```

    934 µs ± 23.3 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)
    969 µs ± 88 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

```python
def py_reader():
    with open("./test_py_string.dat", "rb") as reader:
        reader.read()

def pa_reader1():
    with pa.OSFile("./test_pa_string.dat", "rb") as writer:
        writer.read()

def pa_reader2():
    with pa.memory_map("./test_pa_string.dat", "rb") as writer:
        buf = writer.read_buffer()  # writer.read()
        buf.to_pybytes()

%timeit py_reader()
%timeit pa_reader1()
%timeit pa_reader2()
```

    8.76 µs ± 24.3 ns per loop (mean ± std. dev. of 7 runs, 100000 loops each)
    5.73 µs ± 9.02 ns per loop (mean ± std. dev. of 7 runs, 100000 loops each)
    8.26 µs ± 28.8 ns per loop (mean ± std. dev. of 7 runs, 100000 loops each)


## pickle和arrow的对比

这儿有pickle，msgpack和pyarrow的对比测试：http://satoru.rocks/2018/08/fastest-way-to-serialize-array/


```python
import pickle

data = {
    i: np.random.randn(500, 500) for i in range(100)
}

buf = pa.serialize(data).to_buffer()
%timeit restored_data = pa.deserialize(buf)
```

    207 µs ± 1.78 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

```python
pickled = pickle.dumps(data)
%timeit unpickled_data = pickle.loads(pickled)
```

```python
56.6 ms ± 165 µs per loop (mean ± std. dev. of 7 runs, 10 loops each)
```

```python
from pyarrow.feather import write_feather, read_feather
import pandas as pd
import numpy as np

df = pd.DataFrame(data=np.random.randint(1, 100, (1000000, 4)), columns=list('abcd'))
```


```python
save_file = "./tmp_frame.feather"
%timeit write_feather(df, save_file)
%timeit df.to_pickle("./tmp_frame.pickle")
```

    200 ms ± 5.59 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)
    206 ms ± 7.8 ms per loop (mean ± std. dev. of 7 runs, 10 loops each)

```python
%timeit read_feather(save_file)
%timeit pd.read_pickle("./tmp_frame.pickle")
```

    4.72 ms ± 18.9 µs per loop (mean ± std. dev. of 7 runs, 100 loops each)
    12.4 ms ± 42.2 µs per loop (mean ± std. dev. of 7 runs, 100 loops each)