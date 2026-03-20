import React from 'react';

const STATUS_MAP = {
  pending:          { cls: 'badge-yellow', label: '⏳ Pending' },
  approved:         { cls: 'badge-blue',   label: '✓ Approved' },
  rejected:         { cls: 'badge-red',    label: '✗ Rejected' },
  completed:        { cls: 'badge-green',  label: '✔ Completed' },
  logged:           { cls: 'badge-gray',   label: 'Logged' },
  pickup_requested: { cls: 'badge-yellow', label: '⏳ Pickup Pending' },
  collected:        { cls: 'badge-blue',   label: 'Collected' },
  recycled:         { cls: 'badge-green',  label: '♻ Recycled' },
};

export default function StatusBadge({ status }) {
  const { cls, label } = STATUS_MAP[status] || { cls: 'badge-gray', label: status };
  return <span className={cls}>{label}</span>;
}
