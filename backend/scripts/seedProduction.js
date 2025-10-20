const { User, Room } = require('../models');
require('dotenv').config();

const seedProduction = async () => {
  try {
    // Check if database already has data
    const userCount = await User.count();
    const roomCount = await Room.count();

    if (userCount > 0 || roomCount > 0) {
      console.log('⚠️  Database already has data. Skipping seed.');
      console.log(`   Users: ${userCount}, Rooms: ${roomCount}`);
      return;
    }

    console.log('🌱 Seeding production database...');

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
      }
    ];

    const createdUsers = await User.bulkCreate(users, { individualHooks: true });
    console.log('👥 Created users:', createdUsers.length);

    // Room templates
    const roomTemplates = [
      {
        type: 'single',
        name: 'Habitación Individual Clásica',
        description: 'Perfecta para viajeros solitarios que buscan comodidad y funcionalidad.',
        price: 120.00,
        capacity: 1,
        size: 20,
        features: { wifi: true, tv: true, airConditioning: true, safe: true, roomService: true },
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80'],
        count: 5,
        startNumber: 101,
        floors: [1, 1, 2, 2, 3]
      },
      {
        type: 'double',
        name: 'Habitación Doble Estándar',
        description: 'Espaciosa y confortable, perfecta para parejas o colegas de trabajo.',
        price: 185.00,
        capacity: 2,
        size: 32,
        features: { wifi: true, tv: true, airConditioning: true, safe: true, minibar: true, roomService: true },
        images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80'],
        count: 6,
        startNumber: 201,
        floors: [2, 2, 2, 3, 3, 3]
      },
      {
        type: 'suite',
        name: 'Junior Suite',
        description: 'El equilibrio perfecto entre espacio y sofisticación.',
        price: 380.00,
        capacity: 3,
        size: 55,
        features: { wifi: true, tv: true, airConditioning: true, safe: true, minibar: true, balcony: true, cityView: true, roomService: true, breakfast: true, parking: true },
        images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80'],
        count: 3,
        startNumber: 301,
        floors: [3, 4, 4]
      },
      {
        type: 'presidential',
        name: 'Suite Presidencial Azure',
        description: 'La cúspide del lujo y la exclusividad.',
        price: 1200.00,
        capacity: 4,
        size: 120,
        features: { wifi: true, tv: true, airConditioning: true, safe: true, minibar: true, balcony: true, oceanView: true, cityView: true, jacuzzi: true, roomService: true, breakfast: true, parking: true },
        images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80'],
        count: 1,
        startNumber: 501,
        floors: [5]
      }
    ];

    // Generate rooms from templates
    const rooms = [];
    roomTemplates.forEach(template => {
      for (let i = 0; i < template.count; i++) {
        const roomNumber = (template.startNumber + i).toString();
        const floor = template.floors[i] || template.floors[0];
        
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
          status: 'available',
          isActive: true
        });
      }
    });

    const createdRooms = await Room.bulkCreate(rooms);
    console.log('🏨 Created rooms:', createdRooms.length);

    console.log('\n✅ Production seed completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Rooms: ${createdRooms.length}`);
    console.log('\n📋 Login Credentials:');
    console.log('   Admin: admin@hotelelegance.com / admin123');
    console.log('   Operator: operator@hotelelegance.com / operator123');

  } catch (error) {
    console.error('❌ Error seeding production data:', error);
    throw error;
  }
};

module.exports = seedProduction;
