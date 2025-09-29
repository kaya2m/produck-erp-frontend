# Enterprise Data Grid - Kapsamlı Özellikler Kılavuzu

## 🎯 Genel Bakış

**erp-data-grid** komponenti, AG Grid Community üzerine kurulmuş, enterprise seviye özellikler sunan, tamamen parametrik ve genişletilebilir bir veri tablosu çözümüdür.

## 🏗️ Temel Mimari

### Component Signature
```typescript
<erp-data-grid
  [data]="users"
  [columns]="columnDefs"
  [config]="gridConfig"
  [loading]="isLoading"
  [bulkOperations]="bulkOps"
  (rowSelected)="onRowSelected($event)"
  (cellClicked)="onCellClicked($event)"
  (refreshRequested)="loadData()">
</erp-data-grid>
```

### Temel Türler
```typescript
interface DataGridColumn extends ColDef {
  field: string;
  headerName: string;
  type?: 'text' | 'number' | 'date' | 'datetime' | 'boolean' |
         'currency' | 'percentage' | 'email' | 'phone' | 'url' |
         'actions' | 'status' | 'avatar' | 'tag';
  actions?: DataGridAction[];
  editable?: boolean;
  validation?: (value: any) => string | null;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupable?: boolean;
  exportable?: boolean;
  searchable?: boolean;
  sticky?: 'left' | 'right';
}

interface DataGridConfig {
  // Display Configuration
  height?: string;
  theme?: 'alpine' | 'balham' | 'material';
  density?: 'compact' | 'normal' | 'comfortable';

  // Data Operations
  enableSelection?: boolean;
  selectionMode?: 'single' | 'multiple' | 'checkbox';
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableAdvancedFilter?: boolean;
  enablePagination?: boolean;
  pageSize?: number;

  // Advanced Features
  enableExport?: boolean;
  enableImport?: boolean;
  enableInlineEdit?: boolean;
  enableBulkEdit?: boolean;
  enableRealTimeUpdates?: boolean;
  enableColumnManagement?: boolean;
  enableStateManagement?: boolean;

  // Performance
  enableVirtualization?: boolean;
  serverSidePagination?: boolean;
  cacheBlockSize?: number;
  maxBlocksInCache?: number;
}
```

## 🎨 Display & UI Features

### 1. Tema ve Görünüm
```typescript
const config: DataGridConfig = {
  theme: 'alpine',           // 'alpine', 'balham', 'material'
  density: 'normal',         // 'compact', 'normal', 'comfortable'
  height: '600px',           // Sabit yükseklik
  enableFullScreen: true,    // Tam ekran modu
  enableAnimations: true     // Geçiş animasyonları
};
```

### 2. Responsive Design
- **Mobile-first**: Küçük ekranlarda otomatik optimize
- **Column Stacking**: Dar ekranlarda sütun istiflemesi
- **Touch Support**: Dokunmatik cihaz desteği
- **Adaptive Pagination**: Ekran boyutuna göre pagination

### 3. Dark/Light Mode Support
```scss
.ag-theme-alpine-dark {
  --ag-background-color: rgb(26, 32, 44);
  --ag-foreground-color: rgb(226, 232, 240);
  --ag-border-color: rgb(45, 55, 72);
}
```

## 📊 Column Types & Formatting

### 1. Temel Column Types
```typescript
const columns: DataGridColumn[] = [
  // Text Column
  {
    field: 'name',
    headerName: 'Ad Soyad',
    type: 'text',
    searchable: true,
    groupable: true
  },

  // Number Column
  {
    field: 'age',
    headerName: 'Yaş',
    type: 'number',
    aggregation: 'avg'
  },

  // Currency Column
  {
    field: 'salary',
    headerName: 'Maaş',
    type: 'currency',
    aggregation: 'sum',
    sticky: 'right'
  },

  // Date Column
  {
    field: 'birthDate',
    headerName: 'Doğum Tarihi',
    type: 'date'
  },

  // Boolean Column
  {
    field: 'isActive',
    headerName: 'Aktif',
    type: 'boolean'
  },

  // Status Column
  {
    field: 'status',
    headerName: 'Durum',
    type: 'status'
  },

  // Email Column
  {
    field: 'email',
    headerName: 'E-posta',
    type: 'email'
  },

  // Actions Column
  {
    field: 'actions',
    headerName: 'İşlemler',
    type: 'actions',
    actions: [
      {
        label: 'Düzenle',
        icon: '✏️',
        variant: 'primary',
        onClick: (data) => this.editUser(data)
      },
      {
        label: 'Sil',
        icon: '🗑️',
        variant: 'destructive',
        confirmMessage: 'Bu kullanıcıyı silmek istediğinizden emin misiniz?',
        onClick: (data) => this.deleteUser(data),
        visible: (data) => data.canDelete
      }
    ]
  }
];
```

