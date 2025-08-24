/**
 * Pandoc input/output formats
 */
export type PandocFormat = "commonmark" | "commonmark_x" | "creole" | "docbook" | "docx" | "dokuwiki" | "epub" | "fb2" | "gfm" | "haddock" | "html" | "ipynb" | "jats" | "jira" | "json" | "latex" | "man" | "markdown" | "markdown_mmd" | "markdown_phpextra" | "markdown_strict" | "mediawiki" | "muse" | "native" | "odt" | "opml" | "org" | "rst" | "rtf" | "t2t" | "textile" | "tikiwiki" | "twiki" | "vimwiki" | "asciidoc" | "asciidoctor" | "beamer" | "bibtex" | "biblatex" | "commonmark" | "commonmark_x" | "context" | "csljson" | "docbook4" | "docbook5" | "docx" | "dokuwiki" | "dzslides" | "epub" | "epub2" | "epub3" | "fb2" | "gfm" | "haddock" | "html" | "html4" | "html5" | "icml" | "ipynb" | "jats" | "jats_archiving" | "jats_articleauthoring" | "jats_publishing" | "jira" | "json" | "latex" | "man" | "markdown" | "markdown_mmd" | "markdown_phpextra" | "markdown_strict" | "mediawiki" | "ms" | "muse" | "native" | "odt" | "opendocument" | "opml" | "org" | "pdf" | "plain" | "pptx" | "rst" | "rtf" | "slideous" | "slidy" | "s5" | "tei" | "texinfo" | "textile" | "xwiki" | "zimwiki";
/**
 * Pandoc citation styles
 */
export type CitationStyle = "apa" | "chicago" | "mla" | "ieee" | "vancouver";
/**
 * Pandoc highlight styles
 */
export type HighlightStyle = "pygments" | "tango" | "espresso" | "zenburn" | "kate" | "monochrome" | "breezedark" | "haddock";
/**
 * Pandoc options interface
 */
export interface PandocOptions {
    /** Input format */
    from?: PandocFormat;
    /** Output format */
    to?: PandocFormat;
    /** Output file path */
    output?: string;
    /** Standalone document */
    standalone?: boolean;
    /** Template file */
    template?: string;
    /** Variables to set */
    variables?: Record<string, string | number | boolean>;
    /** Metadata values */
    metadata?: Record<string, any>;
    /** CSS files to include */
    css?: string | string[];
    /** Include files in header */
    includeInHeader?: string | string[];
    /** Include files before body */
    includeBeforeBody?: string | string[];
    /** Include files after body */
    includeAfterBody?: string | string[];
    /** Table of contents */
    toc?: boolean;
    /** Table of contents depth */
    tocDepth?: number;
    /** Number sections */
    numberSections?: boolean;
    /** Section divs */
    sectionDivs?: boolean;
    /** HTML math method */
    mathml?: boolean;
    /** MathJax URL */
    mathjax?: string | boolean;
    /** KaTeX options */
    katex?: string | boolean;
    /** Syntax highlighting */
    highlightStyle?: HighlightStyle | false | string;
    /** Self-contained output */
    selfContained?: boolean;
    /** Bibliography file */
    bibliography?: string | string[];
    /** Citation style */
    csl?: string;
    /** Citation abbreviations */
    citationAbbreviations?: string;
    /** Filters to apply */
    filters?: string | string[];
    /** Lua filters to apply */
    luaFilters?: string | string[];
    /** Data directory */
    dataDir?: string;
    /** Resource path */
    resourcePath?: string | string[];
    /** Request headers */
    requestHeaders?: Array<[string, string]>;
    /** No highlight */
    noHighlight?: boolean;
    /** Preserve tabs */
    preserveTabs?: boolean;
    /** Tab stop width */
    tabStop?: number;
    /** PDF engine */
    pdfEngine?: "pdflatex" | "xelatex" | "lualatex" | "tectonic" | "latexmk" | "context" | "wkhtmltopdf" | "weasyprint" | "prince" | "pagedjs-cli";
    /** PDF engine options */
    pdfEngineOpts?: string | string[];
    /** Reference document */
    referenceDoc?: string;
    /** Reference links */
    referenceLinks?: boolean;
    /** Reference location */
    referenceLocation?: "block" | "section" | "document";
    /** Markdown extensions */
    extensions?: string[];
    /** Fail if warnings */
    failIfWarnings?: boolean;
    /** Verbose output */
    verbose?: boolean;
    /** Quiet output */
    quiet?: boolean;
    /** Trace execution */
    trace?: boolean;
    /** Log file */
    logFile?: string;
    /** List input formats */
    listInputFormats?: boolean;
    /** List output formats */
    listOutputFormats?: boolean;
    /** List extensions */
    listExtensions?: string;
    /** List highlight languages */
    listHighlightLanguages?: boolean;
    /** List highlight styles */
    listHighlightStyles?: boolean;
    /** Print default template */
    printDefaultTemplate?: string;
    /** Print default data file */
    printDefaultDataFile?: string;
    /** Print highlight style */
    printHighlightStyle?: string;
    /** Version */
    version?: boolean;
    /** Help */
    help?: boolean;
}
/**
 * Pandoc conversion result
 */
export interface PandocResult {
    /** Output content (if no output file specified) */
    output?: string;
    /** Path to output file (if output file specified) */
    outputPath?: string;
    /** Conversion success status */
    success: boolean;
    /** Error message if conversion failed */
    error?: string;
    /** Warning messages */
    warnings?: string[];
    /** Pandoc version used */
    version?: string;
}
/**
 * Pandoc binary information
 */
export interface PandocBinary {
    /** Path to pandoc binary */
    path: string;
    /** Pandoc version */
    version: string;
    /** Whether binary is available */
    available: boolean;
}
/**
 * Pandoc installation options
 */
export interface InstallOptions {
    /** Force reinstallation */
    force?: boolean;
    /** Custom installation directory */
    installDir?: string;
    /** Specific version to install */
    version?: string;
    /** Skip version check */
    skipVersionCheck?: boolean;
    /** Verbose installation */
    verbose?: boolean;
}
/**
 * Pandoc executable options for spawning process
 */
export interface ExecOptions {
    /** Current working directory */
    cwd?: string;
    /** Environment variables */
    env?: Record<string, string>;
    /** Timeout in milliseconds */
    timeout?: number;
    /** Input to pipe to pandoc */
    input?: string;
    /** Encoding for input/output */
    encoding?: string;
}
//# sourceMappingURL=types.d.ts.map