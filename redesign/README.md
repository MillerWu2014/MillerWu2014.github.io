# Miller Wu · 学习笔记

本目录是完整的静态博客模块，可以复制到独立目录或仓库，作为网站根目录部署。

## 目录

- `content/` 保存 Markdown 文章及 Front Matter，是新版的文章来源。
- `assets/img/` 保存文章图片。
- `assets/markdown/` 保存构建时导出的已发布文章源文件，供文章页复制和下载，包含 Front Matter。
- `articles/` 和 `posts-data.js` 是生成的文章页面和索引。
- `index.html`、`tags.html`、样式和脚本组成前端。
- `post.template` 是文章模板，`build.py` 是构建入口。

## 独立预览

进入模块目录运行：

```sh
cd redesign
python3 -m http.server 8000
```

打开 `http://127.0.0.1:8000/`。已生成的页面可以直接用于静态部署。

## 更新文章

使用 Python 3.9 或更新版本，在模块目录安装构建依赖并生成页面：

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python build.py
```

新增和修改文章请编辑 `content/`。Front Matter 使用 `title`、`date`、`categories` 和 `tags` 字段，设置 `published: false` 可排除文章。

`article_type` 可设为论文阅读、技术笔记、工程实践、知识体系、专题或随想。现有文章的初始类型维护在 `article-types.json`，新文章默认归入技术笔记，Front Matter 的设置优先。

专题文章增加 `series: Post-Training` 等专题名称，会显示在 TOPICS 页面。未显式指定 `article_type` 时，带 `series` 的文章自动归入专题。

专题入口和阅读路线维护在 `topics.json`。新增专题时设置名称、英文 slug、简介和分组文章标题，并在对应文章中设置相同的 `series`。构建会生成 `topic-<slug>.html` 及 TOPICS 页面中的专题入口。Agent 专题中的文章保留各自原有的文章类型。

全站导航由 `build.py` 中的 `NAVIGATION` 定义，构建时更新所有页面和文章的菜单。

图片放在 `assets/img/`，Markdown 中使用 `/assets/img/...`。构建时会转为文章页面相对路径，支持根目录和子目录部署。

## 部署和替换

当前 GitHub Actions 将本模块发布为网站根站点。推送到 `master` 或 `main` 后，会自动执行构建和导出，然后发布到 GitHub Pages。线上首页对应本模块的 `index.html`。

可在仓库根目录复现发布导出，输出目录需为空：

```sh
python redesign/build.py
python redesign/publish.py --output _site
python -m http.server 8001 --directory _site
```

打开 `http://127.0.0.1:8001/` 查看正式发布结构。导出只包含网站运行文件，源文档下载通过 `assets/markdown/` 提供。

将本目录作为静态网站根目录发布，保留 `articles/`、`assets/`、首页、标签页、`posts-data.js`、CSS 和 JavaScript。构建脚本、文章源文件和模板可留在源码仓库。

后续替换旧博客时，以本模块为网站根目录并执行上述构建命令。新版文章地址是 `articles/文件名.html`，旧站文章地址的跳转映射需在正式替换时配置。

正文、代码高亮、表格、脚注和任务列表在构建时生成。公式和 Mermaid 图表按需从 jsDelivr 加载，字体从 Google Fonts 加载。网络不可用时使用系统字体，公式和图表组件需要网络访问。
