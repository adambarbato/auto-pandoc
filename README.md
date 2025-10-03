# auto-pandoc

```bash
WARNING: code mostly written by Claude to use as a personal dependency so some features may be broken. Contributions are open if you find an issue.
```

A TypeScript wrapper for [Pandoc](https://pandoc.org/) with automatic binary installation. The automatic installation of the pandoc binary is what separates this project from others in the ecosystem.

This package provides a complete TypeScript interface to Pandoc's document conversion capabilities, automatically downloading and installing the Pandoc binary when you install the package.

## Features

- 🚀 **Automatic Installation**: Pandoc binary is automatically downloaded on first use (Linux, macOS, Windows)
- 📝 **TypeScript Support**: Full TypeScript definitions and IntelliSense support
- 🔄 **Format Conversion**: Convert between 40+ document formats
- 🎯 **Type Safety**: Strongly typed options and return values
- 🛠️ **CLI Tool**: Command-line interface compatible with pandoc
- 📦 **Zero Config**: Works out of the box with sensible defaults
- 🎨 **Convenience Functions**: Pre-built functions for common conversions
- 🔧 **Advanced Options**: Full access to all Pandoc features

## Installation

```bash
npm install auto-pandoc
```

The Pandoc binary will be automatically downloaded and installed when you first use the package.

## Pandoc Binary Installation

This package automatically manages the Pandoc binary installation:

✅ **Automatic Installation**: The Pandoc binary downloads automatically when you first use any conversion function
✅ **Global Installation**: Works with both local and global npm installations
✅ **Cross-platform**: Automatically selects the correct binary for your platform
✅ **Lightweight**: Package is only ~125KB - binary downloads separately as needed

```javascript
const pandoc = require('auto-pandoc');
// Binary downloads automatically on first conversion (if not already installed)
const result = await pandoc.markdownToHtml('# Hello World');
```

### Manual Installation (Optional)
You can also install the binary manually if desired:

```bash
# For local installations
cd node_modules/auto-pandoc && npm run install-pandoc

# For global installations - binary installs automatically on first use
npm install -g auto-pandoc
auto-pandoc --help
```

## Quick Start

### Basic Usage

```typescript
import { Pandoc, markdownToHtml } from 'auto-pandoc';

// Simple markdown to HTML conversion
// Note: Pandoc binary downloads automatically on first use
const result = await markdownToHtml('# Hello World\n\nThis is **bold** text.');
console.log(result.output); // <h1>Hello World</h1><p>This is <strong>bold</strong> text.</p>

// Check if conversion was successful
if (result.success) {
  console.log('Conversion successful!');
} else {
  console.error('Conversion failed:', result.error);
}
```

### File Conversion

```typescript
import { Pandoc } from 'auto-pandoc';

// Convert a markdown file to PDF
const result = await Pandoc.convertFile('input.md', 'output.pdf', {
  from: 'markdown',
  to: 'pdf',
  standalone: true,
  pdfEngine: 'xelatex'
});

if (result.success) {
  console.log(`PDF created at: ${result.outputPath}`);
}
```

### Advanced Options

```typescript
import { Pandoc } from 'auto-pandoc';

const markdown = `
# My Document

This document has citations [@smith2020].

## Introduction

Here's some code:

\`\`\`javascript
console.log('Hello, world!');
\`\`\`
`;

const result = await Pandoc.convert(markdown, {
  from: 'markdown',
  to: 'html',
  standalone: true,
  toc: true,
  tocDepth: 2,
  numberSections: true,
  highlightStyle: 'github',
  mathJax: true,
  bibliography: ['references.bib'],
  csl: 'chicago-author-date.csl',
  css: ['styles.css'],
  selfContained: true
});
```

## EPUB Extraction

The library includes specialized functions for extracting and converting EPUB files, with support for automatic media extraction.

### Basic EPUB Conversion

```typescript
import { epubToMarkdown, epubToHtml } from 'auto-pandoc';

// Convert EPUB to Markdown
const mdResult = await epubToMarkdown('book.epub', 'output.md');

// Convert EPUB to HTML
const htmlResult = await epubToHtml('book.epub', 'output.html');
```

### EPUB with Media Extraction

When converting EPUB files, you can use the `extractMedia` option to automatically extract images, fonts, and other media files to a directory:

```typescript
import { epubToMarkdown, epubToHtml } from 'auto-pandoc';

// Extract EPUB to Markdown with media
const result = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './book-media',  // Images and media extracted here
  standalone: true
});

