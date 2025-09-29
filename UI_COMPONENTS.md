# UI Components Kütüphanesi

Bu döküman, Produck ERP Frontend projesinde kullanılan merkezi UI bileşenlerini açıklar. Tüm bileşenler modern Angular 20 standartları, TypeScript Signals ve TailwindCSS ile geliştirilmiştir.

## Tasarım Prensipleri

### 🎨 Tasarım Sistemi
- **Minimalist & Sade**: Göze batmayan, temiz tasarım
- **Accessibility First**: WCAG 2.1 standartlarına uyumlu
- **Responsive**: Mobil-first yaklaşım
- **Consistent**: Tutarlı spacing, color ve typography

### 🔧 Teknik Prensipler
- **Standalone Components**: Modern Angular yaklaşımı
- **TypeScript Signals**: Reactive state management
- **Form Integration**: Angular Reactive Forms uyumlu
- **Tree Shakable**: Optimized bundle size

## Bileşenler

### 📝 Form Bileşenleri

#### Button Component
**Dosya**: `src/app/shared/components/ui/button/button.component.ts`

```typescript
// Kullanım
<erp-button variant="primary" size="default" (click)="handleClick()">
  Kaydet
</erp-button>

// Icon ile
<erp-button variant="outline" [iconLeft]="true">
  <svg slot="icon-left">...</svg>
  Düzenle
</erp-button>

// Loading state
<erp-button [loading]="isSubmitting" variant="primary">
  Gönder
</erp-button>
```

**Özellikler**:
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `destructive`
- **Sizes**: `sm`, `default`, `lg`, `icon`
- **States**: Loading, disabled, hover, focus
- **Icons**: Left, right, icon-only
- **Accessibility**: ARIA attributes, keyboard navigation

#### Input Component
**Dosya**: `src/app/shared/components/ui/input/input.component.ts`

```typescript
// Temel kullanım
<erp-input
  label="Ad Soyad"
  placeholder="Adınızı girin"
  [required]="true"
  [(ngModel)]="name">
</erp-input>

// Şifre input
<erp-input
  type="password"
  label="Şifre"
  helperText="En az 8 karakter olmalı">
</erp-input>

// Hata durumu
<erp-input
  [errorMessage]="emailError"
  type="email"
  label="E-posta">
</erp-input>
```

**Özellikler**:
- **Types**: `text`, `email`, `password`, `number`, `tel`, `url`, `search`
- **Sizes**: `sm`, `default`, `lg`
- **Features**: Password toggle, prefix/suffix icons, validation
- **Form Integration**: ControlValueAccessor uyumlu

#### Select Component
**Dosya**: `src/app/shared/components/ui/select/select.component.ts`

```typescript
// Temel kullanım
<erp-select
  label="Şehir"
  placeholder="Şehir seçin"
  [options]="cityOptions"
  [(ngModel)]="selectedCity">
</erp-select>

// Arama özellikli
<erp-select
  [options]="countries"
  [showSearch]="true"
  placeholder="Ülke arayın">
</erp-select>
```

**Özellikler**:
- **Search**: Filtreleme desteği
- **Keyboard Navigation**: Arrow keys, Enter, Escape
- **Custom Options**: Icon, disabled state desteği
- **Performance**: Büyük listeler için optimize

#### Checkbox Component
**Dosya**: `src/app/shared/components/ui/checkbox/checkbox.component.ts`

```typescript
<erp-checkbox
  label="Şartları kabul ediyorum"
  description="Gizlilik politikası ve kullanım şartları"
  [(ngModel)]="termsAccepted">
</erp-checkbox>
```

### 🎛️ Layout Bileşenleri

#### Modal Component
**Dosya**: `src/app/shared/components/ui/modal/modal.component.ts`

```typescript
<erp-modal
  #confirmModal
  title="Kayıt Sil"
  size="default"
  confirmVariant="destructive"
  confirmText="Sil"
  (confirmed)="deleteRecord()">

  <p>Bu kaydı silmek istediğinizden emin misiniz?</p>
</erp-modal>
```

**Özellikler**:
- **Sizes**: `sm`, `default`, `lg`, `xl`, `full`
- **Features**: Overlay, ESC key, backdrop click
- **Customization**: Header, footer, buttons
- **Animations**: Fade in/out, slide effects

#### Card Component
**Dosya**: `src/app/shared/components/ui/card/card.component.ts`

```typescript
<erp-card
  title="Satış Raporu"
  subtitle="Bu ay"
  variant="elevated"
  [hasHeader]="true"
  [hasFooter]="true">

  <div>Card içeriği</div>

  <div slot="footer">
    <erp-button variant="outline">Detay</erp-button>
  </div>
</erp-card>
```

#### Container Component
**Dosya**: `src/app/shared/components/ui/container/container.component.ts`

```typescript
<erp-container maxWidth="lg" padding="default">
  <erp-typography variant="h1">Başlık</erp-typography>
  <p>İçerik...</p>
</erp-container>
```

### 📊 Data Bileşenleri

#### Data Grid Component
**Dosya**: `src/app/shared/components/ui/data-grid/data-grid.component.ts`

