const { User } = require('../models');

// In-memory storage for operator rotation
// In production, this should be stored in database or Redis
let lastOperatorIndex = -1;

/**
 * Get next operator in rotation (round-robin)
 * Ensures fair distribution of reservations among operators
 */
const getNextOperator = async () => {
  try {
    // Get all active operators, ordered by ID for consistency
    const operators = await User.findAll({
      where: {
        role: 'operator'
      },
      order: [['id', 'ASC']],
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    if (operators.length === 0) {
      console.warn('⚠️ No operators found in database');
      return null;
    }

    // Increment index (round-robin)
    lastOperatorIndex = (lastOperatorIndex + 1) % operators.length;
    
    const selectedOperator = operators[lastOperatorIndex];
    
    console.log(`👤 Operator ${lastOperatorIndex + 1}/${operators.length} selected:`, selectedOperator.email);
    
    return selectedOperator;
  } catch (error) {
    console.error('❌ Error getting next operator:', error);
    return null;
  }
};

/**
 * Get all operators
 */
const getAllOperators = async () => {
  try {
    const operators = await User.findAll({
      where: {
        role: 'operator'
      },
      order: [['id', 'ASC']],
      attributes: ['id', 'firstName', 'lastName', 'email']
    });

    return operators;
  } catch (error) {
    console.error('❌ Error getting all operators:', error);
    return [];
  }
};

/**
 * Reset rotation (useful for testing or manual reset)
 */
const resetRotation = () => {
  lastOperatorIndex = -1;
  console.log('🔄 Operator rotation reset');
};

/**
 * Get current rotation status
 */
const getRotationStatus = async () => {
  const operators = await getAllOperators();
  return {
    totalOperators: operators.length,
    lastIndex: lastOperatorIndex,
    nextIndex: (lastOperatorIndex + 1) % (operators.length || 1),
    operators: operators.map((op, idx) => ({
      index: idx,
      name: `${op.firstName} ${op.lastName}`,
      email: op.email,
      isNext: idx === ((lastOperatorIndex + 1) % operators.length)
    }))
  };
};

module.exports = {
  getNextOperator,
  getAllOperators,
  resetRotation,
  getRotationStatus
};
