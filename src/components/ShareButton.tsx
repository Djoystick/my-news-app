import type { FC } from 'react';
import { Button } from '@telegram-apps/telegram-ui';

interface ShareButtonProps {
  articleTitle: string;
  articleId: string;
}

export const ShareButton: FC<ShareButtonProps> = ({
  articleTitle,
  articleId,
}) => {
  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?article=${articleId}`;
    const text = `📰 ${articleTitle}\n\nЧитай в News App:\n${shareUrl}`;

    // Open link in a new tab or use Web Share API if available.
    if (navigator.share) {
      void navigator.share({ title: articleTitle, text, url: shareUrl }).catch(() => {
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
      });
    } else {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button size="s" onClick={handleShare}>
      📤 Поделиться
    </Button>
  );
};

