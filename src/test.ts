/**
 * Basic tests for pandoc-ts
 * Run with: node --test dist/test.js
 */

import { test } from "node:test";
import assert from "node:assert";
import { Pandoc } from "./pandoc.js";
import {
  markdownToHtml,
  htmlToMarkdown,
  isAvailable,
  version,
  getSupportedFormats,
  validateMarkdown,
  getWordCount,
} from "./utils.js";

test("Pandoc binary availability", async () => {
  const available = await isAvailable();
  assert.strictEqual(
    typeof available,
    "boolean",
    "isAvailable should return boolean",
  );

  if (available) {
    const versionString = await version();
    assert.strictEqual(
      typeof versionString,
      "string",
      "version should return string",
    );
    assert.match(versionString, /^\d+\.\d+/, "version should match pattern");
    console.log(`Pandoc version: ${versionString}`);
  } else {
    console.log("Pandoc binary not available - some tests will be skipped");
  }
});

test("Binary info", async () => {
  const info = await Pandoc.getBinaryInfo();

  assert.strictEqual(
    typeof info,
    "object",
    "getBinaryInfo should return object",
  );
  assert.strictEqual(
    typeof info.available,
    "boolean",
    "available should be boolean",
  );
  assert.strictEqual(typeof info.path, "string", "path should be string");
  assert.strictEqual(typeof info.version, "string", "version should be string");
});

test("Supported formats", async (t) => {
  await t.test("list input formats", async () => {
    try {
      const formats = await Pandoc.listInputFormats();
      assert.ok(Array.isArray(formats), "should return array");
      assert.ok(formats.includes("markdown"), "should include markdown");
      console.log(`Input formats: ${formats.length} formats supported`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        throw error;
      }
    }
  });

  await t.test("list output formats", async () => {
    try {
      const formats = await Pandoc.listOutputFormats();
      assert.ok(Array.isArray(formats), "should return array");
      assert.ok(formats.includes("html"), "should include html");
      console.log(`Output formats: ${formats.length} formats supported`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        throw error;
      }
    }
  });

  await t.test("get supported formats utility", async () => {
    try {
      const formats = await getSupportedFormats();
      assert.ok(typeof formats === "object", "should return object");
      assert.ok(Array.isArray(formats.input), "input should be array");
      assert.ok(Array.isArray(formats.output), "output should be array");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        throw error;
      }
    }
  });
});

test("Basic conversions", async (t) => {
  const markdown =
    "# Hello World\n\nThis is **bold** text and this is *italic* text.";

  await t.test("markdown to HTML", async () => {
    try {
      const result = await markdownToHtml(markdown);

      assert.strictEqual(typeof result, "object", "should return object");
      assert.strictEqual(
        typeof result.success,
        "boolean",
        "should have success property",
      );

      if (result.success) {
        assert.ok(result.output, "should have output");
        assert.ok(result.output.includes("<h1"), "should contain h1 tag");
        assert.ok(
          result.output.includes("<strong>"),
          "should contain strong tag",
        );
        assert.ok(result.output.includes("<em>"), "should contain em tag");
        console.log("Markdown to HTML conversion successful");
      } else {
        console.log("Conversion failed:", result.error);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        throw error;
      }
    }
  });

  await t.test("HTML to markdown", async () => {
    try {
      const html =
        "<h1>Hello World</h1><p>This is <strong>bold</strong> text.</p>";
      const result = await htmlToMarkdown(html);

      assert.strictEqual(typeof result, "object", "should return object");
      assert.strictEqual(
        typeof result.success,
        "boolean",
        "should have success property",
      );

      if (result.success) {
        assert.ok(result.output, "should have output");
        assert.ok(
          result.output.includes("# Hello World"),
          "should contain markdown header",
        );
        assert.ok(
          result.output.includes("**bold**"),
          "should contain markdown bold",
        );
        console.log("HTML to Markdown conversion successful");
      } else {
        console.log("Conversion failed:", result.error);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        throw error;
      }
    }
  });
});

test("Pandoc class direct usage", async (t) => {
  const markdown = "# Test Document\n\nThis is a test.";

  await t.test("convert with options", async () => {
    try {
      const result = await Pandoc.convert(markdown, {
        from: "markdown",
        to: "html",
        standalone: false,
      });

      assert.strictEqual(typeof result, "object", "should return object");
      assert.strictEqual(result.success, true, "conversion should succeed");
      assert.ok(result.output, "should have output");
      assert.ok(result.output.includes("<h1"), "should contain h1 tag");
      console.log("Direct Pandoc conversion successful");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        throw error;
      }
    }
  });
});

test("Utility functions", async (t) => {
  await t.test("validate markdown", async () => {
    const validMarkdown = "# Valid\n\nThis is valid markdown.";
    const result = await validateMarkdown(validMarkdown);

    assert.strictEqual(typeof result, "object", "should return object");
    assert.strictEqual(
      typeof result.valid,
      "boolean",
      "should have valid property",
    );
    assert.ok(Array.isArray(result.errors), "should have errors array");
    assert.ok(Array.isArray(result.warnings), "should have warnings array");
  });

  await t.test("word count", async () => {
    try {
      const text = "Hello world this is a test";
      const count = await getWordCount(text, "markdown");

      assert.strictEqual(typeof count, "number", "should return number");
      assert.strictEqual(count, 6, "should count 6 words");
      console.log(`Word count test passed: ${count} words`);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        throw error;
      }
    }
  });
});

test("Error handling", async (t) => {
  await t.test("invalid format", async () => {
    try {
      const result = await Pandoc.convert("test", {
        from: "invalid-format" as any,
        to: "html",
      });

      assert.strictEqual(
        result.success,
        false,
        "should fail with invalid format",
      );
      assert.ok(result.error, "should have error message");
      console.log("Invalid format error handling works");
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        t.skip("Pandoc binary not available");
      } else {
        // This is expected for invalid formats
        assert.ok(
          error instanceof Error && error.message,
          "should throw error for invalid format",
        );
      }
    }
  });
});

console.log("Running pandoc-ts tests...");
console.log(
  "Note: Some tests will be skipped if Pandoc binary is not available",
);
