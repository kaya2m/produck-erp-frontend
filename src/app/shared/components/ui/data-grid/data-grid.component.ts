import { Component, Input, Output, EventEmitter, ViewChild, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, Table, TableLazyLoadEvent, TablePageEvent, TableRowSelectEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';

// Column Definition
export interface DataGridColumn {
  field: string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'status' | 'currency' | 'actions';
  sortable?: boolean;
  filterable?: boolean;
  filterMatchMode?: 'startsWith' | 'contains' | 'notContains' | 'endsWith' | 'equals' | 'notEquals' | 'in';
  filterType?: 'text' | 'numeric' | 'date' | 'boolean';
  width?: string;
  frozen?: boolean;
  alignFrozen?: 'left' | 'right';
  hidden?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  exportable?: boolean;
  actions?: DataGridAction[];
}

// Action Definition
export interface DataGridAction {
  label: string;
  icon?: string;
  command: (data: any) => void;
  disabled?: (data: any) => boolean;
  visible?: (data: any) => boolean;
  showInContextMenu?: boolean; // Context menüde gösterilsin mi?
}

// Custom Button Definition (for page-specific buttons)
export interface DataGridButton {
  label: string;
  icon?: string;
  severity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
  command: () => void;
  disabled?: boolean;
  visible?: boolean;
  showInContextMenu?: boolean; // Context menüde de gösterilsin mi?
}

// Configuration
export interface DataGridConfig {
  // Pagination
  paginator?: boolean;
  rows?: number;
  rowsPerPageOptions?: number[];
  showCurrentPageReport?: boolean;
  currentPageReportTemplate?: string;

  // Selection
  selectionMode?: 'single' | 'multiple' | null;
  dataKey?: string;
  metaKeySelection?: boolean;

  // Sorting
  sortMode?: 'single' | 'multiple';
  sortField?: string;
  sortOrder?: number;

  // Filtering
  filterDelay?: number;
  globalFilterFields?: string[];

  // Display
  responsive?: boolean;
  responsiveLayout?: 'scroll' | 'stack';
  breakpoint?: string;
  showGridlines?: boolean;
  stripedRows?: boolean;
  size?: 'small' | 'normal' | 'large';

  // Features
  resizableColumns?: boolean;
  columnResizeMode?: 'fit' | 'expand';
  reorderableColumns?: boolean;
  scrollable?: boolean;
  scrollHeight?: string;
  virtualScroll?: boolean;
  virtualScrollItemSize?: number;
  frozenValue?: any[];

  // Row
  rowHover?: boolean;
  rowClass?: (data: any) => string;

  // State
  stateStorage?: 'session' | 'local';
  stateKey?: string;

  // Export
  exportFilename?: string;

  // Loading
  loading?: boolean;
  loadingIcon?: string;

  // Lazy Loading
  lazy?: boolean;
  totalRecords?: number;
}

@Component({
  selector: 'erp-data-grid',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    CheckboxModule,
    DialogModule,
    TagModule,
    TooltipModule,
    ContextMenuModule,
    DatePickerModule
  ],
  templateUrl: './data-grid.component.html',
  styleUrl: './data-grid.component.scss'
})
export class DataGridComponent implements OnInit {
  @ViewChild('dt') table!: Table;
  @ViewChild('cm') contextMenu!: ContextMenu;

  // Data
  @Input() value: any[] = [];
  @Input() set columns(cols: DataGridColumn[]) {
    this._columns = cols;
    this.updateVisibleColumns();
  }
  get columns(): DataGridColumn[] {
    return this._columns;
  }
  private _columns: DataGridColumn[] = [];
  @Input() config: DataGridConfig = {};
  @Input() customButtons: DataGridButton[] = []; // Her sayfaya özel butonlar

  // Loading
  @Input() loading = signal(false);

  // Events
  @Output() selectionChange = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<TableRowSelectEvent>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() page = new EventEmitter<TablePageEvent>();
  @Output() sort = new EventEmitter<any>();
  @Output() filter = new EventEmitter<any>();
  @Output() lazyLoad = new EventEmitter<TableLazyLoadEvent>();
  @Output() colReorder = new EventEmitter<any>();
  @Output() colResize = new EventEmitter<any>();
  @Output() stateRestore = new EventEmitter<any>();
  @Output() stateSave = new EventEmitter<any>();

  // State
  selectedRows = signal<any>(null);
  globalFilterValue = signal('');
  first = signal(0);
  contextMenuItems = signal<MenuItem[]>([]);
  selectedRowData: any = null;
  selectedColumns: DataGridColumn[] = [];
  _visibleColumns: DataGridColumn[] = [];
  columnDialogVisible = signal(false);

  // Getter for visible columns
  visibleColumns(): DataGridColumn[] {
    return this._visibleColumns;
  }

  actionsColumn = computed(() =>
    this._columns.find(col => col.type === 'actions')
  );

  hasActions = computed(() => !!this.actionsColumn());

  columnOptions = computed(() =>
    this._columns.filter(col => col.type !== 'actions')
  );

  ngOnInit(): void {
    this.initializeDefaults();
    this.updateVisibleColumns();
  }

  private initializeDefaults(): void {
    // Set default config values
    if (!this.config.paginator) this.config.paginator = true;
    if (!this.config.rows) this.config.rows = 10;
    if (!this.config.rowsPerPageOptions) this.config.rowsPerPageOptions = [10, 25, 50];
    if (!this.config.showCurrentPageReport) this.config.showCurrentPageReport = true;
    if (!this.config.currentPageReportTemplate) {
      this.config.currentPageReportTemplate = '{first} - {last} / {totalRecords}';
    }
    if (!this.config.dataKey) this.config.dataKey = 'id';
    if (!this.config.filterDelay) this.config.filterDelay = 300;
    if (!this.config.rowHover) this.config.rowHover = true;
    if (this.config.size === undefined) this.config.size = 'small';
  }