```typescript
// Component'te
columns: DataGridColumn[] = [
  {
    field: 'name',
    headerName: 'Ad',
    type: 'text'
  },
  {
    field: 'price',
    headerName: 'Fiyat',
    type: 'currency'
  },
  {
    field: 'actions',
    headerName: 'İşlemler',
    type: 'actions',
    actions: [
      {
        label: 'Düzenle',
        icon: '✏️',
        onClick: (data) => this.edit(data)
      },
      {
        label: 'Sil',
        icon: '🗑️',
        variant: 'destructive',
        onClick: (data) => this.delete(data)
      }
    ]
  }
];

// Template'te
<erp-data-grid
  title="Ürünler"
  [data]="products"
  [columns]="columns"
  [loading]="isLoading"
  [config]="{
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    pageSize: 50
  }"
  (rowSelected)="onRowSelected($event)">
</erp-data-grid>
```

**Özellikler**:
- **AG Grid Integration**: Enterprise data grid
- **Column Types**: Text, number, currency, date, boolean, actions
- **Features**: Sort, filter, pagination, export
- **Performance**: Virtual scrolling, lazy loading
- **Customization**: Actions, cell renderers, themes

#### Loading Component
**Dosya**: `src/app/shared/components/ui/loading/loading.component.ts`

```typescript
// Spinner
<erp-loading type="spinner" size="lg" text="Yükleniyor..."></erp-loading>

// Skeleton
<erp-loading type="skeleton" [skeletonLines]="5"></erp-loading>

// Dots
<erp-loading type="dots" color="text-primary-600"></erp-loading>
```

### 📝 Typography Component
**Dosya**: `src/app/shared/components/ui/typography/typography.component.ts`

```typescript
<erp-typography variant="h1" color="primary" align="center">
  Ana Başlık
</erp-typography>

<erp-typography variant="body1" [gutterBottom]="true">
  Paragraf metni
</erp-typography>

<erp-typography variant="caption" color="muted">
  Açıklama metni
</erp-typography>
```

### 🔧 Layout Utilities

#### Spacer Component
```typescript
<!-- Dikey boşluk -->
<erp-spacer size="lg" direction="vertical"></erp-spacer>

<!-- Yatay boşluk -->
<erp-spacer size="default" direction="horizontal"></erp-spacer>
```

## Kullanım Kılavuzu

### Import Etme
```typescript
// Tek tek import
import { ButtonComponent } from '@shared/components/ui/button/button.component';

// Barrel export ile
import { ButtonComponent, InputComponent, ModalComponent } from '@shared/components/ui';

// Tüm types
import type { ButtonVariant, DataGridColumn } from '@shared/components/ui';
```

### Form Integration
```typescript
// Reactive Forms ile
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]]
});

// Template'te
<form [formGroup]="form">
  <erp-input
    formControlName="email"
    type="email"
    label="E-posta"
    [errorMessage]="getFieldError('email')">
  </erp-input>
</form>
```

### Theme Customization
```scss
// TailwindCSS konfigürasyonu (tailwind.config.js)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          // ... diğer tonlar
        }
      }
    }
  }
}
```

## Best Practices

### 🎯 Component Seçimi
- **Button**: Tüm etkileşimli butonlar için `erp-button` kullanın
- **Input**: Form inputları için `erp-input`, select için `erp-select`
- **Modal**: Popup, dialog ve confirmation için `erp-modal`
- **Grid**: Tablo veriler için `erp-data-grid` (AG Grid wrapper)

### 🔄 State Management
```typescript
// Signals kullanımı
loading = signal(false);
data = signal<User[]>([]);

// Computed values
filteredData = computed(() =>
  this.data().filter(item => item.active)
);
```

### 🎨 Consistent Styling
- Color palette: `primary`, `success`, `warning`, `danger`
- Spacing: `sm`, `default`, `lg` sistemini kullanın
- Typography: Semantic HTML ve `erp-typography` ile

### ♿ Accessibility
- Label'ları unutmayın
- ARIA attributes otomatik eklenir
- Keyboard navigation desteklenir
- Color contrast standartlarına uygun

### 📱 Responsive Design
- Mobile-first yaklaşım
- Breakpoint'ler: `sm`, `md`, `lg`, `xl`
- Container'lar için `maxWidth` ayarları

## Performance Tips

### 🚀 Optimization
- **Lazy Loading**: Route-level code splitting
- **OnPush**: Change detection strategy
- **TrackBy**: ngFor loops için
- **Signals**: Reactive updates

### 📦 Bundle Size
- Tree shaking friendly exports
- Conditional imports
- Minimal external dependencies

## Gelecek Geliştirmeler

### 🔮 Planned Features
- [ ] Toast/Notification system
- [ ] Icon component system
- [ ] Date picker component
- [ ] File upload component
- [ ] Rich text editor
- [ ] Chart components
- [ ] Calendar component
- [ ] Tab/Accordion components

### 🏗️ Technical Improvements
- [ ] Storybook integration
- [ ] Unit test coverage
- [ ] Visual regression tests
- [ ] Animation library
- [ ] Theme switcher (dark/light)
- [ ] RTL support

## Support & Maintenance

Bu component library sürekli geliştirilmektedir. Yeni özellik talepleri, bug raporları ve iyileştirme önerileri için proje geliştirme takımı ile iletişime geçin.

Her component, modern web standartları, accessibility ve user experience best practices'leri gözetilerek tasarlanmıştır.