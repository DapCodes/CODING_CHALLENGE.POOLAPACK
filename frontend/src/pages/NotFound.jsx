import { Link } from 'react-router-dom';
import { Hexagon, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="auth-container">
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <AlertTriangle size={64} style={{ color: 'var(--danger)', marginBottom: '1.5rem' }} />
        <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Page Not Found</h2>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
          <Hexagon size={18} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
