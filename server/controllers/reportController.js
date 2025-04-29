const { SupportTicket, Customer, Category, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get monthly summary report
exports.getMonthlySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Validate year and month
    const currentYear = new Date().getFullYear();
    const reqYear = parseInt(year) || currentYear;
    const reqMonth = month ? parseInt(month) - 1 : null; // JS months are 0-indexed
    
    // Build date filters
    let startDate, endDate;
    
    if (reqMonth !== null) {
      // Specific month
      startDate = new Date(reqYear, reqMonth, 1);
      endDate = new Date(reqYear, reqMonth + 1, 0); // Last day of month
    } else {
      // Entire year
      startDate = new Date(reqYear, 0, 1);
      endDate = new Date(reqYear, 11, 31);
    }
    
    // Set time to include the full day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    // Get all tickets for the period
    const tickets = await SupportTicket.findAll({
      where: {
        startTime: {
          [Op.between]: [startDate, endDate]
        },
        status: 'approved' // Only count approved tickets
      },
      include: [
        {
          model: Customer,
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    // Calculate summary statistics
    const totalHours = tickets.reduce((sum, ticket) => {
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    // Group by category
    const categoryStats = {};
    tickets.forEach(ticket => {
      const categoryId = ticket.Category.id;
      const categoryName = ticket.Category.name;
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = {
          id: categoryId,
          name: categoryName,
          color: ticket.Category.color,
          hours: 0,
          ticketCount: 0
        };
      }
      
      categoryStats[categoryId].hours += hours;
      categoryStats[categoryId].ticketCount += 1;
    });
    
    // Group by customer
    const customerStats = {};
    tickets.forEach(ticket => {
      const customerId = ticket.Customer.id;
      const customerName = ticket.Customer.name;
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (!customerStats[customerId]) {
        customerStats[customerId] = {
          id: customerId,
          name: customerName,
          hours: 0,
          ticketCount: 0
        };
      }
      
      customerStats[customerId].hours += hours;
      customerStats[customerId].ticketCount += 1;
    });
    
    // Group by support staff
    const staffStats = {};
    tickets.forEach(ticket => {
      const staffId = ticket.supportStaff.id;
      const staffName = `${ticket.supportStaff.firstName} ${ticket.supportStaff.lastName}`;
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (!staffStats[staffId]) {
        staffStats[staffId] = {
          id: staffId,
          name: staffName,
          hours: 0,
          ticketCount: 0
        };
      }
      
      staffStats[staffId].hours += hours;
      staffStats[staffId].ticketCount += 1;
    });
    
    // Format result
    const summaryReport = {
      period: {
        year: reqYear,
        month: reqMonth !== null ? reqMonth + 1 : null, // Convert back to 1-indexed for response
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      overall: {
        totalTickets: tickets.length,
        totalHours: parseFloat(totalHours.toFixed(2))
      },
      categorySummary: Object.values(categoryStats).map(cat => ({
        ...cat,
        hours: parseFloat(cat.hours.toFixed(2))
      })),
      customerSummary: Object.values(customerStats).map(cust => ({
        ...cust,
        hours: parseFloat(cust.hours.toFixed(2))
      })),
      staffSummary: Object.values(staffStats).map(staff => ({
        ...staff,
        hours: parseFloat(staff.hours.toFixed(2))
      }))
    };
    
    res.json(summaryReport);
  } catch (error) {
    console.error('Get monthly summary error:', error);
    res.status(500).json({ error: 'Aylık özet raporu alınırken bir hata oluştu.' });
  }
};

// Get detailed report for a period
exports.getDetailedReport = async (req, res) => {
  try {
    const { startDate, endDate, customerId, categoryId, supportStaffId, status } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Başlangıç ve bitiş tarihi gereklidir.' });
    }
    
    // Build where clause
    const whereClause = {
      startTime: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      }
    };
    
    if (customerId) {
      whereClause.customerId = customerId;
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (supportStaffId) {
      whereClause.supportStaffId = supportStaffId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    // Get tickets for the period with all details
    const tickets = await SupportTicket.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'contactPerson']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['startTime', 'DESC']]
    });
    
    // Process tickets to calculate hours and add formatted dates
    const processedTickets = tickets.map(ticket => {
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);
      const hours = parseFloat(((endTime - startTime) / (1000 * 60 * 60)).toFixed(2));
      
      return {
        id: ticket.id,
        description: ticket.description,
        startTime: ticket.startTime,
        endTime: ticket.endTime,
        hours,
        status: ticket.status,
        location: ticket.location,
        customer: ticket.Customer ? {
          id: ticket.Customer.id,
          name: ticket.Customer.name,
          contactPerson: ticket.Customer.contactPerson
        } : null,
        category: ticket.Category ? {
          id: ticket.Category.id,
          name: ticket.Category.name,
          color: ticket.Category.color
        } : null,
        supportStaff: ticket.supportStaff ? {
          id: ticket.supportStaff.id,
          name: `${ticket.supportStaff.firstName} ${ticket.supportStaff.lastName}`
        } : null,
        approver: ticket.approver ? {
          id: ticket.approver.id,
          name: `${ticket.approver.firstName} ${ticket.approver.lastName}`
        } : null,
        approvalDate: ticket.approvalDate,
        approvalNotes: ticket.approvalNotes,
        createdAt: ticket.createdAt
      };
    });
    
    // Calculate summary statistics
    const totalHours = processedTickets.reduce((sum, ticket) => sum + ticket.hours, 0);
    
    // Group by various dimensions
    const categoryStats = {};
    const customerStats = {};
    const staffStats = {};
    const statusStats = {
      approved: { count: 0, hours: 0 },
      pending: { count: 0, hours: 0 },
      rejected: { count: 0, hours: 0 }
    };
    
    processedTickets.forEach(ticket => {
      // Category stats
      if (ticket.category) {
        const catId = ticket.category.id;
        if (!categoryStats[catId]) {
          categoryStats[catId] = {
            id: catId,
            name: ticket.category.name,
            color: ticket.category.color,
            count: 0,
            hours: 0
          };
        }
        categoryStats[catId].count += 1;
        categoryStats[catId].hours += ticket.hours;
      }
      
      // Customer stats
      if (ticket.customer) {
        const custId = ticket.customer.id;
        if (!customerStats[custId]) {
          customerStats[custId] = {
            id: custId,
            name: ticket.customer.name,
            count: 0,
            hours: 0
          };
        }
        customerStats[custId].count += 1;
        customerStats[custId].hours += ticket.hours;
      }
      
      // Staff stats
      if (ticket.supportStaff) {
        const staffId = ticket.supportStaff.id;
        if (!staffStats[staffId]) {
          staffStats[staffId] = {
            id: staffId,
            name: ticket.supportStaff.name,
            count: 0,
            hours: 0
          };
        }
        staffStats[staffId].count += 1;
        staffStats[staffId].hours += ticket.hours;
      }
      
      // Status stats
      if (statusStats[ticket.status]) {
        statusStats[ticket.status].count += 1;
        statusStats[ticket.status].hours += ticket.hours;
      }
    });
    
    // Format stats with fixed precision
    Object.values(categoryStats).forEach(cat => {
      cat.hours = parseFloat(cat.hours.toFixed(2));
    });
    
    Object.values(customerStats).forEach(cust => {
      cust.hours = parseFloat(cust.hours.toFixed(2));
    });
    
    Object.values(staffStats).forEach(staff => {
      staff.hours = parseFloat(staff.hours.toFixed(2));
    });
    
    Object.keys(statusStats).forEach(status => {
      statusStats[status].hours = parseFloat(statusStats[status].hours.toFixed(2));
    });
    
    // Build response
    const reportData = {
      period: {
        startDate,
        endDate
      },
      summary: {
        totalTickets: processedTickets.length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        byCategoryCount: Object.values(categoryStats).sort((a, b) => b.count - a.count),
        byCategoryHours: Object.values(categoryStats).sort((a, b) => b.hours - a.hours),
        byCustomerCount: Object.values(customerStats).sort((a, b) => b.count - a.count),
        byCustomerHours: Object.values(customerStats).sort((a, b) => b.hours - a.hours),
        byStaffCount: Object.values(staffStats).sort((a, b) => b.count - a.count),
        byStaffHours: Object.values(staffStats).sort((a, b) => b.hours - a.hours),
        byStatus: statusStats
      },
      tickets: processedTickets
    };
    
    res.json(reportData);
  } catch (error) {
    console.error('Get detailed report error:', error);
    res.status(500).json({ error: 'Detaylı rapor alınırken bir hata oluştu.' });
  }
};

