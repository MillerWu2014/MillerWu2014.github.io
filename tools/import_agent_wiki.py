#!/usr/bin/env python3
"""Split Agent Wiki notes into Chirpy posts and copy images."""
from __future__ import annotations

import re
import shutil
import sys
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import unquote

sys.path.insert(0, str(Path(__file__).resolve().parent))
from hexo_to_jekyll import dest_filename, is_remote_src, rewrite_image_urls, slugify

WIKI_ROOT = Path("/Users/miller/Downloads/Agent Wiki ")
SITE_ROOT = Path(__file__).resolve().parent.parent
POSTS_DIR = SITE_ROOT / "_posts" / "Agent"
ASSETS_ROOT = SITE_ROOT / "assets" / "img" / "posts"

WIKI_SPLITS = [
    "CrewAI的相关概念和框架",
    "crewAI框架下关键的策略和模式设计",
    "AI Agents 初學者課程",
    "必读的Agent相关研究",
    "高手都在用的 Skill 2.0 架构指南（附完整步骤）",
    "记忆(Memory)模块的深度解析",
]

STANDALONE = [
    "Agent：原理、架构与工程实践.md",
    "Agent的Skills规范原理及应用.md",
    "AI Agent（智能体）技术白皮书（Google，2024）.md",
    "LLMs的Agent架构.md",
]

TAGS = {
    "CrewAI的相关概念和框架": ["crewai", "agent", "langfuse"],
    "crewAI框架下关键的策略和模式设计": ["crewai", "agent", "process"],
    "AI Agents 初學者課程": ["agent", "tutorial", "microsoft"],
    "必读的Agent相关研究": ["agent", "paper"],
    "高手都在用的 Skill 2.0 架构指南（附完整步骤）": ["agent", "skills"],
    "记忆(Memory)模块的深度解析": ["agent", "memory"],
    "Agent：原理、架构与工程实践": ["agent", "architecture"],
    "Agent的Skills规范原理及应用": ["agent", "skills"],
    "AI Agent（智能体）技术白皮书（Google，2024）": ["agent", "google"],
    "LLMs的Agent架构": ["agent", "llm", "react"],
}


def has_math(text: str) -> bool:
    return bool(re.search(r"\$\$|\\frac|\\sum|\\in |\$[A-Za-z\\]", text))


def strip_leading_meta(text: str) -> str:
    text = text.lstrip()
    meta = re.match(r"^---\s*\n.*?\n---\s*\n+", text, re.S)
    if meta:
        text = text[meta.end() :]
    text = re.sub(r"^(?:#[^\s#]\S*\s*)+\n+", "", text)
    return text.lstrip()


def excerpted(body: str) -> str:
    if "<!--more-->" in body:
        return body
    parts = re.split(r"\n\s*\n", body.strip())
    skip = re.compile(r"^(---+|#{1,6}\s+\S.*)$")
    i = 0
    while i < len(parts) and skip.match(parts[i].strip()):
        i += 1
    if i >= len(parts):
        return body
    first = "\n\n".join(parts[: i + 1])
    rest = "\n\n".join(parts[i + 1 :])
    if not rest:
        return body
    return f"{first}\n\n<!--more-->\n\n{rest}"


def dump_front_matter(title: str, date: datetime, tags: list[str], math: bool) -> str:
    quoted = f'"{title.replace(chr(34), chr(92)+chr(34))}"'
    lines = [
        "---",
        f"title: {quoted}",
        f"date: {date.strftime('%Y-%m-%d %H:%M:%S')} +0800",
        "categories:",
        "- Agent",
        "tags:",
    ]
    for tag in tags:
        lines.append(f"- {tag}")
    if math:
        lines.append("math: true")
    lines.append("---")
    return "\n".join(lines) + "\n"


def find_image(src: str, md_path: Path | None) -> Path | None:
    raw = unquote(src.replace("\\", "/")).lstrip("./")
    candidates = []
    if md_path is not None:
        candidates.append((md_path.parent / raw).resolve())
        stem_assets = md_path.parent / f"{md_path.stem}.assets" / Path(raw).name
        candidates.append(stem_assets)
    candidates.append(WIKI_ROOT / raw)
    candidates.append(WIKI_ROOT / "Agent Wiki .assets" / Path(raw).name)
    name = Path(raw).name
    for folder in WIKI_ROOT.glob("*.assets"):
        candidates.append(folder / name)
    for c in candidates:
        if c.is_file() and "_preview" not in c.name:
            return c
        # Typora sometimes stores "Image (2).png"
        if c.parent.is_dir():
            for f in c.parent.glob("*"):
                if f.is_file() and f.name.replace(" ", "_") == name.replace(" ", "_") and "_preview" not in f.name:
                    return f
    return None


