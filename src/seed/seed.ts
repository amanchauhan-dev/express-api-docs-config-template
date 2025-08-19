import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from "../config/config"

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', config.bcrypt.saltRounds);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('User123!', config.bcrypt.saltRounds);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log('✅ Database seeded successfully');
  console.log('👤 Admin user:', { id: admin.id, email: admin.email });
  console.log('👤 Regular user:', { id: user.id, email: user.email });
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
