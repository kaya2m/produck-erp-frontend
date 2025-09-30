import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  SecurityConfiguration,
  SecurityDashboard,
  SecurityAlert,
  SecurityAuditLog,
  SecurityAuditFilter,
  RecordAccessPolicy,
  CreatePolicyRequest,
  ApiResponse,
  FieldPermissionResult,
  RecordAccessResult,
  SecurityValidationResult,
  SecurityRiskAssessment,
  SecurityAccessRequest,
  SecurityComplianceReport,
  PermissionMatrix
} from '../types/system-management.types';

@Injectable({
  providedIn: 'root'
})
export class SecurityManagementService {
  private readonly baseUrl = `${environment.apiUrl}/security`;

  constructor(private http: HttpClient) {}

  // Security Dashboard
  getSecurityDashboard(params?: {
    from?: string;
    to?: string;
  }): Observable<SecurityDashboard> {
    let httpParams = new HttpParams();

    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);

    return this.http.get<SecurityDashboard>(`${this.baseUrl}/dashboard`, { params: httpParams });
  }

  // Security Configuration
  getSecurityConfiguration(): Observable<SecurityConfiguration> {
    return this.http.get<SecurityConfiguration>(`${this.baseUrl}/configuration`);
  }

  updateSecurityConfiguration(config: SecurityConfiguration): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/configuration`, config);
  }

  // Security Alerts
  getSecurityAlerts(userId?: string): Observable<SecurityAlert[]> {
    let httpParams = new HttpParams();
    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<SecurityAlert[]>(`${this.baseUrl}/alerts`, { params: httpParams });
  }

  resolveSecurityAlert(alertId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/alerts/${alertId}/resolve`, {});
  }

  dismissSecurityAlert(alertId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/alerts/${alertId}/dismiss`, {});
  }

  // Audit Logs
  getAuditLogs(filter?: SecurityAuditFilter): Observable<SecurityAuditLog[]> {
    let httpParams = new HttpParams();

    if (filter?.userId) httpParams = httpParams.set('userId', filter.userId);
    if (filter?.action) httpParams = httpParams.set('action', filter.action);
    if (filter?.entityType) httpParams = httpParams.set('entityType', filter.entityType);
    if (filter?.fromDate) httpParams = httpParams.set('fromDate', filter.fromDate);
    if (filter?.toDate) httpParams = httpParams.set('toDate', filter.toDate);
    if (filter?.ipAddress) httpParams = httpParams.set('ipAddress', filter.ipAddress);

    return this.http.get<SecurityAuditLog[]>(`${this.baseUrl}/audit-logs`, { params: httpParams });
  }

  exportAuditLogs(filter?: SecurityAuditFilter, format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);

    if (filter?.userId) httpParams = httpParams.set('userId', filter.userId);
    if (filter?.action) httpParams = httpParams.set('action', filter.action);
    if (filter?.entityType) httpParams = httpParams.set('entityType', filter.entityType);
    if (filter?.fromDate) httpParams = httpParams.set('fromDate', filter.fromDate);
    if (filter?.toDate) httpParams = httpParams.set('toDate', filter.toDate);
    if (filter?.ipAddress) httpParams = httpParams.set('ipAddress', filter.ipAddress);

    return this.http.get(`${this.baseUrl}/audit-logs/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  // Field-Level Security
  getFieldPermissions(entityType: string, userId?: string): Observable<FieldPermissionResult> {
    let httpParams = new HttpParams();
    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<FieldPermissionResult>(
      `${this.baseUrl}/field-permissions/${entityType}`,
      { params: httpParams }
    );
  }

  canAccessField(
    entityType: string,
    fieldName: string,
    accessType: string = 'read',
    userId?: string
  ): Observable<boolean> {
    let httpParams = new HttpParams()
      .set('entityType', entityType)
      .set('fieldName', fieldName)
      .set('accessType', accessType);

    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<boolean>(`${this.baseUrl}/can-access-field`, { params: httpParams });
  }

  applyFieldSecurity(entityType: string, entity: any, userId?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/apply-field-security`, {
      entityType,
      entity,
      userId
    });
  }

  // Record-Level Access
  canAccessRecord(
    entityType: string,
    recordId: string,
    accessType: string = 'read',
    userId?: string
  ): Observable<boolean> {
    let httpParams = new HttpParams()
      .set('entityType', entityType)
      .set('recordId', recordId)
      .set('accessType', accessType);

    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<boolean>(`${this.baseUrl}/can-access-record`, { params: httpParams });
  }

  getRecordAccess(entityType: string, recordId: string, userId?: string): Observable<RecordAccessResult> {
    let httpParams = new HttpParams()
      .set('entityType', entityType)
      .set('recordId', recordId);

    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<RecordAccessResult>(`${this.baseUrl}/record-access`, { params: httpParams });
  }

  getAccessibleRecords(entityType: string, userId?: string): Observable<string[]> {
    let httpParams = new HttpParams();
    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<string[]>(
      `${this.baseUrl}/accessible-records/${entityType}`,
      { params: httpParams }
    );
  }

  // Access Policies
  getPolicies(entityType: string): Observable<RecordAccessPolicy[]> {
    return this.http.get<RecordAccessPolicy[]>(`${this.baseUrl}/policies/${entityType}`);
  }

  createPolicy(request: CreatePolicyRequest): Observable<RecordAccessPolicy> {
    return this.http.post<RecordAccessPolicy>(`${this.baseUrl}/policies`, request);
  }

  updatePolicy(id: string, request: Partial<CreatePolicyRequest>): Observable<RecordAccessPolicy> {
    return this.http.put<RecordAccessPolicy>(`${this.baseUrl}/policies/${id}`, request);
  }

  deletePolicy(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/policies/${id}`);
  }

  testPolicy(policyId: string, testCases: Array<{
    userId: string;
    entityType: string;
    recordId?: string;
    context?: any;
  }>): Observable<Array<{
    testCase: any;
    result: boolean;
    reason: string;
    matchedRules: string[];
  }>> {
    return this.http.post<Array<{
      testCase: any;
      result: boolean;
      reason: string;
      matchedRules: string[];
    }>>(`${this.baseUrl}/policies/${policyId}/test`, { testCases });
  }

  // Security Validation
  validateAccess(request: SecurityAccessRequest): Observable<SecurityValidationResult> {
    return this.http.post<SecurityValidationResult>(`${this.baseUrl}/validate-access`, request);
  }

  assessRisk(request: SecurityAccessRequest): Observable<SecurityRiskAssessment> {
    return this.http.post<SecurityRiskAssessment>(`${this.baseUrl}/assess-risk`, request);
  }

  validateSecurityContext(userId?: string): Observable<boolean> {
    let httpParams = new HttpParams();
    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<boolean>(`${this.baseUrl}/validate-context`, { params: httpParams });
  }

  // Compliance
  generateComplianceReport(from: string, to: string): Observable<SecurityComplianceReport> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);

    return this.http.get<SecurityComplianceReport>(
      `${this.baseUrl}/compliance-report`,
      { params }
    );
  }

  // Permission Matrix
  getUserPermissionMatrix(userId?: string): Observable<PermissionMatrix> {
    let httpParams = new HttpParams();
    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<PermissionMatrix>(`${this.baseUrl}/permission-matrix`, { params: httpParams });
  }

  invalidateUserPermissionsCache(userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/invalidate-cache/${userId}`, {});
  }

  // User Access Analysis
  getUsersWithAccess(entityType: string, recordId: string): Observable<any[]> {
    const params = new HttpParams()
      .set('entityType', entityType)
      .set('recordId', recordId);

    return this.http.get<any[]>(`${this.baseUrl}/users-with-access`, { params });
  }

  // Security Events
  logSecurityEvent(event: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    fieldName?: string;
    accessLevel: string;
    reason?: string;
    sensitivityLevel?: string;
    durationMs?: number;
    additionalData?: string;
  }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/log-event`, event);
  }

  // Data Protection
  maskSensitiveData(data: string, maskingPattern: string = '***'): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/mask-data`, {
      data,
      maskingPattern
    });
  }

  // Security Statistics
  getSecurityStatistics(params?: {
    from?: string;
    to?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Observable<{
    totalAuditLogs: number;
    uniqueUsers: number;
    failedAttempts: number;
    suspiciousActivities: number;
    blockedUsers: number;
    activeSessions: number;
    averageRiskScore: number;
    compliance: {
      score: number;
      issues: number;
      warnings: number;
    };
    trends: Array<{
      period: string;
      auditLogs: number;
      failedAttempts: number;
      riskScore: number;
    }>;
  }> {
    let httpParams = new HttpParams();

    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.groupBy) httpParams = httpParams.set('groupBy', params.groupBy);

    return this.http.get<{
      totalAuditLogs: number;
      uniqueUsers: number;
      failedAttempts: number;
      suspiciousActivities: number;
      blockedUsers: number;
      activeSessions: number;
      averageRiskScore: number;
      compliance: {
        score: number;
        issues: number;
        warnings: number;
      };
      trends: Array<{
        period: string;
        auditLogs: number;
        failedAttempts: number;
        riskScore: number;
      }>;
    }>(`${this.baseUrl}/statistics`, { params: httpParams });
  }

  // IP Address Management
  getBlockedIPs(): Observable<Array<{
    ipAddress: string;
    blockedAt: string;
    reason: string;
    expiresAt?: string;
    isAutoBlocked: boolean;
  }>> {
    return this.http.get<Array<{
      ipAddress: string;
      blockedAt: string;
      reason: string;
      expiresAt?: string;
      isAutoBlocked: boolean;
    }>>(`${this.baseUrl}/blocked-ips`);
  }

  blockIP(ipAddress: string, reason: string, expirationHours?: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/blocked-ips`, {
      ipAddress,
      reason,
      expirationHours
    });
  }

  unblockIP(ipAddress: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/blocked-ips/${encodeURIComponent(ipAddress)}`);
  }

  // Session Management
  getActiveSessions(userId?: string): Observable<Array<{
    sessionId: string;
    userId: string;
    username: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    lastActivity: string;
    isCurrentSession: boolean;
  }>> {
    let httpParams = new HttpParams();
    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<Array<{
      sessionId: string;
      userId: string;
      username: string;
      ipAddress: string;
      userAgent: string;
      createdAt: string;
      lastActivity: string;
      isCurrentSession: boolean;
    }>>(`${this.baseUrl}/active-sessions`, { params: httpParams });
  }

  terminateSession(sessionId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/sessions/${sessionId}`);
  }

  terminateAllSessions(userId: string, excludeCurrent: boolean = true): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/users/${userId}/sessions`, {
      body: { excludeCurrent }
    });
  }
}