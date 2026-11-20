// config/db.js
const { Sequelize } = require('sequelize');
const path = require('path');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false,
});
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite Database connected successfully.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
}
testConnection();
module.exports = sequelize;