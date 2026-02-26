import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, Undo2 } from 'lucide-react';

interface AiEditPromptBoxProps {
  onSubmit: (instruction: string) => Promise<void>;
  onUndo: () => void;
  isProcessing: boolean;
  canUndo: boolean;
  lastInstruction?: string;
  error?: string | null;
}

const AiEditPromptBox: React.FC<AiEditPromptBoxProps> = ({
  onSubmit, onUndo, isProcessing, canUndo, lastInstruction, error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!prompt.trim() || isProcessing) return;
    const instruction = prompt.trim();
    setPrompt('');
    await onSubmit(instruction);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[105] w-14 h-14 bg-green-600 rounded-full shadow-2xl shadow-green-500/30 flex items-center justify-center text-white hover:bg-green-700 hover:scale-110 active:scale-95 transition-all"
        title="AI Editor"
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[105] w-[360px] max-w-[calc(100vw-48px)] bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <Sparkles size={16} className="text-green-400" />
          <span className="text-sm font-bold uppercase tracking-wider">AI Editor</span>
        </div>
        <div className="flex items-center gap-2">
          {canUndo && !isProcessing && (
            <button
              onClick={onUndo}
              className="text-gray-400 hover:text-white transition-colors"
              title="Undo last AI edit"
            >
              <Undo2 size={16} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Last instruction feedback */}
      {lastInstruction && !error && (
        <div className="px-4 py-2 bg-green-500/10 border-b border-white/5 text-green-300 text-xs truncate">
          Applied: "{lastInstruction}"
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-white/5 text-red-400 text-xs">
          Error: {error}
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <textarea
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='e.g. "Make the headline more catchy" or "Rewrite FAQs about pricing"'
          disabled={isProcessing}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 resize-none outline-none focus:border-green-500/50 transition-colors disabled:opacity-50"
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">
            {isProcessing ? 'Applying changes...' : 'Enter to send'}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isProcessing}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <><Loader2 size={14} className="animate-spin" /> Working</>
            ) : (
              <><Send size={14} /> Apply</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiEditPromptBox;
