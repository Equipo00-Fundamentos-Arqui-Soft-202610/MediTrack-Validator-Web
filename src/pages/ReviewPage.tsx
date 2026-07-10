import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { complianceApi } from '../api/complianceApi';
import { ApiError } from '../api/types';
import type { PendingValidationItem } from '../api/types';

type Confirming = 'approve' | 'reject' | null;

export function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const complianceId = Number(id);
  const navigate = useNavigate();

  const [item, setItem] = useState<PendingValidationItem | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirming, setConfirming] = useState<Confirming>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const videoUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const pending = await complianceApi.getPendingValidation();
        const found = pending.find((p) => p.complianceId === complianceId) ?? null;
        if (cancelled) return;

        if (!found) {
          setError('Este caso ya no está pendiente de validación (puede que otro validador ya lo haya resuelto).');
          setIsLoading(false);
          return;
        }
        setItem(found);

        const blob = await complianceApi.getVideoBlob(complianceId);
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        videoUrlRef.current = url;
        setVideoUrl(url);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Ocurrió un error inesperado.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      // La web no descarga ni almacena el video permanentemente: se revoca
      // el Object URL en memoria al salir de la pantalla.
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, [complianceId]);

  async function goToNextCase() {
    try {
      const pending = await complianceApi.getPendingValidation();
      if (pending.length > 0) {
        navigate(`/review/${pending[0].complianceId}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      navigate('/', { replace: true });
    }
  }

  async function handleApprove() {
    setIsSubmitting(true);
    try {
      await complianceApi.approve(complianceId);
      await goToNextCase();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo aprobar. Intenta de nuevo.');
      setIsSubmitting(false);
      setConfirming(null);
    }
  }

  async function handleReject() {
    setIsSubmitting(true);
    try {
      await complianceApi.reject(complianceId, rejectionReason.trim() || undefined);
      await goToNextCase();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo rechazar. Intenta de nuevo.');
      setIsSubmitting(false);
      setConfirming(null);
    }
  }

  if (isLoading) {
    return (
      <div className="container">
        <p>Cargando caso...</p>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="container">
        <div className="error-banner">{error}</div>
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          Volver a la bandeja
        </button>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <button className="btn btn-outline" onClick={() => navigate('/')} style={{ marginBottom: 16 }}>
        ← Volver a la bandeja
      </button>

      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>{item.medicationName}</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Dosis: {item.dose}</p>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Paciente #{item.patientId}</p>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Programada: {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : 'N/D'}
        </p>
        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
          Enviada: {new Date(item.submittedAt).toLocaleString()}
        </p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        {videoUrl ? (
          <video src={videoUrl} controls style={{ width: '100%', borderRadius: 12 }} />
        ) : (
          <p>No se pudo cargar el video.</p>
        )}
      </div>

      <div className="card">
        {confirming === null && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: '#2e7d32' }}
              disabled={isSubmitting}
              onClick={() => setConfirming('approve')}
            >
              Aprobar toma
            </button>
            <button
              className="btn btn-danger"
              style={{ flex: 1 }}
              disabled={isSubmitting}
              onClick={() => setConfirming('reject')}
            >
              Rechazar evidencia
            </button>
          </div>
        )}

        {confirming === 'approve' && (
          <div>
            <p>¿Confirmas que la evidencia muestra que el paciente tomó la dosis?</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setConfirming(null)} disabled={isSubmitting}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#2e7d32' }}
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Aprobando...' : 'Sí, aprobar'}
              </button>
            </div>
          </div>
        )}

        {confirming === 'reject' && (
          <div>
            <p>¿Confirmas que quieres rechazar esta evidencia?</p>
            <label style={{ display: 'block', marginBottom: 12 }}>
              Motivo (opcional)
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                style={{ display: 'block', width: '100%', marginTop: 6, borderRadius: 8, border: '1px solid var(--color-border)', padding: 8 }}
              />
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setConfirming(null)} disabled={isSubmitting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleReject} disabled={isSubmitting}>
                {isSubmitting ? 'Rechazando...' : 'Sí, rechazar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
