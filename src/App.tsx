import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppRoot } from '@telegram-apps/telegram-ui';

import { HomePage } from './pages/HomePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { EditorPage } from './pages/EditorPage';
import { AdminPage } from './pages/AdminPage';
import { BottomNavigation } from './components/BottomNavigation';

export function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'editor' | 'admin'>('home');

  return (
    <AppRoot>
      <BrowserRouter>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:articleId" element={<ArticleDetailPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
          <BottomNavigation
            currentTab={currentTab}
            onTabChange={(tab) => setCurrentTab(tab as typeof currentTab)}
          />
        </div>
      </BrowserRouter>
    </AppRoot>
  );
}

