# Development Guide for pandoc-ts

This document provides information for developers who want to contribute to or understand the pandoc-ts project.

## Project Structure

```
pandoc-ts/
├── src/                    # TypeScript source code
│   ├── index.ts           # Main entry point and exports
│   ├── pandoc.ts          # Core Pandoc wrapper class
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions and convenience methods
│   └── test.ts            # Test suite
├── bin/                   # CLI executable
│   └── pandoc-ts.js       # Command-line interface
├── scripts/               # Build and installation scripts
│   └── install-pandoc.js  # Pandoc binary installation script
├── examples/              # Usage examples
│   ├── basic.js           # Basic usage examples
│   └── package-example.json # Example package.json
├── dist/                  # Built output (generated)
│   ├── index.js           # CommonJS build
│   ├── index.mjs          # ES modules build
│   ├── index.d.ts         # TypeScript declarations
│   └── ...                # Other built files
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── rollup.config.js       # Build configuration
└── README.md              # User documentation
```

## Architecture

### Core Components

1. **Pandoc Class** (`src/pandoc.ts`)
   - Main wrapper around the pandoc binary
   - Handles process spawning and communication
   - Manages binary discovery and execution
   - Provides low-level conversion methods

2. **Type Definitions** (`src/types.ts`)
   - Comprehensive TypeScript types for all pandoc options
   - Format enumerations and interfaces
   - Result and configuration types

3. **Utility Functions** (`src/utils.ts`)
   - High-level convenience functions
   - Common conversion patterns
   - Document presets and helpers

4. **Installation Script** (`scripts/install-pandoc.js`)
   - Downloads pandoc binary during npm install
   - Platform detection and asset selection
   - Fallback to system pandoc installation

5. **CLI Tool** (`bin/pandoc-ts.js`)
   - Command-line interface compatible with pandoc
   - Argument parsing and validation
   - File and stream handling

### Design Patterns

- **Static Class Methods**: The Pandoc class uses static methods for stateless operations
- **Promise-based API**: All async operations return promises
- **Type Safety**: Comprehensive TypeScript coverage with strict typing
- **Error Handling**: Graceful degradation when pandoc is not available
- **Platform Abstraction**: Cross-platform binary installation and execution

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- TypeScript 5.0.0 or higher
- npm or yarn package manager

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd pandoc-ts

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run examples
node examples/basic.js
```

### Development Workflow

1. **Make Changes**: Edit TypeScript files in `src/`
2. **Build**: Run `npm run build` to compile TypeScript and create bundles
3. **Test**: Run `npm test` to execute the test suite
4. **Lint**: Check code style and formatting
5. **Document**: Update README.md and examples as needed

### Available Scripts

```bash
npm run build       # Build TypeScript and create bundles
npm run prepare     # Build before publishing (runs automatically)
npm run dev         # Watch mode for development
npm test           # Run test suite
npm run postinstall # Install pandoc binary (runs after npm install)
```

## Build Process

The build process involves several steps:

1. **TypeScript Compilation**: `tsc` compiles TypeScript to JavaScript
2. **Bundle Creation**: Rollup creates both CommonJS and ES module bundles
3. **Type Declaration**: TypeScript generates `.d.ts` files for type information

### Build Configuration

- **tsconfig.json**: TypeScript compiler settings
- **rollup.config.js**: Bundle configuration for multiple formats
- **package.json**: Export maps for different module systems

## Testing

### Test Strategy

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test end-to-end conversion workflows
- **Error Handling**: Test graceful failure modes
- **Cross-platform**: Tests should work regardless of pandoc availability

### Running Tests

```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --verbose

