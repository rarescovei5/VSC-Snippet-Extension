import { BrowserRouter, Route, Routes } from './ContextRouter';
import AppLayout from './pages/AppLayout';
import SettingsPage from './pages/SettingsPage';
import SnippetsPage from './pages/SnippetsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppLayout />}>
          <Route path="/" element={<SnippetsPage />}></Route>
          <Route path="/settings" element={<SettingsPage />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
