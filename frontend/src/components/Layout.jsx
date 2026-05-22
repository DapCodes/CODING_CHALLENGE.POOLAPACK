import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, MapPin, Database, LogOut, Hexagon, Menu, X } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Siswa', icon: <Users size={18} /> },
    { path: '/kabupaten', label: 'Kabupaten', icon: <MapPin size={18} /> },
    { path: '/kecamatan', label: 'Kecamatan', icon: <Database size={18} /> }
  ];

  return (
    <div>
      <nav className="nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.25rem' }}>
          <Hexagon size={26} style={{ color: 'var(--accent-blue)' }} />
          PSM
        </div>

        {}
        <div className="nav-links desktop-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={handleLogout} className="btn btn-ghost desktop-nav" style={{ gap: '0.4rem' }}>
            <LogOut size={16} /> Logout
          </button>
          {}
          <button
            className="btn btn-ghost mobile-nav"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ padding: '0.5rem' }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {}
      {menuOpen && (
        <div className="mobile-drawer">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <button onClick={handleLogout} className="mobile-nav-item" style={{ border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', background: 'none', color: 'var(--danger)', fontFamily: 'inherit' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}

      <main className="dashboard-container">
        <div className="glass-panel wide">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
