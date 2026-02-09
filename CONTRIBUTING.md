# Contributing to File Tool

Thank you for your interest in contributing. This project is open-source and we welcome contributions that keep the codebase clean, well-documented, and maintainable.

**Documentation layout:** Only **README.md** and **CONTRIBUTING.md** (this file) live in the project root. All other documentation (architecture, development guide) is in the **[docs/](docs/)** folder.

---

## Code of conduct

- Be respectful and constructive in issues and pull requests.
- Focus on the code and the problem, not on people.

---

## How to contribute

### Reporting bugs

- Open an issue and describe the bug, steps to reproduce, and your environment (OS, Node version).
- If possible, include a minimal example (path structure, command run).

### Suggesting features

- Open an issue with a clear description of the feature and why it would be useful.
- Check existing issues first to avoid duplicates.

### Pull requests

1. **Fork the repo** and clone it locally.
2. **Create a branch** from `main` (e.g. `fix/organize-dry-run`, `feat/new-option`).
3. **Set up the project**:
   ```bash
   npm install
   npm run build
   ```
4. **Make your changes**:
   - Follow the existing structure: commands in `src/commands/`, logic in `src/core/` and `src/services/`, types in `src/types/`.
   - Keep paths cross-platform (use `path.join()` / `path.resolve()`).
   - Add or update types in `src/types/` when changing data shapes.
5. **Test**:
   - Run the CLI: `node dist/bin/cli.js <command> ...` after `npm run build`.
   - Use `--dry-run` when testing organize/rename/duplicates to avoid changing files.
6. **Documentation**:
   - Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) if you add or change layers or data flow.
   - Update [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) if you add commands, services, or important behavior.
   - Update [README.md](README.md) if you add user-facing features or options.
7. **Commit** with clear messages (e.g. `fix: handle empty directory in organize`, `feat: add --exclude option to organize`).
8. **Push** your branch and open a pull request against `main`.
9. **Describe** what the PR does and how to test it; link any related issues.

---

## Project structure (quick reference)

- **bin/cli.ts** – CLI entry (Commander setup).
- **src/commands/** – One file per command (organize, metadata, rename, duplicates, watch, init).
- **src/core/** – Business logic (plan moves, renames, duplicate groups).
- **src/services/** – File I/O, metadata, hashing, reports.
- **src/utils/** – Path helpers, config loader, logger, formatters.
- **src/plugins/** – Custom rule handling (from `.filetoolrc.json`).
- **src/types/** – TypeScript interfaces shared across the app.
- **docs/** – [ARCHITECTURE.md](docs/ARCHITECTURE.md), [DEVELOPMENT.md](docs/DEVELOPMENT.md).

For full layout and data flow, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). For step-by-step code explanations, see [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

---

## Development workflow

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to dist/
npm run dev          # Run CLI without building (ts-node)
node dist/bin/cli.js organize . --dry-run   # Example: dry-run organize
```

Use `--dry-run` when testing organize, rename, or duplicates to avoid modifying files.

---

## Code style and quality

- Use TypeScript strict mode (already enabled).
- Prefer async/await over raw Promises.
- Use the existing utils (`pathUtils`, `logger`, `configLoader`) instead of duplicating logic.
- Add brief JSDoc or inline comments for non-obvious behavior; keep file headers as in existing code.

---

## Before publishing (maintainers)

Before the first **GitHub** push or **npm** publish, update **package.json**:

1. **author** – Replace `"Arbab Tahir <arbabtahir2244@gmail.com>"` with your name and email.
2. **repository.url** – Replace `marbabtahir` with your GitHub username (or org).
3. **homepage** – Same as repository; update if your repo URL differs.
4. **bugs.url** – Same base as repository (e.g. `.../issues`).

Then:

- **GitHub:** Push the repo; ensure `docs/`, `README.md`, `CONTRIBUTING.md`, and `LICENSE` are committed.
- **npm:** Run `npm run build`, then `npm login` (once), `npm version patch` (or minor/major), and `npm publish`.

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT – see [README.md](README.md)#license and [LICENSE](LICENSE)).
