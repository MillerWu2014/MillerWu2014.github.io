#!/usr/bin/env python3
"""
Hexo -> Jekyll(Chirpy) 文章批量迁移脚本

用法:
    python hexo_to_jekyll.py <hexo文章目录> <jekyll输出目录_posts> [--tz +0800] [--assets-out <图片输出目录>]

功能:
1. 解析 Hexo 文章的 front matter (title/date/tags/categories)
2. categories 统一转成列表，最多保留两级(Chirpy 限制)
3. date 补上时区，变成 Jekyll/Chirpy 要求的格式
4. 按 "YYYY-MM-DD-标题.md" 重新生成文件名（Jekyll 强制要求）
5. 从同名目录、uploads/、assets/ 查找本地图片，拷贝到 assets/img/posts/<slug>/
   并重写正文引用（支持 Markdown ![]()、HTML <img src="">，以及 Windows 反斜杠路径）
6. <!--more--> 摘要分隔符保持不变（Jekyll 原生支持，只需在 _config.yml 里加一行配置，见脚本末尾说明）
"""
import re
import sys
import argparse
from pathlib import Path
import yaml

FRONT_MATTER_RE = re.compile(r'^---\s*\n(.*?)\n---\s*\n(.*)$', re.DOTALL)


def sanitize_front_matter(fm_raw: str) -> str:
    """
    Hexo 的 front matter 解析器(js-yaml)比较宽松，允许 title 之类的值里
    包含 [ ] : 等特殊字符而不加引号；标准 YAML(PyYAML) 会把它们误判为
    flow 语法导致解析失败。这里对未加引号、且以 [ { 开头或包含未转义
    冒号的 title/description 行做兜底加引号处理。
    """
    lines = fm_raw.split('\n')
    fixed = []
    for line in lines:
        m = re.match(r'^(title|description)\s*:\s*(.+)$', line)
        if m:
            key, val = m.group(1), m.group(2).strip()
            already_quoted = (val.startswith('"') and val.endswith('"')) or \
                              (val.startswith("'") and val.endswith("'"))
            if not already_quoted:
                val_escaped = val.replace('"', '\\"')
                line = f'{key}: "{val_escaped}"'
        fixed.append(line)
    return '\n'.join(fixed)


def slugify(title: str) -> str:
    """生成用于文件名/图片目录的安全字符串，保留中文，去掉文件系统/URL不安全字符"""
    s = title.strip()
    s = re.sub(r'[\[\]\(\)（）【】:：/\\?？*"<>|]', '', s)
    s = re.sub(r'\s+', '-', s)
    return s or "untitled"


def convert_categories(cats):
    if cats is None:
        return []
    if isinstance(cats, str):
        return [cats]
    if isinstance(cats, list):
        if len(cats) > 2:
            print(f"  [提示] categories 超过两级，Chirpy 只取前两级: {cats} -> {cats[:2]}")
        return cats[:2]
    return [str(cats)]


def convert_tags(tags):
    if tags is None:
        return []
    if isinstance(tags, str):
        return [tags]
    return list(tags)


def format_date(date_val, tz):
    s = str(date_val)
    if re.search(r'[+-]\d{4}$', s):
        return s
    return f"{s} {tz}"


def is_remote_src(src: str) -> bool:
    s = src.strip().lower()
    return s.startswith(('http://', 'https://', '//', 'data:', 'mailto:'))


def normalize_src(src: str) -> str:
    return src.strip().replace('\\', '/')


def image_basename(src: str) -> str:
    return Path(normalize_src(src)).name


def dest_filename(src: str) -> str:
    """Filesystem-safe name: keep CJK, drop spaces that break HTML-Proofer."""
    return image_basename(src).replace(' ', '_')


def _replace_balanced_md_images(text: str, replacer):
    """Rewrite ![alt](url), allowing parentheses in the filename."""
    out = []
    i = 0
    for m in re.finditer(r'!\[([^\]]*)\]\(', text):
        out.append(text[i:m.end()])
        start = m.end()
        depth = 1
        j = start
        while j < len(text) and depth:
            if text[j] == '(':
                depth += 1
            elif text[j] == ')':
                depth -= 1
            j += 1
        url = text[start:j - 1]
        out.append(replacer(url))
        out.append(')')
        i = j
    out.append(text[i:])
    return ''.join(out)


def rewrite_image_urls(text: str, replacer):
    def html_repl(match):
        prefix, quote, src = match.group(1), match.group(2), match.group(3)
        return f'<img{prefix}src={quote}{replacer(src)}{quote}'

    text = re.sub(
        r'<img([^>]*?)src=(["\'])([^"\']+)\2',
        html_repl,
        text,
        flags=re.IGNORECASE,
    )
    return _replace_balanced_md_images(text, replacer)


def iter_local_image_srcs(text: str):
    srcs = []

    def collect(src):
        if src and not is_remote_src(src):
            srcs.append(src)
        return src

    rewrite_image_urls(text, collect)
    return srcs


