import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Input } from '../ui/input';

interface TagInputProps {
  id: string;
  placeholder: string;
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}

export default function TagInput({ id, placeholder, tags, onAdd, onRemove }: TagInputProps) {
  const [input, setInput] = useState('');

  function add() {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) onAdd(trimmed);
    setInput('');
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          id={id}
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-ds-surface2 border border-ds-border hover:border-ds-accent/60 hover:bg-ds-hover transition-all"
        >
          <Plus size={15} className="text-ds-accent" />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-ds-surface2 border border-ds-border rounded-lg text-xs text-ds-text">
              {tag}
              <button type="button" onClick={() => onRemove(i)} className="text-ds-muted hover:text-red-400 transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
