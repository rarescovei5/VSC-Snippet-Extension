# 📚 Snippet Manager for VS Code

A powerful and intuitive snippet manager inside your VS Code extension panel. Organize, search, and browse code snippets with ease using folders, tags, and multiple views.

---

## ✨ Features

- 📁 **Folder Management**  
  Create, rename, and delete folders to organize your snippets.

- 🔎 **Search and Filter**  
  Filter snippets by title and language, both globally and within folders.

- 🌐 **Infinite Scroll**  
  Seamlessly load more snippets as you scroll.

- 🗃️ **Grid & List Views**  
  Toggle between a compact grid or detailed list display.

- 🧩 **Drag and Drop**  
  Drag snippets into folders directly for quick organization.

- ⚙️ **Settings Page**  
  Switch to the settings tab for future customization options.

- 💾 **Persistence**  
  All folder data is saved locally using `localStorage`.

---

## 🧪 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/vscode-snippet-manager.git
   cd vscode-snippet-manager
   ```

2. Install dependencies and open in VS Code:

   ```bash
   npm install
   code .
   ```

3. Press `F5` to launch the extension in a new VS Code window.

---

## 🧠 Architecture Overview

- `SnippetApp` is the main class that handles:

  - State management (`activeViewType`, `searchParams`, `folders`, etc.)
  - Dynamic UI rendering for snippets and folders
  - API interactions (`/discover` and `/ids`)
  - Event bindings for navigation, searching, drag-drop, etc.

- Uses VS Code Webview API to interact with frontend UI.

---

## 📁 Folder Behavior

- Each folder has:
  - A custom name (editable)
  - A list of snippet IDs
  - A delete button
- Snippets are added via drag-and-drop
- Folder changes persist using `localStorage`

---

## 📤 API Endpoints (Backend Required)

- `GET /api/v1/snippets/discover?language=exampleLanguage&title=exampleTitle&page=1&limit=10`  
  Returns paginated snippets for the discover view.

- `POST /api/v1/snippets/ids`  
  Accepts an array of IDs to fetch specific snippets (used in folders).

---

## 🛠️ Technologies

- [TypeScript](https://www.typescriptlang.org)
- [VS Code Extensions API](https://code.visualstudio.com/api)

---

## 🧾 License

MIT © Principium Studios
