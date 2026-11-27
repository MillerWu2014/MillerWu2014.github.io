import json
import hashlib
import re
from datetime import date
from html import escape
from html.parser import HTMLParser
from pathlib import Path
from string import Template
from urllib.parse import quote, unquote

import yaml
from markdown_it import MarkdownIt
from mdit_py_plugins.anchors import anchors_plugin
from mdit_py_plugins.dollarmath import dollarmath_plugin
from mdit_py_plugins.footnote import footnote_plugin
from mdit_py_plugins.tasklists import tasklists_plugin
from pygments import highlight
from pygments.formatters import HtmlFormatter
from pygments.lexers import get_lexer_by_name
from pygments.util import ClassNotFound


SITE = Path(__file__).resolve().parent
CONTENT = SITE / "content"
OUTPUT = SITE / "articles"
MARKDOWN_OUTPUT = SITE / "assets" / "markdown"
NAVIGATION = [
    ("HOME", "./"),
    ("CATEGORIES", "categories.html"),
    ("ARCHIVES", "archives.html"),
    ("TOPICS", "topics.html"),
    ("TAGS", "tags.html"),
    ("ABOUT", "about.html"),
]


def navigation(prefix="", active=""):
    links = []
    for label, target in NAVIGATION:
        current = ' aria-current="page"' if label == active else ""
        links.append(f'<a href="{prefix}{target}"{current}>{label}</a>')
    search = (
        f'<form class="nav-search" role="search" action="{prefix}./#writing" method="get">'
        '<span aria-hidden="true">⌕</span>'
        '<input id="search" type="search" name="q" placeholder="SEARCH…" '
        'aria-label="搜索文章" autocomplete="off">'
        '</form>'
    )
    return '<nav aria-label="主导航">' + "".join(links) + search + "</nav>"


def build_navigation():
    pages = {
        "index.html": "HOME", "tags.html": "TAGS", "categories.html": "CATEGORIES",
        "archives.html": "ARCHIVES", "topics.html": "TOPICS", "about.html": "ABOUT",
    }
    pages.update({path.name: "TOPICS" for path in SITE.glob("topic-*.html")})
    for filename, active in pages.items():
        path = SITE / filename
        html = path.read_text(encoding="utf-8")
        html = re.sub(r'<nav aria-label="主导航">.*?</nav>', navigation(active=active), html, flags=re.S)
        if not re.search(r'src="header\.js(?:\?|")', html):
            html = html.replace("</head>", '  <script src="header.js" defer></script>\n</head>')
        path.write_text(html, encoding="utf-8")


def version_page_assets():
    pages = [*SITE.glob("*.html"), *OUTPUT.glob("*.html")]
    for page in pages:
        def version(match):
            asset = (page.parent / unquote(match[2])).resolve()
            digest = hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
            return f"{match[1]}{match[2]}?v={digest}{match[3]}"

        html = re.sub(
            r'''((?:src|href)=["'])([^"'?:]+\.(?:css|js))(?:\?[^"']*)?(["'])''',
            version,
            page.read_text(encoding="utf-8"),
        )
        page.write_text(html, encoding="utf-8")


