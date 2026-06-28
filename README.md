# Lazydlp

> A beautiful, interactive terminal UI (TUI) wrapper around [yt-dlp](https://github.com/yt-dlp/yt-dlp). Built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal) and inspired by the clean aesthetics of Claude Code.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running in Dev Mode](#running-in-dev-mode)
  - [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

`lazydlp` is an interactive command-line application that wraps `yt-dlp` in a modern, chat-like TUI. Instead of memorising complex flags and options, you interact with a clean terminal interface equipped with an autocomplete command bar, real-time log streaming, and dynamic progress bars.

## Features

- **Slash Commands**: Type `/help`, `/clear`, `/exit`, or `/download` to interact with the app.
- **Smart Autocomplete**: Use your arrow keys to quickly select suggestions as you type.
- **URL Validation**: Built-in validation natively ensures you only feed supported YouTube links.
- **Live Progress UI**: Streams and parses `yt-dlp` stdout, displaying a clean graphical progress bar and ETA.
- **Modular Architecture**: Component-based React structure makes it easy to add features and custom styles.

---

## Project Structure

```text
lazydlp/
│
├── source/                    # All TypeScript source files
│   ├── cli.tsx                # Entry point — parses CLI args & mounts the app
│   ├── app.tsx                # Root component (handles state, history, input)
│   ├── theme.ts               # Global theme styles
│   ├── types.ts               # Shared TypeScript interfaces
│   │
│   ├── components/            # Modular UI pieces
│   │   ├── welcome-header.tsx # The top greeting box
│   │   ├── message-history.tsx# The scrolling chat history view
│   │   ├── command-input.tsx  # The text input and autocomplete view
│   │   ├── status-bar.tsx     # The bottom status footer
│   │   ├── help-menu.tsx      # The tabbed help/options dialog
│   │   └── logo.tsx           # ASCII logo
│
├── package.json               # Node metadata, scripts, dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # You are here
```

---

## Getting Started

### Prerequisites

Make sure the following are installed on your system:

- **Node.js** ≥ 16
- **npm** (or **bun**)
- **yt-dlp** — install via your package manager:
  ```bash
  # macOS
  brew install yt-dlp

  # Debian/Ubuntu
  sudo apt install yt-dlp

  # Or with pip
  pip install yt-dlp
  ```

### Installation

```bash
# Clone the repo
git clone https://github.com/devalentineomonya/lazydlp.git
cd lazydlp

# Install dependencies
npm install
```

### Running in Dev Mode

TypeScript is compiled with `tsc --watch`; the output lands in `dist/`.

```bash
# Terminal 1 — watch & compile
npm run dev

# Terminal 2 — run the compiled CLI
node dist/cli.js
```

### Building for Production

```bash
npm run build
```

The compiled files are written to `dist/`. The `package.json` `"bin"` field points to `dist/cli.js`, so after an npm install the `lazydlp` command is available everywhere.

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes inside `source/`.
3. Run `npm run build` to confirm it compiles without errors.
4. Open a pull request with a clear description of what changed.

---

## License

MIT © [Valentine Omonya](https://github.com/devalentineomonya)
