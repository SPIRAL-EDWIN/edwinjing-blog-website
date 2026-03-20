# Obsidian to MkDocs Conversion Rules

Detailed reference for all conversion patterns and edge cases.

## Table of Contents

1. [Block References](#block-references)
2. [Wiki Links](#wiki-links)
3. [Image Embeds](#image-embeds)
4. [Callouts](#callouts)
5. [Code Blocks](#code-blocks)
6. [Front Matter](#front-matter)
7. [Special Characters](#special-characters)
8. [File Organization](#file-organization)

---

## Block References

### Block ID Definition

**Obsidian syntax**: `^block-id` at end of paragraph/line

```markdown
This is important content ^important-note
```

**MkDocs behavior**: Kept as-is. `block-links.js` converts to:
```html
<p>This is important content <span id="important-note" class="block-anchor"></span></p>
```

### Block Reference Links

**Obsidian syntax**: `[[#^block-id]]` or `[[Page#^block-id]]`

```markdown
See [[#^important-note]]
Also check [[Other Page#^other-id]]
```

**MkDocs behavior**: `roamlinks` plugin converts to:
```html
<a href="#important-note">#^important-note</a>
<a href="Other%20Page/#other-id">#^other-id</a>
```

### Block ID Patterns

Valid block IDs: alphanumeric + hyphens + underscores
- ✅ `^abc123`
- ✅ `^my-note`
- ✅ `^section_1`
- ❌ `^has spaces` (invalid)

---

## Wiki Links

### Basic Links

| Pattern | Example | Converted To |
|---------|---------|--------------|
| Simple | `[[PageName]]` | `[PageName](PageName.md)` |
| With alias | `[[PageName\|Display Text]]` | `[Display Text](PageName.md)` |
| To folder | `[[folder/Page]]` | `[Page](folder/Page.md)` |
| With spaces | `[[My Page]]` | `[My Page](My%20Page.md)` |

### Header Links

| Pattern | Example | Converted To |
|---------|---------|--------------|
| Same page | `[[#Header]]` | `[Header](#header)` |
| Other page | `[[Page#Header]]` | `[Header](Page.md#header)` |
| With alias | `[[Page#Header\|Text]]` | `[Text](Page.md#header)` |

### Special Cases

**Escaped pipes in tables:**
```markdown
| Column | Link |
|--------|------|
| Data | [[Page\|Alias]] |
```

**Links in code blocks**: Do NOT convert - leave as-is.

### `[[]]` as Array/List Syntax in Code

**Critical Rule**: In Obsidian, `[[]]` inside inline code (single backticks) or fenced code blocks (triple backticks) represents array/list syntax (Python, NumPy, MATLAB comments, etc.), NOT wiki-links.

**Problem**: The `roamlinks` plugin does not distinguish `[[]]` in code from wiki-links. It parses ALL `[[...]]` patterns, including those inside code, causing build warnings like:
```
WARNING - [roamlinks] - RoamLinksPlugin unable to find '1,2,3' in directory
```

**Workaround**: Insert a zero-width space (Unicode `\u200b`) between `[` and `[` to break the wiki-link pattern:

| Before (triggers warning) | After (no warning) |
|---------------------------|--------------------|
| `np.array([[1,2,3]])` | `np.array([\u200b[1,2,3]])` |
| `[[0, 1, 2], [3, 4, 5]]` | `[\u200b[0, 1, 2], [3, 4, 5]]` |

The zero-width space is invisible in rendered output, so code display is unaffected.

**When to apply**: Only when `mkdocs build`/`mkdocs serve` produces RoamLinks warnings about array-like patterns. Not all `[[]]` in code will trigger warnings — only those the plugin happens to parse.

---

## Image Embeds

### Basic Images

| Obsidian | MkDocs |
|----------|--------|
| `![[photo.png]]` | `![](images/photo.png)` |
| `![[sub/photo.png]]` | `![](sub/photo.png)` |

### Image with Dimensions

| Obsidian | MkDocs |
|----------|--------|
| `![[photo.png\|300]]` | `![](images/photo.png){ width="300" }` |
| `![[photo.png\|300x200]]` | `![](images/photo.png){ width="300" height="200" }` |

### Image with Alt Text

Obsidian doesn't support alt text directly. Add manually:
```markdown
![Alt text description](images/photo.png)
```

### Image Organization

Recommended structure:
```
docs/
├── Category/
│   ├── Page.md
│   └── images/
│       ├── screenshot1.png
│       └── diagram.svg
```

---

## Callouts

### Syntax Comparison

**Obsidian:**
```markdown
> [!NOTE] Title Here
> Content line 1
> Content line 2
```

**MkDocs (with callouts plugin - automatic):**
```markdown
!!! note "Title Here"
    Content line 1
    Content line 2
```

### Supported Types

| Obsidian | MkDocs Admonition |
|----------|-------------------|
| `[!NOTE]` | `note` |
| `[!TIP]` | `tip` |
| `[!INFO]` | `info` |
| `[!WARNING]` | `warning` |
| `[!DANGER]` | `danger` |
| `[!EXAMPLE]` | `example` |
| `[!QUOTE]` | `quote` |
| `[!ABSTRACT]` | `abstract` |
| `[!SUCCESS]` | `success` |
| `[!QUESTION]` | `question` |
| `[!FAILURE]` | `failure` |
| `[!BUG]` | `bug` |

### Collapsible Callouts

**Obsidian:**
```markdown
> [!NOTE]- Collapsed by default
> Hidden content

> [!NOTE]+ Expanded by default
> Visible content
```

**MkDocs:**
```markdown
??? note "Collapsed by default"
    Hidden content

???+ note "Expanded by default"
    Visible content
```

---

## Code Blocks

### Fenced Code Blocks

Same syntax - no conversion needed:
````markdown
```python
print("Hello")
```
````

### Inline Code

Same syntax - no conversion needed:
```markdown
Use `code` for inline
```

### Code Block Titles

**Obsidian (not standard):**
````markdown
```python title="example.py"
code
```
````

**MkDocs Material:**
````markdown
```python title="example.py"
code
```
````

Works the same! No conversion needed.

---

## Front Matter

### Required Fields

```yaml
---
title: Page Title
---
```

### Optional Fields

```yaml
---
title: Page Title
description: SEO description
tags:
  - tag1
  - tag2
date: 2025-01-15
---
```

### Fields to Remove/Convert

| Obsidian Field | Action |
|----------------|--------|
| `cssclass` | Remove (Obsidian-specific) |
| `aliases` | Remove or convert to redirects |
| `created` | Keep or remove |
| `modified` | Keep or remove |

---

## Special Characters

### Characters Requiring Escaping

In URLs/paths:
- Space → `%20`
- `#` → `%23`
- `?` → `%3F`
- `&` → `%26`

### Unicode in Filenames

Avoid if possible. If necessary, test on target server (case sensitivity varies).

---

## File Organization

### Recommended Structure

```
docs/
├── index.md              # Home page
├── Category1/
│   ├── index.md          # Category landing
│   ├── Page1.md
│   ├── Page2.md
│   └── images/
│       └── *.png
├── Category2/
│   └── ...
└── stylesheets/
    └── extra.css
```

### Naming Conventions

- Use lowercase for consistency
- Prefer hyphens over spaces: `my-page.md` not `My Page.md`
- Keep paths short to avoid URL issues

### nav Configuration

In `mkdocs.yml`:
```yaml
nav:
  - Home: index.md
  - Category1:
    - Overview: Category1/index.md
    - Page1: Category1/Page1.md
```
