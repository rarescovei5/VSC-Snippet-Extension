export const apiService = {
  // VSC Api
  vscode: acquireVsCodeApi(),
  setupMessageListeners(stateService) {
    window.addEventListener('message', (event) => {
      const { type } = event.data;

      if (type === 'shutdown') {
        localStorage.setItem('folders', JSON.stringify(stateService.state.folders));
      }
    });
  },
  postMessage(message) {
    this.vscode.postMessage(message);
  },

  // Principium API
  baseUrl: 'http://localhost:3000',
  async getDiscoverSnippets(page = 1, language = '', title = '') {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit: 30,
        ...(searchQuery.length > 0 && { title: searchQuery }),
        ...(language.length > 0 && { language }),
      });

      const url = `${this.baseUrl}/api/v1/snippets/discover?${queryParams.toString()}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.snippets || [];
    } catch (error) {
      console.error('Error fetching discover snippets:', error);
    }
  },
  async getSnippetsByIds(snippetIds) {
    if (!snippetIds || snippetIds.length === 0) {
      return [];
    }

    try {
      const url = `${this.baseUrl}/api/v1/snippets/ids`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: snippetIds }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.snippets || [];
    } catch (error) {
      console.error('Error fetching snippets by IDs:', error);
    }
  },
};
