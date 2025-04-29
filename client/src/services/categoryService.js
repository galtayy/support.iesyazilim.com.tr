import api from './api';

// Category related API calls
const categoryService = {
  // Get all categories
  getCategories: () => {
    return api.get('/categories');
  },
  
  // Get single category by ID
  getCategory: (id) => {
    return api.get(`/categories/${id}`);
  },
  
  // Create new category
  createCategory: (categoryData) => {
    return api.post('/categories', categoryData);
  },
  
  // Update category
  updateCategory: (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData);
  },
  
  // Delete category
  deleteCategory: (id) => {
    return api.delete(`/categories/${id}`);
  }
};

export default categoryService;