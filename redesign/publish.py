import argparse
import shutil
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Export the redesigned blog as a website root.")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    source = Path(__file__).resolve().parent
    output = args.output.resolve()
    if output == source or source.is_relative_to(output) or output.is_relative_to(source):
        parser.error("The output must be outside the redesign source directory.")
    if output.exists() and any(output.iterdir()):
        parser.error("The output directory must be empty.")
    for required in ["index.html", "posts-data.js", "articles", "assets/markdown"]:
        if not (source / required).exists():
            parser.error("Run build.py before publishing.")
    output.mkdir(parents=True, exist_ok=True)
    for pattern in ["*.html", "*.css", "*.js"]:
        for path in source.glob(pattern):
            shutil.copy2(path, output / path.name)
    for directory in ["articles", "assets"]:
        shutil.copytree(source / directory, output / directory)
    (output / ".nojekyll").touch()
    print(f"Exported redesigned blog to website root: {output}")


if __name__ == "__main__":
    main()
