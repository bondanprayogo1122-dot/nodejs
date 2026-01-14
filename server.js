require('dotenv').config();

const backendApp = require('./src/app');
const { sequelize } = require('./src/models');

const API_PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // AUTO UPDATE TABLE
    console.log('✅ Database connected');

    // BACKEND API
    backendApp.listen(API_PORT, () => {
      console.log(`🚀 Backend API running on port ${API_PORT}`);
    });



  } catch (err) {
    console.error('❌ Server failed to start');
    console.error(err);
  }
})();
