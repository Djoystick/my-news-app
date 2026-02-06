import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@telegram-apps/telegram-ui';

import { supabase, toggleReaction } from '../lib/supabase';

interface ReactionButtonsProps {
  articleId: string;
  userId: number;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export const ReactionButtons: FC<ReactionButtonsProps> = ({
  articleId,
  userId,
}) => {
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    void fetchReactions();

    // Subscribe to reaction changes.
    const channel = supabase
      .channel(`reactions:${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reactions',
          filter: `article_id=eq.${articleId}`,
        },
        () => {
          void fetchReactions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [articleId]);

  async function fetchReactions() {
    const { data } = await supabase
      .from('reactions')
      .select('emoji, user_id')
      .eq('article_id', articleId);

    if (!data) return;

    const reactionCounts: Record<string, number> = {};
    let currentUserReaction: string | null = null;

    (data as any[]).forEach((reaction) => {
      reactionCounts[reaction.emoji] = (reactionCounts[reaction.emoji] || 0) + 1;
      if (reaction.user_id === userId) {
        currentUserReaction = reaction.emoji;
      }
    });

    setReactions(reactionCounts);
    setUserReaction(currentUserReaction);
  }

  async function handleReaction(emoji: string) {
    try {
      if (userReaction === emoji) {
        // Remove existing reaction.
        await toggleReaction(articleId, userId, emoji);
        setUserReaction(null);
      } else {
        // Switch reaction.
        if (userReaction) {
          await toggleReaction(articleId, userId, userReaction);
        }
        await toggleReaction(articleId, userId, emoji);
        setUserReaction(emoji);
      }

      void fetchReactions();
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {EMOJI_OPTIONS.map((emoji) => (
        <Button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          size="s"
          style={{
            background: userReaction === emoji ? '#0088cc' : '#e5e5ea',
            color: userReaction === emoji ? '#fff' : '#000',
          }}
        >
          {emoji} {reactions[emoji] || 0}
        </Button>
      ))}
    </div>
  );
};

