import { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-powershell';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-perl';
import 'prismjs/components/prism-r';
import 'prismjs/components/prism-scala';
import 'prismjs/components/prism-haskell';

interface SyntaxHighlightedEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  placeholder?: string;
}

export function SyntaxHighlightedEditor({
  value,
  onChange,
  language,
  placeholder,
}: SyntaxHighlightedEditorProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getPrismLanguage = (lang: string): string => {
    const langLower = lang.toLowerCase();
    if (langLower.includes('javascript') || langLower === 'js') return 'javascript';
    if (langLower.includes('typescript') || langLower === 'ts') return 'typescript';
    if (langLower.includes('python')) return 'python';
    if (langLower.includes('java') && !langLower.includes('script')) return 'java';
    if (langLower.includes('c++') || langLower === 'cpp') return 'cpp';
    if (langLower.includes('c#') || langLower.includes('csharp')) return 'csharp';
    if (langLower.includes('html')) return 'markup';
    if (langLower.includes('css')) return 'css';
    if (langLower.includes('rust')) return 'rust';
    if (langLower.includes('go')) return 'go';
    if (langLower.includes('ruby')) return 'ruby';
    if (langLower.includes('php')) return 'php';
    if (langLower.includes('swift')) return 'swift';
    if (langLower.includes('kotlin')) return 'kotlin';
    if (langLower.includes('sql')) return 'sql';
    if (langLower.includes('bash') || langLower.includes('shell')) return 'bash';
    if (langLower.includes('powershell')) return 'powershell';
    if (langLower.includes('lua')) return 'lua';
    if (langLower.includes('perl')) return 'perl';
    if (langLower.includes('r')) return 'r';
    if (langLower.includes('scala')) return 'scala';
    if (langLower.includes('haskell')) return 'haskell';
    return 'javascript';
  };

  const getLanguageSuggestions = (lang: string): string[] => {
    const langLower = lang.toLowerCase();

    if (langLower.includes('javascript') || langLower === 'js') {
      return [
        'console.log()',
        'function',
        'const',
        'let',
        'var',
        'if',
        'else',
        'for',
        'while',
        'return',
        'async',
        'await',
        'try',
        'catch',
        'class',
        'import',
        'export',
        'Array',
        'Object',
        'String',
        'Number',
        'Boolean',
      ];
    } else if (langLower.includes('python')) {
      return [
        'print()',
        'def',
        'class',
        'if',
        'elif',
        'else',
        'for',
        'while',
        'return',
        'import',
        'from',
        'try',
        'except',
        'with',
        'lambda',
        'yield',
        'True',
        'False',
        'None',
      ];
    } else if (langLower.includes('java') && !langLower.includes('script')) {
      return [
        'System.out.println()',
        'public',
        'private',
        'protected',
        'class',
        'interface',
        'extends',
        'implements',
        'void',
        'int',
        'String',
        'boolean',
        'if',
        'else',
        'for',
        'while',
        'return',
        'try',
        'catch',
        'new',
      ];
    } else if (langLower.includes('html')) {
      return [
        '<div>',
        '<span>',
        '<p>',
        '<h1>',
        '<h2>',
        '<a href="">',
        '<img src="" alt="">',
        '<ul>',
        '<li>',
        '<button>',
        '<input type="">',
        '<form>',
        '<table>',
        '<header>',
        '<footer>',
        '<nav>',
        '<section>',
      ];
    }

    return [];
  };

  useEffect(() => {
    setSuggestions(getLanguageSuggestions(language));
  }, [language]);

  const highlight = (code: string) => {
    const prismLang = getPrismLanguage(language);
    try {
      return Prism.highlight(code, Prism.languages[prismLang] || Prism.languages.javascript, prismLang);
    } catch (error) {
      return code;
    }
  };

  return (
    <div className="relative h-full">
      <div className="h-full bg-[rgb(var(--bg-code))] rounded-lg overflow-hidden shadow-[var(--shadow-lg)]">
        <Editor
          value={value}
          onValueChange={onChange}
          highlight={highlight}
          placeholder={placeholder}
          padding={16}
          textareaClassName="focus:outline-none"
          style={{
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: 14,
            lineHeight: 1.6,
            minHeight: '100%',
            backgroundColor: 'transparent',
          }}
          className="syntax-editor"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-lg shadow-[var(--shadow-lg)] max-h-48 overflow-y-auto z-10">
          <div className="p-2">
            <p className="text-xs font-medium text-[rgb(var(--text-tertiary))] px-2 py-1">
              Common {language} Snippets
            </p>
            {suggestions.slice(0, 10).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  onChange(value + suggestion);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-[rgb(var(--bg-tertiary))] rounded text-sm text-[rgb(var(--text-primary))] font-mono"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="absolute bottom-4 right-4 px-3 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white text-xs font-medium rounded-lg shadow-[var(--shadow-md)] transition-colors"
      >
        {showSuggestions ? 'Hide' : 'Show'} Suggestions
      </button>
    </div>
  );
}
