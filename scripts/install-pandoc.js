#!/usr/bin/env node

// Check if dependencies are available before importing
try {
  await import("tar");
  await import("yauzl");
} catch (error) {
  console.log("Dependencies not yet installed. Skipping pandoc installation.");
  console.log(
    "Run 'npm install' to install pandoc binary after dependencies are available.",
  );
  process.exit(0);
}

import { promises as fs, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { createGunzip } from "zlib";
import tar from "tar";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PANDOC_RELEASES_URL =
  "https://api.github.com/repos/jgm/pandoc/releases/latest";
const PROJECT_ROOT = join(__dirname, "..");
const BIN_DIR = join(PROJECT_ROOT, "bin");

/**
 * Get system information
 */
function getSystemInfo() {
  const platform = process.platform;
  const arch = process.arch;

  let os, architecture, extension;

  switch (platform) {
    case "win32":
      os = "windows";
      extension = ".zip";
      break;
    case "darwin":
      os = "macOS";
      extension = ".zip";
      break;
    case "linux":
      os = "linux";
      extension = ".tar.gz";
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  switch (arch) {
    case "x64":
      architecture = "x86_64";
      break;
    case "arm64":
      architecture = "arm64";
      break;
    case "ia32":
      architecture = "i386";
      break;
    default:
      throw new Error(`Unsupported architecture: ${arch}`);
  }

  return { os, architecture, extension, platform };
}

/**
 * Check if pandoc is already installed
 */
async function checkExistingInstallation() {
  try {
    const pandocPath = join(
      BIN_DIR,
      process.platform === "win32" ? "pandoc.exe" : "pandoc",
    );
    await fs.access(pandocPath);

    // Test if it works
    const result = await new Promise((resolve) => {
      const child = spawn(pandocPath, ["--version"], { stdio: "pipe" });
      let output = "";

      child.stdout?.on("data", (data) => {
        output += data.toString();
      });

      child.on("close", (code) => {
        resolve({ success: code === 0, output });
      });

      child.on("error", () => {
        resolve({ success: false, output: "" });
      });
    });

    if (result.success) {
      console.log("✓ Pandoc is already installed and working");
      const versionMatch = result.output.match(/pandoc (\d+\.\d+(?:\.\d+)?)/);
      if (versionMatch) {
        console.log(`  Version: ${versionMatch[1]}`);
      }
      return true;
    }
  } catch (error) {
    // Installation not found or not working
  }

  return false;
}

/**
 * Fetch latest release information
 */
async function getLatestRelease() {
  console.log("Fetching latest pandoc release information...");

  try {
    const response = await fetch(PANDOC_RELEASES_URL, {
      headers: {
        "User-Agent": "pandoc-ts-installer",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      version: data.tag_name,
      assets: data.assets,
    };
  } catch (error) {
    console.error("Failed to fetch release information:", error.message);
    throw error;
  }
}

/**
 * Find appropriate download asset
 */
function findDownloadAsset(assets, systemInfo) {
  const { os, architecture, extension } = systemInfo;

  // Try to find the best match
  let asset = assets.find((asset) => {
    const name = asset.name.toLowerCase();
    return (
      name.includes(os.toLowerCase()) &&
      name.includes(architecture) &&
      name.endsWith(extension)
    );
  });

  // Fallback patterns for different naming conventions
  if (!asset) {
    const patterns = [
      `pandoc-.*-${os}-${architecture}${extension}`,
      `pandoc-.*-${architecture}-${os}${extension}`,
      `pandoc-.*${os}.*${architecture}${extension}`,
      `pandoc-.*${architecture}.*${os}${extension}`,
    ];

    for (const pattern of patterns) {
      const regex = new RegExp(pattern, "i");
      asset = assets.find((asset) => regex.test(asset.name));
      if (asset) break;
    }
  }

  if (!asset) {
    console.error(`Available assets:`);
    assets.forEach((asset) => console.error(`  ${asset.name}`));
    throw new Error(
      `No compatible pandoc binary found for ${os} ${architecture}`,
    );
  }

  return asset;
}

/**
 * Download file with progress
 */
async function downloadFile(url, outputPath) {
  console.log(`Downloading ${url}`);
  console.log(`Saving to ${outputPath}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const totalSize = parseInt(response.headers.get("content-length") || "0");
  let downloadedSize = 0;

  const writeStream = createWriteStream(outputPath);

  // Convert web stream to Node.js stream
  const reader = response.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      downloadedSize += value.length;

      // Simple progress tracking
      if (totalSize > 0) {
        const percent = Math.round((downloadedSize / totalSize) * 100);
        process.stdout.write(
          `\rProgress: ${percent}% (${Math.round(downloadedSize / 1024 / 1024)}MB / ${Math.round(totalSize / 1024 / 1024)}MB)`,
        );
      }

      writeStream.write(value);
    }
  } finally {
    reader.releaseLock();
  }

  writeStream.end();

  // Wait for stream to finish
  await new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  console.log("\n✓ Download completed");
}

/**
 * Extract archive
 */
async function extractArchive(archivePath, extractDir, systemInfo) {
  console.log("Extracting archive...");

  if (systemInfo.extension === ".tar.gz") {
    // Extract tar.gz
    await tar.extract({
      file: archivePath,
      cwd: extractDir,
      strip: 1, // Remove the top-level directory
    });
  } else if (systemInfo.extension === ".zip") {
    // Extract ZIP file using yauzl library
    const yauzl = await import("yauzl");

    await new Promise((resolve, reject) => {
      yauzl.default.open(archivePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }

        let pendingExtractions = 0;
        let entriesProcessed = 0;

        const checkCompletion = () => {
          if (pendingExtractions === 0 && entriesProcessed > 0) {
            resolve();
          }
        };

        zipfile.on("entry", (entry) => {
          entriesProcessed++;

          if (/\/$/.test(entry.fileName)) {
            // Directory entry - create directory
            const dirPath = join(extractDir, entry.fileName);
            fs.mkdir(dirPath, { recursive: true })
              .then(() => {
                zipfile.readEntry();
              })
              .catch(reject);
          } else {
            // File entry - extract file
            pendingExtractions++;

            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }

              const filePath = join(extractDir, entry.fileName);
              const fileDir = dirname(filePath);

              // Ensure directory exists
              fs.mkdir(fileDir, { recursive: true })
                .then(() => {
                  const writeStream = createWriteStream(filePath);

                  readStream.pipe(writeStream);

                  writeStream.on("close", () => {
                    pendingExtractions--;
                    checkCompletion();
                    zipfile.readEntry();
                  });

                  writeStream.on("error", reject);
                })
                .catch(reject);
            });
          }
        });

        zipfile.on("end", () => {
          if (entriesProcessed === 0) {
            resolve();
          } else {
            checkCompletion();
          }
        });

        zipfile.on("error", reject);
        zipfile.readEntry();
      });
    });
  } else if (systemInfo.extension === ".pkg") {
    // For macOS PKG, we'd need to use system installer
    throw new Error(
      "PKG installation not implemented yet. Please install pandoc manually for macOS.",
    );
  }

  console.log("✓ Extraction completed");
}

/**
 * Find and copy pandoc binary
 */
async function findAndCopyBinary(extractDir, binDir, systemInfo) {
  console.log("Looking for pandoc binary...");

  const binaryName = systemInfo.platform === "win32" ? "pandoc.exe" : "pandoc";

  // Recursively search for pandoc binary
  async function findBinary(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          const found = await findBinary(fullPath);
          if (found) return found;
        } else if (entry.name === binaryName) {
          return fullPath;
        }
      }
    } catch (error) {
      // Ignore permission errors etc.
    }

    return null;
  }

  const binaryPath = await findBinary(extractDir);
  if (!binaryPath) {
    throw new Error(`Could not find ${binaryName} in extracted files`);
  }

  console.log(`Found binary at: ${binaryPath}`);

  // Ensure bin directory exists
  await fs.mkdir(binDir, { recursive: true });

  // Copy binary to bin directory
  const targetPath = join(binDir, binaryName);
  await fs.copyFile(binaryPath, targetPath);

  // Make it executable on Unix systems
  if (systemInfo.platform !== "win32") {
    await fs.chmod(targetPath, 0o755);
  }

  console.log(`✓ Binary copied to: ${targetPath}`);
  return targetPath;
}

/**
 * Verify installation
 */
async function verifyInstallation(binaryPath) {
  console.log("Verifying installation...");

  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, ["--version"], { stdio: "pipe" });
    let output = "";

    child.stdout?.on("data", (data) => {
      output += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log("✓ Installation verified successfully");
        const versionMatch = output.match(/pandoc (\d+\.\d+(?:\.\d+)?)/);
        if (versionMatch) {
          console.log(`  Pandoc version: ${versionMatch[1]}`);
        }
        resolve(true);
      } else {
        reject(new Error(`Verification failed with exit code: ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Clean up temporary files
 */
async function cleanup(tempDir) {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log("✓ Cleanup completed");
  } catch (error) {
    console.warn("⚠ Failed to cleanup temporary files:", error.message);
  }
}

/**
 * Main installation function
 */
async function installPandoc() {
  try {
    console.log("🚀 Installing Pandoc binary...\n");

    // Check if already installed
    if (await checkExistingInstallation()) {
      return;
    }

    // Check if system pandoc is available
    try {
      const child = spawn("pandoc", ["--version"], { stdio: "pipe" });
      let output = "";

      child.stdout?.on("data", (data) => {
        output += data.toString();
      });

      const result = await new Promise((resolve) => {
        child.on("close", (code) => {
          resolve({ success: code === 0, output });
        });
        child.on("error", () => {
          resolve({ success: false, output: "" });
        });
      });

      if (result.success) {
        console.log("✓ System pandoc found and working");
        const versionMatch = result.output.match(/pandoc (\d+\.\d+(?:\.\d+)?)/);
        if (versionMatch) {
          console.log(`  Version: ${versionMatch[1]}`);
        }

        // Create a symlink or copy for consistency
        await fs.mkdir(BIN_DIR, { recursive: true });
        const targetPath = join(
          BIN_DIR,
          process.platform === "win32" ? "pandoc.exe" : "pandoc",
        );

        try {
          // Try to create a symlink first
          await fs.symlink("pandoc", targetPath);
        } catch (error) {
          // If symlink fails, note that system pandoc will be used
          console.log("  Using system pandoc installation");
        }

        console.log("\n🎉 Pandoc setup completed successfully!");
        return;
      }
    } catch (error) {
      // Continue with binary installation
    }

    // Get system information
    const systemInfo = getSystemInfo();
    console.log(`System: ${systemInfo.os} ${systemInfo.architecture}`);

    // Get latest release
    const release = await getLatestRelease();
    console.log(`Latest version: ${release.version}`);

    // Find appropriate download
    const asset = findDownloadAsset(release.assets, systemInfo);
    console.log(`Selected asset: ${asset.name}`);

    // Create temporary directory
    const tempDir = join(PROJECT_ROOT, ".tmp-pandoc-install");
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Download
      const archivePath = join(tempDir, asset.name);
      await downloadFile(asset.browser_download_url, archivePath);

      // Extract
      const extractDir = join(tempDir, "extracted");
      await fs.mkdir(extractDir, { recursive: true });
      await extractArchive(archivePath, extractDir, systemInfo);

      // Find and copy binary
      const binaryPath = await findAndCopyBinary(
        extractDir,
        BIN_DIR,
        systemInfo,
      );

      // Verify
      await verifyInstallation(binaryPath);

      console.log("\n🎉 Pandoc installation completed successfully!");
    } finally {
      // Cleanup
      await cleanup(tempDir);
    }
  } catch (error) {
    console.error("\n❌ Installation failed:", error.message);
    console.error(
      "\nYou can install pandoc manually from: https://pandoc.org/installing.html",
    );

    // Don't exit with error - let the module work if system pandoc is available
    console.error(
      "The package will attempt to use system pandoc if available.",
    );
  }
}

// Run installation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  installPandoc();
}

export default installPandoc;
