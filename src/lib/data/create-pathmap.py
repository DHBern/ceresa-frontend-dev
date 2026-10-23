import json
import re

ROOT_RE = re.compile(r'^([A-Za-z]+-\d+)(.*)$')   # e.g. "A-1" as the base
CHUNK_RE = re.compile(r'[-_][^-_]*')              # "-a", "_1", "-4", "_010", ...


def build_value(key: str) -> str:
    m = ROOT_RE.match(key.strip())
    if not m:
        return key  # doesn't match the pattern, leave unchanged

    root, rest = m.group(1), m.group(2)
    segments = [root]
    current = root
    for chunk in CHUNK_RE.findall(rest):
        current += chunk
        segments.append(current)
    return "/".join(segments)


with open("input.json", encoding="utf-8") as f:
    data = json.load(f)

result = {key: build_value(key) for key in data}

with open("output.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
