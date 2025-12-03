import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Ban, Award, Shield, AlertCircle, X, Plus, Check } from 'lucide-react';

interface ExtendedProfile extends Profile {
  is_banned?: boolean;
  badges?: string[];
  custom_role_id?: string;
  last_login_at?: string;
}

interface CustomRole {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface UserBadge {
  id: string;
  badge_name: string;
  badge_color: string;
  badge_icon: string;
}

export function MembersPage() {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<ExtendedProfile[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<ExtendedProfile | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [newRole, setNewRole] = useState<string>('editor');
  const [badgeName, setBadgeName] = useState('');
  const [badgeColor, setBadgeColor] = useState('#3b82f6');
  const [badgeIcon, setBadgeIcon] = useState('⭐');
  const [banReason, setBanReason] = useState('');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#3b82f6');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [memberBadges, setMemberBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    if (profile?.role === 'admin' && profile?.role === 'owner') {
      loadMembers();
      loadCustomRoles();
    }
  }, [profile]);

  const loadMembers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMembers(data as ExtendedProfile[]);
    }
    setLoading(false);
  };

  const loadCustomRoles = async () => {
    const { data, error } = await supabase
      .from('custom_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomRoles(data as CustomRole[]);
    }
  };

  const loadMemberBadges = async (memberId: string) => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', memberId);

    if (!error && data) {
      setMemberBadges(data as UserBadge[]);
    }
  };

  const handleSelectMember = async (member: ExtendedProfile) => {
    setSelectedMember(member);
    await loadMemberBadges(member.id);
  };

  const handleChangeRole = async () => {
    if (!selectedMember || !user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', selectedMember.id);

    if (!error) {
      await loadMembers();
      setShowRoleModal(false);
      alert(`${selectedMember.full_name} role changed to ${newRole}`);
    }
  };

  const handleBanUser = async () => {
    if (!selectedMember || !user || !banReason.trim()) return;

    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: selectedMember.id,
        reason: banReason,
        banned_by: user.id,
      });

    if (!error) {
      await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', selectedMember.id);

      await loadMembers();
      setShowBanModal(false);
      setBanReason('');
      alert(`${selectedMember.full_name} has been banned`);
    }
  };

  const handleUnbanUser = async () => {
    if (!selectedMember) return;

    const { error: deleteError } = await supabase
      .from('banned_users')
      .delete()
      .eq('user_id', selectedMember.id);

    if (!deleteError) {
      await supabase
        .from('profiles')
        .update({ is_banned: false })
        .eq('id', selectedMember.id);

      await loadMembers();
      alert(`${selectedMember.full_name} has been unbanned`);
    }
  };

  const handleAddBadge = async () => {
    if (!selectedMember || !user || !badgeName.trim()) return;

    const { error } = await supabase
      .from('user_badges')
      .insert({
        user_id: selectedMember.id,
        badge_name: badgeName,
        badge_color: badgeColor,
        badge_icon: badgeIcon,
        issued_by: user.id,
      });

    if (!error) {
      await loadMemberBadges(selectedMember.id);
      setBadgeName('');
      setBadgeColor('#3b82f6');
      setBadgeIcon('⭐');
      alert('Badge added successfully');
    }
  };

  const handleRemoveBadge = async (badgeId: string) => {
    const { error } = await supabase
      .from('user_badges')
      .delete()
      .eq('id', badgeId);

    if (!error) {
      await loadMemberBadges(selectedMember!.id);
    }
  };

  const handleCreateCustomRole = async () => {
    if (!user || !newRoleName.trim()) return;

    const { error } = await supabase
      .from('custom_roles')
      .insert({
        name: newRoleName,
        color: newRoleColor,
        description: newRoleDescription,
        permissions: { snippets: ['read', 'create'], users: ['read'] },
        created_by: user.id,
      });

    if (!error) {
      await loadCustomRoles();
      setNewRoleName('');
      setNewRoleColor('#3b82f6');
      setNewRoleDescription('');
      setShowCreateRoleModal(false);
      alert('Custom role created successfully');
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">Access Denied</h2>
          <p className="text-[rgb(var(--text-secondary))] mt-2">
            Only admins can access the members page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-[rgb(var(--text-primary))]">
            <Users className="w-8 h-8" />
            Members Management
          </h1>
          <button
            onClick={() => setShowCreateRoleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Custom Role
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))] overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-[rgb(var(--text-secondary))]">
                  Loading members...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[rgb(var(--bg-tertiary))] border-b border-[rgb(var(--border-primary))]">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--text-primary))]">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--text-primary))]">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--text-primary))]">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--text-primary))]">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-[rgb(var(--text-primary))]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-[rgb(var(--border-secondary))] hover:bg-[rgb(var(--bg-tertiary))] transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-[rgb(var(--text-primary))]">
                              {member.full_name || 'Unknown'}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[rgb(var(--text-secondary))]">{member.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium text-white"
                              style={{
                                backgroundColor: member.role === 'admin' ? '#ef4444' :
                                  member.role === 'editor' ? '#3b82f6' : '#6b7280'
                              }}
                            >
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                member.is_banned
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              }`}
                            >
                              {member.is_banned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleSelectMember(member)}
                              className="text-[rgb(var(--accent-primary))] hover:underline text-sm font-medium"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div>
            {selectedMember ? (
              <div className="space-y-4">
                <div className="bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
                      {selectedMember.full_name}
                    </h3>
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-[rgb(var(--text-secondary))]">{selectedMember.email}</p>
                      <p className="text-xs text-[rgb(var(--text-tertiary))] mt-1">
                        Joined {new Date(selectedMember.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setNewRole(selectedMember.role);
                        setShowRoleModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Change Role
                    </button>

                    <button
                      onClick={() => setShowBadgeModal(true)}
                      className="w-full flex items-center gap-2 px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      Add Badge
                    </button>

                    <button
                      onClick={() => {
                        if (selectedMember.is_banned) {
                          handleUnbanUser();
                        } else {
                          setShowBanModal(true);
                        }
                      }}
                      className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                        selectedMember.is_banned
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <Ban className="w-4 h-4" />
                      {selectedMember.is_banned ? 'Unban User' : 'Ban User'}
                    </button>
                  </div>
                </div>

                {memberBadges.length > 0 && (
                  <div className="bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))] p-4">
                    <h4 className="font-semibold text-[rgb(var(--text-primary))] mb-3">Badges</h4>
                    <div className="space-y-2">
                      {memberBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="flex items-center justify-between p-2 rounded bg-[rgb(var(--bg-tertiary))]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{badge.badge_icon}</span>
                            <span
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: badge.badge_color }}
                            >
                              {badge.badge_name}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveBadge(badge.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))] p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-[rgb(var(--text-tertiary))]" />
                <p className="text-[rgb(var(--text-secondary))]">
                  Select a member to manage
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRoleModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[rgb(var(--bg-secondary))] rounded-lg shadow-[var(--shadow-lg)] border border-[rgb(var(--border-primary))] p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
              Change Role: {selectedMember.full_name}
            </h3>
            <div className="space-y-4">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleChangeRole}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
                >
                  Change
                </button>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBadgeModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[rgb(var(--bg-secondary))] rounded-lg shadow-[var(--shadow-lg)] border border-[rgb(var(--border-primary))] p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
              Add Badge to {selectedMember.full_name}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={badgeName}
                onChange={(e) => setBadgeName(e.target.value)}
                placeholder="Badge name"
                className="w-full px-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={badgeIcon}
                  onChange={(e) => setBadgeIcon(e.target.value)}
                  placeholder="Icon/Emoji"
                  maxLength={2}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] text-center"
                />
                <input
                  type="color"
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  className="w-12 h-10 border border-[rgb(var(--border-secondary))] rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddBadge}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowBadgeModal(false)}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBanModal && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[rgb(var(--bg-secondary))] rounded-lg shadow-[var(--shadow-lg)] border border-[rgb(var(--border-primary))] p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Ban {selectedMember.full_name}?
            </h3>
            <div className="space-y-4">
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Ban reason..."
                className="w-full px-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] resize-none h-24"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleBanUser}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Ban
                </button>
                <button
                  onClick={() => setShowBanModal(false)}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[rgb(var(--bg-secondary))] rounded-lg shadow-[var(--shadow-lg)] border border-[rgb(var(--border-primary))] p-6 max-w-sm w-full mx-4">
            <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">
              Create Custom Role
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Role name"
                className="w-full px-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]"
              />
              <textarea
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
                placeholder="Description"
                className="w-full px-4 py-2 bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] placeholder:text-[rgb(var(--text-tertiary))] border border-[rgb(var(--border-secondary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))] resize-none h-20"
              />
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                  Badge Color:
                </label>
                <input
                  type="color"
                  value={newRoleColor}
                  onChange={(e) => setNewRoleColor(e.target.value)}
                  className="w-12 h-10 border border-[rgb(var(--border-secondary))] rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateCustomRole}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-hover))] text-white rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateRoleModal(false)}
                  className="flex-1 px-4 py-2 bg-[rgb(var(--bg-tertiary))] hover:bg-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
