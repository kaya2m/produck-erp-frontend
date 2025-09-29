export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  apiVersion: 'v1',
  signalRUrl: 'https://your-api-domain.com',
  appName: 'Produck ERP',
  appVersion: '1.0.0',
  logLevel: 'error',
  enableDevTools: false,
  cacheTimeout: 15 * 60 * 1000, // 15 minutes
  pageSize: 20,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'],
  features: {
    notifications: true,
    fileUpload: true,
    export: true,
    analytics: true,
  }
};