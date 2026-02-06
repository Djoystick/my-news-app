import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@telegram-apps/telegram-ui';

import { useAuth } from '../hooks/useAuth';

interface BottomNavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: FC<BottomNavigationProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const canEdit = user.role === 'editor' || user.role === 'admin';
  const tabs = [
    'home',
    ...(canEdit ? ['editor'] as const : []),
    ...(user.role === 'admin' ? ['admin'] as const : []),
  ];

  const tabLabels: Record<string, string> = {
    home: '🏠 Главная',
    editor: '✏️ Редактор',
    admin: '🔐 Админ',
  };

  const handleChange = (index: number) => {
    const tab = tabs[index];
    onTabChange(tab);

    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'editor') {
      navigate('/editor');
    } else if (tab === 'admin') {
      navigate('/admin');
    }
  };

  return (
    <div
      style={{
        padding: '12px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: '8px',
      }}
    >
      {tabs.map((tab, index) => (
        <Button
          key={tab}
          size="s"
          onClick={() => handleChange(index)}
          style={{
            flex: 1,
            backgroundColor: currentTab === tab ? '#0088cc' : '#e5e5ea',
            color: currentTab === tab ? '#fff' : '#000',
          }}
        >
          {tabLabels[tab]}
        </Button>
      ))}
    </div>
  );
};

