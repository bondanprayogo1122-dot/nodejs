const { Order, OrderItem, Item, User } = require('../models');

exports.createOrder = async (req, res) => {
  const { items } = req.body;
  let total = 0;

  const order = await Order.create({
    user_id: req.user.id,
    total: 0
  });

  for (const i of items) {
    const item = await Item.findByPk(i.item_id);
    if (!item) continue;

    if (item.quantity < i.qty) {
      return res.status(400).json({
        message: `Stok ${item.name} tidak cukup`
      });
    }

    const subtotal = item.pricing * i.qty;
    total += subtotal;

    await OrderItem.create({
      order_id: order.id,
      item_id: item.id,
      qty: i.qty,
      price: item.pricing
    });

    item.quantity -= i.qty;
    await item.save();
  }

  order.total = total;
  await order.save();

  res.json({
    message: 'Order berhasil',
    order_id: order.id,
    total
  });
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name'] // 👈 NAMA USER
        },
        {
          model: OrderItem,
          include: [
            {
              model: Item
            }
          ]
        }
      ],
      order: [['id', 'DESC']]
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
