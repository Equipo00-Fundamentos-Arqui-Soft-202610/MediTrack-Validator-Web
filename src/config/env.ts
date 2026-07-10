/// Base URL del API Gateway, configurable por entorno (.env / .env.local).
/// Default de desarrollo: localhost (NO 10.0.2.2 — eso es solo para el
/// emulador Android de MediTrack-Mobile, esto corre en un navegador normal).
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'https://meditrack-gateway.onrender.com';
