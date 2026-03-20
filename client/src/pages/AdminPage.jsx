import React, { useState, useEffect, useCallback } from 'react';
import { userAPI, pickupAPI, wasteAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  BarChart2, Users, Package, Recycle, CheckCircle,
  XCircle, RefreshCw, Shield, TrendingUp, Leaf, ChevronDown
} from 'lucide-react';

const TABS = ['Analytics', 'Pickups', 'Users', 'Items'];

function StatCard({ icon, label, value, color = 'text-green-400', bg = 'bg-green-500/10' }) {
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
      <div className="text-xs text-slate-400 font-medium">{label}</div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('Analytics');
  const [analytics, setAnalytics]   = useState(null);
  const [users, setUsers]           = useState([]);
  const [pickups, setPickups]       = useState([]);
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [pickupFilter, setPickupFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(''); // pickup id being acted on

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await pickupAPI.getAnalytics();
      setAnalytics(res.data.analytics);
    } catch { /* handled below */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await userAPI.getAllUsers();
      setUsers(res.data.users || []);
    } catch { /* handled below */ }
  }, []);

  const fetchPickups = useCallback(async (status = '') => {
    try {
      const res = await pickupAPI.getAllPickups(status || undefined);
      setPickups(res.data.pickups || []);
    } catch { /* handled below */ }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const res = await wasteAPI.getAllItems();
      setItems(res.data.items || []);
    } catch { /* handled below */ }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAnalytics(), fetchUsers(), fetchPickups(), fetchItems()]);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [fetchAnalytics, fetchUsers, fetchPickups, fetchItems]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (activeTab === 'Pickups') fetchPickups(pickupFilter);
  }, [pickupFilter, fetchPickups, activeTab]);

  /* ── Pickup Actions ── */
  const pickupAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === 'approve')   await pickupAPI.approve(id, { adminNote: 'Approved by admin' });
      if (action === 'reject')    await pickupAPI.reject(id, { adminNote: 'Rejected by admin' });
      if (action === 'complete')  await pickupAPI.complete(id);
      toast.success(`Pickup ${action}d.`);
      await fetchPickups(pickupFilter);
      await fetchAnalytics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading('');
    }
  };

  /* ── User Toggle ── */
  const toggleUser = async (id) => {
    try {
      const res = await userAPI.toggleUser(id);
      toast.success(res.data.message);
      await fetchUsers();
    } catch {
      toast.error('Failed to update user.');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-purple-400" />
            </div>
            <div>
              <h1 className="page-title !mb-0">Admin Panel</h1>
              <p className="text-slate-400 text-sm">Platform management & analytics</p>
            </div>
          </div>
          <button onClick={loadAll} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Analytics Tab ── */}
        {activeTab === 'Analytics' && analytics && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={<Users size={20} className="text-blue-400" />} label="Total Users" value={analytics.totalUsers} bg="bg-blue-500/10" color="text-blue-400" />
              <StatCard icon={<Recycle size={20} className="text-green-400" />} label="Items Recycled" value={analytics.totalItems} bg="bg-green-500/10" />
              <StatCard icon={<Package size={20} className="text-yellow-400" />} label="Total Pickups" value={analytics.totalPickups} bg="bg-yellow-500/10" color="text-yellow-400" />
              <StatCard icon={<CheckCircle size={20} className="text-teal-400" />} label="Completed" value={analytics.completedPickups} bg="bg-teal-500/10" color="text-teal-400" />
              <StatCard icon={<RefreshCw size={20} className="text-orange-400" />} label="Pending Pickups" value={analytics.pendingPickups} bg="bg-orange-500/10" color="text-orange-400" />
              <StatCard icon={<TrendingUp size={20} className="text-purple-400" />} label="Points Awarded" value={analytics.totalPointsAwarded?.toLocaleString()} bg="bg-purple-500/10" color="text-purple-400" />
              <StatCard icon={<Leaf size={20} className="text-green-400" />} label="Total CO₂ Saved" value={`${analytics.totalCO2Saved}kg`} bg="bg-green-500/10" />
            </div>

            {/* Category breakdown */}
            {analytics.categoryBreakdown?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-green-400" /> Items by Category
                </h3>
                <div className="space-y-3">
                  {analytics.categoryBreakdown.map(({ _id, count }) => {
                    const max = analytics.categoryBreakdown[0]?.count || 1;
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={_id} className="flex items-center gap-3">
                        <div className="w-36 text-slate-300 text-sm flex-shrink-0 truncate">{_id}</div>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="text-slate-400 text-sm w-10 text-right flex-shrink-0">{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Pickups Tab ── */}
        {activeTab === 'Pickups' && (
          <div>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <h3 className="font-semibold text-white">All Pickups ({pickups.length})</h3>
              <div className="relative ml-auto">
                <select
                  value={pickupFilter}
                  onChange={(e) => setPickupFilter(e.target.value)}
                  className="input text-sm py-2 pr-8 w-auto appearance-none"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {pickups.length === 0 ? (
              <div className="card p-8"><EmptyState icon="📦" title="No pickups found" /></div>
            ) : (
              <div className="space-y-3">
                {pickups.map((p) => (
                  <div key={p._id} className="card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* User info */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-bold text-xs">{p.user?.name?.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="text-white font-medium text-sm">{p.user?.name}</span>
                            <span className="text-slate-400 text-xs ml-2">{p.user?.email}</span>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>

                        {/* Details */}
                        <div className="text-slate-300 text-sm">
                          📍 {p.address}, {p.city}
                        </div>
                        <div className="text-slate-400 text-xs mt-1">
                          📅 {new Date(p.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ⏰ {p.timeSlot}
                        </div>
                        {p.items?.length > 0 && (
                          <div className="text-slate-500 text-xs mt-1">
                            Items: {p.items.map((i) => i.itemName).join(', ')}
                          </div>
                        )}
                        {p.notes && <div className="text-slate-500 text-xs mt-1 italic">"{p.notes}"</div>}
                        {p.user?.phone && <div className="text-slate-500 text-xs mt-1">📞 {p.user.phone}</div>}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {p.status === 'pending' && (
                          <>
                            <button
                              onClick={() => pickupAction(p._id, 'approve')}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/25 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === p._id + 'approve'
                                ? <span className="w-3 h-3 border border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                : <CheckCircle size={13} />}
                              Approve
                            </button>
                            <button
                              onClick={() => pickupAction(p._id, 'reject')}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 text-xs font-medium transition-colors disabled:opacity-50"
                            >
                              {actionLoading === p._id + 'reject'
                                ? <span className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                : <XCircle size={13} />}
                              Reject
                            </button>
                          </>
                        )}
                        {p.status === 'approved' && (
                          <button
                            onClick={() => pickupAction(p._id, 'complete')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/25 text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading === p._id + 'complete'
                              ? <span className="w-3 h-3 border border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                              : <CheckCircle size={13} />}
                            Mark Complete
                          </button>
                        )}
                        {p.status === 'completed' && p.pointsAwarded > 0 && (
                          <span className="text-green-400 text-xs font-semibold">+{p.pointsAwarded} pts awarded</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'Users' && (
          <div>
            <h3 className="font-semibold text-white mb-5">All Users ({users.length})</h3>
            {users.length === 0 ? (
              <div className="card p-8"><EmptyState icon="👥" title="No users found" /></div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-700/50 text-slate-400 text-left border-b border-slate-700">
                        <th className="px-4 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">City</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Role</th>
                        <th className="px-4 py-3 font-medium">Points</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Items</th>
                        <th className="px-4 py-3 font-medium">Level</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-400 font-bold text-xs">{u.name?.charAt(0)}</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-white font-medium truncate max-w-[120px]">{u.name}</div>
                                <div className="text-slate-400 text-xs truncate max-w-[120px]">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">{u.city}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {u.role === 'admin'
                              ? <span className="badge-blue">Admin</span>
                              : <span className="badge-gray">User</span>}
                          </td>
                          <td className="px-4 py-3 text-green-400 font-semibold">{u.points.toLocaleString()}</td>
                          <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{u.totalItemsRecycled}</td>
                          <td className="px-4 py-3 text-slate-300 text-xs">{u.level}</td>
                          <td className="px-4 py-3">
                            {u.isActive
                              ? <span className="badge-green">Active</span>
                              : <span className="badge-red">Inactive</span>}
                          </td>
                          <td className="px-4 py-3">
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => toggleUser(u._id)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                                  u.isActive
                                    ? 'text-red-400 hover:bg-red-500/10'
                                    : 'text-green-400 hover:bg-green-500/10'
                                }`}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Items Tab ── */}
        {activeTab === 'Items' && (
          <div>
            <h3 className="font-semibold text-white mb-5">All Items ({items.length})</h3>
            {items.length === 0 ? (
              <div className="card p-8"><EmptyState icon="♻️" title="No items logged yet" /></div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-700/50 text-slate-400 text-left border-b border-slate-700">
                        <th className="px-4 py-3 font-medium">Item</th>
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">User</th>
                        <th className="px-4 py-3 font-medium">Qty</th>
                        <th className="px-4 py-3 font-medium">Points</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {items.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-white font-medium">{item.itemName}</div>
                            {item.brand && <div className="text-slate-500 text-xs">{item.brand}</div>}
                          </td>
                          <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">{item.category}</td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            {item.user ? (
                              <div>
                                <div className="text-slate-300 text-xs font-medium">{item.user.name}</div>
                                <div className="text-slate-500 text-xs">{item.user.city}</div>
                              </div>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{item.quantity}</td>
                          <td className="px-4 py-3 text-green-400 font-semibold">+{item.pointsEarned}</td>
                          <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                          <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                            {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
