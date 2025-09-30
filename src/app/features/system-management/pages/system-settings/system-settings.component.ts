import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// UI Components
import { ButtonComponent } from '@shared/components/ui/button/button.component';
import { InputComponent } from '@shared/components/ui/input/input.component';
import { SelectComponent, SelectOption } from '@shared/components/ui/select/select.component';
import { CheckboxComponent } from '@shared/components/ui/checkbox/checkbox.component';
import { CardComponent } from '@shared/components/ui/card/card.component';

// Services and Types
import { SecurityManagementService } from '../../services/security-management.service';
import { SecurityConfiguration } from '../../types/system-management.types';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    CardComponent,
  ],
  template: `
    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Sistem Ayarlari
          </h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sistem güvenlik ve genel ayarlarini yapılandırın
          </p>
        </div>

        <div class="flex gap-3">
          <erp-button
            variant="outline"
            (click)="resetToDefaults()">
            <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Varsayilanlara Döndür
          </erp-button>

          <erp-button
            variant="primary"
            (click)="saveAllSettings()"
            [loading]="saving">
            <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Ayarlari Kaydet
          </erp-button>
        </div>
      </div>

      <!-- Security Settings -->
      <erp-card>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Güvenlik Ayarlari
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Sistem güvenlik politikalarini yapılandırın
              </p>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">Güvenlik Seviyesi:</span>
              <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [class]="getSecurityLevelClass()">
                {{ getSecurityLevelText() }}
              </span>
            </div>
          </div>

          <form [formGroup]="securityForm" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <!-- Authentication Settings -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Kimlik Dogrulama
                </h4>

                <erp-input
                  label="Maksimum Giris Denemesi"
                  type="number"
                  formControlName="maxLoginAttempts"
                  description="Hesabin kilitlenmesi için gereken başarısız giriş sayısı"
                />

                <erp-input
                  label="Hesap Kilitleme Süresi"
                  type="number"
                  formControlName="lockoutDurationMinutes"
                  suffix="dakika"
                  description="Hesabin kilitli kalacağı süre"
                />

                <erp-checkbox
                  label="İki Faktörlü Kimlik Dogrulama Zorunlu"
                  formControlName="requireTwoFactorAuth"
                  description="Tüm kullanicilar için 2FA zorunlu kıl"
                />
              </div>

              <!-- Password Policy -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Sifre Politikasi
                </h4>

                <erp-input
                  label="Sifre Gecerlilik Süresi"
                  type="number"
                  formControlName="passwordExpirationDays"
                  suffix="gün"
                  description="0 = Süresiz, diğer değerler için zorunlu yenileme"
                />

                <erp-select
                  label="Minimum Sifre Uzunluğu"
                  [options]="passwordLengthOptions"
                  formControlName="minPasswordLength"
                />

                <erp-checkbox
                  label="Karmasik Sifre Gerekli"
                  formControlName="requireComplexPassword"
                  description="Büyük harf, küçük harf, rakam ve özel karakter zorunlu"
                />

                <erp-checkbox
                  label="Sifre Gecmisi Kontrolü"
                  formControlName="preventPasswordReuse"
                  description="Son 5 sifrenin tekrar kullanımını engelle"
                />
              </div>

              <!-- Session Management -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Oturum Yönetimi
                </h4>

                <erp-input
                  label="Oturum Zaman Asimi"
                  type="number"
                  formControlName="sessionTimeoutMinutes"
                  suffix="dakika"
                  description="Pasif kalma süresi sonrası otomatik çıkıs"
                />

                <erp-input
                  label="Maksimum Eşzamanli Oturum"
                  type="number"
                  formControlName="maxConcurrentSessions"
                  description="Bir kullanicinin açık tutabileceği maksimum oturum sayısı"
                />

                <erp-checkbox
                  label="Unutulan Oturumları Kapat"
                  formControlName="terminateIdleSessions"
                  description="Belirli süre pasif kalan oturumları otomatik kapat"
                />
              </div>
            </div>
          </form>
        </div>
      </erp-card>

      <!-- Network & Access Settings -->
      <erp-card>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Ağ ve Erisim Ayarlari
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                IP kısıtlamaları ve ağ güvenlik ayarları
              </p>
            </div>
          </div>

          <form [formGroup]="networkForm" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- IP Restrictions -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  IP Kısıtlamaları
                </h4>

                <erp-checkbox
                  label="IP Kısıtlaması Etkin"
                  formControlName="enableIpRestrictions"
                  description="Sadece belirtilen IP adreslerinden erişime izin ver"
                />

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    İzin Verilen IP Araliklari
                  </label>
                  <textarea
                    formControlName="allowedIpRanges"
                    rows="6"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                    placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;172.16.0.0/12"
                  ></textarea>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Her satırda bir IP adresi veya CIDR notasyonu (örn: 192.168.1.0/24)
                  </p>
                </div>

                <erp-checkbox
                  label="Şüpheli IP'leri Otomatik Engelle"
                  formControlName="autoBlockSuspiciousIps"
                  description="Anormal aktivite gösteren IP adreslerini otomatik engelle"
                />
              </div>

              <!-- Rate Limiting -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Hız Sınırlama
                </h4>

                <erp-checkbox
                  label="API Hız Sınırlama Etkin"
                  formControlName="enableRateLimit"
                  description="API isteklerini sınırla"
                />

                <erp-input
                  label="Dakika Başına Maksimum İstek"
                  type="number"
                  formControlName="maxRequestsPerMinute"
                  description="Bir IP'den dakika başına maksimum istek sayısı"
                />

                <erp-input
                  label="Saat Başına Maksimum İstek"
                  type="number"
                  formControlName="maxRequestsPerHour"
                  description="Bir IP'den saat başına maksimum istek sayısı"
                />

                <erp-select
                  label="Hız Sınır Aşımında Eylem"
                  [options]="rateLimitActionOptions"
                  formControlName="rateLimitAction"
                />
              </div>
            </div>
          </form>
        </div>
      </erp-card>

      <!-- Audit & Monitoring Settings -->
      <erp-card>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Audit ve İzleme Ayarlari
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Sistem logları ve izleme konfigürasyonu
              </p>
            </div>
          </div>

          <form [formGroup]="auditForm" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Audit Logging -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Audit Loglama
                </h4>

                <erp-checkbox
                  label="Tüm İstekleri Logla"
                  formControlName="logAllRequests"
                  description="Sistemdeki tüm API isteklerini kaydet"
                />

                <erp-checkbox
                  label="Başarısız İstekleri Logla"
                  formControlName="logFailedRequests"
                  description="Başarısız API isteklerini detaylı logla"
                />

                <erp-checkbox
                  label="Güvenlik Olaylarını Logla"
                  formControlName="logSecurityEvents"
                  description="Şüpheli aktiviteleri ve güvenlik olaylarını kaydet"
                />

                <erp-input
                  label="Log Saklama Süresi"
                  type="number"
                  formControlName="auditLogRetentionDays"
                  suffix="gün"
                  description="Audit loglarının saklanacağı süre"
                />
              </div>

              <!-- Monitoring -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  İzleme ve Uyarılar
                </h4>

                <erp-checkbox
                  label="Real-time İzleme Etkin"
                  formControlName="enableRealTimeMonitoring"
                  description="Sistem aktivitelerini canlı izle"
                />

                <erp-checkbox
                  label="Email Uyarıları"
                  formControlName="enableEmailAlerts"
                  description="Kritik olaylar için email uyarısı gönder"
                />

                <erp-input
                  label="Uyarı Email Adresleri"
                  formControlName="alertEmailAddresses"
                  placeholder="admin@company.com, security@company.com"
                  description="Virgülle ayrılmış email adresleri"
                />

                <erp-select
                  label="Uyarı Seviyesi"
                  [options]="alertLevelOptions"
                  formControlName="minAlertLevel"
                />
              </div>
            </div>
          </form>
        </div>
      </erp-card>

      <!-- System Maintenance -->
      <erp-card>
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Sistem Bakım ve Performans
              </h3>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Otomatik bakım ve performans ayarları
              </p>
            </div>
          </div>

          <form [formGroup]="maintenanceForm" class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Cleanup Settings -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Otomatik Temizlik
                </h4>

                <erp-checkbox
                  label="Otomatik Log Temizliği"
                  formControlName="enableAutoLogCleanup"
                  description="Eski logları otomatik olarak sil"
                />

                <erp-checkbox
                  label="Geçici Dosya Temizliği"
                  formControlName="enableTempFileCleanup"
                  description="Geçici dosyaları düzenli olarak temizle"
                />

                <erp-select
                  label="Temizlik Sıklığı"
                  [options]="cleanupFrequencyOptions"
                  formControlName="cleanupFrequency"
                />

                <erp-input
                  label="Temizlik Saati"
                  formControlName="cleanupTime"
                  description="Otomatik temizliğin yapılacağı saat"
                />
              </div>

              <!-- Performance Settings -->
              <div class="space-y-4">
                <h4 class="text-md font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Performans Ayarları
                </h4>

                <erp-checkbox
                  label="Cache Etkin"
                  formControlName="enableCaching"
                  description="Sistem performansı için cache kullan"
                />

                <erp-input
                  label="Cache Süresi"
                  type="number"
                  formControlName="cacheTimeoutMinutes"
                  suffix="dakika"
                  description="Cache'lenmiş verilerin geçerlilik süresi"
                />

                <erp-checkbox
                  label="Veritabanı Optimizasyonu"
                  formControlName="enableDbOptimization"
                  description="Düzenli veritabanı optimizasyonu çalıştır"
                />

                <erp-select
                  label="Backup Sıklığı"
                  [options]="backupFrequencyOptions"
                  formControlName="backupFrequency"
                />
              </div>
            </div>
          </form>
        </div>
      </erp-card>

      <!-- Actions -->
      <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
        <erp-button
          variant="outline"
          (click)="exportSettings()">
          <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Ayarları Disa Aktar
        </erp-button>

        <erp-button
          variant="outline"
          (click)="importSettings()">
          <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
          Ayarları İçe Aktar
        </erp-button>

        <erp-button
          variant="primary"
          (click)="saveAllSettings()"
          [loading]="saving">
          <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Tüm Ayarlari Kaydet
        </erp-button>
      </div>
    </div>
  `,
  styles: [`
    .settings-section {
      transition: all 0.2s ease-in-out;
    }

    .settings-section:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    @media (prefers-color-scheme: dark) {
      .settings-section:hover {
        box-shadow: 0 4px 6px -1px rgba(255, 255, 255, 0.1);
      }
    }

    .security-level-high {
      background-color: rgb(220 38 38 / 0.1);
      color: rgb(220 38 38);
    }

    .security-level-medium {
      background-color: rgb(245 158 11 / 0.1);
      color: rgb(245 158 11);
    }

    .security-level-low {
      background-color: rgb(34 197 94 / 0.1);
      color: rgb(34 197 94);
    }
  `]
})
export class SystemSettingsComponent implements OnInit {
  // Signals
  saving = signal(false);
  securityConfig = signal<SecurityConfiguration | null>(null);

