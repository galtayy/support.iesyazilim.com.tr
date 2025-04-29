import api from './api';

// Report related API calls
const reportService = {
  // Get monthly summary report
  getMonthlySummary: (year, month) => {
    return api.get('/reports/monthly-summary', { 
      params: { year, month } 
    });
  },
  
  // Get detailed report
  getDetailedReport: (params) => {
    return api.get('/reports/detailed', { params });
  },
  
  // Get staff performance report
  getStaffPerformance: (params) => {
    return api.get('/reports/staff-performance', { params });
  }
};

export default reportService;