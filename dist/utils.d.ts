import type { PandocOptions, PandocResult, PandocFormat } from "./types.js";
/**
 * Check if pandoc is available
 */
export declare function isAvailable(): Promise<boolean>;
/**
 * Get pandoc version
 */
export declare function version(): Promise<string>;
/**
 * Convenience function to convert markdown to HTML
 */
export declare function markdownToHtml(markdown: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert markdown to PDF
 */
export declare function markdownToPdf(markdown: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert HTML to markdown
 */
export declare function htmlToMarkdown(html: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert LaTeX to HTML
 */
export declare function latexToHtml(latex: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert docx to markdown
 */
export declare function docxToMarkdown(inputPath: string, outputPath?: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert markdown to docx
 */
export declare function markdownToDocx(inputPath: string, outputPath?: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert markdown to EPUB
 */
export declare function markdownToEpub(inputPath: string, outputPath?: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert any format to any format
 */
export declare function convertFormat(input: string, from: PandocFormat, to: PandocFormat, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Convenience function to convert file from any format to any format
 */
export declare function convertFileFormat(inputPath: string, from: PandocFormat, to: PandocFormat, outputPath?: string, options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Get a list of all supported formats
 */
export declare function getSupportedFormats(): Promise<{
    input: PandocFormat[];
    output: PandocFormat[];
}>;
/**
 * Check if a format is supported for input
 */
export declare function isInputFormatSupported(format: string): Promise<boolean>;
/**
 * Check if a format is supported for output
 */
export declare function isOutputFormatSupported(format: string): Promise<boolean>;
/**
 * Create a standalone HTML document with CSS styling
 */
export declare function createStandaloneHtml(markdown: string, options?: {
    title?: string;
    css?: string | string[];
    theme?: "github" | "default" | "elegant";
    toc?: boolean;
    mathJax?: boolean;
}): Promise<PandocResult>;
/**
 * Convert markdown to a presentation format
 */
export declare function markdownToPresentation(markdown: string, format?: "revealjs" | "beamer" | "s5" | "slidy" | "slideous" | "dzslides", options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Extract metadata from a document
 */
export declare function extractMetadata(input: string, format?: PandocFormat): Promise<Record<string, any>>;
/**
 * Validate if a string is valid markdown
 */
export declare function validateMarkdown(markdown: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
}>;
/**
 * Get word count from a document
 */
export declare function getWordCount(input: string, format?: PandocFormat): Promise<number>;
/**
 * Convert bibliography format
 */
export declare function convertBibliography(input: string, from: "bibtex" | "biblatex" | "json", to: "bibtex" | "biblatex" | "json" | "yaml", options?: Omit<PandocOptions, "from" | "to">): Promise<PandocResult>;
/**
 * Create a table from CSV data
 */
export declare function csvToMarkdownTable(csv: string): string;
/**
 * Common presets for different document types
 */
export declare const presets: {
    /**
     * Academic paper preset
     */
    academicPaper: (options?: Partial<PandocOptions>) => PandocOptions;
    /**
     * Blog post preset
     */
    blogPost: (options?: Partial<PandocOptions>) => PandocOptions;
    /**
     * Book preset
     */
    book: (options?: Partial<PandocOptions>) => PandocOptions;
    /**
     * Resume/CV preset
     */
    resume: (options?: Partial<PandocOptions>) => PandocOptions;
};
//# sourceMappingURL=utils.d.ts.map