def find_source_image(basename: str, md_path: Path, search_roots):
    roots = [md_path.parent / md_path.stem, *search_roots, md_path.parent]
    seen = set()
    for root in roots:
        if root is None or not root.exists() or not root.is_dir():
            continue
        key = str(root.resolve())
        if key in seen:
            continue
        seen.add(key)
        direct = root / basename
        if direct.is_file():
            return direct
        target = basename.lower()
        for f in root.iterdir():
            if f.is_file() and f.name.lower() == target:
                return f
    return None


IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'}


def copy_and_rewrite_images(body: str, md_path: Path, slug: str, assets_out_root: Path, search_roots):
    """Copy local images into assets/img/posts/<slug>/ and point the body at them."""

    def dest_url(src: str) -> str:
        if is_remote_src(src):
            return src
        return f"/assets/img/posts/{slug}/{dest_filename(src)}"

    copied = 0
    missing = []
    target_dir = assets_out_root / slug
    seen_names = set()
    for src in iter_local_image_srcs(body):
        original_name = image_basename(src)
        fname = dest_filename(src)
        if not fname or fname in seen_names or Path(fname).suffix.lower() not in IMAGE_EXTS:
            continue
        seen_names.add(fname)
        src_file = find_source_image(original_name, md_path, search_roots) or find_source_image(
            fname, md_path, search_roots
        )
        if src_file is None:
            missing.append(fname)
            continue
        target_dir.mkdir(parents=True, exist_ok=True)
        (target_dir / fname).write_bytes(src_file.read_bytes())
        copied += 1

    if target_dir.is_dir():
        for extra in target_dir.iterdir():
            if extra.is_file() and extra.name not in seen_names:
                extra.unlink()
        if not any(target_dir.iterdir()):
            target_dir.rmdir()

    if copied:
        print(f"  [图片] 拷贝了 {copied} 张图片到 {target_dir}")
    for fname in missing:
        print(f"  [提示] 未找到本地图片 {fname}，需手动放到 {target_dir}")

    return rewrite_image_urls(body, dest_url)


def process_file(md_path: Path, out_dir: Path, assets_out_root: Path, tz: str):
    text = md_path.read_text(encoding='utf-8')
    m = FRONT_MATTER_RE.match(text)
    if not m:
        print(f"[跳过] 未找到 front matter: {md_path.name}")
        return

    fm_raw, body = m.group(1), m.group(2)
    fm = yaml.safe_load(sanitize_front_matter(fm_raw)) or {}

    title = fm.get('title', md_path.stem)
    date_val = fm.get('date')
    if date_val is None:
        print(f"[跳过] 缺少 date 字段: {md_path.name}")
        return

    date_str = format_date(date_val, tz)
    date_only = str(date_val).split(' ')[0]
    slug = slugify(str(title))

    new_fm = {
        'title': title,
        'date': date_str,
        'categories': convert_categories(fm.get('categories')),
        'tags': convert_tags(fm.get('tags')),
    }

    search_roots = [
        md_path.parent / 'uploads',
        md_path.parent / 'assets',
        md_path.parent,
    ]
    new_body = copy_and_rewrite_images(body, md_path, slug, assets_out_root, search_roots)

    fm_yaml = yaml.dump(new_fm, allow_unicode=True, sort_keys=False, default_flow_style=False)
    out_text = f"---\n{fm_yaml}---\n{new_body}"

    new_filename = f"{date_only}-{slug}.md"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / new_filename).write_text(out_text, encoding='utf-8')
    print(f"[完成] {md_path.name}  ->  {new_filename}")


def main():
    parser = argparse.ArgumentParser(description="Hexo -> Jekyll(Chirpy) 文章批量迁移")
    parser.add_argument('input_dir', help='Hexo 的 source/_posts 目录')
    parser.add_argument('output_dir', help='Jekyll 仓库的 _posts 目录')
    parser.add_argument('--tz', default='+0800', help='时区偏移，默认 +0800')
    parser.add_argument('--assets-out', default=None,
                         help='图片输出根目录，默认 <output_dir>/../assets/img/posts')
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    assets_out = Path(args.assets_out) if args.assets_out else output_dir.parent / 'assets' / 'img' / 'posts'

    md_files = sorted(input_dir.glob('*.md'))
    if not md_files:
        print(f"未在 {input_dir} 找到 .md 文件")
        sys.exit(1)

    print(f"共找到 {len(md_files)} 篇文章，开始转换...\n")
    for md_file in md_files:
        process_file(md_file, output_dir, assets_out, args.tz)

    print("\n全部完成。别忘了在 _config.yml 中加一行，让 <!--more--> 摘要分隔符继续生效：")
    print('    excerpt_separator: "<!--more-->"')


if __name__ == '__main__':
    # input_dir = "/Users/miller/Library/CloudStorage/OneDrive-个人/NoteBook"
    # output_dir = "/Users/miller/Workspace/MillerWu2014.github.io/_posts"
    main()
