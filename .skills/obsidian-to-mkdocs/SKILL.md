---
name: obsidian-to-mkdocs
description: Convert Obsidian Markdown files to MkDocs-compatible format. Use when preparing Obsidian vault content for MkDocs Material website deployment. Handles: (1) Block reference links [[#^id]] and ^id markers, (2) Wiki-style links [[page]] and [[page|alias]], (3) Image embeds ![[image.png]], (4) Callouts/admonitions, (5) Code block formatting, (6) Front matter adjustment, (7) File organization for docs/ directory.
---

# Obsidian to MkDocs Converter

Convert Obsidian vault Markdown files to MkDocs Material-compatible format for web deployment.

## Quick Start

1. Run conversion script on source file(s):
   ```bash
   python .skills/obsidian-to-mkdocs/scripts/convert_obsidian.py <source.md> --output <dest.md>
   ```

2. Or convert entire directory:
   ```bash
   python .skills/obsidian-to-mkdocs/scripts/convert_obsidian.py <source_dir/> --output <docs_dir/> --recursive
   ```

## Conversion Rules Summary

### Block References (Critical)

Keep `^block-id` markers in place. The `block-links.js` script handles them at runtime.

| Obsidian | Behavior |
|----------|----------|
| `[[#^abc123]]` | Converted by roamlinks plugin to `<a href="#abc123">` |
| `^abc123` | Kept as-is, converted to anchor by JS |

### Wiki Links

| Obsidian | MkDocs |
|----------|--------|
| `[[Page Name]]` | `[Page Name](Page%20Name.md)` or handled by roamlinks |
| `[[Page\|Display]]` | `[Display](Page.md)` |
| `[[folder/Page]]` | `[Page](folder/Page.md)` |

### Image Embeds

| Obsidian | MkDocs |
|----------|--------|
| `![[image.png]]` | `![](images/image.png)` |
| `![[image.png\|300]]` | `![](images/image.png){ width="300" }` |

### Callouts

Handled automatically by `mkdocs-callouts` plugin. No conversion needed.

```markdown
> [!NOTE] Title
> Content
```

## Workflow

### Manual Conversion Steps

1. **Copy file to docs/**
2. **Fix image paths**: Move images to `images/` subfolder, update references
3. **Verify links**: Ensure internal links point to correct `.md` files
4. **Check front matter**: Remove Obsidian-specific fields (`cssclass`, `aliases`)
5. **Test locally**: Run `mkdocs serve` to preview

### Using Conversion Script

```bash
# Single file
python .skills/obsidian-to-mkdocs/scripts/convert_obsidian.py \
    "vault/Notes/MyNote.md" \
    --output "docs/Notes/MyNote.md"

# Directory (recursive)
python .skills/obsidian-to-mkdocs/scripts/convert_obsidian.py \
    "vault/Notes/" \
    --output "docs/Notes/" \
    --recursive
```

## Post-Conversion Checklist

- [ ] Images copied to correct `images/` directories
- [ ] Internal links resolve (no 404s)
- [ ] Block references work (click jump + highlight)
- [ ] Code blocks render correctly
- [ ] Callouts display as admonitions
- [ ] Front matter valid YAML
- [ ] `mkdocs build` completes without errors

## Troubleshooting

### Block Links Not Working
1. Ensure `javascripts/block-links.js` is in `extra_javascript` in `mkdocs.yml`
2. Verify `^block-id` markers are preserved in source
3. Check browser console for "Block anchors created" log

### Broken Wiki Links
1. If using roamlinks plugin, ensure it's enabled
2. For manual conversion, URL-encode spaces: `My File` → `My%20File`

### Missing Images
1. Check image path case sensitivity (Linux servers are case-sensitive)
2. Ensure images are in `docs/*/images/` not vault's attachment folder

## References

For detailed conversion rules: [references/conversion-rules.md](references/conversion-rules.md)
