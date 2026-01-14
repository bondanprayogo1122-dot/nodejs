// src/controllers/invoice.controller.js
const { Order, OrderItem, Item } = require('../models');

exports.getInvoice = async (req, res) => {
  try {
    const orderId = req.params.order_id;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Item,
              attributes: ['name', 'pricing']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order tidak ditemukan'
      });
    }

    const items = order.OrderItems.map(oi => ({
      name: oi.Item.name,
      qty: oi.qty,
      price: oi.price,
      subtotal: oi.qty * oi.price
    }));

    res.json({
      order_id: order.id,
      total: order.total,
      items
    });

  } catch (err) {
    res.status(500).json({
      message: 'Gagal mengambil invoice',
      error: err.message
    });
  }
};
