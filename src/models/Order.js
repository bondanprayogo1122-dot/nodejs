module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    total: DataTypes.INTEGER
  });

  Order.associate = models => {
    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id'
    });

    Order.belongsTo(models.User, {
      foreignKey: 'user_id'
    });
  };

  return Order;
};
