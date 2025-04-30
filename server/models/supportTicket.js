module.exports = (sequelize, DataTypes) => {
  const SupportTicket = sequelize.define('SupportTicket', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    supportStaffId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    approverId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approvalDate: {
      type: DataTypes.DATE
    },
    approvalNotes: {
      type: DataTypes.TEXT
    },
    location: {
      type: DataTypes.STRING
    },
    duration: {
      type: DataTypes.FLOAT
    },
    // Approval token for email links
    approvalToken: {
      type: DataTypes.STRING
    },
    // Flag to track if email was sent
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Track external approval (from email)
    externalApproval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // PDF token for secure download
    pdfToken: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'support_tickets',
    timestamps: true,
    hooks: {
      beforeCreate: (ticket) => {
        // Calculate duration in hours (can be used for reporting)
        const start = new Date(ticket.startTime);
        const end = new Date(ticket.endTime);
        const durationHours = (end - start) / (1000 * 60 * 60);
        ticket.duration = durationHours;
      },
      beforeUpdate: (ticket) => {
        if (ticket.changed('startTime') || ticket.changed('endTime')) {
          const start = new Date(ticket.startTime);
          const end = new Date(ticket.endTime);
          const durationHours = (end - start) / (1000 * 60 * 60);
          ticket.duration = durationHours;
        }
      }
    }
  });

  return SupportTicket;
};