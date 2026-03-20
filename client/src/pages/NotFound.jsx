import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold text-slate-700 mb-2">404</div>
        <div className="text-5xl mb-6">♻️</div>
        <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-slate-400 mb-8">
          The page you're looking for has been recycled or never existed.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={16} /> Home
          </Link>
        </div>
      </div>
    </div>
  );
}
