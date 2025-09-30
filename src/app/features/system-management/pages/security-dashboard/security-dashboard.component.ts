import { Component, OnInit, signal, computed, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// UI Components
import { DataGridComponent, DataGridColumn } from '@shared/components/ui/data-grid/data-grid.component';
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { CheckboxComponent } from '@shared/components/ui/checkbox/checkbox.component';
import { ModalComponent } from '@shared/components/ui/modal/modal.component';
import { CardComponent } from '@shared/components/ui/card/card.component';

// Services and Types
import { SecurityManagementService } from '../../services/security-management.service';
import {
  SecurityDashboard,
  SecurityAlert,
  SecurityAuditLog,
  SecurityConfiguration,
  SecurityAuditFilter,
  RecordAccessPolicy
} from '../../types/system-management.types';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataGridComponent,
    ButtonComponent,
    InputComponent,
    CheckboxComponent,
    ModalComponent,
    CardComponent,
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Güvenlik Yönetimi
          </h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sistem güvenlik durumu ve audit loglarini yönetin
          </p>
        </div>

        <div class="flex gap-3">
          <erp-button variant="outline" (click)="openConfigModal()">
            <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Güvenlik Ayarlari
          </erp-button>

          <erp-button variant="outline" (click)="generateComplianceReport()">
            <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Uygunluk Raporu
          </erp-button>

          <erp-button variant="primary" (click)="refreshDashboard()" [loading]="loading">
            <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Yenile
          </erp-button>
        </div>
      </div>

      <!-- Security Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <erp-card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Toplam Erisim
                  </dt>
                  <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {{ dashboard()?.totalAccessAttempts || 0 | number }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </erp-card>

        <erp-card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Basarisiz Denemeler
                  </dt>
                  <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {{ dashboard()?.failedAttempts || 0 | number }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </erp-card>

        <erp-card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Engellenen Kullanici
                  </dt>
                  <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {{ dashboard()?.blockedUsers || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </erp-card>

        <erp-card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-md flex items-center justify-center"
                     [class]="getRiskScoreColorClass(dashboard()?.riskScore || 0)">
                  <svg class="w-5 h-5" [class]="getRiskScoreIconClass(dashboard()?.riskScore || 0)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Risk Skoru
                  </dt>
                  <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {{ dashboard()?.riskScore || 0 }}/100
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </erp-card>
      </div>

      <!-- Security Alerts -->
      @if (alerts().length > 0) {
        <erp-card>
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Güvenlik Uyarilari
              </h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {{ getActiveAlerts() }} Aktif
              </span>
            </div>

            <div class="space-y-3">
              @for (alert of alerts().slice(0, 5); track alert.id) {
                <div class="flex items-start justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                     [class]="getAlertBgClass(alert.severity)">
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div class="w-2 h-2 mt-2 rounded-full" [class]="getAlertIndicatorClass(alert.severity)"></div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center space-x-2">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {{ alert.type }}
                        </h4>
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                              [class]="getAlertSeverityClass(alert.severity)">
                          {{ alert.severity }}
                        </span>
                      </div>
                      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {{ alert.message }}
                      </p>
                      <p class="mt-1 text-xs text-gray-500 dark:text-gray-500">
                        {{ alert.timestamp | date:'dd.MM.yyyy HH:mm' }}
                      </p>
                    </div>
                  </div>
                  @if (!alert.isResolved) {
                    <div class="flex gap-2">
                      <erp-button
                        variant="ghost"
                        size="sm"
                        (click)="resolveAlert(alert.id)">
                        Çöz
                      </erp-button>
                      <erp-button
                        variant="ghost"
                        size="sm"
                        (click)="dismissAlert(alert.id)">
                        Yoksay
                      </erp-button>
                    </div>
                  }
                </div>
              }
            </div>

            @if (alerts().length > 5) {
              <div class="mt-4 text-center">
                <erp-button variant="outline" (click)="showAllAlerts()">
                  Tüm Uyarilari Görüntüle ({{ alerts().length }})
                </erp-button>
              </div>
            }
          </div>
        </erp-card>
      }

      <!-- Audit Logs -->
      <erp-card>
        <div class="p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Audit Loglar
            </h3>
            <div class="flex gap-2">
              <erp-button variant="outline" size="sm" (click)="openAuditFilterModal()">
                <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filtrele
              </erp-button>
              <erp-button variant="outline" size="sm" (click)="exportAuditLogs()">
                <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Disa Aktar
              </erp-button>
            </div>
          </div>

          <erp-data-grid
            [value]="auditLogs()"
            [columns]="auditLogColumns"
            [loading]="loadingAuditLogs"
            [config]="{
              selectionMode: null,
              paginator: true,
              rows: 25,
              globalFilterFields: ['userEmail', 'action', 'ipAddress']
            }"
          />
        </div>
      </erp-card>

      <!-- Security Configuration Modal -->
      <erp-modal
        #configModal
        title="Güvenlik Ayarlari"
        size="lg"
        confirmText="Kaydet"
        (confirmed)="saveSecurityConfig()"
      >
        @if (securityConfig()) {
          <form [formGroup]="configForm" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <erp-input
                label="Maksimum Giris Denemesi"
                type="number"
                formControlName="maxLoginAttempts"
              />

              <erp-input
                label="Kilitleme Süresi (Dakika)"
                type="number"
                formControlName="lockoutDurationMinutes"
              />

              <erp-input
                label="Sifre Gecerlilik Süresi (Gün)"
                type="number"
                formControlName="passwordExpirationDays"
              />

              <erp-input
                label="Oturum Zaman Asimi (Dakika)"
                type="number"
                formControlName="sessionTimeoutMinutes"
              />

              <erp-input
                label="Audit Log Saklama (Gün)"
                type="number"
                formControlName="auditLogRetentionDays"
              />
            </div>

            <erp-checkbox
              label="İki Faktörlü Kimlik Dogrulama Zorunlu"
              formControlName="requireTwoFactorAuth"
            />

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İzin Verilen IP Araliklari (her satirda bir tane)
              </label>
              <textarea
                formControlName="allowedIpRangesText"
                rows="4"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                placeholder="192.168.1.0/24&#10;10.0.0.0/8"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                CIDR formatinda IP araliklari girin (örn: 192.168.1.0/24)
              </p>
            </div>
          </form>
        }
      </erp-modal>

      <!-- Audit Log Filter Modal -->
      <erp-modal
        #auditFilterModal
        title="Audit Log Filtreleri"
        size="lg"
        confirmText="Filtrele"
        (confirmed)="applyAuditFilter()"
      >
        <form [formGroup]="auditFilterForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <erp-input
              label="Kullanici ID"
              formControlName="userId"
              placeholder="Kullanici ID girin"
            />

            <erp-input
              label="Aksiyon"
              formControlName="action"
              placeholder="Aksiyon türü girin"
            />

            <erp-input
              label="Varlık Türü"
              formControlName="entityType"
              placeholder="Varlık türü girin"
            />

            <erp-input
              label="IP Adresi"
              formControlName="ipAddress"
              placeholder="IP adresi girin"
            />

            <erp-input
              label="Baslangic Tarihi"
              formControlName="fromDate"
            />

            <erp-input
              label="Bitis Tarihi"
              formControlName="toDate"
            />
          </div>
        </form>
      </erp-modal>
    </div>
  `,
  styles: [`
    .alert-critical {
      border-left: 4px solid #dc2626;
    }

    .alert-high {
      border-left: 4px solid #ea580c;
    }

    .alert-medium {
      border-left: 4px solid #d97706;
    }

    .alert-low {
      border-left: 4px solid #059669;
    }

    .risk-indicator {
      transition: all 0.3s ease;
    }

    .risk-high {
      animation: pulse 2s infinite;
    }
  `]
})
export class SecurityDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('configModal') configModal!: ModalComponent;
  @ViewChild('auditFilterModal') auditFilterModal!: ModalComponent;

  // Signals
  dashboard = signal<SecurityDashboard | null>(null);
  alerts = signal<SecurityAlert[]>([]);
  auditLogs = signal<SecurityAuditLog[]>([]);
  securityConfig = signal<SecurityConfiguration | null>(null);
  loading = signal(false);
  loadingAuditLogs = signal(false);
  savingConfig = signal(false);

  // Forms
  configForm: FormGroup;
  auditFilterForm: FormGroup;

  // Auto refresh interval
  private refreshInterval?: number;

  constructor(
    private securityService: SecurityManagementService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.configForm = this.createConfigForm();
    this.auditFilterForm = this.createAuditFilterForm();
  }

  // Data Grid Configuration
  auditLogColumns: DataGridColumn[] = [
    {
      field: 'timestamp',
      header: 'Zaman',
      type: 'date',
      sortable: true,
      width: '150px'
    },
    {
      field: 'userEmail',
      header: 'Kullanici',
      type: 'text',
      sortable: true
    },
    {
      field: 'action',
      header: 'Aksiyon',
      type: 'text',
      sortable: true,
      width: '120px'
    },
    {
      field: 'entityType',
      header: 'Varlık Türü',
      type: 'text',
      sortable: true,
      width: '120px'
    },
    {
      field: 'ipAddress',
      header: 'IP Adresi',
      type: 'text',
      sortable: true,
      width: '130px'
    },
    {
      field: 'accessLevel',
      header: 'Erisim Seviyesi',
      type: 'text',
      sortable: true,
      width: '130px'
    },
    {
      field: 'duration',
      header: 'Süre',
      type: 'text',
      sortable: true,
      width: '100px'
    }
  ];

  ngOnInit(): void {
    this.loadDashboard();
    this.loadSecurityAlerts();
    this.loadAuditLogs();
    this.loadSecurityConfig();
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private createConfigForm(): FormGroup {
    return this.fb.group({
      maxLoginAttempts: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      lockoutDurationMinutes: [15, [Validators.required, Validators.min(1), Validators.max(1440)]],
      passwordExpirationDays: [90, [Validators.required, Validators.min(0), Validators.max(365)]],
      requireTwoFactorAuth: [false],
      sessionTimeoutMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      auditLogRetentionDays: [90, [Validators.required, Validators.min(1), Validators.max(365)]],
      allowedIpRangesText: ['']
    });
  }

  private createAuditFilterForm(): FormGroup {
    return this.fb.group({
      userId: [''],
      action: [''],
      entityType: [''],
      ipAddress: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  // Data Loading Methods
  loadDashboard(): void {
    this.loading.set(true);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    this.securityService.getSecurityDashboard({
      from: fromDate.toISOString(),
      to: new Date().toISOString()
    }).subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.loading.set(false);
      }
    });
  }

  loadSecurityAlerts(): void {
    this.securityService.getSecurityAlerts().subscribe({
      next: (alerts) => this.alerts.set(alerts),
      error: (error) => console.error('Error loading alerts:', error)
    });
  }

  loadAuditLogs(filter?: SecurityAuditFilter): void {
    this.loadingAuditLogs.set(true);
    this.securityService.getAuditLogs(filter).subscribe({
      next: (logs) => {
        this.auditLogs.set(logs);
        this.loadingAuditLogs.set(false);
      },
      error: (error) => {
        console.error('Error loading audit logs:', error);
        this.loadingAuditLogs.set(false);
      }
    });
  }

  loadSecurityConfig(): void {
    this.securityService.getSecurityConfiguration().subscribe({
      next: (config) => {
        this.securityConfig.set(config);
        this.configForm.patchValue({
          ...config,
          allowedIpRangesText: config.allowedIpRanges?.join('\n') || ''
        });
      },
      error: (error) => console.error('Error loading security config:', error)
    });
  }

  // UI Methods
  refreshDashboard(): void {
    this.loadDashboard();
    this.loadSecurityAlerts();
    this.loadAuditLogs();
  }

  openConfigModal(): void {
    this.loadSecurityConfig();
    this.configModal.open();
  }

  openAuditFilterModal(): void {
    this.auditFilterModal.open();
  }

  saveSecurityConfig(): void {
    if (this.configForm.valid) {
      this.savingConfig.set(true);
      const formValue = this.configForm.value;

      const config: SecurityConfiguration = {
        maxLoginAttempts: formValue.maxLoginAttempts,
        lockoutDurationMinutes: formValue.lockoutDurationMinutes,
        passwordExpirationDays: formValue.passwordExpirationDays,
        requireTwoFactorAuth: formValue.requireTwoFactorAuth,
        sessionTimeoutMinutes: formValue.sessionTimeoutMinutes,
        auditLogRetentionDays: formValue.auditLogRetentionDays,
        allowedIpRanges: formValue.allowedIpRangesText
          ? formValue.allowedIpRangesText.split('\n').filter((ip: string) => ip.trim())
          : []
      };

      this.securityService.updateSecurityConfiguration(config).subscribe({
        next: () => {
          this.savingConfig.set(false);
          this.configModal.close();
          this.loadSecurityConfig();
        },
        error: (error) => {
          console.error('Error saving security config:', error);
          this.savingConfig.set(false);
        }
      });
    }
  }

  applyAuditFilter(): void {
    const formValue = this.auditFilterForm.value;
    const filter: SecurityAuditFilter = {};

    if (formValue.userId) filter.userId = formValue.userId;
    if (formValue.action) filter.action = formValue.action;
    if (formValue.entityType) filter.entityType = formValue.entityType;
    if (formValue.ipAddress) filter.ipAddress = formValue.ipAddress;
    if (formValue.fromDate) filter.fromDate = formValue.fromDate;
    if (formValue.toDate) filter.toDate = formValue.toDate;

    this.loadAuditLogs(filter);
    this.auditFilterModal.close();
  }

  // Alert Methods
  resolveAlert(alertId: string): void {
    this.securityService.resolveSecurityAlert(alertId).subscribe({
      next: () => this.loadSecurityAlerts(),
      error: (error) => console.error('Error resolving alert:', error)
    });
  }

  dismissAlert(alertId: string): void {
    this.securityService.dismissSecurityAlert(alertId).subscribe({
      next: () => this.loadSecurityAlerts(),
      error: (error) => console.error('Error dismissing alert:', error)
    });
  }

  showAllAlerts(): void {
    // Navigate to detailed alerts view or open modal
    console.log('Show all alerts');
  }

  // Export Methods
  exportAuditLogs(): void {
    const filter = this.auditFilterForm.value;
    this.securityService.exportAuditLogs(filter, 'csv').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => console.error('Error exporting audit logs:', error)
    });
  }

  generateComplianceReport(): void {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);

    this.securityService.generateComplianceReport(
      fromDate.toISOString(),
      new Date().toISOString()
    ).subscribe({
      next: (report) => {
        // Handle compliance report (show in modal or download)
        console.log('Compliance report generated:', report);
      },
      error: (error) => console.error('Error generating compliance report:', error)
    });
  }

  // Utility Methods
  getRiskScoreColorClass(riskScore: number): string {
    if (riskScore >= 80) return 'bg-red-100 dark:bg-red-900';
    if (riskScore >= 60) return 'bg-orange-100 dark:bg-orange-900';
    if (riskScore >= 40) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-green-100 dark:bg-green-900';
  }

  getRiskScoreIconClass(riskScore: number): string {
    if (riskScore >= 80) return 'text-red-600 dark:text-red-300';
    if (riskScore >= 60) return 'text-orange-600 dark:text-orange-300';
    if (riskScore >= 40) return 'text-yellow-600 dark:text-yellow-300';
    return 'text-green-600 dark:text-green-300';
  }

  getAlertBgClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/10 alert-critical';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-900/10 alert-high';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/10 alert-medium';
      case 'low':
        return 'bg-green-50 dark:bg-green-900/10 alert-low';
      default:
        return 'bg-gray-50 dark:bg-gray-800';
    }
  }

  getAlertIndicatorClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  }

  getAlertSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }

  getActiveAlerts(): number {
    return this.alerts().filter(a => !a.isResolved).length;
  }

  // Auto refresh
  private startAutoRefresh(): void {
    this.refreshInterval = window.setInterval(() => {
      this.refreshDashboard();
    }, 30000); // Refresh every 30 seconds
  }

  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}