// Extract EPUB to HTML with media in separate directory
const htmlResult = await epubToHtml('book.epub', 'output.html', {
  extractMedia: './html-media',
  standalone: true,
  selfContained: false  // Keep media as separate files
});
```

### Self-Contained EPUB Conversion

For a single-file output with all media embedded:

```typescript
import { epubToHtml } from 'auto-pandoc';

// Create self-contained HTML with embedded media
const result = await epubToHtml('book.epub', 'standalone.html', {
  standalone: true,
  selfContained: true  // Embeds all media in the HTML file
});
```

### Advanced EPUB Options

```typescript
import { epubToMarkdown } from 'auto-pandoc';

// Convert EPUB with table of contents and metadata
const result = await epubToMarkdown('book.epub', 'book.md', {
  extractMedia: './book-assets',
  standalone: true,
  toc: true,
  tocDepth: 3,
  numberSections: true,
  metadata: {
    title: 'Extracted Book',
    author: 'Original Author',
    date: new Date().toISOString().split('T')[0]
  }
});
```

### Running the Example

Try the included example script:

```bash
node examples/epub-extraction.js path/to/your/book.epub
```

## API Reference

### Main Class: `Pandoc`

#### Static Methods

##### `Pandoc.convert(input, options)`

Convert content from one format to another.

- **input**: `string` - Content to convert
- **options**: `PandocOptions` - Conversion options
- **Returns**: `Promise<PandocResult>`

##### `Pandoc.convertFile(inputPath, outputPath?, options)`

Convert a file from one format to another.

- **inputPath**: `string` - Path to input file
- **outputPath**: `string` (optional) - Path to output file
- **options**: `PandocOptions` - Conversion options
- **Returns**: `Promise<PandocResult>`

##### `Pandoc.getVersion()`

Get the version of the installed Pandoc binary.

- **Returns**: `Promise<string>`

##### `Pandoc.getBinaryInfo()`

Get information about the Pandoc binary installation.

- **Returns**: `Promise<PandocBinary>`

##### `Pandoc.listInputFormats()` / `Pandoc.listOutputFormats()`

List supported input/output formats.

- **Returns**: `Promise<PandocFormat[]>`

### Convenience Functions

```typescript
import {
  markdownToHtml,
  markdownToPdf,
  htmlToMarkdown,
  markdownToDocx,
  docxToMarkdown,
  markdownToEpub,
  epubToMarkdown,
  epubToHtml
} from 'auto-pandoc';

// Quick conversions
const htmlResult = await markdownToHtml('# Title');
const pdfResult = await markdownToPdf('# Title', { pdfEngine: 'xelatex' });
const mdResult = await htmlToMarkdown('<h1>Title</h1>');

// EPUB extraction with media
const epubMdResult = await epubToMarkdown('book.epub', 'output.md', {
  extractMedia: './media'  // Extract images and media to this directory
});
const epubHtmlResult = await epubToHtml('book.epub', 'output.html', {
  extractMedia: './media',
  standalone: true
});
```

### Quick Access Functions

```typescript
import { md2html, md2pdf, html2md, version, isAvailable } from 'auto-pandoc';

// Ultra-short function names
const html = await md2html('# Hello');
const pdf = await md2pdf('# Hello');
const markdown = await html2md('<h1>Hello</h1>');

// Check availability and version
console.log('Pandoc available:', await isAvailable());
console.log('Pandoc version:', await version());
```

## CLI Usage

The package includes a CLI tool compatible with pandoc:

```bash
# Convert markdown to HTML
auto-pandoc -f markdown -t html input.md -o output.html

# Generate PDF with table of contents
auto-pandoc input.md -t pdf -o output.pdf --toc --pdf-engine=xelatex

# Pipe from stdin
echo "# Hello World" | auto-pandoc -f markdown -t html

