const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user')(sequelize, Sequelize);
db.Customer = require('./customer')(sequelize, Sequelize);
db.Category = require('./category')(sequelize, Sequelize);
db.SupportTicket = require('./supportTicket')(sequelize, Sequelize);
db.TicketImage = require('./ticketImage')(sequelize, Sequelize);

// Import Setting model
db.Setting = require('./setting')(sequelize, Sequelize.DataTypes);

// Define relationships
db.User.hasMany(db.SupportTicket, { foreignKey: 'supportStaffId' });
db.SupportTicket.belongsTo(db.User, { foreignKey: 'supportStaffId', as: 'supportStaff' });

db.User.hasMany(db.SupportTicket, { foreignKey: 'approverId' });
db.SupportTicket.belongsTo(db.User, { foreignKey: 'approverId', as: 'approver' });

db.Customer.hasMany(db.SupportTicket, { foreignKey: 'customerId' });
db.SupportTicket.belongsTo(db.Customer, { foreignKey: 'customerId' });

db.Category.hasMany(db.SupportTicket, { foreignKey: 'categoryId' });
db.SupportTicket.belongsTo(db.Category, { foreignKey: 'categoryId' });

db.SupportTicket.hasMany(db.TicketImage, { foreignKey: 'ticketId', onDelete: 'CASCADE' });
db.TicketImage.belongsTo(db.SupportTicket, { foreignKey: 'ticketId' });

module.exports = db;