  // Forms
  securityForm: FormGroup;
  networkForm: FormGroup;
  auditForm: FormGroup;
  maintenanceForm: FormGroup;

  // Options
  passwordLengthOptions: SelectOption[] = [
    { value: 6, label: '6 karakter' },
    { value: 8, label: '8 karakter' },
    { value: 10, label: '10 karakter' },
    { value: 12, label: '12 karakter' },
    { value: 14, label: '14 karakter' }
  ];

  rateLimitActionOptions: SelectOption[] = [
    { value: 'throttle', label: 'Yavaşlat' },
    { value: 'block', label: 'Engelle' },
    { value: 'captcha', label: 'CAPTCHA Göster' }
  ];

  alertLevelOptions: SelectOption[] = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'critical', label: 'Kritik' }
  ];

  cleanupFrequencyOptions: SelectOption[] = [
    { value: 'daily', label: 'Günlük' },
    { value: 'weekly', label: 'Haftalık' },
    { value: 'monthly', label: 'Aylık' }
  ];

  backupFrequencyOptions: SelectOption[] = [
    { value: 'none', label: 'Kapalı' },
    { value: 'daily', label: 'Günlük' },
    { value: 'weekly', label: 'Haftalık' },
    { value: 'monthly', label: 'Aylık' }
  ];

  constructor(
    private securityService: SecurityManagementService,
    private fb: FormBuilder
  ) {
    this.securityForm = this.createSecurityForm();
    this.networkForm = this.createNetworkForm();
    this.auditForm = this.createAuditForm();
    this.maintenanceForm = this.createMaintenanceForm();
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  private createSecurityForm(): FormGroup {
    return this.fb.group({
      maxLoginAttempts: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      lockoutDurationMinutes: [15, [Validators.required, Validators.min(1), Validators.max(1440)]],
      requireTwoFactorAuth: [false],
      passwordExpirationDays: [90, [Validators.required, Validators.min(0), Validators.max(365)]],
      minPasswordLength: [8],
      requireComplexPassword: [true],
      preventPasswordReuse: [true],
      sessionTimeoutMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
      maxConcurrentSessions: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
      terminateIdleSessions: [true]
    });
  }

  private createNetworkForm(): FormGroup {
    return this.fb.group({
      enableIpRestrictions: [false],
      allowedIpRanges: [''],
      autoBlockSuspiciousIps: [true],
      enableRateLimit: [true],
      maxRequestsPerMinute: [100, [Validators.min(10), Validators.max(1000)]],
      maxRequestsPerHour: [1000, [Validators.min(100), Validators.max(10000)]],
      rateLimitAction: ['throttle']
    });
  }

  private createAuditForm(): FormGroup {
    return this.fb.group({
      logAllRequests: [false],
      logFailedRequests: [true],
      logSecurityEvents: [true],
      auditLogRetentionDays: [90, [Validators.required, Validators.min(1), Validators.max(365)]],
      enableRealTimeMonitoring: [true],
      enableEmailAlerts: [true],
      alertEmailAddresses: [''],
      minAlertLevel: ['medium']
    });
  }

  private createMaintenanceForm(): FormGroup {
    return this.fb.group({
      enableAutoLogCleanup: [true],
      enableTempFileCleanup: [true],
      cleanupFrequency: ['weekly'],
      cleanupTime: ['02:00'],
      enableCaching: [true],
      cacheTimeoutMinutes: [60, [Validators.min(1), Validators.max(1440)]],
      enableDbOptimization: [true],
      backupFrequency: ['daily']
    });
  }

  loadSettings(): void {
    this.securityService.getSecurityConfiguration().subscribe({
      next: (config) => {
        this.securityConfig.set(config);
        this.securityForm.patchValue({
          maxLoginAttempts: config.maxLoginAttempts,
          lockoutDurationMinutes: config.lockoutDurationMinutes,
          requireTwoFactorAuth: config.requireTwoFactorAuth,
          passwordExpirationDays: config.passwordExpirationDays,
          sessionTimeoutMinutes: config.sessionTimeoutMinutes
        });

        this.networkForm.patchValue({
          allowedIpRanges: config.allowedIpRanges?.join('\n') || ''
        });

        this.auditForm.patchValue({
          auditLogRetentionDays: config.auditLogRetentionDays
        });
      },
      error: (error) => console.error('Error loading settings:', error)
    });
  }

  saveAllSettings(): void {
    if (this.securityForm.valid && this.networkForm.valid && this.auditForm.valid && this.maintenanceForm.valid) {
      this.saving.set(true);

      const securityValues = this.securityForm.value;
      const networkValues = this.networkForm.value;
      const auditValues = this.auditForm.value;

      const config: SecurityConfiguration = {
        maxLoginAttempts: securityValues.maxLoginAttempts,
        lockoutDurationMinutes: securityValues.lockoutDurationMinutes,
        passwordExpirationDays: securityValues.passwordExpirationDays,
        requireTwoFactorAuth: securityValues.requireTwoFactorAuth,
        sessionTimeoutMinutes: securityValues.sessionTimeoutMinutes,
        auditLogRetentionDays: auditValues.auditLogRetentionDays,
        allowedIpRanges: networkValues.allowedIpRanges
          ? networkValues.allowedIpRanges.split('\n').filter((ip: string) => ip.trim())
          : []
      };

      this.securityService.updateSecurityConfiguration(config).subscribe({
        next: () => {
          this.saving.set(false);
          alert('Ayarlar başarıyla kaydedildi.');
        },
        error: (error) => {
          console.error('Error saving settings:', error);
          this.saving.set(false);
          alert('Ayarlar kaydedilirken bir hata oluştu.');
        }
      });
    }
  }

  resetToDefaults(): void {
    if (confirm('Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?')) {
      this.securityForm.reset({
        maxLoginAttempts: 5,
        lockoutDurationMinutes: 15,
        requireTwoFactorAuth: false,
        passwordExpirationDays: 90,
        minPasswordLength: 8,
        requireComplexPassword: true,
        preventPasswordReuse: true,
        sessionTimeoutMinutes: 30,
        maxConcurrentSessions: 3,
        terminateIdleSessions: true
      });

      this.networkForm.reset({
        enableIpRestrictions: false,
        allowedIpRanges: '',
        autoBlockSuspiciousIps: true,
        enableRateLimit: true,
        maxRequestsPerMinute: 100,
        maxRequestsPerHour: 1000,
        rateLimitAction: 'throttle'
      });

      this.auditForm.reset({
        logAllRequests: false,
        logFailedRequests: true,
        logSecurityEvents: true,
        auditLogRetentionDays: 90,
        enableRealTimeMonitoring: true,
        enableEmailAlerts: true,
        alertEmailAddresses: '',
        minAlertLevel: 'medium'
      });

      this.maintenanceForm.reset({
        enableAutoLogCleanup: true,
        enableTempFileCleanup: true,
        cleanupFrequency: 'weekly',
        cleanupTime: '02:00',
        enableCaching: true,
        cacheTimeoutMinutes: 60,
        enableDbOptimization: true,
        backupFrequency: 'daily'
      });
    }
  }

  exportSettings(): void {
    const settings = {
      security: this.securityForm.value,
      network: this.networkForm.value,
      audit: this.auditForm.value,
      maintenance: this.maintenanceForm.value,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sistem-ayarlari-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  importSettings(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          try {
            const settings = JSON.parse(e.target.result);
            if (settings.security) this.securityForm.patchValue(settings.security);
            if (settings.network) this.networkForm.patchValue(settings.network);
            if (settings.audit) this.auditForm.patchValue(settings.audit);
            if (settings.maintenance) this.maintenanceForm.patchValue(settings.maintenance);
            alert('Ayarlar başarıyla içe aktarıldı.');
          } catch (error) {
            alert('Dosya formatı hatalı.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  getSecurityLevelText(): string {
    const securityValues = this.securityForm.value;
    let score = 0;

    if (securityValues.requireTwoFactorAuth) score += 3;
    if (securityValues.maxLoginAttempts <= 3) score += 2;
    if (securityValues.passwordExpirationDays > 0 && securityValues.passwordExpirationDays <= 90) score += 2;
    if (securityValues.requireComplexPassword) score += 2;
    if (securityValues.sessionTimeoutMinutes <= 30) score += 1;

    if (score >= 8) return 'Yüksek';
    if (score >= 5) return 'Orta';
    return 'Düşük';
  }

  getSecurityLevelClass(): string {
    const level = this.getSecurityLevelText();
    switch (level) {
      case 'Yüksek':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Orta':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Düşük':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
}