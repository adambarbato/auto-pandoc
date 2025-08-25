#!/usr/bin/env node

/**
 * CLI wrapper for auto-pandoc
 * Provides a command-line interface to the auto-pandoc library
 */

import { promises as fs } from "fs";
import { join, resolve, extname, basename } from "path";
import { Pandoc } from "../dist/pandoc.js";

const VERSION = "1.0.0";

/**
 * Print help information
 */
function printHelp() {
  console.log(`
auto-pandoc v${VERSION} - TypeScript wrapper for Pandoc

USAGE:
  auto-pandoc [OPTIONS] [INPUT_FILE]

OPTIONS:
  -f, --from FORMAT         Input format (default: auto-detect)
  -t, --to FORMAT          Output format (default: html)
  -o, --output FILE        Output file (default: stdout)
  -s, --standalone         Produce standalone document
  --template FILE          Use custom template
  --toc                    Generate table of contents
  --toc-depth N           Table of contents depth (default: 3)
  --number-sections       Number sections
  --highlight-style STYLE  Syntax highlighting style
  --no-highlight          Disable syntax highlighting
  --mathml                Use MathML for math
  --mathjax               Use MathJax for math
  --katex                 Use KaTeX for math
  --css FILE              Link to CSS file
  --self-contained        Produce self-contained output
  --pdf-engine ENGINE     PDF engine (pdflatex, xelatex, etc.)
  --bibliography FILE     Bibliography file
  --csl FILE              Citation style file
  --filter FILTER         Apply filter
  --lua-filter FILTER     Apply Lua filter
  --verbose               Verbose output
  --quiet                 Suppress warnings
  --version               Show version
  --help                  Show this help

FORMATS:
  Input formats: markdown, html, latex, docx, epub, rst, org, etc.
  Output formats: html, pdf, docx, epub, latex, beamer, etc.

EXAMPLES:
  # Convert markdown to HTML
  auto-pandoc -f markdown -t html input.md -o output.html

  # Convert to PDF with custom options
  auto-pandoc input.md -t pdf -o output.pdf --pdf-engine=xelatex

  # Pipe input from stdin
  echo "# Hello" | auto-pandoc -f markdown -t html

  # Generate standalone HTML with table of contents
  auto-pandoc input.md -t html -s --toc -o output.html

For more information, visit: https://pandoc.org/
`);
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const options = {
    from: null,
    to: "html",
    output: null,
    standalone: false,
    template: null,
    toc: false,
    tocDepth: null,
    numberSections: false,
    highlightStyle: null,
    noHighlight: false,
    mathml: false,
    mathjax: false,
    katex: false,
    css: [],
    selfContained: false,
    pdfEngine: null,
    bibliography: [],
    csl: null,
    filters: [],
    luaFilters: [],
    verbose: false,
    quiet: false,
    variables: {},
    metadata: {},
    help: false,
    version: false,
  };

  const inputFiles = [];
  let i = 0;

  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "--version":
        options.version = true;
        break;
      case "-f":
      case "--from":
        options.from = args[++i];
        break;
      case "-t":
      case "--to":
        options.to = args[++i];
        break;
      case "-o":
      case "--output":
        options.output = args[++i];
        break;
      case "-s":
      case "--standalone":
        options.standalone = true;
        break;
      case "--template":
        options.template = args[++i];
        break;
      case "--toc":
        options.toc = true;
        break;
      case "--toc-depth":
        options.tocDepth = parseInt(args[++i]);
        break;
      case "--number-sections":
        options.numberSections = true;
        break;
      case "--highlight-style":
        options.highlightStyle = args[++i];
        break;
      case "--no-highlight":
        options.noHighlight = true;
        break;
      case "--mathml":
        options.mathml = true;
        break;
      case "--mathjax":
        options.mathjax = true;
        break;
      case "--katex":
        options.katex = true;
        break;
      case "--css":
        options.css.push(args[++i]);
        break;
      case "--self-contained":
        options.selfContained = true;
        break;
      case "--pdf-engine":
        options.pdfEngine = args[++i];
        break;
      case "--bibliography":
        options.bibliography.push(args[++i]);
        break;
      case "--csl":
        options.csl = args[++i];
        break;
      case "--filter":
        options.filters.push(args[++i]);
        break;
      case "--lua-filter":
        options.luaFilters.push(args[++i]);
        break;
      case "--verbose":
        options.verbose = true;
        break;
      case "--quiet":
        options.quiet = true;
        break;
      case "-V":
      case "--variable":
        const varPair = args[++i].split("=", 2);
        options.variables[varPair[0]] = varPair[1] || "";
        break;
      case "-M":
      case "--metadata":
        const metaPair = args[++i].split("=", 2);
        options.metadata[metaPair[0]] = varPair[1] || "";
        break;
      default:
        if (arg.startsWith("-")) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        } else {
          inputFiles.push(arg);
        }
        break;
    }
    i++;
  }

  return { options, inputFiles };
}

