import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { customerAPI } from '../../services/api';
import { Sidebar } from '../../components/common/Sidebar';
import { Mail, Phone } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    customerAPI
      .getAll()
      .then((res: any) => {
        if (Array.isArray(res)) setCustomers(res);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Registered Customer Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Directory of customers using the TasteHub platform.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No customers registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 px-2">Customer Name</th>
                    <th className="pb-3 px-2">Email</th>
                    <th className="pb-3 px-2">Phone</th>
                    <th className="pb-3 px-2">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => {
                    const cId = c._id || c.id || '';
                    return (
                      <tr key={cId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 font-bold text-slate-900 flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs">
                            {c.name.charAt(0)}
                          </div>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-2 text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.email}</span>
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{c.phone || 'N/A'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
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
    </div>
  );
};
