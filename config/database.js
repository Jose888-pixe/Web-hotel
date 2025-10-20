const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configure database based on environment
let sequelize;

// Check if DATABASE_URL exists and is valid (not a placeholder)
const hasValidDatabaseUrl = process.env.DATABASE_URL && 
                            process.env.DATABASE_URL !== '' && 
                            !process.env.DATABASE_URL.includes('your_postgresql_connection_string_here') &&
                            process.env.DATABASE_URL.startsWith('postgres');

if (hasValidDatabaseUrl) {
  // Production: Use PostgreSQL from Render
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Development/Local Production: Use SQLite
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './hotel_elegance.db',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to SQL Server:', error.message);
    return false;
  }
};

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  initDatabase
};
