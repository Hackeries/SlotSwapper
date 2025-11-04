import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'active' : '';

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          SlotSwapper
        </Link>
        <div className="nav-links">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            Dashboard
          </Link>
          <Link to="/marketplace" className={`nav-link ${isActive('/marketplace')}`}>
            Marketplace
          </Link>
          <Link to="/notifications" className={`nav-link ${isActive('/notifications')}`}>
            Requests
          </Link>
          <span className="nav-link" style={{ color: '#6c757d' }}>
            {user?.name} {connected && <span style={{ color: '#28a745' }}>●</span>}
          </span>
          <button onClick={logout} className="btn btn-secondary btn-small">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
