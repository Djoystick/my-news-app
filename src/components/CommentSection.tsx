import type { ChangeEvent, FC } from 'react';
import { useEffect, useState } from 'react';
import { Button, List, Cell, Input } from '@telegram-apps/telegram-ui';

import { supabase, addComment, type Comment } from '../lib/supabase';

interface CommentSectionProps {
  articleId: string;
  userId: number;
}

export const CommentSection: FC<CommentSectionProps> = ({
  articleId,
  userId,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetchComments();

    // Subscribe to new comments in real time.
    const channel = supabase
      .channel(`comments:${articleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`,
        },
        async (payload: any) => {
          const { data } = await supabase
            .from('comments')
            .select(
              '*, author:user_profiles(id, username, first_name, last_name, photo_url, role, created_at)',
            )
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setComments((prev) => [...prev, data as Comment]);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [articleId]);

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select(
        '*, author:user_profiles(id, username, first_name, last_name, photo_url, role, created_at)',
      )
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments((data as Comment[]) || []);
    }
  }

  async function handleAddComment() {
    if (!newCommentText.trim()) return;

    try {
      setLoading(true);
      const comment = await addComment(articleId, userId, newCommentText);
      setComments((prev) => [...prev, comment]);
      setNewCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <Input
          placeholder="Напишите комментарий..."
          value={newCommentText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCommentText(e.target.value)}
          onSubmit={handleAddComment}
        />
        <Button
          onClick={handleAddComment}
          disabled={loading || !newCommentText.trim()}
          size="s"
        >
          {loading ? '...' : 'OK'}
        </Button>
      </div>
      <List>
        {comments.map((comment) => (
          <Cell key={comment.id}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{comment.author.first_name}</strong>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(comment.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', color: '#000' }}>
                {comment.content}
              </p>
            </div>
          </Cell>
        ))}
      </List>
    </div>
  );
}

