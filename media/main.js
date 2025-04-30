(function () {
  // VSC - Extension API
  const vscode = acquireVsCodeApi();

  // Page Buttons
  const settingsBtn = document.getElementById('settings-btn');
  const snippetsBtn = document.getElementById('snippets-btn');

  // Add new Snippet Folder
  const newFolderBtn = document.getElementById('new-folder-btn');

  // Handle changing the Page Content
  const MainContent = document.querySelector('main');
  const changePage = (path) => {
    switch (path) {
      case 'snippets-btn':
        // Format the SnippetData into HTML
        const getSnippetsViewHTML = (viewType) => {
          switch (viewType) {
            case 'gridView-btn':
              return '<h1>Grid</h1>';

            case 'listView-btn':
              return '<h1>List</h1>';
          }
        };

        //  Setup the static parts of the page early
        MainContent.innerHTML = `
          <div id="snippetsTop-search">
            <input type='text' placeholder='Search Snippets...'/>
            <div>
              <button id='selected-language-btn'>All Languages</button>
            </div>
          </div>
          <div id="snippetsMiddle-displayWay">
            <button class="btn active" id="gridView-btn">
              Grid View
            </button>
            <button class="btn" id="listView-btn">
              List View
            </button>
          </div>
          <div id="snippets-container"></div>`;

        // Handle changing how the snippets are Displayed
        const gridViewBtn = document.getElementById('gridView-btn');
        const listViewBtn = document.getElementById('listView-btn');
        const snippetsContainer = document.getElementById('snippets-container');
        const toggleSnippetsView = (event) => {
          if (viewProxy.activeView)
            viewProxy.activeView.classList.remove('active');
          event.target.classList.add('active');
          viewProxy.activeView = event.target;
        };
        gridViewBtn.addEventListener('click', toggleSnippetsView);
        listViewBtn.addEventListener('click', toggleSnippetsView);

        // Used to automatically change between the views when a view button is clicked
        let viewProxy = new Proxy(
          {
            activeView: gridViewBtn,
          },
          {
            get(obj, prop) {
              return prop in obj ? obj[prop] : undefined;
            },
            set(obj, prop, value) {
              snippetsContainer.innerHTML = getSnippetsViewHTML(value.id);
              obj[prop] = value;
            },
          }
        );

        //Initialize content when page is opened
        snippetsContainer.innerHTML = getSnippetsViewHTML('gridView-btn');
        break;
      case 'settings-btn':
        const settingsPageHTML = `<h1>Settings</h1>`;
        MainContent.innerHTML = settingsPageHTML;
        break;
    }
  };

  // Intialize Page Content On Webview Extension Open
  changePage('snippets-btn');

  // Used to mimic different Pages - Changes the page each time a button in the sidebar is clicked
  let pageProxy = new Proxy(
    {
      activeBtn: snippetsBtn,
    },
    {
      get(obj, prop) {
        return prop in obj ? obj[prop] : undefined;
      },
      set(obj, prop, value) {
        changePage(value.id);
        obj[prop] = value;
      },
    }
  );

  // Toggle Between active pages
  const toggleActiveBtn = (event) => {
    if (pageProxy.activeBtn) pageProxy.activeBtn.classList.remove('active');
    event.target.classList.add('active');
    pageProxy.activeBtn = event.target;
  };
  settingsBtn.addEventListener('click', toggleActiveBtn);
  snippetsBtn.addEventListener('click', toggleActiveBtn);
})();
