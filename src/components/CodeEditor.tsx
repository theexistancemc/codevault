import { useState, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
}

export function CodeEditor({ value, onChange, language, placeholder }: CodeEditorProps) {
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  return (
    <div className="flex h-full bg-[rgb(var(--bg-code))] rounded-lg overflow-hidden shadow-[var(--shadow-lg)]">
      <div className="flex flex-col items-end py-4 px-3 bg-[rgb(var(--bg-code-lines))] text-[rgb(var(--text-tertiary))] font-mono text-sm select-none">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="leading-6">
            {i + 1}
          </div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 p-4 bg-[rgb(var(--bg-code))] text-[rgb(var(--text-code))] placeholder:text-[rgb(var(--text-tertiary))] font-mono text-sm leading-6 resize-none focus:outline-none"
        spellCheck={false}
        style={{
          tabSize: 2,
          fontFamily: "'Fira Code', 'Courier New', monospace",
        }}
      />
    </div>
  );
}
