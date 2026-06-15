'use client';

import { useState } from 'react';
import { Bot, Send, Loader2, Sparkles, X, Lightbulb } from 'lucide-react';
import { Button, Input, Card } from '@/components/shared/ui';
import { projectService } from '@/services/project.service';
import { ProjectStep } from '@/types/project';

export function AIAssistantPanel({
  projectId, stepNumber, step, formContent,
}: {
  projectId: string;
  stepNumber: number;
  step: ProjectStep | null;
  formContent: Record<string, any>;
}) {
  const [open, setOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const result = await projectService.chat(projectId, stepNumber, message, { step, formContent });
      setResponse(result.response);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    setMessage('Peux-tu m\'aider à compléter cette étape ? Suggère-moi des idées basées sur mes réponses actuelles.');
    setLoading(true);
    try {
      const result = await projectService.chat(projectId, stepNumber, message || 'Peux-tu m\'aider à compléter cette étape ? Suggère-moi des idées basées sur mes réponses actuelles.', { step, formContent });
      setResponse(result.response);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-[48px] h-[48px] rounded-full bg-moss text-white shadow-lg flex items-center justify-center hover:bg-moss-mid transition-colors z-50"
      >
        <Bot size={20} />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[340px] shadow-xl border-moss/20 z-50">
      <div className="flex items-center justify-between p-[12px_16px] bg-moss/[.04] border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] rounded-[7px] bg-moss-light text-moss flex items-center justify-center">
            <Bot size={13} />
          </div>
          <span className="text-[12px] font-bold text-ink">Assistant IA</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink3 hover:text-ink transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-[12px_16px] space-y-3">
        {response && (
          <div className="p-3 rounded-[8px] bg-moss-light text-[12px] text-ink leading-relaxed max-h-[200px] overflow-y-auto">
            {response}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Posez une question..."
            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
            className="text-[12px]"
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleChat}
            loading={loading}
            className="flex-shrink-0"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={handleSuggest}
          loading={loading}
        >
          <Lightbulb size={12} /> Suggérer des idées
        </Button>
      </div>
    </Card>
  );
}
