import React, { useState, useEffect, useCallback } from 'react';
import { pickupAPI, wasteAPI } from '../api';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import Spinner from '../components/Spinner';
import toast from 'react-hot-toast';
import { Plus, X, Package, Calendar, Clock, MapPin, Trash2, ChevronDown } from 'lucide-react';

const TIME_SLOTS = ['9 AM - 12 PM', '12 PM - 3 PM', '3 PM - 6 PM'];

// Get tomorrow's date formatted as YYYY-MM-DD for min date input
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function PickupPage() {
  const [pickups, setPickups]   = useState([]);
  const [myItems, setMyItems]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const [form, setForm] = useState({
    address: '', city: '', pincode: '', scheduledDate: '', timeSlot: '', notes: '', itemIds: [],
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pickupsRes, itemsRes] = await Promise.all([
        pickupAPI.getMyPickups(),
        wasteAPI.getMyItems(),
      ]);
      setPickups(pickupsRes.data.pickups || []);
      // Only show items that are in "logged" status (not yet in a pickup)
      setMyItems((itemsRes.data.items || []).filter((i) => i.status === 'logged'));
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const validate = () => {
    const errs = {};
    if (!form.address.trim()) errs.address = 'Address is required.';
    if (!form.city.trim()) errs.city = 'City is required.';
    if (!form.scheduledDate) errs.scheduledDate = 'Please select a date.';
    if (!form.timeSlot) errs.timeSlot = 'Please select a time slot.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (formErrors[name]) setFormErrors((p) => ({ ...p, [name]: '' }));
  };

  const toggleItem = (id) => {
    setForm((p) => ({
      ...p,
      itemIds: p.itemIds.includes(id) ? p.itemIds.filter((x) => x !== id) : [...p.itemIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSubmitting(true);
    try {
      await pickupAPI.schedule(form);
      toast.success('Pickup scheduled! We\'ll confirm soon. 🚚');
      setForm({ address: '', city: '', pincode: '', scheduledDate: '', timeSlot: '', notes: '', itemIds: [] });
      setFormErrors({});
      setShowForm(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule pickup.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await pickupAPI.cancel(cancelTarget);
      toast.success('Pickup cancelled.');
      setCancelTarget(null);
      await fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel.');
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="page-title">Pickup Requests</h1>
            <p className="page-subtitle">Schedule free doorstep e-waste collection</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Cancel' : 'Schedule Pickup'}
          </button>
        </div>

        {/* Schedule Form */}
        {showForm && (
          <div className="card p-6 mb-8 border-blue-500/20">
            <h2 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
              <Package size={18} className="text-blue-400" /> Schedule New Pickup
            </h2>
            <form onSubmit={handleSubmit} noValidate>
              {/* Address */}
              <div className="mb-4">
                <label className="label">
                  <MapPin size={13} className="inline mr-1 text-slate-400" />Pickup Address *
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="e.g. 42 MG Road, Indiranagar"
                  className={`input ${formErrors.address ? 'border-red-500' : ''}`}
                />
                {formErrors.address && <p className="text-red-400 text-xs mt-1">{formErrors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* City */}
                <div>
                  <label className="label">City *</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Bengaluru"
                    className={`input ${formErrors.city ? 'border-red-500' : ''}`}
                  />
                  {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
                </div>
                {/* Pincode */}
                <div>
                  <label className="label">Pincode (optional)</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="560001" className="input" maxLength={6} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Date */}
                <div>
                  <label className="label">
                    <Calendar size={13} className="inline mr-1 text-slate-400" />Pickup Date *
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={form.scheduledDate}
                    onChange={handleChange}
                    min={getTomorrow()}
                    className={`input ${formErrors.scheduledDate ? 'border-red-500' : ''}`}
                  />
                  {formErrors.scheduledDate && <p className="text-red-400 text-xs mt-1">{formErrors.scheduledDate}</p>}
                </div>
                {/* Time Slot */}
                <div>
                  <label className="label">
                    <Clock size={13} className="inline mr-1 text-slate-400" />Time Slot *
                  </label>
                  <div className="relative">
                    <select
                      name="timeSlot"
                      value={form.timeSlot}
                      onChange={handleChange}
                      className={`input appearance-none pr-8 ${formErrors.timeSlot ? 'border-red-500' : ''}`}
                    >
                      <option value="">Select time slot</option>
                      {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {formErrors.timeSlot && <p className="text-red-400 text-xs mt-1">{formErrors.timeSlot}</p>}
                </div>
              </div>

              {/* Select items to include */}
              {myItems.length > 0 && (
                <div className="mb-4">
                  <label className="label">Link Items (optional)</label>
                  <p className="text-slate-500 text-xs mb-2">Select items already logged that you want picked up.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {myItems.map((item) => (
                      <label
                        key={item._id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          form.itemIds.includes(item._id)
                            ? 'border-green-500/50 bg-green-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.itemIds.includes(item._id)}
                          onChange={() => toggleItem(item._id)}
                          className="accent-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{item.itemName}</div>
                          <div className="text-slate-400 text-xs">{item.category} · {item.quantity} unit{item.quantity > 1 ? 's' : ''}</div>
                        </div>
                        <span className="text-green-400 text-xs font-semibold flex-shrink-0">+{item.pointsEarned}pts</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {myItems.length === 0 && (
                <div className="mb-4 p-3 bg-slate-700/30 rounded-lg text-slate-400 text-sm">
                  💡 No unassigned items found. You can still schedule a pickup and bring items on the day.
                </div>
              )}

              {/* Notes */}
              <div className="mb-5">
                <label className="label">Special Instructions (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. Ring bell 3 times, call before arriving..."
                  className="input resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                  {submitting
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Package size={16} />}
                  {submitting ? 'Scheduling...' : 'Schedule Pickup'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setFormErrors({}); }} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Pickups List */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-4">
            My Pickups <span className="text-slate-400 font-normal text-sm">({pickups.length})</span>
          </h3>
          {pickups.length === 0 ? (
            <EmptyState
              icon="🚚"
              title="No pickups scheduled"
              description="Schedule your first free doorstep pickup now."
              action={<button onClick={() => setShowForm(true)} className="btn-primary text-sm">Schedule Pickup</button>}
            />
          ) : (
            <div className="space-y-4">
              {pickups.map((p) => (
                <div key={p._id} className="border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      {/* Status + date */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <StatusBadge status={p.status} />
                        <span className="text-slate-400 text-xs">
                          {new Date(p.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Clock size={11} /> {p.timeSlot}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-1.5 mb-1">
                        <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white text-sm font-medium">{p.address}, {p.city}{p.pincode ? ' - ' + p.pincode : ''}</span>
                      </div>

                      {/* Items */}
                      {p.items?.length > 0 && (
                        <div className="text-slate-400 text-xs mt-1 ml-5">
                          Items: {p.items.map((i) => i.itemName).join(', ')}
                        </div>
                      )}

                      {/* Notes */}
                      {p.notes && (
                        <div className="text-slate-500 text-xs mt-1 ml-5 italic">"{p.notes}"</div>
                      )}

                      {/* Admin note */}
                      {p.adminNote && (
                        <div className="mt-2 ml-5 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5 inline-block">
                          Admin: {p.adminNote}
                        </div>
                      )}
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2">
                      {p.pointsAwarded > 0 && (
                        <div className="text-green-400 font-bold text-sm">+{p.pointsAwarded} pts</div>
                      )}
                      {['pending', 'approved'].includes(p.status) && (
                        <button
                          onClick={() => setCancelTarget(p._id)}
                          className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={13} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Pickup?"
        message="This will cancel your scheduled pickup request. You can schedule a new one anytime."
        confirmLabel="Yes, Cancel"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}
