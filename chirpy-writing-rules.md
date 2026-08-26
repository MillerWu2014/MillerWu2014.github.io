# Chirpy 博客文章写作规则（供 Agent 参考）

> 依据：https://chirpy.cotes.page/posts/write-a-new-post/
> 用途：Agent 在本仓库中新增/编辑博客文章、插入图片时，严格遵循以下规则。

---

## 1. 文件命名与存放位置

- 新文章必须放在仓库根目录的 `_posts/` 目录下。
- 文件名格式固定为：`YYYY-MM-DD-标题.md`
  - `YYYY-MM-DD` 是文章的发布日期，必须和 Front Matter 里的 `date` 日期部分一致。
  - 标题部分建议用英文/拼音/短横线连接（如 `2024-05-01-hello-world.md`），也可以直接用中文标题，但要避免 `[ ] ( ) : ： 【】 / \ ? *` 等文件名不安全字符。
  - 扩展名只能是 `.md` 或 `.markdown`，不支持其他格式。
- 从 Chirpy v2.4.1 起，`_posts/` 下允许建子目录来组织文章（仅用于管理文件，不影响分类/标签这些站点功能）。

## 2. Front Matter（文章头部元数据）规则

每篇文章开头必须有用 `---` 包裹的 YAML Front Matter，字段如下：

```yaml
---
title: 文章标题
date: 2024-05-01 10:00:00 +0800   # 必须带时区偏移，如 +0800
categories: [大类, 小类]           # 最多两级，用列表格式
tags: [标签1, 标签2]               # 数量不限，建议全部小写；没有标签写 []
---
```

- **title**：文章标题。如果标题里含有 `[ ] : { }` 等特殊符号，必须用引号包起来，例如：
  `title: "[WWDC] 机器学习笔记"`
- **date**：
  - 必须写成 `YYYY-MM-DD HH:MM:SS +/-TTTT` 格式，时区偏移不能省略（如中国用 `+0800`）。
  - 日期部分要和文件名里的日期保持一致。
- **categories**：
  - 最多支持两级分类（一级+二级），写成数组，如 `[技术, 前端]`。
  - 超过两级只会取前两级，多余的会被忽略。
  - 只有一级分类时写 `[技术]` 即可。
- **tags**：
  - 数量没有上限，可以为空 `[]`。
  - 建议全部小写，风格统一。

其他可选字段（按需使用）：

| 字段 | 作用 | 示例 |
|---|---|---|
| `author` | 指定作者 | `author: MillerWu` |
| `description` | 文章摘要，会显示在标题下方和 SEO meta 里 | `description: 本文介绍...` |
| `pin: true` | 置顶到首页最上方 | `pin: true` |
| `math: true` | 启用数学公式渲染 | `math: true` |
| `mermaid: true` | 启用 Mermaid 图表渲染 | `mermaid: true` |
| `toc: false` | 关闭本文的目录侧栏（全局默认开启） | `toc: false` |
| `comments: false` | 关闭本文评论（全局默认跟随 `_config.yml`） | `comments: false` |
| `image` | 设置文章封面图（用于首页预览卡片等） | 见下方"封面图"示例 |
| `img_path` | 设置本文图片的公共路径前缀，简化正文里的图片路径写法 | `img_path: /assets/img/posts/2024-05-01-hello-world/` |

**不需要**手动加 `layout` 字段，Chirpy 已经默认所有文章用 `post` 布局。

## 3. 图片等媒体资源存放与引用规则

Chirpy 把图片、音频、视频统称为"媒体资源"，规则如下：

### 3.1 存放位置（推荐做法）

给每篇文章建一个独立的图片子目录，路径建议为：

```
assets/img/posts/<与文章同名的slug>/图片文件.png
```

例如文章是 `_posts/2024-05-01-hello-world.md`，对应图片放在：

```
assets/img/posts/2024-05-01-hello-world/xxx.png
```

### 3.2 引用方式

**方式一：写完整路径（不设置 img_path 时）**

```markdown
![图片描述](/assets/img/posts/2024-05-01-hello-world/xxx.png)
```

**方式二：用 img_path 简化（推荐，图片多的文章更省事）**

在 Front Matter 里加：
```yaml
img_path: /assets/img/posts/2024-05-01-hello-world/
```
正文里就只需要写文件名：
```markdown
![图片描述](xxx.png)
```

### 3.3 图片样式控制（可选）

紧跟在图片 Markdown 语法后面加花括号属性（kramdown 语法），可以控制尺寸/样式：

```markdown
![图片描述](xxx.png){: width="700" height="400" }
![图片描述](xxx.png){: .normal }
![图片描述](xxx.png){: .shadow }
![图片描述](xxx.png){: .left }
![图片描述](xxx.png){: .right }
```

- `.normal`：取消默认的阴影/圆角效果
- `.shadow`：加阴影效果
- `.left` / `.right`：图片靠左/靠右，文字环绕

### 3.4 封面图（image 字段）

如果要给文章设置一个首页预览用的封面图，在 Front Matter 里写：

```yaml
image:
  path: /assets/img/posts/2024-05-01-hello-world/cover.png
  alt: 封面图描述文字
```

## 4. 正文书写注意事项

- **代码块**：用标准 Markdown 三个反引号 + 语言名，如 ```python ... ``` ，会自动带行号和语法高亮。
  - **不要**使用 Jekyll 原生的 `{% highlight language %}` 语法，Chirpy 不支持。
- **摘要截断**：如果想控制首页文章列表里预览的字数/位置，可以在 `_config.yml` 里设置：
  ```yaml
  excerpt_separator: "<!--more-->"
  ```
  设置后，在正文中插入 `<!--more-->`，前面的内容会作为首页预览摘要。
- **数学公式 / Mermaid 图表**：需要先在该文章 Front Matter 里显式加 `math: true` 或 `mermaid: true` 才会渲染，默认关闭（避免所有文章都加载相关脚本，影响加载速度）。

## 5. Agent 新增一篇文章时的标准流程

1. 确定发布日期 `YYYY-MM-DD` 和标题。
2. 在 `_posts/` 下创建文件 `YYYY-MM-DD-标题.md`。
3. 按第 2 节规则填写 Front Matter（至少要有 `title`、`date`、`categories`、`tags`）。
4. 如果文章带图片：
   - 在 `assets/img/posts/YYYY-MM-DD-标题/` 下建目录，把图片放进去。
   - 正文里用第 3 节的方式引用（推荐配合 `img_path` 简化写法）。
5. 写正文内容（Markdown 标准语法即可，代码块用三个反引号）。
6. 提交并推送到仓库默认分支，触发 GitHub Actions 自动构建部署。
