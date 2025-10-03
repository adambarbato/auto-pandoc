#!/usr/bin/env node

/**
 * EPUB Extraction Example
 *
 * This example demonstrates how to extract EPUB files to Markdown or HTML
 * with automatic media extraction and relative linking.
 */

import {
  epubToMarkdown,
  epubToHtml,
  isAvailable,
  version,
} from "../dist/index.js";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("📚 EPUB Extraction Example\n");

  // Check if pandoc is available
  const available = await isAvailable();
  if (!available) {
    console.log("⚠️  Pandoc is not available. Please install it first:");
    console.log("   - macOS: brew install pandoc");
    console.log("   - Ubuntu: sudo apt install pandoc");
    console.log("   - Windows: choco install pandoc");
    console.log("   - Or visit: https://pandoc.org/installing.html\n");
    return;
  }

  const pandocVersion = await version();
  console.log(`✓ Pandoc version: ${pandocVersion}\n`);

  // Check if an EPUB file was provided as argument
  const epubPath = process.argv[2];
  if (!epubPath) {
    console.log(
      "Usage: node examples/epub-extraction.js <path-to-epub-file>\n",
    );
    console.log("Example:");
    console.log("  node examples/epub-extraction.js /path/to/book.epub\n");
    console.log("This will extract the EPUB to:");
    console.log("  - examples/epub-html-media/output.html (HTML version)");
    console.log("  - examples/epub-html-media/output.md (Markdown version)");
    console.log(
      "  - examples/epub-html-media/media/ (extracted images and media)\n",
    );
    console.log(
      "Note: Media links will be relative paths, not absolute paths.\n",
    );
    return;
  }

  // Check if the EPUB file exists
  try {
    await fs.access(epubPath);
  } catch {
    console.error(`❌ Error: EPUB file not found: ${epubPath}\n`);
    return;
  }

  console.log(`📖 Processing EPUB: ${epubPath}\n`);

  const outputDir = join(__dirname, "epub-html-media");
  const mediaDir = join(outputDir, "media");
  const htmlOutput = join(outputDir, "output.html");
  const mdOutput = join(outputDir, "output.md");

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Example 1: Extract EPUB to HTML with relative media links
    console.log("🔄 Converting EPUB to HTML...");
    const htmlResult = await epubToHtml(epubPath, htmlOutput, {
      extractMedia: "./media", // Library handles CWD automatically!
      standalone: true,
      selfContained: false,
      toc: true,
      tocDepth: 3,
      metadata: {
        title: "Extracted Book",
      },
    });

    if (htmlResult.success) {
      console.log("✅ HTML conversion successful!");
      console.log(`   Output: ${htmlOutput}`);
      if (htmlResult.warnings && htmlResult.warnings.length > 0) {
        console.log("   Warnings:", htmlResult.warnings.length);
      }
    } else {
      console.error("❌ HTML conversion failed:", htmlResult.error);
    }

    // Example 2: Extract EPUB to Markdown with relative media links
    console.log("\n🔄 Converting EPUB to Markdown...");
    const mdResult = await epubToMarkdown(epubPath, mdOutput, {
      extractMedia: "./media", // Library handles CWD automatically!
      standalone: true,
      toc: true,
      tocDepth: 3,
    });

    if (mdResult.success) {
      console.log("✅ Markdown conversion successful!");
      console.log(`   Output: ${mdOutput}`);
      if (mdResult.warnings && mdResult.warnings.length > 0) {
        console.log("   Warnings:", mdResult.warnings.length);
      }
    } else {
      console.error("❌ Markdown conversion failed:", mdResult.error);
    }

    // Check if media was extracted
    console.log("\n📁 Checking extracted media...");
    try {
      const mediaFiles = await fs.readdir(mediaDir, { recursive: true });
      const imageFiles = mediaFiles.filter(
        (f) =>
          typeof f === "string" && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f),
      );

      if (imageFiles.length > 0) {
        console.log(`✓ Extracted ${imageFiles.length} image(s) to ${mediaDir}`);
        console.log("   Sample files:", imageFiles.slice(0, 5).join(", "));
      } else {
        console.log("   No images found (EPUB may not contain images)");
      }
    } catch (error) {
      console.log(
        "   No media directory created (EPUB may not contain extractable media)",
      );
    }

    // Show a sample of the output
    console.log("\n📄 Output preview:");
    try {
      const htmlContent = await fs.readFile(htmlOutput, "utf-8");
      const preview = htmlContent.substring(0, 500);
      console.log("---");
      console.log(preview + "...");
      console.log("---");

      // Check for relative links
      const hasRelativeLinks =
        htmlContent.includes('src="media/') ||
        htmlContent.includes('src="./media/');
      const hasAbsoluteLinks = htmlContent.match(/src="\/[^"]*media\//);

      console.log("\n🔗 Link analysis:");
      if (hasRelativeLinks) {
        console.log('   ✅ Contains relative links (e.g., src="media/...")');
      }
      if (hasAbsoluteLinks) {
        console.log(
          '   ⚠️  Contains absolute links (e.g., src="/path/media/...")',
        );
      }
      if (!hasRelativeLinks && !hasAbsoluteLinks) {
        console.log("   ℹ️  No media links found in output");
      }
    } catch (error) {
      console.log("   (Could not read output file)");
    }

    console.log("\n🎉 Extraction complete!");
    console.log("\n💡 Tips:");
    console.log("   - All media links are now relative paths");
    console.log(
      "   - You can move the entire output directory without breaking links",
    );
    console.log("   - The library automatically manages paths for you");
    console.log("   - Use selfContained: true to embed media directly in HTML");
  } catch (error) {
    console.error("\n❌ Error during extraction:", error.message);
    if (error.stack) {
      console.error("Stack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

// Run the example
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
