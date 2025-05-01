(async function () {
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
  const searchInput = document.getElementById('snippets-searchInput');

  // General
  const pages = {
    snippetPage: document.getElementById('snippets-page'),
    settingsPage: document.getElementById('settings-page'),
  };
  // -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  // -=-=-=-=-=-=- Helper Functions For Handling Dom Changes -=-=-=-=-=-=-
  const getSnippetsHTML = async (viewType, page, searchQuery, language) => {
    let snippetsData;
    try {
      // Build base path
      let path = `http://localhost:3000/api/v1/snippets/discover?`;
      path += `page=${page}`;
      path += `&limit=16`;

      // Add filters if there are any
      if (searchQuery) {
        path += `&title=${searchQuery}`;
      }
      if (language) {
        path += `&language=${language}`;
      }

      // Fetch the results
      const response = await fetch(path);
      snippetsData = await response.json();
    } catch (err) {
      return '<h1>Something went wrong while getting the snippets</h1>';
    }

    switch (viewType) {
      case 'gridView-btn':
        const SnippetCard = (id, title, description, language, code) => {
          return `
          <div class="snippet-card-wrapper">
            <div class="snippet-card">
              <small>${language}</small>
              <div class="snippet-card-info">
                <h3>${title}</h3>
                <p>${description}</p>
              </div>
             <pre class="snippet-card-code-container"><code class="language-${language}">${code}</code></pre>
              <div class="snippet-card-buttons">
                <button>Preview</button>
                <button>Insert</button>
              </div>
            </div>
          </div>
          `;
        };
        let snippetsGridHTML = ``;
        for (let i = 0; i < snippetsData.records.length; i++) {
          const snippet = snippetsData.records[i];
          snippetsGridHTML += SnippetCard(
            snippet.id,
            snippet.title,
            snippet.description,
            snippet.language,
            snippet.code
          );
        }
        return snippetsGridHTML;

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
      async set(obj, prop, value) {
        snippetsContainer.innerHTML = await getSnippetsHTML(value.id);
        hljs.highlightAll();
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
  snippetsContainer.innerHTML = await getSnippetsHTML('gridView-btn', 1);
  hljs.highlightAll();
})();
