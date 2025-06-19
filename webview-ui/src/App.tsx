import { ContextRouter, Route, Routes } from './ContextRouter';
import AppLayout from './pages/AppLayout';
import SettingsPage from './pages/SettingsPage';
import SnippetsPage from './pages/SnippetsPage';

function App() {
  return (
    <ContextRouter>
      <Routes>
        <Route path="/*" element={<AppLayout />}>
          <Route path="/" element={<SnippetsPage />}></Route>
          <Route path="/settings" element={<SettingsPage />}></Route>
        </Route>
      </Routes>
    </ContextRouter>
  );
}

export default App;
