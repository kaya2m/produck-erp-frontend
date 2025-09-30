import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  PermissionDto,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  ApiResponse
} from '../types/system-management.types';

@Injectable({
  providedIn: 'root'
})
export class PermissionManagementService {
  private readonly baseUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  // Permission CRUD Operations
  getAllPermissions(): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(this.baseUrl);
  }

  getPermissionById(id: string): Observable<PermissionDto> {
    return this.http.get<PermissionDto>(`${this.baseUrl}/${id}`);
  }

  getPermissionsByCategory(category: string): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(`${this.baseUrl}/category/${category}`);
  }

  createPermission(request: CreatePermissionRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.baseUrl, request);
  }

  updatePermission(id: string, request: UpdatePermissionRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/${id}`, request);
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Permission Categories
  getPermissionCategories(): Observable<Array<{
    category: string;
    count: number;
    permissions: PermissionDto[];
  }>> {
    return this.http.get<Array<{
      category: string;
      count: number;
      permissions: PermissionDto[];
    }>>(`${this.baseUrl}/categories`);
  }

  // Initialize Default Permissions
  initializeDefaultPermissions(): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/initialize-defaults`, {});
  }

  // Permission Search and Filter
  searchPermissions(params: {
    search?: string;
    category?: string;
    isAssigned?: boolean;
    roleId?: string;
    page?: number;
    size?: number;
  } = {}): Observable<{
    permissions: PermissionDto[];
    total: number;
    page: number;
    size: number;
  }> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.isAssigned !== undefined) httpParams = httpParams.set('isAssigned', params.isAssigned.toString());
    if (params.roleId) httpParams = httpParams.set('roleId', params.roleId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<{
      permissions: PermissionDto[];
      total: number;
      page: number;
      size: number;
    }>(`${this.baseUrl}/search`, { params: httpParams });
  }

  // Permission Statistics
  getPermissionStatistics(): Observable<{
    totalPermissions: number;
    permissionsByCategory: Array<{
      category: string;
      count: number;
    }>;
    assignedPermissions: number;
    unassignedPermissions: number;
    mostUsedPermissions: Array<{
      permissionId: string;
      permissionName: string;
      roleCount: number;
      userCount: number;
    }>;
  }> {
    return this.http.get<{
      totalPermissions: number;
      permissionsByCategory: Array<{
        category: string;
        count: number;
      }>;
      assignedPermissions: number;
      unassignedPermissions: number;
      mostUsedPermissions: Array<{
        permissionId: string;
        permissionName: string;
        roleCount: number;
        userCount: number;
      }>;
    }>(`${this.baseUrl}/statistics`);
  }

  // Permission Usage
  getPermissionUsage(permissionId: string): Observable<{
    permissionId: string;
    permissionName: string;
    totalRoles: number;
    totalUsers: number;
    roles: Array<{
      roleId: string;
      roleName: string;
      userCount: number;
    }>;
    directUsers: Array<{
      userId: string;
      username: string;
      email: string;
    }>;
  }> {
    return this.http.get<{
      permissionId: string;
      permissionName: string;
      totalRoles: number;
      totalUsers: number;
      roles: Array<{
        roleId: string;
        roleName: string;
        userCount: number;
      }>;
      directUsers: Array<{
        userId: string;
        username: string;
        email: string;
      }>;
    }>(`${this.baseUrl}/${permissionId}/usage`);
  }

  // Bulk Operations
  bulkCreatePermissions(requests: CreatePermissionRequest[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/create`, { permissions: requests });
  }

  bulkDeletePermissions(permissionIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/delete`, { permissionIds });
  }

  bulkUpdateCategory(permissionIds: string[], newCategory: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/bulk/update-category`, {
      permissionIds,
      category: newCategory
    });
  }

  // Permission Validation
  validatePermissionName(name: string): Observable<{
    isValid: boolean;
    exists: boolean;
    suggestions: string[];
    issues: string[];
  }> {
    return this.http.post<{
      isValid: boolean;
      exists: boolean;
      suggestions: string[];
      issues: string[];
    }>(`${this.baseUrl}/validate-name`, { name });
  }

  // Permission Dependencies
  getPermissionDependencies(permissionId: string): Observable<{
    permission: PermissionDto;
    dependencies: PermissionDto[];
    dependents: PermissionDto[];
    conflicts: PermissionDto[];
  }> {
    return this.http.get<{
      permission: PermissionDto;
      dependencies: PermissionDto[];
      dependents: PermissionDto[];
      conflicts: PermissionDto[];
    }>(`${this.baseUrl}/${permissionId}/dependencies`);
  }

  setPermissionDependencies(permissionId: string, dependencyIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${permissionId}/dependencies`, {
      dependencyIds
    });
  }

  // Permission Templates
  getPermissionTemplates(): Observable<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    permissions: CreatePermissionRequest[];
  }>> {
    return this.http.get<Array<{
      id: string;
      name: string;
      description: string;
      category: string;
      permissions: CreatePermissionRequest[];
    }>>(`${this.baseUrl}/templates`);
  }

  createPermissionsFromTemplate(templateId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/templates/${templateId}/create`, {});
  }

  // Export/Import
  exportPermissions(format: 'csv' | 'excel' = 'csv', params?: {
    category?: string;
    includeUsage?: boolean;
  }): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);

    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.includeUsage !== undefined) {
      httpParams = httpParams.set('includeUsage', params.includeUsage.toString());
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  importPermissions(file: File, options?: {
    updateExisting?: boolean;
    skipDuplicates?: boolean;
  }): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    if (options?.updateExisting !== undefined) {
      formData.append('updateExisting', options.updateExisting.toString());
    }
    if (options?.skipDuplicates !== undefined) {
      formData.append('skipDuplicates', options.skipDuplicates.toString());
    }

    return this.http.post<ApiResponse>(`${this.baseUrl}/import`, formData);
  }

  // Permission Audit
  getPermissionAuditLog(permissionId: string, params?: {
    from?: string;
    to?: string;
    action?: string;
    limit?: number;
  }): Observable<Array<{
    id: string;
    permissionId: string;
    action: string;
    performedBy: string;
    performedAt: string;
    details: string;
    changes: any;
  }>> {
    let httpParams = new HttpParams();

    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.action) httpParams = httpParams.set('action', params.action);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<Array<{
      id: string;
      permissionId: string;
      action: string;
      performedBy: string;
      performedAt: string;
      details: string;
      changes: any;
    }>>(`${this.baseUrl}/${permissionId}/audit`, { params: httpParams });
  }

  // Permission Recommendations
  getPermissionRecommendations(roleId?: string, userId?: string): Observable<{
    recommendations: Array<{
      permission: PermissionDto;
      score: number;
      reason: string;
      category: string;
    }>;
    analysis: {
      currentPermissionCount: number;
      recommendedPermissionCount: number;
      coverageScore: number;
      securityScore: number;
    };
  }> {
    let httpParams = new HttpParams();

    if (roleId) httpParams = httpParams.set('roleId', roleId);
    if (userId) httpParams = httpParams.set('userId', userId);

    return this.http.get<{
      recommendations: Array<{
        permission: PermissionDto;
        score: number;
        reason: string;
        category: string;
      }>;
      analysis: {
        currentPermissionCount: number;
        recommendedPermissionCount: number;
        coverageScore: number;
        securityScore: number;
      };
    }>(`${this.baseUrl}/recommendations`, { params: httpParams });
  }
}