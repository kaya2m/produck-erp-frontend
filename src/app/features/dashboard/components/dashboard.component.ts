import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartGridComponent } from '@shared/components/smart-grid/smart-grid.component';
import { ColDef } from 'ag-grid-community';
import { NotificationService } from '@core/services/notification.service';

@Component({
  selector: 'erp-dashboard',
  standalone: true,
  imports: [CommonModule, SmartGridComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Sample data for demonstration
  rowData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Sales', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'IT', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', department: 'HR', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', department: 'Finance', status: 'Active' }
  ];

  columnDefs: ColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
      checkboxSelection: true,
      headerCheckboxSelection: true
    },
    {
      field: 'name',
      headerName: 'Full Name',
      flex: 1,
      minWidth: 150
    },
    {
      field: 'email',
      headerName: 'Email Address',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 120
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      cellRenderer: (params: any) => {
        const status = params.value;
        const color = status === 'Active' ? 'text-green-600' : 'text-red-600';
        return `<span class="${color} font-medium">${status}</span>`;
      }
    }
  ];

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.success('Dashboard loaded successfully!');
  }

  onRowClicked(event: any): void {
    const rowData = event.data;
    this.notificationService.info(`Selected: ${rowData.name}`);
  }

  onExportData(): void {
    this.notificationService.success('Data exported successfully!');
  }

  onRefreshData(): void {
    this.notificationService.info('Refreshing data...');
    // Simulate data refresh
    setTimeout(() => {
      this.notificationService.success('Data refreshed!');
    }, 1000);
  }

  onQuickSearch(value: string): void {
    // This would be handled by the SmartGrid component
    console.log('Quick search:', value);
  }
}