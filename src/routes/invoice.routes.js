const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/:order_id', authMiddleware, invoiceController.getInvoice);

module.exports = router;
