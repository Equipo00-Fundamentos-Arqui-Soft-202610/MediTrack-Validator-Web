import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PrototypeBanner } from './PrototypeBanner';

export function Layout() {
  const { isAuthenticated, userName, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PrototypeBanner />
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, color: 'var(--color-primary-dark)' }}>
            MediTrack AI Validator
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
            Prototipo de validación inteligente con supervisión humana
          </p>
        </div>
        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{userName}</span>
            <button
              className="btn btn-outline"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
