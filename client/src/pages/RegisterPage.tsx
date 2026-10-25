import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  Phone,
  UserPlus,
  KeyRound,
  Shield,
  ChefHat,
  Bike,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

type RegisterRole = 'CUSTOMER' | 'ADMIN' | 'KITCHEN' | 'DELIVERY';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleParam = searchParams.get('role')?.toUpperCase();
  const initialRole: RegisterRole | null =
    roleParam === 'ADMIN' || roleParam === 'RESTAURANT_ADMIN'
      ? 'ADMIN'
      : roleParam === 'KITCHEN' || roleParam === 'KITCHEN_STAFF'
      ? 'KITCHEN'
      : roleParam === 'DELIVERY' || roleParam === 'DELIVERY_PERSONNEL'
      ? 'DELIVERY'
      : roleParam === 'CUSTOMER'
      ? 'CUSTOMER'
      : null;

  const [selectedRole, setSelectedRole] = useState<RegisterRole | null>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (roleParam) {
      if (roleParam === 'ADMIN' || roleParam === 'RESTAURANT_ADMIN') setSelectedRole('ADMIN');
      else if (roleParam === 'KITCHEN' || roleParam === 'KITCHEN_STAFF') setSelectedRole('KITCHEN');
      else if (roleParam === 'DELIVERY' || roleParam === 'DELIVERY_PERSONNEL') setSelectedRole('DELIVERY');
      else if (roleParam === 'CUSTOMER') setSelectedRole('CUSTOMER');
    }
  }, [roleParam]);

  const handleSelectRole = (role: RegisterRole) => {
    setSelectedRole(role);
    setSearchParams({ role: role.toLowerCase() });
    setError('');
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setSearchParams({});
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError('');
    setLoading(true);

    try {
      const res = await authAPI.register({
        name,
        email,
        password,
        phone,
        role: selectedRole,
        setupKey: selectedRole === 'ADMIN' ? setupKey : undefined,
        invitationCode: selectedRole === 'KITCHEN' || selectedRole === 'DELIVERY' ? invitationCode : undefined,
        address: street || city ? { street, city, formattedAddress: `${street}, ${city}` } : undefined,
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        if (res.user.role === 'ADMIN' || res.user.role === 'RESTAURANT_ADMIN') navigate('/admin/dashboard');
        else if (res.user.role === 'KITCHEN' || res.user.role === 'KITCHEN_STAFF') navigate('/kitchen/dashboard');
        else if (res.user.role === 'DELIVERY' || res.user.role === 'DELIVERY_PERSONNEL') navigate('/delivery/dashboard');
        else navigate('/menu');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const roleCardConfigs = [
    {
      role: 'CUSTOMER' as RegisterRole,
      title: 'Register as Customer',
      subtitle: 'Public Account',
      description: 'Browse restaurant menu, order delicious dishes, and track status live in real-time.',
      icon: UserCheck,
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      role: 'ADMIN' as RegisterRole,
      title: 'Register as Restaurant Admin',
      subtitle: 'Passcode Required',
      description: 'Manage entire food menu, categories, staff accounts, all customer orders, and deliveries.',
      icon: Shield,
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-700',
      badgeColor: 'bg-purple-100 text-purple-800',
      passcodeHint: 'Requires Admin Setup Key (e.g. ADMIN2026)',
    },
    {
      role: 'KITCHEN' as RegisterRole,
      title: 'Register as Kitchen Staff',
      subtitle: 'Invitation Required',
      description: 'Access the real-time Kitchen Display System to confirm orders, start cooking, and mark ready.',
      icon: ChefHat,
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-700',
      badgeColor: 'bg-amber-100 text-amber-800',
      passcodeHint: 'Requires Kitchen Invite Code (e.g. KITCHEN2026)',
    },
    {
      role: 'DELIVERY' as RegisterRole,
      title: 'Register as Delivery Personnel',
      subtitle: 'Invitation Required',
      description: 'View ready pickups, customer drop addresses, mark orders picked up, and fulfill deliveries.',
      icon: Bike,
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700',
      badgeColor: 'bg-blue-100 text-blue-800',
      passcodeHint: 'Requires Rider Invite Code (e.g. DELIVERY2026)',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-orange-500/30">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {selectedRole ? `Register as ${selectedRole.replace(/_/g, ' ')}` : 'Create Platform Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {selectedRole
              ? 'Complete the form below to set up your role-specific account'
              : 'Select your operational role below to start registration'}
          </p>
        </div>

        {/* STEP 1: Role Selection Page (Mandatory 4 Options from Section 3) */}
        {!selectedRole ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roleCardConfigs.map((cfg) => {
                const Icon = cfg.icon;
                return (
                  <div
                    key={cfg.role}
                    onClick={() => handleSelectRole(cfg.role)}
                    className={`p-5 rounded-2xl border-2 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between ${cfg.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${cfg.badgeColor}`}>
                          {cfg.subtitle}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{cfg.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cfg.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold flex items-center space-x-1">
                        <span>Continue</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      {cfg.passcodeHint && (
                        <span className="text-[10px] text-slate-500 italic truncate max-w-[180px]">
                          {cfg.passcodeHint}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-xs text-slate-500">Already registered on Spice Garden? </span>
              <Link to="/login" className="text-xs font-bold text-orange-600 hover:underline">
                Sign In to Your Account
              </Link>
            </div>
          </div>
        ) : (
          /* STEP 2: Dedicated Role Registration Form with Genuine Backend Verification */
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
            <button
              type="button"
              onClick={handleBackToRoles}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Role Selection</span>
            </button>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role-Specific Authorization Codes (Required for Admin, Kitchen, Delivery) */}
              {selectedRole === 'ADMIN' && (
                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5">
                  <label className="text-xs font-bold text-purple-900 flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-purple-600" />
                    <span>Administrator Setup Key *</span>
                  </label>
                  <p className="text-[11px] text-purple-700">
                    Required for initial administrator setup or authorization. (Seed / Demo Passcode: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-purple-300">ADMIN2026</code>)
                  </p>
                  <input
                    type="password"
                    required
                    value={setupKey}
                    onChange={(e) => setSetupKey(e.target.value)}
                    placeholder="Enter Admin Setup Key (e.g. ADMIN2026)"
                    className="w-full text-xs p-2.5 rounded-lg border border-purple-300 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              )}

              {selectedRole === 'KITCHEN' && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                  <label className="text-xs font-bold text-amber-900 flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Kitchen Staff Invitation Code *</span>
                  </label>
                  <p className="text-[11px] text-amber-700">
                    Issued by Restaurant Admin. (Demo Invitation Code: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">KITCHEN2026</code>)
                  </p>
                  <input
                    type="password"
                    required
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="Enter Kitchen Staff Invitation Code"
                    className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              )}

              {selectedRole === 'DELIVERY' && (
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 space-y-1.5">
                  <label className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>Delivery Personnel Invitation Code *</span>
                  </label>
                  <p className="text-[11px] text-blue-700">
                    Issued by Restaurant Admin. (Demo Invitation Code: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-blue-300">DELIVERY2026</code>)
                  </p>
                  <input
                    type="password"
                    required
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    placeholder="Enter Delivery Rider Invitation Code"
                    className="w-full text-xs p-2.5 rounded-lg border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 00000"
                      className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full text-xs p-2.5 pl-9 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {selectedRole === 'CUSTOMER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 456 Oak Street, Flat 3B"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">City / Zip</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Metropolis, 560001"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/30 flex items-center justify-center space-x-2 transition-all mt-4 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : `Register as ${selectedRole.replace(/_/g, ' ')}`}</span>
              </button>
            </form>

            <div className="text-center pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">Already have an account? </span>
              <Link to={`/login?role=${selectedRole.toLowerCase()}`} className="text-xs font-bold text-orange-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
