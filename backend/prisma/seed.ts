import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.tourGuide.deleteMany();
  await prisma.tourDestination.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@viceroytravels.com',
      password: adminPassword,
      isSuperAdmin: true,
      phone: '+880 1700-000000',
      address: 'Dhaka, Bangladesh',
    },
  });
  console.log(`✅ Created admin user: ${admin.email} (password: password123)`);

  // Create a regular user
  const userPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'user@viceroytravels.com',
      password: userPassword,
      phone: '+880 1700-000001',
      address: 'Dhaka, Bangladesh',
    },
  });
  console.log(`✅ Created test user: ${user.email} (password: password123)`);

  // Create destinations
  const destinations = await Promise.all([
    prisma.tourDestination.create({
      data: {
        slug: 'santorini-greece',
        title: 'Santorini',
        country: 'Greece',
        city: 'Santorini',
        locationLabel: 'Santorini, Cyclades, Greece',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Experience the iconic white-washed buildings and stunning sunsets of Santorini.',
        description: 'Santorini is a stunning volcanic island in the Cyclades group of the Greek islands. Known for its dramatic views, stunning sunsets, white-washed buildings, and blue-domed churches, it offers an unforgettable travel experience. Explore the charming villages of Oia and Fira, relax on unique red and black sand beaches, and taste exquisite local wines.',
        duration: '5-7 Days',
        price: '$1,200 - $2,500',
        rating: 4.8,
      },
    }),
    prisma.tourDestination.create({
      data: {
        slug: 'kyoto-japan',
        title: 'Kyoto',
        country: 'Japan',
        city: 'Kyoto',
        locationLabel: 'Kyoto, Kansai, Japan',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Discover ancient temples, traditional tea ceremonies, and cherry blossoms in Kyoto.',
        description: 'Kyoto, once the capital of Japan, is a city where tradition meets natural beauty. Home to thousands of classical Buddhist temples, gardens, imperial palaces, Shinto shrines, and traditional wooden houses, it offers a deep dive into Japanese culture. Visit the golden Kinkaku-ji, walk through the bamboo grove of Arashiyama, and experience a traditional tea ceremony.',
        duration: '4-6 Days',
        price: '$1,500 - $3,000',
        rating: 4.9,
      },
    }),
    prisma.tourDestination.create({
      data: {
        slug: 'paris-france',
        title: 'Paris',
        country: 'France',
        city: 'Paris',
        locationLabel: 'Paris, Île-de-France, France',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'The City of Light awaits with its iconic landmarks, world-class cuisine, and romantic ambiance.',
        description: 'Paris, the capital of France, is one of the most iconic cities in the world. From the Eiffel Tower to the Louvre Museum, from charming sidewalk cafés to world-class fashion boutiques, Paris offers an endless array of experiences. Explore historic neighborhoods like Montmartre and Le Marais, savor French cuisine, and immerse yourself in art and culture.',
        duration: '4-7 Days',
        price: '$1,800 - $4,000',
        rating: 4.7,
      },
    }),
    prisma.tourDestination.create({
      data: {
        slug: 'maldives-beach',
        title: 'Maldives',
        country: 'Maldives',
        city: 'Malé Atoll',
        locationLabel: 'Malé Atoll, Maldives',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Paradise found: crystal waters, overwater villas, and pristine white-sand beaches.',
        description: 'The Maldives is a tropical paradise known for its crystal-clear waters, white-sand beaches, and luxurious overwater villas. This island nation in the Indian Ocean offers world-class diving, snorkeling, and water sports. Relax on pristine beaches, explore vibrant coral reefs, and enjoy unparalleled luxury in one of the most beautiful destinations on Earth.',
        duration: '5-8 Days',
        price: '$2,500 - $6,000',
        rating: 4.9,
      },
    }),
    prisma.tourDestination.create({
      data: {
        slug: 'swiss-alps',
        title: 'Swiss Alps',
        country: 'Switzerland',
        city: 'Interlaken',
        locationLabel: 'Interlaken, Bernese Oberland, Switzerland',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Majestic mountains, pristine lakes, and world-class skiing in the heart of Europe.',
        description: 'The Swiss Alps offer some of the most breathtaking mountain scenery in the world. From the iconic Matterhorn to the Jungfrau region, this is a paradise for outdoor enthusiasts. Enjoy skiing, hiking, paragliding, and scenic train rides through stunning alpine landscapes. Visit charming mountain villages and experience Swiss hospitality at its finest.',
        duration: '6-10 Days',
        price: '$2,000 - $5,000',
        rating: 4.8,
      },
    }),
    prisma.tourDestination.create({
      data: {
        slug: 'machu-picchu-peru',
        title: 'Machu Picchu',
        country: 'Peru',
        city: 'Cusco',
        locationLabel: 'Cusco Region, Peru',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
        shortDescription: 'Explore the ancient Incan citadel nestled high in the Andes Mountains.',
        description: 'Machu Picchu is a 15th-century Incan citadel situated on a mountain ridge in the Eastern Cordillera of southern Peru. It is the most familiar icon of Inca civilization and one of the most famous archaeological sites in the world. Hike the Inca Trail, explore the Sun Gate, and marvel at the engineering genius of the ancient Incas.',
        duration: '4-6 Days',
        price: '$1,500 - $3,500',
        rating: 4.9,
      },
    }),
  ]);
  console.log(`✅ Created ${destinations.length} destinations`);

  // Create tour guides for each destination
  const guideData = [
    {
      destinationId: 1,
      name: 'Elena Papadopoulos',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      description: 'Born and raised on Santorini, Elena knows every hidden gem on the island. With a degree in archaeology and years of guiding experience, she brings the rich history of the island to life. Her sunset tour is legendary among travelers.',
      rating: 5,
      location: 'Santorini, Greece',
      experienceYears: 8,
      languages: 'Greek, English, French',
      hireCost: 85.00,
      phone: '+30 690 123 4567',
      email: 'elena@santorini-guide.com',
    },
    {
      destinationId: 1,
      name: 'Nikos Karamalis',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      description: 'Nikos is a certified sommelier and local food expert. His tours combine Santorini\'s famous wine culture with stunning coastal views. He knows the best family-owned tavernas and hidden beaches.',
      rating: 4,
      location: 'Santorini, Greece',
      experienceYears: 6,
      languages: 'Greek, English, Italian',
      hireCost: 75.00,
      phone: '+30 690 234 5678',
    },
    {
      destinationId: 2,
      name: 'Yuki Tanaka',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
      description: 'Yuki is a Kyoto native and certified tea ceremony instructor. She offers intimate cultural experiences that go beyond typical tourist paths. Her knowledge of Kyoto\'s temples and traditions is unparalleled.',
      rating: 5,
      location: 'Kyoto, Japan',
      experienceYears: 10,
      languages: 'Japanese, English, Mandarin',
      hireCost: 95.00,
      email: 'yuki@kyoto-guide.jp',
    },
    {
      destinationId: 2,
      name: 'Kenji Watanabe',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      description: 'Kenji is a former Buddhist monk turned tour guide. He offers unique insight into Japanese spirituality and philosophy. His bamboo forest meditation sessions are truly transformative.',
      rating: 5,
      location: 'Kyoto, Japan',
      experienceYears: 7,
      languages: 'Japanese, English',
      hireCost: 80.00,
      phone: '+81 75 123 4567',
    },
    {
      destinationId: 3,
      name: 'Marie Dubois',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      description: 'Marie is an art historian with a passion for Parisian culture. Her walking tours cover the hidden passages of Paris, street art, and the best croissants in town. She makes every visitor feel like a local.',
      rating: 4,
      location: 'Paris, France',
      experienceYears: 9,
      languages: 'French, English, Spanish',
      hireCost: 90.00,
      phone: '+33 6 12 34 56 78',
      email: 'marie@paris-guide.fr',
    },
    {
      destinationId: 3,
      name: 'Pierre Laurent',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      description: 'Pierre is a culinary expert and former chef. His food tours take travelers through Parisian markets, bakeries, and hidden bistros. He also offers cooking classes featuring classic French dishes.',
      rating: 5,
      location: 'Paris, France',
      experienceYears: 12,
      languages: 'French, English, German',
      hireCost: 110.00,
      phone: '+33 6 98 76 54 32',
    },
    {
      destinationId: 4,
      name: 'Aisha Mohamed',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      description: 'Aisha grew up in the Maldives and knows every coral reef and sandbank. She is a PADI-certified dive master and marine biologist. Her snorkeling tours reveal the incredible underwater world of the Indian Ocean.',
      rating: 5,
      location: 'Malé Atoll, Maldives',
      experienceYears: 6,
      languages: 'Dhivehi, English, Arabic',
      hireCost: 120.00,
      email: 'aisha@maldives-dive.com',
    },
    {
      destinationId: 5,
      name: 'Hans Mueller',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      description: 'Hans is a certified mountain guide with over 15 years of experience in the Swiss Alps. He leads hiking, climbing, and skiing expeditions. His knowledge of alpine safety and local trails is unmatched.',
      rating: 5,
      location: 'Interlaken, Switzerland',
      experienceYears: 15,
      languages: 'German, French, English, Italian',
      hireCost: 150.00,
      phone: '+41 79 123 45 67',
    },
    {
      destinationId: 5,
      name: 'Sophie Weber',
      photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=400&q=80',
      description: 'Sophie is a photographer and nature enthusiast. Her tours focus on capturing the stunning Alpine scenery. She knows the best viewpoints for sunrise photography and hidden valleys untouched by mass tourism.',
      rating: 4,
      location: 'Interlaken, Switzerland',
      experienceYears: 5,
      languages: 'German, English, French',
      hireCost: 100.00,
      phone: '+41 79 234 56 78',
    },
    {
      destinationId: 6,
      name: 'Carlos Huaman',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      description: 'Carlos is a Quechua-speaking guide from Cusco with deep knowledge of Incan history and traditions. He has led hundreds of Inca Trail treks and shares the spiritual significance of Machu Picchu.',
      rating: 5,
      location: 'Cusco, Peru',
      experienceYears: 11,
      languages: 'Spanish, Quechua, English',
      hireCost: 70.00,
      phone: '+51 984 123 456',
      email: 'carlos@cusco-guide.pe',
    },
  ];

  const guides = await Promise.all(
    guideData.map((data) =>
      prisma.tourGuide.create({ data })
    )
  );
  console.log(`✅ Created ${guides.length} tour guides`);

  console.log('\n🎉 Seeding complete!');
  console.log('📧 Admin login: admin@viceroytravels.com / password123');
  console.log('📧 User login:  user@viceroytravels.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