# Use advanced options
auto-pandoc input.md -t html -s --toc --css=styles.css -o output.html
```

## Supported Formats

### Input Formats
- `markdown` (and variants: `gfm`, `commonmark`, etc.)
- `html`
- `latex`
- `docx`
- `epub`
- `rst` (reStructuredText)
- `org` (Org-mode)
- `mediawiki`
- `textile`
- `fb2`
- And 30+ more formats

### Output Formats
- `html` (HTML4, HTML5)
- `pdf` (via LaTeX)
- `docx` (Word document)
- `epub` (EPUB2, EPUB3)
- `latex`
- `beamer` (LaTeX Beamer slides)
- `pptx` (PowerPoint)
- `odt` (OpenDocument)
- `rtf` (Rich Text Format)
- And 30+ more formats

## Configuration Options

## Platform Support

- ✅ **Linux** (x86_64, ARM64, i386) - Automatic binary download
- ✅ **macOS** (x86_64, ARM64) - Automatic binary download
- ✅ **Windows** (x86_64, i386) - Automatic binary download

The appropriate Pandoc binary is automatically downloaded and installed for your platform on first use.

### `PandocOptions` Interface

```typescript
interface PandocOptions {
  // Input/Output
  from?: PandocFormat;           // Input format
  to?: PandocFormat;             // Output format
  output?: string;               // Output file path

  // Document Structure
  standalone?: boolean;          // Produce standalone document
  template?: string;             // Custom template file
  toc?: boolean;                 // Generate table of contents
  tocDepth?: number;             // TOC depth (1-6)
  numberSections?: boolean;      // Number sections
  sectionDivs?: boolean;         // Wrap sections in divs

  // Styling and Appearance
  css?: string | string[];       // CSS files to include
  highlightStyle?: HighlightStyle; // Code syntax highlighting
  selfContained?: boolean;       // Embed resources

  // Math Rendering
  mathJax?: boolean | string;    // Use MathJax
  katex?: boolean | string;      // Use KaTeX
  mathml?: boolean;              // Use MathML

  // Citations and Bibliography
  bibliography?: string | string[]; // Bibliography files
  csl?: string;                  // Citation style file
  citationAbbreviations?: string; // Citation abbreviations

  // PDF Generation
  pdfEngine?: 'pdflatex' | 'xelatex' | 'lualatex' | 'wkhtmltopdf';
  pdfEngineOpts?: string | string[]; // PDF engine options

  // Variables and Metadata
  variables?: Record<string, any>; // Template variables
  metadata?: Record<string, any>;  // Document metadata

  // Processing Options
  filters?: string | string[];     // Pandoc filters
  luaFilters?: string | string[];  // Lua filters
  verbose?: boolean;               // Verbose output
  quiet?: boolean;                 // Suppress warnings

  // And many more options...
}
```

## Document Presets

The package includes presets for common document types:

```typescript
import { presets, Pandoc } from 'auto-pandoc';

// Academic paper
const academicOptions = presets.academicPaper({
  bibliography: ['references.bib'],
  csl: 'nature.csl'
});

// Blog post
const blogOptions = presets.blogPost({
  highlightStyle: 'github',
  css: ['blog.css']
});

// Book
const bookOptions = presets.book({
  tocDepth: 3,
  numberSections: true
});

// Resume/CV
const resumeOptions = presets.resume({
  pdfEngine: 'xelatex',
  variables: { fontsize: '11pt' }
});

const result = await Pandoc.convert(content, academicOptions);
```

## Utility Functions

### Document Analysis

```typescript
import { extractMetadata, getWordCount, validateMarkdown } from 'auto-pandoc';

// Extract document metadata
const metadata = await extractMetadata('# Title\n\nContent', 'markdown');

// Get word count
const wordCount = await getWordCount('Hello world', 'markdown'); // 2

// Validate markdown syntax
const validation = await validateMarkdown('# Valid markdown');
console.log(validation.valid); // true
```

### Format Conversion Utilities

```typescript
import { convertFormat, getSupportedFormats, isOutputFormatSupported } from 'auto-pandoc';

// Generic format conversion
const result = await convertFormat('# Hello', 'markdown', 'latex');

// Check format support
const formats = await getSupportedFormats();
console.log(formats.input);  // ['markdown', 'html', ...]
console.log(formats.output); // ['html', 'pdf', ...]

const isPdfSupported = await isOutputFormatSupported('pdf'); // true
```

## Error Handling

```typescript
import { Pandoc } from 'auto-pandoc';