  // Global Filter
  onGlobalFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.globalFilterValue.set(value);
    this.table.filterGlobal(value, 'contains');
  }

  clearGlobalFilter(): void {
    this.globalFilterValue.set('');
    this.table.filterGlobal('', 'contains');
  }

  // Selection
  onSelectionChange(selection: any): void {
    this.selectedRows.set(selection);
    this.selectionChange.emit(selection);
  }

  onRowSelect(event: TableRowSelectEvent): void {
    this.rowSelect.emit(event);
  }

  onRowUnselect(event: any): void {
    this.rowUnselect.emit(event);
  }

  // Context Menu
  onRowContextMenu(event: MouseEvent, rowData: any): void {
    this.selectedRowData = rowData;
    const menuItems: MenuItem[] = [];

    // Row-specific actions from column definition
    if (this.hasActions()) {
      const actions = this.actionsColumn()?.actions || [];
      const rowActions = actions
        .filter(action => action.showInContextMenu !== false)
        .filter(action => !action.visible || action.visible(rowData))
        .map(action => ({
          label: action.label,
          icon: action.icon,
          disabled: action.disabled ? action.disabled(rowData) : false,
          command: () => action.command(rowData)
        }));

      menuItems.push(...rowActions);
    }

    // Custom buttons that are marked for context menu
    const contextMenuButtons = this.customButtons
      .filter(btn => btn.showInContextMenu && (btn.visible !== false))
      .map(btn => ({
        label: btn.label,
        icon: btn.icon,
        disabled: btn.disabled || false,
        command: () => btn.command()
      }));

    if (contextMenuButtons.length > 0) {
      if (menuItems.length > 0) {
        menuItems.push({ separator: true });
      }
      menuItems.push(...contextMenuButtons);
    }

    if (menuItems.length > 0) {
      this.contextMenuItems.set(menuItems);
      this.contextMenu.show(event);
    }
  }

  // Pagination
  onPage(event: TablePageEvent): void {
    this.first.set(event.first);
    this.page.emit(event);
  }

  // Sorting
  onSort(event: any): void {
    this.sort.emit(event);
  }

  // Filtering
  onFilter(event: any): void {
    this.filter.emit(event);
  }

  // Lazy Loading
  onLazyLoad(event: TableLazyLoadEvent): void {
    this.lazyLoad.emit(event);
  }

  // Column Reorder
  onColReorder(event: any): void {
    this.colReorder.emit(event);
  }

  // Column Resize
  onColResize(event: any): void {
    this.colResize.emit(event);
  }

  // State
  onStateRestore(event: any): void {
    this.stateRestore.emit(event);
  }

  onStateSave(event: any): void {
    this.stateSave.emit(event);
  }

  // Export
  exportCSV(): void {
    this.table.exportCSV();
  }

  exportExcel(): void {
    // Excel export would require xlsx library
    // For now, fallback to CSV
    console.log('Excel export not implemented. Using CSV instead.');
    this.exportCSV();
  }

  // Reset
  reset(): void {
    this.table.reset();
    this.globalFilterValue.set('');
    this.first.set(0);
  }

  // Utility Methods
  getStatusSeverity(value: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (typeof value === 'boolean') {
      return value ? 'success' : 'secondary';
    }
    if (typeof value === 'string') {
      const normalized = value.toLowerCase();
      if (['active', 'aktif', 'success'].includes(normalized)) return 'success';
      if (['inactive', 'pasif', 'disabled'].includes(normalized)) return 'secondary';
      if (['pending', 'beklemede', 'warning'].includes(normalized)) return 'warn';
      if (['error', 'hata', 'danger'].includes(normalized)) return 'danger';
    }
    return 'info';
  }

  getStatusLabel(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'Aktif' : 'Pasif';
    }
    return String(value || '');
  }

  formatCurrency(value: any): string {
    if (value == null) return '';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
  }

  formatDate(value: any): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString('tr-TR');
  }

  getTableStyleClass(): string {
    const classes: string[] = [];

    if (this.config.size === 'small') classes.push('p-datatable-sm');
    if (this.config.size === 'large') classes.push('p-datatable-lg');
    if (this.config.stripedRows) classes.push('p-datatable-striped');
    if (this.config.showGridlines) classes.push('p-datatable-gridlines');

    return classes.join(' ');
  }

  hasFilterableColumns(columns: DataGridColumn[]): boolean {
    return columns.some(col => col.filterable !== false);
  }

  getSelectedCount(): number {
    const selection = this.selectedRows();
    if (!selection) return 0;
    return Array.isArray(selection) ? selection.length : 1;
  }

  onColumnToggle(selectedCols: DataGridColumn[]): void {
    // Mark all columns as hidden first
    this._columns.forEach(col => {
      if (col.type !== 'actions') {
        col.hidden = true;
      }
    });

    // Mark selected columns as visible
    selectedCols.forEach(selectedCol => {
      const col = this._columns.find(c => c.field === selectedCol.field);
      if (col) {
        col.hidden = false;
      }
    });

    // Update visible columns
    this.updateVisibleColumns();
  }

  updateVisibleColumns(): void {
    const visible = this._columns.filter(col => !col.hidden && col.type !== 'actions');
    this._visibleColumns = visible;
    this.selectedColumns = [...visible];
  }

  onColumnCheckboxChange(): void {
    this.updateVisibleColumns();
  }

  onColumnVisibilityChange(col: DataGridColumn, visible: boolean): void {
    col.hidden = !visible;
    this.updateVisibleColumns();
  }

  toggleColumnDialog(): void {
    this.columnDialogVisible.set(!this.columnDialogVisible());
  }

}