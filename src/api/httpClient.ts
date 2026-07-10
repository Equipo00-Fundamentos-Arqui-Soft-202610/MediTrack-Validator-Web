import { API_BASE_URL } from '../config/env';
import { tokenStorage } from '../auth/tokenStorage';
import { ApiError } from './types';

/// Registrado por App.tsx: se dispara ante un 401 real (token vencido/inválido)
/// para limpiar la sesión y volver a Login — mismo patrón que MediTrack-Mobile.
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data?.message === 'string' && data.message.length > 0) return data.message;
    if (typeof data?.title === 'string' && data.title.length > 0) return data.title;
    if (data?.errors && typeof data.errors === 'object') {
      return Object.values(data.errors as Record<string, unknown>)
        .flat()
        .join('\n');
    }
  } catch {
    // Body vacío o no-JSON: se usa el mensaje genérico por status.
  }

  switch (response.status) {
    case 400:
      return 'Solicitud inválida.';
    case 401:
      return 'Sesión expirada. Inicia sesión nuevamente.';
    case 404:
      return 'No se encontró la información solicitada.';
    case 500:
      return 'Error interno del servidor. Intenta más tarde.';
    default:
      return `Ocurrió un error inesperado (${response.status}).`;
  }
}

interface RequestOptions extends RequestInit {
  json?: unknown;
}

async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const { json, headers, ...rest } = options;
  const token = tokenStorage.getToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el API Gateway esté activo.',
      null,
    );
  }

  if (response.status === 401 && token) {
    onUnauthorized?.();
  }

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return response;
}

export const httpClient = {
  async getJson<T>(path: string): Promise<T> {
    const response = await request(path, { method: 'GET' });
    return (await response.json()) as T;
  },

  async postJson<T>(path: string, json?: unknown): Promise<T> {
    const response = await request(path, { method: 'POST', json });
    return (await response.json()) as T;
  },

  async patchJson<T>(path: string, json?: unknown): Promise<T> {
    const response = await request(path, { method: 'PATCH', json });
    return (await response.json()) as T;
  },

  /// Descarga el video como Blob (con el header Authorization, que un <video
  /// src="..."> no puede enviar) — se usa para crear un Object URL temporal
  /// que se revoca al salir de la pantalla de revisión.
  async getVideoBlob(path: string): Promise<Blob> {
    const response = await request(path, { method: 'GET' });
    return response.blob();
  },
};
