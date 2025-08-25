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
// Main Pandoc class
export { Pandoc, default as PandocClass } from "./pandoc.js";
// Utility functions
export { 
// Format conversion utilities
markdownToHtml, markdownToPdf, htmlToMarkdown, latexToHtml, docxToMarkdown, markdownToDocx, markdownToEpub, convertFormat, convertFileFormat, 
// Format support checking
getSupportedFormats, isInputFormatSupported, isOutputFormatSupported, 
// Document utilities
createStandaloneHtml, markdownToPresentation, extractMetadata, validateMarkdown, getWordCount, convertBibliography, csvToMarkdownTable, 
// Presets
presets, } from "./utils.js";
// Default export is the main Pandoc class
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
export async function md2html(markdown, options = {}) {
    const { markdownToHtml } = await import("./utils.js");
    return markdownToHtml(markdown, options);
}
/**
 * Convert markdown string to PDF
 * @param markdown - Markdown content to convert
 * @param options - Pandoc options (excluding from/to)
 * @returns Promise resolving to conversion result
 */
export async function md2pdf(markdown, options = {}) {
    const { markdownToPdf } = await import("./utils.js");
    return markdownToPdf(markdown, options);
}
/**
 * Convert HTML string to markdown
 * @param html - HTML content to convert
 * @param options - Pandoc options (excluding from/to)
 * @returns Promise resolving to conversion result
 */
export async function html2md(html, options = {}) {
    const { htmlToMarkdown } = await import("./utils.js");
    return htmlToMarkdown(html, options);
}
/**
 * Get pandoc version information
 * @returns Promise resolving to version string
 */
export async function version() {
    const { Pandoc } = await import("./pandoc.js");
    return Pandoc.getVersion();
}
/**
 * Get pandoc binary information
 * @returns Promise resolving to binary info
 */
export async function info() {
    const { Pandoc } = await import("./pandoc.js");
    return Pandoc.getBinaryInfo();
}
/**
 * Check if pandoc is available
 * @returns Promise resolving to boolean indicating availability
 */
export async function isAvailable() {
    try {
        const binaryInfo = await info();
        return binaryInfo.available;
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=index.js.map