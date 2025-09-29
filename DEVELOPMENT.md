# Produck ERP Frontend - Geliştirme Dokümantasyonu

## Proje Genel Bakış

Produck ERP Frontend, Angular 20.3.1 ile geliştirilmiş modern bir Enterprise Resource Planning (ERP) sistemidir. Proje, CRM (Müşteri İlişkileri Yönetimi), iş akışı yönetimi ve güvenlik modüllerini içeren kapsamlı bir iş yönetim platformudur.

## Teknik Mimari

### Teknoloji Stack'i

#### Core Framework
- **Angular 20.3.1** - Son sürüm Angular framework
- **TypeScript 5.9.2** - Strict mode etkin
- **RxJS 7.8.0** - Reaktif programlama
- **Zone.js 0.15.0** - Angular change detection

#### State Management
- **NgRx 20.0.1** - Redux pattern ile state management
  - `@ngrx/store` - Global state yönetimi
  - `@ngrx/effects` - Side effects yönetimi
  - `@ngrx/signals` - Signal-based state
  - `@ngrx/store-devtools` - Development tools

#### UI & Styling
- **TailwindCSS 3.4.4** - Utility-first CSS framework
- **@tailwindcss/forms** - Form styling
- **SCSS** - CSS preprocessor
- **Angular Animations** - Built-in animasyonlar

#### Data & Grid
- **AG Grid 32.3.9** - Enterprise data grid
  - `ag-grid-community` - Core grid functionality
  - `ag-grid-angular` - Angular integration

#### Real-time Communication
- **Microsoft SignalR 8.0.0** - Real-time web functionality

#### Utilities
- **date-fns 3.6.0** - Date manipulation
- **uuid 10.0.0** - Unique identifier generation
- **ngx-sonner 0.3.3** - Toast notifications

### Proje Yapısı

```
src/
├── app/
│   ├── core/                    # Core services ve guards
│   │   ├── auth/               # Authentication logic
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── services/          # Core services
│   │   ├── models/            # Core data models
│   │   ├── components/        # Core components
│   │   ├── directives/        # Core directives
│   │   └── pipes/             # Core pipes
│   │
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   ├── dashboard/         # Dashboard module
│   │   ├── accounts/          # CRM - Hesaplar
│   │   ├── contacts/          # CRM - Kişiler
│   │   ├── leads/             # CRM - Potansiyel müşteriler
│   │   ├── opportunities/     # CRM - Fırsatlar
│   │   ├── workflow/          # İş akışı yönetimi
│   │   └── security/          # Güvenlik ve kullanıcı yönetimi
│   │
│   ├── layout/                # Layout components
│   │   └── components/
│   │       ├── header/        # Header component
│   │       ├── sidebar/       # Sidebar navigation
│   │       └── main-layout/   # Main layout wrapper
│   │
│   ├── shared/                # Paylaşılan bileşenler
│   │   ├── components/        # Reusable components
│   │   ├── services/          # Shared services
│   │   ├── models/            # Shared models
│   │   ├── directives/        # Shared directives
│   │   ├── pipes/             # Shared pipes
│   │   └── guards/            # Shared guards
│   │
│   ├── app.config.ts          # Application configuration
│   ├── app.routes.ts          # Route definitions
│   └── app.ts                 # Root component
│
├── environments/              # Environment configurations
└── styles.scss               # Global styles
```

### Mimari Prensipler

#### 1. Feature-Based Organization
- Her feature kendi klasöründe organize edilmiş
- Her feature kendi `components`, `services`, `models`, `store` yapısına sahip
- Modüler ve ölçeklenebilir yapı

#### 2. Layered Architecture
- **Core Layer**: Temel servisler, guards, interceptors
- **Feature Layer**: İş mantığı ve feature-specific logic
- **Shared Layer**: Paylaşılan bileşenler ve utilities
- **Layout Layer**: UI layout ve navigation

#### 3. State Management Pattern
- NgRx ile Redux pattern implementasyonu
- Her feature için ayrı store yapısı
- Centralized state management

## Geliştirme Konfigürasyonu

### TypeScript Konfigürasyonu
- **Strict Mode**: Etkin (type safety için)
- **Path Mapping**: Kolay import için alias'lar
  ```typescript
  "@app/*": ["app/*"]
  "@core/*": ["app/core/*"]
  "@shared/*": ["app/shared/*"]
  "@features/*": ["app/features/*"]
  "@env/*": ["environments/*"]
  ```

### Angular Konfigürasyonu
- **Standalone Components**: Modern Angular approach
- **Lazy Loading**: Route-based code splitting
- **Preloading Strategy**: PreloadAllModules
- **Component Input Binding**: Router'dan otomatik binding

### Styling Konfigürasyonu
- **TailwindCSS**: Utility-first approach
- **Custom Color Palette**: Primary, success, warning, danger
- **Typography**: Inter font family
- **Form Styling**: @tailwindcss/forms plugin

### HTTP Configuration
- **Interceptors**: Auth, Error, Loading
- **Global Error Handling**: Centralized error management
- **Loading States**: Global loading indicator

## Routing Yapısı

### Public Routes
- `/login` - Authentication

### Protected Routes (Main Layout ile)
- `/dashboard` - Ana dashboard
- `/crm/*` - CRM modülü
  - `/crm/leads` - Potansiyel müşteriler
  - `/crm/opportunities` - Fırsatlar
  - `/crm/accounts` - Hesaplar
  - `/crm/contacts` - Kişiler
