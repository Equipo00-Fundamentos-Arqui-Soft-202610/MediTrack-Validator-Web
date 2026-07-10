import { httpClient } from './httpClient';
import type { ComplianceValidationStatus, PendingValidationItem } from './types';

/// Todos bajo /followup (API Gateway) — ver ComplianceVideoController en
/// FollowUp-Service. pending-validation/{id}/video/approve/reject están
/// restringidos a rol TechnicalStaff a nivel de gateway (ocelot.json).
export const complianceApi = {
  getPendingValidation: () =>
    httpClient.getJson<PendingValidationItem[]>('/followup/api/v1/compliance/pending-validation'),

  getVideoBlob: (complianceId: number) =>
    httpClient.getVideoBlob(`/followup/api/v1/compliance/${complianceId}/video`),

  approve: (complianceId: number) =>
    httpClient.patchJson<ComplianceValidationStatus>(
      `/followup/api/v1/compliance/${complianceId}/approve`,
    ),

  reject: (complianceId: number, rejectionReason?: string) =>
    httpClient.patchJson<ComplianceValidationStatus>(
      `/followup/api/v1/compliance/${complianceId}/reject`,
      { rejectionReason: rejectionReason || null },
    ),
};
