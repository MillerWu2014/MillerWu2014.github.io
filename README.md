# Miller Wu · Blog

博客源码维护在 `redesign/`，由 Python 构建为静态页面并通过 GitHub Pages 发布。

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 8000 --directory redesign
```

打开 http://127.0.0.1:8000/。

## 更新文章

- 文章源文件位于 `redesign/content/`。
- 图片位于 `redesign/assets/img/`。
- 专题配置位于 `redesign/topics.json`。
- 文章初始分类位于 `redesign/article-types.json`，文章 Front Matter 中的 `article_type` 优先。

安装依赖并重新生成页面：

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r redesign/requirements.txt
python redesign/build.py
```

## 发布

推送至 `master` 或 `main` 后，GitHub Actions 自动构建并将新版发布到网站根目录。

也可导出静态站点用于本地检查，输出目录需为空：

```sh
python redesign/publish.py --output _site
python -m http.server 8001 --directory _site
```

详细说明见 [新版博客说明](redesign/README.md)。旧版源码可从 Git 历史中查看。
