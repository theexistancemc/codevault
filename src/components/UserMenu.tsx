import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Shield, ChevronDown, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  onOpenMembers?: () => void;
}

export function UserMenu({ onOpenMembers }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'editor':
        return 'bg-blue-500';
      case 'viewer':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-[rgb(var(--accent-primary))] rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">
            {profile.full_name || 'User'}
          </p>
          <p className="text-xs text-[rgb(var(--text-tertiary))]">{profile.email}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-[rgb(var(--text-primary))] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-lg shadow-[var(--shadow-lg)] overflow-hidden z-50">
          <div className="p-4 border-b border-[rgb(var(--border-primary))]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[rgb(var(--accent-primary))] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[rgb(var(--text-primary))]">
                  {profile.full_name || 'User'}
                </p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{profile.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
              <span className="text-xs text-[rgb(var(--text-secondary))]">Role:</span>
              <span
                className={`px-2 py-1 text-xs font-medium text-white rounded ${getRoleBadgeColor(
                  profile.role
                )}`}
              >
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            </div>
          </div>

          <div className="p-2 space-y-1">
            {profile.role === 'admin' && (
              <button
                onClick={() => {
                  onOpenMembers?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors text-[rgb(var(--text-primary))]"
              >
                <UsersIcon className="w-4 h-4" />
                <span>Members</span>
              </button>
            )}
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors text-[rgb(var(--text-primary))]"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
