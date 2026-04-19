const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

const wasteTypes = ['ORGANIC', 'PLASTIC', 'PAPER', 'METAL', 'GLASS', 'ELECTRONIC', 'TEXTILE', 'MIXED'];
const pickupStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'];
const wastePrices = { ORGANIC: 50, PLASTIC: 150, PAPER: 80, METAL: 200, GLASS: 120, ELECTRONIC: 500, TEXTILE: 100, MIXED: 100 };

async function main() {
  console.log('Starting comprehensive seed...\n');

  // ============ USERS ============
  const users = [
    { email: 'admin@ecotrack.ng', password: 'admin123', name: 'Admin User', phone: '+2348000000000', role: 'ADMIN' },
    { email: 'collector@ecotrack.ng', password: 'collector123', name: 'John Collector', phone: '+2348000000001', role: 'COLLECTOR' },
    { email: 'user@ecotrack.ng', password: 'user123', name: 'Jane User', phone: '+2348000000002', role: 'USER' },
    { email: 'sarah@example.com', password: 'password123', name: 'Sarah Johnson', phone: '+2348000000003', role: 'USER' },
    { email: 'mike@example.com', password: 'password123', name: 'Mike Adebayo', phone: '+2348000000004', role: 'USER' },
    { email: 'emma@example.com', password: 'password123', name: 'Emma Okonkwo', phone: '+2348000000005', role: 'USER' },
    { email: 'david@example.com', password: 'password123', name: 'David Chukwu', phone: '+2348000000006', role: 'COLLECTOR' },
    { email: 'grace@example.com', password: 'password123', name: 'Grace Ibrahim', phone: '+2348000000007', role: 'COLLECTOR' }
  ];

  const createdUsers = { ADMIN: [], COLLECTOR: [], USER: [] };
  for (const userData of users) {
    const password = await bcrypt.hash(userData.password, 10);
    let user = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userData.email,
          password,
          name: userData.name,
          phone: userData.phone,
          role: userData.role,
          address: 'Lagos, Nigeria'
        }
      });
      await prisma.wallet.create({ data: { userId: user.id, balance: Math.random() * 10000 } });
    }
    createdUsers[userData.role].push(user);
  }

  // ============ PICKUP REQUESTS ============
  const addresses = [
    '15 Adeola Street, Victoria Island, Lagos',
    '42 Ozumba Mbadiwe Avenue, Lagos Island',
    '7 Broad Street, Lagos',
    '23 Toyin Street, Ikeja',
    '89 Ajose Adeogun Street, Victoria Island',
    '5 Kofo Abayomi Street, Apapa',
    '31 Ozumba Mbadiwe, Lekki',
    '12 Adekunle Fajuyi Street, Ikeja'
  ];

  const pickupCount = 30;
  for (let i = 0; i < pickupCount; i++) {
    const wasteType = wasteTypes[Math.floor(Math.random() * wasteTypes.length)];
    const weight = Math.floor(Math.random() * 50) + 5;
    const status = pickupStatuses[Math.floor(Math.random() * pickupStatuses.length)];
    const user = createdUsers['USER'][Math.floor(Math.random() * createdUsers['USER'].length)];
    const collector = status !== 'PENDING' ? createdUsers['COLLECTOR'][Math.floor(Math.random() * createdUsers['COLLECTOR'].length)] : null;
    
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 30));

    await prisma.pickupRequest.create({
      data: {
        userId: user.id,
        collectorId: collector?.id || null,
        wasteType,
        weightKg: weight,
        address: addresses[Math.floor(Math.random() * addresses.length)],
        latitude: 6.5244 + (Math.random() - 0.5) * 0.1,
        longitude: 3.3792 + (Math.random() - 0.5) * 0.1,
        scheduledFor: scheduledDate,
        status,
        estimatedPrice: weight * wastePrices[wasteType],
        actualPrice: status === 'COMPLETED' ? weight * wastePrices[wasteType] * (0.8 + Math.random() * 0.4) : null,
        notes: Math.random() > 0.5 ? 'Please arrive before 5pm' : null,
        createdAt: new Date(scheduledDate.getTime() - Math.random() * 86400000 * 7)
      }
    });
  }
  console.log(`Created ${pickupCount} pickup requests`);

  // ============ PAYMENTS ============
  const paymentMethods = ['CARD', 'BANK_TRANSFER', 'WALLET', 'USSD'];
  const paymentStatuses = ['COMPLETED', 'PENDING', 'FAILED'];
  
  const pickups = await prisma.pickupRequest.findMany({ where: { status: 'COMPLETED' } });
  for (const pickup of pickups.slice(0, 15)) {
    await prisma.payment.create({
      data: {
        userId: pickup.userId,
        pickupId: pickup.id,
        amount: pickup.actualPrice || pickup.estimatedPrice,
        status: 'COMPLETED',
        method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        createdAt: pickup.updatedAt
      }
    });
  }
  console.log(`Created ${pickups.slice(0, 15).length} payments`);

  // ============ NOTIFICATIONS ============
  const notificationTypes = ['PICKUP_ASSIGNED', 'PICKUP_COMPLETED', 'PAYMENT_RECEIVED', 'PROMOTION', 'REMINDER'];
  const notifications = [
    { title: 'Pickup Assigned', body: 'Your waste pickup has been assigned to a collector' },
    { title: 'Pickup Completed', body: 'Your pickup has been completed successfully' },
    { title: 'Payment Received', body: 'You received payment for your recycled waste' },
    { title: 'New Promotion', body: 'Get 20% extra on your next pickup!' },
    { title: 'Pickup Reminder', body: 'Don\'t forget your scheduled pickup tomorrow' }
  ];

  for (const user of [...createdUsers['USER'], ...createdUsers['COLLECTOR']].slice(0, 5)) {
    for (let i = 0; i < 5; i++) {
      const notif = notifications[Math.floor(Math.random() * notifications.length)];
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: notif.title,
          body: notif.body,
          type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
          isRead: Math.random() > 0.5,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 7)
        }
      });
    }
  }
  console.log('Created notifications');

  // ============ REWARD Tiers ============
  const tiers = [
    { name: 'Bronze', minPoints: 0, maxPoints: 500, cashbackPercent: 1, description: 'Entry level rewards', color: '#CD7F32' },
    { name: 'Silver', minPoints: 501, maxPoints: 2000, cashbackPercent: 2, description: 'Silver tier benefits', color: '#C0C0C0' },
    { name: 'Gold', minPoints: 2001, maxPoints: 5000, cashbackPercent: 3, description: 'Gold tier exclusive rewards', color: '#FFD700' },
    { name: 'Platinum', minPoints: 5001, maxPoints: null, cashbackPercent: 5, description: 'Platinum tier - top benefits!', color: '#E5E4E2' }
  ];

  for (const tier of tiers) {
    await prisma.rewardTier.upsert({
      where: { name: tier.name },
      update: tier,
      create: tier
    });
  }
  console.log('Created reward tiers');

  // ============ REWARD POINTS ============
  for (const user of [...createdUsers['USER'], ...createdUsers['COLLECTOR']].slice(0, 5)) {
    const points = Math.floor(Math.random() * 5000) + 100;
    const types = ['PICKUP_COMPLETE', 'REFERRAL_BONUS', 'PROMO_BONUS'];
    for (let i = 0; i < 10; i++) {
      await prisma.rewardPoint.create({
        data: {
          userId: user.id,
          points: Math.floor(Math.random() * 100) + 10,
          type: types[Math.floor(Math.random() * types.length)],
          description: 'Points earned from pickup',
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 30)
        }
      });
    }
  }
  console.log('Created reward points');

  // ============ CMS PAGES ============
  const cmsPages = [
    {
      slug: 'about',
      title: 'About Us',
      content: '<h1>About EcoTrack</h1><p>EcoTrack is Nigeria\'s leading waste management platform, connecting households and businesses with reliable waste collectors. We promote environmental sustainability through technology and community engagement.</p><p>Our mission is to make waste management efficient, sustainable, and profitable for all Nigerians.</p>',
      metaTitle: 'About EcoTrack - Smart Waste Management',
      metaDescription: 'Learn about EcoTrack, Nigeria\'s leading waste management platform.',
      status: 'PUBLISHED',
      pageType: 'ABOUT'
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      content: '<h1>Contact EcoTrack</h1><p>Get in touch with us for any inquiries.</p><h2>Email</h2><p>support@ecotrack.ng</p><h2>Phone</h2><p>+234 800 000 0000</p><h2>Address</h2><p>Lagos, Nigeria</p>',
      metaTitle: 'Contact Us - EcoTrack',
      metaDescription: 'Contact EcoTrack for support and inquiries.',
      status: 'PUBLISHED',
      pageType: 'CONTACT'
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: '<h1>Privacy Policy</h1><p>At EcoTrack, we take your privacy seriously. This policy outlines how we collect, use, and protect your data.</p><p>We collect only necessary information to provide our services and never share your data with third parties without consent.</p>',
      metaTitle: 'Privacy Policy - EcoTrack',
      metaDescription: 'EcoTrack privacy policy and data protection.',
      status: 'PUBLISHED',
      pageType: 'PRIVACY'
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: '<h1>Terms of Service</h1><p>By using EcoTrack services, you agree to our terms and conditions.</p><h2>Service Usage</h2><p>Our platform provides waste collection services. Users must provide accurate information and maintain respectful communication with collectors.</p>',
      metaTitle: 'Terms of Service - EcoTrack',
      metaDescription: 'EcoTrack terms and conditions.',
      status: 'PUBLISHED',
      pageType: 'TERMS'
    },
    {
      slug: 'faq',
      title: 'Frequently Asked Questions',
      content: '<h1>FAQ</h1><h2>How do I schedule a pickup?</h2><p>Simply log in to your dashboard and click "New Pickup" to schedule.</p><h2>How do I get paid?</h2><p>Payments are processed to your wallet within 24 hours of pickup completion.</p><h2>What waste types do you accept?</h2><p>We accept organic, plastic, paper, metal, glass, electronic, and textile waste.</p>',
      metaTitle: 'FAQ - EcoTrack',
      metaDescription: 'Frequently asked questions about EcoTrack services.',
      status: 'PUBLISHED',
      pageType: 'FAQ'
    }
  ];

  for (const page of cmsPages) {
    await prisma.cMSPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page
    });
  }
  console.log('Created CMS pages');

  // ============ BLOG POSTS ============
  const blogPosts = [
    {
      slug: 'benefits-of-recycling',
      title: '10 Benefits of Recycling You Should Know',
      excerpt: 'Discover how recycling can transform your community and environment.',
      content: '<p>Recycling is more than just sorting waste - it\'s a way of life that benefits everyone. Here are the top 10 benefits:</p><ol><li>Reduces landfill waste</li><li>Saves natural resources</li><li>Reduces energy consumption</li><li>Creates jobs</li><li>Supports local economy</li><li>Reduces pollution</li><li>Conserves water</li><li>Minimizes climate impact</li><li>Promotes sustainability</li><li>Improves community health</li></ol>',
      category: 'Environment',
      status: 'PUBLISHED',
      featured: true
    },
    {
      slug: 'proper-waste-segregation',
      title: 'How to Properly Segregate Your Waste',
      excerpt: 'Learn the right way to separate waste at home.',
      content: '<p>Proper waste segregation is the first step to effective recycling. Here\'s how to do it:</p><h2>Organic Waste</h2><p>Kitchen scraps, garden waste - can be composted.</p><h2>Recyclable Materials</h2><p>Plastic, paper, glass, metal - clean and sort before recycling.</p><h2>Hazardous Waste</h2><p>Batteries, electronics, chemicals - dispose properly at designated centers.</p>',
      category: 'Guide',
      status: 'PUBLISHED',
      featured: false
    },
    {
      slug: 'ecotrack-impact-2024',
      title: 'EcoTrack\'s Environmental Impact in 2024',
      excerpt: 'A look back at our achievements and community impact.',
      content: '<p>2024 has been an amazing year for EcoTrack and our community. Here are our highlights:</p><ul><li>Over 10,000 pickups completed</li><li>50+ tons of waste recycled</li><li>100+ local collectors partnered</li><li>Carbon emissions reduced by 30%</li></ul>',
      category: 'News',
      status: 'PUBLISHED',
      featured: true
    }
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: {
        ...post,
        authorName: 'EcoTrack Team',
        tags: JSON.stringify(['recycling', 'environment', 'sustainability'])
      }
    });
  }
  console.log('Created blog posts');

  // ============ LANDING PAGE FEATURES ============
  const features = [
    {
      title: 'Smart Scheduling',
      subtitle: 'AI-Powered Pickup Times',
      description: 'Book pickups at your convenience with our smart scheduling system.',
      icon: 'clock',
      badge: 'New',
      badgeColor: '#10B981',
      displayOrder: 1
    },
    {
      title: 'Earn Rewards',
      subtitle: 'Get Paid for Recycling',
      description: 'Turn your waste into cash with our reward system.',
      icon: 'gift',
      badge: 'Popular',
      badgeColor: '#F59E0B',
      displayOrder: 2
    },
    {
      title: 'Real-Time Tracking',
      subtitle: 'Know Where Your Collector Is',
      description: 'Track your pickup in real-time from booking to completion.',
      icon: 'map',
      badge: null,
      badgeColor: null,
      displayOrder: 3
    },
    {
      title: 'Eco Impact',
      subtitle: 'Track Your Contribution',
      description: 'See how much you\'ve helped the environment with your eco-dashboard.',
      icon: 'leaf',
      badge: 'Featured',
      badgeColor: '#3B82F6',
      displayOrder: 4
    }
  ];

  for (const feature of features) {
    await prisma.landingPageFeature.create({ data: feature });
  }
  console.log('Created landing page features');

  // ============ SITE SETTINGS ============
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      siteName: 'EcoTrack',
      tagline: 'Smart Waste Management for Nigeria',
      description: 'EcoTrack is Nigeria\'s leading waste management platform. Schedule pickups, earn rewards, and contribute to a cleaner environment.',
      keywords: 'waste management, recycling, Nigeria, eco-friendly, garbage collection',
      author: 'EcoTrack Team',
      contactEmail: 'support@ecotrack.ng',
      contactPhone: '+234 800 000 0000',
      contactAddress: 'Lagos, Nigeria',
      socialFacebook: 'https://facebook.com/ecotrack',
      socialTwitter: 'https://twitter.com/ecotrack',
      socialInstagram: 'https://instagram.com/ecotrack',
      enabled: true
    },
    create: {
      id: 'default',
      siteName: 'EcoTrack',
      tagline: 'Smart Waste Management for Nigeria',
      description: 'EcoTrack is Nigeria\'s leading waste management platform.',
      keywords: 'waste management, recycling, Nigeria',
      contactEmail: 'support@ecotrack.ng',
      contactPhone: '+234 800 000 0000',
      enabled: true
    }
  });
  console.log('Created site settings');

  // ============ ANALYTICS ============
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    await prisma.analytics.create({
      data: {
        date,
        totalPickups: Math.floor(Math.random() * 50) + 10,
        completedPickups: Math.floor(Math.random() * 40) + 5,
        revenue: Math.random() * 50000 + 10000,
        avgRating: 3.5 + Math.random() * 1.5,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        activeCollectors: Math.floor(Math.random() * 20) + 5
      }
    });
  }
  console.log('Created analytics data');

  // ============ FEEDBACK ============
  const pickupList = await prisma.pickupRequest.findMany({ take: 10 });
  for (const pickup of pickupList) {
    await prisma.feedback.create({
      data: {
        userId: pickup.userId,
        collectorId: pickup.collectorId,
        rating: Math.floor(Math.random() * 3) + 3,
        comment: ['Great service!', 'Very professional', 'On time and friendly', 'Recommend!'][Math.floor(Math.random() * 4)],
        createdAt: pickup.updatedAt
      }
    });
  }
  console.log('Created feedback');

  console.log('\n✅ Seed completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());