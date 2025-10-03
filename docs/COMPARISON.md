# Before vs After: Relative Links Implementation

## The Problem

When converting EPUB files with Pandoc's `--extract-media` option, links could be absolute paths:

```html
<!-- ❌ ABSOLUTE PATHS (Before) -->
<img src="/Users/username/project/media/OEBPS/cover-image.jpg" />
<img src="/Users/username/project/media/OEBPS/assets/image.png" />
```

**Problems with absolute paths:**
- ❌ Breaks when directory is moved
- ❌ Machine-specific paths
- ❌ Won't work on web servers
- ❌ Not portable across systems

## The Solution

With the relative links feature, all paths are now relative:

```html
<!-- ✅ RELATIVE PATHS (After) -->
<img src="./media/OEBPS/cover-image.jpg" />
<img src="./media/OEBPS/assets/image.png" />
```

**Benefits of relative paths:**
- ✅ Portable across systems
- ✅ Works when directory is moved
- ✅ Ready for web deployment
- ✅ Version control friendly
- ✅ Platform-independent

## Real Test Results

### From `epub_test.epub` Conversion

#### HTML Output
```html
<p><img src="./media/OEBPS/cover-image.jpg" /></p>
<img src="./media/OEBPS/assets/19280288.png" /><br />
<img src="./media/OEBPS/assets/19280672.jpg" /><br />
<img src="./media/OEBPS/assets/19281031.png" /><br />
<img src="./media/OEBPS/assets/19281594.png" /><br />
<img src="./media/OEBPS/assets/19282912.jpg" /><br />
```

#### Markdown Output
```markdown
![](./media/OEBPS/cover-image.jpg)
![](./media/OEBPS/assets/19280288.png)\
![](./media/OEBPS/assets/19280672.jpg)\
![](./media/OEBPS/assets/19281031.png)\
![](./media/OEBPS/assets/19281594.png)\
![](./media/OEBPS/assets/19282912.jpg)\
```

## Directory Structure

```
examples/epub-html-media/
├── output.html          ← Uses relative links
├── output.md            ← Uses relative links
└── media/
    └── OEBPS/
        ├── cover-image.jpg
        └── assets/
            ├── 19280288.png
            ├── 19280672.jpg
            ├── 19281031.png
            ├── 19281594.png
            └── 19282912.jpg
```

## Portability Demonstration

```bash
# You can move the entire directory anywhere
mv examples/epub-html-media ~/Desktop/my-book/

# Links still work! ✅
cd ~/Desktop/my-book/
open output.html  # Images display correctly

# You can even upload to a web server
scp -r epub-html-media/ user@server:/var/www/html/
# Visit: http://server/epub-html-media/output.html
# Images display correctly! ✅
```

## How It Works

1. User calls `epubToMarkdown()` or `epubToHtml()` with `extractMedia` option
2. Library automatically injects `relative-links.lua` filter
3. Pandoc extracts media files
4. Lua filter converts any absolute paths to relative paths
5. Output contains only relative links

**Zero configuration required!**

## Code Comparison

### Before (Manual Solution)
```typescript
// Would need post-processing
const result = await epubToHtml('book.epub', 'output.html', {
  extractMedia: './media'
});

// Then manually fix links with regex 😞
let content = fs.readFileSync('output.html', 'utf-8');
content = content.replace(/src="\/.*\/(media\/.*?)"/g, 'src="$1"');
fs.writeFileSync('output.html', content);
```

### After (Automatic Solution)
```typescript
// Just use extractMedia - that's it! 🎉
const result = await epubToHtml('book.epub', 'output.html', {
  extractMedia: './media'  // Relative links automatic!
});
```

## Verification Commands

```bash
# Check for relative links (should find matches)
grep 'src="\.\/media\/' output.html

# Check for absolute links (should find NOTHING)
grep 'src="\/.*media\/' output.html

# Count media files
find media -type f | wc -l

# Verify all links are relative
grep -E 'src="\.' output.html | wc -l
```

## Conclusion

✅ **The relative links feature works perfectly!**

The test with `epub_test.epub` demonstrates that:
- All 6 images extracted successfully
- All links use relative paths (`./media/...`)
- Zero absolute paths in output
- Output is completely portable
- Works automatically with zero configuration

**Mission accomplished!** 🚀

