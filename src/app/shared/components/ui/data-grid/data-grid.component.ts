import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  SelectionChangedEvent,
  CellClickedEvent,
  GridOptions,
  FilterChangedEvent,
  SortChangedEvent,
  ColumnMovedEvent,
  ColumnResizedEvent,
  ColumnVisibleEvent,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RowSelectedEvent,
  CellEditingStoppedEvent,
  PaginationChangedEvent
} from 'ag-grid-community';
import { LoadingComponent } from '../loading/loading.component';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';
import { SelectComponent, SelectOption } from '../select/select.component';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { ModalComponent } from '../modal/modal.component';

export interface DataGridColumn extends ColDef {
  field: string;
  headerName: string;
  type?: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'currency' | 'percentage' | 'email' | 'phone' | 'url' | 'actions' | 'status' | 'avatar' | 'tag';
  actions?: DataGridAction[];
  editable?: boolean;
  required?: boolean;
  validation?: (value: any) => string | null;
  cellEditorParams?: any;
  customRenderer?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupable?: boolean;
  exportable?: boolean;
  searchable?: boolean;
  sticky?: 'left' | 'right';
}

export interface DataGridAction {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  onClick: (data: any, params?: any) => void;
  disabled?: (data: any) => boolean;
  visible?: (data: any) => boolean;
  tooltip?: string;
  confirmMessage?: string;
}

export interface DataGridConfig {
  // Display
  height?: string;
  theme?: 'alpine' | 'balham' | 'material';
  density?: 'compact' | 'normal' | 'comfortable';

  // Selection
  enableSelection?: boolean;
  selectionMode?: 'single' | 'multiple' | 'checkbox';
  selectAllMode?: 'all' | 'filtered' | 'currentPage';

  // Sorting & Filtering
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enableAdvancedFilter?: boolean;
  multiSort?: boolean;
  serverSideFilter?: boolean;

  // Pagination
  enablePagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  serverSidePagination?: boolean;

  // Columns
  enableColumnResize?: boolean;
  enableColumnReorder?: boolean;
  enableColumnPin?: boolean;
  enableColumnGrouping?: boolean;
  enableColumnVisibility?: boolean;
  autoSizeColumns?: boolean;

  // Data Operations
  enableExport?: boolean;
  exportFormats?: ('csv' | 'excel' | 'pdf')[];
  enableImport?: boolean;
  enableInlineEdit?: boolean;
  enableBulkEdit?: boolean;

  // Performance
  enableVirtualization?: boolean;
  rowBuffer?: number;
  cacheBlockSize?: number;
  maxBlocksInCache?: number;

  // Real-time
  enableRealTimeUpdates?: boolean;
  updateFrequency?: number;

  // Search
  enableGlobalSearch?: boolean;
  enableQuickFilter?: boolean;
  searchPlaceholder?: string;

  // Grouping & Aggregation
  enableGrouping?: boolean;
  enableAggregation?: boolean;
  groupDefaultExpanded?: number;

  // Customization
  enableContextMenu?: boolean;
  enableTooltips?: boolean;
  enableAnimations?: boolean;
  enableFullScreen?: boolean;

  // State Management
  enableStateManagement?: boolean;
  statePersistenceKey?: string;
}

export interface BulkOperation {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  action: (selectedRows: any[]) => void;
  confirmMessage?: string;
  disabled?: (selectedRows: any[]) => boolean;
  visible?: (selectedRows: any[]) => boolean;
}

export interface GridState {
  columns?: any[];
  filters?: any;
  sort?: any[];
  pagination?: any;
  grouping?: any;
  selection?: any[];
}

