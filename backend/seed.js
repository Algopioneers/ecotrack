const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ecotrack.ng';
  const password = await bcrypt.hash('admin123', 10);
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists');
    return;
  }
  
  const admin = await prisma.user.create({
    data: {
      email,
      password,
      name: 'Admin User',
      phone: '+2348000000000',
      role: 'ADMIN'
    }
  });
  
  await prisma.wallet.create({
    data: { userId: admin.id }
  });
  
  console.log('Admin created:', email);
  console.log('Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
