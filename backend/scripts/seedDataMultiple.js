const { sequelize, User, Room, Reservation, Payment, Contact } = require('../models');
require('dotenv').config();

const seedData = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Connected to Database');

    // Sync database (create tables)
    await sequelize.sync({ force: true });
    console.log('🗄️  Database synchronized');

    // Create users
    const users = [
      {
        firstName: 'Admin',
        lastName: 'Hotel',
        email: 'admin@azuresuites.com',
        password: 'admin123',
        role: 'admin',
        phone: '+34 91 123 4567'
      },
      {
        firstName: 'Operador',
        lastName: 'Hotel',
        email: 'operator@azuresuites.com',
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

    // Room templates - we'll create multiple rooms from each template
    const roomTemplates = [
      {
        type: 'single',
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
        count: 5,  // Create 5 rooms of this type
        startNumber: 101,
        floors: [1, 1, 2, 2, 3]
      },
      {
        type: 'single',
        name: 'Habitación Individual Deluxe',
        description: 'Una experiencia superior para el viajero exigente. Esta habitación combina elegancia y tecnología con cama king size, sistema de sonido Bluetooth, TV Smart de 50", y un pequeño balcón privado con vista al jardín. El baño de mármol incluye bañera profunda y amenidades de lujo. Ideal para estancias de trabajo o placer.',
        price: 165.00,
        capacity: 1,
        size: 28,
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
        count: 3,
        startNumber: 106,
        floors: [1, 2, 3]
      },
      {
        type: 'double',
        name: 'Habitación Doble Estándar',
        description: 'Espaciosa y confortable, perfecta para parejas o colegas de trabajo. Decorada con elegancia contemporánea, cuenta con cama king size o dos camas individuales según preferencia. La habitación incluye zona de estar con sofá, escritorio amplio, y baño completo con ducha y bañera separadas. Las ventanas panorámicas ofrecen abundante luz natural.',
        price: 185.00,
        capacity: 2,
        size: 32,
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
        count: 6,
        startNumber: 201,
        floors: [2, 2, 2, 3, 3, 3]
      },
      {
        type: 'double',
        name: 'Habitación Doble Superior',
        description: 'Refinamiento y confort en cada detalle. Esta habitación premium ofrece vistas espectaculares a la ciudad desde su amplio balcón privado. Equipada con cama king size de colchón premium, ropa de cama de 400 hilos, sistema de iluminación inteligente, y cafetera Nespresso. El baño de diseño cuenta con doble lavabo, ducha de hidromasaje y bañera independiente.',
        price: 235.00,
        capacity: 2,
        size: 38,
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
        count: 4,
        startNumber: 207,
        floors: [2, 3, 3, 4]
      },
      {
        type: 'suite',
        name: 'Junior Suite',
        description: 'El equilibrio perfecto entre espacio y sofisticación. Esta suite de concepto abierto integra dormitorio y sala de estar en un diseño armonioso de 55m². Cuenta con cama king size con dosel, zona de trabajo ejecutiva, sala de estar con sofá cama, comedor para 4 personas, y cocina completa. El baño master incluye ducha de lluvia, bañera de hidromasaje, y tocador doble. Perfecta para estancias prolongadas o familias pequeñas.',
        price: 380.00,
        capacity: 3,
        size: 55,
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
        count: 3,
        startNumber: 301,
        floors: [3, 4, 4]
      },
      {
        type: 'suite',
        name: 'Suite Ejecutiva',
        description: 'Diseñada para el ejecutivo moderno que no compromete comodidad por productividad. Esta suite de dos ambientes ofrece un dormitorio principal con vestidor walk-in, sala de estar independiente con Smart TV de 65", zona de trabajo con escritorio ejecutivo y silla ergonómica, y comedor formal. La cocina está completamente equipada con electrodomésticos de última generación. El baño master presenta acabados en mármol, ducha doble, jacuzzi, y sauna privada. Incluye servicio de mayordomo 24/7.',
        price: 480.00,
        capacity: 3,
        size: 65,
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
        count: 2,
        startNumber: 304,
        floors: [3, 4]
      },
      {
        type: 'deluxe',
        name: 'Habitación Deluxe con Jacuzzi',
        description: 'Lujo y romance en su máxima expresión. Esta habitación boutique ofrece una experiencia íntima con su jacuzzi de hidromasaje de dos plazas ubicado junto a ventanales con vista panorámica. La decoración combina elementos modernos con toques clásicos, creando un ambiente sofisticado y acogedor. Incluye cama king size con doseles de seda, chimenea eléctrica, sistema de audio surround, minibar premium, y baño de spa con ducha de vapor y productos de lujo. El servicio incluye chocolates artesanales, champagne de bienvenida, y pétalos de rosa.',
        price: 495.00,
        capacity: 2,
        size: 48,
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
        count: 2,
        startNumber: 401,
        floors: [4, 5]
      },
      {
        type: 'presidential',
        name: 'Suite Presidencial Azure',
        description: 'La cúspide del lujo y la exclusividad. Esta magnífica suite de 120m² ocupa todo el piso superior y ofrece una experiencia sin igual. Incluye dormitorio principal con cama king size custom-made, vestidor completo, segundo dormitorio con camas twin, sala de estar formal con piano de cola, comedor para 8 personas, cocina gourmet completamente equipada con chef opcional, biblioteca privada, gimnasio personal, y terraza panorámica de 40m² con jacuzzi exterior, bar y zona de barbacoa. Los dos baños master cuentan con bañeras de hidromasaje, saunas privadas, duchas de vapor, y acabados en mármol Calacatta. Incluye mayordomo personal 24/7, servicio de chef privado, transporte en limusina desde/hacia el aeropuerto, acceso VIP a todos los servicios del hotel, spa privado bajo reserva, y bar premium totalmente surtido. Perfecta para dignatarios, celebridades, o celebraciones especiales.',
        price: 1200.00,
        capacity: 4,
        size: 120,
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
        count: 1,
        startNumber: 501,
        floors: [5]
      }
    ];

    // Generate rooms from templates
    const rooms = [];
    const statuses = ['available', 'available', 'available', 'occupied', 'maintenance'];
    
    roomTemplates.forEach(template => {
      for (let i = 0; i < template.count; i++) {
        const roomNumber = (template.startNumber + i).toString();
        const floor = template.floors[i] || template.floors[0];
        const status = i === 0 ? 'available' : statuses[i % statuses.length];
        
        rooms.push({
          number: roomNumber,
          type: template.type,
          name: template.name,
          description: template.description,
          price: template.price,
          capacity: template.capacity,
          size: template.size,
          floor: floor,
          features: template.features,
          images: template.images,
          status: status,
          isActive: true
        });
      }
    });

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
        userId: createdUsers[2].id,
        roomId: createdRooms[0].id,
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
        userId: createdUsers[2].id,
        roomId: createdRooms[8].id,
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
      }
    ];

    const createdReservations = await Reservation.bulkCreate(reservations);
    console.log('📅 Created reservations:', createdReservations.length);

    console.log('\n✅ Seed data created successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Rooms: ${createdRooms.length}`);
    console.log(`   Reservations: ${createdReservations.length}`);
    console.log('\n📋 Test Credentials:');
    console.log('   Admin: admin@azuresuites.com / admin123');
    console.log('   Operator: operator@azuresuites.com / operator123');
    console.log('   Visitor: juan@example.com / visitor123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await sequelize.close();
    console.log('\n📡 Disconnected from database');
  }
};

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = seedData;
