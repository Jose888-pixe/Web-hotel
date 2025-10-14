const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { User, Room, Reservation, Payment, Contact } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3003',
  credentials: true,
  optionsSuccessStatus: 200
};

// Basic middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: Frontend is deployed separately as a Static Site on Render
// No need to serve static files from backend
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'hotel-react/build')));
// }

// Simple auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rooms routes
app.get('/api/rooms', async (req, res) => {
  try {
    console.log('Room filters received:', req.query);
    
    const {
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
      type,
      minPrice,
      maxPrice
    } = req.query;

    const { Op } = require('sequelize');
    let where = { isActive: true };
    
    // Filter by room type
    if (type && type !== '') {
      where.type = type;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Filter by capacity - only if guests > 1
    const totalGuests = parseInt(adults) + parseInt(children);
    if (totalGuests > 1) {
      where.capacity = { [Op.gte]: totalGuests };
    }

    console.log('Room where clause:', where);

    let rooms = await Room.findAll({
      where,
      order: [['price', 'ASC']]
    });

    console.log(`Found ${rooms.length} rooms before filters`);

    // Update room statuses based on current reservations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const room of rooms) {
      // Skip rooms in maintenance
      if (room.status === 'maintenance') continue;

      const activeReservation = await Reservation.findOne({
        where: {
          roomId: room.id,
          checkIn: { [Op.lte]: today },
          checkOut: { [Op.gt]: today },
          status: { [Op.in]: ['confirmed', 'checked-in'] }
        }
      });

      if (activeReservation && room.status !== 'occupied') {
        room.status = 'occupied';
        await room.save();
      } else if (!activeReservation && room.status === 'occupied') {
        room.status = 'available';
        await room.save();
      }
    }

    // Filter by availability if dates provided
    if (checkIn && checkOut) {
      const unavailableReservations = await Reservation.findAll({
        where: {
          [Op.and]: [
            {
              checkIn: { [Op.lt]: new Date(checkOut) }
            },
            {
              checkOut: { [Op.gt]: new Date(checkIn) }
            },
            {
              status: { [Op.in]: ['confirmed', 'pending'] }
            }
          ]
        },
        attributes: ['roomId']
      });

      const unavailableRoomIds = unavailableReservations.map(res => res.roomId);
      console.log('Unavailable room IDs:', unavailableRoomIds);
      
      rooms = rooms.filter(room => !unavailableRoomIds.includes(room.id));
      console.log(`${rooms.length} rooms available after date filter`);
    }

    // Note: We don't filter maintenance rooms here anymore
    // Visitors will see them but won't be able to book during maintenance dates
    // This is handled in the reservation creation endpoint

    res.json({
      rooms,
      pagination: {
        page: 1,
        limit: rooms.length,
        total: rooms.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get occupied dates for a room
app.get('/api/rooms/:id/occupied-dates', async (req, res) => {
  try {
    const { Op } = require('sequelize');
    const roomId = req.params.id;
    console.log(`📅 Getting occupied dates for room ${roomId}`);
    
    // Get room information to check maintenance status
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Get all confirmed/checked-in reservations for this room (exclude pending)
    const reservations = await Reservation.findAll({
      where: {
        roomId: parseInt(roomId),
        status: { [Op.in]: ['confirmed', 'checked-in'] }
      },
      attributes: ['id', 'checkIn', 'checkOut', 'status']
    });
    
    console.log(`Found ${reservations.length} confirmed/checked-in reservations for room ${roomId}`);
    reservations.forEach(r => {
      console.log(`  - Reservation ${r.id}: ${r.checkIn} to ${r.checkOut} (${r.status})`);
    });
    
    // Generate array of occupied dates from reservations
    const occupiedDates = [];
    reservations.forEach(reservation => {
      const start = new Date(reservation.checkIn);
      const end = new Date(reservation.checkOut);
      
      // Add all dates between check-in and check-out
      for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
        occupiedDates.push(new Date(date).toISOString().split('T')[0]);
      }
    });
    
    // Add maintenance dates if room has maintenanceUntil date or is not active
    if (room.maintenanceUntil || !room.isActive) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // If maintenanceUntil is set, use it; otherwise use a far future date if room is permanently closed
      if (room.maintenanceUntil) {
        const maintenanceEnd = new Date(room.maintenanceUntil);
        maintenanceEnd.setHours(0, 0, 0, 0);
        
        console.log(`🔧 Room is in maintenance until ${room.maintenanceUntil}`);
        
        // Only add future dates (not past maintenance)
        if (maintenanceEnd >= today) {
          // Add all dates from today until maintenanceUntil
          for (let date = new Date(today); date <= maintenanceEnd; date.setDate(date.getDate() + 1)) {
            occupiedDates.push(new Date(date).toISOString().split('T')[0]);
          }
        }
      } else if (!room.isActive) {
        // If room is closed without a specific end date, block next 365 days
        console.log(`🔧 Room is closed indefinitely`);
        const oneYearFromNow = new Date(today);
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        for (let date = new Date(today); date <= oneYearFromNow; date.setDate(date.getDate() + 1)) {
          occupiedDates.push(new Date(date).toISOString().split('T')[0]);
        }
      }
    }
    
    const uniqueDates = [...new Set(occupiedDates)];
    console.log(`📍 Total occupied dates for room ${roomId}:`, uniqueDates.length);
    console.log(`📍 Dates:`, uniqueDates);
    
    res.json({ occupiedDates: uniqueDates });
  } catch (error) {
    console.error('Get occupied dates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update room (admin/operator only)
app.put('/api/rooms/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const { status, name, type, price, capacity, description, features, maintenanceUntil } = req.body;
    
    if (status) {
      room.status = status;
      // If setting to maintenance and no date provided, clear maintenanceUntil
      if (status === 'maintenance' && maintenanceUntil) {
        room.maintenanceUntil = maintenanceUntil;
      } else if (status !== 'maintenance') {
        room.maintenanceUntil = null;
      }
    }
    if (name) room.name = name;
    if (type) room.type = type;
    if (price) room.price = price;
    if (capacity) room.capacity = capacity;
    if (description) room.description = description;
    if (features) room.features = features;

    await room.save();

    res.json({ 
      message: 'Room updated successfully',
      room 
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error updating room' });
  }
});

// Create room (admin only)
app.post('/api/rooms', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { number, name, type, price, capacity, description, features, floor, size } = req.body;

    if (!number || !name || !type || !price || !capacity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const room = await Room.create({
      number,
      name,
      type,
      price,
      capacity,
      description: description || '',
      features: features || [],
      floor: floor || 1,
      size: size || 25,
      status: 'available',
      images: []
    });

    res.status(201).json({ 
      message: 'Room created successfully',
      room 
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error creating room' });
  }
});

// Delete room (admin only)
app.delete('/api/rooms/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const room = await Room.findByPk(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await room.destroy();

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error deleting room' });
  }
});

// Reservations routes
app.post('/api/reservations', authenticateToken, async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      adults,
      children,
      guestFirstName,
      guestLastName,
      guestEmail,
      guestPhone,
      specialRequests
    } = req.body;

    console.log('Creating reservation with data:', req.body);

    // Validate required fields
    if (!roomId || !checkIn || !checkOut || !adults || !guestFirstName || !guestLastName || !guestEmail || !guestPhone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check room availability
    const { Op } = require('sequelize');
    const conflictingReservations = await Reservation.findAll({
      where: {
        roomId: parseInt(roomId),
        [Op.or]: [
          {
            checkIn: { [Op.lte]: checkOut },
            checkOut: { [Op.gt]: checkIn }
          }
        ],
        status: { [Op.in]: ['pending', 'confirmed', 'checked-in'] }
      }
    });

    if (conflictingReservations.length > 0) {
      return res.status(400).json({ message: 'Room not available for selected dates' });
    }

    // Get room price
    const room = await Room.findByPk(parseInt(roomId));
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is in maintenance during the requested dates
    if (room.status === 'maintenance' && room.maintenanceUntil) {
      const checkInDate = new Date(checkIn);
      const maintenanceEnd = new Date(room.maintenanceUntil);
      checkInDate.setHours(0, 0, 0, 0);
      maintenanceEnd.setHours(0, 0, 0, 0);
      
      if (checkInDate <= maintenanceEnd) {
        return res.status(400).json({ 
          message: `Esta habitación está en mantenimiento hasta el ${maintenanceEnd.toLocaleDateString()}. Por favor selecciona otra fecha o habitación.` 
        });
      }
    }

    // Calculate total amount
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalAmount = parseFloat(room.price) * nights;

    // Generate reservation number
    const reservationNumber = 'RES' + Date.now();

    const reservation = await Reservation.create({
      userId: req.user.id,
      roomId: parseInt(roomId),
      reservationNumber,
      guestFirstName: guestFirstName.trim(),
      guestLastName: guestLastName.trim(),
      guestEmail: guestEmail.trim().toLowerCase(),
      guestPhone: guestPhone.trim(),
      checkIn,
      checkOut,
      adults: parseInt(adults),
      children: parseInt(children) || 0,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      specialRequests: specialRequests || null
    });

    // Update room status if reservation is for today
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const reservationCheckIn = new Date(checkIn);
    reservationCheckIn.setHours(0, 0, 0, 0);
    
    if (reservationCheckIn.getTime() === todayDate.getTime() && room.status !== 'maintenance') {
      room.status = 'occupied';
      await room.save();
    }

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: {
        id: reservation.id,
        reservationNumber: reservation.reservationNumber,
        roomId: reservation.roomId,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        adults: reservation.adults,
        children: reservation.children,
        totalAmount: reservation.totalAmount,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus
      }
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error creating reservation',
      error: error.message 
    });
  }
});

app.get('/api/reservations', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching reservations for user:', req.user);
    
    const where = req.user.role === 'visitor' ? { userId: req.user.id } : {};
    console.log('Reservation where clause:', where);
    
    const reservations = await Reservation.findAll({
      where,
      include: [
        { 
          model: Room, 
          attributes: ['number', 'name', 'type'],
          required: false,
          as: 'room'
        },
        { 
          model: User, 
          attributes: ['firstName', 'lastName', 'email'],
          required: false,
          as: 'user'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${reservations.length} reservations`);
    res.json({ reservations });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update reservation status (confirm, cancel, etc.)
app.put('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only admin and operator can update any reservation, visitors can only cancel their own
    if (req.user.role === 'visitor' && reservation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = reservation.status;
    if (status) reservation.status = status;
    if (paymentStatus) reservation.paymentStatus = paymentStatus;
    
    await reservation.save();

    // Update room status if reservation status changed
    if (status && status !== oldStatus) {
      const { Op } = require('sequelize');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(reservation.checkIn);
      checkInDate.setHours(0, 0, 0, 0);
      const checkOutDate = new Date(reservation.checkOut);
      checkOutDate.setHours(0, 0, 0, 0);

      const room = await Room.findByPk(reservation.roomId);
      
      // If reservation is cancelled or completed, check if room should be available
      if (['cancelled', 'completed'].includes(status)) {
        const otherActiveReservation = await Reservation.findOne({
          where: {
            roomId: reservation.roomId,
            id: { [Op.ne]: reservation.id },
            checkIn: { [Op.lte]: today },
            checkOut: { [Op.gt]: today },
            status: { [Op.in]: ['confirmed', 'checked-in'] }
          }
        });
        
        if (!otherActiveReservation && room.status === 'occupied') {
          room.status = 'available';
          await room.save();
        }
      }
      // If reservation is confirmed and is for today, mark room as occupied
      else if (['confirmed', 'checked-in'].includes(status) && 
                checkInDate <= today && checkOutDate > today &&
                room.status !== 'maintenance') {
        room.status = 'occupied';
        await room.save();
      }
    }

    res.json({ 
      message: 'Reservation updated successfully',
      reservation 
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ message: 'Server error updating reservation' });
  }
});

// Delete reservation
app.delete('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only admin and operator can delete any reservation, visitors can only cancel their own
    if (req.user.role === 'visitor' && reservation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const roomId = reservation.roomId;
    await reservation.destroy();

    // Update room status after deletion
    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const room = await Room.findByPk(roomId);
    if (room && room.status === 'occupied') {
      const otherActiveReservation = await Reservation.findOne({
        where: {
          roomId: roomId,
          checkIn: { [Op.lte]: today },
          checkOut: { [Op.gt]: today },
          status: { [Op.in]: ['confirmed', 'checked-in'] }
        }
      });
      
      if (!otherActiveReservation) {
        room.status = 'available';
        await room.save();
      }
    }

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ message: 'Server error deleting reservation' });
  }
});

// Get single reservation details
app.get('/api/reservations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findByPk(id, {
      include: [
        { 
          model: Room, 
          attributes: ['number', 'name', 'type', 'price'],
          required: false,
          as: 'room'
        },
        { 
          model: User, 
          attributes: ['firstName', 'lastName', 'email', 'phone'],
          required: false,
          as: 'user'
        }
      ]
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check access permissions
    if (req.user.role === 'visitor' && reservation.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ reservation });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ message: 'Server error fetching reservation' });
  }
});

// Process payment
app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { reservationId, amount, paymentMethod, method } = req.body;
    const paymentMethodValue = paymentMethod || method;

    console.log('💳 Payment request:', { reservationId, amount, paymentMethod: paymentMethodValue, user: req.user.email });

    if (!reservationId || !amount || !paymentMethodValue) {
      console.error('Missing fields:', { reservationId, amount, paymentMethod: paymentMethodValue });
      return res.status(400).json({ message: 'Missing required fields: reservationId, amount, and paymentMethod are required' });
    }

    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check if user has permission (admins/operators can pay for any reservation, visitors only for their own)
    if (req.user.role === 'visitor' && reservation.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only pay for your own reservations' });
    }

    // Create payment (transactionId will be auto-generated)
    const payment = await Payment.create({
      reservationId: parseInt(reservationId),
      userId: reservation.userId,
      amount: parseFloat(amount),
      method: paymentMethodValue,
      status: 'completed',
      description: `Payment for reservation ${reservation.reservationNumber}`
    });

    console.log(`✅ Payment created: Transaction ID ${payment.transactionId}`);


    // Update reservation payment status
    reservation.paymentStatus = 'paid';
    await reservation.save();

    // Check if we should delete the reservation (if checkout date has passed and now it's paid)
    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkoutDate = new Date(reservation.checkOut);
    checkoutDate.setHours(0, 0, 0, 0);

    let shouldDelete = false;
    if (checkoutDate < today) {
      // Checkout has passed, delete the reservation since it's now paid
      await Reservation.destroy({ where: { id: reservation.id } });
      shouldDelete = true;
      console.log(`✅ Deleted paid reservation ${reservation.reservationNumber} (checkout date passed)`);
    }

    res.status(201).json({
      message: shouldDelete 
        ? 'Payment processed successfully. Reservation completed and archived.'
        : 'Payment processed successfully',
      payment: {
        id: payment.id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status
      },
      reservationDeleted: shouldDelete
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error processing payment', error: error.message });
  }
});

// Cleanup old reservations (run periodically)
app.post('/api/reservations/cleanup', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'operator') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete completed or cancelled reservations older than 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedCount = await Reservation.destroy({
      where: {
        checkOut: { [Op.lt]: thirtyDaysAgo },
        status: { [Op.in]: ['completed', 'cancelled'] }
      }
    });

    res.json({ 
      message: 'Cleanup completed',
      deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Server error during cleanup' });
  }
});

// Automatic cleanup function for past reservations
const cleanupPastReservations = async () => {
  try {
    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Delete paid reservations that have passed their checkout date
    const deletedPaidCount = await Reservation.destroy({
      where: {
        checkOut: { [Op.lt]: today },
        paymentStatus: 'paid',
        status: { [Op.in]: ['confirmed', 'checked-in', 'checked-out'] }
      }
    });

    // Update unpaid reservations that passed checkout to "payment-pending"
    const updatedUnpaidCount = await Reservation.update(
      { 
        status: 'payment-pending',
        paymentStatus: 'pending'
      },
      {
        where: {
          checkOut: { [Op.lt]: today },
          paymentStatus: { [Op.ne]: 'paid' },
          status: { [Op.in]: ['confirmed', 'checked-in', 'checked-out'] }
        }
      }
    );

    if (deletedPaidCount > 0 || updatedUnpaidCount[0] > 0) {
      console.log(`🧹 Auto-cleanup: Deleted ${deletedPaidCount} paid reservations, Updated ${updatedUnpaidCount[0]} unpaid to payment-pending`);
    }
  } catch (error) {
    console.error('Auto-cleanup error:', error);
  }
};

// Update room statuses based on active reservations
const updateRoomStatuses = async () => {
  try {
    const { Op } = require('sequelize');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rooms = await Room.findAll();
    let updatedCount = 0;

    for (const room of rooms) {
      // Check if maintenance period has ended
      if (room.status === 'maintenance' && room.maintenanceUntil) {
        const maintenanceEnd = new Date(room.maintenanceUntil);
        maintenanceEnd.setHours(0, 0, 0, 0);
        
        if (today > maintenanceEnd) {
          room.status = 'available';
          room.maintenanceUntil = null;
          await room.save();
          updatedCount++;
          console.log(`🔧 Room ${room.number} maintenance period ended, now available`);
          continue;
        } else {
          // Still in maintenance, skip
          continue;
        }
      }

      const activeReservation = await Reservation.findOne({
        where: {
          roomId: room.id,
          checkIn: { [Op.lte]: today },
          checkOut: { [Op.gt]: today },
          status: { [Op.in]: ['confirmed', 'checked-in'] }
        }
      });

      if (activeReservation && room.status !== 'occupied') {
        room.status = 'occupied';
        await room.save();
        updatedCount++;
      } else if (!activeReservation && room.status === 'occupied') {
        room.status = 'available';
        await room.save();
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`🔄 Room status update: Updated ${updatedCount} rooms`);
    }
  } catch (error) {
    console.error('Room status update error:', error);
  }
};

// Run cleanup every 24 hours
setInterval(cleanupPastReservations, 24 * 60 * 60 * 1000);

// Run room status update every 5 minutes
setInterval(updateRoomStatuses, 5 * 60 * 1000);

// Run both on server start
cleanupPastReservations();
updateRoomStatuses();

// Add profile endpoint for auth check
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Users API routes (Admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { role, page = 1, limit = 10, search } = req.query;
    const { Op } = require('sequelize');
    
    let where = {};
    if (role) where.role = role;
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      offset,
      limit: parseInt(limit)
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// Create user (admin only)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { firstName, lastName, email, password, phone, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'visitor',
      phone
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

// Update user (admin only)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, email, phone, role, password } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (password) user.password = password;

    await user.save();

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// Public registration endpoint for visitors
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: 'visitor',
      phone
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { firstName, lastName, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      phone
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error creating user' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ where: { email: req.body.email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Prevent admin from deactivating themselves
    if (req.body.isActive === false && user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    await user.update(req.body);

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Soft delete by setting isActive to false
    await user.update({ isActive: false });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Serve React app for all routes (catch-all route must be last)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // In production, serve React build
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, 'hotel-react/build', 'index.html'));
  } else {
    // In development, just return a simple message since React dev server handles routing
    res.json({ message: 'React development server should handle this route' });
  }
});

// Contact routes
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      status: 'pending',
      priority: 'medium'
    });

    res.status(201).json({
      message: 'Message sent successfully',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        status: contact.status
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Hotel Server...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    await sequelize.sync();
    console.log('✅ Database synced');
    
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🌟 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