@Component({
  selector: 'erp-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridAngular,
    LoadingComponent,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    ModalComponent
  ],
  template: `
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden" [class.h-full]="config.height === '100%'">

      <!-- Advanced Toolbar -->
      <div class="border-b border-gray-200 bg-gray-50">
        <!-- Title Row -->
        @if (title || subtitle || showToolbar) {
          <div class="px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                @if (title) {
                  <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
                }
                @if (subtitle) {
                  <p class="mt-1 text-sm text-gray-500">{{ subtitle }}</p>
                }
              </div>

              <div class="flex items-center gap-2">
                <ng-content select="[slot=toolbar-left]"></ng-content>

                <!-- Density Control -->
                @if (showDensityControl) {
                  <erp-select
                    [options]="densityOptions"
                    [ngModel]="currentDensity()"
                    (selectionChange)="changeDensity($event)"
                    placeholder="Yoğunluk"
                    size="sm">
                  </erp-select>
                }

                <!-- Column Management -->
                @if (config.enableColumnVisibility) {
                  <erp-button
                    variant="outline"
                    size="sm"
                    (click)="showColumnManager()"
                  >
                    <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v10a2 2 0 01-2 2m-6 0a2 2 0 002 2h2a2 2 0 01-2-2m0 0V5a2 2 0 012-2h2" />
                    </svg>
                    Sütunlar
                  </erp-button>
                }

                <!-- Export -->
                @if (config.enableExport) {
                  <erp-button
                    variant="outline"
                    size="sm"
                    (click)="showExportMenu()"
                  >
                    <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Dışa Aktar
                  </erp-button>
                }

                <!-- Import -->
                @if (config.enableImport) {
                  <erp-button
                    variant="outline"
                    size="sm"
                    (click)="showImportDialog()"
                  >
                    <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    İçe Aktar
                  </erp-button>
                }

                <!-- Full Screen -->
                @if (config.enableFullScreen) {
                  <erp-button
                    variant="outline"
                    size="sm"
                    (click)="toggleFullScreen()"
                  >
                    <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </erp-button>
                }

                <!-- Refresh -->
                <erp-button
                  variant="outline"
                  size="sm"
                  (click)="refresh()"
                  [loading]="loading"
                >
                  <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </erp-button>

                <ng-content select="[slot=toolbar-right]"></ng-content>
              </div>
            </div>
          </div>
        }

        <!-- Search & Filter Row -->
        @if (config.enableGlobalSearch || config.enableAdvancedFilter || bulkOperations.length > 0) {
          <div class="px-6 py-3 border-t border-gray-200">
            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-4 flex-1">
                <!-- Global Search -->
                @if (config.enableGlobalSearch) {
                  <div class="flex-1 max-w-md">
                    <erp-input
                      [ngModel]="globalSearchTerm()"
                      (input)="onGlobalSearch($event)"
                      placeholder="{{ config.searchPlaceholder || 'Ara...' }}"
                      size="sm"
                      [prefixIcon]="true"
                    >
                      <svg slot="prefix-icon" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </erp-input>
                  </div>
                }

                <!-- Advanced Filter Toggle -->
                @if (config.enableAdvancedFilter) {
                  <erp-button
                    variant="outline"
                    size="sm"
                    [class.bg-primary-50 border-primary-300]="showAdvancedFilters()"
                    (click)="toggleAdvancedFilters()"
                  >
                    <svg slot="icon-left" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Gelişmiş Filtre
                    @if (activeFiltersCount() > 0) {
                      <span class="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                        {{ activeFiltersCount() }}
                      </span>
                    }
                  </erp-button>
                }

                <!-- Filter Chips -->
                @if (activeFilters().length > 0) {
                  <div class="flex items-center gap-2 flex-wrap">
                    @for (filter of activeFilters(); track filter.field) {
                      <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {{ filter.displayName }}: {{ filter.displayValue }}
                        <button (click)="removeFilter(filter.field)" class="hover:bg-blue-200 rounded-full p-0.5">
                          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    }
                    <erp-button variant="ghost" size="sm" (click)="clearAllFilters()">
                      Tümünü Temizle
                    </erp-button>
                  </div>
                }
              </div>

              <!-- Bulk Operations -->
              @if (selectedRows().length > 0 && bulkOperations.length > 0) {
                <div class="flex items-center gap-2">
                  <span class="text-sm text-gray-600 mr-2">
                    {{ selectedRows().length }} kayıt seçili
                  </span>
                  @for (operation of visibleBulkOperations(); track operation.label) {
                    <erp-button
                      [variant]="operation.variant || 'outline'"
                      size="sm"
                      [disabled]="bulkOperationDisabled"
                      (click)="executeBulkOperation(operation)"
                    >
                      @if (operation.icon) {
                        <span slot="icon-left">{{ operation.icon }}</span>
                      }
                      {{ operation.label }}
                    </erp-button>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Advanced Filters Panel -->
        @if (showAdvancedFilters() && config.enableAdvancedFilter) {
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (column of filterableColumns(); track column.field) {
                <div>
                  @switch (column.type) {
                    @case ('text') {
                      <erp-input
                        [label]="column.headerName"
                        [ngModel]="getFilterValue(column.field)"
                        (input)="setFilterFromEvent(column.field, $event, 'contains')"
                        placeholder="Filtrele..."
                        size="sm"
                      />
                    }
                    @case ('number') {
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">{{ column.headerName }}</label>
                        <div class="grid grid-cols-2 gap-2">
                          <erp-input
                            placeholder="Min"
                            type="number"
                            size="sm"
                            [ngModel]="getFilterValue(column.field, 'min')"
                            (input)="setRangeFilterFromEvent(column.field, 'min', $event)"
                          />
                          <erp-input
                            placeholder="Max"
                            type="number"
                            size="sm"
                            [ngModel]="getFilterValue(column.field, 'max')"
                            (input)="setRangeFilterFromEvent(column.field, 'max', $event)"
                          />
                        </div>
                      </div>
                    }
                    @case ('date') {
                      <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">{{ column.headerName }}</label>
                        <div class="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            class="block w-full rounded-md border-gray-300 text-sm"
                            [value]="getFilterValue(column.field, 'from')"
                            (change)="setDateRangeFilter(column.field, 'from', $event.target.value)"
                          />
                          <input
                            type="date"
                            class="block w-full rounded-md border-gray-300 text-sm"
                            [value]="getFilterValue(column.field, 'to')"
                            (change)="setDateRangeFilter(column.field, 'to', $event.target.value)"
                          />
                        </div>
                      </div>
                    }
                    @case ('boolean') {
                      <erp-select
                        [label]="column.headerName"
                        [options]="booleanFilterOptions"
                        [ngModel]="getFilterValue(column.field)"
                        (selectionChange)="setFilterFromSelect(column.field, $event, 'equals')"
                        size="sm"
                      />
                    }
                  }
                </div>
              }
            </div>
            <div class="mt-4 flex justify-end gap-2">
              <erp-button variant="outline" size="sm" (click)="clearAllFilters()">
                Temizle
              </erp-button>
              <erp-button variant="primary" size="sm" (click)="applyFilters()">
                Filtrele
              </erp-button>
            </div>
          </div>
        }
      </div>

      <!-- Loading State -->
      @if (loading()) {
        <div class="flex items-center justify-center py-12">
          <erp-loading type="spinner" size="lg" text="Yükleniyor..."></erp-loading>
        </div>
      } @else {
        <!-- Grid Container -->
        <div [style.height]="gridHeight()" [class]="gridContainerClasses()">
          <ag-grid-angular
            #agGrid
            [class]="gridThemeClass()"
            class="w-full h-full"
            [rowData]="config.serverSidePagination ? null : data"
            [columnDefs]="processedColumns()"
            [gridOptions]="gridOptions"
            [defaultColDef]="defaultColDef"
            [autoGroupColumnDef]="autoGroupColumnDef"
            [statusBar]="statusBar"
            [sideBar]="sideBar"
            [rowModelType]="config.serverSidePagination ? 'serverSide' : 'clientSide'"
            [serverSideDatasource]="serverSideDatasource"
            [paginationPageSize]="config.pageSize || 50"
            [cacheBlockSize]="config.cacheBlockSize || 100"
            [maxBlocksInCache]="config.maxBlocksInCache || 10"
            [rowBuffer]="config.rowBuffer || 10"
            [animateRows]="config.enableAnimations !== false"
            [enableRangeSelection]="true"
            [enableCharts]="true"
            [allowContextMenuWithControlKey]="true"
            [preventDefaultOnContextMenu]="true"
            (gridReady)="onGridReady($event)"
            (selectionChanged)="onSelectionChanged($event)"
            (cellClicked)="onCellClicked($event)"
            (cellEditingStopped)="onCellEditingStopped($event)"
            (filterChanged)="onFilterChanged($event)"
            (sortChanged)="onSortChanged($event)"
            (columnMoved)="onColumnMoved($event)"
            (columnResized)="onColumnResized($event)"
            (columnVisible)="onColumnVisible($event)"
            (paginationChanged)="onPaginationChanged($event)"
            (rowSelected)="onRowSelected($event)"
          >
          </ag-grid-angular>
        </div>
      }

      <!-- Footer Statistics -->
      @if (showFooterStats) {
        <div class="px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <span>
                <strong>{{ totalRecords() }}</strong> kayıt
                @if (filteredRecords() !== totalRecords()) {
                  <span class="text-gray-500">({{ filteredRecords() }} filtrelenmiş)</span>
                }
              </span>

              @if (selectedRows().length > 0) {
                <span>
                  <strong>{{ selectedRows().length }}</strong> seçili
                </span>
              }

              @if (aggregationData() && this.getObjectKeys(aggregationData()).length > 0) {
                @for (agg of this.getObjectEntries(aggregationData()); track agg[0]) {
                  <span>
                    {{ getColumnHeaderName(agg[0]) }}:
                    <strong>{{ formatAggregationValue(agg[0], agg[1]) }}</strong>
                  </span>
                }
              }
            </div>

            <div class="flex items-center gap-4">
              @if (lastUpdated) {
                <span class="text-xs">
                  Son güncelleme: {{ lastUpdated | date:'dd.MM.yyyy HH:mm' }}
                </span>
              }

              @if (config.enableRealTimeUpdates && isRealTimeActive()) {
                <div class="flex items-center gap-1 text-green-600">
                  <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span class="text-xs">Canlı</span>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && (!data || data.length === 0)) {
        <div class="flex flex-col items-center justify-center py-12">
          <svg class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H8.414a1 1 0 01-.707-.293L5.293 13.293A1 1 0 004.586 13H2" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">{{ emptyStateTitle || 'Veri bulunamadı' }}</h3>
          <p class="text-gray-500 text-center max-w-sm mb-4">
            {{ emptyStateMessage || 'Gösterilecek kayıt bulunmuyor. Filtrelerinizi kontrol edin veya yeni kayıt ekleyin.' }}
          </p>
          @if (showEmptyStateAction) {
            <ng-content select="[slot=empty-action]"></ng-content>
          }
        </div>
      }
    </div>

    <!-- Column Management Modal -->
    <erp-modal
      #columnModal
      title="Sütun Yönetimi"
      size="lg"
      [showFooter]="false"
    >
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-medium">Görünür Sütunlar</h4>
          <div class="flex gap-2">
            <erp-button variant="outline" size="sm" (click)="showAllColumns()">Tümünü Göster</erp-button>
            <erp-button variant="outline" size="sm" (click)="hideAllColumns()">Tümünü Gizle</erp-button>
          </div>
        </div>

        <div class="max-h-96 overflow-y-auto space-y-2">
          @for (column of managedColumns(); track column.field) {
            <div class="flex items-center justify-between p-2 border rounded">
              <erp-checkbox
                [label]="column.headerName"
                [ngModel]="column.visible"
                (ngModelChange)="toggleColumnVisibility(column.field, $event)"
              />
              <div class="flex items-center gap-2">
                @if (column.pinned) {
                  <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{{ column.pinned }}</span>
                }
                <erp-button variant="ghost" size="sm" (click)="resetColumnWidth(column.field)">
                  Sıfırla
                </erp-button>
              </div>
            </div>
          }
        </div>
      </div>
    </erp-modal>

    <!-- Export Modal -->
    <erp-modal
      #exportModal
      title="Veri Dışa Aktarma"
      confirmText="Dışa Aktar"
      (confirmed)="executeExport()"
    >
      <div class="space-y-4">
        <erp-select
          label="Format"
          [options]="exportFormatOptions"
          [(ngModel)]="exportFormat"
        />

        <erp-checkbox
          label="Sadece seçili kayıtlar"
          [(ngModel)]="exportOnlySelected"
        />

        <erp-checkbox
          label="Görünür sütunları dahil et"
          [(ngModel)]="exportVisibleOnly"
        />
      </div>
    </erp-modal>

    <!-- Import Modal -->
    <erp-modal
      #importModal
      title="Veri İçe Aktarma"
      size="lg"
      confirmText="İçe Aktar"
      (confirmed)="executeImport()"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Dosya Seç</label>
          <input
            type="file"
            #fileInput
            accept=".csv,.xlsx,.xls"
            (change)="onFileSelected($event)"
            class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>

        @if (importPreview().length > 0) {
          <div>
            <h4 class="font-medium mb-2">Önizleme (İlk 5 kayıt)</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full border border-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    @for (header of importHeaders(); track header) {
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase border-r">
                        {{ header }}
                      </th>
                    }
                  </tr>
                </thead>
                <tbody>
                  @for (row of importPreview().slice(0, 5); track $index) {
                    <tr class="border-t">
                      @for (cell of row; track $index) {
                        <td class="px-3 py-2 text-sm text-gray-900 border-r">
                          {{ cell }}
                        </td>
                      }
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </erp-modal>
  `,
  styles: [`
    .ag-theme-alpine {
      --ag-border-color: rgb(229, 231, 235);
      --ag-header-background-color: rgb(249, 250, 251);
      --ag-odd-row-background-color: rgb(249, 250, 251);
      --ag-row-hover-color: rgb(243, 244, 246);
      --ag-selected-row-background-color: rgb(239, 246, 255);
    }

    .ag-theme-compact .ag-row {
      height: 32px;
    }

    .ag-theme-comfortable .ag-row {
      height: 48px;
    }

    :host(.fullscreen) {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: white;
    }
  `]
})
export class DataGridComponent implements OnInit, OnDestroy {
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  @ViewChild('columnModal') columnModal!: ModalComponent;
  @ViewChild('exportModal') exportModal!: ModalComponent;
  @ViewChild('importModal') importModal!: ModalComponent;
  @ViewChild('fileInput') fileInput!: any;

