// Middleware de validación

// Validar que el ID sea un número entero válido
const validateId = (req, res, next) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  req.params.id = id; // Convertir a número
  next();
};

// Validar campos requeridos
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    for (const field of fields) {
      if (!req.body[field]) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missing 
      });
    }
    
    next();
  };
};

// Validar formato de email
const validateEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  }
  
  next();
};

// Validar longitud de contraseña
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (password.length > 100) {
      return res.status(400).json({ message: 'Password too long' });
    }
  }
  
  next();
};

// Sanitizar strings (prevenir XSS básico)
const sanitizeStrings = (req, res, next) => {
  const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }

  next();
};

// Validar fechas
const validateDates = (req, res, next) => {
  const { checkIn, checkOut } = req.body;
  
  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    if (checkInDate < today) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }
  }
  
  next();
};

// Validar números positivos
const validatePositiveNumber = (field) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (value !== undefined) {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return res.status(400).json({ message: `${field} must be a positive number` });
      }
    }
    
    next();
  };
};

module.exports = {
  validateId,
  validateRequired,
  validateEmail,
  validatePassword,
  sanitizeStrings,
  validateDates,
  validatePositiveNumber
};
