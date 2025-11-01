import { useState, useEffect } from 'react';
import { Code2, Save, Plus, FileCode, LogIn, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase, CodeSnippet } from './lib/supabase';
import { SyntaxHighlightedEditor } from './components/SyntaxHighlightedEditor';
import { SnippetList } from './components/SnippetList';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSelector } from './components/LanguageSelector';
import { AuthModal } from './components/AuthModal';
import { UserMenu } from './components/UserMenu';
import { MembersPage } from './components/MembersPage';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, profile, hasPermission, loading: authLoading } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('JavaScript');
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMembersPage, setShowMembersPage] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      loadSnippets();
    }
  }, [authLoading, user]);

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
    if (!user) return;

    setIsSaving(true);
    try {
      if (selectedSnippet) {
        if (selectedSnippet.user_id !== user.id) {
          alert('You can only edit your own snippets');
          setIsSaving(false);
          return;
        }

        const { error } = await supabase
          .from('code_snippets')
          .update({
            title: title || 'Untitled',
            code,
            language: selectedLanguage,
            is_public: isPublic,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedSnippet.id);

        if (!error) {
          await loadSnippets();
        } else {
          alert('Failed to update snippet: ' + error.message);
        }
      } else {
        if (!user) return;
        const { error } = await supabase
          .from('code_snippets')
          .insert({
            title: title || 'Untitled',
            code,
            language: selectedLanguage,
            user_id: user.id,
            is_public: isPublic,
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
    setIsPublic(true);
  };

  const handleSelectSnippet = (snippet: CodeSnippet) => {
    setSelectedSnippet(snippet);
    setTitle(snippet.title);
    setCode(snippet.code);
    setSelectedLanguage(snippet.language);
    setIsPublic(snippet.is_public);
  };

  const canEditSnippet = (snippet: CodeSnippet | null): boolean => {
    if (!user || !snippet) return false;
    if (profile?.role === 'admin') return true;
    return snippet.user_id === user.id;
  };

  if (showMembersPage && profile?.role === 'admin') {
    return (
      <div>
        <MembersPage />
        <button
          onClick={() => setShowMembersPage(false)}
          className="fixed bottom-6 right-6 px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
        >
          Back to Editor
        </button>
      </div>
    );
  }

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
              {user ? (
                <UserMenu onOpenMembers={() => setShowMembersPage(true)} />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
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
              {user && hasPermission('snippets', 'create') && (!selectedSnippet || canEditSnippet(selectedSnippet)) && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              )}
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
                  onChange={(e) => {
                    if (!selectedSnippet || canEditSnippet(selectedSnippet)) {
                      setTitle(e.target.value);
                    }
                  }}
                  placeholder="Snippet title..."
                  disabled={selectedSnippet ? !canEditSnippet(selectedSnippet) : false}
                  className="w-full px-4 py-2 text-lg font-medium border border-[rgb(var(--border-secondary))] bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                    Language
                  </label>
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                  />
                </div>
                {user && hasPermission('snippets', 'create') && (
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
                      Visibility
                    </label>
                    <button
                      onClick={() => setIsPublic(!isPublic)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        isPublic
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {isPublic ? 'Public' : 'Private'}
                    </button>
                  </div>
                )}
              </div>

              {user ? (
                <div className="h-[calc(100vh-24rem)]">
                  <SyntaxHighlightedEditor
                    value={code}
                    onChange={(value) => {
                      if (!selectedSnippet || canEditSnippet(selectedSnippet)) {
                        setCode(value);
                      }
                    }}
                    language={selectedLanguage}
                    placeholder={getPlaceholder()}
                  />
                  {selectedSnippet && !canEditSnippet(selectedSnippet) && (
                    <div className="mt-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        This is a read-only snippet. You can only edit your own snippets.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[calc(100vh-24rem)] bg-[rgb(var(--bg-code))] rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--text-tertiary))]" />
                    <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
                      Sign in to start coding
                    </h3>
                    <p className="text-[rgb(var(--text-secondary))] mb-6">
                      Create an account to save and manage your code snippets
                    </p>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-6 py-3 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default App;
