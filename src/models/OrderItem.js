module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    qty: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  });

  OrderItem.associate = models => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'order_id'
    });
    OrderItem.belongsTo(models.Item, {
      foreignKey: 'item_id'
    });
  };

  return OrderItem;
};
