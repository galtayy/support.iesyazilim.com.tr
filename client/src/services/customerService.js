import api from './api';

// Customer related API calls
const customerService = {
  // Get all customers
  getCustomers: () => {
    return api.get('/customers');
  },
  
  // Get active customers
  getActiveCustomers: () => {
    return api.get('/customers/active');
  },
  
  // Get single customer by ID
  getCustomer: (id) => {
    return api.get(`/customers/${id}`);
  },
  
  // Create new customer
  createCustomer: (customerData) => {
    return api.post('/customers', customerData);
  },
  
  // Update customer
  updateCustomer: (id, customerData) => {
    return api.put(`/customers/${id}`, customerData);
  },
  
  // Delete customer
  deleteCustomer: (id) => {
    return api.delete(`/customers/${id}`);
  }
};

export default customerService;