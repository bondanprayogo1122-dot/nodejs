module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Item', {
    name: DataTypes.STRING,
    pricing: DataTypes.INTEGER,
    image_url: DataTypes.STRING,
    quantity: DataTypes.INTEGER
  });
};
