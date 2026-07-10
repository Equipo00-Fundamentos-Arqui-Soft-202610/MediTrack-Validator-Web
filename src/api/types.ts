/// Contratos reales expuestos por FollowUp-Service (vía API Gateway,
/// segmento /followup). Ver ComplianceValidationResources.cs en FollowUp-Service.

export interface PendingValidationItem {
  complianceId: number;
  patientId: number;
  medicationName: string;
  dose: string;
  scheduledAt: string | null;
  submittedAt: string;
  videoEndpoint: string;
}

export type ValidationStatus = 'pendingvalidation' | 'approved' | 'rejected' | string;

export interface ComplianceValidationStatus {
  complianceId: number;
  status: ValidationStatus;
  rejectionReason: string | null;
  validatedAt: string | null;
}

export interface LoginResponse {
  accessToken: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    institucion: string | null;
  };
}

export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.status = status;
  }
}
