# EPUB Relative Links Implementation

## Overview

When converting EPUB files using `auto-pandoc`, the library automatically ensures that all links to extracted media files use relative paths instead of absolute paths. This feature is implemented automatically when the `extractMedia` option is used with `epubToMarkdown()` or `epubToHtml()`.

## Problem Statement

By default, Pandoc's `--extract-media` option can generate absolute file paths in the output document, which causes several issues:

1. **Portability**: Absolute paths break when the output directory is moved
2. **Deployment**: Absolute paths don't work when deploying to web servers or different systems
3. **Version Control**: Absolute paths may contain user-specific or machine-specific path components

Example of the problem:
```html
<!-- Absolute path (problematic) -->
<img src="/Users/username/project/media/image.png" />

<!-- Relative path (desired) -->
<img src="media/image.png" />
```

## Solution Architecture

The solution consists of three components:

### 1. Lua Filter (`src/filters/relative-links.lua`)

A Pandoc Lua filter that processes the document AST (Abstract Syntax Tree) and converts absolute paths to relative paths for:
- Images (`Image` elements)
- Links (`Link` elements pointing to local files)

The filter:
- Detects absolute paths (Unix: starting with `/`, Windows: `C:\` or `\\`)
- Converts them to relative paths
- Preserves HTTP/HTTPS URLs unchanged
- Handles both forward and backward slashes

### 2. Automatic Filter Application (`src/utils.ts`)

The `epubToMarkdown()` and `epubToHtml()` functions automatically:
1. Check if `extractMedia` option is present
2. Add the `relative-links.lua` filter to the conversion pipeline
3. Preserve any user-specified Lua filters
4. Pass all options to Pandoc with the filter chain

```typescript
// Automatic filter injection
if (enhancedOptions.extractMedia) {
  const filterPath = join(__dirname, "filters", "relative-links.lua");
  const existingLuaFilters = enhancedOptions.luaFilters
    ? Array.isArray(enhancedOptions.luaFilters)
      ? enhancedOptions.luaFilters
      : [enhancedOptions.luaFilters]
    : [];
  enhancedOptions.luaFilters = [...existingLuaFilters, filterPath];
}
```

### 3. Build Process Integration (`scripts/copy-filters.js`)

The build process automatically copies Lua filters from `src/filters/` to `dist/filters/` ensuring they're available at runtime and included in the npm package.

## Technical Details

### Lua Filter Implementation

The filter uses Pandoc's Lua API to traverse and modify the document:

```lua
function Image(elem)
  if elem.src and is_absolute(elem.src) then
    elem.src = make_relative(elem.src)
  end
  return elem
end
```

Key functions:
- `is_absolute(filepath)`: Detects absolute paths on Unix and Windows
- `make_relative(filepath)`: Converts absolute paths to relative paths
- Handles edge cases like network paths, drive letters, etc.

### Filter Chain Order

The relative-links filter is appended to the end of any user-specified Lua filters, ensuring:
1. User filters process the document first
2. Relative link conversion happens last
3. No interference with custom transformations

### Path Resolution Strategy

The filter uses a simple but effective strategy:

1. **Unix absolute paths** (`/path/to/file`): Strip leading slash → `path/to/file`
2. **Windows paths** (`C:\path\to\file`): Extract directory and filename
3. **Already relative paths**: Pass through unchanged
4. **URLs** (`https://...`): Pass through unchanged

## Usage Examples

### Basic Usage

```typescript
import { epubToMarkdown } from 'auto-pandoc';

const result = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './media'  // Relative links automatically enabled
});
```

### With Custom Lua Filters

```typescript
const result = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './media',
  luaFilters: ['./my-custom-filter.lua']  // Both filters will be applied
});
```

### HTML Output

```typescript
import { epubToHtml } from 'auto-pandoc';

const result = await epubToHtml('book.epub', 'output.html', {
  extractMedia: './media',
  standalone: true,
  selfContained: false  // Keep media separate with relative links
});
```

## Benefits

1. **Automatic**: No manual configuration required
2. **Transparent**: Works seamlessly with existing code
3. **Portable**: Output can be moved anywhere
4. **Compatible**: Works with all Pandoc versions that support Lua filters
5. **Composable**: Integrates with user-defined filters

## Testing

To test the relative links feature:

1. Convert an EPUB with images:
```bash
node examples/epub-extraction.js /path/to/book.epub
```

2. Verify the output contains relative paths:
```bash
# Check for relative links
grep -E 'src="(\.\/)?media\/' examples/epub-html-media/output.html

# Should NOT find absolute paths
grep -E 'src="/.*media\/' examples/epub-html-media/output.html
```

## Troubleshooting

### Filter Not Found

If you see an error like "Lua filter not found":
- Run `npm run build` to ensure filters are copied to `dist/`
- Check that `dist/filters/relative-links.lua` exists

### Links Still Absolute

If links remain absolute:
- Ensure you're using `extractMedia` option
- Check Pandoc version (requires Lua filter support)
- Verify the filter is being applied (use `verbose: true`)

### Custom Filters Conflict

If custom filters aren't working:
- The relative-links filter is appended, not prepended
- Check filter order in debug output
- Ensure custom filters don't remove image/link elements

## Future Enhancements

Potential improvements for future versions:

1. **Configurable behavior**: Option to disable automatic filter
2. **Path normalization**: More sophisticated path manipulation
3. **Cross-platform testing**: Verify on Windows, macOS, Linux
4. **Base path configuration**: Allow custom base path for relative resolution
5. **URL preservation**: More sophisticated URL detection

## References

- [Pandoc Lua Filters Documentation](https://pandoc.org/lua-filters.html)
- [Pandoc Extract Media Option](https://pandoc.org/MANUAL.html#option--extract-media)
- [Pandoc AST (Abstract Syntax Tree)](https://pandoc.org/lua-filters.html#pandoc-ast)

## Contributing

To contribute improvements to the relative links feature:

1. Modify `src/filters/relative-links.lua` for filter changes
2. Update `src/utils.ts` for integration changes
3. Add tests to verify behavior
4. Update this documentation
5. Run `npm run build` to test
6. Submit a pull request

## License

This feature is part of auto-pandoc and is licensed under the MIT License.