- `/workflow` - İş akışı yönetimi
- `/settings/*` - Ayarlar
  - `/settings/users` - Kullanıcı yönetimi
  - `/settings/security` - Güvenlik ayarları

### Special Routes
- `/unauthorized` - Yetkisiz erişim sayfası
- `/**` - Fallback redirect to dashboard

## Geliştirme Komutları

### Temel Komutlar
```bash
# Development server başlatma
npm run start
# veya
ng serve

# Production build
npm run build
# veya
ng build

# Test çalıştırma
npm test
# veya
ng test

# Watch mode ile build
npm run watch
# veya
ng build --watch --configuration development
```

### Code Generation
```bash
# Component oluşturma
ng generate component feature-name/component-name

# Service oluşturma
ng generate service feature-name/service-name

# Guard oluşturma
ng generate guard core/guards/guard-name
```

## Kod Standartları

### Component Naming
- **Prefix**: `erp-` (angular.json'da tanımlı)
- **Style**: SCSS
- **Test**: Devre dışı (skipTests: true)

### File Organization
- Components: `*.component.ts`, `*.component.html`, `*.component.scss`
- Services: `*.service.ts`
- Models: `*.model.ts` veya `*.interface.ts`
- Guards: `*.guard.ts`
- Interceptors: `*.interceptor.ts`

### Import Conventions
- Absolute imports kullanın (path mapping ile)
- Core modules önce, feature modules sonra
- Third-party libraries en üstte

### Prettier Configuration
- **Print Width**: 100 characters
- **Single Quotes**: true
- **Angular Parser**: HTML files için

## State Management (NgRx)

### Store Structure
Her feature modülü için ayrı store yapısı:
```typescript
// Feature store structure
feature/
├── store/
│   ├── actions/
│   ├── reducers/
│   ├── effects/
│   └── selectors/
```

### Signals Integration
- NgRx Signals modern reactive approach
- Component level local state management
- Global state ile entegrasyon

## Performance Optimizations

### Bundle Optimization
- **Lazy Loading**: Route-based code splitting
- **Preloading**: PreloadAllModules strategy
- **Tree Shaking**: Automatic dead code elimination

### Build Configuration
- **Production Budgets**:
  - Initial: 500kB warning, 1MB error
  - Component Styles: 4kB warning, 8kB error

## Security

### Authentication & Authorization
- JWT token based authentication
- Route guards for protection
- Role-based access control (RBAC)

### HTTP Security
- Auth interceptor for token attachment
- Error interceptor for global error handling
- Loading interceptor for UX

## Testing Strategy

### Unit Testing
- **Framework**: Jasmine + Karma
- **Coverage**: Karma-coverage
- **Browser**: Chrome headless

### Test Organization
- Tests devre dışı (development hızı için)
- İhtiyaç halinde `--skip-tests=false` ile enable

## Real-time Features

### SignalR Integration
- Real-time notifications
- Live data updates
- Chat/messaging functionality

## Deployment

### Build Artifacts
- Output: `dist/` directory
- Optimized for production
- Source maps: Development only

### Environment Configuration
```
environments/
├── environment.ts          # Development
└── environment.prod.ts     # Production
```

## Geliştirme Best Practices

### 1. Component Design
- Single Responsibility Principle
- Standalone components kullanın
- OnPush change detection strategy

### 2. Service Design
- Injectable services
- Singleton pattern
- Reactive programming (RxJS)

### 3. State Management
- Immutable state updates
- Centralized business logic
- Side effects isolation

### 4. Performance
- Lazy loading kullanın
- OnPush change detection
- TrackBy functions for *ngFor

### 5. Type Safety
- Strict TypeScript configuration
- Interface definitions
- Generic types where appropriate

## Troubleshooting

### Common Issues
1. **Path Resolution**: tsconfig.json path mapping kontrolü
2. **Style Issues**: TailwindCSS purge configuration
3. **Build Errors**: Angular version compatibility
4. **Memory Issues**: Node.js heap size artırın

### Development Tools
- **Angular DevTools**: Browser extension
- **NgRx DevTools**: State debugging
- **Prettier**: Code formatting
- **Husky**: Git hooks

## Gelecek Geliştirmeler

### Planned Features
- [ ] PWA (Progressive Web App) support
- [ ] Internationalization (i18n)
- [ ] Dark/Light theme toggle
- [ ] Advanced reporting module
- [ ] Mobile responsive improvements
- [ ] Offline capability

### Technical Debt
- [ ] Unit test coverage artırma
- [ ] E2E test implementation
- [ ] Bundle size optimization
- [ ] Accessibility improvements (a11y)

## Katkıda Bulunma

### Git Workflow
1. Feature branch oluşturun
2. Changes commit edin
3. Pull request açın
4. Code review sürecini takip edin

### Code Review Checklist
- [ ] TypeScript errors yok
- [ ] Prettier formatting uygulanmış
- [ ] Component tests yazılmış (gerekirse)
- [ ] Performance impact değerlendirilmiş
- [ ] Security best practices uygulanmış

Bu dokümantasyon, projenin mevcut durumunu ve gelecekteki geliştirmeler için rehber niteliğindedir. Proje büyüdükçe ve yeni özellikler eklendikçe güncellenmelidir.