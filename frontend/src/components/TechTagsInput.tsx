'use client';

import { useMemo, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALABASTER, CARBON, FLAME } from '@/lib/constants';

interface TechTagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TechTagsInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Type a technology and press Enter',
}: TechTagsInputProps) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedValue = useMemo(
    () => new Set(value.map((tag) => tag.toLowerCase())),
    [value],
  );

  const filteredSuggestions = useMemo(() => {
    const query = input.trim().toLowerCase();
    return suggestions
      .filter((item) => !normalizedValue.has(item.toLowerCase()))
      .filter((item) => !query || item.toLowerCase().includes(query))
      .slice(0, 6);
  }, [input, normalizedValue, suggestions]);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (normalizedValue.has(tag.toLowerCase())) {
      setInput('');
      return;
    }
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((item) => item !== tag));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (input.trim()) {
        addTag(input);
      } else if (filteredSuggestions[0]) {
        addTag(filteredSuggestions[0]);
      }
      return;
    }
    if (event.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div>
      <div
        className="tr-input min-h-11 rounded-xl border border-border px-3 py-2 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring"
        style={{ backgroundColor: ALABASTER }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: 'rgba(241,80,37,0.1)', color: CARBON }}
            >
              {tag}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeTag(tag);
                }}
                className="rounded hover:bg-black/5"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : 'Add another…'}
            className="tr-input min-w-[120px] flex-1 bg-transparent py-1 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {open && filteredSuggestions.length > 0 && (
        <ul className="anim-dropdown mt-1.5 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          {filteredSuggestions.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addTag(suggestion)}
                className="tr-interactive flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-secondary/70"
              >
                <Plus className="h-3.5 w-3.5" style={{ color: FLAME }} />
                <span className={cn('font-semibold')} style={{ color: CARBON }}>{suggestion}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
