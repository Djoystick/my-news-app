import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Cell, List, Spinner } from '@telegram-apps/telegram-ui';

import { getArticles, type Article } from '../lib/supabase';

interface ArticleListProps {
  onArticleClick: (articleId: string) => void;
  mode: 'all' | 'saved';
  userId: number;
}

export const ArticleList: FC<ArticleListProps> = ({
  onArticleClick,
  mode,
  userId,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await getArticles();
        setArticles(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка загрузки';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const visibleArticles =
    mode === 'saved'
      ? articles.filter((article) => (article as any).saved_by?.includes?.(userId))
      : articles;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
        <Spinner size="l" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'red' }}>
        Ошибка: {error}
      </div>
    );
  }

  if (!visibleArticles.length) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        Нет статей для отображения
      </div>
    );
  }

  return (
    <List>
      {visibleArticles.map((article) => (
        <Cell
          key={article.id}
          onClick={() => onArticleClick(article.id)}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <strong>{article.title}</strong>
            <p style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
              {new Date(article.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </Cell>
      ))}
    </List>
  );
};

