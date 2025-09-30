// User Management Types
export interface UserDto {
  id: string;
  username: string;
  email: string;
  emailConfirmed: boolean;
  phoneNumber?: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  createdDate: string;
}

export interface UserDetailDto extends UserDto {
  roles: RoleDto[];
  lastModifiedDate?: string;
  lockoutEnd?: string;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  isActive: boolean;
  roleIds: string[];
}

export interface UpdateUserRequest {
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface UpdateUserProfileRequest {
  email?: string;
  phoneNumber?: string;
  emailConfirmed?: boolean;
  phoneNumberConfirmed?: boolean;
  twoFactorEnabled?: boolean;
  isActive?: boolean;
}

export interface AssignRolesRequest {
  roleIds: string[];
}

// Role Management Types
export interface RoleDto {
  id: string;
  name: string;
  description?: string;
}

export interface RoleDetailDto extends RoleDto {
  permissions?: PermissionDto[];
  userCount?: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name: string;
  description?: string;
}

export interface AssignPermissionsRequest {
  permissionIds: string[];
}

export interface RemovePermissionsRequest {
  permissionIds: string[];
}

// Permission Management Types
export interface PermissionDto {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  category: string;
}

export interface UpdatePermissionRequest {
  name: string;
  description?: string;
  category: string;
}

// Security Management Types
export interface SecurityConfiguration {
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  passwordExpirationDays: number;
  requireTwoFactorAuth: boolean;
  allowedIpRanges: string[];
  sessionTimeoutMinutes: number;
  auditLogRetentionDays: number;
}

export interface SecurityAlert {
  id: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  type: string;
  message: string;
  timestamp: string;
  isResolved: boolean;
}

export interface SecurityDashboard {
  totalAccessAttempts: number;
  failedAttempts: number;
  blockedUsers: number;
  securityViolations: number;
  riskScore: number;
  recentAlerts: SecurityAlert[];
  topViolators: UserSecuritySummary[];
}

export interface UserSecuritySummary {
  userId: string;
  username: string;
  email: string;
  failedAttempts: number;
  lastActivity: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface SecurityAuditLog {
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  duration: string;
  accessLevel: string;
}

export interface SecurityAuditFilter {
  userId?: string;
  action?: string;
  entityType?: string;
  fromDate?: string;
  toDate?: string;
  ipAddress?: string;
}

export interface RecordAccessPolicy {
  id: string;
  name: string;
  description: string;
  entityType: string;
  priority: number;
  ownerCanRead: boolean;
  ownerCanEdit: boolean;
  ownerCanDelete: boolean;
  teamCanRead: boolean;
  useTerritoryAccess: boolean;
  useTimeBasedAccess: boolean;
  accessStartTime?: string;
  accessEndTime?: string;
  useIpRestrictions: boolean;
  allowedIpRanges: string;
  isActive: boolean;
}

export interface CreatePolicyRequest {
  name: string;
  description: string;
  entityType: string;
  priority: number;
  ownerCanRead: boolean;
  ownerCanEdit: boolean;
  ownerCanDelete: boolean;
  teamCanRead: boolean;
  useTerritoryAccess: boolean;
  useTimeBasedAccess: boolean;
  accessStartTime?: string;
  accessEndTime?: string;
  useIpRestrictions: boolean;
  allowedIpRanges: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  userId?: string;
  roleId?: string;
  permissionId?: string;
}

// Dashboard Widget Types
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'table' | 'alert';
  size: 'small' | 'medium' | 'large' | 'full';
  data: any;
  refreshInterval?: number;
}

export interface StatWidget extends DashboardWidget {
  type: 'stat';
  data: {
    value: number;
    label: string;
    trend?: {
      value: number;
      direction: 'up' | 'down';
      label: string;
    };
    icon?: string;
    color?: string;
  };
}

// Table Column Definitions for System Management
export interface SystemManagementColumn {
  field: string;
  headerName: string;
  type: 'text' | 'boolean' | 'date' | 'badge' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  editable?: boolean;
  width?: number;
  actions?: SystemAction[];
}

export interface SystemAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  onClick: (data: any) => void;
  disabled?: (data: any) => boolean;
  visible?: (data: any) => boolean;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{label: string, value: any}>;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null;
  };
}

export interface Modal {
  title: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  closable?: boolean;
}

// Security Types for advanced features
export interface FieldPermissionResult {
  [fieldName: string]: {
    canRead: boolean;
    canEdit: boolean;
    isRequired: boolean;
    isSensitive: boolean;
  };
}

export interface RecordAccessResult {
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  accessLevel: string;
  restrictions: string[];
}

export interface SecurityValidationResult {
  isValid: boolean;
  riskScore: number;
  violations: string[];
  warnings: string[];
  recommendations: string[];
}

export interface SecurityRiskAssessment {
  overallRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  riskScore: number;
  factors: {
    name: string;
    score: number;
    weight: number;
    description: string;
  }[];
  recommendations: string[];
}

export interface SecurityAccessRequest {
  userId: string;
  entityType: string;
  entityId?: string;
  accessType: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  timestamp?: string;
}

export interface SecurityComplianceReport {
  reportDate: string;
  complianceScore: number;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warnings: number;
  sections: {
    name: string;
    score: number;
    checks: {
      name: string;
      status: 'passed' | 'failed' | 'warning';
      description: string;
      recommendation?: string;
    }[];
  }[];
}

export interface PermissionMatrix {
  userId: string;
  userEmail: string;
  roles: string[];
  permissions: {
    [category: string]: {
      [permission: string]: {
        granted: boolean;
        source: string; // 'role:RoleName' or 'direct'
        inherited?: boolean;
      };
    };
  };
}

// Notification and Alert Types
export interface SystemNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: {
    label: string;
    action: () => void;
  }[];
}