import { useState, type CSSProperties, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { ApiError } from '../api/types';
import { useAuth } from '../auth/AuthContext';

/// Reutiliza Identity-Service (sin modificarlo): el validador inicia sesión
/// con una cuenta de rol TechnicalStaff, exigido por el gateway para los
/// endpoints de validación (ver ocelot.json).
export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await authApi.login(email, password);
      if (response.usuario.rol !== 'TechnicalStaff') {
        setError(
          'Esta cuenta no tiene rol de personal técnico (TechnicalStaff). ' +
            'El gateway rechazará las llamadas de validación.',
        );
        setIsSubmitting(false);
        return;
      }
      login(response);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 60 }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Acceso del validador</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label>
            Correo electrónico
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--color-border)',
  fontSize: 14,
};
