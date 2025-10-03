import { Pandoc } from "./pandoc.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Check if pandoc is available
 */
export async function isAvailable() {
    try {
        const binaryInfo = await Pandoc.getBinaryInfo();
        return binaryInfo.available;
    }
    catch {
        return false;
    }
}
/**
 * Get pandoc version
 */
export async function version() {
    return Pandoc.getVersion();
}
/**
 * Convenience function to convert markdown to HTML
 */
export async function markdownToHtml(markdown, options = {}) {
    return Pandoc.convert(markdown, {
        from: "markdown",
        to: "html",
        ...options,
    });
}
/**
 * Convenience function to convert markdown to PDF
 */
export async function markdownToPdf(markdown, options = {}) {
    return Pandoc.convert(markdown, {
        from: "markdown",
        to: "pdf",
        ...options,
    });
}
/**
 * Convenience function to convert HTML to markdown
 */
export async function htmlToMarkdown(html, options = {}) {
    return Pandoc.convert(html, {
        from: "html",
        to: "markdown",
        ...options,
    });
}
/**
 * Convenience function to convert LaTeX to HTML
 */
export async function latexToHtml(latex, options = {}) {
    return Pandoc.convert(latex, {
        from: "latex",
        to: "html",
        ...options,
    });
}
/**
 * Convenience function to convert docx to markdown
 */
export async function docxToMarkdown(inputPath, outputPath, options = {}) {
    return Pandoc.convertFile(inputPath, outputPath, {
        from: "docx",
        to: "markdown",
        ...options,
    });
}
/**
 * Convenience function to convert markdown to docx
 */
export async function markdownToDocx(inputPath, outputPath, options = {}) {
    return Pandoc.convertFile(inputPath, outputPath, {
        from: "markdown",
        to: "docx",
        ...options,
    });
}
/**
 * Convenience function to convert markdown to EPUB
 */
export async function markdownToEpub(inputPath, outputPath, options = {}) {
    return Pandoc.convertFile(inputPath, outputPath, {
        from: "markdown",
        to: "epub",
        ...options,
    });
}
/**
 * Convenience function to convert EPUB to markdown
 *
 * When using the `extractMedia` option, this function automatically ensures that
 * all links to extracted media files are relative paths rather than absolute paths.
 * This makes the output portable - you can move the output directory and media
 * files together without breaking the links.
 *
 * @param inputPath - Path to the EPUB file
 * @param outputPath - Path for the output Markdown file (optional)
 * @param options - Pandoc conversion options
 * @returns Promise<PandocResult> - The conversion result
 *
 * @example
 * ```typescript
 * // Extract EPUB with relative media links
 * const result = await epubToMarkdown('book.epub', 'output.md', {
 *   extractMedia: './media',  // Media files extracted with relative links
 *   standalone: true
 * });
 * ```
 */
export async function epubToMarkdown(inputPath, outputPath, options = {}) {
    // If extractMedia is specified, add the relative links filter
    // This ensures all media links use relative paths instead of absolute paths
    const enhancedOptions = { ...options };
    if (enhancedOptions.extractMedia) {
        const filterPath = join(__dirname, "filters", "relative-links.lua");
        const existingLuaFilters = enhancedOptions.luaFilters
            ? Array.isArray(enhancedOptions.luaFilters)
                ? enhancedOptions.luaFilters
                : [enhancedOptions.luaFilters]
            : [];
        enhancedOptions.luaFilters = [...existingLuaFilters, filterPath];
    }
    return Pandoc.convertFile(inputPath, outputPath, {
        from: "epub",
        to: "markdown",
        ...enhancedOptions,
    });
}
/**
 * Convenience function to convert EPUB to HTML
 *
 * When using the `extractMedia` option, this function automatically ensures that
 * all links to extracted media files are relative paths rather than absolute paths.
 * This makes the output portable - you can move the output directory and media
 * files together without breaking the links.
 *
 * @param inputPath - Path to the EPUB file
 * @param outputPath - Path for the output HTML file (optional)
 * @param options - Pandoc conversion options
 * @returns Promise<PandocResult> - The conversion result
 *
 * @example
 * ```typescript
 * // Extract EPUB with relative media links
 * const result = await epubToHtml('book.epub', 'output.html', {
 *   extractMedia: './media',  // Media files extracted with relative links
 *   standalone: true,
 *   selfContained: false
 * });
 * ```
 */
export async function epubToHtml(inputPath, outputPath, options = {}) {
    // If extractMedia is specified, add the relative links filter
    // This ensures all media links use relative paths instead of absolute paths
    const enhancedOptions = { ...options };
    if (enhancedOptions.extractMedia) {
        const filterPath = join(__dirname, "filters", "relative-links.lua");
        const existingLuaFilters = enhancedOptions.luaFilters
            ? Array.isArray(enhancedOptions.luaFilters)
                ? enhancedOptions.luaFilters
                : [enhancedOptions.luaFilters]
            : [];
        enhancedOptions.luaFilters = [...existingLuaFilters, filterPath];
    }
    return Pandoc.convertFile(inputPath, outputPath, {
        from: "epub",
        to: "html",
        ...enhancedOptions,
    });
}
/**
 * Convenience function to convert any format to any format
 */
