import api from './api';

// Support ticket related API calls
const ticketService = {
  // Get all tickets with optional filtering
  getTickets: (filters = {}) => {
    return api.get('/tickets', { params: filters });
  },
  
  // Get single ticket by ID
  getTicket: (id) => {
    return api.get(`/tickets/${id}`);
  },
  
  // Create new ticket
  createTicket: (ticketData) => {
    return api.post('/tickets', ticketData);
  },
  
  // Update ticket
  updateTicket: (id, ticketData) => {
    return api.put(`/tickets/${id}`, ticketData);
  },
  
  // Update ticket status (approve/reject)
  updateTicketStatus: (id, status, approvalNotes) => {
    return api.put(`/tickets/${id}/status`, { status, approvalNotes });
  },
  
  // Delete ticket
  deleteTicket: (id) => {
    return api.delete(`/tickets/${id}`);
  },
  
  // Upload image for a ticket
  uploadImage: (ticketId, formData) => {
    return api.post(`/tickets/${ticketId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Delete ticket image
  deleteImage: (ticketId, imageId) => {
    return api.delete(`/tickets/${ticketId}/images/${imageId}`);
  },
  
  // Generate PDF for a ticket
  generatePDF: (ticketId) => {
    return api.get(`/tickets/${ticketId}/pdf`, { 
      responseType: 'blob'
    });
  }
};

export default ticketService;