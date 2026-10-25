import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { staffAPI } from '../../services/api';
import { Sidebar } from '../../components/common/Sidebar';
import {
  Users,
  UserPlus,
  KeyRound,
  ShieldCheck,
  ChefHat,
  Bike,
  Lock,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [invitations, setInvitations] = useState<{
    adminSetupKey: string;
    kitchenInviteCode: string;
    deliveryInviteCode: string;
  } | null>(null);

  // Create Staff Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'KITCHEN_STAFF',
  });
  const [createLoading, setCreateLoading] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string>('');

  // Password Reset Modal State
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetLoading, setResetLoading] = useState<boolean>(false);
  const [resetMessage, setResetMessage] = useState<string>('');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [staffRes, inviteRes] = await Promise.all([
        staffAPI.getAll(),
        staffAPI.getInvitations(),
      ]);
      if (Array.isArray(staffRes)) setStaffList(staffRes);
      if (inviteRes) setInvitations(inviteRes);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    try {
      await staffAPI.create(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'KITCHEN_STAFF',
      });
      fetchStaffData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create staff member');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const userId = user._id || user.id || '';
    const newStatus = !user.isActive;
    try {
      await staffAPI.toggleStatus(userId, newStatus);
      fetchStaffData();
    } catch (err: any) {
      alert(err.message || 'Failed to update staff status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !newPassword) return;
    const userId = resetTargetUser._id || resetTargetUser.id || '';
    setResetLoading(true);
    try {
      await staffAPI.resetPassword(userId, newPassword);
      setResetMessage('Password updated successfully!');
      setTimeout(() => {
        setResetTargetUser(null);
        setNewPassword('');
        setResetMessage('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyCode = (code: string, keyName: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredStaff = staffList.filter((s) => {
    if (selectedRoleFilter === 'ALL') return true;
    if (selectedRoleFilter === 'KITCHEN') {
      return s.role === 'KITCHEN' || s.role === 'KITCHEN_STAFF';
    }
    if (selectedRoleFilter === 'DELIVERY') {
      return s.role === 'DELIVERY' || s.role === 'DELIVERY_PERSONNEL';
    }
    if (selectedRoleFilter === 'ADMIN') {
      return s.role === 'ADMIN' || s.role === 'RESTAURANT_ADMIN';
    }
    return true;
  });

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Staff Account Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Admin controls to provision Kitchen Staff, Delivery Riders, activate/deactivate accounts, and view invitation keys.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchStaffData}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors shadow-sm cursor-pointer"
              title="Refresh staff list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Staff Member</span>
            </button>
          </div>
        </div>

        {/* Invitation & Registration Security Passcodes Card */}
        {invitations && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-wide uppercase">
                  Staff Registration Invitation & Security Passcodes
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Required for role-specific self-registration
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Kitchen Staff Invite</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{invitations.kitchenInviteCode}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(invitations.kitchenInviteCode, 'kitchen')}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedKey === 'kitchen' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Delivery Personnel Invite</span>
                  <span className="text-sm font-mono font-bold text-blue-400">{invitations.deliveryInviteCode}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(invitations.deliveryInviteCode, 'delivery')}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedKey === 'delivery' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block font-semibold">Admin Setup Passcode</span>
                  <span className="text-sm font-mono font-bold text-rose-400">{invitations.adminSetupKey}</span>
                </div>
                <button
                  onClick={() => handleCopyCode(invitations.adminSetupKey, 'admin')}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copiedKey === 'admin' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold w-fit">
          <button
            onClick={() => setSelectedRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedRoleFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Staff ({staffList.length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('KITCHEN')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedRoleFilter === 'KITCHEN'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Kitchen Staff ({staffList.filter((s) => s.role === 'KITCHEN' || s.role === 'KITCHEN_STAFF').length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('DELIVERY')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedRoleFilter === 'DELIVERY'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Delivery Riders ({staffList.filter((s) => s.role === 'DELIVERY' || s.role === 'DELIVERY_PERSONNEL').length})
          </button>
          <button
            onClick={() => setSelectedRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              selectedRoleFilter === 'ADMIN'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Admins ({staffList.filter((s) => s.role === 'ADMIN' || s.role === 'RESTAURANT_ADMIN').length})
          </button>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading staff records...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No staff members in this role.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Member</th>
                    <th className="pb-3 px-2">Role</th>
                    <th className="pb-3 px-2">Contact</th>
                    <th className="pb-3 px-2">Status</th>
                    <th className="pb-3 px-2">Account Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((member) => {
                    const mId = member._id || member.id || '';
                    const roleClean = member.role.replace(/_/g, ' ');
                    const isKitchen = member.role === 'KITCHEN' || member.role === 'KITCHEN_STAFF';
                    const isDelivery = member.role === 'DELIVERY' || member.role === 'DELIVERY_PERSONNEL';

                    return (
                      <tr key={mId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{member.name}</span>
                              <span className="text-[11px] text-slate-500">{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center space-x-1 ${
                              isKitchen
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : isDelivery
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-purple-100 text-purple-800 border border-purple-200'
                            }`}
                          >
                            {isKitchen && <ChefHat className="w-3 h-3" />}
                            {isDelivery && <Bike className="w-3 h-3" />}
                            <span>{roleClean}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-2 font-medium text-slate-700">
                          {member.phone || <span className="text-slate-400 italic">No phone</span>}
                        </td>

                        <td className="py-3.5 px-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center space-x-1 ${
                              member.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {member.isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Suspended</span>
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3.5 px-2 space-x-2">
                          <button
                            onClick={() => handleToggleStatus(member)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              member.isActive
                                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {member.isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={() => setResetTargetUser(member)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <KeyRound className="w-3 h-3 text-slate-500" />
                            <span>Reset Password</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Create Staff Member Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold">Add New Staff Member</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {createError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Ramesh Chef"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Role Assignment *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white cursor-pointer"
                >
                  <option value="KITCHEN_STAFF">Kitchen Staff (KDS Cooking Operator)</option>
                  <option value="DELIVERY_PERSONNEL">Delivery Personnel (Dispatch Rider)</option>
                  <option value="RESTAURANT_ADMIN">Restaurant Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="staff@restaurant.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {createLoading ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setResetTargetUser(null)} />

          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Reset Password</h3>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Updating password for <span className="font-bold text-slate-900">{resetTargetUser.name}</span> ({resetTargetUser.email}).
              </p>

              {resetMessage && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
                  {resetMessage}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {resetLoading ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