# Run specific test files
node --test dist/test.js
```

### Test Structure

Tests are written using Node.js built-in test runner and organized into logical groups:

- Binary availability tests
- Format support tests
- Conversion functionality tests
- Utility function tests
- Error handling tests

## Binary Installation

### Installation Strategy

The package automatically installs pandoc binary during `npm install`:

1. **Check Existing**: Look for existing pandoc installation
2. **System Detection**: Determine OS and architecture
3. **Asset Selection**: Find appropriate binary from GitHub releases
4. **Download**: Download and extract binary
5. **Installation**: Place binary in local `bin/` directory
6. **Verification**: Test that installation works

### Platform Support

- **Linux**: x86_64, ARM64, i386 (.tar.gz)
- **macOS**: x86_64, ARM64 (.pkg - manual installation required)
- **Windows**: x86_64, i386 (.zip - not fully implemented)

### Fallback Strategy

If binary installation fails:
1. Try to use system-installed pandoc
2. Provide helpful error messages
3. Allow package to load but fail gracefully on conversions

## API Design

### Design Principles

1. **TypeScript First**: Full type safety and IntelliSense support
2. **Convenience**: High-level functions for common tasks
3. **Flexibility**: Low-level access to all pandoc features
4. **Consistency**: Consistent naming and parameter patterns
5. **Error Handling**: Clear error messages and graceful failures

### Function Naming

- `markdownToHtml()` - Descriptive convenience functions
- `md2html()` - Short aliases for common conversions
- `convertFormat()` - Generic conversion functions
- `Pandoc.convert()` - Low-level class methods

### Parameter Patterns

- Required parameters first
- Options objects for complex configurations
- Sensible defaults for optional parameters
- TypeScript unions for enumerated values

## Adding New Features

### Adding a New Conversion Function

1. **Add Type Definitions**: Update `src/types.ts` if needed
2. **Implement Function**: Add to `src/utils.ts`
3. **Export Function**: Add to `src/index.ts`
4. **Add Tests**: Create tests in `src/test.ts`
5. **Update Documentation**: Add to README.md

### Example: Adding EPUB conversion

```typescript
// In src/utils.ts
export async function markdownToEpub(
  markdown: string,
  options: Omit<PandocOptions, 'from' | 'to'> = {}
): Promise<PandocResult> {
  return Pandoc.convert(markdown, {
    from: 'markdown',
    to: 'epub',
    ...options
  });
}

// In src/index.ts
export { markdownToEpub } from './utils.js';

// In src/test.ts
test('EPUB conversion', async () => {
  const result = await markdownToEpub('# Test');
  // ... test implementation
});
```

## Error Handling

### Error Categories

1. **Binary Not Found**: Pandoc executable not available
2. **Conversion Errors**: Invalid input or pandoc execution failures
3. **File System Errors**: File access or permission issues
4. **Network Errors**: Binary download failures
5. **Configuration Errors**: Invalid options or parameters

### Error Handling Patterns

```typescript
// Always return result objects, never throw for conversion errors
const result = await Pandoc.convert(input, options);
if (!result.success) {
  console.error('Conversion failed:', result.error);
}

// Throw only for programming errors or system failures
try {
  const version = await Pandoc.getVersion();
} catch (error) {
  // Binary not available - this is expected in some cases
}
```

## Publishing

### Pre-publication Checklist

- [ ] All tests pass
- [ ] Version number updated
- [ ] README.md updated
- [ ] CHANGELOG.md updated
- [ ] Build artifacts are current
- [ ] Package.json fields are correct

### Publishing Process

```bash
# Ensure everything is built and tested
npm run build
npm test

# Update version
npm version patch|minor|major

# Publish to npm
npm publish
```

### Package Contents

The published package includes:
- `dist/` - Built JavaScript and type definitions
- `bin/` - CLI executable
- `scripts/` - Installation scripts
- `README.md` - Documentation
- `LICENSE` - License file
- `package.json` - Package metadata

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow ESLint/Prettier configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write tests for new functionality

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Update documentation
6. Submit pull request

### Issues and Bug Reports

When reporting issues, include:
- Operating system and version
- Node.js version
- pandoc-ts version
- Minimal reproduction example
- Error messages and stack traces

## Future Enhancements

### Planned Features

- [ ] Better Windows support with ZIP extraction
- [ ] macOS PKG installation automation
- [ ] Pandoc filter support
- [ ] Template management
- [ ] Configuration file support
- [ ] Batch conversion utilities
- [ ] Watch mode for file changes
- [ ] Plugin architecture

### Architecture Improvements

- [ ] Streaming support for large files
- [ ] Worker thread support for parallel conversions
- [ ] Caching for repeated conversions
- [ ] Better error recovery and retry logic
- [ ] Performance monitoring and optimization

## Troubleshooting

### Common Issues

**Binary Installation Fails**
- Check internet connection
- Verify platform support
- Try manual pandoc installation

**TypeScript Compilation Errors**
- Check TypeScript version compatibility
- Verify all dependencies are installed
- Clear `dist/` directory and rebuild

**Tests Fail**
- Ensure pandoc is installed for full test suite
- Check Node.js version compatibility
- Verify all dependencies are current

**CLI Tool Not Working**
- Check that binary is executable (`chmod +x bin/pandoc-ts.js`)
- Verify Node.js shebang line is correct
- Test with `node bin/pandoc-ts.js` directly

### Debug Mode

Enable verbose logging:

```bash
# For CLI
pandoc-ts --verbose input.md -o output.html

# For programmatic use
const result = await Pandoc.convert(input, { verbose: true });
```

### Getting Help

- Check the README.md for usage examples
- Look at the test files for implementation examples
- Review the examples/ directory
- Open an issue on GitHub for bugs or questions