try {
  const result = await Pandoc.convert(input, options);

  if (result.success) {
    console.log('Success:', result.output);

    // Check for warnings
    if (result.warnings && result.warnings.length > 0) {
      console.warn('Warnings:', result.warnings);
    }
  } else {
    console.error('Conversion failed:', result.error);
  }
} catch (error) {
  console.error('Error:', error.message);

  if (error.message.includes('not found')) {
    console.error('Pandoc binary not available. Please reinstall auto-pandoc.');
  }
}
```



## Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0.0 or higher (peer dependency)

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/adambarbato/auto-pandoc.git
cd auto-pandoc

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Pandoc binary installs automatically on first use
# Or install manually if desired: npm run install-pandoc
```

### Development Scripts

- `npm run build` - Compile TypeScript to JavaScript (production build)
- `npm run dev` - Watch mode for development
- `npm test` - Run full test suite (compile + test)
- `npm run install-pandoc` - Install Pandoc binary manually (optional - happens automatically on first use)

### Project Structure

```
auto-pandoc/
├── src/                 # TypeScript source files
│   ├── index.ts        # Main exports
│   ├── pandoc.ts       # Core Pandoc wrapper
│   ├── types.ts        # TypeScript definitions
│   ├── utils.ts        # Utility functions
│   └── test.ts         # Test files
├── scripts/            # Installation scripts
│   └── install-pandoc.js
├── bin/                # CLI executable
│   └── auto-pandoc.js
└── dist/               # Compiled JavaScript (generated)
```

## Publishing to NPM

This package uses automated publishing via GitHub Actions.

### Automated Publishing

The package is automatically published to NPM when you create a new version tag:

```bash
# Bump version and create tag
npm version patch  # or minor, major
git push origin main --tags
```

This triggers a GitHub Actions workflow that:
- Runs tests on multiple Node.js versions (18, 20, 21)
- Tests on multiple operating systems (Ubuntu, Windows, macOS)
- Builds the TypeScript code
- Publishes to NPM
- Creates a GitHub release

### Manual Publishing

For manual publishing or first-time setup:

1. **Setup NPM account and token:**
   ```bash
   npm login
   npm whoami  # verify login
   ```

2. **Build and test:**
   ```bash
   npm run build
   npm test  # pandoc binary installs automatically during tests
   npm pack --dry-run  # preview package contents
   ```

3. **Publish:**
   ```bash
   npm publish
   ```

### GitHub Actions Setup

The repository includes two workflows:

- **CI** (`.github/workflows/ci.yml`) - Runs on every push and PR
  - Tests on Node.js 18, 20, 21
  - Tests on Ubuntu, Windows, macOS
  - Installs Pandoc binary and runs full test suite
- **Publish** (`.github/workflows/publish.yml`) - Publishes on version tags
  - Runs tests before publishing
  - Publishes to NPM automatically
  - Creates GitHub releases

To set up automated publishing:

1. Create an NPM automation token at [npmjs.com](https://npmjs.com/settings/tokens)
2. Add it as a repository secret named `NPM_TOKEN`
3. The workflow will automatically publish when you push version tags

### Package Contents

The published package includes:
- `dist/` - Compiled JavaScript and type definitions
- `bin/auto-pandoc.js` - CLI executable (only the script, not the binary)
- `scripts/` - Installation scripts for downloading Pandoc
- `package.json`, `README.md`, `LICENSE`

**Important**: The Pandoc binary (`bin/pandoc`) is **NOT** included in the npm package to keep it lightweight (~120 KB vs ~190 MB). The binary is automatically downloaded on first use or when manually running the install script.

Excluded from package:
- `src/` - TypeScript source files
- `bin/pandoc` - Pandoc binary (downloaded automatically)
- Development files (tsconfig, .github, examples)
- Test files
- Node modules and build artifacts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Contributing Guidelines

1. **Fork the repository** and create a feature branch
2. **Make your changes** with appropriate tests
3. **Run the test suite** to ensure everything works
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### Reporting Issues

When reporting bugs, please include:
- Node.js version
- Operating system
- auto-pandoc version
- Whether Pandoc binary was successfully installed (`pandoc --version`)
- Minimal code example
- Error messages and stack traces

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Related Projects

- [Pandoc](https://pandoc.org/) - The universal document converter
- [node-pandoc](https://www.npmjs.com/package/node-pandoc) - Alternative Node.js wrapper

## Changelog

### 1.0.0
- Initial release
- Automatic Pandoc binary installation
- Full TypeScript support
- CLI tool
- Comprehensive API with convenience functions
- Support for all major platforms
- GitHub Actions CI/CD pipeline
- Automated NPM publishing
