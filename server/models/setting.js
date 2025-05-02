module.exports = (sequelize, DataTypes) => {
  // Sistem ayarları modeli
  const Setting = sequelize.define('Setting', {
    key: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    value: {
      // LONGTEXT için özel tip tanımı (büyük base64 verileri için)
      type: DataTypes.TEXT('long'),
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('value');
        if (!rawValue) return null;
        
        // JSON mu diye kontrol et
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return rawValue;
        }
      },
      set(val) {
        // Öğe objeyse JSON stringine çevir
        if (val && typeof val === 'object') {
          this.setDataValue('value', JSON.stringify(val));
        } else {
          this.setDataValue('value', val);
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });
  
  return Setting;
};