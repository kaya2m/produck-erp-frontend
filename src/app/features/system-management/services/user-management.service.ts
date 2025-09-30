import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  UserDto,
  UserDetailDto,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserProfileRequest,
  AssignRolesRequest,
  ApiResponse
} from '../types/system-management.types';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  // User CRUD Operations
  getAllUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.baseUrl);
  }

  getUserById(id: string): Observable<UserDetailDto> {
    return this.http.get<UserDetailDto>(`${this.baseUrl}/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.baseUrl, request);
  }

  updateUser(id: string, request: UpdateUserRequest): Observable<UserDetailDto> {
    return this.http.patch<UserDetailDto>(`${this.baseUrl}/${id}`, request);
  }

  updateUserProfile(id: string, request: UpdateUserProfileRequest): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.baseUrl}/${id}/profile`, request);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Role Assignment
  assignRolesToUser(userId: string, request: AssignRolesRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${userId}/assign-roles`, request);
  }

  // User Search and Filter
  searchUsers(params: {
    search?: string;
    isActive?: boolean;
    roleId?: string;
    page?: number;
    size?: number;
  } = {}): Observable<{
    users: UserDto[];
    total: number;
    page: number;
    size: number;
  }> {
    let httpParams = new HttpParams();

    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive !== undefined) httpParams = httpParams.set('isActive', params.isActive.toString());
    if (params.roleId) httpParams = httpParams.set('roleId', params.roleId);
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());

    return this.http.get<{
      users: UserDto[];
      total: number;
      page: number;
      size: number;
    }>(`${this.baseUrl}/search`, { params: httpParams });
  }

  // Bulk Operations
  bulkActivateUsers(userIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/activate`, { userIds });
  }

  bulkDeactivateUsers(userIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/deactivate`, { userIds });
  }

  bulkDeleteUsers(userIds: string[]): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/delete`, { userIds });
  }

  bulkAssignRole(userIds: string[], roleId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/bulk/assign-role`, { userIds, roleId });
  }

  // User Statistics
  getUserStatistics(): Observable<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    lockedUsers: number;
    usersWithTwoFactor: number;
    recentRegistrations: number;
  }> {
    return this.http.get<{
      totalUsers: number;
      activeUsers: number;
      inactiveUsers: number;
      lockedUsers: number;
      usersWithTwoFactor: number;
      recentRegistrations: number;
    }>(`${this.baseUrl}/statistics`);
  }

  // Export/Import
  exportUsers(format: 'csv' | 'excel' = 'csv', filters?: any): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);

    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          httpParams = httpParams.set(key, filters[key]);
        }
      });
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  importUsers(file: File): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse>(`${this.baseUrl}/import`, formData);
  }

  // Password Management
  resetUserPassword(userId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${userId}/reset-password`, {});
  }

  unlockUser(userId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${userId}/unlock`, {});
  }

  // Two-Factor Authentication
  enableTwoFactor(userId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${userId}/enable-2fa`, {});
  }

  disableTwoFactor(userId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/${userId}/disable-2fa`, {});
  }

  // User Activity
  getUserActivity(userId: string, params?: {
    from?: string;
    to?: string;
    limit?: number;
  }): Observable<any[]> {
    let httpParams = new HttpParams();

    if (params?.from) httpParams = httpParams.set('from', params.from);
    if (params?.to) httpParams = httpParams.set('to', params.to);
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<any[]>(`${this.baseUrl}/${userId}/activity`, { params: httpParams });
  }

  // User Sessions
  getUserSessions(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${userId}/sessions`);
  }

  terminateUserSession(userId: string, sessionId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/${userId}/sessions/${sessionId}`);
  }

  terminateAllUserSessions(userId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.baseUrl}/${userId}/sessions`);
  }
}