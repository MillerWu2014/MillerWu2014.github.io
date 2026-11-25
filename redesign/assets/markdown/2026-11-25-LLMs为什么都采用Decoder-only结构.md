---
title: LLMs为什么都采用Decoder-only结构?
date: '2026-11-25'
series: LLM技术框架
article_type: 技术笔记
categories:
- LLM
tags:
- llm
- 模型架构
craft_block_id: 080F94AE-1BDA-438C-AF6D-ACF0543DD076
synced_at: '2026-11-25'
---

Encoder-Only 架构，也被称为单向架构，仅包含编码器部分。Encoder-Only 架构的核心思想是利用神经网络对输入文本进行编码，提取其特征和语义信息，并将编码结果传递给后续的处理模块。它主要适用于不需要生成序列的任务，只需要对输入进行编码和处理的单向任务场景，如文本分类、情感分析等。这种架构的代表是 BERT 相关的模型，例如 BERT、RoBERT 和 ALBERT 等。

## Decoder-Only结构

Decoder-Only 架构，也被称为生成式架构，仅包含解码器部分。Decoder-Only 架构还有一个重要特点是可以进行无监督预训练。在预训练阶段，模型通过大量的无标注数据学习语言的统计模式和语义信息。

## Encoder-Decoder架构

同时包含编码器和解码器部分。核心思想是利用编码器对输入序列进行编码，提取其特征和语义信息，并将编码结果传递给解码器，解码器根据编码结果生成相应的输出序列。

| 对比项 | Encoder-Only | Decoder-Only | Encoder-Decoder |
| --- | --- | --- | --- |
| 缺点 | 生成能力有限：不擅长自主生成文本或内容。 | 有限的理解能力：不擅长理解复杂的输入数据 | 相比单一架构，更复杂需要更多的计算资源。 |
| 优点 | 强大的理解能力：能够有效处理和理解输入数据。<br>适用性广泛：适用于多种分析型任务。 | 生成能力强：能够生成连贯、有创造性的文本。<br>灵活性：适用于各种生成型任务。 | 灵活强大：能够理解复杂输入并生成相关输出。<br>适用于复杂任务：如机器翻译、文本摘要等。 |
| 特点 | 专注于理解和编码输入，常用于分类、标注等任务 | 专注于从一系列输入生成或预测输出 | 结合了编码器和解码器的优点 |
| 代表模型 | Bert，GLM4 | LLaMA，GPTs，QWen等 | T5，ChatGLM等 |

> 从理论的角度讲，可以参考下面苏神的博客

[为什么现在的LLM都是Decoder-only的架构？ - 科学空间|Scientific Spaces](https://kexue.fm/archives/9529/comment-page-1#comments)
