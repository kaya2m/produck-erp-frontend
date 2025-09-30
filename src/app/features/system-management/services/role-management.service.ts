import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  RoleDto,
  RoleDetailDto,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  RemovePermissionsRequest,
  PermissionDto,
  ApiResponse
} from '../types/system-management.types';

@Injectable({
  providedIn: 'root'
})
export class RoleManagementService {
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  // Role CRUD Operations
  getAllRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(this.baseUrl);
  }

  getRoleById(id: string): Observable<RoleDetailDto> {
    return this.http.get<RoleDetailDto>(`${this.baseUrl}/${id}`);
  }

  createRole(request: CreateRoleRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.baseUrl, request);
  }

  updateRole(id: string, request: UpdateRoleRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/${id}`, request);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Role Permissions
  getRolePermissions(roleId: string): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(`${this.baseUrl}/${roleId}/permissions`);
  }

  assignPermissionsToRole(roleId: string, request: AssignPermissionsRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${roleId}/assign-permissions`, request);
  }

  removePermissionsFromRole(roleId: string, request: RemovePermissionsRequest): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/${roleId}/remove-permissions`, {
      body: request
    });
  }

  // Role Search and Filter
  searchRoles(params: {
    search?: string;
    hasPermission?: string;
    page?: number;
    size?: number;
  } = {}): Observable<{
    roles: RoleDto[];
    total: number;
    page: number;
    size: number;
  }> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.hasPermission) httpParams = httpParams.set('hasPermission', params.hasPermission);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<{
      roles: RoleDto[];
      total: number;
      page: number;
      size: number;
    }>(`${this.baseUrl}/search`, { params: httpParams });
  }

  // Role Statistics
  getRoleStatistics(): Observable<{
    totalRoles: number;
    rolesWithUsers: number;
    rolesWithoutUsers: number;
    averagePermissionsPerRole: number;
    mostUsedRoles: Array<{
      roleId: string;
      roleName: string;
      userCount: number;
    }>;
  }> {
    return this.http.get<{
      totalRoles: number;
      rolesWithUsers: number;
      rolesWithoutUsers: number;
      averagePermissionsPerRole: number;
      mostUsedRoles: Array<{
        roleId: string;
        roleName: string;
        userCount: number;
      }>;
    }>(`${this.baseUrl}/statistics`);
  }

  // Role Users
  getRoleUsers(roleId: string): Observable<Array<{
    userId: string;
    username: string;
    email: string;
    isActive: boolean;
    assignedDate: string;
  }>> {
    return this.http.get<Array<{
      userId: string;
      username: string;
      email: string;
      isActive: boolean;
      assignedDate: string;
    }>>(`${this.baseUrl}/${roleId}/users`);
  }

  // Bulk Operations
  bulkDeleteRoles(roleIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/delete`, { roleIds });
  }

  bulkAssignPermissions(roleIds: string[], permissionIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/assign-permissions`, {
      roleIds,
      permissionIds
    });
  }

  bulkRemovePermissions(roleIds: string[], permissionIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/remove-permissions`, {
      roleIds,
      permissionIds
    });
  }

  // Copy Role
  copyRole(sourceRoleId: string, request: {
    name: string;
    description?: string;
    copyPermissions: boolean;
    copyUsers: boolean;
  }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${sourceRoleId}/copy`, request);
  }

  // Role Templates
  getRoleTemplates(): Observable<Array<{
    id: string;
    name: string;
    description: string;
    permissions: string[];
    category: string;
  }>> {
    return this.http.get<Array<{
      id: string;
      name: string;
      description: string;
      permissions: string[];
      category: string;
    }>>(`${this.baseUrl}/templates`);
  }

  createRoleFromTemplate(templateId: string, request: {
    name: string;
    description?: string;
  }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/templates/${templateId}/create`, request);
  }

  // Export/Import
  exportRoles(format: 'csv' | 'excel' = 'csv', includePermissions: boolean = true): Observable<Blob> {
    const params = new HttpParams()
      .set('format', format)
      .set('includePermissions', includePermissions.toString());

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }

  importRoles(file: File): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse>(`${this.baseUrl}/import`, formData);
  }

  // Role Hierarchy
  getRoleHierarchy(): Observable<Array<{
    roleId: string;
    roleName: string;
    parentRoleId?: string;
    level: number;
    children: Array<{
      roleId: string;
      roleName: string;
      level: number;
    }>;
  }>> {
    return this.http.get<Array<{
      roleId: string;
      roleName: string;
      parentRoleId?: string;
      level: number;
      children: Array<{
        roleId: string;
        roleName: string;
        level: number;
      }>;
    }>>(`${this.baseUrl}/hierarchy`);
  }

  setRoleParent(roleId: string, parentRoleId: string | null): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/${roleId}/parent`, { parentRoleId });
  }

  // Role Comparison
  compareRoles(roleIds: string[]): Observable<{
    roles: Array<{
      roleId: string;
      roleName: string;
      permissions: PermissionDto[];
    }>;
    commonPermissions: PermissionDto[];
    uniquePermissions: Array<{
      roleId: string;
      permissions: PermissionDto[];
    }>;
  }> {
    return this.http.post<{
      roles: Array<{
        roleId: string;
        roleName: string;
        permissions: PermissionDto[];
      }>;
      commonPermissions: PermissionDto[];
      uniquePermissions: Array<{
        roleId: string;
        permissions: PermissionDto[];
      }>;
    }>(`${this.baseUrl}/compare`, { roleIds });
  }

  // Role Audit
  getRoleAuditLog(roleId: string, params?: {
    from?: string;
    to?: string;
    action?: string;
    limit?: number;
  }): Observable<Array<{
    id: string;
    roleId: string;
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
      roleId: string;
      action: string;
      performedBy: string;
      performedAt: string;
      details: string;
      changes: any;
    }>>(`${this.baseUrl}/${roleId}/audit`, { params: httpParams });
  }
}