  // Basic Props
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: any[] = [];
  @Input() columns: DataGridColumn[] = [];
  @Input() config: DataGridConfig = {};
  @Input() loading = signal(false);
  @Input() bulkOperations: BulkOperation[] = [];

  // Display Options
  @Input() showToolbar = true;
  @Input() showFooterStats = true;
  @Input() showDensityControl = true;
  @Input() showEmptyStateAction = false;
  @Input() emptyStateTitle = '';
  @Input() emptyStateMessage = '';
  @Input() lastUpdated?: Date;

  // Server-side Operations
  @Input() serverSideDatasource?: IServerSideDatasource;
  @Input() onServerSideFilter?: (params: any) => void;
  @Input() onServerSideSort?: (params: any) => void;

  // Events
  @Output() rowSelected = new EventEmitter<any[]>();
  @Output() cellClicked = new EventEmitter<any>();
  @Output() cellEdited = new EventEmitter<any>();
  @Output() refreshRequested = new EventEmitter<void>();
  @Output() exportRequested = new EventEmitter<any>();
  @Output() importRequested = new EventEmitter<any>();
  @Output() bulkOperationExecuted = new EventEmitter<{operation: BulkOperation, rows: any[]}>();
  @Output() stateChanged = new EventEmitter<GridState>();

