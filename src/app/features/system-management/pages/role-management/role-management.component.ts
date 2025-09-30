import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// UI Components
import { DataGridComponent, DataGridColumn, DataGridConfig, DataGridAction, DataGridButton } from '@shared/components/ui/data-grid/data-grid.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { ModalComponent } from '@shared/components/ui/modal/modal.component';

// Services and Types
import { RoleManagementService } from '../../services/role-management.service';
import { PermissionManagementService } from '../../services/permission-management.service';
import { ThemeService } from '@core/services/theme.service';
import { RoleDto, RoleDetailDto, CreateRoleRequest, PermissionDto } from '../../types/system-management.types';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    DataGridComponent,
  ],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent implements OnInit {
  @ViewChild('roleModal') roleModal!: ModalComponent;
  @ViewChild('detailModal') detailModal!: ModalComponent;
  @ViewChild('permissionModal') permissionModal!: ModalComponent;

  // Signals
  roles = signal<RoleDto[]>([]);
  permissions = signal<PermissionDto[]>([]);
  allPermissions = signal<PermissionDto[]>([]);
  statistics = signal<any>(null);
  selectedRole = signal<RoleDto | null>(null);
  roleDetail = signal<RoleDetailDto | null>(null);
  roleUsers = signal<any[]>([]);
  selectedPermissions = signal<string[]>([]);
  selectedRoles = signal<RoleDto[]>([]);
  loading = signal(false);
  saving = signal(false);

  // Grid configuration
  gridConfig: DataGridConfig = {
    selectionMode: 'multiple',
    paginator: true,
    rows: 25,
    rowsPerPageOptions: [10, 25, 50, 100],
    showCurrentPageReport: true,
    sortMode: 'single',
    filterDelay: 300,
    rowHover: true,
    size: 'small',
    stripedRows: false,
    showGridlines: false,
    resizableColumns: true,
    columnResizeMode: 'expand',
    reorderableColumns: true
  };

  // Custom buttons for this page (left side of grid)
  customButtons: DataGridButton[] = [
    {
      label: 'Yeni Rol',
      icon: 'pi pi-plus',
      severity: 'success',
      command: () => this.openCreateModal(),
      showInContextMenu: false
    },
    {
      label: 'Dışa Aktar',
      icon: 'pi pi-download',
      severity: 'secondary',
      command: () => this.exportRoles(),
      showInContextMenu: true
    }
  ];

  // Form
  roleForm: FormGroup;


  constructor(
    private roleService: RoleManagementService,
    private permissionService: PermissionManagementService,
    private fb: FormBuilder,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.roleForm = this.createRoleForm();
  }

  // Computed properties
  permissionCategories = computed(() => {
    const permissions = this.permissions();
    const categories = new Map<string, PermissionDto[]>();

    permissions.forEach(permission => {
      const category = permission.category || 'Genel';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(permission);
    });

    return Array.from(categories.entries()).map(([category, permissions]) => ({
      category,
      count: permissions.length,
      permissions: permissions.sort((a, b) => a.name.localeCompare(b.name))
    }));
  });

  // Data Grid Columns
  roleColumns: DataGridColumn[] = [
    {
      field: 'name',
      header: 'Rol Adı',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '200px'
    },
    {
      field: 'description',
      header: 'Açıklama',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '300px'
    },
    {
      field: 'isActive',
      header: 'Durum',
      type: 'status',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      width: '120px'
    },
    {
      field: 'permissionCount',
      header: 'Yetki Sayısı',
      type: 'number',
      sortable: true,
      filterable: true,
      filterType: 'numeric',
      width: '140px'
    },
    {
      field: 'createdDate',
      header: 'Oluşturma Tarihi',
      type: 'date',
      sortable: true,
      filterable: false,
      width: '150px'
    },
    {
      field: 'actions',
      header: 'İşlemler',
      type: 'actions',
      sortable: false,
      filterable: false,
      actions: [
        {
          label: 'Detaylar',
          icon: 'pi pi-eye',
          command: (data: RoleDto) => this.openDetailModal(data),
          showInContextMenu: true
        },
        {
          label: 'Düzenle',
          icon: 'pi pi-pencil',
          command: (data: RoleDto) => this.editRole(data),
          showInContextMenu: true
        },
        {
          label: 'Yetkileri Yönet',
          icon: 'pi pi-shield',
          command: (data: RoleDto) => this.managePermissions(data),
          showInContextMenu: true
        },
        {
          label: 'Kopyala',
          icon: 'pi pi-copy',
          command: (data: RoleDto) => this.copyRole(data),
          showInContextMenu: true
        },
        {
          label: 'Sil',
          icon: 'pi pi-trash',
          command: (data: RoleDto) => {
            if (window.confirm('Bu rolü silmek istediğinizden emin misiniz?')) {
              this.deleteRole(data);
            }
          },
          showInContextMenu: true
        }
      ]
    }
  ];

  // Permission Grid Columns
  permissionColumns: DataGridColumn[] = [
    {
      field: 'name',
      header: 'İzin Adı',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '250px'
    },
    {
      field: 'description',
      header: 'Açıklama',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '300px'
    },
    {
      field: 'category',
      header: 'Kategori',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '150px'
    }
  ];


  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
    this.loadAllPermissions();
    this.loadStatistics();
  }

  private createRoleForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  // Data Loading Methods
  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.loading.set(false);
      }
    });
  }

  loadPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => this.permissions.set(permissions),
      error: (error) => console.error('Error loading permissions:', error)
    });
  }

  loadAllPermissions(): void {
    this.permissionService.getAllPermissions().subscribe({
      next: (permissions) => this.allPermissions.set(permissions),
      error: (error) => console.error('Error loading all permissions:', error)
    });
  }

  loadStatistics(): void {
    this.roleService.getRoleStatistics().subscribe({
      next: (stats) => this.statistics.set(stats),
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  // Modal Methods
  openCreateModal(): void {
    this.selectedRole.set(null);
    this.roleForm.reset();
    this.selectedPermissions.set([]);
    this.roleModal.open();
  }

  openPermissionModal(): void {
    this.loadAllPermissions();
    this.permissionModal.open();
  }

  openDetailModal(role: RoleDto): void {
    this.editRole(role);
  }

  managePermissions(role: RoleDto): void {
    this.selectedRole.set(role);
    this.openPermissionModal();
  }

  // Search and Filter Methods
  filterRoles(searchTerm: string): void {
    // Update grid filter - Now handled by the data-grid component directly
    console.log('Filter roles with term:', searchTerm);
  }

  editRole(role: RoleDto): void {
    this.selectedRole.set(role);
    this.roleForm.patchValue({
      name: role.name,
      description: role.description
    });

    // Load role permissions
    this.roleService.getRolePermissions(role.id).subscribe({
      next: (permissions) => {
        this.selectedPermissions.set(permissions.map(p => p.id));
      }
    });

    this.roleModal.open();
  }

  viewRole(roleId: string): void {
    this.roleService.getRoleById(roleId).subscribe({
      next: (detail) => {
        this.roleDetail.set(detail);

        // Load users with this role
        this.roleService.getRoleUsers(roleId).subscribe({
          next: (users) => this.roleUsers.set(users)
        });

        this.detailModal.open();
      },
      error: (error) => {
        console.error('Error loading role detail:', error);
      }
    });
  }

  copyRole(role: RoleDto): void {
    const newName = prompt(`"${role.name}" rolünün kopyası için yeni isim:`, `${role.name} - Kopya`);
    if (newName && newName.trim()) {
      this.roleService.copyRole(role.id, {
        name: newName.trim(),
        description: `${role.description || ''} (Kopya)`,
        copyPermissions: true,
        copyUsers: false
      }).subscribe({
        next: () => {
          this.loadRoles();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error copying role:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.selectedRole.set(null);
    this.roleForm.reset();
    this.selectedPermissions.set([]);
  }

  saveRole(): void {
    if (this.roleForm.valid) {
      this.saving.set(true);
      const formValue = this.roleForm.value;

      if (this.selectedRole()) {
        // Update existing role
        const request = {
          name: formValue.name,
          description: formValue.description
        };

        this.roleService.updateRole(this.selectedRole()!.id, request).subscribe({
          next: () => {
            this.updateRolePermissions(() => {
              this.saving.set(false);
              this.roleModal.close();
              this.loadRoles();
              this.loadStatistics();
            });
          },
          error: (error) => {
            console.error('Error updating role:', error);
            this.saving.set(false);
          }
        });
      } else {
        // Create new role
        const request: CreateRoleRequest = {
          name: formValue.name,
          description: formValue.description
        };

        this.roleService.createRole(request).subscribe({
          next: (response) => {
            if (response.success && response.roleId) {
              // Assign selected permissions
              if (this.selectedPermissions().length > 0) {
                this.roleService.assignPermissionsToRole(response.roleId, {
                  permissionIds: this.selectedPermissions()
                }).subscribe({
                  complete: () => {
                    this.saving.set(false);
                    this.roleModal.close();
                    this.loadRoles();
                    this.loadStatistics();
                  }
                });
              } else {
                this.saving.set(false);
                this.roleModal.close();
                this.loadRoles();
                this.loadStatistics();
              }
            }
          },
          error: (error) => {
            console.error('Error creating role:', error);
            this.saving.set(false);
          }
        });
      }
    }
  }

  private updateRolePermissions(callback: () => void): void {
    const roleId = this.selectedRole()!.id;
    const currentPermissions = this.selectedPermissions();

    // Get current role permissions
    this.roleService.getRolePermissions(roleId).subscribe({
      next: (existingPermissions) => {
        const existingIds = existingPermissions.map(p => p.id);
        const toAdd = currentPermissions.filter(id => !existingIds.includes(id));
        const toRemove = existingIds.filter(id => !currentPermissions.includes(id));

        // Add new permissions
        if (toAdd.length > 0) {
          this.roleService.assignPermissionsToRole(roleId, {
            permissionIds: toAdd
          }).subscribe();
        }

        // Remove old permissions
        if (toRemove.length > 0) {
          this.roleService.removePermissionsFromRole(roleId, {
            permissionIds: toRemove
          }).subscribe();
        }

        callback();
      }
    });
  }

  deleteRole(role: RoleDto): void {
    if (confirm(`"${role.name}" rolünü silmek istediğinizden emin misiniz?`)) {
      this.roleService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error deleting role:', error);
        }
      });
    }
  }

  // Permission Methods
  togglePermission(permissionId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;
    const current = this.selectedPermissions();
    if (checked) {
      if (!current.includes(permissionId)) {
        this.selectedPermissions.set([...current, permissionId]);
      }
    } else {
      this.selectedPermissions.set(current.filter(id => id !== permissionId));
    }
  }

  selectCategoryPermissions(category: string, select: boolean): void {
    const categoryPermissions = this.permissions()
      .filter(p => p.category === category)
      .map(p => p.id);

    const current = this.selectedPermissions();
    if (select) {
      const newSelected = [...current];
      categoryPermissions.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      this.selectedPermissions.set(newSelected);
    } else {
      this.selectedPermissions.set(current.filter(id => !categoryPermissions.includes(id)));
    }
  }

  initializeDefaultPermissions(): void {
    if (confirm('Varsayılan sistem izinlerini yüklemek istediğinizden emin misiniz?')) {
      this.permissionService.initializeDefaultPermissions().subscribe({
        next: () => {
          this.loadPermissions();
          this.loadAllPermissions();
          alert('Varsayılan izinler başarıyla yüklendi.');
        },
        error: (error) => {
          console.error('Error initializing default permissions:', error);
          alert('İzinler yüklenirken bir hata oluştu.');
        }
      });
    }
  }

  // Utility Methods
  groupPermissionsByCategory(permissions: PermissionDto[]): Array<{category: string, permissions: PermissionDto[]}> {
    const categories = new Map<string, PermissionDto[]>();

    permissions.forEach(permission => {
      const category = permission.category || 'Genel';
      if (!categories.has(category)) {
        categories.set(category, []);
      }
      categories.get(category)!.push(permission);
    });

    return Array.from(categories.entries()).map(([category, permissions]) => ({
      category,
      permissions: permissions.sort((a, b) => a.name.localeCompare(b.name))
    }));
  }

  // Bulk Operations - Method removed since we use direct toolbar buttons now

  bulkDelete(roleIds: string[]): void {
    this.roleService.bulkDeleteRoles(roleIds).subscribe({
      next: () => {
        this.loadRoles();
        this.loadStatistics();
      },
      error: (error) => console.error('Error deleting roles:', error)
    });
  }

  exportRoles(): void {
    this.roleService.exportRoles('csv', true).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `roller-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting roles:', error)
    });
  }

  // Grid Event Handlers for DataGridComponent
  onSelectionChanged(selectedRows: RoleDto[]): void {
    this.selectedRoles.set(selectedRows);
  }

  onRowDoubleClick(role: RoleDto): void {
    this.viewRole(role.id);
  }

  onRefresh(): void {
    this.loadRoles();
  }

  onExport(): void {
    this.exportRoles();
  }

  // Bulk action helpers for toolbar
  bulkActivateSelected(): void {
    const roleIds = this.selectedRoles().map(role => role.id);
    this.bulkActivateRoles(roleIds);
  }

  bulkDeactivateSelected(): void {
    const roleIds = this.selectedRoles().map(role => role.id);
    this.bulkDeactivateRoles(roleIds);
  }

  bulkDeleteSelected(): void {
    const roleIds = this.selectedRoles().map(role => role.id);
    if (confirm(`${roleIds.length} rolü silmek istediğinizden emin misiniz?`)) {
      this.bulkDelete(roleIds);
    }
  }

  bulkActivateRoles(roleIds: string[]): void {
    // Implement bulk activation if needed
    roleIds.forEach(id => {
      // Note: This would need proper API implementation
      console.log('Activating role:', id);
      this.loadRoles();
      this.loadStatistics();
    });
  }

  bulkDeactivateRoles(roleIds: string[]): void {
    // Implement bulk deactivation if needed
    roleIds.forEach(id => {
      // Note: This would need proper API implementation
      console.log('Deactivating role:', id);
      this.loadRoles();
      this.loadStatistics();
    });
  }
}