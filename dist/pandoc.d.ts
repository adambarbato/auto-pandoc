import type { PandocOptions, PandocResult, PandocBinary, PandocFormat } from "./types.js";
/**
 * Main Pandoc wrapper class
 */
export declare class Pandoc {
    private static _binaryPath;
    private static _version;
    /**
     * Get the path to the pandoc binary
     */
    static getBinaryPath(): Promise<string>;
    /**
     * Get pandoc version information
     */
    static getVersion(): Promise<string>;
    /**
     * Get binary information
     */
    static getBinaryInfo(): Promise<PandocBinary>;
    /**
     * Convert content using pandoc
     */
    static convert(input: string, options?: PandocOptions): Promise<PandocResult>;
    /**
     * Convert a file using pandoc
     */
    static convertFile(inputPath: string, outputPath?: string, options?: PandocOptions): Promise<PandocResult>;
    /**
     * List available input formats
     */
    static listInputFormats(): Promise<PandocFormat[]>;
    /**
     * List available output formats
     */
    static listOutputFormats(): Promise<PandocFormat[]>;
    /**
     * List available highlight styles
     */
    static listHighlightStyles(): Promise<string[]>;
    /**
     * Get default template for a format
     */
    static getDefaultTemplate(format: PandocFormat): Promise<string>;
    /**
     * Execute pandoc command
     */
    private static execPandoc;
    /**
     * Build pandoc command line arguments from options
     */
    private static buildArgs;
    /**
     * Parse warnings from pandoc output
     */
    private static parseWarnings;
}
export default Pandoc;
//# sourceMappingURL=pandoc.d.ts.map