### 2. Custom Cell Renderers
```typescript
{
  field: 'avatar',
  headerName: 'Avatar',
  cellRenderer: (params) => `
    <img src="${params.value}"
         class="w-8 h-8 rounded-full"
         alt="Avatar" />
  `
}
```

## 🔍 Search & Filter Features

### 1. Global Search
```typescript
const config: DataGridConfig = {
  enableGlobalSearch: true,
  searchPlaceholder: 'Kullanıcıları ara...'
};
```

### 2. Advanced Filtering
```typescript
const config: DataGridConfig = {
  enableAdvancedFilter: true,
  enableFiltering: true,
  serverSideFilter: false  // Client-side veya server-side
};
```

### 3. Column-Specific Filters
- **Text**: Contains, equals, starts with, ends with
- **Number**: Equals, greater than, less than, range
- **Date**: Date range, before, after, equals
- **Boolean**: True/false/all
- **Custom**: Kendi filter logic'inizi yazın

### 4. Filter Chips
Aktif filtreler görsel chip'ler halinde gösterilir:
- Kolay kaldırma
- Filter değeri görüntüleme
- Toplu temizleme

## ⚡ Performance Features

### 1. Virtualization
```typescript
const config: DataGridConfig = {
  enableVirtualization: true,
  rowBuffer: 10,            // Görünümden önce/sonra render edilecek satır sayısı
  cacheBlockSize: 100,      // Cache blok boyutu
  maxBlocksInCache: 10      // Maksimum cache blok sayısı
};
```

### 2. Server-Side Operations
```typescript
const config: DataGridConfig = {
  serverSidePagination: true,
  serverSideFilter: true,
  pageSize: 100
};

// Server-side datasource
const serverSideDatasource: IServerSideDatasource = {
  getRows: (params) => {
    const { request, successCallback, failCallback } = params;

    this.apiService.getData({
      page: request.startRow / request.endRow,
      size: request.endRow - request.startRow,
      filters: request.filterModel,
      sort: request.sortModel
    }).subscribe({
      next: (response) => {
        successCallback(response.data, response.totalCount);
      },
      error: () => failCallback()
    });
  }
};
```

### 3. Lazy Loading
```typescript
// Infinite scroll için
const config: DataGridConfig = {
  rowModelType: 'infinite',
  cacheBlockSize: 50,
  cacheOverflowSize: 2,
  maxConcurrentDatasourceRequests: 2
};
```

## 📋 Selection Features

### 1. Selection Modes
```typescript
const config: DataGridConfig = {
  enableSelection: true,
  selectionMode: 'multiple',    // 'single', 'multiple', 'checkbox'
  selectAllMode: 'filtered'     // 'all', 'filtered', 'currentPage'
};
```

### 2. Bulk Operations
```typescript
const bulkOperations: BulkOperation[] = [
  {
    label: 'Toplu Sil',
    icon: '🗑️',
    variant: 'destructive',
    confirmMessage: 'Seçili kayıtları silmek istediğinizden emin misiniz?',
    action: (selectedRows) => {
      this.deleteMultipleUsers(selectedRows);
    },
    disabled: (selectedRows) => selectedRows.length === 0,
    visible: (selectedRows) => this.canBulkDelete
  },
  {
    label: 'Excel\'e Aktar',
    icon: '📊',
    action: (selectedRows) => {
      this.exportToExcel(selectedRows);
    }
  }
];
```

## 💾 Data Operations

### 1. Export Features
```typescript
const config: DataGridConfig = {
  enableExport: true,
  exportFormats: ['csv', 'excel', 'pdf']
};

// Programmatic export
this.dataGrid.exportToCsv('users-export.csv');
this.dataGrid.exportToExcel('users-export.xlsx');

// Export events
onExportRequested(exportData: any) {
  console.log('Export format:', exportData.format);
  console.log('Only selected:', exportData.onlySelected);
  console.log('Data:', exportData.data);
}
```