/**
 * Auto-detect input format from file extension
 */
function detectInputFormat(filename) {
  const ext = extname(filename).toLowerCase();
  const formatMap = {
    ".md": "markdown",
    ".markdown": "markdown",
    ".mdown": "markdown",
    ".mkd": "markdown",
    ".mkdn": "markdown",
    ".html": "html",
    ".htm": "html",
    ".tex": "latex",
    ".latex": "latex",
    ".rst": "rst",
    ".org": "org",
    ".docx": "docx",
    ".epub": "epub",
    ".fb2": "fb2",
    ".odt": "odt",
    ".rtf": "rtf",
  };
  return formatMap[ext] || "markdown";
}

/**
 * Read from stdin
 */
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/**
 * Main CLI function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    return;
  }

  const { options, inputFiles } = parseArgs(args);

  if (options.help) {
    printHelp();
    return;
  }

  if (options.version) {
    try {
      const version = await Pandoc.getVersion();
      console.log(`auto-pandoc v${VERSION}`);
      console.log(`pandoc v${version}`);
    } catch (error) {
      console.log(`auto-pandoc v${VERSION}`);
      console.log("pandoc: not available");
    }
    return;
  }

  try {
    let input = "";
    let inputPath = null;

    // Read input
    if (inputFiles.length > 0) {
      inputPath = resolve(inputFiles[0]);

      // Auto-detect format if not specified
      if (!options.from) {
        options.from = detectInputFormat(inputPath);
      }
    } else {
      // Read from stdin
      input = await readStdin();
      if (!options.from) {
        options.from = "markdown";
      }
    }

    // Convert arrays to single values where appropriate
    if (options.css.length === 1) {
      options.css = options.css[0];
    } else if (options.css.length === 0) {
      delete options.css;
    }

    if (options.bibliography.length === 1) {
      options.bibliography = options.bibliography[0];
    } else if (options.bibliography.length === 0) {
      delete options.bibliography;
    }

    if (options.filters.length === 1) {
      options.filters = options.filters[0];
    } else if (options.filters.length === 0) {
      delete options.filters;
    }

    if (options.luaFilters.length === 1) {
      options.luaFilters = options.luaFilters[0];
    } else if (options.luaFilters.length === 0) {
      delete options.luaFilters;
    }

    // Clean up null values
    Object.keys(options).forEach((key) => {
      if (options[key] === null || options[key] === false) {
        delete options[key];
      }
    });

    // Perform conversion
    let result;
    if (inputPath) {
      result = await Pandoc.convertFile(inputPath, options.output, options);
    } else {
      result = await Pandoc.convert(input, options);
    }

    // Handle results
    if (!result.success) {
      if (result.error) {
        console.error("Error:", result.error);
      }
      process.exit(1);
    }

    // Print warnings if not quiet
    if (!options.quiet && result.warnings && result.warnings.length > 0) {
      result.warnings.forEach((warning) => {
        console.warn("Warning:", warning);
      });
    }

    // Output result
    if (result.output && !options.output) {
      process.stdout.write(result.output);
    } else if (options.verbose && options.output) {
      console.error(`Output written to: ${options.output}`);
    }
  } catch (error) {
    console.error("Error:", error.message);

    if (
      error.message.includes("not found") ||
      error.message.includes("ENOENT")
    ) {
      console.error(
        "\nPandoc binary not found. Please ensure pandoc is installed.",
      );
      console.error(
        "You can install it from: https://pandoc.org/installing.html",
      );
      console.error("Or run: npm install auto-pandoc --save");
    }

    process.exit(1);
  }
}

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error.message);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error.message);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
