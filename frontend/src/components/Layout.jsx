import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, MapPin, Database, LogOut, Hexagon } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '1.25rem' }}>
          <Hexagon className="badge" style={{ padding: 0 }} size={28} />
          PSM
        </div>
        <div className="nav-links">
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
        <button onClick={handleLogout} className="btn btn-ghost btn-icon">
          <LogOut size={18} /> Logout
        </button>
      </nav>
      <main className="dashboard-container">
        <div className="glass-panel wide">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
