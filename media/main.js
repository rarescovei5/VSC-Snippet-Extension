(function () {
  const vscode = acquireVsCodeApi();

  const settingsBtn = document.getElementById('settings-btn');
  const snippetsBtn = document.getElementById('snippets-btn');
  const newFolderBtn = document.getElementById('new-folder-btn');

  let activeBtn = snippetsBtn;

  const toggleActiveBtn = (event) => {
    if (activeBtn) activeBtn.classList.remove('active');
    event.target.classList.add('active');
    activeBtn = event.target;
  };

  settingsBtn.addEventListener('click', toggleActiveBtn);
  snippetsBtn.addEventListener('click', toggleActiveBtn);
})();