  // State Signals
  selectedRows = signal<any[]>([]);
  globalSearchTerm = signal('');
  showAdvancedFilters = signal(false);
  currentDensity = signal<'compact' | 'normal' | 'comfortable'>('normal');
  activeFilters = signal<any[]>([]);
  totalRecords = signal(0);

  // Disabled state signals
  isExportDisabled = signal(true);
  bulkOperationDisabled = signal(false);
  exportCheckboxDisabled = signal(true);
  filteredRecords = signal(0);
  aggregationData = signal<Record<string, any>>({});
  isFullScreen = signal(false);
  isRealTimeActive = signal(false);
  managedColumns = signal<any[]>([]);
  importPreview = signal<any[]>([]);
  importHeaders = signal<string[]>([]);

  // Export/Import State
  exportFormat = 'csv';
  exportOnlySelected = false;
  exportVisibleOnly = true;

  private gridApi!: GridApi;
  private realTimeInterval?: any;

  // Grid Configuration
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    resizable: this.config.enableColumnResize !== false,
    sortable: this.config.enableSorting !== false,
    filter: this.config.enableFiltering !== false,
    floatingFilter: false,
    enableRowGroup: this.config.enableGrouping,
    enablePivot: false,
    enableValue: this.config.enableAggregation
  };

  autoGroupColumnDef: ColDef = {
    headerName: 'Grup',
    minWidth: 200,
    cellRendererParams: {
      suppressCount: false,
      checkbox: this.config.selectionMode === 'checkbox'
    }
  };

  statusBar = {
    statusPanels: [
      { statusPanel: 'agTotalAndFilteredRowCountComponent' },
      { statusPanel: 'agSelectedRowCountComponent' },
      { statusPanel: 'agAggregationComponent' }
    ]
  };

  sideBar = {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Sütunlar',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: !this.config.enableGrouping,
          suppressValues: !this.config.enableAggregation,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnFilter: false,
          suppressColumnSelectAll: false,
          suppressColumnExpandAll: false
        }
      },
      {
        id: 'filters',
        labelDefault: 'Filtreler',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel'
      }
    ]
  };

  gridOptions: GridOptions = {
    animateRows: this.config.enableAnimations !== false,
    enableCharts: true,
    enableRangeSelection: true,
    allowContextMenuWithControlKey: this.config.enableContextMenu !== false,
    preventDefaultOnContextMenu: this.config.enableContextMenu !== false,
    suppressRowClickSelection: this.config.selectionMode === 'checkbox',
    rowSelection: this.getRowSelectionMode(),
    // selectAllMode is deprecated in AG Grid v31+
    suppressCellFocus: false,
    enableCellTextSelection: true,
    ensureDomOrder: true,
    maintainColumnOrder: !this.config.enableColumnReorder,
    suppressColumnMoveAnimation: !this.config.enableAnimations,
    suppressRowHoverHighlight: false,
    suppressRowTransform: false,
    tooltipShowDelay: this.config.enableTooltips !== false ? 500 : Number.MAX_SAFE_INTEGER,
    pagination: this.config.enablePagination !== false,
    paginationPageSize: this.config.pageSize || 50,
    paginationPageSizeSelector: this.config.pageSizeOptions || [25, 50, 100, 200],
    domLayout: 'normal'
  };

  // Computed Properties
  densityOptions: SelectOption[] = [
    { value: 'compact', label: 'Sıkışık' },
    { value: 'normal', label: 'Normal' },
    { value: 'comfortable', label: 'Rahat' }
  ];

  booleanFilterOptions: SelectOption[] = [
    { value: '', label: 'Tümü' },
    { value: true, label: 'Evet' },
    { value: false, label: 'Hayır' }
  ];

  exportFormatOptions: SelectOption[] = [
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' },
    { value: 'pdf', label: 'PDF' }
  ];

  processedColumns = computed(() => {
    return this.columns.map((col, index) => this.processColumn(col, index));
  });

  filterableColumns = computed(() => {
    return this.columns.filter(col => col.searchable !== false && col.type !== 'actions');
  });

  visibleBulkOperations = computed(() => {
    return this.bulkOperations.filter(op => !op.visible || op.visible(this.selectedRows()));
  });

  activeFiltersCount = computed(() => {
    return this.activeFilters().length;
  });

  gridHeight = computed(() => {
    if (this.config.height) return this.config.height;
    if (this.isFullScreen()) return '100vh';
    return '500px';
  });

  gridThemeClass = computed(() => {
    const theme = this.config.theme || 'alpine';
    const density = this.currentDensity();
    return `ag-theme-${theme} ag-theme-${density}`;
  });

  gridContainerClasses = computed(() => {
    const classes = [];
    if (this.isFullScreen()) classes.push('fixed inset-0 z-50');
    return classes.join(' ');
  });

  ngOnInit(): void {
    this.initializeConfiguration();
    this.setupRealTimeUpdates();
    this.loadSavedState();
    this.isExportDisabled.set(this.selectedRows().length === 0);
    this.bulkOperationDisabled.set(this.selectedRows().length === 0);
    this.exportCheckboxDisabled.set(this.selectedRows().length === 0);
  }

  ngOnDestroy(): void {
    this.stopRealTimeUpdates();
    this.saveCurrentState();
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  private initializeConfiguration(): void {
    // Set default configuration
    this.config = {
      enableSelection: true,
      selectionMode: 'multiple',
      enableSorting: true,
      enableFiltering: true,
      enableColumnResize: true,
      enableColumnReorder: true,
      enablePagination: true,
      pageSize: 50,
      enableExport: true,
      exportFormats: ['csv', 'excel'],
      enableVirtualization: true,
      enableAnimations: true,
      enableTooltips: true,
      density: 'normal',
      theme: 'alpine',
      ...this.config
    };

    this.currentDensity.set(this.config.density || 'normal');
  }

  private getRowSelectionMode(): 'single' | 'multiple' | undefined {
    if (!this.config.enableSelection) return undefined;
    return this.config.selectionMode === 'single' ? 'single' : 'multiple';
  }

  // Grid Events
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.updateManagedColumns();

    if (this.config.autoSizeColumns) {
      this.gridApi.sizeColumnsToFit();
    }

    this.updateRecordCounts();
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    const selectedRows = event.api.getSelectedRows();
    this.selectedRows.set(selectedRows);
    this.isExportDisabled.set(selectedRows.length === 0);
    this.bulkOperationDisabled.set(selectedRows.length === 0);
    this.exportCheckboxDisabled.set(selectedRows.length === 0);
    this.rowSelected.emit(selectedRows);
  }

  onCellClicked(event: CellClickedEvent): void {
    this.cellClicked.emit({
      data: event.data,
      field: event.colDef.field,
      value: event.value,
      rowIndex: event.rowIndex
    });
  }

  onCellEditingStopped(event: CellEditingStoppedEvent): void {
    if (event.valueChanged) {
      this.cellEdited.emit({
        data: event.data,
        field: event.colDef.field,
        oldValue: event.oldValue,
        newValue: event.newValue,
        rowIndex: event.rowIndex
      });
    }
  }

  onFilterChanged(event: FilterChangedEvent): void {
    this.updateActiveFilters();
    this.updateRecordCounts();
    this.saveCurrentState();
  }

  onSortChanged(event: SortChangedEvent): void {
    this.saveCurrentState();
  }

  onColumnMoved(event: ColumnMovedEvent): void {
    this.updateManagedColumns();
    this.saveCurrentState();
  }

  onColumnResized(event: ColumnResizedEvent): void {
    this.saveCurrentState();
  }

  onColumnVisible(event: ColumnVisibleEvent): void {
    this.updateManagedColumns();
    this.saveCurrentState();
  }

  onPaginationChanged(event: PaginationChangedEvent): void {
    this.updateRecordCounts();
  }

  onRowSelected(event: RowSelectedEvent): void {
    // Handle individual row selection if needed
  }

  // Continuing in next part due to length...

  private processColumn(column: DataGridColumn, index: number): ColDef {
    const processedCol: ColDef = {
      ...column,
      sortable: this.config.enableSorting !== false && column.sortable !== false,
      filter: this.config.enableFiltering !== false && column.filter !== false,
      resizable: this.config.enableColumnResize !== false,
      lockPosition: this.config.enableColumnReorder === false,
      editable: this.config.enableInlineEdit && column.editable,
      pinned: column.sticky,
      enableRowGroup: this.config.enableGrouping && column.groupable,
      enableValue: !!(this.config.enableAggregation && column.aggregation),
      aggFunc: column.aggregation
    };

    // Apply column type-specific configurations
    this.applyColumnTypeConfig(processedCol, column);

    return processedCol;
  }

  private applyColumnTypeConfig(processedCol: ColDef, originalCol: DataGridColumn): void {
    switch (originalCol.type) {
      case 'number':
      case 'currency':
      case 'percentage':
        processedCol.cellClass = 'text-right';
        processedCol.headerClass = 'text-right';
        processedCol.filter = 'agNumberColumnFilter';
        if (originalCol.type === 'currency') {
          processedCol.valueFormatter = (params) =>
            params.value != null ? new Intl.NumberFormat('tr-TR', {
              style: 'currency', currency: 'TRY'
            }).format(params.value) : '';
        } else if (originalCol.type === 'percentage') {
          processedCol.valueFormatter = (params) =>
            params.value != null ? (params.value * 100).toFixed(2) + '%' : '';
        }
        break;

      case 'date':
        processedCol.filter = 'agDateColumnFilter';
        processedCol.valueFormatter = (params) =>
          params.value ? new Date(params.value).toLocaleDateString('tr-TR') : '';
        break;

      case 'datetime':
        processedCol.filter = 'agDateColumnFilter';
        processedCol.valueFormatter = (params) =>
          params.value ? new Date(params.value).toLocaleString('tr-TR') : '';
        break;

      case 'boolean':
        processedCol.cellRenderer = (params: any) => params.value ? '✓' : '✗';
        processedCol.cellClass = 'text-center';
        processedCol.headerClass = 'text-center';
        processedCol.filter = false;
        break;

      case 'email':
        processedCol.cellRenderer = (params: any) =>
          params.value ? `<a href="mailto:${params.value}" class="text-blue-600 hover:underline">${params.value}</a>` : '';
        break;

      case 'phone':
        processedCol.cellRenderer = (params: any) =>
          params.value ? `<a href="tel:${params.value}" class="text-blue-600 hover:underline">${params.value}</a>` : '';
        break;

      case 'url':
        processedCol.cellRenderer = (params: any) =>
          params.value ? `<a href="${params.value}" target="_blank" class="text-blue-600 hover:underline">Bağlantı</a>` : '';
        break;

      case 'status':
        processedCol.cellRenderer = (params: any) => this.createStatusRenderer(params);
        processedCol.cellClass = 'text-center';
        break;

      case 'actions':
        processedCol.cellRenderer = (params: any) => this.createActionsRenderer(params, originalCol.actions || []);
        processedCol.sortable = false;
        processedCol.filter = false;
        processedCol.pinned = 'right';
        processedCol.width = (originalCol.actions?.length || 1) * 40 + 20;
        processedCol.flex = 0;
        break;
    }
  }

  private createStatusRenderer(params: any): string {
    if (!params.value) return '';

    const statusColors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800',
      'success': 'bg-green-100 text-green-800',
      'warning': 'bg-orange-100 text-orange-800'
    };

    const colorClass = statusColors[params.value.toLowerCase()] || 'bg-gray-100 text-gray-800';

    return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}">
      ${params.value}
    </span>`;
  }

  private createActionsRenderer(params: any, actions: DataGridAction[]): string {
    const visibleActions = actions.filter(action =>
      !action.visible || action.visible(params.data)
    );

    return visibleActions.map(action => {
      const disabled = action.disabled ? action.disabled(params.data) : false;
      const variant = action.variant || 'ghost';
      const tooltip = action.tooltip || action.label;

      return `
        <button
          class="inline-flex items-center justify-center h-8 w-8 rounded text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${this.getActionButtonClasses(variant)} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}"
          ${disabled ? 'disabled' : ''}
          onclick="window.gridActionHandler && window.gridActionHandler('${action.label}', ${JSON.stringify(params.data).replace(/"/g, '&quot;')})"
          title="${tooltip}"
        >
          ${action.icon || action.label.charAt(0)}
        </button>
      `;
    }).join('');
  }

  private getActionButtonClasses(variant: string): string {
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
      case 'secondary':
        return 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500';
      case 'outline':
        return 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500';
      case 'destructive':
        return 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500';
      case 'ghost':
      default:
        return 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500';
    }
  }

  // Search and Filter Methods
  onGlobalSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const term = target?.value || '';
    this.globalSearchTerm.set(term);
    if (this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', term);
    }
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update(show => !show);
  }

  setFilterFromEvent(field: string, event: Event, operator: string = 'contains'): void {
    const target = event.target as HTMLInputElement;
    const value = target?.value || '';
    this.setFilter(field, value, operator);
  }

  setFilterFromSelect(field: string, option: SelectOption | SelectOption[], operator: string = 'equals'): void {
    if (Array.isArray(option)) return; // Multiple selection not supported for filters
    this.setFilter(field, option.value, operator);
  }

  setFilter(field: string, value: any, operator: string = 'contains'): void {
    if (this.gridApi) {
      const filterInstance = this.gridApi.getFilterInstance(field);
      if (filterInstance) {
        if (value === '' || value === null || value === undefined) {
          (filterInstance as any).setModel(null);
        } else {
          (filterInstance as any).setModel({
            filterType: operator,
            filter: value
          });
        }
        this.gridApi.onFilterChanged();
      }
    }
  }

  setRangeFilterFromEvent(field: string, type: 'min' | 'max', event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target?.value || '';
    this.setRangeFilter(field, type, value);
  }

  setRangeFilter(field: string, type: 'min' | 'max', value: string): void {
    if (this.gridApi) {
      const filterInstance = this.gridApi.getFilterInstance(field);
      if (filterInstance) {
        const currentModel = (filterInstance as any).getModel() || {};
        currentModel[type === 'min' ? 'filter' : 'filterTo'] = value;
        currentModel.filterType = 'inRange';
        (filterInstance as any).setModel(currentModel);
        this.gridApi.onFilterChanged();
      }
    }
  }


  setDateRangeFilter(field: string, type: 'from' | 'to', value: string): void {
    if (this.gridApi) {
      const filterInstance = this.gridApi.getFilterInstance(field);
      if (filterInstance) {
        const currentModel = (filterInstance as any).getModel() || {};
        currentModel[type === 'from' ? 'dateFrom' : 'dateTo'] = value;
        currentModel.filterType = 'inRange';
        (filterInstance as any).setModel(currentModel);
        this.gridApi.onFilterChanged();
      }
    }
  }

  getFilterValue(field: string, subField?: string): any {
    if (!this.gridApi) return '';
    const filterInstance = this.gridApi.getFilterInstance(field);
    if (!filterInstance) return '';

    const model = (filterInstance as any).getModel();
    if (!model) return '';

    if (subField) {
      return model[subField] || '';
    }

    return model.filter || model.dateFrom || '';
  }

  removeFilter(field: string): void {
    if (this.gridApi) {
      const filterInstance = this.gridApi.getFilterInstance(field);
      if (filterInstance) {
        (filterInstance as any).setModel(null);
        this.gridApi.onFilterChanged();
      }
    }
  }

  clearAllFilters(): void {
    if (this.gridApi) {
      this.gridApi.setFilterModel(null);
      this.globalSearchTerm.set('');
      this.gridApi.setGridOption('quickFilterText', '');
    }
  }

  applyFilters(): void {
    // Filters are applied automatically on change
    this.showAdvancedFilters.set(false);
  }

  private updateActiveFilters(): void {
    if (!this.gridApi) return;

    const filterModel = this.gridApi.getFilterModel();
    const filters = Object.keys(filterModel).map(field => {
      const column = this.columns.find(col => col.field === field);
      const filter = filterModel[field];

      return {
        field,
        displayName: column?.headerName || field,
        displayValue: this.getFilterDisplayValue(filter),
        filter
      };
    });

    this.activeFilters.set(filters);
  }

  private getFilterDisplayValue(filter: any): string {
    if (filter.filter !== undefined) {
      return String(filter.filter);
    }
    if (filter.dateFrom || filter.dateTo) {
      const from = filter.dateFrom ? new Date(filter.dateFrom).toLocaleDateString('tr-TR') : '';
      const to = filter.dateTo ? new Date(filter.dateTo).toLocaleDateString('tr-TR') : '';
      return `${from} - ${to}`;
    }
    return 'Filtrelenmiş';
  }

  // Column Management
  showColumnManager(): void {
    this.updateManagedColumns();
    this.columnModal.open();
  }

  private updateManagedColumns(): void {
    if (!this.gridApi) return;

    const columnDefs = this.gridApi.getColumnDefs() || [];
    const managedColumns = columnDefs
      .filter((col: any) => col.field && col.field !== 'actions')
      .map((col: any) => ({
        field: col.field,
        headerName: col.headerName,
        visible: this.gridApi.getColumn(col.field)?.isVisible() || false,
        pinned: this.gridApi.getColumn(col.field)?.getPinned(),
        width: this.gridApi.getColumn(col.field)?.getActualWidth()
      }));

    this.managedColumns.set(managedColumns);
  }

  toggleColumnVisibility(field: string, visible: boolean): void {
    if (this.gridApi) {
      this.gridApi.setColumnVisible(field, visible);
      this.updateManagedColumns();
    }
  }

  showAllColumns(): void {
    if (this.gridApi) {
      this.managedColumns().forEach(col => {
        this.gridApi.setColumnVisible(col.field, true);
      });
      this.updateManagedColumns();
    }
  }

  hideAllColumns(): void {
    if (this.gridApi) {
      this.managedColumns().forEach(col => {
        this.gridApi.setColumnVisible(col.field, false);
      });
      this.updateManagedColumns();
    }
  }

  resetColumnWidth(field: string): void {
    if (this.gridApi) {
      const column = this.gridApi.getColumn(field);
      if (column) {
        this.gridApi.autoSizeColumn(field);
      }
    }
  }

  // Export Methods
  showExportMenu(): void {
    this.exportModal.open();
  }

  executeExport(): void {
    if (!this.gridApi) return;

    const params: any = {
      fileName: `${this.title || 'data'}-${new Date().toISOString().split('T')[0]}`
    };

    if (this.exportOnlySelected && this.selectedRows().length > 0) {
      params.onlySelected = true;
    }

    if (this.exportVisibleOnly) {
      params.onlyFilteredAndSorted = true;
    }

    switch (this.exportFormat) {
      case 'csv':
        this.gridApi.exportDataAsCsv(params);
        break;
      case 'excel':
        this.gridApi.exportDataAsExcel(params);
        break;
      case 'pdf':
        // PDF export would require additional implementation
        console.warn('PDF export not implemented yet');
        break;
    }

    this.exportRequested.emit({
      format: this.exportFormat,
      onlySelected: this.exportOnlySelected,
      visibleOnly: this.exportVisibleOnly,
      data: this.exportOnlySelected ? this.selectedRows() : this.data
    });

    this.exportModal.close();
  }

  // Import Methods
  showImportDialog(): void {
    this.importModal.open();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.parseImportFile(content, file.name);
    };
    reader.readAsText(file);
  }

  private parseImportFile(content: string, fileName: string): void {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line =>
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    this.importHeaders.set(headers);
    this.importPreview.set(data);
  }

  executeImport(): void {
    const importData = {
      headers: this.importHeaders(),
      data: this.importPreview()
    };

    this.importRequested.emit(importData);
    this.importModal.close();

    // Reset import state
    this.importHeaders.set([]);
    this.importPreview.set([]);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Bulk Operations
  getBulkOperationDisabled(operation: BulkOperation): boolean {
    return operation.disabled?.(this.selectedRows()) || false;
  }

  getExportDisabled(): boolean {
    return this.selectedRows().length === 0;
  }

  executeBulkOperation(operation: BulkOperation): void {
    const selectedRows = this.selectedRows();

    if (operation.confirmMessage) {
      if (!confirm(operation.confirmMessage)) return;
    }

    operation.action(selectedRows);
    this.bulkOperationExecuted.emit({ operation, rows: selectedRows });
  }

  // Utility Methods
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getObjectEntries(obj: any): [string, any][] {
    return Object.entries(obj || {});
  }

  refresh(): void {
    if (this.gridApi) {
      if (this.config.serverSidePagination) {
        this.gridApi.refreshServerSide();
      } else {
        this.gridApi.refreshCells();
      }
    }
    this.refreshRequested.emit();
  }

  changeDensity(option: SelectOption | SelectOption[]): void {
    if (Array.isArray(option)) return; // Multiple selection not supported for density
    const density = option.value as 'compact' | 'normal' | 'comfortable';
    this.currentDensity.set(density);
    // Apply density classes to grid
    if (this.agGrid?.api) {
      this.agGrid.api.refreshHeader();
      this.agGrid.api.refreshCells();
    }
  }

  toggleFullScreen(): void {
    this.isFullScreen.update(fullScreen => !fullScreen);

    if (this.isFullScreen()) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Resize grid after fullscreen toggle
    setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.sizeColumnsToFit();
      }
    }, 100);
  }

  private updateRecordCounts(): void {
    if (!this.gridApi) return;

    this.totalRecords.set(this.gridApi.getDisplayedRowCount());
    this.filteredRecords.set(this.gridApi.getDisplayedRowCount());
  }

  getColumnHeaderName(field: string): string {
    const column = this.columns.find(col => col.field === field);
    return column?.headerName || field;
  }

  formatAggregationValue(field: string, value: any): string {
    const column = this.columns.find(col => col.field === field);
    if (!column) return String(value);

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY'
        }).format(value);
      case 'percentage':
        return (value * 100).toFixed(2) + '%';
      case 'number':
        return new Intl.NumberFormat('tr-TR').format(value);
      default:
        return String(value);
    }
  }

  // Real-time Updates
  private setupRealTimeUpdates(): void {
    if (this.config.enableRealTimeUpdates) {
      this.startRealTimeUpdates();
    }
  }

  private startRealTimeUpdates(): void {
    const frequency = this.config.updateFrequency || 30000; // 30 seconds default

    this.realTimeInterval = setInterval(() => {
      this.refresh();
    }, frequency);

    this.isRealTimeActive.set(true);
  }

  private stopRealTimeUpdates(): void {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = undefined;
    }
    this.isRealTimeActive.set(false);
  }

  // State Management
  private loadSavedState(): void {
    if (!this.config.enableStateManagement || !this.config.statePersistenceKey) return;

    const savedState = localStorage.getItem(this.config.statePersistenceKey);
    if (savedState) {
      try {
        const state: GridState = JSON.parse(savedState);
        // Apply saved state when grid is ready
        setTimeout(() => this.applyGridState(state), 100);
      } catch (error) {
        console.warn('Failed to load grid state:', error);
      }
    }
  }

  private saveCurrentState(): void {
    if (!this.config.enableStateManagement || !this.config.statePersistenceKey || !this.gridApi) return;

    const state: GridState = {
      columns: this.gridApi.getColumnState(),
      filters: this.gridApi.getFilterModel(),
      sort: this.gridApi.getColumnState().filter(col => col.sort !== null),
      grouping: this.gridApi.getColumnGroupState()
    };

    localStorage.setItem(this.config.statePersistenceKey, JSON.stringify(state));
    this.stateChanged.emit(state);
  }

  private applyGridState(state: GridState): void {
    if (!this.gridApi) return;

    if (state.columns) {
      this.gridApi.applyColumnState({ state: state.columns });
    }

    if (state.filters) {
      this.gridApi.setFilterModel(state.filters);
    }

    if (state.sort) {
      this.gridApi.applyColumnState({ state: state.sort, applyOrder: true });
    }

    if (state.grouping) {
      // Apply column group state
      if (Array.isArray(state.grouping)) {
        state.grouping.forEach((group: any) => {
          this.gridApi.setColumnGroupOpened(group.groupId, group.open);
        });
      }
    }
  }

  // Public API Methods
  selectAll(): void {
    if (this.gridApi) {
      this.gridApi.selectAll();
    }
  }

  deselectAll(): void {
    if (this.gridApi) {
      this.gridApi.deselectAll();
    }
  }

  getSelectedData(): any[] {
    return this.selectedRows();
  }

  exportToCsv(filename?: string): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsCsv({
        fileName: filename || `${this.title || 'data'}.csv`
      });
    }
  }

  exportToExcel(filename?: string): void {
    if (this.gridApi) {
      this.gridApi.exportDataAsExcel({
        fileName: filename || `${this.title || 'data'}.xlsx`
      });
    }
  }

  autoSizeAllColumns(): void {
    if (this.gridApi) {
      this.gridApi.autoSizeAllColumns();
    }
  }

  sizeColumnsToFit(): void {
    if (this.gridApi) {
      this.gridApi.sizeColumnsToFit();
    }
  }
}