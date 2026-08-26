#!/usr/bin/env python3
"""
把 Hexo/NoteBook 源目录里的图片拷到 Chirpy 的 assets/img/posts/<slug>/，
并修正 _posts 里已经写坏的路径（Windows 反斜杠、残留的 uploads 前缀）。

用法:
    python tools/sync_post_images.py <hexo文章目录>
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from hexo_to_jekyll import copy_and_rewrite_images

POST_NAME_RE = re.compile(r'^(\d{4}-\d{2}-\d{2})-(.+)\.md$')
ROOT = Path(__file__).resolve().parent.parent


def slug_from_post(path: Path):
    if path.name.count('.md') > 1:
        return None
    m = POST_NAME_RE.match(path.name)
    return m.group(2) if m else None


def main():
    if len(sys.argv) < 2:
        print('用法: python tools/sync_post_images.py <hexo文章目录>')
        sys.exit(1)

    notebook = Path(sys.argv[1]).expanduser().resolve()
    posts_dir = ROOT / '_posts'
    assets_out = ROOT / 'assets' / 'img' / 'posts'
    search_roots = [notebook / 'uploads', notebook / 'assets', notebook]

    md_files = sorted(posts_dir.glob('*.md'))
    print(f'同步 {len(md_files)} 篇文章的图片 -> {assets_out}\n')
    for md_path in md_files:
        slug = slug_from_post(md_path)
        if not slug:
            print(f'[跳过] 非标准文件名: {md_path.name}')
            continue
        text = md_path.read_text(encoding='utf-8')
        new_text = copy_and_rewrite_images(text, md_path, slug, assets_out, search_roots)
        if new_text != text:
            md_path.write_text(new_text, encoding='utf-8')
        print(f'[完成] {md_path.name}')


if __name__ == '__main__':
    main()
