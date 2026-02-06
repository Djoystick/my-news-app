import type { ChangeEvent, FC } from 'react';
import { useEffect, useState } from 'react';
import { Button, List, Cell, Input } from '@telegram-apps/telegram-ui';

import {
  updateArticle,
  createArticle,
  publishArticle,
  type Article,
  supabase,
} from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { QuillEditor } from '../components/QuillEditor';

export const EditorPage: FC = () => {
  const { user } = useAuth();
  const [myArticles, setMyArticles] = useState<Article[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (user) {
      void loadMyArticles();
    }
  }, [user]);

  async function loadMyArticles() {
    if (!user) return;

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setMyArticles((data as Article[]) || []);
    }
  }

  async function handleSaveArticle() {
    if (!title.trim() || !content.trim() || !user) return;

    try {
      if (editingArticle) {
        // Update existing article.
        await updateArticle(editingArticle.id, { title, content });
      } else {
        // Create new article.
        await createArticle(title, content, user.id);
      }

      setTitle('');
      setContent('');
      setEditingArticle(null);
      setShowNewForm(false);
      void loadMyArticles();
    } catch (err) {
      console.error('Error saving article:', err);
    }
  }

  async function handlePublish(articleId: string) {
    try {
      await publishArticle(articleId);
      void loadMyArticles();
    } catch (err) {
      console.error('Error publishing:', err);
    }
  }

  if (!user || (user.role !== 'editor' && user.role !== 'admin')) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Доступ запрещён</div>;
  }

  return (
    <div style={{ padding: '12px' }}>
      {!showNewForm ? (
        <Button
          onClick={() => {
            setShowNewForm(true);
            setEditingArticle(null);
            setTitle('');
            setContent('');
          }}
          size="l"
          style={{ width: '100%' }}
        >
          + Новая статья
        </Button>
      ) : (
        <div>
          <Input
            placeholder="Заголовок"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          />
          <QuillEditor value={content} onChange={setContent} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Button onClick={handleSaveArticle}>Сохранить</Button>
            <Button
              onClick={() => {
                setShowNewForm(false);
                setTitle('');
                setContent('');
                setEditingArticle(null);
              }}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}
      <h3 style={{ marginTop: '24px' }}>Ваши статьи</h3>
      <List>
        {myArticles.map((article) => (
          <Cell key={article.id}>
            <div>
              <strong>{article.title}</strong>
              <p style={{ fontSize: '12px', color: '#999' }}>
                {article.is_published ? '✅ Опубликовано' : '⏸ Черновик'}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                {!article.is_published && (
                  <Button onClick={() => handlePublish(article.id)} size="s">
                    Опубликовать
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setEditingArticle(article);
                    setTitle(article.title);
                    setContent(article.content);
                    setShowNewForm(true);
                  }}
                  size="s"
                >
                  Редактировать
                </Button>
              </div>
            </div>
          </Cell>
        ))}
      </List>
    </div>
  );
};

