import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@telegram-apps/telegram-ui';

import { getArticleById, type Article } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { CommentSection } from '../components/CommentSection';
import { ReactionButtons } from '../components/ReactionButtons';
import { ShareButton } from '../components/ShareButton';

export const ArticleDetailPage: FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleId) {
      void loadArticle(articleId);
    }
  }, [articleId]);

  async function loadArticle(id: string) {
    try {
      setLoading(true);
      const data = await getArticleById(id);
      setArticle(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spinner size="l" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Ошибка: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '12px' }}>
      <h1 style={{ margin: '0 0 8px 0' }}>{article.title}</h1>
      <div style={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>
        <strong>{article.author.first_name}</strong>
        {' • '}
        {new Date(article.created_at).toLocaleDateString('ru-RU')}
      </div>
      <div
        // Content is controlled via the editor, so we allow HTML here.
        dangerouslySetInnerHTML={{ __html: article.content }}
        style={{
          marginBottom: '16px',
          lineHeight: '1.6',
          wordWrap: 'break-word',
        }}
      />
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        {user && <ReactionButtons articleId={article.id} userId={user.id} />}
        <ShareButton articleTitle={article.title} articleId={article.id} />
      </div>
      {user && <CommentSection articleId={article.id} userId={user.id} />}
    </div>
  );
};

