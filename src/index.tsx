import eruda from 'eruda';

if (import.meta.env.PROD) {
  eruda.init();
}
import { createRoot } from 'react-dom/client';

const el = document.getElementById('root');

if (!el) {
  alert('ROOT ELEMENT NOT FOUND');
  throw new Error('Root element not found');
}

createRoot(el).render(
  <div
    style={{
      color: 'white',
      background: '#1c1c1c',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
    }}
  >
    🚀 REACT IS ALIVE
  </div>
);
