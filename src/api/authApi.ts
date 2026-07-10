import { httpClient } from './httpClient';
import type { LoginResponse } from './types';

/// Reutiliza Identity-Service sin modificarlo (mismo endpoint que usa
/// MediTrack-Mobile) — el validador se autentica con una cuenta de rol
/// "TechnicalStaff", que el gateway exige para los endpoints de validación.
export const authApi = {
  login: (email: string, password: string) =>
    httpClient.postJson<LoginResponse>('/identity/api/v1/auth/login', { email, password }),
};
