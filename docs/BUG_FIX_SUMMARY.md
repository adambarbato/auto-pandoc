# Bug Fix Summary: Media Extraction Path Issue

## 🐛 Bug Report

### Issue
When running `node examples/epub-extraction.js ./epub_test.epub` from the project root, the extracted media files were placed in `./media` (project root) instead of `./examples/epub-html-media/media` (alongside the output files).

### Discovered By
User testing with `epub_test.epub`

### Date
October 3, 2024

## 🔍 Root Cause Analysis

### Problem
Pandoc's `--extract-media` option interprets paths **relative to the current working directory (CWD)**, not relative to the output file location.

### Original Code Behavior
```javascript
// Output files written to: examples/epub-html-media/
// extractMedia option: './media'
// CWD: project root
// Result: Media extracted to ./media (project root) ❌
```

### Directory Structure Before Fix
```
auto-pandoc/
├── media/                          ← WRONG! Media in project root
│   └── OEBPS/
│       └── assets/
└── examples/
    └── epub-html-media/
        ├── output.html
        └── output.md
```

## ✅ Solution

### Approach
Change the current working directory to the output directory before running the conversion, then restore it afterward.

### Updated Code Pattern
```javascript
const outputDir = join(__dirname, 'epub-html-media');
const originalCwd = process.cwd();

// Save and change working directory
process.chdir(outputDir);

try {
  // Now extractMedia paths are relative to outputDir
  await epubToHtml(inputPath, 'output.html', {
    extractMedia: './media'  // Creates outputDir/media
  });
} finally {
  // Always restore original directory
  process.chdir(originalCwd);
}
```

### Directory Structure After Fix
```
auto-pandoc/
└── examples/
    └── epub-html-media/
        ├── output.html             ✅ Output file
        ├── output.md               ✅ Output file
        └── media/                  ✅ Media in correct location!
            └── OEBPS/
                ├── cover-image.jpg
                └── assets/
                    ├── image1.png
                    └── image2.jpg
```

## 🔧 Changes Made

### File Modified
- `examples/epub-extraction.js`

### Key Changes

#### 1. Working Directory Management
```javascript
// Before
const outputDir = join(__dirname, 'epub-html-media');
const htmlOutput = join(outputDir, 'output.html');

// After
const outputDir = join(__dirname, 'epub-html-media');
const originalCwd = process.cwd();
process.chdir(outputDir);
const htmlOutput = 'output.html'; // Now relative to outputDir
```

#### 2. Path Adjustments
```javascript
// Before
await epubToHtml(epubPath, htmlOutput, {
  extractMedia: './media'
});

// After
const relativeEpubPath = join(originalCwd, epubPath);
await epubToHtml(relativeEpubPath, htmlOutput, {
  extractMedia: './media'  // Now extracts to outputDir/media
});
```

#### 3. Cleanup with Finally Block
```javascript
try {
  // Conversion code
} finally {
  // Always restore original directory, even if error occurs
  process.chdir(originalCwd);
}
```

## ✅ Verification

### Test Command
```bash
node examples/epub-extraction.js ./epub_test.epub
```

### Expected Results
- ✅ Media files in `examples/epub-html-media/media/`
- ✅ No media directory in project root
- ✅ Relative links in output: `./media/OEBPS/image.jpg`
- ✅ Self-contained output directory

### Actual Results
```bash
# Check media location
$ ls examples/epub-html-media/media/OEBPS/
cover-image.jpg  assets/

# Verify no media in root
$ ls media
ls: media: No such file or directory ✅

# Check links in output
$ grep 'src="' examples/epub-html-media/output.html | head -3
<img src="./media/OEBPS/cover-image.jpg" />
<img src="./media/OEBPS/assets/19280288.png" />
<img src="./media/OEBPS/assets/19280672.jpg" />
```

## 📊 Impact Assessment

### Before Fix
- ❌ Media scattered in wrong location
- ❌ Not self-contained
- ❌ Confusing for users
- ❌ Required manual cleanup

### After Fix
- ✅ All files in one directory
- ✅ Self-contained and portable
- ✅ Intuitive directory structure
- ✅ No manual cleanup needed

## 🎓 Lessons Learned

### Key Insight
**Pandoc interprets relative paths based on CWD, not output file location.**

When using `--extract-media` with relative paths:
- Path is relative to **where Pandoc is executed from**
- NOT relative to where the output file is written

### Best Practice
For self-contained output directories:
1. Change CWD to desired output directory
2. Use relative paths for all file operations
3. Restore CWD in finally block
4. Adjust input paths to be relative to new CWD

### Alternative Approaches Considered

#### Option 1: Absolute Paths (Rejected)
```javascript
extractMedia: join(outputDir, 'media')  // Absolute path
```
**Problem**: Pandoc outputs absolute paths in HTML/Markdown, breaking portability.

#### Option 2: Post-processing (Rejected)
```javascript
// Convert absolute paths after generation
const content = fs.readFileSync('output.html', 'utf-8');
const fixed = content.replace(/src="\/.*\/(media\/.*?)"/g, 'src="$1"');
```
**Problem**: Fragile regex, doesn't handle all cases, adds complexity.

#### Option 3: CWD Management (Chosen) ✅
```javascript
process.chdir(outputDir);
// Run conversions
process.chdir(originalCwd);
```
**Benefits**: Clean, reliable, Pandoc generates correct relative paths naturally.

## 🚀 Status

- **Bug Status**: ✅ FIXED
- **Test Status**: ✅ VERIFIED
- **Code Status**: ✅ COMMITTED
- **Docs Status**: ✅ UPDATED

## 📚 Related Documentation

- `TEST_SUMMARY.md` - Updated with bug fix information
- `examples/epub-extraction.js` - Fixed example script
- `docs/QUICK_START_EPUB.md` - Best practices guide

## 🙏 Acknowledgments

Bug discovered and reported by user during initial testing with `epub_test.epub`. This real-world testing was invaluable for catching the issue before production release.

---

**Fix Date**: October 3, 2024  
**Severity**: Medium (incorrect file placement, but functionality worked)  
**Resolution Time**: ~30 minutes  
**Testing**: Comprehensive verification completed