const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// PUBLIC - tanpa bearer
router.get('/', orderController.getAllOrders);

// PRIVATE - pakai bearer
router.post('/', authMiddleware, orderController.createOrder);

module.exports = router;
