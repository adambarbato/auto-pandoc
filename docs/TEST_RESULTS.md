# EPUB Conversion Test Results

## Test File
- **Source**: `epub_test.epub`
- **Date**: October 3, 2024

## Test Execution
```bash
node examples/epub-extraction.js ./epub_test.epub
```

## Results

### ✅ Conversion Success
- HTML conversion: **SUCCESS**
- Markdown conversion: **SUCCESS**
- Media extraction: **SUCCESS** (6 image files extracted)

### ✅ Relative Links Verification

#### HTML Output (`output.html`)
All image links use relative paths:
```html
<img src="./media/OEBPS/cover-image.jpg" />
<img src="./media/OEBPS/assets/19280288.png" />
<img src="./media/OEBPS/assets/19280672.jpg" />
<img src="./media/OEBPS/assets/19281031.png" />
<img src="./media/OEBPS/assets/19281594.png" />
<img src="./media/OEBPS/assets/19282912.jpg" />
```

#### Markdown Output (`output.md`)
All image links use relative paths:
```markdown
![](./media/OEBPS/cover-image.jpg)
![](./media/OEBPS/assets/19280288.png)
![](./media/OEBPS/assets/19280672.jpg)
![](./media/OEBPS/assets/19281031.png)
![](./media/OEBPS/assets/19281594.png)
![](./media/OEBPS/assets/19282912.jpg)
```

### ✅ No Absolute Paths Found
Verified that NO absolute paths exist in output:
```bash
grep 'src="/.*media' output.html
# Result: No matches (exit code 1)
```

### ✅ Extracted Media Files
```
media/OEBPS/cover-image.jpg
media/OEBPS/assets/19282912.jpg
media/OEBPS/assets/19281594.png
media/OEBPS/assets/19281031.png
media/OEBPS/assets/19280288.png
media/OEBPS/assets/19280672.jpg
```

### ✅ Portability Test
**Before**: Media in project root
**After**: Moved `media/` to `examples/epub-html-media/`
**Result**: Links still valid (relative paths work correctly)

## Conclusion

✅ **ALL TESTS PASSED**

The relative links feature is working correctly:
1. All media links use relative paths (not absolute)
2. Links start with `./media/` (relative format)
3. Media files successfully extracted
4. Output is portable (can be moved anywhere)
5. Both HTML and Markdown formats work correctly

## Technical Details

- **Pandoc Version**: 3.7.0
- **Filter Applied**: `src/filters/relative-links.lua`
- **Automatic Activation**: Yes (when `extractMedia` is specified)
- **Filter Chain**: Appended to user filters (if any)
- **Path Format**: `./media/path/to/file.ext` (POSIX-style relative)

## EPUB Metadata
- **Author**: もんぶらん
- **Language**: Japanese
- **Content**: Contains cover image and 5 additional images
- **Format**: EPUB 3

