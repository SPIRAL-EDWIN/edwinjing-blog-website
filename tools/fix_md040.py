import re
from pathlib import Path


def fix_file(path: Path) -> int:
    text = path.read_text(encoding='utf-8')
    lines = text.splitlines(keepends=True)

    inside = False
    changed = 0
    out_lines = []

    fence_re = re.compile(r'^(?P<prefix>\s*(?:> ?)*)(?P<fence>`{3,})(?P<lang>\w+)?\s*$')

    for ln in lines:
        m = fence_re.match(ln)
        if m:
            prefix = m.group('prefix') or ''
            fence = m.group('fence')
            lang = m.group('lang')
            if not inside:
                # opening fence
                if not lang:
                    out_lines.append(f"{prefix}{fence}python\n")
                    changed += 1
                else:
                    out_lines.append(ln)
                inside = True
            else:
                # closing fence -> keep as plain fence
                out_lines.append(f"{prefix}{fence}\n")
                inside = False
        else:
            out_lines.append(ln)

    if changed:
        path.write_text(''.join(out_lines), encoding='utf-8')

    return changed


if __name__ == '__main__':
    target = Path('docs/OsdNotes/CS101/Python.md')
    if not target.exists():
        print(f'File not found: {target}')
        raise SystemExit(1)
    n = fix_file(target)
    print(f'Updated {n} opening code fence(s) in {target}')
