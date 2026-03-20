import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon || '📭'}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title || 'Nothing here yet'}</h3>
      {description && (
        <p className="text-slate-400 text-sm max-w-xs mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
}
