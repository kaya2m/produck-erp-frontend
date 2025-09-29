import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowClickedEvent,
  CellClickedEvent,
  SelectionChangedEvent
} from 'ag-grid-community';

@Component({
  selector: 'erp-smart-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './smart-grid.component.html',
  styleUrl: './smart-grid.component.scss'
})
export class SmartGridComponent {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  @Input() rowData: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() height: string = '560px';
  @Input() theme: string = 'ag-theme-quartz';
  @Input() enableSelection: boolean = true;
  @Input() enableSorting: boolean = true;
  @Input() enableFiltering: boolean = true;
  @Input() enablePagination: boolean = false;
  @Input() pageSize: number = 100;
  @Input() loading: boolean = false;

  @Output() rowClicked = new EventEmitter<RowClickedEvent>();
  @Output() cellClicked = new EventEmitter<CellClickedEvent>();
  @Output() selectionChanged = new EventEmitter<SelectionChangedEvent>();
  @Output() gridReady = new EventEmitter<GridReadyEvent>();

  private gridApi?: GridApi;

  public gridOptions: GridOptions = {
    defaultColDef: {
      sortable: this.enableSorting,
      resizable: true,
      filter: this.enableFiltering,
      floatingFilter: this.enableFiltering,
      flex: 1,
      minWidth: 100
    },
    rowSelection: this.enableSelection ? 'multiple' : undefined,
    animateRows: true,
    headerHeight: 36,
    rowHeight: 34,
    suppressRowClickSelection: false,
    rowMultiSelectWithClick: true,
    suppressCellFocus: true,
    enableCellTextSelection: true,
    pagination: this.enablePagination,
    paginationPageSize: this.pageSize,
    loadingOverlayComponent: 'customLoadingOverlay',
    noRowsOverlayComponent: 'customNoRowsOverlay'
  };

  onGridReady(event: GridReadyEvent): void {
    this.gridApi = event.api;
    this.gridReady.emit(event);
    this.autoSizeColumns();
  }

  onRowClicked(event: RowClickedEvent): void {
    this.rowClicked.emit(event);
  }

  onCellClicked(event: CellClickedEvent): void {
    this.cellClicked.emit(event);
  }

  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectionChanged.emit(event);
  }

  // Public methods for external access
  exportToCsv(fileName: string = 'export.csv', onlySelected: boolean = false): void {
    if (!this.gridApi) return;

    this.gridApi.exportDataAsCsv({
      fileName,
      onlySelected
    });
  }

  exportToExcel(fileName: string = 'export.xlsx', onlySelected: boolean = false): void {
    if (!this.gridApi) return;

    // Note: Excel export requires ag-grid enterprise license
    // this.gridApi.exportDataAsExcel({
    //   fileName,
    //   onlySelected
    // });

    // Fallback to CSV for community version
    this.exportToCsv(fileName.replace('.xlsx', '.csv'), onlySelected);
  }

  getSelectedRows(): any[] {
    return this.gridApi?.getSelectedRows() || [];
  }

  clearSelection(): void {
    this.gridApi?.deselectAll();
  }

  selectAll(): void {
    this.gridApi?.selectAll();
  }

  autoSizeColumns(): void {
    if (this.gridApi) {
      this.gridApi.autoSizeAllColumns();
    }
  }

  refreshData(): void {
    if (this.gridApi) {
      this.gridApi.refreshCells();
    }
  }

  setQuickFilter(value: string): void {
    if (this.gridApi) {
      this.gridApi.setGridOption('quickFilterText', value);
    }
  }

  showLoadingOverlay(): void {
    if (this.gridApi) {
      this.gridApi.showLoadingOverlay();
    }
  }

  hideOverlay(): void {
    if (this.gridApi) {
      this.gridApi.hideOverlay();
    }
  }
}