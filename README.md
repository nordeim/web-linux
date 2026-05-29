# UbuntuOS Web

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 5.9](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite 7.2](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, high-fidelity web-based replica of the Ubuntu Linux desktop environment. This project delivers a fully interactive experience in the browser, featuring a window manager, virtual file system, and 54 functional applications.

## 🌟 Overview

UbuntuOS Web solves the challenge of creating a complex, component-based desktop experience in a web environment. It demonstrates the power of modern React by managing a multi-windowed UI with a custom z-index stacking system and a virtualized file system (VFS) that persists data locally. 

Built for developers as a showcase of architectural patterns and for users as a portable, web-accessible toolset.

## 🚀 Key Features

| Category | Apps | Highlights |
| :--- | :--- | :--- |
| **📁 System** | 7 Apps | Terminal with bash commands, File Manager, System Monitor, Settings |
| **📝 Productivity** | 10 Apps | Calendar, Spreadsheet, Todo List, Password Manager, Whiteboard |
| **🌐 Internet** | 7 Apps | Tabbed Browser, Email Client, Chat, RSS Reader, Network Tools |
| **🎬 Media** | 7 Apps | Video/Music Players, Photo Editor, Screen/Voice Recorders |
| **🎮 Games** | 11 Apps | Chess (AI), Tetris, Minesweeper, Solitaire, 2048, Sudoku |
| **🛠️ DevTools** | 8 Apps | Code Editor, Git Client, JSON Formatter, Regex Tester, API Tester |
| **🎨 Creative** | 4 Apps | Drawing, Image Gallery, Color Picker, ASCII Art |

## 🏗️ Architecture

### Tech Stack
| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 19.2.0 | Component-based UI & Hook-based logic |
| **Language** | TypeScript | 5.9.3 | Strict type safety across the OS store |
| **Styling** | Tailwind CSS | 3.4.19 | Utility-first design with Ubuntu tokens |
| **Components** | Radix UI / Shadcn | Latest | Accessible primitive components |
| **Icons** | Lucide React | 0.562.0 | Vector iconography for apps and UI |
| **Storage** | LocalStorage | N/A | Persistence for the Virtual File System |

### Core Systems
1.  **Window Manager:** A custom engine in `src/components/WindowFrame.tsx` handling dragging, resizing, focus management, and state transitions (min/max/restore).
2.  **OS Store:** Centralized state management using React Context + `useReducer` to sync the Dock, Desktop, and Windows.
3.  **Virtual File System (VFS):** A robust file management layer with associations, trash handling, and directory traversal.

## 📂 File Hierarchy

```text
📂 web-linux/
├── 📂 app/
│   ├── 📂 public/          # Static assets & wallpapers
│   └── 📂 src/
│       ├── 📂 apps/        # Individual Application implementations
│       ├── 📂 components/  # OS Shell (Dock, Desktop, TopPanel)
│       ├── 📂 hooks/       # Core OS logic (useOSStore, useFileSystem)
│       ├── 📂 lib/         # Utility functions
│       ├── 📂 types/       # Global TypeScript definitions
│       └── 📄 index.css    # Global Ubuntu design tokens
└── 📄 CLAUDE.md            # Agent-specific coding standards
```

## ⚡ Quick Start

### Prerequisites
*   Node.js ≥ 20
*   npm or yarn

### Installation & Run

1.  **Clone the repository**
2.  **Navigate to the app directory:**
    ```bash
    cd app
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Start development server:**
    ```bash
    npm run dev
    ```

### Verify Setup
After running `npm run dev`, open your browser at the provided port (usually `http://localhost:3000`). You should see the UbuntuOS boot sequence animation followed by the login screen.

## 🛠️ Build Commands

| Command | Purpose |
| :--- | :--- |
| `npm run build` | Type-check and production build |
| `npm run lint` | Run ESLint static analysis |
| `npm run preview` | Local preview of the production build |
| `tsc -b` | Project-wide type checking |

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
