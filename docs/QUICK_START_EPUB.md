# Quick Start: EPUB Conversion with Relative Links

## Overview

This guide shows you how to convert EPUB files to Markdown or HTML with automatic relative link conversion. All media files (images, fonts, etc.) will be extracted with relative paths, making your output portable and ready for deployment.

## Basic Usage

### Convert EPUB to Markdown

```typescript
import { epubToMarkdown } from 'auto-pandoc';

const result = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './media'  // Media extracted with relative links
});

if (result.success) {
  console.log('✅ Conversion successful!');
  console.log('Output:', result.outputPath);
}
```

### Convert EPUB to HTML

```typescript
import { epubToHtml } from 'auto-pandoc';

const result = await epubToHtml('book.epub', 'output.html', {
  extractMedia: './media',
  standalone: true,
  selfContained: false  // Keep media separate with relative paths
});
```

## What You Get

### Input
```
book.epub (contains images, fonts, etc.)
```

### Output
```
output.md           # Markdown with relative links
output.html         # HTML with relative links
media/
  ├── image1.png   # Extracted images
  ├── image2.jpg
  └── fonts/       # Extracted fonts
      └── font.ttf
```

### Links in Output
```markdown
<!-- Markdown output uses relative paths -->
![Chapter 1 Image](media/image1.png)
![Chapter 2 Image](media/image2.jpg)
```

```html
<!-- HTML output uses relative paths -->
<img src="media/image1.png" alt="Chapter 1 Image" />
<img src="media/image2.jpg" alt="Chapter 2 Image" />
```

## Key Features

### ✅ Automatic Relative Links

When you use `extractMedia`, all links are automatically converted to relative paths:

```typescript
// Just specify extractMedia - relative links are automatic!
const result = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './media'
});

// Output contains:  ![Image](media/image.png)
// NOT:              ![Image](/full/path/to/media/image.png)
```

### ✅ Portable Output

You can move the output directory anywhere and links will still work:

```bash
# Create a website directory
mkdir website
mv output.html website/
mv media/ website/

# Links still work! 🎉
cd website
open output.html  # Images display correctly
```

### ✅ Zero Configuration

No extra setup needed - just use `extractMedia` and you're done!

## Advanced Options

### With Table of Contents

```typescript
const result = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './media',
  toc: true,
  tocDepth: 3,
  numberSections: true
});
```

### With Custom Styling (HTML)

```typescript
const result = await epubToHtml('book.epub', 'output.html', {
  extractMedia: './media',
  standalone: true,
  css: './custom-style.css',
  toc: true
});
```

### With Metadata

```typescript
const result = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './media',
  metadata: {
    title: 'My Extracted Book',
    author: 'Original Author',
    date: new Date().toISOString().split('T')[0]
  }
});
```

### Self-Contained HTML (No External Files)

If you want everything in one file (no separate media directory):

```typescript
const result = await epubToHtml('book.epub', 'output.html', {
  standalone: true,
  selfContained: true  // Embeds all media in the HTML file
  // Note: Don't use extractMedia with selfContained
});
```

## Command-Line Usage

You can also use the CLI:

```bash
# Convert to Markdown
auto-pandoc book.epub -o output.md --extract-media ./media

# Convert to HTML
auto-pandoc book.epub -o output.html --extract-media ./media --standalone
```

## Real-World Example

```typescript
import { epubToHtml } from 'auto-pandoc';
import { promises as fs } from 'fs';

async function convertEpubForWebsite(epubPath: string) {
  // Create website directory
  const websiteDir = './website';
  await fs.mkdir(websiteDir, { recursive: true });

  // Convert EPUB to HTML with media
  const result = await epubToHtml(
    epubPath,
    `${websiteDir}/index.html`,
    {
      extractMedia: './assets',  // Relative to index.html
      standalone: true,
      toc: true,
      tocDepth: 2,
      css: './styles.css',
      metadata: {
        title: 'My Online Book',
        author: 'Your Name'
      }
    }
  );

  if (result.success) {
    console.log('✅ Website ready!');
    console.log('📁 Files created:');
    console.log('   - website/index.html');
    console.log('   - website/assets/ (images, fonts, etc.)');
    console.log('🚀 Deploy the website/ directory to your web server');
  } else {
    console.error('❌ Conversion failed:', result.error);
  }
}

// Use it
convertEpubForWebsite('my-book.epub');
```

## Running the Example Script

Try the included example:

```bash
node examples/epub-extraction.js /path/to/your/book.epub
```

This will:
1. Convert the EPUB to both HTML and Markdown
2. Extract all media files
3. Use relative links automatically
4. Save everything to `examples/epub-html-media/`

## Troubleshooting

### "Pandoc not found"

Install Pandoc first:
- **macOS**: `brew install pandoc`
- **Ubuntu**: `sudo apt install pandoc`
- **Windows**: `choco install pandoc`
- **Other**: Visit https://pandoc.org/installing.html

### Links Still Look Absolute

This shouldn't happen with `extractMedia`, but if it does:
1. Make sure you're using a recent version of auto-pandoc
2. Check that `extractMedia` path is relative (e.g., `./media`, not `/full/path/media`)
3. Verify the filter was applied with `verbose: true`

### Images Not Displaying

Check the file structure:
```
output.html
media/
  └── image.png
```

The `media/` directory should be in the same location as `output.html`.

## Why Relative Links?

### Problem with Absolute Links
```html
<!-- Absolute path - breaks when moved -->
<img src="/Users/you/project/media/image.png" />
```

### Solution with Relative Links
```html
<!-- Relative path - works anywhere -->
<img src="media/image.png" />
```

Relative links mean:
- ✅ Output is portable
- ✅ Works on any computer
- ✅ Ready for web deployment
- ✅ No path adjustments needed
- ✅ Version control friendly

## Next Steps

- Read the [technical documentation](./epub-relative-links.md) for implementation details
- Check out [more examples](../examples/) in the repository
- Review the [full API documentation](../README.md) for all options
- Explore [custom Lua filters](https://pandoc.org/lua-filters.html) for advanced transformations

## Questions?

- GitHub Issues: https://github.com/adambarbato/auto-pandoc/issues
- Pandoc Manual: https://pandoc.org/MANUAL.html
- Lua Filters: https://pandoc.org/lua-filters.html

---

**Remember**: When you use `extractMedia`, relative links are automatic. Just extract and go! 🚀