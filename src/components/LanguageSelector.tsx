import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus } from 'lucide-react';
import { POPULAR_LANGUAGES } from '../lib/supabase';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCustomInput(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = POPULAR_LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLanguage = (language: string) => {
    onLanguageChange(language);
    setIsOpen(false);
    setSearchQuery('');
    setShowCustomInput(false);
  };

  const handleAddCustomLanguage = () => {
    if (customLanguage.trim()) {
      onLanguageChange(customLanguage.trim());
      setCustomLanguage('');
      setIsOpen(false);
      setShowCustomInput(false);
      setSearchQuery('');
    }
  };

  const getLanguageColor = (language: string) => {
    const lang = language.toLowerCase();
    if (lang.includes('java')) return 'bg-red-500';
    if (lang.includes('python')) return 'bg-blue-500';
    if (lang.includes('javascript') || lang.includes('js')) return 'bg-yellow-400';
    if (lang.includes('typescript') || lang.includes('ts')) return 'bg-blue-600';
    if (lang.includes('html')) return 'bg-orange-500';
    if (lang.includes('css')) return 'bg-blue-400';
    if (lang.includes('rust')) return 'bg-orange-600';
    if (lang.includes('go')) return 'bg-cyan-500';
    if (lang.includes('ruby')) return 'bg-red-600';
    if (lang.includes('php')) return 'bg-indigo-500';
    if (lang.includes('swift')) return 'bg-orange-400';
    if (lang.includes('kotlin')) return 'bg-purple-500';
    if (lang.includes('c++') || lang.includes('cpp')) return 'bg-blue-700';
    if (lang.includes('c#') || lang.includes('csharp')) return 'bg-green-600';
    if (lang.includes('skript')) return 'bg-amber-500';
    return 'bg-gray-500';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${getLanguageColor(
          selectedLanguage
        )} text-white shadow-[var(--shadow-md)] hover:opacity-90`}
      >
        <span>{selectedLanguage}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-72 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-lg shadow-[var(--shadow-lg)] z-50 overflow-hidden">
          <div className="p-3 border-b border-[rgb(var(--border-primary))]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--text-tertiary))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages..."
                className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!showCustomInput ? (
              <>
                <div className="py-2">
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => (
                      <button
                        key={language}
                        onClick={() => handleSelectLanguage(language)}
                        className={`w-full px-4 py-2 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-3 ${
                          selectedLanguage === language
                            ? 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--accent-primary))] font-medium'
                            : 'text-[rgb(var(--text-primary))]'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`}
                        />
                        {language}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-[rgb(var(--text-tertiary))]">
                      No languages found
                    </div>
                  )}
                </div>

                <div className="border-t border-[rgb(var(--border-primary))] p-2">
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full px-4 py-2 text-left hover:bg-[rgb(var(--bg-tertiary))] transition-colors flex items-center gap-2 text-[rgb(var(--accent-primary))] font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add custom language
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4">
                <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                  Custom Language
                </label>
                <input
                  type="text"
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomLanguage();
                    } else if (e.key === 'Escape') {
                      setShowCustomInput(false);
                      setCustomLanguage('');
                    }
                  }}
                  placeholder="e.g., Assembly, Fortran, COBOL..."
                  className="w-full px-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCustomLanguage}
                    disabled={!customLanguage.trim()}
                    className="flex-1 px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomLanguage('');
                    }}
                    className="flex-1 px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
