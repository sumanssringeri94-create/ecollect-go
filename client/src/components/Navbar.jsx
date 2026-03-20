import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Recycle, LayoutDashboard, MapPin, Package,
  Trash2, Shield, LogOut, Menu, X, ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'text-green-400 bg-green-500/10'
        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-green-400 transition-colors">
              <Recycle className="w-4.5 h-4.5 text-slate-900" size={18} />
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              e-Collect <span className="text-green-400">Go</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass}>
                  <LayoutDashboard size={16} /> Dashboard
                </NavLink>
                <NavLink to="/waste" className={navLinkClass}>
                  <Trash2 size={16} /> E-Waste
                </NavLink>
                <NavLink to="/pickups" className={navLinkClass}>
                  <Package size={16} /> Pickups
                </NavLink>
                <NavLink to="/map" className={navLinkClass}>
                  <MapPin size={16} /> Map
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    <Shield size={16} /> Admin
                  </NavLink>
                )}
              </>
            ) : (
              <Link to="/" className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors`}>
                Home
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-slate-300 max-w-[120px] truncate">{user?.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-700">
                      <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="badge-green">{user?.level}</span>
                        <span className="text-xs text-green-400 font-semibold">{user?.points} pts</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}

                {/* Overlay to close dropdown */}
                {dropdownOpen && (
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-700/50 px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <span className="text-green-400 text-sm font-bold">{user?.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-green-400">{user?.points} pts · {user?.level}</p>
                </div>
              </div>
              {[
                { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
                { to: '/waste',     icon: <Trash2 size={16} />,         label: 'E-Waste' },
                { to: '/pickups',   icon: <Package size={16} />,        label: 'Pickups' },
                { to: '/map',       icon: <MapPin size={16} />,         label: 'Map' },
                ...(isAdmin ? [{ to: '/admin', icon: <Shield size={16} />, label: 'Admin' }] : []),
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon} {item.label}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="block btn-ghost w-full text-left" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="block btn-primary w-full text-center mt-2" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
