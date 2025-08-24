#!/usr/bin/env node

/**
 * Basic usage examples for pandoc-ts
 *
 * This file demonstrates how to use the pandoc-ts library
 * for common document conversion tasks.
 */

import {
  Pandoc,
  markdownToHtml,
  markdownToPdf,
  htmlToMarkdown,
  md2html,
  isAvailable,
  version,
} from "../dist/index.js";

async function main() {
  console.log("🚀 pandoc-ts Examples\n");

  // Check if pandoc is available
  const available = await isAvailable();
  console.log(`Pandoc available: ${available}`);

  if (available) {
    const pandocVersion = await version();
    console.log(`Pandoc version: ${pandocVersion}\n`);
  } else {
    console.log(
      "⚠️  Pandoc binary not available. Install it to run conversions.\n",
    );
    console.log("Install pandoc from: https://pandoc.org/installing.html");
    console.log("Or on macOS: brew install pandoc");
    console.log("Or on Ubuntu: sudo apt install pandoc\n");
    return;
  }

  // Example markdown content
  const markdown = `
# My Document

This is a sample document with **bold text** and *italic text*.

## Code Example

Here's some JavaScript code:

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}

hello('World');
\`\`\`

## List

- Item 1
- Item 2
  - Nested item
- Item 3

## Math

The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$

## Links

Visit [Pandoc](https://pandoc.org/) for more information.
`;

  console.log("📄 Sample Markdown Content:");
  console.log("---");
  console.log(markdown.trim());
  console.log("---\n");

  try {
    // Example 1: Simple markdown to HTML conversion
    console.log("🔄 Example 1: Markdown to HTML (simple)");
    const htmlResult = await markdownToHtml(markdown);

    if (htmlResult.success) {
      console.log("✅ Conversion successful!");
      console.log("HTML Output:");
      console.log(htmlResult.output?.substring(0, 200) + "...\n");
    } else {
      console.log("❌ Conversion failed:", htmlResult.error);
    }

    // Example 2: Markdown to HTML with options
    console.log("🔄 Example 2: Markdown to HTML (with options)");
    const styledHtmlResult = await markdownToHtml(markdown, {
      standalone: true,
      highlightStyle: "pygments",
      mathJax: true,
      toc: true,
      metadata: {
        title: "My Sample Document",
        author: "pandoc-ts Example",
      },
    });

    if (styledHtmlResult.success) {
      console.log("✅ Styled conversion successful!");
      console.log(
        "Document length:",
        styledHtmlResult.output?.length,
        "characters\n",
      );
    } else {
      console.log("❌ Styled conversion failed:", styledHtmlResult.error);
    }

    // Example 3: Using the short function names
    console.log("🔄 Example 3: Using short function (md2html)");
    const shortResult = await md2html(
      "# Quick Test\n\nThis is a **quick** test.",
    );

    if (shortResult.success) {
      console.log("✅ Quick conversion successful!");
      console.log("Output:", shortResult.output, "\n");
    }

    // Example 4: HTML back to markdown
    console.log("🔄 Example 4: HTML to Markdown");
    const htmlInput =
      "<h1>Hello</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p>";
    const markdownResult = await htmlToMarkdown(htmlInput);

    if (markdownResult.success) {
      console.log("✅ HTML to Markdown successful!");
      console.log("Markdown Output:", markdownResult.output, "\n");
    }

    // Example 5: Using Pandoc class directly
    console.log("🔄 Example 5: Direct Pandoc class usage");
    const directResult = await Pandoc.convert(markdown, {
      from: "markdown",
      to: "html",
      standalone: false,
      variables: {
        "header-includes": "<style>body { font-family: Arial; }</style>",
      },
    });

    if (directResult.success) {
      console.log("✅ Direct conversion successful!");
      console.log(
        "Has custom styling:",
        directResult.output?.includes("Arial") ? "Yes" : "No",
      );
    }

    // Example 6: Get format information
    console.log("📋 Example 6: Available formats");
    try {
      const inputFormats = await Pandoc.listInputFormats();
      const outputFormats = await Pandoc.listOutputFormats();

      console.log(`Input formats available: ${inputFormats.length}`);
      console.log(`Output formats available: ${outputFormats.length}`);
      console.log(
        "Common input formats:",
        inputFormats
          .filter((f) =>
            ["markdown", "html", "docx", "latex", "rst"].includes(f),
          )
          .join(", "),
      );
      console.log(
        "Common output formats:",
        outputFormats
          .filter((f) => ["html", "pdf", "docx", "epub", "latex"].includes(f))
          .join(", "),
      );
    } catch (error) {
      console.log("Could not get format information:", error.message);
    }

    console.log("\n🎉 All examples completed successfully!");
    console.log("\n📚 More examples:");
    console.log("- Check the test file: src/test.ts");
    console.log("- Read the README.md for full API documentation");
    console.log("- Use the CLI: node bin/pandoc-ts.js --help");
  } catch (error) {
    console.error("❌ Error running examples:", error.message);
  }
}

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

// Run examples
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
