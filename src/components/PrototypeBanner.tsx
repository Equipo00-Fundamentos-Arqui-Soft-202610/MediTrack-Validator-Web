/// Indicador obligatorio del prototipo (human-in-the-loop validation
/// prototype): deja explícito que hoy decide una persona, no un modelo de IA.
export function PrototypeBanner() {
  return (
    <div
      style={{
        background: 'var(--color-warning-bg)',
        color: 'var(--color-warning-text)',
        padding: '10px 20px',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      Simulador del futuro módulo de visión artificial — la decisión de aprobar o
      rechazar la toma hoy la realiza una persona (human-in-the-loop validation
      prototype). Ningún modelo de IA real está analizando este video.
    </div>
  );
}
