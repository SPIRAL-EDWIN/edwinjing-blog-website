import sys
from pathlib import Path
import re

if len(sys.argv) < 2:
    print("Usage: lower_headings.py <file>")
    sys.exit(1)

p = Path(sys.argv[1])
text = p.read_text(encoding='utf-8')
lines = text.splitlines()

# Remove outer fence if present (line starting with ``` or more backticks)
if lines and lines[0].lstrip().startswith('```'):
    # drop first line
    lines = lines[1:]
# remove trailing fence if present
if lines and lines[-1].lstrip().startswith('```'):
    lines = lines[:-1]

out_lines = []
in_fence = False
fence_re = re.compile(r'^\s*(`{3,}|~{3,})')
heading_re = re.compile(r'^(\s*)(#+)(\s*)')
for ln in lines:
    m = fence_re.match(ln)
    if m:
        # toggle fence
        in_fence = not in_fence
        out_lines.append(ln)
        continue
    if not in_fence:
        hm = heading_re.match(ln)
        if hm:
            spaces, hashes, rest = hm.groups()
            # increase one #
            ln = f"{spaces}#{hashes}{rest}" + ln[hm.end():]
    out_lines.append(ln)

p.write_text('\n'.join(out_lines) + '\n', encoding='utf-8')
print(f"Processed {p}")
