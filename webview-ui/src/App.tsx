import { ContextRouter, Route, Routes } from './ContextRouter';
import AppLayout from './pages/AppLayout';
import SettingsPage from './pages/SettingsPage';
import SnippetsLayout from './pages/SnippetsLayout';
import FolderContainer from './pages/FolderContainer';
import SnippetsContainer from './pages/SnippetsContainer';

function App() {
  return (
    <ContextRouter basePath="/snippets">
      <Routes>
        <Route path="/*" element={<AppLayout />}>
          <Route path="/snippets/*" element={<SnippetsLayout />}>
            <Route path="" element={<SnippetsContainer />} />
            <Route path="/folders/:folderId" element={<FolderContainer />} />
          </Route>
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </ContextRouter>
  );
}

export default App;
