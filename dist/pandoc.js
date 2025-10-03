import { spawn } from "child_process";
import { promises as fs } from "fs";
import { join, resolve, dirname, basename } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Main Pandoc wrapper class
 */
export class Pandoc {
    /**
     * Get the path to the pandoc binary
     */
    static async getBinaryPath() {
        if (this._binaryPath) {
            return this._binaryPath;
        }
        // Try different possible locations
        const possiblePaths = [
            // Local installation in node_modules
            join(__dirname, "..", "bin", "pandoc"),
            join(__dirname, "..", "bin", "pandoc.exe"),
            // System installation
            "pandoc",
        ];
        for (const path of possiblePaths) {
            try {
                const result = await this.execPandoc(["--version"], { timeout: 5000 }, path);
                if (result.success) {
                    this._binaryPath = path;
                    return path;
                }
            }
            catch {
                continue;
            }
        }
        // Try to install pandoc automatically on first use
        console.log("Pandoc binary not found. Attempting automatic installation...");
        try {
            await this.installPandocBinary();
            // Try to find the binary again after installation
            for (const path of possiblePaths) {
                try {
                    const result = await this.execPandoc(["--version"], { timeout: 5000 }, path);
                    if (result.success) {
                        this._binaryPath = path;
                        return path;
                    }
                }
                catch {
                    continue;
                }
            }
        }
        catch (installError) {
            console.error("Automatic installation failed:", installError instanceof Error
                ? installError.message
                : String(installError));
        }
        throw new Error("Pandoc binary not found. Please run 'npm run install-pandoc' to install the binary manually.");
    }
    /**
     * Get pandoc version information
     */
    static async getVersion() {
        if (this._version) {
            return this._version;
        }
        const binaryPath = await this.getBinaryPath();
        const result = await this.execPandoc(["--version"], {}, binaryPath);
        if (!result.success || !result.output) {
            throw new Error("Failed to get pandoc version");
        }
        const versionMatch = result.output.match(/pandoc (\d+\.\d+(?:\.\d+)?)/);
        this._version = versionMatch ? versionMatch[1] : "unknown";
        return this._version;
    }
    /**
     * Get binary information
     */
    static async getBinaryInfo() {
        try {
            const path = await this.getBinaryPath();
            const version = await this.getVersion();
            return {
                path,
                version,
                available: true,
            };
        }
        catch (error) {
            return {
                path: "",
                version: "",
                available: false,
            };
        }
    }
    /**
     * Convert content using pandoc
     */
    static async convert(input, options = {}) {
        const binaryPath = await this.getBinaryPath();
        const args = this.buildArgs(options);
        try {
            const result = await this.execPandoc(args, {
                input,
                timeout: options.verbose ? 60000 : 30000,
            }, binaryPath);
            return {
                output: result.output,
                outputPath: options.output,
                success: result.success,
                error: result.error,
                warnings: this.parseWarnings(result.output || ""),
                version: await this.getVersion(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                version: await this.getVersion(),
            };
        }
    }
    /**
     * Convert a file using pandoc
     */
    static async convertFile(inputPath, outputPath, options = {}) {
        const binaryPath = await this.getBinaryPath();
        const resolvedInputPath = resolve(inputPath);
        // Check if input file exists
        try {
            await fs.access(resolvedInputPath);
        }
        catch {
            return {
                success: false,
                error: `Input file not found: ${resolvedInputPath}`,
                version: await this.getVersion(),
            };
        }
        // If extractMedia is specified and outputPath is provided,
        // set CWD to the output directory so extractMedia paths are relative to the output
        let execOptions = {
            timeout: options.verbose ? 60000 : 30000,
        };
        if (options.extractMedia && outputPath) {
            const outputDir = dirname(resolve(outputPath));
            execOptions.cwd = outputDir;
            // Make output path relative to the output directory
            outputPath = basename(outputPath);
        }
        const args = [
            resolvedInputPath,
            ...this.buildArgs({ ...options, output: outputPath }),
        ];
        try {
            const result = await this.execPandoc(args, execOptions, binaryPath);
            return {
                output: outputPath ? undefined : result.output,
                outputPath: outputPath && execOptions.cwd
                    ? join(execOptions.cwd, outputPath)
                    : outputPath,
                success: result.success,
                error: result.error,
                warnings: this.parseWarnings(result.output || ""),
                version: await this.getVersion(),
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                version: await this.getVersion(),
            };
        }
    }
    /**
     * List available input formats
     */
    static async listInputFormats() {
        const binaryPath = await this.getBinaryPath();
        const result = await this.execPandoc(["--list-input-formats"], {}, binaryPath);
        if (!result.success || !result.output) {
            throw new Error("Failed to list input formats");
        }
        return result.output
            .trim()
            .split("\n")
            .map((format) => format.trim());
    }
    /**
     * List available output formats
     */
    static async listOutputFormats() {
        const binaryPath = await this.getBinaryPath();
        const result = await this.execPandoc(["--list-output-formats"], {}, binaryPath);
        if (!result.success || !result.output) {
            throw new Error("Failed to list output formats");
        }
        return result.output
            .trim()
            .split("\n")
            .map((format) => format.trim());
    }
    /**
     * List available highlight styles
     */
    static async listHighlightStyles() {
        const binaryPath = await this.getBinaryPath();
        const result = await this.execPandoc(["--list-highlight-styles"], {}, binaryPath);
        if (!result.success || !result.output) {
            throw new Error("Failed to list highlight styles");
        }
        return result.output
            .trim()
            .split("\n")
            .map((style) => style.trim());
    }
    /**
     * Get default template for a format
     */
    static async getDefaultTemplate(format) {
        const binaryPath = await this.getBinaryPath();
        const result = await this.execPandoc(["--print-default-template", format], {}, binaryPath);
        if (!result.success || !result.output) {
            throw new Error(`Failed to get default template for format: ${format}`);
        }
        return result.output;
    }
    /**
     * Execute pandoc command
     */
    static async execPandoc(args, options = {}, binaryPath) {
        const pandocPath = binaryPath || (await this.getBinaryPath());
        return new Promise((resolve, reject) => {
            const spawnOptions = {
                cwd: options.cwd,
                env: { ...process.env, ...options.env },
                stdio: ["pipe", "pipe", "pipe"],
            };
            const child = spawn(pandocPath, args, spawnOptions);
            let stdout = "";
            let stderr = "";
            let timeoutId;
            if (options.timeout) {
                timeoutId = setTimeout(() => {
                    child.kill("SIGKILL");
                    reject(new Error(`Pandoc execution timed out after ${options.timeout}ms`));
                }, options.timeout);
            }
            child.stdout?.on("data", (data) => {
                stdout += data.toString(options.encoding || "utf8");
            });
            child.stderr?.on("data", (data) => {
                stderr += data.toString(options.encoding || "utf8");
            });
            child.on("error", (error) => {
                if (timeoutId)
                    clearTimeout(timeoutId);
                reject(error);
            });
            child.on("close", (code) => {
                if (timeoutId)
                    clearTimeout(timeoutId);
                const success = code === 0;
                resolve({
                    success,
                    output: stdout || undefined,
                    error: stderr || undefined,
                });
            });
            // Send input if provided
            if (options.input && child.stdin) {
                child.stdin.write(options.input, (options.encoding || "utf8"));
                child.stdin.end();
            }
            else if (child.stdin) {
                child.stdin.end();
            }
        });
    }
    /**
     * Build pandoc command line arguments from options
     */
    static buildArgs(options) {
        const args = [];
        // Input/Output formats
        if (options.from)
            args.push("--from", options.from);
        if (options.to)
            args.push("--to", options.to);
        if (options.output)
            args.push("--output", options.output);
        // Document options
        if (options.standalone)
            args.push("--standalone");
        if (options.template)
            args.push("--template", options.template);
        // Variables and metadata
        if (options.variables) {
            Object.entries(options.variables).forEach(([key, value]) => {
                args.push("--variable", `${key}=${value}`);
            });
        }
        if (options.metadata) {
            Object.entries(options.metadata).forEach(([key, value]) => {
                args.push("--metadata", `${key}=${JSON.stringify(value)}`);
            });
        }
        // Includes
        if (options.css) {
            const cssFiles = Array.isArray(options.css) ? options.css : [options.css];
            cssFiles.forEach((css) => args.push("--css", css));
        }
        if (options.includeInHeader) {
            const files = Array.isArray(options.includeInHeader)
                ? options.includeInHeader
                : [options.includeInHeader];
            files.forEach((file) => args.push("--include-in-header", file));
        }
        if (options.includeBeforeBody) {
            const files = Array.isArray(options.includeBeforeBody)
                ? options.includeBeforeBody
                : [options.includeBeforeBody];
            files.forEach((file) => args.push("--include-before-body", file));
        }
        if (options.includeAfterBody) {
            const files = Array.isArray(options.includeAfterBody)
                ? options.includeAfterBody
                : [options.includeAfterBody];
            files.forEach((file) => args.push("--include-after-body", file));
        }
        // Table of contents
        if (options.toc)
            args.push("--toc");
        if (options.tocDepth)
            args.push("--toc-depth", String(options.tocDepth));
        // Formatting
        if (options.numberSections)
            args.push("--number-sections");
        if (options.sectionDivs)
            args.push("--section-divs");
        // Math rendering
        if (options.mathml)
            args.push("--mathml");
        if (options.mathjax) {
            if (typeof options.mathjax === "string") {
                args.push("--mathjax", options.mathjax);
            }
            else {
                args.push("--mathjax");
            }
        }
        if (options.katex) {
            if (typeof options.katex === "string") {
                args.push("--katex", options.katex);
            }
            else {
                args.push("--katex");
            }
        }
        // Syntax highlighting
        if (options.highlightStyle === false) {
            args.push("--no-highlight");
        }
        else if (options.highlightStyle) {
            args.push("--highlight-style", options.highlightStyle);
        }
        // Self-contained
        if (options.selfContained)
            args.push("--self-contained");
        // Citations
        if (options.bibliography) {
            const bibFiles = Array.isArray(options.bibliography)
                ? options.bibliography
                : [options.bibliography];
            bibFiles.forEach((bib) => args.push("--bibliography", bib));
        }
        if (options.csl)
            args.push("--csl", options.csl);
        if (options.citationAbbreviations)
            args.push("--citation-abbreviations", options.citationAbbreviations);
        // Filters
        if (options.filters) {
            const filters = Array.isArray(options.filters)
                ? options.filters
                : [options.filters];
            filters.forEach((filter) => args.push("--filter", filter));
        }
        if (options.luaFilters) {
            const luaFilters = Array.isArray(options.luaFilters)
                ? options.luaFilters
                : [options.luaFilters];
            luaFilters.forEach((filter) => args.push("--lua-filter", filter));
        }
        // Paths
        if (options.dataDir)
            args.push("--data-dir", options.dataDir);
        if (options.resourcePath) {
            const paths = Array.isArray(options.resourcePath)
                ? options.resourcePath
                : [options.resourcePath];
            args.push("--resource-path", paths.join(":"));
        }
        // PDF options
        if (options.pdfEngine)
            args.push("--pdf-engine", options.pdfEngine);
        if (options.pdfEngineOpts) {
            const opts = Array.isArray(options.pdfEngineOpts)
                ? options.pdfEngineOpts
                : [options.pdfEngineOpts];
            opts.forEach((opt) => args.push("--pdf-engine-opt", opt));
        }
        // Reference options
        if (options.referenceDoc)
            args.push("--reference-doc", options.referenceDoc);
        if (options.referenceLinks)
            args.push("--reference-links");
        if (options.referenceLocation)
            args.push("--reference-location", options.referenceLocation);
        // Extract media
        if (options.extractMedia)
            args.push("--extract-media", options.extractMedia);
        // Other options
        if (options.failIfWarnings)
            args.push("--fail-if-warnings");
        if (options.verbose)
            args.push("--verbose");
        if (options.quiet)
            args.push("--quiet");
        if (options.trace)
            args.push("--trace");
        if (options.logFile)
            args.push("--log", options.logFile);
        // List options
        if (options.listInputFormats)
            args.push("--list-input-formats");
        if (options.listOutputFormats)
            args.push("--list-output-formats");
        if (options.listExtensions)
            args.push("--list-extensions", options.listExtensions);
        if (options.listHighlightLanguages)
            args.push("--list-highlight-languages");
        if (options.listHighlightStyles)
            args.push("--list-highlight-styles");
        // Print options
        if (options.printDefaultTemplate)
            args.push("--print-default-template", options.printDefaultTemplate);
        if (options.printDefaultDataFile)
            args.push("--print-default-data-file", options.printDefaultDataFile);
        if (options.printHighlightStyle)
            args.push("--print-highlight-style", options.printHighlightStyle);
        // Help/version
        if (options.version)
            args.push("--version");
        if (options.help)
            args.push("--help");
        return args;
    }
    /**
     * Parse warnings from pandoc output
     */
    static parseWarnings(output) {
        const warnings = [];
        const lines = output.split("\n");
        for (const line of lines) {
            if (line.includes("[WARNING]") ||
                line.toLowerCase().includes("warning:")) {
                warnings.push(line.trim());
            }
        }
        return warnings;
    }
    /**
     * Install pandoc binary automatically
     */
    static async installPandocBinary() {
        // Use child_process to run the script directly to avoid import issues
        const { spawn } = await import("child_process");
        const { fileURLToPath } = await import("url");
        const { dirname, join } = await import("path");
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const scriptPath = join(__dirname, "..", "scripts", "install-pandoc.js");
        return new Promise((resolve, reject) => {
            const child = spawn("node", [scriptPath], { stdio: "inherit" });
            child.on("close", (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`Installation script failed with code ${code}`));
                }
            });
            child.on("error", reject);
        });
    }
}
Pandoc._binaryPath = null;
Pandoc._version = null;
// Default export
export default Pandoc;
//# sourceMappingURL=pandoc.js.map