// Get staff performance report
exports.getStaffPerformance = async (req, res) => {
  try {
    const { startDate, endDate, staffId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Başlangıç ve bitiş tarihi gereklidir.' });
    }
    
    // Build where clause
    const whereClause = {
      startTime: {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      },
      status: 'approved' // Only consider approved tickets
    };
    
    if (staffId) {
      whereClause.supportStaffId = staffId;
    }
    
    // Get all support staff
    const supportStaff = await User.findAll({
      where: {
        role: 'support',
        active: true
      },
      attributes: ['id', 'firstName', 'lastName']
    });
    
    // Get all tickets for the period
    const tickets = await SupportTicket.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    // Calculate statistics for each staff member
    const staffPerformance = {};
    
    // Initialize with all staff (even those with no tickets)
    supportStaff.forEach(staff => {
      staffPerformance[staff.id] = {
        id: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        totalTickets: 0,
        totalHours: 0,
        avgTicketsPerDay: 0,
        avgHoursPerDay: 0,
        categoryBreakdown: {}
      };
    });
    
    // Update with ticket data
    tickets.forEach(ticket => {
      const staffId = ticket.supportStaff.id;
      const startTime = new Date(ticket.startTime);
      const endTime = new Date(ticket.endTime);
      const hours = (endTime - startTime) / (1000 * 60 * 60);
      const categoryId = ticket.Category.id;
      const categoryName = ticket.Category.name;
      
      // Create staff entry if it doesn't exist (for non-active staff with tickets)
      if (!staffPerformance[staffId]) {
        staffPerformance[staffId] = {
          id: staffId,
          name: `${ticket.supportStaff.firstName} ${ticket.supportStaff.lastName}`,
          totalTickets: 0,
          totalHours: 0,
          avgTicketsPerDay: 0,
          avgHoursPerDay: 0,
          categoryBreakdown: {}
        };
      }
      
      // Update stats
      staffPerformance[staffId].totalTickets += 1;
      staffPerformance[staffId].totalHours += hours;
      
      // Update category breakdown
      if (!staffPerformance[staffId].categoryBreakdown[categoryId]) {
        staffPerformance[staffId].categoryBreakdown[categoryId] = {
          id: categoryId,
          name: categoryName,
          ticketCount: 0,
          hours: 0
        };
      }
      
      staffPerformance[staffId].categoryBreakdown[categoryId].ticketCount += 1;
      staffPerformance[staffId].categoryBreakdown[categoryId].hours += hours;
    });
    
    // Calculate averages
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const dayDiff = Math.max(1, Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)));
    
    Object.values(staffPerformance).forEach(staff => {
      staff.avgTicketsPerDay = parseFloat((staff.totalTickets / dayDiff).toFixed(2));
      staff.avgHoursPerDay = parseFloat((staff.totalHours / dayDiff).toFixed(2));
      staff.totalHours = parseFloat(staff.totalHours.toFixed(2));
      
      // Convert category breakdown to array and format hours
      staff.categoryBreakdown = Object.values(staff.categoryBreakdown).map(cat => ({
        ...cat,
        hours: parseFloat(cat.hours.toFixed(2))
      }));
    });
    
    // Convert to array and sort by total hours
    const performanceArray = Object.values(staffPerformance).sort((a, b) => b.totalHours - a.totalHours);
    
    // Build response
    const performanceReport = {
      period: {
        startDate,
        endDate,
        totalDays: dayDiff
      },
      overall: {
        totalStaff: performanceArray.length,
        totalTickets: tickets.length,
        totalHours: parseFloat(performanceArray.reduce((sum, staff) => sum + staff.totalHours, 0).toFixed(2))
      },
      staffPerformance: performanceArray
    };
    
    res.json(performanceReport);
  } catch (error) {
    console.error('Get staff performance error:', error);
    res.status(500).json({ error: 'Personel performans raporu alınırken bir hata oluştu.' });
  }
};

module.exports = {
  getMonthlySummary: exports.getMonthlySummary,
  getDetailedReport: exports.getDetailedReport,
  getStaffPerformance: exports.getStaffPerformance
};