import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complianceApi } from '../api/complianceApi';
import { ApiError } from '../api/types';
import type { PendingValidationItem } from '../api/types';

//const POLL_INTERVAL_MS = 60_000;

function timeWaiting(submittedAt: string): string {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(submittedAt).getTime()) / 60_000));
  if (minutes < 1) return 'menos de 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

export function PendingListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PendingValidationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await complianceApi.getPendingValidation();
      setItems(data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.');
    } finally {
       setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  void load();
}, [load]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Casos pendientes de validación</h2>
        <button
          className="btn btn-outline"
          onClick={load}
          disabled={isLoading}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {isLoading && !items && <p>Cargando...</p>}

      {!isLoading && items && items.length === 0 && !error && (
        <div className="empty-state card">No existen evidencias pendientes de validación.</div>
      )}

      {items && items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.complianceId}
              className="card"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{item.medicationName}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Dosis: {item.dose} · Paciente #{item.patientId}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Programada:{' '}
                  {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'N/D'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Enviada: {new Date(item.submittedAt).toLocaleString()} · Esperando desde hace{' '}
                  {timeWaiting(item.submittedAt)}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/review/${item.complianceId}`)}
              >
                Revisar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
