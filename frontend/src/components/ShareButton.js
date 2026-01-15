import React from 'react';
import { Facebook, Twitter, Share2, Link, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

const ShareButton = ({ consultation, shareToken, onGenerateLink, language = 'it' }) => {
  const baseUrl = window.location.origin;
  const shareUrl = shareToken 
    ? `${baseUrl}/shared/${shareToken}` 
    : null;
  
  const shareText = language === 'it'
    ? `Ho consultato l'I Ching e ho ottenuto l'esagramma "${consultation.hexagram_name}". Scopri la tua guida spirituale!`
    : `I consulted the I Ching and received the hexagram "${consultation.hexagram_name}". Discover your spiritual guidance!`;
  
  const handleCopyLink = async () => {
    if (!shareUrl) {
      await onGenerateLink();
      return;
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(language === 'it' ? 'Link copiato!' : 'Link copied!');
    } catch (err) {
      toast.error(language === 'it' ? 'Errore nel copiare il link' : 'Error copying link');
    }
  };

  const handleShare = async (platform) => {
    let url = shareUrl;
    
    if (!url) {
      const token = await onGenerateLink();
      if (token) {
        url = `${baseUrl}/shared/${token}`;
      } else {
        return;
      }
    }
    
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="btn-secondary flex items-center space-x-2"
          data-testid="share-btn"
        >
          <Share2 className="w-4 h-4" />
          <span>{language === 'it' ? 'Condividi' : 'Share'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#F9F7F2] border-[#D1CDC7] w-48">
        <DropdownMenuItem 
          onClick={() => handleShare('facebook')}
          className="cursor-pointer flex items-center space-x-2"
          data-testid="share-facebook"
        >
          <Facebook className="w-4 h-4 text-[#1877F2]" />
          <span>Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('twitter')}
          className="cursor-pointer flex items-center space-x-2"
          data-testid="share-twitter"
        >
          <Twitter className="w-4 h-4 text-[#1DA1F2]" />
          <span>X (Twitter)</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('whatsapp')}
          className="cursor-pointer flex items-center space-x-2"
          data-testid="share-whatsapp"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('telegram')}
          className="cursor-pointer flex items-center space-x-2"
          data-testid="share-telegram"
        >
          <MessageCircle className="w-4 h-4 text-[#0088cc]" />
          <span>Telegram</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleCopyLink}
          className="cursor-pointer flex items-center space-x-2"
          data-testid="share-copy-link"
        >
          <Link className="w-4 h-4 text-[#595959]" />
          <span>{language === 'it' ? 'Copia link' : 'Copy link'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;
