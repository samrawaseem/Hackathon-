"use client";

import { useState, useEffect } from "react";

/**
 * TagInput Component
 * Input field for adding tags with autocomplete functionality
 * Allows users to select from existing tags or create new ones
 */

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  availableTags?: string[];
  disabled?: boolean;
}

export function TagInput({ value, onChange, availableTags = [], disabled = false }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (inputValue && availableTags.length > 0) {
      const filtered = availableTags.filter(
        (tag) =>
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(tag)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, availableTags, value]);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
      setInputValue("");
      setSuggestions([]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="relative">
      <div className={`input-cyber flex flex-wrap gap-2 min-h-[48px] items-center border-neon-cyan/20 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-robot font-bold bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_8px_rgba(0,243,255,0.2)] uppercase tracking-wider"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="hover:text-neon-magenta disabled:opacity-50 transition-colors ml-1"
              aria-label={`Purge ${tag} tag`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          id="tags"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={value.length === 0 ? "ADD_CLASSIFICATION..." : ""}
          className="flex-1 min-w-[120px] outline-none bg-transparent font-robot text-xs text-white placeholder-neon-cyan/30 uppercase tracking-widest"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-2 glass-panel bg-black/90 border-neon-cyan/40 shadow-[0_0_20px_rgba(0,243,255,0.2)] max-h-40 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              onClick={() => addTag(suggestion)}
              className="px-4 py-2 hover:bg-neon-cyan/10 cursor-pointer font-robot text-[10px] text-neon-cyan/60 hover:text-neon-cyan transition-colors uppercase tracking-widest"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
