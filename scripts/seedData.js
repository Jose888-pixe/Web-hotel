const { sequelize, User, Room, Reservation, Payment, Contact } = require('../models');
require('dotenv').config();

const seedData = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to SQLite Database');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('🗄️ Database synchronized');

    // Create users
    const users = [
      {
        firstName: 'Admin',
        lastName: 'Hotel',
        email: 'admin@hotelelegance.com',
        password: 'admin123',
        role: 'admin',
        phone: '+34 91 123 4567'
      },
      {
        firstName: 'Operador',
        lastName: 'Hotel',
        email: 'operator@hotelelegance.com',
        password: 'operator123',
        role: 'operator',
        phone: '+34 91 123 4568'
      },
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        password: 'visitor123',
        role: 'visitor',
        phone: '+34 91 123 4569',
        street: 'Calle Mayor 123',
        city: 'Madrid',
        state: 'Madrid',
        zipCode: '28001',
        country: 'España'
      }
    ];

    const createdUsers = await User.bulkCreate(users, { individualHooks: true });
    console.log('👥 Created users:', createdUsers.length);

    // Create rooms
    const rooms = [
      {
        number: '101',
        type: 'single',
        name: 'Habitación Individual Clásica',
        description: 'Acogedora habitación individual con todas las comodidades necesarias para una estancia confortable.',
        price: 120.00,
        capacity: 1,
        size: 20,
        floor: 1,
        features: ['wifi', 'tv', 'aircon', 'safe'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
            alt: 'Habitación Individual Clásica',
            isPrimary: true
          }
        ],
        status: 'available'
      },
      {
        number: '102',
        type: 'single',
        name: 'Habitación Individual Superior',
        description: 'Habitación individual con vistas al jardín y amenidades premium.',
        price: 150.00,
        capacity: 1,
        size: 25,
        floor: 1,
        features: ['wifi', 'tv', 'aircon', 'safe', 'balcony'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            alt: 'Habitación Individual Superior',
            isPrimary: true
          }
        ],
        status: 'available'
      },
      {
        number: '201',
        type: 'double',
        name: 'Habitación Doble Estándar',
        description: 'Espaciosa habitación doble perfecta para parejas o viajeros de negocios.',
        price: 180.00,
        capacity: 2,
        size: 30,
        floor: 2,
        features: ['wifi', 'tv', 'aircon', 'safe', 'minibar'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
            alt: 'Habitación Doble Estándar',
            isPrimary: true
          }
        ],
        status: 'occupied'
      },
      {
        number: '202',
        type: 'double',
        name: 'Habitación Doble Superior',
        description: 'Habitación doble con balcón privado y vistas panorámicas de la ciudad.',
        price: 220.00,
        capacity: 2,
        size: 35,
        floor: 2,
        features: ['wifi', 'tv', 'aircon', 'safe', 'minibar', 'balcony'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
            alt: 'Habitación Doble Superior',
            isPrimary: true
          }
        ],
        status: 'available'
      },
      {
        number: '301',
        type: 'suite',
        name: 'Suite Ejecutiva',
        description: 'Elegante suite con área de estar separada, perfecta para estancias prolongadas.',
        price: 350.00,
        capacity: 3,
        size: 50,
        floor: 3,
        features: ['wifi', 'tv', 'aircon', 'safe', 'minibar', 'balcony', 'workspace'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
            alt: 'Suite Ejecutiva',
            isPrimary: true
          }
        ],
        status: 'maintenance'
      },
      {
        number: '401',
        type: 'deluxe',
        name: 'Habitación Deluxe',
        description: 'Lujosa habitación con jacuzzi privado y amenidades de primera clase.',
        price: 450.00,
        capacity: 2,
        size: 45,
        floor: 4,
        features: ['wifi', 'tv', 'aircon', 'safe', 'minibar', 'balcony', 'jacuzzi', 'workspace'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
            alt: 'Habitación Deluxe',
            isPrimary: true
          }
        ],
        status: 'available'
      },
      {
        number: '501',
        type: 'presidential',
        name: 'Suite Presidencial',
        description: 'La suite más exclusiva del hotel con todas las comodidades de lujo imaginables.',
        price: 800.00,
        capacity: 4,
        size: 80,
        floor: 5,
        features: ['wifi', 'tv', 'aircon', 'safe', 'minibar', 'balcony', 'jacuzzi', 'workspace', 'kitchenette', 'breakfast'],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
            alt: 'Suite Presidencial',
            isPrimary: true
          }
        ],
        status: 'available'
      }
    ];

    const createdRooms = await Room.bulkCreate(rooms);
    console.log('🏨 Created rooms:', createdRooms.length);

    // Create sample reservations
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setDate(nextMonth.getDate() + 30);

    const reservations = [
      {
        userId: createdUsers[2].id, // Juan Pérez
        roomId: createdRooms[0].id, // Room 101 - ACTIVA HOY
        reservationNumber: 'RES000001',
        guestFirstName: 'Juan',
        guestLastName: 'Pérez',
        guestEmail: 'juan@example.com',
        guestPhone: '+34 91 123 4569',
        checkIn: today.toISOString().split('T')[0],
        checkOut: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adults: 1,
        children: 0,
        totalAmount: 240.00,
        status: 'confirmed',
        paymentStatus: 'pending',
        source: 'website'
      },
      {
        userId: createdUsers[2].id, // Juan Pérez
        roomId: createdRooms[2].id, // Room 201
        reservationNumber: 'RES000002',
        guestFirstName: 'Juan',
        guestLastName: 'Pérez',
        guestEmail: 'juan@example.com',
        guestPhone: '+34 91 123 4569',
        checkIn: nextWeek.toISOString().split('T')[0],
        checkOut: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adults: 2,
        children: 0,
        totalAmount: 540.00,
        status: 'confirmed',
        paymentStatus: 'paid',
        source: 'website'
      },
      {
        userId: createdUsers[0].id, // Admin
        roomId: createdRooms[4].id, // Room 301
        reservationNumber: 'RES000003',
        guestFirstName: 'Admin',
        guestLastName: 'User',
        guestEmail: 'admin@hotelelegance.com',
        guestPhone: '+34 91 111 1111',
        checkIn: nextMonth.toISOString().split('T')[0],
        checkOut: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        adults: 2,
        children: 1,
        totalAmount: 1250.00,
        status: 'pending',
        paymentStatus: 'pending',
        source: 'website'
      }
    ];

    const createdReservations = await Reservation.bulkCreate(reservations);
    console.log('📅 Created reservations:', createdReservations.length);

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@hotelelegance.com / admin123');
    console.log('Operator: operator@hotelelegance.com / operator123');
    console.log('Visitor: juan@example.com / visitor123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await sequelize.close();
    console.log('📡 Disconnected from database');
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
