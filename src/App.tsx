import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { routes } from '@/navigation/routes';

function isTelegramEnv() {
  try {
    // @ts-ignore
    return Boolean(window.Telegram?.WebApp);
  } catch {
    return false;
  }
}

export function App() {
  const telegram = isTelegramEnv()
    // @ts-ignore
    ? window.Telegram.WebApp
    : null;

  const isDark = telegram?.colorScheme === 'dark';

  return (
    <AppRoot appearance={isDark ? 'dark' : 'light'}>
      <HashRouter>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} {...route} />
          ))}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AppRoot>
  );
}
