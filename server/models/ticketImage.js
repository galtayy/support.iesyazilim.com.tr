module.exports = (sequelize, DataTypes) => {
  const TicketImage = sequelize.define('TicketImage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'support_tickets',
        key: 'id'
      }
    },
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ticket_images',
    timestamps: true
  });

  return TicketImage;
};