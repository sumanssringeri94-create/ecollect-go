import React, { useState, useEffect, useCallback } from 'react';
import { wasteAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { Plus, Trash2, Recycle, Leaf, X, ChevronDown } from 'lucide-react';

const CONDITIONS = ['Working', 'Not Working', 'Damaged', 'Unknown'];

export default function WastePage() {
  const { refreshUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    category: '', itemName: '', brand: '', condition: 'Unknown', quantity: 1, description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([wasteAPI.getCategories(), wasteAPI.getMyItems()]);
      setCategories(catRes.data.categories || []);
      setItems(itemRes.data.items || []);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validate = () => {
    const errs = {};
    if (!form.category) errs.category = 'Please select a category.';
    if (!form.itemName.trim()) errs.itemName = 'Item name is required.';
    if (form.quantity < 1) errs.quantity = 'Quantity must be at least 1.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await wasteAPI.addItem(form);
      toast.success(res.data.message || 'Item added!');
      setForm({ category: '', itemName: '', brand: '', condition: 'Unknown', quantity: 1, description: '' });
      setFormErrors({});
      setShowForm(false);
      await fetchAll();
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await wasteAPI.deleteItem(deleteTarget);
      toast.success('Item deleted.');
      setDeleteTarget(null);
      await fetchAll();
    } catch {
      toast.error('Failed to delete item.');
    }
  };

  // Preview points for selected category
  const selectedCat = categories.find((c) => c.id === form.category);
  const previewPoints = selectedCat ? selectedCat.points * form.quantity : 0;
  const previewCO2 = selectedCat ? (selectedCat.co2 * form.quantity).toFixed(1) : 0;

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="page-title">E-Waste Items</h1>
            <p className="page-subtitle">Log and manage your recyclable electronics</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>

        {/* Category reference cards */}
        {!showForm && (
          <div className="mb-8">
            <p className="text-slate-400 text-sm font-medium mb-3">Points per category:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => { setForm(p => ({ ...p, category: cat.id })); setShowForm(true); }}
                  className="card p-3 cursor-pointer hover:border-green-500/40 transition-all hover:scale-[1.02] active:scale-95 text-center"
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs text-slate-300 font-medium leading-tight mb-1">{cat.name}</div>
                  <div className="text-green-400 text-xs font-bold">+{cat.points} pts</div>
                  <div className="text-teal-400 text-xs">{cat.co2}kg CO₂</div>
                  {cat.hazardous && <div className="text-orange-400 text-xs mt-0.5">⚠ Hazardous</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Item Form */}
        {showForm && (
          <div className="card p-6 mb-8 border-green-500/20">
            <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <Recycle size={18} className="text-green-400" /> Add New E-Waste Item
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="label">Category *</label>
                  <div className="relative">
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className={`input appearance-none pr-8 ${formErrors.category ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name} (+{c.points} pts)</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {formErrors.category && <p className="text-red-400 text-xs mt-1">{formErrors.category}</p>}
                </div>

                {/* Item Name */}
                <div>
                  <label className="label">Item Name *</label>
                  <input
                    name="itemName"
                    value={form.itemName}
                    onChange={handleChange}
                    placeholder="e.g. Dell Inspiron 15"
                    className={`input ${formErrors.itemName ? 'border-red-500' : ''}`}
                  />
                  {formErrors.itemName && <p className="text-red-400 text-xs mt-1">{formErrors.itemName}</p>}
                </div>

                {/* Brand */}
                <div>
                  <label className="label">Brand (optional)</label>
                  <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Dell, Apple, Samsung" className="input" />
                </div>

                {/* Condition */}
                <div>
                  <label className="label">Condition</label>
                  <div className="relative">
                    <select name="condition" value={form.condition} onChange={handleChange} className="input appearance-none pr-8">
                      {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="label">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min={1}
                    max={50}
                    className={`input ${formErrors.quantity ? 'border-red-500' : ''}`}
                  />
                  {formErrors.quantity && <p className="text-red-400 text-xs mt-1">{formErrors.quantity}</p>}
                </div>

                {/* Preview */}
                {selectedCat && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
                    <div className="text-3xl">{selectedCat.icon}</div>
                    <div>
                      <div className="text-green-400 font-bold text-lg">+{previewPoints} points</div>
                      <div className="text-teal-400 text-sm flex items-center gap-1">
                        <Leaf size={12} /> {previewCO2}kg CO₂ saved
                      </div>
                      {selectedCat.hazardous && <div className="text-orange-400 text-xs mt-0.5">⚠ Handle with care</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="label">Notes (optional)</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional details about the item..."
                  className="input resize-none"
                />
              </div>

              <div className="flex gap-3 mt-5">
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Plus size={16} />}
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFormErrors({}); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items List */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">
            My Items <span className="text-slate-400 font-normal text-sm">({items.length})</span>
          </h3>
          {items.length === 0 ? (
            <EmptyState
              icon="♻️"
              title="No items logged yet"
              description="Click 'Add Item' or tap a category above to get started."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700 text-left">
                    <th className="pb-3 pr-4 font-medium">Item</th>
                    <th className="pb-3 pr-4 font-medium hidden sm:table-cell">Category</th>
                    <th className="pb-3 pr-4 font-medium hidden md:table-cell">Condition</th>
                    <th className="pb-3 pr-4 font-medium">Qty</th>
                    <th className="pb-3 pr-4 font-medium">Points</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-white">{item.itemName}</div>
                        {item.brand && <div className="text-xs text-slate-500">{item.brand}</div>}
                      </td>
                      <td className="py-3 pr-4 text-slate-300 hidden sm:table-cell">{item.category}</td>
                      <td className="py-3 pr-4 text-slate-400 hidden md:table-cell">{item.condition}</td>
                      <td className="py-3 pr-4 text-slate-300">{item.quantity}</td>
                      <td className="py-3 pr-4 text-green-400 font-semibold">+{item.pointsEarned}</td>
                      <td className="py-3 pr-4"><StatusBadge status={item.status} /></td>
                      <td className="py-3">
                        <button
                          onClick={() => setDeleteTarget(item._id)}
                          disabled={['pickup_requested', 'collected', 'recycled'].includes(item.status)}
                          className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded transition-colors"
                          title={['pickup_requested', 'collected', 'recycled'].includes(item.status) ? 'Cannot delete — already in process' : 'Delete item'}
                        >
                          <Trash2 size={15} />
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Item?"
        message="This will permanently remove the item from your history. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
