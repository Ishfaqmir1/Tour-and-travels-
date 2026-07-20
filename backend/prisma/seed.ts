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
      phone: '9103815702',
      address: 'Shopian, Jammu and Kashmir',
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
      phone: '9103815702',
      address: 'Shopian, Jammu and Kashmir',
    },
  });
  console.log(`✅ Created test user: ${user.email} (password: password123)`);

  // Create destinations sequentially to guarantee correct ID order
  const destData = [
    { slug: 'srinagar-kashmir', title: 'Srinagar', country: 'India', city: 'Srinagar', locationLabel: 'Srinagar, Jammu and Kashmir, India', image: 'https://images.unsplash.com/photo-1597432538815-1c262b1cf777?auto=format&fit=crop&w=800&q=80', shortDescription: 'Experience the breathtaking Dal Lake, Mughal Gardens, and Shikara rides in the summer capital of Kashmir.', description: 'Srinagar, the summer capital of Jammu and Kashmir, is a paradise on earth. Famous for its iconic Dal Lake with vibrant houseboats and shikaras, the city also boasts stunning Mughal Gardens like Shalimar Bagh and Nishat Bagh. Explore the floating markets, visit the historic Jamia Masjid, and savor authentic Kashmiri Wazwan cuisine. The charming old city with its intricately carved wooden architecture tells stories of a rich cultural heritage.', duration: '3-5 Days', price: '₹6,000 - ₹20,000', rating: 4.8 },
    { slug: 'gulmarg-kashmir', title: 'Gulmarg', country: 'India', city: 'Gulmarg', locationLabel: 'Gulmarg, Baramulla, Jammu and Kashmir, India', image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&w=800&q=80', shortDescription: 'Asia\'s highest gondola ride, world-class skiing, and breathtaking alpine meadows await you in Gulmarg.', description: 'Known as the \"Meadow of Flowers,\" Gulmarg is one of India\'s premier hill stations and ski destinations. Home to the highest gondola ride in Asia (Gulmarg Gondola), it offers spectacular views of the snow-capped Himalayas. In winter, the powdery slopes attract skiers from around the globe. In summer, the lush green meadows dotted with wildflowers create a magical landscape. Don\'t miss the famous Gulmarg Golf Course, one of the highest in the world.', duration: '3-5 Days', price: '₹8,000 - ₹30,000', rating: 4.9 },
    { slug: 'pahalgam-kashmir', title: 'Pahalgam', country: 'India', city: 'Pahalgam', locationLabel: 'Pahalgam, Anantnag, Jammu and Kashmir, India', image: 'https://images.unsplash.com/photo-1597432538361-a9b450880e3c?auto=format&fit=crop&w=800&q=80', shortDescription: 'The Valley of Shepherds — discover Betaab Valley, Aru Valley, and pristine riverside treks.', description: 'Pahalgam, known as the \"Valley of Shepherds,\" is a serene paradise at the confluence of the Lidder River and Sheshnag Lake. It serves as the base camp for the famous Amarnath Yatra. Explore Betaab Valley (made famous by Bollywood films), the tranquil Aru Valley, and the scenic Chandanwari. Adventure seekers can enjoy river rafting in the Lidder River, horse rides through pine forests, and trekking to alpine lakes like Tarsar and Marsar.', duration: '3-5 Days', price: '₹5,000 - ₹18,000', rating: 4.7 },
    { slug: 'sonamarg-kashmir', title: 'Sonamarg', country: 'India', city: 'Sonamarg', locationLabel: 'Sonamarg, Ganderbal, Jammu and Kashmir, India', image: 'https://images.unsplash.com/photo-1586339949916-3e5457d58f1c?auto=format&fit=crop&w=800&q=80', shortDescription: 'The Golden Meadow — gateway to Thajiwas Glacier, alpine lakes, and majestic Himalayan treks.', description: 'Sonamarg, meaning \"Meadow of Gold,\" is a breathtaking Himalayan resort at an altitude of 2,800 meters. It is the gateway to the famous Thajiwas Glacier, where visitors can enjoy snow sledding even in summer. The region offers spectacular trekking routes to Vishansar Lake, Kishansar Lake, and the remote Gangbal Lake. The drive through Zoji La Pass provides some of the most dramatic mountain scenery in the Himalayas. Sonamarg is also the starting point for treks to Ladakh.', duration: '2-4 Days', price: '₹6,000 - ₹22,000', rating: 4.7 },
    { slug: 'leh-ladakh', title: 'Leh-Ladakh', country: 'India', city: 'Leh', locationLabel: 'Leh, Ladakh, India', image: 'https://images.unsplash.com/photo-1597131686427-35eefb6f7e7f?auto=format&fit=crop&w=800&q=80', shortDescription: 'Discover the land of high passes — Pangong Tso, Khardung La, and ancient Buddhist monasteries.', description: 'Leh-Ladakh is a high-altitude desert region known for its dramatic landscapes, crystal-clear lakes, and ancient Buddhist monasteries. Drive through the world-famous Khardung La Pass, witness the ever-changing colors of Pangong Tso Lake (made famous by \"3 Idiots\"), and explore the stunning Nubra Valley with its double-humped camels. Visit the 1,000-year-old Thiksey and Hemis monasteries, ride the highest motorable passes, and experience the unique Ladakhi culture and cuisine.', duration: '6-10 Days', price: '₹15,000 - ₹45,000', rating: 4.9 },
    { slug: 'nubra-valley-ladakh', title: 'Nubra Valley', country: 'India', city: 'Nubra', locationLabel: 'Nubra Valley, Ladakh, India', image: 'https://images.unsplash.com/photo-1586104913497-33f91cafa70b?auto=format&fit=crop&w=800&q=80', shortDescription: 'A stunning valley with sand dunes, Bactrian camels, and the confluence of Shyok and Nubra rivers.', description: 'Nubra Valley, also known as the \"Valley of Flowers of Ladakh,\" is a magical desert valley at an altitude of 3,048 meters. Accessible via the famous Khardung La Pass, it offers a unique landscape where sand dunes meet snow-capped mountains. Ride the rare double-humped Bactrian camels at Hunder, visit the serene Diskit Monastery with its giant Maitreya Buddha statue, and witness the breathtaking confluence of the Shyok and Nubra rivers. The hot springs at Panamik and the picturesque village of Turtuk near the Pakistan border complete this unforgettable journey.', duration: '3-5 Days', price: '₹10,000 - ₹35,000', rating: 4.8 },
  ];

  const destinations: any[] = [];
  for (const d of destData) {
    const created = await prisma.tourDestination.create({ data: d });
    destinations.push(created);
  }
  console.log(`✅ Created ${destinations.length} destinations`);

  // Create tour guides for each Kashmir & Ladakh destination (use actual destination IDs)
  const guideData = [
    {
      destinationId: destinations[0].id, // Srinagar
      name: 'Mohammad Yousuf',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      description: 'A Srinagar native with 10+ years of experience, Yousuf knows every hidden corner of the old city. His Shikara tours on Dal Lake are famous among travelers, and he can arrange authentic Wazwan dining experiences in historic homes.',
      rating: 5,
      location: 'Srinagar, Jammu and Kashmir',
      experienceYears: 10,
      languages: 'Urdu, Hindi, English, Kashmiri',
      hireCost: 1500.00,
      phone: '+91 9103815702',
      email: 'yousuf.srinagar@example.com',
    },
    {
      destinationId: destinations[0].id, // Srinagar
      name: 'Riyaz Ahmed',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      description: 'Riyaz is a gardening expert who worked at the Mughal Gardens for over 7 years. His historical walking tours of Nishat Bagh, Shalimar Bagh, and Pari Mahal offer deep insights into Mughal architecture and Kashmiri history.',
      rating: 4,
      location: 'Srinagar, Jammu and Kashmir',
      experienceYears: 7,
      languages: 'Kashmiri, Urdu, Hindi, English',
      hireCost: 1200.00,
      phone: '+91 9901234567',
    },
    {
      destinationId: destinations[1].id, // Gulmarg
      name: 'Bilal Ahmad',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      description: 'Bilal is a certified ski instructor and mountain guide from Gulmarg. He grew up skiing on these slopes and has trained with international instructors. His winter tours include ski lessons, gondola rides, and bonfire experiences in snow-covered meadows.',
      rating: 5,
      location: 'Gulmarg, Baramulla, Jammu and Kashmir',
      experienceYears: 12,
      languages: 'Kashmiri, Hindi, English, Urdu',
      hireCost: 2500.00,
      email: 'bilal.gulmarg@example.com',
    },
    {
      destinationId: destinations[1].id, // Gulmarg
      name: 'Farooq Sheikh',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      description: 'Farooq is a nature photographer and wildlife enthusiast. He leads summer treks through Gulmarg\'s alpine meadows, identifying rare Himalayan flora and birds. His photography tours capture stunning landscapes and local life.',
      rating: 4,
      location: 'Gulmarg, Baramulla, Jammu and Kashmir',
      experienceYears: 6,
      languages: 'Kashmiri, Hindi, English',
      hireCost: 1800.00,
      phone: '+91 9902345678',
    },
    {
      destinationId: destinations[2].id, // Pahalgam
      name: 'Aisha Bano',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      description: 'Aisha is a Pahalgam local with an intimate knowledge of the valley\'s trekking routes. She has guided hundreds of visitors through Betaab Valley, Aru Valley, and the challenging Tarsar Lake trek. Her stories about local folklore make every hike memorable.',
      rating: 5,
      location: 'Pahalgam, Anantnag, Jammu and Kashmir',
      experienceYears: 8,
      languages: 'Kashmiri, Hindi, English, Urdu',
      hireCost: 1400.00,
      phone: '+91 9903456789',
      email: 'aisha.pahalgam@example.com',
    },
    {
      destinationId: destinations[2].id, // Pahalgam
      name: 'Shabir Malik',
      photo: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=400&q=80',
      description: 'Shabir is an adventure sports expert specializing in river rafting on the Lidder River. He also organizes camping expeditions in Aru Valley with traditional Kashmiri cuisine cooked over open fires. His safety standards are unmatched.',
      rating: 5,
      location: 'Pahalgam, Anantnag, Jammu and Kashmir',
      experienceYears: 9,
      languages: 'Kashmiri, Hindi, English',
      hireCost: 1600.00,
      phone: '+91 9904567890',
    },
    {
      destinationId: destinations[3].id, // Sonamarg
      name: 'Ghulam Nabi',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      description: 'Ghulam has been guiding treks in Sonamarg for over a decade. He knows the Thajiwas Glacier like the back of his hand and arranges memorable pony rides and snow experiences. His knowledge of the Zoji La Pass routes is invaluable for travelers heading to Ladakh.',
      rating: 4,
      location: 'Sonamarg, Ganderbal, Jammu and Kashmir',
      experienceYears: 11,
      languages: 'Kashmiri, Hindi, Urdu, English',
      hireCost: 1700.00,
      email: 'ghulam.sonamarg@example.com',
    },
    {
      destinationId: destinations[4].id, // Leh-Ladakh
      name: 'Tashi Namgyal',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      description: 'Tashi is a Ladakhi guide born in Leh with extensive knowledge of the region\'s Buddhist culture and high-altitude passes. He has led countless expeditions to Pangong Tso, Khardung La, and the Nubra Valley. He speaks fluent English and can explain the nuances of Tibetan Buddhism.',
      rating: 5,
      location: 'Leh, Ladakh, India',
      experienceYears: 14,
      languages: 'Ladakhi, Hindi, English, Tibetan',
      hireCost: 3000.00,
      phone: '+91 9419176543',
      email: 'tashi.leh@example.com',
    },
    {
      destinationId: destinations[4].id, // Leh-Ladakh
      name: 'Sonam Wangchuk',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      description: 'Sonam is a passionate environmentalist and cultural guide. He offers eco-conscious tours focusing on Ladakh\'s fragile ecosystem and sustainable tourism. His monastery tours provide deep spiritual insights, and he knows the best sunrise spots over the Indus Valley.',
      rating: 5,
      location: 'Leh, Ladakh, India',
      experienceYears: 8,
      languages: 'Ladakhi, Hindi, English',
      hireCost: 2500.00,
      phone: '+91 9419276543',
    },
    {
      destinationId: destinations[5].id, // Nubra Valley
      name: 'Stanzin Dorjey',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      description: 'Stanzin grew up in the Nubra Valley and knows every sand dune and monastery. He arranges unforgettable Bactrian camel rides at Hunder, visits to the Diskit Monastery, and camping under the stars. His warm Ladakhi hospitality makes every traveler feel welcome.',
      rating: 4,
      location: 'Nubra Valley, Ladakh, India',
      experienceYears: 6,
      languages: 'Ladakhi, Hindi, English, Urdu',
      hireCost: 2200.00,
      phone: '+91 9905678901',
      email: 'stanzin.nubra@example.com',
    },
  ];

  const guides: any[] = [];
  for (const data of guideData) {
    const created = await prisma.tourGuide.create({ data });
    guides.push(created);
  }
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
