# File Management CLI Tool

A professional-grade command-line interface (CLI) tool built with Node.js for organizing files, extracting metadata, detecting duplicates, and performing intelligent batch operations safely and efficiently.

This tool is designed for automation, performance, and extensibility. It supports advanced features like plugin-based rules, watch mode, smart renaming templates, duplicate detection using hashing, and configuration-driven behavior.

**Open-source** – ready to use, contribute to, and publish (e.g. GitHub, npm).

---

## Install

**Prerequisites:** Node.js 16+

```bash
# From npm (when published)
npm install -g filetool

# Or from source
git clone https://github.com/marbabtahir/file-organizer-tool.git
cd file-organizer-tool
npm install
npm run build
```

**Run:** `filetool --help` or `node dist/bin/cli.js --help` when run from source.

---

## Quick start

```bash
filetool init                          # Create .filetoolrc.json in current directory
filetool organize ./downloads --dry-run # Preview organize by type
filetool metadata README.md             # Show file metadata
filetool rename ./photos --format "{date}_{index}" --dry-run
filetool duplicates ./folder --dry-run  # Find duplicate files
```

Use `--dry-run` on organize, rename, and duplicates to preview without changing files.

---

# Project Goals

- Automate file organization
- Extract detailed metadata from files
- Provide safe batch operations (Dry Run Mode)
- Detect duplicate files using hashing
- Support configurable rules
- Enable real-time monitoring (Watch Mode)
- Maintain cross-platform compatibility
- Offer extensibility through plugin architecture

---

# Tech Stack

- Node.js
- TypeScript
- Built-in `fs` module
- `path` module
- `crypto` module
- commander.js (CLI handling)
- exif-parser (for image metadata extraction)

---

# Core Features

## 1 Organize Files by Type

### Command
```
filetool organize <path>
```

### Behavior
Files are categorized into folders based on extension or detected type.

Example structure:
```
downloads/
 ├── images/
 ├── videos/
 ├── documents/
 ├── archives/
 ├── others/
```

### Options
- `--recursive` → Scan subdirectories
- `--dry-run` → Show actions without executing
- `--verbose` → Detailed logs

---

## 2 Organize Files by Date

### Command
```
filetool organize <path> --by date
```

### Behavior
Files are sorted by creation date or EXIF date (for images).

Example structure:
```
photos/
 ├── 2026/
 │    ├── January/
 │    ├── February/
```

---

## 3 Metadata Extraction

### Command
```
filetool metadata <file>
```

### Output Includes
- File size
- File type
- Created date
- Modified date
- Image dimensions (if image)
- EXIF metadata (if available)

Uses `fs.stat()` and `exif-parser` for enriched metadata.

---

## 4 Smart File Renaming

### Command
```
filetool rename <path> --format "{date}_{index}"
```

### Supported Placeholders
- `{date}` → File creation date
- `{original}` → Original file name (without extension)
- `{index}` → Auto-incremented number
- `{ext}` → File extension
- `{size}` → File size

### Example Output
```
2026-02-04_1.jpg
2026-02-04_2.jpg
```

Supports `--dry-run` and `--recursive`.

---

## 5 Duplicate File Detection

### Command
```
filetool duplicates <path>
```

### Behavior
- Generates SHA-256 hash for each file
- Identifies files with identical content
- Reports duplicate groups

### Output Example
```
Duplicate Group 1:
 - fileA.jpg
 - copy_fileA.jpg
```

Supports:
- `--delete` (optional confirmation required)
- `--dry-run`

---

## 6 Dry Run Mode (Safety Feature)

Available for all destructive commands.

### Command Example
```
filetool organize ./downloads --dry-run
```

### Behavior
Displays actions without modifying any files.

---

## 7 Recursive Directory Support

```
--recursive
```

Scans all nested directories safely and efficiently.

---

## 8 Watch Mode (Real-Time Monitoring)

### Command
```
filetool watch <path>
```

