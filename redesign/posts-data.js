window.BLOG_POSTS = [
  {
    "title": "必读的Agent相关研究",
    "type": "知识体系",
    "series": "Agent",
    "description": "自主 Agent / 上下文工程资料索引和个人的一些点评，基本以工程为主。学术界普遍集中在 Agent RL 上，这里不进行展开。",
    "date": "2025-07-27",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "paper"
    ],
    "url": "articles/2025-07-27-%E5%BF%85%E8%AF%BB%E7%9A%84Agent%E7%9B%B8%E5%85%B3%E7%A0%94%E7%A9%B6.html"
  },
  {
    "title": "AI Agents 初學者課程",
    "type": "知识体系",
    "series": "Agent",
    "description": "AI-Agents是系统，它通过赋予大型语言模型（LLMs）访问工具和知识的能力，扩展LLMs的功能，从而使其能够执行操作。",
    "date": "2025-07-17",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "tutorial",
      "microsoft"
    ],
    "url": "articles/2025-07-17-AI-Agents-%E5%88%9D%E5%AD%B8%E8%80%85%E8%AA%B2%E7%A8%8B.html"
  },
  {
    "title": "crewAI框架下关键的策略和模式设计",
    "type": "技术笔记",
    "series": "Agent",
    "description": "现在来讨论crewAI框架下crew策略下的Process未sequential模式时，一个Agent配置多个Task时，是如何识别使用哪一个Task?",
    "date": "2025-07-08",
    "categories": [
      "Agent"
    ],
    "tags": [
      "crewai",
      "agent",
      "process"
    ],
    "url": "articles/2025-07-08-crewAI%E6%A1%86%E6%9E%B6%E4%B8%8B%E5%85%B3%E9%94%AE%E7%9A%84%E7%AD%96%E7%95%A5%E5%92%8C%E6%A8%A1%E5%BC%8F%E8%AE%BE%E8%AE%A1.html"
  },
  {
    "title": "CrewAI的相关概念和框架",
    "type": "技术笔记",
    "series": "Agent",
    "description": "CrewAI是一个基于Python的、非常精简、非常快速的AI-Agent构建框架，与其他的智能体框架（如AutoGen, LangGraph等）完成独立。CrewAI赋予开发者高级别的简单性和精确的低级别控制，非常适合创建适用于任何场景的自主 AI 代理，主要包含了两种场景：",
    "date": "2025-07-01",
    "categories": [
      "Agent"
    ],
    "tags": [
      "crewai",
      "agent",
      "langfuse"
    ],
    "url": "articles/2025-07-01-CrewAI%E7%9A%84%E7%9B%B8%E5%85%B3%E6%A6%82%E5%BF%B5%E5%92%8C%E6%A1%86%E6%9E%B6.html"
  },
  {
    "title": "高手都在用的 Skill 2.0 架构指南（附完整步骤）",
    "type": "工程实践",
    "series": "Agent",
    "description": "在 Skills 越来越火热的当下，你或许会抱有以下的疑问：",
    "date": "2025-06-28",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "skills"
    ],
    "url": "articles/2025-06-28-%E9%AB%98%E6%89%8B%E9%83%BD%E5%9C%A8%E7%94%A8%E7%9A%84-Skill-2.0-%E6%9E%B6%E6%9E%84%E6%8C%87%E5%8D%97%E9%99%84%E5%AE%8C%E6%95%B4%E6%AD%A5%E9%AA%A4.html"
  },
  {
    "title": "Agent的Skills规范原理及应用",
    "type": "技术笔记",
    "series": "Agent",
    "description": "目前，Agent的能力扩展主要依赖Tools及山下文的管理，但是直接使用工具（Tools）的问题会存在诸多问题，如接口太多，LLM不知道用哪个（“我有几十个孪生体，每个孪生体暴露 10+ 接口”）。这样会直接导致Agent的Prompt变成了接口说明书，LLM出显调错 / 漏调 …",
    "date": "2025-06-20",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "skills"
    ],
    "url": "articles/2025-06-20-Agent%E7%9A%84Skills%E8%A7%84%E8%8C%83%E5%8E%9F%E7%90%86%E5%8F%8A%E5%BA%94%E7%94%A8.html"
  },
  {
    "title": "记忆(Memory)模块的深度解析",
    "type": "技术笔记",
    "series": "Agent",
    "description": "大语言模型在处理和生成文本方面表现出色，但它们在本质上是**无状态（stateless）**的。这意味着每次与LLM的交互都是独立的，模型本身不会“记住”过去的对话或经验。大模型在“记忆”上主要局限于：",
    "date": "2025-06-16",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "memory"
    ],
    "url": "articles/2025-06-16-%E8%AE%B0%E5%BF%86Memory%E6%A8%A1%E5%9D%97%E7%9A%84%E6%B7%B1%E5%BA%A6%E8%A7%A3%E6%9E%90.html"
  },
  {
    "title": "Agent：原理、架构与工程实践",
    "type": "知识体系",
    "series": "Agent",
    "description": "在写完「你不知道的 Claude Code：架构、治理与工程实践」之后，发现自己对 Agent 底层的理解还不够深入，加上团队在 Agent 方向已经有不少业务落地经验，一直缺少一份系统梳理，所以我又把资料、开源实现和自己写的代码一起过了一遍，最后整理成了这篇文章。",
    "date": "2025-06-13",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "architecture"
    ],
    "url": "articles/2025-06-13-Agent%E5%8E%9F%E7%90%86%E3%80%81%E6%9E%B6%E6%9E%84%E4%B8%8E%E5%B7%A5%E7%A8%8B%E5%AE%9E%E8%B7%B5.html"
  },
  {
    "title": "LLMs的Agent架构",
    "type": "技术笔记",
    "series": "Agent",
    "description": "reasoning traces help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface wit…",
    "date": "2025-06-06",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "llm",
      "react"
    ],
    "url": "articles/2025-06-06-LLMs%E7%9A%84Agent%E6%9E%B6%E6%9E%84.html"
  },
  {
    "title": "AI Agent（智能体）技术白皮书（Google，2024）",
    "type": "论文阅读",
    "series": "Agent",
    "description": "本文翻译自 2024 年 Google 团队的一份 Agents 白皮书， 作者 Julia Wiesinger, Patrick Marlow, Vladimir Vuskovic。Agent 可以理解为是一个扩展了大模型出厂能力的应用程序。工具的使用，是人类区别于动物的标志 …",
    "date": "2025-06-01",
    "categories": [
      "Agent"
    ],
    "tags": [
      "agent",
      "google"
    ],
    "url": "articles/2025-06-01-AI-Agent%E6%99%BA%E8%83%BD%E4%BD%93%E6%8A%80%E6%9C%AF%E7%99%BD%E7%9A%AE%E4%B9%A6Google%EF%BC%8C2024.html"
  },
  {
    "title": "Autoformer:基于序列分解结构Transformer和Auto-Correlation的长序列预测",
    "type": "论文阅读",
    "series": "",
    "description": "​ 长序列预测在实际应用中是非常多且重要的需求，例如极端天气预警、长期能源消耗规划，在这样的背景下，Autoformer主要是研究时间序列的长期预测问题。在Autoformer之前的长序列预测问题主要基于attention来解决序列的长期依赖性。然而，未来长期的、复杂的时间模式阻…",
    "date": "2021-10-16",
    "categories": [
      "deep learning"
    ],
    "tags": [
      "Transformer",
      "MTSF",
      "Attention",
      "Forecasting"
    ],
    "url": "articles/2021-10-16-Autoformer%E5%9F%BA%E4%BA%8E%E5%BA%8F%E5%88%97%E5%88%86%E8%A7%A3%E7%BB%93%E6%9E%84Transformer%E5%92%8CAuto-Correlation%E7%9A%84%E9%95%BF%E5%BA%8F%E5%88%97%E9%A2%84%E6%B5%8B.html"
  },
  {
    "title": "基于DNN的多维时间异常检测",
    "type": "论文阅读",
    "series": "",
    "description": "论文名称为，提出了一种多维时间序列异常检测的深度学习框架，首先提出了一种基于原始多维时间序列生成统计特征的方法，丰富原始时间序列的特征空间，然后利用AE重建特征空间丰富后的时间序列; 作者利用AE对丰富后的特征空间进行降维，基于低维度特征来重建序列, 则重建后的序列是捕捉到代表性…",
    "date": "2021-04-16",
    "categories": [
      "deep learning"
    ],
    "tags": [
      "CNN",
      "AE",
      "LSTM"
    ],
    "url": "articles/2021-04-16-%E5%9F%BA%E4%BA%8EDNN%E7%9A%84%E5%A4%9A%E7%BB%B4%E6%97%B6%E9%97%B4%E5%BC%82%E5%B8%B8%E6%A3%80%E6%B5%8B.html"
  },
  {
    "title": "智能陷进观后感",
    "type": "随想",
    "series": "",
    "description": "智能陷进是NetfFix推出的一步对于科技对人类负面影响的记录片，片中讲述的主要是社交网络或媒体对于人类的影响，影响包括多方面的：行为上，语言上，思想上，道德上等等。整个影片分2段进行，第一部分主要是对个人的影响，第二部分讲述对整个社会，国家及人类的影响。我对文中提到的一些点感到…",
    "date": "2020-10-24",
    "categories": [
      "电影"
    ],
    "tags": [
      "电影",
      "思考",
      "生活"
    ],
    "url": "articles/2020-10-24-%E6%99%BA%E8%83%BD%E9%99%B7%E8%BF%9B%E8%A7%82%E5%90%8E%E6%84%9F.html"
  },
  {
    "title": "Convolutional Pose Machines论文记录",
    "type": "论文阅读",
    "series": "",
    "description": "CPM模型的结构如下图所示。主要分为了不同的Stage。在stage1中，输入图片368×368，卷积层不改变feature maps的width和height，经三次 pooling 层，输出的feature maps大小46×46，共P+1个feature maps。stag…",
    "date": "2020-09-27",
    "categories": [
      "deep learning"
    ],
    "tags": [
      "deep-learning",
      "HPE",
      "CNN",
      "convolution"
    ],
    "url": "articles/2020-09-27-Convolutional-Pose-Machines%E8%AE%BA%E6%96%87%E8%AE%B0%E5%BD%95.html"
  },
  {
    "title": "MetNet网络对未来降雨量预测",
    "type": "论文阅读",
    "series": "",
    "description": "MetNet是Google提出的用于空间降雨量预测的模型，通过深度学习的方式对未来的降雨量进行预测，可以实现未来8小时的降雨量预测，而且每2分钟更新一次。而模型的最终效果好于传统的传统的方法。",
    "date": "2020-09-05",
    "categories": [
      "deeplearning"
    ],
    "tags": [
      "attention",
      "last",
      "deep-learning",
      "convLSTM",
      "gradient"
    ],
    "url": "articles/2020-09-05-MetNet%E7%BD%91%E7%BB%9C%E5%AF%B9%E6%9C%AA%E6%9D%A5%E9%99%8D%E9%9B%A8%E9%87%8F%E9%A2%84%E6%B5%8B.html"
  },
  {
    "title": "boosting系列之NGBoost算法详解",
    "type": "论文阅读",
    "series": "",
    "description": "去年末看过NGBoost的论文，由于时间原因没有仔细的去了解，现在终于可以花点时间来补一下NGBoost，NGBoost是斯坦福的研究团队提出的一种梯度提升方法，解决概率预测中的问题，在现实中预测问题带有很多不确定性，比如天气的预测，顾客流失率，信用等等。传统的机器学习一般是一个…",
    "date": "2020-06-11",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "boosting",
      "catboost",
      "probabilistic",
      "gradient"
    ],
    "url": "articles/2020-06-11-boosting%E7%B3%BB%E5%88%97%E4%B9%8BNGBoost%E7%AE%97%E6%B3%95%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "[WWDC]机器学习与产品设计笔记",
    "type": "随想",
    "series": "",
    "description": "机器学习的返回很广，包括语音识别的，计算机视觉的，自然语言处理的等等；特别是深度学习技术的进步。但是这些最终都要进行应用，与产品进行结合，以产品的形式提供给用户，与用户进行交互，这些都需要设计，且精心设计。",
    "date": "2020-05-28",
    "categories": [
      "思考"
    ],
    "tags": [
      "产品",
      "机器学习"
    ],
    "url": "articles/2020-05-28-WWDC%E6%9C%BA%E5%99%A8%E5%AD%A6%E4%B9%A0%E4%B8%8E%E4%BA%A7%E5%93%81%E8%AE%BE%E8%AE%A1%E7%AC%94%E8%AE%B0.html"
  },
  {
    "title": "Python3中的函数(方法)实现范型",
    "type": "技术笔记",
    "series": "",
    "description": "最近浏览python官方文档中的new feature中看到一些新的功能，其中有几个功能是非常棒的，在使用python时可能会经常使用。因此进行测试以及记录。其中就包括singledispatch，这个功能好比c++面向对象中，可以存在多个同名的方法，可以根据不同类型的参数自己选…",
    "date": "2020-04-29",
    "categories": [
      "Python"
    ],
    "tags": [
      "python3",
      "装饰器"
    ],
    "url": "articles/2020-04-29-Python3%E4%B8%AD%E7%9A%84%E5%87%BD%E6%95%B0%E6%96%B9%E6%B3%95%E5%AE%9E%E7%8E%B0%E8%8C%83%E5%9E%8B.html"
  },
  {
    "title": "改善(今井正明)读书笔记",
    "type": "随想",
    "series": "",
    "description": "改善（KaiZen）是世界著名的质量管理大师，改善思想之父今井正明的代表作，改善成为了一种文化，一种生活方式。它是积小成多，量变引起质变的一种体现。下面是整书的梳理并结合自己的思考梳理关于改善的思维导图：",
    "date": "2020-01-20",
    "categories": [
      "思考"
    ],
    "tags": [
      "note",
      "思考"
    ],
    "url": "articles/2020-01-20-%E6%94%B9%E5%96%84%E4%BB%8A%E4%BA%95%E6%AD%A3%E6%98%8E%E8%AF%BB%E4%B9%A6%E7%AC%94%E8%AE%B0.html"
  },
  {
    "title": "生命形态的思考",
    "type": "随想",
    "series": "",
    "description": "生命的定义在我们的意识中非常简单，生命是基于生物的，生物又必须依赖于生命的存在，从百科上主要解释为2点：1.生物生存，生物所具备活动，意识等的能力；2.指事物皆以生存的根本条件。如果从严格上来讲，目前的定较为官方的应该是下面的定义：",
    "date": "2019-10-21",
    "categories": [
      "思考"
    ],
    "tags": [
      "生命形态",
      "意识",
      "思考"
    ],
    "url": "articles/2019-10-21-%E7%94%9F%E5%91%BD%E5%BD%A2%E6%80%81%E7%9A%84%E6%80%9D%E8%80%83.html"
  },
  {
    "title": "boosting系列之CatBoost算法详解",
    "type": "论文阅读",
    "series": "",
    "description": "CatBoost是由俄罗斯的搜索公司Yandex提出的一类boosting集成学习算法，该算法主要是解决类别型特征的学习，可以直接对字符型类别特征进行处理和学习，使用非常简单，实用。因此算法名称也叫做CatBoost（categorical和boosting两者的结合）,该算法支…",
    "date": "2019-07-23",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "boosting",
      "target-statistics",
      "catboost",
      "categorical",
      "feature"
    ],
    "url": "articles/2019-07-23-boosting%E7%B3%BB%E5%88%97%E4%B9%8BCatBoost%E7%AE%97%E6%B3%95%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "boosting系列之LightGBM算法详解",
    "type": "论文阅读",
    "series": "",
    "description": "LightGBM是由微软团队基于xgboost的缺点新的实现，主要思想还是基于GBDT算法，在细节上进行了优化，在效率和精度方面都超过了xgboost的实现。并且支持分布式并行，包括特征并行，数据并行以及GPU并行计算。下面就对该算法的原理和细节进行详细说明。",
    "date": "2019-07-16",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "boosting",
      "gbdt",
      "lightgbm",
      "goss",
      "histogram"
    ],
    "url": "articles/2019-07-16-boosting%E7%B3%BB%E5%88%97%E4%B9%8BLightGBM%E7%AE%97%E6%B3%95%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "Python中实现多线程(真正的)的探索",
    "type": "工程实践",
    "series": "",
    "description": "使用Python多线程的人都知道，Python中由于GIL(全局解释锁：Global Interpreter Lock)的存在，在多线程时并没有真正的进行多线程计算。知道Python历史的就知道Python在1989年发布，当时计算机全是基于单核，知道2000多年多核处理器才发布…",
    "date": "2019-06-25",
    "categories": [
      "Python"
    ],
    "tags": [
      "c/c++",
      "thread",
      "pybind11"
    ],
    "url": "articles/2019-06-25-Python%E4%B8%AD%E5%AE%9E%E7%8E%B0%E5%A4%9A%E7%BA%BF%E7%A8%8B%E7%9C%9F%E6%AD%A3%E7%9A%84%E7%9A%84%E6%8E%A2%E7%B4%A2.html"
  },
  {
    "title": "基于轨迹的数据挖掘相关技术总结",
    "type": "知识体系",
    "series": "",
    "description": "之前项目中接触到了轨迹数据挖掘领域，始终都没有时间对轨迹数据挖掘进行整体的梳理和总结，现在抽几天时间来进行总结并进行记录。",
    "date": "2019-06-25",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "trajectory",
      "cluster",
      "partition",
      "spatial"
    ],
    "url": "articles/2019-06-25-%E5%9F%BA%E4%BA%8E%E8%BD%A8%E8%BF%B9%E7%9A%84%E6%95%B0%E6%8D%AE%E6%8C%96%E6%8E%98%E7%9B%B8%E5%85%B3%E6%8A%80%E6%9C%AF%E6%80%BB%E7%BB%93.html"
  },
  {
    "title": "多级网络优化的规划问题简化-Python预演",
    "type": "工程实践",
    "series": "",
    "description": "在物流网络中，经常存在需要优化的网络结构，比如从生产中心到一级仓库 ，到二级仓库再到配送中心，这样形成一个多级的分仓体系。在实际执行过程中会遇到DC层或TC层的选址问题，一般会遇到优化问题，优化的目标主要考虑多个方面的成本，如运输成本，仓库成本，转运成本等等。如果按照多级网络的模…",
    "date": "2019-04-11",
    "categories": [
      "思考"
    ],
    "tags": [
      "Python3",
      "思考"
    ],
    "url": "articles/2019-04-11-%E5%A4%9A%E7%BA%A7%E7%BD%91%E7%BB%9C%E4%BC%98%E5%8C%96%E7%9A%84%E8%A7%84%E5%88%92%E9%97%AE%E9%A2%98%E7%AE%80%E5%8C%96-Python%E9%A2%84%E6%BC%94.html"
  },
  {
    "title": "python中的元类编程详解",
    "type": "技术笔记",
    "series": "",
    "description": "我们知道Python 里一切都是对象，那么是对象就有对应的“类(Class)”，或称“类型(type)”。 Python 中可以用 type(obj) 来得到对象的“类”。既然一切都是对象，一个“类(class)”也可以认为是一个对象，那么类的“类型(type)”是什么呢？“类(…",
    "date": "2019-04-09",
    "categories": [
      "Python"
    ],
    "tags": [
      "metaclass",
      "python3",
      "元类"
    ],
    "url": "articles/2019-04-09-python%E4%B8%AD%E7%9A%84%E5%85%83%E7%B1%BB%E7%BC%96%E7%A8%8B%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "python下的c/c++扩展方式详解",
    "type": "技术笔记",
    "series": "",
    "description": "python作为一种胶水语言，最重要的是非常容易的和shell，c/c++之间进行相互扩展，而本文主要是对python的c/c++扩展进行详细讲解，并作为笔记便于以后的使用。",
    "date": "2019-04-01",
    "categories": [
      "Python"
    ],
    "tags": [
      "cython",
      "c/c++",
      "优化",
      "numpy",
      "compile"
    ],
    "url": "articles/2019-04-018-python%E4%B8%8B%E7%9A%84cc%2B%2B%E6%89%A9%E5%B1%95%E6%96%B9%E5%BC%8F%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "arrow的性能分析及在python中的使用",
    "type": "工程实践",
    "series": "",
    "description": "Apache Arrow 是 Apache 基金会全新孵化的一个顶级项目。它设计的目的在于作为一个跨平台的数据层，来加快大数据分析项目的运行速度。",
    "date": "2019-01-21",
    "categories": [
      "Python"
    ],
    "tags": [
      "arrow",
      "ray"
    ],
    "url": "articles/2019-01-21-arrow%E7%9A%84%E6%80%A7%E8%83%BD%E5%88%86%E6%9E%90%E5%8F%8A%E5%9C%A8python%E4%B8%AD%E7%9A%84%E4%BD%BF%E7%94%A8.html"
  },
  {
    "title": "KL散度,JS散度和wasserstein距离",
    "type": "技术笔记",
    "series": "",
    "description": "最初了解信息度量是通过熵的概念，比如信息增益，GINI等都是基于熵。而这三者也是基于信息熵，在信息论中主要对分布的相似度（距离的度量），但是三者差异性也是很强的；对这三种信息度量的方式进行详细的说明。",
    "date": "2018-11-24",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "GNN",
      "KL散度",
      "deep learning",
      "JS散度",
      "Wasserstein"
    ],
    "url": "articles/2018-11-24-KL%E6%95%A3%E5%BA%A6%2CJS%E6%95%A3%E5%BA%A6%E5%92%8Cwasserstein%E8%B7%9D%E7%A6%BB.html"
  },
  {
    "title": "深度学习-GAN网络详解及TensorFlow实现",
    "type": "技术笔记",
    "series": "",
    "description": "2014 年，Ian Goodfellow 及其蒙特利尔大学的同事引入了生成对抗网络（GAN）。这是一种学习数据的基本分布的全新方法，让生成出的人工对象可以和真实对象之间达到惊人的相似度。",
    "date": "2018-11-06",
    "categories": [
      "deep learning"
    ],
    "tags": [
      "GNN",
      "generator",
      "deep learning",
      "tensorflow",
      "discriminator"
    ],
    "url": "articles/2018-11-06-%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0-GAN%E7%BD%91%E7%BB%9C%E8%AF%A6%E8%A7%A3%E5%8F%8ATensorFlow%E5%AE%9E%E7%8E%B0.html"
  },
  {
    "title": "TensorFlow中的KeyPoint",
    "type": "技术笔记",
    "series": "",
    "description": "在TensorFlow中也会使用线程和队列，主要在模型开始训练时对数据的处理时，通过多线程来读取数据，一个线程来消费数据(模型训练)。在TensorFlow中的线程主要通过Coordinator和QueueRunner来进行配合管理，队列Queue主要有四种队列。",
    "date": "2018-10-26",
    "categories": [
      "tensorflow"
    ],
    "tags": [
      "tensorflow",
      "Queue",
      "Coordinator",
      "Dataset",
      "collection",
      "共享变量"
    ],
    "url": "articles/2018-10-26-TensorFlow%E4%B8%AD%E7%9A%84KeyPoint.html"
  },
  {
    "title": "深度学习-详解CNN网络和TensorFlow实现",
    "type": "技术笔记",
    "series": "",
    "description": "卷积神经网络（Convolutional Neural Network, CNN） 也是神经网络中的一种结构，主要针对图像，音频，视频等方面应用。卷积神经网络较早的架构是LeNet ，被认为是CNN的开端，当时主要将LeNet应用于字符识别任务，如手写数字的识别等。下面是一个Le…",
    "date": "2018-07-03",
    "categories": [
      "deep learning"
    ],
    "tags": [
      "CNN",
      "ReLU",
      "convolution",
      "deep learning",
      "tensorflow",
      "pooling",
      "BN"
    ],
    "url": "articles/2018-07-03-%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0-%E8%AF%A6%E8%A7%A3CNN%E7%BD%91%E7%BB%9C%E5%92%8CTensorFlow%E5%AE%9E%E7%8E%B0.html"
  },
  {
    "title": "深度学习-详解LSTM网络和TensorFlow实现",
    "type": "技术笔记",
    "series": "",
    "description": "LSTM网络是RNN网络中的特殊网络，再RNN文章中已经提到，RNN在时间步过长时，学习不到依赖关系。主要是RNN会引起梯度消失和梯度爆炸这两个问题，因此为了解决问题，研究者们提出了很多方式，其中GRU和LSTM网络就是这样诞生的。LSTM网络在应用中也取得了非凡的成就，特别是在…",
    "date": "2018-06-21",
    "categories": [
      "deep learning"
    ],
    "tags": [
      "RNN",
      "LSTM",
      "deep learning",
      "tensorflow",
      "gate"
    ],
    "url": "articles/2018-06-21-%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0-%E8%AF%A6%E8%A7%A3LSTM%E7%BD%91%E7%BB%9C%E5%92%8CTensorFlow%E5%AE%9E%E7%8E%B0.html"
  },
  {
    "title": "深度学习-详解RNN网络及TensorFlow实现",
    "type": "技术笔记",
    "series": "",
    "description": "RNN在维基上面有两种定义，但是一般默认的为时间递归神经网络，全称为(Recurrent Neural Network，简称为RNN)。RNN主要解决序列数据的处理，如文本，语音，视频等。典型应用在语言模型中，比如下面的示例：",
    "date": "2018-05-01",
    "categories": [
      "deep learning"
    ],
    "tags": [
      "RNN",
      "deep learning",
      "tensorflow",
      "SGD"
    ],
    "url": "articles/2018-05-01-%E6%B7%B1%E5%BA%A6%E5%AD%A6%E4%B9%A0-%E8%AF%A6%E8%A7%A3RNN%E7%BD%91%E7%BB%9C%E5%8F%8ATensorFlow%E5%AE%9E%E7%8E%B0.html"
  },
  {
    "title": "TensorBoard的使用教程",
    "type": "工程实践",
    "series": "",
    "description": "TensorFlow 可用于训练大规模深度神经网络所需的计算，使用该工具涉及的计算往往复杂而深奥。很多人也认为NN为一个黑盒，对训练过程种的很多东西不太了解。因此Google推出了基于TensorFlow的深度学习可视化工具TensorBoard 。您可以用 TensorBoar…",
    "date": "2018-04-26",
    "categories": [
      "tensorflow"
    ],
    "tags": [
      "tensorflow",
      "tensorboard"
    ],
    "url": "articles/2018-04-26-TensorBoard%E7%9A%84%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B.html"
  },
  {
    "title": "AWS上EC2主机(ubuntu)下对某个端口的开放",
    "type": "工程实践",
    "series": "",
    "description": "首先用telnet来看下本地的端口是否开启：telnet ip 7711，如果是正常的那么需要对该端口进行开放。首先需要对本地的防火墙端口进行开放。其他需要对AWS上的安全组进行设置，设置为对应的端口或所有端口开放权限。本文中不对AWS安全组的设置说明，自行google即可。",
    "date": "2018-04-18",
    "categories": [
      "linux"
    ],
    "tags": [
      "ubuntu"
    ],
    "url": "articles/2018-04-18-AWS%E4%B8%8AEC2%E4%B8%BB%E6%9C%BAubuntu%E4%B8%8B%E5%AF%B9%E6%9F%90%E4%B8%AA%E7%AB%AF%E5%8F%A3%E7%9A%84%E5%BC%80%E6%94%BE.html"
  },
  {
    "title": "python科学计算加速",
    "type": "工程实践",
    "series": "",
    "description": "使用GPU有两种方式：numba和pycuda，可以通过这两个package和python实现CUDA程序。",
    "date": "2018-04-14",
    "categories": [
      "Python"
    ],
    "tags": [
      "numba",
      "cython",
      "cuda"
    ],
    "url": "articles/2018-04-14-python%E7%A7%91%E5%AD%A6%E8%AE%A1%E7%AE%97%E5%8A%A0%E9%80%9F.html"
  },
  {
    "title": "Youth青春-塞缪尔·厄尔曼",
    "type": "随想",
    "series": "",
    "description": "青春不是年华，而是心境；青春不是桃面、红唇、柔膝，而是坚强的意志、恢宏的想象、炽热的感情；青春是生命深泉的自在涌流。",
    "date": "2018-01-22",
    "categories": [
      "诗歌"
    ],
    "tags": [
      "诗歌"
    ],
    "url": "articles/2018-01-22-Youth%E9%9D%92%E6%98%A5-%E5%A1%9E%E7%BC%AA%E5%B0%94%C2%B7%E5%8E%84%E5%B0%94%E6%9B%BC.html"
  },
  {
    "title": "使用python连接hive数据库并进行数据操作",
    "type": "工程实践",
    "series": "",
    "description": "在数据抽取或者数据存取过程中难免会遇到用其他语言对hive数据库进行操作。如python远程对hive数据库进行操作，需要通过thrift服务进行操作。本文的环境是python==3.6.1， hive==1.1.0，thfit==0.10.0",
    "date": "2017-10-13",
    "categories": [
      "Python"
    ],
    "tags": [
      "python",
      "hive",
      "thrift"
    ],
    "url": "articles/2017-10-13-%E4%BD%BF%E7%94%A8python%E8%BF%9E%E6%8E%A5hive%E6%95%B0%E6%8D%AE%E5%BA%93%E5%B9%B6%E8%BF%9B%E8%A1%8C%E6%95%B0%E6%8D%AE%E6%93%8D%E4%BD%9C.html"
  },
  {
    "title": "对pyc和pyo文件的理解",
    "type": "技术笔记",
    "series": "",
    "description": "作为Python爱好者，需要了解.py脚本的基本运行机制及特性：在很多工作上Python的运行流程基本上取决于用户，因此源码不需要编译成二进制代码(否则无法实现大部分贴近用户的特性)，而直接从源码运行程序。当我们运行python文件程序的时候，Python解释器将源码转换为字节码…",
    "date": "2017-10-10",
    "categories": [
      "Python"
    ],
    "tags": [
      "python",
      "compile"
    ],
    "url": "articles/2017-10-10-%E5%AF%B9pyc%E5%92%8Cpyo%E6%96%87%E4%BB%B6%E7%9A%84%E7%90%86%E8%A7%A3.html"
  },
  {
    "title": "基于MLE的logistic模型",
    "type": "技术笔记",
    "series": "",
    "description": "主要介绍逻辑回归（Logistic Regression）和最大似然估计。逻辑回归是机器学习算法中最常用的算法，用于分类，属于有监督学习。在有监督学习中，如果因变量为有限个离散值，则预测问题就转变成分类问题，从这个角度也可以说分类问题是预测问题的一个特例。此时，通过样本集训练获得…",
    "date": "2017-09-05",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "MLE",
      "logistic"
    ],
    "url": "articles/2017-09-05-%E5%9F%BA%E4%BA%8EMLE%E7%9A%84logistic%E6%A8%A1%E5%9E%8B.html"
  },
  {
    "title": "spark中job运行过程详解和job,stage,task解析",
    "type": "技术笔记",
    "series": "",
    "description": "了解了spark的基础后一直想清楚在spark整个执行过程。在spark客户端提交任务后，从job，stage，task，在到worker上执行，整过流程必须清楚，对后续的调优，spark中job运行原理都有很大的帮助。下面对spark中job运行过程进行详细解析，整个过程如下图…",
    "date": "2017-08-30",
    "categories": [
      "spark"
    ],
    "tags": [
      "spark",
      "stage",
      "job",
      "task"
    ],
    "url": "articles/2017-08-30-spark%E4%B8%ADjob%E8%BF%90%E8%A1%8C%E8%BF%87%E7%A8%8B%E8%AF%A6%E8%A7%A3%E5%92%8Cjob%2Cstage%2Ctask%E8%A7%A3%E6%9E%90.html"
  },
  {
    "title": "利用scikit-learn来分析模型欠拟合和过拟合问题",
    "type": "技术笔记",
    "series": "",
    "description": "当你运行一个学习算法时，如果这个算法的表现不理想，那么多半是出现两种情况：要么是偏差比较大、要么是方差比较大。换句话说，出现的情况要么是欠拟合、要么是过拟合问题。在建模的过程中经常会遇到模型拟合度不够或者过拟合，但是怎么去分析模型是否存在欠拟合和过拟合呢？一般通过模型的学习曲线和…",
    "date": "2017-08-15",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "scikit-learn",
      "overfit",
      "underfit"
    ],
    "url": "articles/2017-08-15-%E5%88%A9%E7%94%A8scikit-learn%E6%9D%A5%E5%88%86%E6%9E%90%E6%A8%A1%E5%9E%8B%E6%AC%A0%E6%8B%9F%E5%90%88%E5%92%8C%E8%BF%87%E6%8B%9F%E5%90%88%E9%97%AE%E9%A2%98.html"
  },
  {
    "title": "对梯度下降算法的思考",
    "type": "随想",
    "series": "",
    "description": "梯度下降算法是最优化理论中的最常用方法，目前在深度学习以及机器学习算法中广泛应用，主要为了求目标函数极值的最优解。其中原理很简单沿着目标函数梯度下降的方向搜索极小值。参数按照梯度更新的公式如下： \\[\\theta := \\theta - {\\alpha} \\cdot {\\nabl…",
    "date": "2017-08-13",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "SGD",
      "梯度下降"
    ],
    "url": "articles/2017-08-13-%E5%AF%B9%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E7%AE%97%E6%B3%95%E7%9A%84%E6%80%9D%E8%80%83.html"
  },
  {
    "title": "信息论中KL散度详解",
    "type": "技术笔记",
    "series": "",
    "description": "在信息论中，对信息的度量主要是通过香农熵，自信息等。而本文中的KL散度(Kullback-Leible散度)则是对信息之间的度量或者两个分布之间的距离的度量，又称为交叉熵，相对熵。",
    "date": "2017-07-26",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "KL散度",
      "机器学习",
      "距离"
    ],
    "url": "articles/2017-07-26-%E4%BF%A1%E6%81%AF%E8%AE%BA%E4%B8%ADKL%E6%95%A3%E5%BA%A6%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "spark中遇到的问题汇总",
    "type": "工程实践",
    "series": "",
    "description": "在编写spark程序是出现了org.apache.spark.SparkException: Task not serializable错误，由于在操作RDD算子map中使用到了类中定义的其他函数或者定义的其他变量，而引发的未序列化问题。在实际开发过程中难免会引用定义的其他函数或…",
    "date": "2017-07-24",
    "categories": [
      "spark"
    ],
    "tags": [
      "spark",
      "RDD"
    ],
    "url": "articles/2017-07-24-spark%E4%B8%AD%E9%81%87%E5%88%B0%E7%9A%84%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB.html"
  },
  {
    "title": "abc中的元类和six模块配合使用",
    "type": "技术笔记",
    "series": "",
    "description": "metaclass是类的类或者元类，秉承Python一切皆对象的理念，Python中的类也是一类对象，metaclass的实例就是类(class)，自己写metaclass时需要让其继承自type对象。关于metaclass的介绍，可以看python学习手册中的元类概念部分。 A…",
    "date": "2017-07-20",
    "categories": [
      "Python"
    ],
    "tags": [
      "six",
      "metaclass",
      "abc"
    ],
    "url": "articles/2017-07-20-abc%E4%B8%AD%E7%9A%84%E5%85%83%E7%B1%BB%E5%92%8Csix%E6%A8%A1%E5%9D%97%E9%85%8D%E5%90%88%E4%BD%BF%E7%94%A8.html"
  },
  {
    "title": "最优化-梯度下降算法",
    "type": "技术笔记",
    "series": "",
    "description": "梯度下降算法是最优化算法之一，在大量的机器学习算法和深度学习中都会被用到。优化是指当改变\\(x\\)以最小化或最大化某个函数\\(f(x)\\)，该函数一般为算法中的目标函数或损失函数，或者称为代价函数、误差函数等。在优化过程中需要通过导数\\(f'(x)\\)或\\(\\frac{dy}{d…",
    "date": "2017-07-14",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "优化",
      "梯度下降"
    ],
    "url": "articles/2017-07-14-%E6%9C%80%E4%BC%98%E5%8C%96-%E6%A2%AF%E5%BA%A6%E4%B8%8B%E9%99%8D%E7%AE%97%E6%B3%95.html"
  },
  {
    "title": "docker部署anaconda开发环境",
    "type": "工程实践",
    "series": "",
    "description": "由于在工作中使用docker部署一个科学计算的环境anaconda，如：docker run -d -p 50001:22 anaconda2:ssh /usr/sbin/sshd -D，可以简单的用脚本启动一个指定本地端口映射到容器22端口的一个容器环境，特别是在生成多个容器时…",
    "date": "2017-07-09",
    "categories": [
      "Python"
    ],
    "tags": [
      "docker",
      "anaconda"
    ],
    "url": "articles/2017-07-09-docker%E9%83%A8%E7%BD%B2anaconda%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83.html"
  },
  {
    "title": "jupyter-notebook远程登陆配置以及spark多语言环境配置",
    "type": "工程实践",
    "series": "",
    "description": "jupyter notebook是一个基于浏览器的python数据分析工具，使用起来非常方便，具有极强的交互方式和富文本的展示效果。jupyter是它的升级版，它的安装也非常方便，一般Anaconda安装包中会自带。安装好以后直接输入jupyter notebook便可以在浏览器…",
    "date": "2017-07-09",
    "categories": [
      "Python"
    ],
    "tags": [
      "jupyter",
      "spark"
    ],
    "url": "articles/2017-07-09-jupyter-notebook%E8%BF%9C%E7%A8%8B%E7%99%BB%E9%99%86%E9%85%8D%E7%BD%AE%E4%BB%A5%E5%8F%8Aspark%E5%A4%9A%E8%AF%AD%E8%A8%80%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE.html"
  },
  {
    "title": "numba加速python程序运行",
    "type": "工程实践",
    "series": "",
    "description": "python作为一个动态语言，在运行效率上为一大缺陷，但是作为一门成熟的语言，有很多方式可以提高python的运行效率，如:cpython, pypy,numba,LLVMPy。个人主要用户python处理数据和写一些数据挖掘方面的算法，因此使用numba较为方便。因此对numb…",
    "date": "2017-07-09",
    "categories": [
      "Python"
    ],
    "tags": [
      "numba",
      "numpy"
    ],
    "url": "articles/2017-07-09-numba%E5%8A%A0%E9%80%9Fpython%E7%A8%8B%E5%BA%8F%E8%BF%90%E8%A1%8C.html"
  },
  {
    "title": "spark中创建RDD的几种方式",
    "type": "技术笔记",
    "series": "",
    "description": "创建RDD主要有三种方式：从外部数据创建RDD，从另外一个RDD创建，对现有的数据列表或者数据集合进行创建。三种方式均能够创建RDD对象。RDD可以包含Scala，Python，Java的任意类型的对象，因此任何数据均可以创建RDD。spark创建RDD时首先需要通过SpakCo…",
    "date": "2017-07-09",
    "categories": [
      "spark"
    ],
    "tags": [
      "spark",
      "RDD"
    ],
    "url": "articles/2017-07-09-spark%E4%B8%AD%E5%88%9B%E5%BB%BARDD%E7%9A%84%E5%87%A0%E7%A7%8D%E6%96%B9%E5%BC%8F.html"
  },
  {
    "title": "蝙蝠侠前传黑暗骑士观后感",
    "type": "随想",
    "series": "",
    "description": "对《蝙蝠侠：黑暗骑士》这部电影是百看不厌，这部电影在当时也是获得了相当高的评价，从这部电影标题就具有两面性，若从布鲁斯韦恩的角度看，黑暗骑士是具有褒义，而从丹特的角度则最终反映了人内容的黑暗面。电影中布鲁斯·韦恩，哈维·丹特，小丑，吉姆·戈登这几个主要的人物，各自将自己的角色演的…",
    "date": "2017-07-09",
    "categories": [
      "思考"
    ],
    "tags": [
      "电影"
    ],
    "url": "articles/2017-07-09-%E8%9D%99%E8%9D%A0%E4%BE%A0%E5%89%8D%E4%BC%A0%E9%BB%91%E6%9A%97%E9%AA%91%E5%A3%AB%E8%A7%82%E5%90%8E%E6%84%9F.html"
  },
  {
    "title": "使用spark读取mysql数据库数据转化为dataframe",
    "type": "工程实践",
    "series": "",
    "description": "使用spark中的接口连接mysql数据库并读取并查询出数据库中的数据并转化为spark中的dataframe格式的RDD。其中实现了两种方式查询数据，一种单表查询和另外一种的多表关联查询数据。其中使用的方式在下面代码的main函数中。",
    "date": "2017-07-08",
    "categories": [
      "spark"
    ],
    "tags": [
      "spark",
      "RDD"
    ],
    "url": "articles/2017-07-08-%E4%BD%BF%E7%94%A8spark%E8%AF%BB%E5%8F%96mysql%E6%95%B0%E6%8D%AE%E5%BA%93%E6%95%B0%E6%8D%AE%E8%BD%AC%E5%8C%96%E4%B8%BAdataframe.html"
  },
  {
    "title": "特征可视化和特征降维算法T-SNE模型详解",
    "type": "技术笔记",
    "series": "",
    "description": "T-SNE(t-distributed stochastic neighbor embedding)是用于降维的一种机器学习算法，是由 Laurens van der Maaten 和 Geoffrey Hinton在08年提出来。此外，t-SNE 是一种非线性降维算法，非常适用…",
    "date": "2017-07-06",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "特征过程",
      "降维"
    ],
    "url": "articles/2017-07-06-%E7%89%B9%E5%BE%81%E5%8F%AF%E8%A7%86%E5%8C%96%E5%92%8C%E7%89%B9%E5%BE%81%E9%99%8D%E7%BB%B4%E7%AE%97%E6%B3%95T-SNE%E6%A8%A1%E5%9E%8B%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "spark算子aggregate,fold,lookup详解",
    "type": "技术笔记",
    "series": "",
    "description": "定义如下： def aggregate[U](zeroValue: U)(seqOp: (U, T) ⇒ U, combOp: (U, U) ⇒ U)(implicit arg0: ClassTag[U]): U aggregate用户聚合RDD中的元素，先使用seqOp将RDD…",
    "date": "2017-07-03",
    "categories": [
      "spark"
    ],
    "tags": [
      "spark"
    ],
    "url": "articles/2017-07-03-spark%E7%AE%97%E5%AD%90aggregate%2Cfold%2Clookup%E8%AF%A6%E8%A7%A3.html"
  },
  {
    "title": "用spark对时间数据进行分组求平均值",
    "type": "工程实践",
    "series": "",
    "description": "数据格式为key,timestrap,value。需求是按照key并对timestrap固定时间间隔计算，再将key和时间间隔作为key进行分组统计value的均值。其中利用了spark的gourpbykey操作，并对时间进行了转换。实现过程如下：",
    "date": "2017-07-03",
    "categories": [
      "spark"
    ],
    "tags": [
      "spark",
      "大数据"
    ],
    "url": "articles/2017-07-03-%E7%94%A8spark%E5%AF%B9%E6%97%B6%E9%97%B4%E6%95%B0%E6%8D%AE%E8%BF%9B%E8%A1%8C%E5%88%86%E7%BB%84%E6%B1%82%E5%B9%B3%E5%9D%87%E5%80%BC.html"
  },
  {
    "title": "Bootstrap,Boosting,Bagging,Randforest几种方法介绍",
    "type": "技术笔记",
    "series": "",
    "description": "这两天在看关于boosting算法时，看到一篇不错的文章讲bootstrap, jackknife, bagging, boosting, random forest都有介绍，以下是搜索得到的原文，没找到博客作者的地址，在这里致谢作者的研究。 一并列出一些找到的介绍boostin…",
    "date": "2017-06-12",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "bagging",
      "boosting",
      "randomforest"
    ],
    "url": "articles/2017-06-12-Bootstrap%2CBoosting%2CBagging%2CRandforest%E5%87%A0%E7%A7%8D%E6%96%B9%E6%B3%95%E4%BB%8B%E7%BB%8D.html"
  },
  {
    "title": "信息增益筛选变量和python实现",
    "type": "工程实践",
    "series": "",
    "description": "在了解信息增益之前需要清楚信息熵的定义，熵起源于物理学，后来被香农引入信息论中。熵是信息论中对信息量的一个衡量值，指接收的每条消息中包含的信息的平均量。这里的消息代表了样本，特征。熵意义可以解释为不确定性的度量，特征的随机性或者混乱程度越大那么熵值越大。因此熵被量化特征包含信息量…",
    "date": "2017-06-12",
    "categories": [
      "机器学习"
    ],
    "tags": [
      "python",
      "特征选择"
    ],
    "url": "articles/2017-06-12-%E4%BF%A1%E6%81%AF%E5%A2%9E%E7%9B%8A%E7%AD%9B%E9%80%89%E5%8F%98%E9%87%8F%E5%92%8Cpython%E5%AE%9E%E7%8E%B0.html"
  },
  {
    "title": "nohup命令及其输出文件",
    "type": "技术笔记",
    "series": "",
    "description": "今天在linux上部署wdt程序，在SSH客户端执行./start-dishi.sh,启动成功,在关闭SSH客户端后，运行的程序也同时终止了，怎样才能保证在推出SSH客户端后程序能一直执行呢？通过网上查找资料，发现需要使用nohup命令。",
    "date": "2017-06-06",
    "categories": [
      "Python"
    ],
    "tags": [
      "shell"
    ],
    "url": "articles/2017-06-06-nohup%E5%91%BD%E4%BB%A4%E5%8F%8A%E5%85%B6%E8%BE%93%E5%87%BA%E6%96%87%E4%BB%B6.html"
  },
  {
    "title": "魔法方法__getattr__和__getattribute__的详解",
    "type": "技术笔记",
    "series": "",
    "description": "python在属性访问上定义了__getattr__() 和 __getattribute__()两种方法。区别是很小，但是必须了解他们之间的区别，否则在使用的过程中会导致严重的后果。首先看这两个方法的定义：",
    "date": "2017-06-06",
    "categories": [
      "Python"
    ],
    "tags": [
      "python"
    ],
    "url": "articles/2017-06-06-%E9%AD%94%E6%B3%95%E6%96%B9%E6%B3%95__getattr__%E5%92%8C__getattribute__%E7%9A%84%E8%AF%A6%E8%A7%A3.html"
  }
];
