# 📚 Snippet Manager for VS Code

A powerful and intuitive snippet manager inside your VS Code extension panel. Organize, search, and browse code snippets with ease using folders, tags, and multiple views.

## ✨ Features

- 📁 **Folder Management**  
  Create, rename, delete, import and export folders to organize your snippets.

- 🔎 **Search and Filter**  
  Filter snippets by title and language, both globally and within folders.

- 🌐 **Infinite Scroll**  
  Seamlessly load more snippets as you scroll.

- 🗃️ **Grid & List Views**  
  Toggle between a compact grid or detailed list display.

- 🧩 **Drag and Drop**  
  Drag snippets into folders directly for quick organization.

- ⚙️ **Settings Page**  
  Switch to the settings tab for extra features.

- 💾 **Persistence**  
  All folder data is saved locally using `localStorage`.

## 🧪 Getting Started

1. Follow steps on [Principium](github.com/rarescovei5?tab=repositories) repository

2. Clone the repository:

   ```bash
   git clone https://github.com/your-username/vscode-snippet-manager.git
   cd vscode-snippet-manager
   ```

3. Install dependencies and open in VS Code:

   ```bash
   npm install
   code .
   ```

4. Press `F5` to launch the extension in a new VS Code window.

## 🧠 Architecture Overview

The extension follows a modular component-based architecture with an observer pattern for state management:

### 📂 File Structure

- **CSS**: Modular approach with separation of concerns

  - `base.css`: Core styling elements and variables
  - `components.css`: Individual component styles
  - `layout.css`: Layout and positioning rules
  - `utilities.css`: Helper classes
  - `main.css`: Entry point that imports all styles

- **JavaScript**: ES modules pattern

  - `app.js`: Main application entry point
  - **Services**:
    - `state.service.js`: Central state management with observer pattern
    - `api.service.js`: API communication layer
  - **Components**:
    - `content.js`: Path handling
    - `snippets.js`: Snippet rendering and interactions
    - `folders.js`: Folder management
    - `search.js`: Search functionality
    - `settings.js`: Settings panel operations
  - **Utils**:
    - `dom.js`: DOM manipulation utilities
    - `state.js`: stateService wrapper functions

- **Assets**:
  - `icons/`: SVG and other icon assets
  - `vendor/`: Third-party libraries

### 🔄 Observer Pattern Implementation

- The `state.service.js` acts as a central store that components observe
- Components subscribe to state changes and update accordingly
- This creates a unidirectional data flow:

  1. User interactions trigger state changes
  2. State service notifies all subscribers
  3. Components re-render based on new state

- Uses VS Code Webview API to interact with the frontend UI

## 📁 Folder Behavior

- Each folder has:
  - A custom name (editable)
  - A list of snippet IDs
  - A delete button
- Snippets are added/removed via drag-and-drop
- Folder changes persist using `localStorage`

## 📤 API Endpoints (Backend Required)

- `GET /api/v1/snippets/discover?language=exampleLanguage&title=exampleTitle&page=1&limit=10`  
  Returns paginated snippets for the discover view.

- `POST /api/v1/snippets/ids`  
  Accepts an array of IDs to fetch specific snippets (used in folders).

## 🛠️ Technologies

- [TypeScript](https://www.typescriptlang.org)
- [VS Code Extensions API](https://code.visualstudio.com/api)

## 🧾 License

MIT © Principium Studios
