import api from './api';

// Approval related API calls
const approvalService = {
  // Send approval email
  sendApprovalEmail: (ticketId) => {
    return api.get(`/approval/send/${ticketId}`);
  },
  
  // Verify approval token
  verifyApprovalToken: (token) => {
    return api.get(`/approval/verify/${token}`);
  },
  
  // Process approval action
  processApproval: (token, action, reason = '') => {
    return api.post(`/approval/process/${token}/${action}`, { reason });
  }
};

export default approvalService;