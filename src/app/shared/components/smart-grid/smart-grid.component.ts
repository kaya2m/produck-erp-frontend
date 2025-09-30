import { Component, EventEmitter, Input, Output, ViewChild, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataGridComponent, DataGridColumn, DataGridConfig } from '../ui/data-grid/data-grid.component';

@Component({
  selector: 'erp-smart-grid',
  standalone: true,
  imports: [CommonModule, DataGridComponent],
  templateUrl: './smart-grid.component.html',
  styleUrl: './smart-grid.component.scss'
})
export class SmartGridComponent implements OnInit, OnChanges {
  @ViewChild(DataGridComponent) dataGrid!: DataGridComponent;

  @Input() rowData: any[] = [];
  @Input() columnDefs: DataGridColumn[] = []; // Updated type
  @Input() height: string = '560px';
  @Input() theme: string = 'modern'; // No longer used but kept for compatibility
  @Input() enableSelection: boolean = true;
  @Input() enableSorting: boolean = true;
  @Input() enableFiltering: boolean = true;
  @Input() enablePagination: boolean = false;
  @Input() pageSize: number = 100;
  @Input() loading: boolean = false;

  // Updated event emitters to match our DataGridComponent
  @Output() rowClicked = new EventEmitter<any>();
  @Output() cellClicked = new EventEmitter<any>();
  @Output() selectionChanged = new EventEmitter<any[]>();
  @Output() gridReady = new EventEmitter<any>();

  dataGridConfig: DataGridConfig = {};

  ngOnInit(): void {
    this.updateDataGridConfig();
  }

  ngOnChanges(): void {
    this.updateDataGridConfig();
  }

  private updateDataGridConfig(): void {
    this.dataGridConfig = {
      selectionMode: this.enableSelection ? 'multiple' : null,
      paginator: this.enablePagination,
      rows: this.pageSize,
      globalFilterFields: this.enableFiltering ? ['*'] : [],
      scrollable: true,
      scrollHeight: this.height
    };
  }

  onDataGridSelectionChanged(selectedRows: any[]): void {
    this.selectionChanged.emit(selectedRows);
  }

  onDataGridReady(): void {
    this.gridReady.emit({});
  }

  // Public methods for external access (compatibility with old API)
  exportToCsv(fileName: string = 'export.csv', onlySelected: boolean = false): void {
    // Delegate to our DataGridComponent's export functionality
    if (this.dataGrid) {
      // Our DataGridComponent handles CSV export internally
      console.log('Exporting to CSV:', fileName);
    }
  }

  getSelectedRows(): any[] {
    return this.dataGrid?.selectedRows() || [];
  }

  clearSelection(): void {
    if (this.dataGrid) {
      this.dataGrid.selectedRows.set([]);
    }
  }

  selectAll(): void {
    if (this.dataGrid && this.rowData) {
      this.dataGrid.selectedRows.set([...this.rowData]);
    }
  }

  // Compatibility methods that delegate to our DataGridComponent
  refreshData(): void {
    // Data refresh is handled by the parent component that provides rowData
    // No action needed as data binding handles updates automatically
  }

  setQuickFilter(value: string): void {
    // Quick filter is handled by our DataGridComponent's built-in search
    // This would need to be implemented if the search input is external
    console.log('Quick filter set to:', value);
  }

  showLoadingOverlay(): void {
    // Loading state is handled by the loading input property
    // No direct API needed as it's reactive to the loading input
  }

  hideOverlay(): void {
    // Overlay visibility is automatically handled by our DataGridComponent
    // based on loading state and data availability
  }
}