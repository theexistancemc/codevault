import { CodeSnippet } from '../lib/supabase';
import { Code2, Calendar, Trash2 } from 'lucide-react';

interface SnippetListProps {
  snippets: CodeSnippet[];
  selectedId: string | null;
  onSelect: (snippet: CodeSnippet) => void;
  onDelete: (id: string) => void;
}

export function SnippetList({ snippets, selectedId, onSelect, onDelete }: SnippetListProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'skript':
        return 'bg-amber-500';
      case 'javascript':
        return 'bg-yellow-400';
      case 'html':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      {snippets.length === 0 ? (
        <div className="text-center py-12 text-[rgb(var(--text-tertiary))]">
          <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No snippets yet</p>
          <p className="text-sm mt-1">Create your first code snippet</p>
        </div>
      ) : (
        snippets.map((snippet) => (
          <div
            key={snippet.id}
            onClick={() => onSelect(snippet)}
            className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-[var(--shadow-md)] group ${
              selectedId === snippet.id
                ? 'bg-[rgb(var(--bg-tertiary))] border-2 border-[rgb(var(--accent-primary))]'
                : 'bg-[rgb(var(--bg-secondary))] border-2 border-transparent hover:border-[rgb(var(--border-primary))]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[rgb(var(--text-primary))] truncate">
                  {snippet.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-[rgb(var(--text-secondary))]">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs font-medium ${getLanguageColor(
                      snippet.language
                    )}`}
                  >
                    {snippet.language}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(snippet.created_at)}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(snippet.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400"
                title="Delete snippet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
