import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export function CopyButton({ text, className }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (text) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className={cn("h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50", className)}>
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </Button>
  );
}
