require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/items', require('./routes/item.routes'));
app.use('/api/order', require('./routes/order.routes'));
app.use('/api/invoice', require('./routes/invoice.routes'));

module.exports = app;
