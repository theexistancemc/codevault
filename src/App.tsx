import { useState, useEffect } from 'react';
import { Code2, Save, Plus, FileCode } from 'lucide-react';
import { supabase, CodeSnippet } from './lib/supabase';
import { CodeEditor } from './components/CodeEditor';
import { SnippetList } from './components/SnippetList';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('JavaScript');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    loadSnippets();
  }, []);

  const loadSnippets = async () => {
    const { data, error } = await supabase
      .from('code_snippets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSnippets(data as CodeSnippet[]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (selectedSnippet) {
        const { error } = await supabase
          .from('code_snippets')
          .update({
            title: title || 'Untitled',
            code,
            language: selectedLanguage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedSnippet.id);

        if (!error) {
          await loadSnippets();
        }
      } else {
        const { error } = await supabase
          .from('code_snippets')
          .insert({
            title: title || 'Untitled',
            code,
            language: selectedLanguage,
          });

        if (!error) {
          await loadSnippets();
          setTitle('');
          setCode('');
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleNew = () => {
    setSelectedSnippet(null);
    setTitle('');
    setCode('');
  };

  const handleSelectSnippet = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet);
    setTitle(snippet.title);
    setCode(snippet.code);
    setSelectedLanguage(snippet.language);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this snippet?')) {
      await supabase.from('code_snippets').delete().eq('id', id);
      await loadSnippets();
      if (selectedSnippet?.id === id) {
        handleNew();
      }
    }
  };

  const getPlaceholder = () => {
    const lang = selectedLanguage.toLowerCase();

    if (lang.includes('python')) {
      return '# Write your Python code here...\nprint("Hello World!")';
    } else if (lang.includes('java') && !lang.includes('script')) {
      return '// Write your Java code here...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}';
    } else if (lang.includes('javascript') || lang === 'js') {
      return '// Write your JavaScript code here...\nconsole.log("Hello World!");';
    } else if (lang.includes('typescript') || lang === 'ts') {
      return '// Write your TypeScript code here...\nconst message: string = "Hello World!";\nconsole.log(message);';
    } else if (lang.includes('html')) {
      return '<!-- Write your HTML code here... -->\n<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>';
    } else if (lang.includes('css')) {
      return '/* Write your CSS code here... */\nbody {\n    font-family: sans-serif;\n    margin: 0;\n    padding: 20px;\n}';
    } else if (lang.includes('c++') || lang === 'cpp') {
      return '// Write your C++ code here...\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World!" << std::endl;\n    return 0;\n}';
    } else if (lang.includes('c#') || lang.includes('csharp')) {
      return '// Write your C# code here...\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World!");\n    }\n}';
    } else if (lang.includes('rust')) {
      return '// Write your Rust code here...\nfn main() {\n    println!("Hello World!");\n}';
    } else if (lang.includes('go')) {
      return '// Write your Go code here...\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World!")\n}';
    } else if (lang.includes('ruby')) {
      return '# Write your Ruby code here...\nputs "Hello World!"';
    } else if (lang.includes('php')) {
      return '<?php\n// Write your PHP code here...\necho "Hello World!";\n?>';
    } else if (lang.includes('swift')) {
      return '// Write your Swift code here...\nimport Foundation\n\nprint("Hello World!")';
    } else if (lang.includes('kotlin')) {
      return '// Write your Kotlin code here...\nfun main() {\n    println("Hello World!")\n}';
    } else if (lang.includes('skript')) {
      return '# Write your Skript code here...\non load:\n    broadcast "Hello World!"';
    } else if (lang.includes('sql')) {
      return '-- Write your SQL code here...\nSELECT * FROM users WHERE active = true;';
    } else if (lang.includes('bash') || lang.includes('shell')) {
      return '#!/bin/bash\n# Write your Bash code here...\necho "Hello World!"';
    } else {
      return `// Write your ${selectedLanguage} code here...\n`;
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      <header className="bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border-primary))] shadow-[var(--shadow-sm)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">CodeVault</h1>
                <p className="text-sm text-[rgb(var(--text-secondary))]">Your multi-language code editor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-4 py-2 text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors flex items-center gap-2"
              >
                <FileCode className="w-4 h-4" />
                {showSidebar ? 'Hide' : 'Show'} Snippets
              </button>
              <button
                onClick={handleNew}
                className="px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                New
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {showSidebar && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg shadow-[var(--shadow-sm)] border border-[rgb(var(--border-primary))] p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
                  Saved Snippets
                </h2>
                <SnippetList
                  snippets={snippets}
                  selectedId={selectedSnippet?.id || null}
                  onSelect={handleSelectSnippet}
                  onDelete={handleDelete}
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-lg shadow-[var(--shadow-sm)] border border-[rgb(var(--border-primary))] p-6">
              <div className="mb-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Snippet title..."
                  className="w-full px-4 py-2 text-lg font-medium border border-[rgb(var(--border-secondary))] bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                  Language
                </label>
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
              </div>

              <div className="h-[calc(100vh-20rem)]">
                <CodeEditor
                  value={code}
                  onChange={setCode}
                  language={selectedLanguage}
                  placeholder={getPlaceholder()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