def build_topics(posts):
    topics = json.loads((SITE / "topics.json").read_text(encoding="utf-8"))
    template = Template((SITE / "topic.template").read_text(encoding="utf-8"))
    cards = []
    for topic in topics:
        members = [post for post in posts if post["series"] == topic["name"]]
        if not members:
            continue
        name = escape(topic["name"])
        description = escape(topic["description"])
        destination = f'topic-{topic["slug"]}.html'
        updated = max(post["date"] for post in members)
        by_title = {post["title"]: post for post in members}
        sections = []
        outline = []
        assigned = set()
        for index, group in enumerate(topic["groups"], start=1):
            selected = []
            for title in group["articles"]:
                if title not in by_title:
                    raise ValueError(f"Topic article unavailable: {title}")
                selected.append(by_title[title])
                assigned.add(title)
            sections.append((f"section-{index}", group["title"], group["description"], selected))
        remaining = [post for post in members if post["title"] not in assigned]
        if remaining:
            sections.append(("more", "更多文章", "", remaining))
        content = []
        for anchor, title, intro, selected in sections:
            outline.append(f'<a href="#{anchor}">{escape(title)}</a>')
            articles = []
            for post in selected:
                articles.append(
                    f'<a class="topic-article" href="{post["url"]}">'
                    f'<div class="topic-article-meta"><span>{escape(post["type"])}</span>'
                    f'<time datetime="{post["date"]}">{post["date"]}</time></div>'
                    f'<h3>{escape(post["title"])}</h3>'
                    f'<p>{escape(post["description"])}</p><span class="topic-read">阅读文章 →</span></a>'
                )
            content.append(
                f'<section class="topic-section" id="{anchor}"><h2>{escape(title)}</h2>'
                f'<p class="topic-section-intro">{escape(intro)}</p>'
                f'<div class="topic-articles">{"".join(articles)}</div></section>'
            )
        first = sections[0][3][0]
        header = (
            '<a class="topic-back" href="topics.html">← 全部专题</a>'
            f'<header class="topic-intro"><p class="topic-eyebrow">专题 · {len(members)} 篇文章</p>'
            f'<h1>{name}</h1><p>{description}</p>'
            f'<a class="jump" href="{first["url"]}">开始阅读 →</a></header>'
        )
        layout = (
            '<div class="topic-layout"><aside class="topic-outline"><h2>阅读路线</h2>'
            f'<nav aria-label="专题阅读路线">{"".join(outline)}</nav></aside>'
            f'<div>{"".join(content)}</div></div>'
        )
        (SITE / destination).write_text(template.substitute(
            title=name, navigation=navigation(active="TOPICS"), content=header + layout,
        ), encoding="utf-8")
        links = "".join(f'<span>{escape(group["title"])}</span>' for group in topic["groups"])
        cards.append(
            f'<article class="topic-cover"><div class="topic-cover-main">'
            f'<p class="topic-eyebrow">{len(members)} 篇文章 · 更新于 {updated}</p>'
            f'<h2><a href="{destination}">{name}</a></h2><p>{description}</p>'
            f'<a class="topic-enter" href="{destination}">进入专题</a>'
            f'</div><div class="topic-cover-path"><h3>阅读路线</h3>{links}</div></article>'
        )
    path = SITE / "topics.html"
    html = re.sub(r'<!-- topics:start -->.*?<!-- topics:end -->', lambda match:
                  '<!-- topics:start -->\n<div id="series">' +
                  ("".join(cards) or '<p class="empty-state">暂无专题文章。</p>') +
                  '</div>\n<!-- topics:end -->',
                  path.read_text(encoding="utf-8"), flags=re.S)
    path.write_text(html, encoding="utf-8")

class SummaryParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_paragraph = False
        self.paragraphs = []
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag == "p":
            self.in_paragraph = True
            self.parts = []

    def handle_data(self, data):
        if self.in_paragraph:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag == "p":
            text = re.sub(r"\s+", " ", "".join(self.parts)).strip()
            if text:
                self.paragraphs.append(text)
            self.in_paragraph = False


def render_math(content, options):
    delimiters = (r"\[", r"\]") if options["display_mode"] else (r"\(", r"\)")
    return delimiters[0] + escape(content) + delimiters[1]


def parenthesized_math(state, silent):
    """Preserve LaTeX inline delimiters before Markdown consumes escapes."""
    start = state.pos
    if not state.src.startswith(r"\(", start):
        return False
    end = state.src.find(r"\)", start + 2)
    while end != -1:
        backslashes = 0
        cursor = end - 1
        while cursor >= start + 2 and state.src[cursor] == "\\":
            backslashes += 1
            cursor -= 1
        if backslashes % 2 == 0:
            break
        end = state.src.find(r"\)", end + 2)
    if end == -1 or end >= state.posMax:
        return False
    if not silent:
        token = state.push("math_inline", "math", 0)
        token.content = state.src[start + 2:end]
        token.markup = r"\("
    state.pos = end + 2
    return True


def names(value):
    if isinstance(value, str):
        return value.split()
    return [str(name) for name in (value or [])]

def render_code(tokens, index, options, env):
    token = tokens[index]
    language = token.info.strip().split()[0] if token.info.strip() else "text"
    if language == "mermaid":
        return f'<pre><code class="language-mermaid">{escape(token.content)}</code></pre>\n'
    try:
        lexer = get_lexer_by_name(language, stripnl=False, ensurenl=False)
        content = highlight(token.content, lexer, HtmlFormatter(nowrap=True))
    except ClassNotFound:
        content = escape(token.content)
    label = escape(language)
    return (
        '<div class="code-block">'
        f'<div class="code-toolbar"><span>{label}</span>'
        '<button type="button" class="copy-code" aria-label="复制代码">复制</button></div>'
        f'<pre tabindex="0"><code class="language-{label}">{content}</code></pre></div>\n'
    )


