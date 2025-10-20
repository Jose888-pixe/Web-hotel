/**
 * Utilidades de traducción para el sistema de hotel
 */

/**
 * Traduce los métodos de pago al español
 * @param {string} method - Método de pago en inglés
 * @returns {string} Método de pago en español
 */
export const translatePaymentMethod = (method) => {
  const translations = {
    'credit_card': 'Tarjeta de Crédito',
    'debit_card': 'Tarjeta de Débito',
    'cash': 'Efectivo',
    'transfer': 'Transferencia Bancaria',
    'bank_transfer': 'Transferencia Bancaria',
    'paypal': 'PayPal',
    'other': 'Otro Método'
  };

  return translations[method] || 'No especificado';
};

/**
 * Obtiene el icono apropiado para cada método de pago
 * @param {string} method - Método de pago
 * @returns {string} Clase de icono FontAwesome
 */
export const getPaymentMethodIcon = (method) => {
  const icons = {
    'credit_card': 'fa-credit-card',
    'debit_card': 'fa-credit-card',
    'cash': 'fa-money-bill-wave',
    'transfer': 'fa-exchange-alt',
    'bank_transfer': 'fa-exchange-alt',
    'paypal': 'fa-paypal',
    'other': 'fa-wallet'
  };

  return icons[method] || 'fa-wallet';
};

/**
 * Traduce los estados de reserva al español
 * @param {string} status - Estado en inglés
 * @returns {string} Estado en español
 */
export const translateReservationStatus = (status) => {
  const translations = {
    'pending': 'Pendiente',
    'confirmed': 'Confirmada',
    'checked-in': 'Check-in Realizado',
    'checked-out': 'Check-out Realizado',
    'cancelled': 'Cancelada',
    'completed': 'Completada'
  };

  return translations[status] || status;
};

/**
 * Traduce los estados de pago al español
 * @param {string} status - Estado de pago en inglés
 * @returns {string} Estado de pago en español
 */
export const translatePaymentStatus = (status) => {
  const translations = {
    'pending': 'Pendiente',
    'paid': 'Pagado',
    'partial': 'Pago Parcial',
    'refunded': 'Reembolsado',
    'failed': 'Fallido'
  };

  return translations[status] || status;
};

/**
 * Traduce los tipos de habitación al español
 * @param {string} type - Tipo de habitación en inglés
 * @returns {string} Tipo de habitación en español
 */
export const translateRoomType = (type) => {
  const translations = {
    'standard': 'Estándar',
    'deluxe': 'Deluxe',
    'suite': 'Suite',
    'presidential': 'Presidencial',
    'family': 'Familiar',
    'single': 'Individual',
    'double': 'Doble'
  };

  return translations[type] || type;
};

/**
 * Traduce los estados de habitación al español
 * @param {string} status - Estado de habitación en inglés
 * @returns {string} Estado de habitación en español
 */
export const translateRoomStatus = (status) => {
  const translations = {
    'available': 'Disponible',
    'occupied': 'Ocupada',
    'maintenance': 'Mantenimiento',
    'cleaning': 'Limpieza',
    'reserved': 'Reservada'
  };

  return translations[status] || status;
};

/**
 * Traduce los roles de usuario al español
 * @param {string} role - Rol en inglés
 * @returns {string} Rol en español
 */
export const translateUserRole = (role) => {
  const translations = {
    'admin': 'Administrador',
    'operator': 'Operador',
    'visitor': 'Visitante',
    'guest': 'Huésped'
  };

  return translations[role] || role;
};

export default {
  translatePaymentMethod,
  getPaymentMethodIcon,
  translateReservationStatus,
  translatePaymentStatus,
  translateRoomType,
  translateRoomStatus,
  translateUserRole
};
