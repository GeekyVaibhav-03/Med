/**
 * MySQL Database Configuration for Lab Report System
 * Uses existing Sequelize instance from models/index.js
 */

const { sequelize } = require('../models');

/**
 * Execute a query using Sequelize
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
  try {
    const [results] = await sequelize.query(sql, {
      replacements: params,
      type: sequelize.QueryTypes.SELECT
    });
    return results;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query that returns the first row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} First row or null
 */
async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results && results.length > 0 ? results[0] : null;
}

/**
 * Execute an INSERT/UPDATE/DELETE query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Result info (insertId, affectedRows, etc.)
 */
async function execute(sql, params = []) {
  try {
    const [results, metadata] = await sequelize.query(sql, {
      replacements: params
    });
    
    return {
      insertId: metadata,
      affectedRows: results ? results.affectedRows : 0,
      changedRows: results ? results.changedRows : 0
    };
  } catch (error) {
    console.error('❌ Database execute error:', error);
    throw error;
  }
}

/**
 * Begin a transaction
 * @returns {Promise<Transaction>}
 */
async function beginTransaction() {
  return await sequelize.transaction();
}

/**
 * Get raw Sequelize instance for advanced operations
 * @returns {Sequelize}
 */
function getSequelize() {
  return sequelize;
}

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connection established');
    return true;
  } catch (error) {
    console.error('❌ MySQL database connection failed:', error);
    return false;
  }
}

module.exports = {
  query,
  queryOne,
  execute,
  beginTransaction,
  getSequelize,
  testConnection,
  sequelize
};
