import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// UI Components
import { DataGridComponent, DataGridColumn, DataGridConfig, DataGridAction, DataGridButton } from '@shared/components/ui/data-grid/data-grid.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/ui/select/select.component';
import { CheckboxComponent } from '@shared/components/ui/checkbox/checkbox.component';
import { ModalComponent } from '@shared/components/ui/modal/modal.component';

// Services and Types
import { UserManagementService } from '../../services/user-management.service';
import { RoleManagementService } from '../../services/role-management.service';
import { ThemeService } from '@core/services/theme.service';
import { UserDto, UserDetailDto, CreateUserRequest, RoleDto, SystemAction } from '../../types/system-management.types';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    ModalComponent,
    DataGridComponent,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  @ViewChild('userModal') userModal!: ModalComponent;
  @ViewChild('detailModal') detailModal!: ModalComponent;
  @ViewChild('importModal') importModal!: ModalComponent;

  // Signals
  users = signal<UserDto[]>([]);
  roles = signal<RoleDto[]>([]);
  statistics = signal<any>(null);
  selectedUser = signal<UserDto | null>(null);
  userDetail = signal<UserDetailDto | null>(null);
  selectedFile = signal<File | null>(null);
  selectedUsers = signal<UserDto[]>([]);
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
      label: 'Yeni Kullanıcı',
      icon: 'pi pi-plus',
      severity: 'success',
      command: () => this.openCreateModal(),
      showInContextMenu: false // Context menüde gösterme
    },
    {
      label: 'İçe Aktar',
      icon: 'pi pi-upload',
      severity: 'info',
      command: () => this.openImportModal(),
      showInContextMenu: false
    },
    {
      label: 'Dışa Aktar',
      icon: 'pi pi-download',
      severity: 'secondary',
      command: () => this.exportUsers(),
      showInContextMenu: true // Context menüde de göster
    }
  ];

  // Form
  userForm: FormGroup;


  constructor(
    private userService: UserManagementService,
    private roleService: RoleManagementService,
    private fb: FormBuilder,
    private router: Router,
    public themeService: ThemeService
  ) {
    this.userForm = this.createUserForm();
  }

  // Computed properties
  roleOptions = computed(() => {
    return this.roles().map(role => ({
      value: role.id,
      label: role.name,
      description: role.description
    }));
  });

  // Data Grid Columns
  userColumns: DataGridColumn[] = [
    {
      field: 'username',
      header: 'Kullanıcı Adı',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '200px'
    },
    {
      field: 'email',
      header: 'E-posta',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '250px'
    },
    {
      field: 'phoneNumber',
      header: 'Telefon',
      type: 'text',
      sortable: true,
      filterable: true,
      filterType: 'text',
      width: '140px'
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
      field: 'emailConfirmed',
      header: 'E-posta Doğrulandı',
      type: 'boolean',
      sortable: true,
      filterable: true,
      filterType: 'boolean',
      width: '160px'
    },
    {
      field: 'createdDate',
      header: 'Kayıt Tarihi',
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
          command: (data: UserDto) => this.openDetailModal(data),
          showInContextMenu: true
        },
        {
          label: 'Düzenle',
          icon: 'pi pi-pencil',
          command: (data: UserDto) => this.editUser(data),
          showInContextMenu: true
        },
        {
          label: 'Kopyala',
          icon: 'pi pi-copy',
          command: (data: UserDto) => this.copyUser(data),
          showInContextMenu: true
        },
        {
          label: 'Şifre Sıfırla',
          icon: 'pi pi-key',
          command: (data: UserDto) => this.resetPassword(data),
          showInContextMenu: true
        },
        {
          label: 'Sil',
          icon: 'pi pi-trash',
          command: (data: UserDto) => {
            if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
              this.deleteUser(data);
            }
          },
          showInContextMenu: true
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadStatistics();
  }

  private createUserForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      roleId: ['', Validators.required],
      password: [''],
      confirmPassword: [''],
      isActive: [true],
      emailConfirmed: [false],
      twoFactorEnabled: [false]
    });
  }

  // Data Loading Methods
  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading.set(false);
      }
    });
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: (error) => console.error('Error loading roles:', error)
    });
  }

  loadStatistics(): void {
    this.userService.getUserStatistics().subscribe({
      next: (stats) => this.statistics.set(stats),
      error: (error) => console.error('Error loading statistics:', error)
    });
  }

  // Modal Methods
  openCreateModal(): void {
    this.selectedUser.set(null);
    this.userForm.reset({
      isActive: true,
      emailConfirmed: false,
      twoFactorEnabled: false
    });
    this.userModal.open();
  }

  openImportModal(): void {
    this.selectedFile.set(null);
    this.importModal.open();
  }

  editUser(user: UserDto): void {
    this.selectedUser.set(user);
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleId: '', // We'll need to load user's roles separately
      isActive: user.isActive,
      emailConfirmed: user.emailConfirmed,
      twoFactorEnabled: user.twoFactorEnabled
    });
    this.userModal.open();
  }

  viewUser(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (detail) => {
        this.userDetail.set(detail);
        this.detailModal.open();
      },
      error: (error) => {
        console.error('Error loading user detail:', error);
      }
    });
  }

  cancelEdit(): void {
    this.selectedUser.set(null);
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.valid) {
      this.saving.set(true);
      const formValue = this.userForm.value;

      if (this.selectedUser()) {
        // Update existing user
        const request = {
          email: formValue.email,
          phoneNumber: formValue.phoneNumber,
          isActive: formValue.isActive,
          emailConfirmed: formValue.emailConfirmed,
          twoFactorEnabled: formValue.twoFactorEnabled
        };

        this.userService.updateUser(this.selectedUser()!.id, request).subscribe({
          next: () => {
            this.saving.set(false);
            this.userModal.close();
            this.loadUsers();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.saving.set(false);
          }
        });
      } else {
        // Create new user
        const request: CreateUserRequest = {
          username: formValue.username,
          email: formValue.email,
          password: formValue.password,
          phoneNumber: formValue.phoneNumber,
          isActive: formValue.isActive,
          emailConfirmed: formValue.emailConfirmed,
          phoneNumberConfirmed: false,
          twoFactorEnabled: formValue.twoFactorEnabled,
          roleIds: formValue.roleId ? [formValue.roleId] : []
        };

        this.userService.createUser(request).subscribe({
          next: () => {
            this.saving.set(false);
            this.userModal.close();
            this.loadUsers();
            this.loadStatistics();
          },
          error: (error) => {
            console.error('Error creating user:', error);
            this.saving.set(false);
          }
        });
      }
    }
  }

  deleteUser(user: UserDto): void {
    if (confirm(`"${user.username}" kullanıcısını silmek istediğinizden emin misiniz?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  // Bulk Operations
  bulkActivateUsers(userIds: string[]): void {
    // Implement bulk activation if needed
    userIds.forEach(id => {
      this.userService.updateUser(id, { isActive: true }).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error: any) => console.error('Error activating user:', error)
      });
    });
  }

  bulkDeactivateUsers(userIds: string[]): void {
    // Implement bulk deactivation if needed
    userIds.forEach(id => {
      this.userService.updateUser(id, { isActive: false }).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error: any) => console.error('Error deactivating user:', error)
      });
    });
  }

  bulkDelete(userIds: string[]): void {
    // Implement bulk delete if needed
    userIds.forEach(id => {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error: any) => console.error('Error deleting user:', error)
      });
    });
  }

  // Bulk action helpers for toolbar
  bulkActivateSelected(): void {
    const userIds = this.selectedUsers().map(user => user.id);
    this.bulkActivateUsers(userIds);
  }

  bulkDeactivateSelected(): void {
    const userIds = this.selectedUsers().map(user => user.id);
    this.bulkDeactivateUsers(userIds);
  }

  bulkDeleteSelected(): void {
    const userIds = this.selectedUsers().map(user => user.id);
    if (confirm(`${userIds.length} kullanıcıyı silmek istediğinizden emin misiniz?`)) {
      this.bulkDelete(userIds);
    }
  }

  // Toggle user status method for context menu
  toggleUserStatus(userId: string, isActive: boolean): void {
    this.userService.updateUser(userId, { isActive }).subscribe({
      next: () => {
        this.loadUsers();
        this.loadStatistics();
      },
      error: (error: any) => console.error('Error updating user status:', error)
    });
  }

  // Grid Event Handlers for DataGridComponent
  onSelectionChanged(selectedRows: UserDto[]): void {
    this.selectedUsers.set(selectedRows);
  }

  onRowDoubleClick(user: UserDto): void {
    this.viewUser(user.id);
  }

  onRefresh(): void {
    this.loadUsers();
  }

  onExport(): void {
    this.exportUsers();
  }

  // Export/Import Methods
  exportUsers(): void {
    this.userService.exportUsers('csv', true).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `kullanicilar-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting users:', error)
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile.set(target.files[0]);
    }
  }

  processImport(): void {
    const file = this.selectedFile();
    if (file) {
      this.userService.importUsers(file).subscribe({
        next: (result) => {
          console.log('Import result:', result);
          this.importModal.close();
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error importing users:', error);
        }
      });
    }
  }


  // Grid Action Methods
  openDetailModal(user: UserDto): void {
    this.editUser(user);
  }

  // Search and Filter Methods
  filterUsers(searchTerm: string): void {
    // Update grid filter - Now handled by the data-grid component directly
    console.log('Filter users with term:', searchTerm);
  }

  resetPassword(user: UserDto): void {
    if (confirm(`${user.username} kullanıcısının şifresini sıfırlamak istediğinizden emin misiniz?`)) {
      // Implement password reset logic
      console.log('Reset password for user:', user.username);
      // You would call a password reset API here
    }
  }

  copyUser(user: UserDto): void {
    const newUsername = prompt('Yeni kullanıcı adı:', `${user.username}_kopya`);
    if (newUsername && newUsername.trim()) {
      const copyRequest: CreateUserRequest = {
        username: newUsername.trim(),
        email: `kopya_${user.email}`,
        password: 'TempPassword123!',
        phoneNumber: user.phoneNumber,
        isActive: false,
        emailConfirmed: false,
        phoneNumberConfirmed: false,
        twoFactorEnabled: false,
        roleIds: []
      };

      this.userService.createUser(copyRequest).subscribe({
        next: () => {
          this.loadUsers();
          this.loadStatistics();
        },
        error: (error: any) => console.error('Error copying user:', error)
      });
    }
  }
}