### Behavior
- Monitors directory using `fs.watch()`
- Automatically organizes new files in real time
- Logs all actions

Supports:
- `--by type`
- `--by date`

---

## 9 Plugin-Based Custom Rules

Users can define custom organization rules via configuration file.

Example `.filetoolrc.json`:

```json
{
  "rules": [
    { "extension": ".pdf", "folder": "documents" },
    { "minSizeMB": 100, "folder": "large-files" }
  ]
}
```

### Behavior
- Overrides default categorization
- Applies rules sequentially
- Supports future plugin extensions

---

## 10 Configuration File Support

### Command
```
filetool init
```

Creates:
```
.filetoolrc.json
```

Used for:
- Custom rules
- Default behavior settings
- Folder mapping
- Rename templates

---

## 11 Interactive Mode

### Command
```
filetool organize <path> --interactive
```

### Behavior
- Prompts user before moving each file
- Confirms destructive operations
- Prevents accidental changes

---

## 12 Report Generation

After operations, generates a report file.

Example: `report.json`

### Contains
- Files moved
- Files renamed
- Duplicate groups found
- Total space saved
- Errors encountered

---

# CLI Command Overview

```
filetool organize <path> [options]
filetool metadata <file>
filetool rename <path> [options]
filetool duplicates <path> [options]
filetool watch <path> [options]
filetool init
```

---

# Project structure

```
File-Organizer-Tool/
├── bin/cli.ts          # CLI entry
├── src/
│   ├── commands/      # CLI command definitions
│   ├── services/      # File I/O, metadata, hashing, reports
│   ├── core/          # Orchestration (organize, rename, duplicates)
│   ├── utils/         # Path, config, logger, formatters
│   ├── plugins/       # Custom rule handlers
│   └── types/         # TypeScript interfaces
├── docs/              # All documentation (see below)
├── README.md          # This file (root)
├── CONTRIBUTING.md     # How to contribute (root)
└── package.json
```

Full architecture, data flow, and extension points: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

# Safety & Error Handling

- Permission error handling
- Graceful failure logging
- Confirmation prompts for destructive actions
- Dry-run enforcement for risky operations
- Safe recursive traversal

---

# Performance Considerations

- Uses async/await
- Streaming for hashing large files
- Memory-efficient directory traversal
- Non-blocking file operations

---

# Cross-Platform Compatibility

Uses:
- `path.join()`
- `path.resolve()`

No OS-specific hardcoding.

---

# Publishing (GitHub & npm)

- **GitHub:** Push the repo; root has **README.md** and **CONTRIBUTING.md**; all other docs are in **docs/**.
- **npm:** Before first publish, update **package.json**: `author`, `repository.url`, `homepage`, and `bugs.url` (replace `yourusername` with your GitHub username). Then run `npm run build`, `npm login` (once), `npm version patch`, and `npm publish`. Full checklist: [CONTRIBUTING.md](CONTRIBUTING.md#before-publishing-maintainers).

---

# Development Phases

## Phase 1 – Core
- CLI setup
- Organize by type
- Metadata extraction
- Rename system
- Dry-run mode

## Phase 2 – Advanced
- Duplicate detection
- Recursive scanning
- Watch mode
- Report generation

## Phase 3 – Professional
- Plugin system
- Config file support
- Interactive mode
- Performance optimization
- Publish to npm

---

# Documentation

**Root (only these two):**

- **[README.md](README.md)** – This file: overview, install, features.
- **[CONTRIBUTING.md](CONTRIBUTING.md)** – How to contribute (bugs, features, pull requests). Start here if you want to contribute.

**All other documentation is in [docs/](docs/):**

- **[docs/README.md](docs/README.md)** – Index of docs.
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** – Directory layout, layer responsibilities, data flow, extension points.
- **[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)** – Step-by-step guide to every command, module, service, and flow.

---

# License

MIT. This project is open-source and intended for professional and educational use. See [LICENSE](LICENSE).

