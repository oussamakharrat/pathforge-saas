'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Plus, Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ALABASTER, CARBON, FLAME } from '@/lib/constants';

export type SkillCatalogOption = {
  id: string;
  name: string;
  category: string;
  marketDemand?: string;
};

interface SkillAutocompleteProps {
  value: string;
  onValueChange: (value: string, option?: SkillCatalogOption) => void;
  options: SkillCatalogOption[];
  excludeNames?: string[];
  placeholder?: string;
  disabled?: boolean;
}

const MAX_SUGGESTIONS = 8;

export function SkillAutocomplete({
  value,
  onValueChange,
  options,
  excludeNames = [],
  placeholder = 'Search skills or type your own…',
  disabled = false,
}: SkillAutocompleteProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const excluded = useMemo(
    () => new Set(excludeNames.map((name) => name.toLowerCase())),
    [excludeNames],
  );

  const availableOptions = useMemo(
    () => options.filter((option) => !excluded.has(option.name.toLowerCase())),
    [options, excluded],
  );

  const query = value.trim();
  const normalizedQuery = query.toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return availableOptions.slice(0, MAX_SUGGESTIONS);
    return availableOptions
      .filter((option) => option.name.toLowerCase().includes(normalizedQuery))
      .slice(0, MAX_SUGGESTIONS);
  }, [availableOptions, normalizedQuery]);

  const exactCatalogMatch = useMemo(
    () => availableOptions.some((option) => option.name.toLowerCase() === normalizedQuery),
    [availableOptions, normalizedQuery],
  );

  const showCustomOption =
    query.length > 0 &&
    !exactCatalogMatch &&
    !excluded.has(normalizedQuery);

  const selectableCount = filtered.length + (showCustomOption ? 1 : 0);
  const safeActiveIndex =
    selectableCount === 0 ? 0 : Math.min(activeIndex, selectableCount - 1);

  const selectOption = useCallback(
    (option: SkillCatalogOption) => {
      onValueChange(option.name, option);
      setOpen(false);
    },
    [onValueChange],
  );

  const selectCustom = useCallback(() => {
    onValueChange(query);
    setOpen(false);
  }, [onValueChange, query]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (selectableCount === 0) return;
      setActiveIndex((prev) => (prev + 1) % selectableCount);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (selectableCount === 0) return;
      setActiveIndex((prev) => (prev - 1 + selectableCount) % selectableCount);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (selectableCount === 0) {
        if (query) selectCustom();
        return;
      }
      if (safeActiveIndex < filtered.length) {
        selectOption(filtered[safeActiveIndex]);
      } else if (showCustomOption) {
        selectCustom();
      }
      return;
    }

    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => {
            onValueChange(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-11 w-full rounded-xl border border-border py-2 pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          style={{ backgroundColor: ALABASTER }}
        />
      </div>

      {open && (filtered.length > 0 || showCustomOption) && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-[60] mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-white py-1 shadow-lg"
        >
          {filtered.length > 0 && (
            <li className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Suggested skills
            </li>
          )}
          {filtered.map((option, index) => (
            <li key={option.id} role="option" aria-selected={safeActiveIndex === index}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                  safeActiveIndex === index ? 'bg-orange-50' : 'hover:bg-secondary/70',
                )}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0" style={{ color: FLAME }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold" style={{ color: CARBON }}>
                    {option.name}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {option.category}
                    {option.marketDemand ? ` · ${option.marketDemand} demand` : ''}
                  </p>
                </div>
              </button>
            </li>
          ))}

          {showCustomOption && (
            <>
              {filtered.length > 0 && <li className="mx-3 my-1 h-px bg-border" />}
              <li role="option" aria-selected={safeActiveIndex === filtered.length}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={selectCustom}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    safeActiveIndex === filtered.length ? 'bg-orange-50' : 'hover:bg-secondary/70',
                  )}
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" style={{ color: FLAME }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold" style={{ color: CARBON }}>
                      Add &ldquo;{query}&rdquo; as custom skill
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Not in the catalog — we&apos;ll create it for you
                    </p>
                  </div>
                </button>
              </li>
            </>
          )}
        </ul>
      )}

      {open && query && filtered.length === 0 && !showCustomOption && (
        <div className="absolute z-[60] mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-3 text-[12px] text-muted-foreground shadow-lg">
          This skill is already in your profile.
        </div>
      )}
    </div>
  );
}
