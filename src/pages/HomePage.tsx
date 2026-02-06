import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@telegram-apps/telegram-ui';

import { ArticleList } from '../components/ArticleList';
import { useAuth } from '../hooks/useAuth';

export const HomePage: FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<'all' | 'saved'>('all');

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Ошибка авторизации
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '12px' }}>
        <h1 style={{ margin: '0 0 16px 0' }}>📰 Новости</h1>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Button
            size="s"
            onClick={() => setTab('all')}
            style={{
              flex: 1,
              backgroundColor: tab === 'all' ? '#0088cc' : '#e5e5ea',
              color: tab === 'all' ? '#fff' : '#000',
            }}
          >
            Все
          </Button>
          <Button
            size="s"
            onClick={() => setTab('saved')}
            style={{
              flex: 1,
              backgroundColor: tab === 'saved' ? '#0088cc' : '#e5e5ea',
              color: tab === 'saved' ? '#fff' : '#000',
            }}
          >
            Сохранённые
          </Button>
        </div>
      </div>
      <ArticleList onArticleClick={handleArticleClick} mode={tab} userId={user.id} />
    </div>
  );
};