### 2. Import Features
```typescript
const config: DataGridConfig = {
  enableImport: true
};

// Import events
onImportRequested(importData: any) {
  const { headers, data } = importData;

  // Validate data
  const validatedData = this.validateImportData(data);

  // Save to backend
  this.apiService.bulkCreate(validatedData).subscribe();
}
```

### 3. Inline Editing
```typescript
const columns: DataGridColumn[] = [
  {
    field: 'name',
    headerName: 'Ad',
    editable: true,
    validation: (value) => {
      if (!value || value.trim().length < 2) {
        return 'Ad en az 2 karakter olmalıdır';
      }
      return null;
    },
    cellEditor: 'agTextCellEditor',
    cellEditorParams: {
      maxLength: 50
    }
  }
];

// Cell edit events
onCellEdited(event: any) {
  const { data, field, newValue, oldValue } = event;

  // Validate
  const validation = this.validateField(field, newValue);
  if (validation.error) {
    // Revert change
    event.api.getRowNode(event.node.id)?.setDataValue(field, oldValue);
    return;
  }

  // Save to backend
  this.apiService.updateUser(data.id, { [field]: newValue }).subscribe();
}
```

## 📊 Grouping & Aggregation

### 1. Row Grouping
```typescript
const config: DataGridConfig = {
  enableGrouping: true,
  groupDefaultExpanded: 1
};

const columns: DataGridColumn[] = [
  {
    field: 'department',
    headerName: 'Departman',
    groupable: true,
    enableRowGroup: true
  },
  {
    field: 'salary',
    headerName: 'Maaş',
    type: 'currency',
    aggregation: 'sum'
  }
];
```

### 2. Aggregation Functions
```typescript
const columns: DataGridColumn[] = [
  {
    field: 'revenue',
    headerName: 'Gelir',
    type: 'currency',
    aggregation: 'sum'        // Toplam
  },
  {
    field: 'score',
    headerName: 'Puan',
    type: 'number',
    aggregation: 'avg'        // Ortalama
  },
  {
    field: 'orders',
    headerName: 'Sipariş',
    aggregation: 'count'      // Sayım
  }
];
```

## 🔄 Real-time Features

### 1. Live Updates
```typescript
const config: DataGridConfig = {
  enableRealTimeUpdates: true,
  updateFrequency: 30000      // 30 saniye
};

// Manuel refresh
this.dataGrid.refresh();

// WebSocket ile live updates
this.websocketService.connect().subscribe(update => {
  if (update.type === 'USER_UPDATED') {
    this.updateGridRow(update.data);
  }
});
```

### 2. Change Detection
```typescript
// Data değişikliklerini otomatik algıla
@Input() data = signal<User[]>([]);

// Grid otomatik güncellenir
effect(() => {
  this.processedData.set(
    this.data().map(user => ({ ...user, fullName: `${user.firstName} ${user.lastName}` }))
  );
});
```

## ⚙️ Column Management

### 1. Column Visibility
```typescript
const config: DataGridConfig = {
  enableColumnVisibility: true,
  enableColumnReorder: true,
  enableColumnResize: true,
  enableColumnPin: true
};

// Programmatic column management
this.dataGrid.showColumnManager();
this.dataGrid.showAllColumns();
this.dataGrid.hideAllColumns();
this.dataGrid.resetColumnWidth('salary');
```

### 2. Column Persistence
```typescript
const config: DataGridConfig = {
  enableStateManagement: true,
  statePersistenceKey: 'users-grid-state'
};

// State değişikliklerini dinle
onStateChanged(state: GridState) {
  console.log('Grid state changed:', state);

  // Custom persistence
  this.userPreferencesService.saveGridState('users', state);
}
```

## 🎛️ Advanced Configuration

### 1. Context Menu
```typescript
const config: DataGridConfig = {
  enableContextMenu: true
};

// Custom context menu items
getContextMenuItems(params) {
  return [
    'copy',
    'copyWithHeaders',
    'separator',
    {
      name: 'Kullanıcıyı Düzenle',
      action: () => this.editUser(params.node.data),
      icon: '<i class="fas fa-edit"></i>'
    },
    {
      name: 'Kullanıcıyı Sil',
      action: () => this.deleteUser(params.node.data),
      disabled: !params.node.data.canDelete
    }
  ];
}
```

