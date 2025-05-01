(function () {
  // -=-=-=-=-=-=- VSC - Extension API -=-=-=-=-=-=-
  const vscode = acquireVsCodeApi();
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  // -=-=-=-=-=-=- Init Dom Variables -=-=-=-=-=-=-
  // Sidebar
  const settingsBtn = document.getElementById('settings-btn');
  const snippetsBtn = document.getElementById('snippets-btn');
  const newFolderBtn = document.getElementById('new-folder-btn');

  // Snippets
  const gridViewBtn = document.getElementById('gridView-btn');
  const listViewBtn = document.getElementById('listView-btn');
  const snippetsContainer = document.getElementById('snippets-container');

  // General
  const pages = {
    snippetPage: document.getElementById('snippets-page'),
    settingsPage: document.getElementById('settings-page'),
  };
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  // -=-=-=-=-=-=- Helper Functions For Handling Dom Changes -=-=-=-=-=-=-
  const getSnippetsViewHTML = (viewType) => {
    switch (viewType) {
      case 'gridView-btn':
        return '<h1>Grid</h1>';

      case 'listView-btn':
        return '<h1>List</h1>';
    }
  };
  const changePage = (path) => {
    switch (path) {
      case 'snippets-btn':
        pages.snippetPage.style.display = 'block';
        break;
      case 'settings-btn':
        pages.settingsPage.style.display = 'block';
        break;
    }
  };
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  // -=-=-=-=-=-=- Proxies - View Handling -=-=-=-=-=-=-
  let viewProxy = new Proxy(
    { activeView: gridViewBtn },
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
  let pageProxy = new Proxy(
    { activeBtn: snippetsBtn },
    {
      get(obj, prop) {
        return prop in obj ? obj[prop] : undefined;
      },
      set(obj, prop, value) {
        for (const page of Object.values(pages)) {
          page.style.display = 'none';
        }

        changePage(value.id);
        obj[prop] = value;
      },
    }
  );
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-

  // Toggle Between active pages
  const toggleSnippetsView = (event) => {
    if (viewProxy.activeView) viewProxy.activeView.classList.remove('active');
    event.target.classList.add('active');
    viewProxy.activeView = event.target;
  };
  gridViewBtn.addEventListener('click', toggleSnippetsView);
  listViewBtn.addEventListener('click', toggleSnippetsView);

  const toggleActiveBtn = (event) => {
    if (pageProxy.activeBtn) pageProxy.activeBtn.classList.remove('active');
    event.target.classList.add('active');
    pageProxy.activeBtn = event.target;
  };
  settingsBtn.addEventListener('click', toggleActiveBtn);
  snippetsBtn.addEventListener('click', toggleActiveBtn);

  //Initialize Starter Views
  snippetsContainer.innerHTML = getSnippetsViewHTML('gridView-btn');
})();