def infer_fence_lang(body: str) -> str:
    raw = body.strip()
    if not raw:
        return "text"
    if "├──" in raw or "└──" in raw:
        return "text"
    compact = "\n".join(ln.strip() for ln in raw.splitlines() if ln.strip())
    first = compact.splitlines()[0]
    if first.startswith("{") or first.startswith("["):
        return "json"
    if re.search(r"^(docker |psql |#!/)", compact, re.M) or re.search(r"^docker ", compact, re.M):
        return "bash"
    if re.search(
        r"^(import |from [\w.]+ import |def |async def |class \w|@dataclass|@task|@crew|@kernel_function)",
        compact,
        re.M,
    ):
        return "python"
    if re.search(r"\b(Agent|Crew|Task|Kernel)\s*\(", raw) and re.search(r"\b(def |return |self\.)", raw):
        return "python"
    if re.search(r"^(CREATE |GRANT |ALTER |SELECT |INSERT |DROP )\b", compact, re.I | re.M):
        return "sql"
    if re.match(r"^---\s*$", raw, re.M) and re.search(r"^(name|description):", compact, re.M):
        return "markdown"
    if re.search(r"^(interface |type \w|export |function |const |let )", compact, re.M):
        return "typescript"
    yaml_keys = re.findall(r"^[a-zA-Z_][\w-]*:\s*(>|&|\||$|['\"\d\[\{])", compact, re.M)
    if len(yaml_keys) >= 2 and "def " not in compact and "import " not in compact:
        return "yaml"
    if first.startswith("#") and re.search(r"^#{1,6} ", compact, re.M):
        return "markdown"
    return "text"


def retag_code_fences(text: str) -> str:
    """Typora dumps unknown fences as ```other; Chirpy needs a real language."""
    lines = text.splitlines(keepends=True)
    out = []
    i = 0
    while i < len(lines):
        m = re.match(r"^(`{3,})(\S*)[ \t]*\n?$", lines[i])
        if not m:
            out.append(lines[i])
            i += 1
            continue
        ticks, lang = m.group(1), m.group(2)
        body = []
        j = i + 1
        while j < len(lines) and not re.match(rf"^{re.escape(ticks)}\s*$", lines[j]):
            body.append(lines[j])
            j += 1
        if lang in ("", "other", "plaintext"):
            lang = "markdown" if len(ticks) >= 4 else infer_fence_lang("".join(body))
        nl = "\n" if lines[i].endswith("\n") else ""
        out.append(f"{ticks}{lang}{nl}")
        out.extend(body)
        if j < len(lines):
            out.append(lines[j])
            i = j + 1
        else:
            i = j
    return "".join(out)


def convert_body(body: str, slug: str, md_path: Path | None) -> str:
    target_dir = ASSETS_ROOT / slug

    def dest_url(src: str) -> str:
        if is_remote_src(src):
            return src
        fname = dest_filename(unquote(src))
        src_file = find_image(unquote(src), md_path)
        if src_file is not None:
            target_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, target_dir / fname)
        return f"/assets/img/posts/{slug}/{fname}"

    text = rewrite_image_urls(body, dest_url)
    text = re.sub(r"^# .+$", "", text, count=1, flags=re.M).lstrip()
    text = strip_leading_meta(text)
    return retag_code_fences(excerpted(text))


def write_post(title: str, body: str, date: datetime, md_path: Path | None) -> str:
    slug = slugify(title)
    math = has_math(body)
    tags = TAGS.get(title, ["agent"])
    content = dump_front_matter(title, date, tags, math) + "\n" + convert_body(body, slug, md_path)
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    out = POSTS_DIR / f"{date.strftime('%Y-%m-%d')}-{slug}.md"
    out.write_text(content, encoding="utf-8")
    print(f"[post] {out.name}")
    return slug


def split_wiki(text: str) -> list[tuple[str, str]]:
    lines = text.splitlines(keepends=True)
    markers = []
    for i, line in enumerate(lines):
        m = re.match(r"^# (.+?)\s*$", line)
        if m and m.group(1) in WIKI_SPLITS:
            markers.append((i, m.group(1)))
    articles = []
    for idx, (start, title) in enumerate(markers):
        end = markers[idx + 1][0] if idx + 1 < len(markers) else len(lines)
        body = "".join(lines[start:end]).strip() + "\n"
        articles.append((title, body))
    return articles


def main():
    date0 = datetime(2026, 11, 8, 10, 0, 0)
    n = 0
    wiki_md = WIKI_ROOT / "Agent Wiki .md"
    for title, body in split_wiki(wiki_md.read_text(encoding="utf-8")):
        write_post(title, body, date0 + timedelta(minutes=10 * n), wiki_md)
        n += 1
    for name in STANDALONE:
        path = WIKI_ROOT / name
        text = path.read_text(encoding="utf-8")
        title = path.stem
        m = re.match(r"^# (.+?)\s*$", text, re.M)
        if m:
            title = m.group(1).strip()
        write_post(title, text, date0 + timedelta(minutes=10 * n), path)
        n += 1


if __name__ == "__main__":
    main()
