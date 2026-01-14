const { Item } = require('../models');

/**
 * CREATE ITEM
 * POST /api/items
 */
exports.createItem = async (req, res) => {
  try {
    const { name, pricing, image_url, quantity } = req.body;

    if (!name || pricing == null || quantity == null) {
      return res.status(400).json({
        message: 'Data item tidak lengkap'
      });
    }

    const item = await Item.create({
      name,
      pricing,
      image_url,
      quantity
    });

    res.status(201).json({
      message: 'Item berhasil ditambahkan',
      item
    });
  } catch (err) {
    res.status(500).json({
      message: 'Gagal menambahkan item',
      error: err.message
    });
  }
};

/**
 * GET ALL ITEMS (PUBLIC – TANPA LOGIN)
 * GET /api/items
 */
exports.getItems = async (req, res) => {
  try {
    const items = await Item.findAll({
      order: [['id', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE ITEM
 * PUT /api/items/:id
 */
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'Item tidak ditemukan'
      });
    }

    await item.update(req.body);

    res.json({
      message: 'Item berhasil diupdate',
      item
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE ITEM
 * DELETE /api/items/:id
 */
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: 'Item tidak ditemukan'
      });
    }

    await item.destroy();

    res.json({
      message: 'Item berhasil dihapus'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
