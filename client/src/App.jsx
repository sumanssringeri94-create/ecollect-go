import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home       from './pages/Home';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import WastePage  from './pages/WastePage';
import PickupPage from './pages/PickupPage';
import MapPage    from './pages/MapPage';
import AdminPage  from './pages/AdminPage';
import NotFound   from './pages/NotFound';

// Layout
import Navbar from './components/Navbar';
import Spinner from './components/Spinner';

// Protected route wrapper
const Protected = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <Spinner fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

// Public only (redirect authenticated users away)
const PublicOnly = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Spinner fullscreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login"    element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      {/* Protected */}
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/waste"     element={<Protected><WastePage /></Protected>} />
      <Route path="/pickups"   element={<Protected><PickupPage /></Protected>} />
      <Route path="/map"       element={<Protected><MapPage /></Protected>} />

      {/* Admin */}
      <Route path="/admin" element={<Protected adminOnly><AdminPage /></Protected>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
