const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// PUBLIC
router.get('/', itemController.getItems);

// ADMIN / LOGIN
router.post('/', authMiddleware, itemController.createItem);
router.put('/:id', authMiddleware, itemController.updateItem);
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
