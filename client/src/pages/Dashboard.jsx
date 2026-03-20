import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, wasteAPI, pickupAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import {
  Trophy, Recycle, Package, Leaf, TrendingUp,
  User, Edit3, Save, X, Star, Award
} from 'lucide-react';

const TABS = ['Overview', 'History', 'Pickups', 'Leaderboard', 'Profile'];

/* ── Level progress helper ─────────────────── */
const LEVELS = [
  { name: 'Beginner',     min: 0,    max: 200  },
  { name: 'Eco Starter',  min: 200,  max: 800  },
  { name: 'Eco Warrior',  min: 800,  max: 2000 },
  { name: 'Eco Guardian', min: 2000, max: 5000 },
  { name: 'Eco Champion', min: 5000, max: 9999 },
];

function getLevelProgress(points) {
  const level = LEVELS.find((l) => points >= l.min && points < l.max) || LEVELS[LEVELS.length - 1];
  const pct = Math.min(100, Math.round(((points - level.min) / (level.max - level.min)) * 100));
  return { ...level, pct };
}

/* ── Stat card ─────────────────────────────── */
function StatCard({ icon, label, value, sub, color = 'text-green-400' }) {
  return (
    <div className="stat-card">
      <div className={`text-2xl mb-1 ${color}`}>{icon}</div>
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [wasteItems, setWasteItems] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', city: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, pickupsRes, lbRes] = await Promise.all([
        wasteAPI.getMyItems(),
        pickupAPI.getMyPickups(),
        userAPI.getLeaderboard(),
      ]);
      setWasteItems(itemsRes.data.items || []);
      setPickups(pickupsRes.data.pickups || []);
      setLeaderboard(lbRes.data.leaderboard || []);
    } catch (err) {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Populate profile form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', city: user.city || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileSave = async () => {
    if (!profileForm.name.trim()) { toast.error('Name cannot be empty.'); return; }
    setSaving(true);
    try {
      await userAPI.updateProfile(profileForm);
      await refreshUser();
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const levelInfo = getLevelProgress(user?.points || 0);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              Good day, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {user?.city} · {user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="badge-green text-sm px-3 py-1">
              <Star size={12} /> {user?.level}
            </div>
            <div className="card px-4 py-2 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-white font-bold">{user?.points?.toLocaleString()}</span>
              <span className="text-slate-400 text-sm">pts</span>
            </div>
          </div>
        </div>

        {/* Level progress */}
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-slate-300">
              <span className="text-green-400 font-semibold">{levelInfo.name}</span>
              {levelInfo.name !== 'Eco Champion' && (
                <span className="text-slate-500"> → next level at {levelInfo.max.toLocaleString()} pts</span>
              )}
            </div>
            <span className="text-sm font-bold text-green-400">{levelInfo.pct}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
              style={{ width: `${levelInfo.pct}%` }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'Overview' && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={<Trophy size={22} />} label="Total Points" value={user?.points?.toLocaleString() || 0} sub="Lifetime earned" color="text-yellow-400" />
              <StatCard icon={<Recycle size={22} />} label="Items Recycled" value={user?.totalItemsRecycled || 0} sub="Total items" color="text-green-400" />
              <StatCard icon={<Leaf size={22} />} label="CO₂ Saved" value={`${(user?.co2Saved || 0).toFixed(1)}kg`} sub="Offset so far" color="text-teal-400" />
              <StatCard icon={<Package size={22} />} label="Pickups" value={pickups.length} sub={`${pickups.filter(p => p.status === 'completed').length} completed`} color="text-blue-400" />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Link to="/waste" className="card p-5 hover:border-green-500/40 transition-colors group">
                <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-500/20 transition-colors">
                  <Recycle size={20} className="text-green-400" />
                </div>
                <div className="font-semibold text-white text-sm mb-1">Log E-Waste</div>
                <div className="text-slate-400 text-xs">Add items and earn points</div>
              </Link>
              <Link to="/pickups" className="card p-5 hover:border-blue-500/40 transition-colors group">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                  <Package size={20} className="text-blue-400" />
                </div>
                <div className="font-semibold text-white text-sm mb-1">Schedule Pickup</div>
                <div className="text-slate-400 text-xs">Free doorstep collection</div>
              </Link>
              <Link to="/map" className="card p-5 hover:border-yellow-500/40 transition-colors group">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-yellow-500/20 transition-colors">
                  <TrendingUp size={20} className="text-yellow-400" />
                </div>
                <div className="font-semibold text-white text-sm mb-1">Find Centers</div>
                <div className="text-slate-400 text-xs">View recycling centers</div>
              </Link>
            </div>

            {/* Recent items */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Recent Items</h3>
                <button onClick={() => setActiveTab('History')} className="text-green-400 text-xs hover:underline">View all</button>
              </div>
              {wasteItems.length === 0 ? (
                <EmptyState icon="♻️" title="No items logged yet" description="Start by adding your first e-waste item." action={<Link to="/waste" className="btn-primary text-sm">Add Item</Link>} />
              ) : (
                <div className="space-y-2">
                  {wasteItems.slice(0, 5).map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Recycle size={14} className="text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{item.itemName}</div>
                        <div className="text-xs text-slate-400">{item.category} · {item.quantity} unit{item.quantity > 1 ? 's' : ''}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-green-400 text-xs font-semibold">+{item.pointsEarned}pts</span>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'History' && (
          <div className="card p-5">
            <h3 className="font-semibold text-white mb-4">All Logged Items ({wasteItems.length})</h3>
            {wasteItems.length === 0 ? (
              <EmptyState icon="📦" title="No items logged" description="Add your first e-waste item to get started." action={<Link to="/waste" className="btn-primary text-sm">Log Item</Link>} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700 text-left">
                      <th className="pb-3 pr-4 font-medium">Item</th>
                      <th className="pb-3 pr-4 font-medium">Category</th>
                      <th className="pb-3 pr-4 font-medium">Qty</th>
                      <th className="pb-3 pr-4 font-medium">Points</th>
                      <th className="pb-3 pr-4 font-medium">CO₂</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {wasteItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-white">{item.itemName}</div>
                          {item.brand && <div className="text-xs text-slate-500">{item.brand}</div>}
                        </td>
                        <td className="py-3 pr-4 text-slate-300">{item.category}</td>
                        <td className="py-3 pr-4 text-slate-300">{item.quantity}</td>
                        <td className="py-3 pr-4 text-green-400 font-semibold">+{item.pointsEarned}</td>
                        <td className="py-3 pr-4 text-teal-400">{item.co2Saved.toFixed(1)}kg</td>
                        <td className="py-3"><StatusBadge status={item.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Pickups Tab ── */}
        {activeTab === 'Pickups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">My Pickups ({pickups.length})</h3>
              <Link to="/pickups" className="btn-primary text-sm py-2">+ Schedule Pickup</Link>
            </div>
            {pickups.length === 0 ? (
              <div className="card p-8">
                <EmptyState icon="🚚" title="No pickups yet" description="Schedule a pickup to have your e-waste collected for free." action={<Link to="/pickups" className="btn-primary text-sm">Schedule Now</Link>} />
              </div>
            ) : (
              pickups.map((p) => (
                <div key={p._id} className="card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={p.status} />
                        <span className="text-slate-400 text-xs">{new Date(p.scheduledDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="text-white font-medium">{p.address}, {p.city}</div>
                      <div className="text-slate-400 text-sm mt-1">{p.timeSlot}</div>
                      {p.items?.length > 0 && (
                        <div className="text-slate-500 text-xs mt-2">
                          Items: {p.items.map((i) => i.itemName).join(', ')}
                        </div>
                      )}
                      {p.adminNote && (
                        <div className="text-yellow-400 text-xs mt-1">Note: {p.adminNote}</div>
                      )}
                    </div>
                    {p.pointsAwarded > 0 && (
                      <div className="flex items-center gap-1 text-green-400 font-bold">
                        <Trophy size={14} />
                        +{p.pointsAwarded} pts
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Leaderboard Tab ── */}
        {activeTab === 'Leaderboard' && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-6">
              <Award size={20} className="text-yellow-400" />
              <h3 className="font-semibold text-white">Top Recyclers</h3>
            </div>
            {leaderboard.length === 0 ? (
              <EmptyState icon="🏆" title="No data yet" />
            ) : (
              <div className="space-y-3">
                {leaderboard.map((u, idx) => {
                  const isYou = u._id === user?._id;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div
                      key={u._id}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                        isYou ? 'bg-green-500/10 border border-green-500/25' : 'bg-slate-700/30 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="text-xl w-8 text-center flex-shrink-0">
                        {medals[idx] || <span className="text-slate-400 font-bold text-base">#{idx + 1}</span>}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-green-400 font-bold text-sm">{u.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm truncate">
                          {u.name} {isYou && <span className="text-green-400">(You)</span>}
                        </div>
                        <div className="text-slate-400 text-xs">{u.city} · {u.totalItemsRecycled} items · {u.level}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-yellow-400 font-bold">{u.points.toLocaleString()}</div>
                        <div className="text-slate-500 text-xs">points</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === 'Profile' && (
          <div className="max-w-lg">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xl font-bold">{user?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{user?.name}</div>
                    <div className="text-slate-400 text-sm">{user?.email}</div>
                  </div>
                </div>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="btn-ghost text-sm flex items-center gap-1.5">
                    <Edit3 size={14} /> Edit
                  </button>
                ) : (
                  <button onClick={() => { setEditing(false); setProfileForm({ name: user.name, city: user.city, phone: user.phone || '' }); }} className="btn-ghost text-sm">
                    <X size={14} />
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input className="input" value={profileForm.name} onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">City</label>
                    <input className="input" value={profileForm.city} onChange={(e) => setProfileForm(p => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input className="input" value={profileForm.phone} onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
                  </div>
                  <button onClick={handleProfileSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
                    {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: user?.name },
                    { label: 'Email', value: user?.email },
                    { label: 'City', value: user?.city },
                    { label: 'Phone', value: user?.phone || '—' },
                    { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2 border-b border-slate-700/50">
                      <span className="text-slate-400 text-sm">{label}</span>
                      <span className="text-white text-sm font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                      <div className="text-green-400 font-bold text-lg">{user?.points || 0}</div>
                      <div className="text-slate-400 text-xs">Points</div>
                    </div>
                    <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                      <div className="text-blue-400 font-bold text-lg">{user?.totalItemsRecycled || 0}</div>
                      <div className="text-slate-400 text-xs">Items</div>
                    </div>
                    <div className="bg-slate-700/40 rounded-xl p-3 text-center">
                      <div className="text-teal-400 font-bold text-lg">{(user?.co2Saved || 0).toFixed(1)}</div>
                      <div className="text-slate-400 text-xs">kg CO₂</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