export async function convertFormat(input, from, to, options = {}) {
    return Pandoc.convert(input, {
        from,
        to,
        ...options,
    });
}
/**
 * Convenience function to convert file from any format to any format
 */
export async function convertFileFormat(inputPath, from, to, outputPath, options = {}) {
    return Pandoc.convertFile(inputPath, outputPath, {
        from,
        to,
        ...options,
    });
}
/**
 * Get a list of all supported formats
 */
export async function getSupportedFormats() {
    const [input, output] = await Promise.all([
        Pandoc.listInputFormats(),
        Pandoc.listOutputFormats(),
    ]);
    return { input, output };
}
/**
 * Check if a format is supported for input
 */
export async function isInputFormatSupported(format) {
    const inputFormats = await Pandoc.listInputFormats();
    return inputFormats.includes(format);
}
/**
 * Check if a format is supported for output
 */
export async function isOutputFormatSupported(format) {
    const outputFormats = await Pandoc.listOutputFormats();
    return outputFormats.includes(format);
}
/**
 * Create a standalone HTML document with CSS styling
 */
export async function createStandaloneHtml(markdown, options = {}) {
    const pandocOptions = {
        from: "markdown",
        to: "html",
        standalone: true,
        ...options,
    };
    // Add built-in themes
    if (options.theme) {
        // Built-in themes would be applied here
        // For now, we'll just note that theme styling would be applied
        // Theme styling would be applied here in a full implementation
    }
    if (options.title) {
        pandocOptions.metadata = {
            title: options.title,
            ...pandocOptions.metadata,
        };
    }
    return Pandoc.convert(markdown, pandocOptions);
}
/**
 * Convert markdown to a presentation format
 */
export async function markdownToPresentation(markdown, format = "revealjs", options = {}) {
    return Pandoc.convert(markdown, {
        from: "markdown",
        to: format,
        standalone: true,
        ...options,
    });
}
/**
 * Extract metadata from a document
 */
export async function extractMetadata(input, format = "markdown") {
    const result = await Pandoc.convert(input, {
        from: format,
        to: "json",
    });
    if (!result.success || !result.output) {
        throw new Error("Failed to extract metadata");
    }
    try {
        const json = JSON.parse(result.output);
        return json.meta || {};
    }
    catch (error) {
        throw new Error("Failed to parse document JSON");
    }
}
/**
 * Validate if a string is valid markdown
 */
export async function validateMarkdown(markdown) {
    try {
        const result = await Pandoc.convert(markdown, {
            from: "markdown",
            to: "json",
            failIfWarnings: false,
        });
        return {
            valid: result.success,
            errors: result.error ? [result.error] : [],
            warnings: result.warnings || [],
        };
    }
    catch (error) {
        return {
            valid: false,
            errors: [error instanceof Error ? error.message : String(error)],
            warnings: [],
        };
    }
}
/**
 * Get word count from a document
 */
export async function getWordCount(input, format = "markdown") {
    const result = await Pandoc.convert(input, {
        from: format,
        to: "plain",
    });
    if (!result.success || !result.output) {
        throw new Error("Failed to convert document for word count");
    }
    // Simple word counting - split by whitespace and filter empty strings
    const words = result.output
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0);
    return words.length;
}
/**
 * Convert bibliography format
 */
export async function convertBibliography(input, from, to, options = {}) {
    return Pandoc.convert(input, {
        from: from,
        to: to,
        ...options,
    });
}
/**
 * Create a table from CSV data
 */
export function csvToMarkdownTable(csv) {
    const lines = csv.trim().split("\n");
    if (lines.length === 0)
        return "";
    const headers = lines[0].split(",").map((h) => h.trim());
    const separator = headers.map(() => "---").join(" | ");
    let table = `| ${headers.join(" | ")} |\n`;
    table += `| ${separator} |\n`;
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(",").map((c) => c.trim());
        table += `| ${cells.join(" | ")} |\n`;
    }
    return table;
}
/**
 * Common presets for different document types
 */
export const presets = {
    /**
     * Academic paper preset
     */
    academicPaper: (options = {}) => ({
        standalone: true,
        toc: false,
        numberSections: true,
        ...options,
    }),
    /**
     * Blog post preset
     */
    blogPost: (options = {}) => ({
        from: "markdown",
        to: "html",
        standalone: true,
        highlightStyle: "pygments",
        mathjax: true,
        ...options,
    }),
    /**
     * Book preset
     */
    book: (options = {}) => ({
        standalone: true,
        toc: true,
        tocDepth: 3,
        numberSections: true,
        sectionDivs: true,
        ...options,
    }),
    /**
     * Resume/CV preset
     */
    resume: (options = {}) => ({
        from: "markdown",
        to: "pdf",
        standalone: true,
        pdfEngine: "xelatex",
        variables: {
            geometry: "margin=1in",
            fontsize: "11pt",
            ...options.variables,
        },
        ...options,
    }),
};
//# sourceMappingURL=utils.js.map