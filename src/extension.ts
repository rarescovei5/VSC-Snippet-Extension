import * as vscode from 'vscode';

// ---------------------- Extension Logic ----------------------
export function activate(context: vscode.ExtensionContext) {
  /**
   * Create a button to open the webview for the extension
   */
  const sBarButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    0
  );
  sBarButton.text = '$(notebook-mimetype) Code Snippets';
  sBarButton.command = 'principium-snippets.openWebview';
  sBarButton.tooltip = 'Open Code Snippet Manager';
  sBarButton.show();

  context.subscriptions.push(
    vscode.commands.registerCommand('principium-snippets.openWebview', () => {
      SnippetPanel.createOrShow(context.extensionUri);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('principium-snippets.refresh', () => {
      SnippetPanel.kill();
      SnippetPanel.createOrShow(context.extensionUri);
    })
  );
  context.subscriptions.push(sBarButton);
}
export function deactivate() {}
//  ------------------------- Webview --------------------------

class SnippetPanel {
  public static currentPanel: SnippetPanel | undefined;

  public static readonly viewType = 'snippetManager';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's html content
    const loadHtml = async () => {
      this._panel.webview.html = await this._getHtml();
    };
    loadHtml();

    this._panel.iconPath = vscode.Uri.joinPath(
      this._extensionUri,
      'media',
      'code.svg'
    );

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case 'alert':
            vscode.window.showErrorMessage(message.text);
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it.
    if (SnippetPanel.currentPanel) {
      SnippetPanel.currentPanel._panel.reveal(column);
      return;
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      SnippetPanel.viewType,
      'Code Snippets',
      column || vscode.ViewColumn.One,
      getWebviewOptions(extensionUri)
    );

    SnippetPanel.currentPanel = new SnippetPanel(panel, extensionUri);
  }

  private async _getHtml(): Promise<string> {
    const webview = this._panel.webview;
    const htmlUri = vscode.Uri.joinPath(
      this._extensionUri,
      'media',
      'index.html'
    );

    try {
      let html = (await vscode.workspace.fs.readFile(htmlUri)).toString();

      // Uris
      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js')
      );
      const stylesUri = webview.asWebviewUri(
        vscode.Uri.joinPath(this._extensionUri, 'media', 'styles.css')
      );

      // Use a nonce to only allow specific scripts to be run
      const nonce = getNonce();

      // Replace placeholders in HTML file
      html = html
        .replace(/\${webview.cspSource}/g, webview.cspSource)
        .replace(/\${nonce}/g, nonce)
        .replace(/\${stylesUri}/g, stylesUri.toString())
        .replace(/\${scriptUri}/g, scriptUri.toString());

      return html;
    } catch (error) {
      console.error('Error reading HTML file:', error);
      return `<h1>Error loading webview</h1>`;
    }
  }

  public dispose() {
    SnippetPanel.currentPanel = undefined;

    // Clean up our resources
    this._panel.dispose();

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
  public static kill() {
    SnippetPanel.currentPanel?.dispose();
    SnippetPanel.currentPanel = undefined;
  }
}
//  -------------------- Utility Functions ---------------------
function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
  };
}
function getNonce() {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
