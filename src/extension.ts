import * as vscode from 'vscode';

// ---------------------- Extension Logic ----------------------
export function activate(context: vscode.ExtensionContext) {
  /**
   * Create a button to open the webview for the extension
   */
  const sBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  sBarButton.text = '$(notebook-mimetype) Code Snippets';
  sBarButton.command = 'code-snippets.openWebview';
  sBarButton.tooltip = 'Open Code Snippet Manager';
  sBarButton.show();

  context.subscriptions.push(
    vscode.commands.registerCommand('code-snippets.openWebview', () => {
      WebviewPanel.render(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('code-snippets.refresh', () => {
      WebviewPanel.currentPanel?.dispose();
      WebviewPanel.currentPanel = undefined;
    })
  );

  context.subscriptions.push(sBarButton);
}

//  ------------------------- Webview --------------------------
export class WebviewPanel {
  public static currentPanel: WebviewPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  /**
   * The WebviewPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;

    // Set an event listener to listen for when the panel is disposed (i.e. when the user closes
    // the panel or when the panel is closed programmatically)
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Set the HTML content for the webview panel
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    // Set an event listener to listen for messages passed from the webview context
    this._setWebviewMessageListener(this._panel.webview);
  }

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
  public static render(extensionUri: vscode.Uri) {
    if (WebviewPanel.currentPanel) {
      // If the webview panel already exists reveal it
      WebviewPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      // If a webview panel does not already exist create and show a new one
      const panel = vscode.window.createWebviewPanel(
        // Panel view type
        'showHelloWorld',
        // Panel title
        'Code Snippets',
        // The editor column the panel should be displayed in
        vscode.ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [
            vscode.Uri.joinPath(extensionUri, 'out'),
            vscode.Uri.joinPath(extensionUri, 'webview-ui/build'),
          ],
        }
      );

      WebviewPanel.currentPanel = new WebviewPanel(panel, extensionUri);
    }
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    WebviewPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // The CSS file from the React build output
    const stylesUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.css']);
    // The JS file from the React build output
    const scriptUri = getUri(webview, extensionUri, ['webview-ui', 'build', 'assets', 'index.js']);

    const nonce = getNonce();

    const cspDirectives = [
      `default-src 'none'`,
      `style-src ${webview.cspSource}`,
      `script-src 'nonce-${nonce}'`,
      `connect-src http://localhost:8080 ${webview.cspSource}`,
    ];
    const csp = cspDirectives.join('; ');

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="${csp}">
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Code Snippets</title>
        </head>
        <body>
          <div id="root"></div>
          <div id="drag-preview-container" class="fixed -left-96 -top-96 z-100">
            <div class="text-text relative inline-flex justify-center items-center">
              <svg width="32" height="32" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M10.5702 1.14L13.8502 4.44L14.0002 4.8V14.5L13.5002 15H2.50024L2.00024 14.5V1.5L2.50024 1H10.2202L10.5702 1.14ZM10.0002 5H13.0002L10.0002 2V5ZM3.00024 2V14H13.0002V6H9.50024L9.00024 5.5V2H3.00024ZM11.0002 7H5.00024V8H11.0002V7ZM5.00024 9H11.0002V10H5.00024V9ZM11.0002 11H5.00024V12H11.0002V11Z"
                  class="fill-text"
                />
              </svg>
              <span
                class="bg-card border border-border rounded-full flex items-center justify-center w-7 h-7 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
              ></span>
            </div>
          </div>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case 'hello':
            // Code that should run in response to the hello message command
            vscode.window.showInformationMessage(text);
            return;
          // Add more switch case statements here as more webview message commands
          // are created within the webview context (i.e. inside media/main.js)
        }
      },
      undefined,
      this._disposables
    );
  }
}

//  -------------------- Utility Functions ---------------------
function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
function getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathList: string[]) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}
