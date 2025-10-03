/**
 * auto-pandoc - TypeScript wrapper for Pandoc with automatic binary installation
 *
 * This module provides a TypeScript interface to the Pandoc document converter,
 * automatically installing the Pandoc binary when the package is installed.
 *
 * @example
 * ```typescript
 * import { Pandoc, markdownToHtml } from 'auto-pandoc';
 *
 * // Convert markdown to HTML
 * const result = await markdownToHtml('# Hello World\n\nThis is **bold** text.');
 * console.log(result.output);
 *
 * // Use the main Pandoc class for advanced options
 * const pdfResult = await Pandoc.convert(markdown, {
 *   from: 'markdown',
 *   to: 'pdf',
 *   standalone: true,
 *   pdfEngine: 'xelatex'
 * });
 * ```
 */
export { Pandoc, default as PandocClass } from "./pandoc.js";
export type { PandocFormat, CitationStyle, HighlightStyle, PandocOptions, PandocResult, PandocBinary, InstallOptions, ExecOptions, } from "./types.js";
export { markdownToHtml, markdownToPdf, htmlToMarkdown, latexToHtml, docxToMarkdown, markdownToDocx, markdownToEpub, epubToMarkdown, epubToHtml, convertFormat, convertFileFormat, getSupportedFormats, isInputFormatSupported, isOutputFormatSupported, createStandaloneHtml, markdownToPresentation, extractMetadata, validateMarkdown, getWordCount, convertBibliography, csvToMarkdownTable, presets, } from "./utils.js";
export { Pandoc as default } from "./pandoc.js";
/**
 * Quick start functions for common conversions
 */
/**
 * Convert markdown string to HTML
 * @param markdown - Markdown content to convert
 * @param options - Pandoc options (excluding from/to)
 * @returns Promise resolving to conversion result
 */
export declare function md2html(markdown: string, options?: Omit<import("./types.js").PandocOptions, "from" | "to">): Promise<import("./types.js").PandocResult>;
/**
 * Convert markdown string to PDF
 * @param markdown - Markdown content to convert
 * @param options - Pandoc options (excluding from/to)
 * @returns Promise resolving to conversion result
 */
export declare function md2pdf(markdown: string, options?: Omit<import("./types.js").PandocOptions, "from" | "to">): Promise<import("./types.js").PandocResult>;
/**
 * Convert HTML string to markdown
 * @param html - HTML content to convert
 * @param options - Pandoc options (excluding from/to)
 * @returns Promise resolving to conversion result
 */
export declare function html2md(html: string, options?: Omit<import("./types.js").PandocOptions, "from" | "to">): Promise<import("./types.js").PandocResult>;
/**
 * Get pandoc version information
 * @returns Promise resolving to version string
 */
export declare function version(): Promise<string>;
/**
 * Get pandoc binary information
 * @returns Promise resolving to binary info
 */
export declare function info(): Promise<import("./types.js").PandocBinary>;
/**
 * Check if pandoc is available
 * @returns Promise resolving to boolean indicating availability
 */
export declare function isAvailable(): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map