# Lazydlp

> A beautiful ecosystem for interacting with `yt-dlp`. 

This repository contains both a **Terminal User Interface (TUI)** and a **Web Application** that wrap the powerful `yt-dlp` tool into gorgeous, easy-to-use interfaces.

---

## Table of Contents

- [Overview](#overview)
- [Monorepo Structure](#monorepo-structure)
- [The CLI (TUI)](#the-cli-tui)
  - [Features](#cli-features)
  - [Quick Start](#cli-quick-start)
- [The Web App](#the-web-app)
  - [Features](#web-app-features)
  - [Quick Start](#web-app-quick-start)
- [Development Setup](#development-setup)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Instead of memorizing complex flags and options for `yt-dlp`, Lazydlp gives you clean, interactive interfaces. You can choose to run it directly in your terminal with a chat-like aesthetic, or spin up the web app for a rich browser experience.

## Monorepo Structure

```text
lazydlp/
│
├── apps/
│   └── web/                   # The modern React/Vite Web Application
│
├── packages/
│   └── lazydlp/               # The interactive Ink/React CLI (TUI)
│
├── package.json               # Root monorepo workspace config
└── README.md                  # You are here
```

---

## The CLI (TUI)

Located in `packages/lazydlp`, this is a beautiful terminal wrapper built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal) and Zustand for state management.

### CLI Features

- **Slash Commands**: Type `/help`, `/clear`, `/exit`, or `/download` to interact with the app.
- **Smart Autocomplete**: Use your arrow keys to quickly select suggestions as you type.
- **Zero-Config Install**: Automatically downloads and configures the latest `yt-dlp` binary on your system via the `/configure` command. No manual installation required!
- **Live Progress UI**: Streams and parses `yt-dlp` stdout, displaying a clean graphical progress bar and ETA without terminal flickering.
- **Persistent History**: Keeps track of your recent downloads and settings locally using `zod` and `fs`.
- **Global Shortcuts**: Press `?` anywhere to bring up the shortcuts menu.

### CLI Quick Start

You can run the CLI instantly without downloading the repository using:
```bash
npx lazydlp
# or
bunx lazydlp
```

---

## The Web App

Located in `apps/web`, this is a sleek, modern web application built with Vite and React. 

### Web App Features

- **Gorgeous UI**: Built with a sleek dark mode, glassmorphism, and smooth micro-animations.
- **Interactive Forms**: Easy URL submission and configuration without touching the terminal.
- **Modern Stack**: Vite, React, Vanilla CSS.

### Web App Quick Start

To run the web app locally, you need to clone this repository and start the dev server:

```bash
# Clone the repo
git clone https://github.com/devalentineomonya/lazydlp.git
cd lazydlp

# Install dependencies
bun install

# Start the web app
bun run dev:web
```

---

## Development Setup

This repository uses **Bun** workspaces.

```bash
# Install dependencies for the entire monorepo
bun install

# Start the Web App in development mode
bun run dev:web

# Start the CLI in development mode (watches for changes)
bun run dev:cli

# Run the compiled CLI
bun run start:cli
```

---

## Contributing

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`
2. Make your changes inside `packages/lazydlp` or `apps/web`.
3. Run `bun run build:cli` or `bun run build:web` to confirm it compiles.
4. Open a pull request with a clear description of what changed.

---

## License

MIT © [Valentine Omonya](https://github.com/devalentineomonya)
