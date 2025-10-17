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

    // Create rooms with rich descriptions and multiple images
    // We'll create multiple rooms of each type
    const roomTemplates = {
      single: {
        name: 'Habitación Individual Clásica',
        description: 'Perfecta para viajeros solitarios que buscan comodidad y funcionalidad. Esta acogedora habitación cuenta con una cama individual de lujo, escritorio de trabajo, y una decoración moderna en tonos azules y blancos que reflejan la tranquilidad del océano. Incluye baño privado con ducha de efecto lluvia y productos de tocador premium.',
        price: 120.00,
        capacity: 1,
        size: 20,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          roomService: true
        },
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
          'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80'
        ],
        count: 5,
        floors: [1, 1, 2, 2, 3]
      },
      singleDeluxe: {
        type: 'single',
        name: 'Habitación Individual Deluxe',
        description: 'Una experiencia superior para el viajero exigente. Esta habitación combina elegancia y tecnología con cama king size, sistema de sonido Bluetooth, TV Smart de 50", y un pequeño balcón privado con vista al jardín. El baño de mármol incluye bañera profunda y amenidades de lujo. Ideal para estancias de trabajo o placer.',
        price: 165.00,
        capacity: 1,
        size: 28,
        floor: 1,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          roomService: true,
          breakfast: true
        },
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80',
          'https://images.unsplash.com/photo-1578898887654-cbe78d0e79f6?w=1200&q=80'
        ],
        status: 'available'
      },

      // DOUBLE ROOMS
      {
        number: '201',
        type: 'double',
        name: 'Habitación Doble Estándar',
        description: 'Espaciosa y confortable, perfecta para parejas o colegas de trabajo. Decorada con elegancia contemporánea, cuenta con cama king size o dos camas individuales según preferencia. La habitación incluye zona de estar con sofá, escritorio amplio, y baño completo con ducha y bañera separadas. Las ventanas panorámicas ofrecen abundante luz natural.',
        price: 185.00,
        capacity: 2,
        size: 32,
        floor: 2,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          roomService: true
        },
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80',
          'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=1200&q=80',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'
        ],
        status: 'occupied'
      },
      {
        number: '205',
        type: 'double',
        name: 'Habitación Doble Superior',
        description: 'Refinamiento y confort en cada detalle. Esta habitación premium ofrece vistas espectaculares a la ciudad desde su amplio balcón privado. Equipada con cama king size de colchón premium, ropa de cama de 400 hilos, sistema de iluminación inteligente, y cafetera Nespresso. El baño de diseño cuenta con doble lavabo, ducha de hidromasaje y bañera independiente.',
        price: 235.00,
        capacity: 2,
        size: 38,
        floor: 2,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          cityView: true,
          roomService: true,
          breakfast: true
        },
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80',
          'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=1200&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
          'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&q=80'
        ],
        status: 'available'
      },
      {
        number: '210',
        type: 'double',
        name: 'Habitación Doble Vista Mar',
        description: 'Despierta con el sonido de las olas y vistas panorámicas al océano. Esta habitación de esquina cuenta con ventanales de piso a techo que inundan el espacio de luz natural y ofrecen vistas impresionantes. Incluye balcón privado con mobiliario de lujo, cama king size, zona de estar independiente, y baño spa con bañera de hidromasaje frente a la ventana. El paquete incluye desayuno continental y champagne de bienvenida.',
        price: 295.00,
        capacity: 2,
        size: 42,
        floor: 2,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          oceanView: true,
          roomService: true,
          breakfast: true,
          jacuzzi: true
        },
        images: [
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80',
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80'
        ],
        status: 'available'
      },

      // SUITES
      {
        number: '301',
        type: 'suite',
        name: 'Junior Suite',
        description: 'El equilibrio perfecto entre espacio y sofisticación. Esta suite de concepto abierto integra dormitorio y sala de estar en un diseño armonioso de 55m². Cuenta con cama king size con dosel, zona de trabajo ejecutiva, sala de estar con sofá cama, comedor para 4 personas, y cocina completa. El baño master incluye ducha de lluvia, bañera de hidromasaje, y tocador doble. Perfecta para estancias prolongadas o familias pequeñas.',
        price: 380.00,
        capacity: 3,
        size: 55,
        floor: 3,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          cityView: true,
          roomService: true,
          breakfast: true,
          parking: true
        },
        images: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&q=80',
          'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80'
        ],
        status: 'maintenance'
      },
      {
        number: '305',
        type: 'suite',
        name: 'Suite Ejecutiva',
        description: 'Diseñada para el ejecutivo moderno que no compromete comodidad por productividad. Esta suite de dos ambientes ofrece un dormitorio principal con vestidor walk-in, sala de estar independiente con Smart TV de 65", zona de trabajo con escritorio ejecutivo y silla ergonómica, y comedor formal. La cocina está completamente equipada con electrodomésticos de última generación. El baño master presenta acabados en mármol, ducha doble, jacuzzi, y sauna privada. Incluye servicio de mayordomo 24/7.',
        price: 480.00,
        capacity: 3,
        size: 65,
        floor: 3,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          cityView: true,
          roomService: true,
          breakfast: true,
          jacuzzi: true,
          parking: true
        },
        images: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
          'https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=1200&q=80',
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80'
        ],
        status: 'available'
      },

      // DELUXE ROOMS
      {
        number: '401',
        type: 'deluxe',
        name: 'Habitación Deluxe con Jacuzzi',
        description: 'Lujo y romance en su máxima expresión. Esta habitación boutique ofrece una experiencia íntima con su jacuzzi de hidromasaje de dos plazas ubicado junto a ventanales con vista panorámica. La decoración combina elementos modernos con toques clásicos, creando un ambiente sofisticado y acogedor. Incluye cama king size con doseles de seda, chimenea eléctrica, sistema de audio surround, minibar premium, y baño de spa con ducha de vapor y productos de lujo. El servicio incluye chocolates artesanales, champagne de bienvenida, y pétalos de rosa.',
        price: 495.00,
        capacity: 2,
        size: 48,
        floor: 4,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          cityView: true,
          jacuzzi: true,
          roomService: true,
          breakfast: true,
          parking: true
        },
        images: [
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80'
        ],
        status: 'available'
      },
      {
        number: '405',
        type: 'deluxe',
        name: 'Habitación Deluxe Panorámica',
        description: 'Una experiencia visual incomparable en el piso más alto del hotel. Esta habitación de esquina ofrece vistas de 180 grados de la ciudad y el océano a través de ventanales de piso a techo. El diseño minimalista de lujo maximiza la sensación de espacio y luz. Equipada con cama king size de tecnología sleep number, sistema domótico completo, terraza privada amueblada de 15m², minibar gourmet, y baño de mármol italiano con bañera exenta con vista, ducha de lluvia doble, y amenidades Hermès. Incluye acceso exclusivo al lounge ejecutivo y spa.',
        price: 585.00,
        capacity: 2,
        size: 52,
        floor: 4,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          oceanView: true,
          cityView: true,
          jacuzzi: true,
          roomService: true,
          breakfast: true,
          parking: true
        },
        images: [
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80',
          'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80'
        ],
        status: 'available'
      },

      // PRESIDENTIAL SUITE
      {
        number: '501',
        type: 'presidential',
        name: 'Suite Presidencial Azure',
        description: 'La cúspide del lujo y la exclusividad. Esta magnífica suite de 120m² ocupa todo el piso superior y ofrece una experiencia sin igual. Incluye dormitorio principal con cama king size custom-made, vestidor completo, segundo dormitorio con camas twin, sala de estar formal con piano de cola, comedor para 8 personas, cocina gourmet completamente equipada con chef opcional, biblioteca privada, gimnasio personal, y terraza panorámica de 40m² con jacuzzi exterior, bar y zona de barbacoa. Los dos baños master cuentan con bañeras de hidromasaje, saunas privadas, duchas de vapor, y acabados en mármol Calacatta. Incluye mayordomo personal 24/7, servicio de chef privado, transporte en limusina desde/hacia el aeropuerto, acceso VIP a todos los servicios del hotel, spa privado bajo reserva, y bar premium totalmente surtido. Perfecta para dignatarios, celebridades, o celebraciones especiales.',
        price: 1200.00,
        capacity: 4,
        size: 120,
        floor: 5,
        features: {
          wifi: true,
          tv: true,
          airConditioning: true,
          safe: true,
          minibar: true,
          balcony: true,
          oceanView: true,
          cityView: true,
          jacuzzi: true,
          roomService: true,
          breakfast: true,
          parking: true
        },
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
          'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&q=80',
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80'
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
