module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT
    },
    contactPerson: {
      type: DataTypes.STRING
    },
    contactEmail: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      }
    },
    contactPhone: {
      type: DataTypes.STRING
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'customers',
    timestamps: true
  });

  return Customer;
};