### 2. Custom Status Bar
```typescript
const statusBar = {
  statusPanels: [
    { statusPanel: 'agTotalAndFilteredRowCountComponent' },
    { statusPanel: 'agSelectedRowCountComponent' },
    { statusPanel: 'agAggregationComponent' },
    {
      statusPanel: 'customStatsPanel',
      statusPanelParams: {
        template: 'Toplam Maaş: {{ totalSalary | currency:"TRY" }}'
      }
    }
  ]
};
```

## 🛠️ Praktik Kullanım Örnekleri

### 1. Basit Kullanıcı Listesi
```typescript
// Component
export class UsersComponent {
  users = signal<User[]>([]);
  loading = signal(false);

  columns: DataGridColumn[] = [
    { field: 'name', headerName: 'Ad Soyad', type: 'text' },
    { field: 'email', headerName: 'E-posta', type: 'email' },
    { field: 'department', headerName: 'Departman', type: 'text', groupable: true },
    { field: 'salary', headerName: 'Maaş', type: 'currency', aggregation: 'sum' },
    { field: 'isActive', headerName: 'Aktif', type: 'boolean' },
    {
      field: 'actions',
      headerName: 'İşlemler',
      type: 'actions',
      actions: [
        {
          label: 'Düzenle',
          icon: '✏️',
          onClick: (user) => this.editUser(user)
        }
      ]
    }
  ];

  config: DataGridConfig = {
    enableSelection: true,
    enableFiltering: true,
    enableExport: true,
    pageSize: 50
  };
}

// Template
<erp-data-grid
  title="Kullanıcı Yönetimi"
  [data]="users()"
  [columns]="columns"
  [config]="config"
  [loading]="loading()"
  (refreshRequested)="loadUsers()">
</erp-data-grid>
```

### 2. Server-Side Grid
```typescript
export class OrdersComponent {
  serverSideDatasource: IServerSideDatasource = {
    getRows: (params) => {
      const request = {
        page: Math.floor(params.request.startRow / params.request.endRow),
        size: params.request.endRow - params.request.startRow,
        filters: params.request.filterModel,
        sort: params.request.sortModel?.map(s => ({
          field: s.colId,
          direction: s.sort
        }))
      };

      this.ordersService.getOrders(request).subscribe({
        next: (response) => {
          params.successCallback(response.data, response.totalCount);
        },
        error: () => params.failCallback()
      });
    }
  };

  config: DataGridConfig = {
    serverSidePagination: true,
    serverSideFilter: true,
    enableVirtualization: true,
    pageSize: 100
  };
}
```

### 3. Editable Grid
```typescript
export class ProductsComponent {
  products = signal<Product[]>([]);

  columns: DataGridColumn[] = [
    {
      field: 'name',
      headerName: 'Ürün Adı',
      editable: true,
      validation: (value) => value?.length < 3 ? 'En az 3 karakter' : null
    },
    {
      field: 'price',
      headerName: 'Fiyat',
      type: 'currency',
      editable: true,
      validation: (value) => value <= 0 ? 'Fiyat 0\'dan büyük olmalı' : null
    },
    {
      field: 'category',
      headerName: 'Kategori',
      editable: true,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['Elektronik', 'Kitap', 'Giyim', 'Ev & Bahçe']
      }
    }
  ];

  config: DataGridConfig = {
    enableInlineEdit: true,
    enableBulkEdit: true
  };

  onCellEdited(event: any) {
    this.productsService.updateProduct(event.data.id, {
      [event.field]: event.newValue
    }).subscribe();
  }
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Performance Issues**
   ```typescript
   // Solution: Enable virtualization
   config: DataGridConfig = {
     enableVirtualization: true,
     rowBuffer: 5,
     cacheBlockSize: 50
   };
   ```

2. **Memory Leaks**
   ```typescript
   ngOnDestroy() {
     // Grid otomatik cleanup yapar
     // Ama custom subscriptions'ları temizleyin
     this.subscriptions.forEach(sub => sub.unsubscribe());
   }
   ```

3. **Column Width Issues**
   ```typescript
   // Auto-size columns after data load
   onGridReady(params: GridReadyEvent) {
     setTimeout(() => {
       params.api.sizeColumnsToFit();
     }, 100);
   }
   ```

Bu kapsamlı grid sistemi ile enterprise seviye veri yönetimi uygulamalarınızı kolayca geliştirebilirsiniz. Tüm özellikler parametrik olarak açılıp kapatılabilir ve projenizin ihtiyaçlarına göre özelleştirilebilir.