export const environment = {
  production: false,
  apiUrl: 'https://localhost:7130/api',
  apiVersion: 'v1',
  signalRUrl: 'http://localhost:5000',
  appName: 'Produck ERP',
  appVersion: '1.0.0',
  logLevel: 'debug',
  enableDevTools: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
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