def main():
    renderer = (
        MarkdownIt("commonmark", {"html": True})
        .enable(["table", "strikethrough"])
        .use(anchors_plugin, min_level=1, max_level=6)
        .use(footnote_plugin)
        .use(tasklists_plugin)
        .use(dollarmath_plugin, double_inline=True, renderer=render_math)
    )
    renderer.inline.ruler.before("escape", "parenthesized_math", parenthesized_math)
    renderer.renderer.rules["fence"] = render_code
    renderer.renderer.rules["code_block"] = render_code
    template = Template((SITE / "post.template").read_text(encoding="utf-8"))
    OUTPUT.mkdir(exist_ok=True)
    MARKDOWN_OUTPUT.mkdir(parents=True, exist_ok=True)
    posts = []
    contents = {}
    markdown_sources = {}
    article_links = {}
    article_types = json.loads((SITE / "article-types.json").read_text(encoding="utf-8"))
    type_by_title = {title: category for category, titles in article_types.items() for title in titles}
    for source in sorted(CONTENT.rglob("*.md")):
        _, metadata, markdown = source.read_text(encoding="utf-8-sig").split("---", 2)
        fields = yaml.safe_load(metadata)
        if fields.get("published") is False:
            continue
        title = str(fields["title"])
        series = str(fields.get("series") or "")
        article_type = fields.get("article_type") or ("专题" if series else type_by_title.get(title, "技术笔记"))
        if article_type not in article_types:
            raise ValueError(f"Unknown article_type in {source}: {article_type}")
        published = date.fromisoformat(str(fields["date"])[:10]).isoformat()
        filename = source.stem + ".html"
        legacy_slug = re.sub(r"^\d{4}-\d{2}-\d+-", "", source.stem)
        article_links[legacy_slug] = quote(filename)
        if any(post["url"] == "articles/" + quote(filename) for post in posts):
            raise ValueError(f"Duplicate post filename: {source}")
        content = renderer.render(markdown)
        summary = SummaryParser()
        summary.feed(content)
        description = str(fields.get("description") or next(
            (paragraph for paragraph in summary.paragraphs if len(paragraph) >= 25), ""
        ))
        content = re.sub(r'''((?:src|href|poster)=["'])/assets/''', r"\1../assets/", content)
        contents[filename] = content
        markdown_sources[filename] = source.name
        (MARKDOWN_OUTPUT / source.name).write_bytes(source.read_bytes())
        posts.append({
            "title": title,
            "type": article_type,
            "series": series,
            "description": description[:140] + ("…" if len(description) > 140 else ""),
            "date": published,
            "categories": names(fields.get("categories", fields.get("category"))),
            "tags": names(fields.get("tags")),
            "url": "articles/" + quote(filename),
        })
    posts.sort(key=lambda post: post["date"], reverse=True)
    for post in posts:
        groups = []
        for category in post["categories"]:
            links = []
            for related in posts:
                if category not in related["categories"]:
                    continue
                current = ' aria-current="page"' if related["url"] == post["url"] else ""
                filename = related["url"].removeprefix("articles/")
                links.append(
                    f'<a href="{filename}"{current}>{escape(related["title"])}</a>'
                )
            groups.append(f'<section><h2>{escape(category)}</h2>{"".join(links)}</section>')
        filename = unquote(post["url"].removeprefix("articles/"))
        content = re.sub(
            r'''(href=["'])/posts/([^"'?#]+?)/?(?=["'?#])''',
            lambda match: match[1] + article_links.get(
                unquote(match[2]).rstrip("/"), "/posts/" + match[2]
            ),
            contents[filename],
        )
        (OUTPUT / filename).write_text(
            template.substitute(
                title=escape(post["title"]), date=post["date"],
                content=content, category_navigation="".join(groups),
                navigation=navigation(prefix="../"),
                markdown_url="../assets/markdown/" + quote(markdown_sources[filename]),
                markdown_filename=escape(Path(markdown_sources[filename]).name, quote=True),
            ),
            encoding="utf-8",
        )
    (SITE / "posts-data.js").write_text(
        "window.BLOG_POSTS = " + json.dumps(posts, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    build_topics(posts)
    build_navigation()
    version_page_assets()
    print(f"Generated {len(posts)} articles")


if __name__ == "__main__":
    main()
