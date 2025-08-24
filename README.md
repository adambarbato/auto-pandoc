# pandoc-ts

```bash
WARNING: code mostly written by Claude to use as a personal dependency so some features may be broken. Contributions are open if you find an issue.
```

A TypeScript wrapper for [Pandoc](https://pandoc.org/) with automatic binary installation. This package provides a complete TypeScript interface to Pandoc's document conversion capabilities, automatically downloading and installing the Pandoc binary when you install the package.

## Features

- 🚀 **Automatic Installation**: Pandoc binary is automatically downloaded and installed (Linux, macOS, Windows)
- 📝 **TypeScript Support**: Full TypeScript definitions and IntelliSense support
- 🔄 **Format Conversion**: Convert between 40+ document formats
- 🎯 **Type Safety**: Strongly typed options and return values
- 🛠️ **CLI Tool**: Command-line interface compatible with pandoc
- 📦 **Zero Config**: Works out of the box with sensible defaults
- 🎨 **Convenience Functions**: Pre-built functions for common conversions
- 🔧 **Advanced Options**: Full access to all Pandoc features

## Installation

```bash
npm install pandoc-ts
```

The Pandoc binary will be automatically downloaded and installed during the npm install process.

## Quick Start

### Basic Usage

```typescript
import { Pandoc, markdownToHtml } from 'pandoc-ts';

// Simple markdown to HTML conversion
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
import { Pandoc } from 'pandoc-ts';

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
import { Pandoc } from 'pandoc-ts';

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
  markdownToEpub
} from 'pandoc-ts';

// Quick conversions
const htmlResult = await markdownToHtml('# Title');
const pdfResult = await markdownToPdf('# Title', { pdfEngine: 'xelatex' });
const mdResult = await htmlToMarkdown('<h1>Title</h1>');
```

### Quick Access Functions

```typescript
import { md2html, md2pdf, html2md, version, isAvailable } from 'pandoc-ts';

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
pandoc-ts -f markdown -t html input.md -o output.html

# Generate PDF with table of contents
pandoc-ts input.md -t pdf -o output.pdf --toc --pdf-engine=xelatex

# Pipe from stdin
echo "# Hello World" | pandoc-ts -f markdown -t html

# Use advanced options
pandoc-ts input.md -t html -s --toc --css=styles.css -o output.html
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

- ✅ **Linux** (x86_64, ARM64, i386) - Automatic installation
- ✅ **macOS** (x86_64, ARM64) - Automatic installation
- ✅ **Windows** (x86_64, i386) - Automatic installation

The appropriate Pandoc binary is automatically downloaded and installed for your platform during installation.

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
import { presets, Pandoc } from 'pandoc-ts';

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
import { extractMetadata, getWordCount, validateMarkdown } from 'pandoc-ts';

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
import { convertFormat, getSupportedFormats, isOutputFormatSupported } from 'pandoc-ts';

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
import { Pandoc } from 'pandoc-ts';

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
    console.error('Pandoc binary not available. Please reinstall pandoc-ts.');
  }
}
```



## Requirements

- Node.js 18.0.0 or higher
- TypeScript 5.0.0 or higher (peer dependency)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

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
