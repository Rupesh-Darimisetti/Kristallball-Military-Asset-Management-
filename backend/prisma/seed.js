import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const bases = await Promise.all([
    prisma.base.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Fort Liberty', location: 'North Carolina, USA' },
    }),
    prisma.base.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Camp Pendleton', location: 'California, USA' },
    }),
    prisma.base.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Joint Base Lewis-McChord', location: 'Washington, USA' },
    }),
  ]);

  const equipmentTypes = await Promise.all([
    prisma.equipmentType.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'M4 Carbine', category: 'WEAPON' },
    }),
    prisma.equipmentType.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Humvee', category: 'VEHICLE' },
    }),
    prisma.equipmentType.upsert({
      where: { id: 3 },
      update: {},
      create: { name: '5.56mm Ammo', category: 'AMMUNITION' },
    }),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  await Promise.all([
    prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        passwordHash,
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { username: 'commander_fort' },
      update: {},
      create: {
        username: 'commander_fort',
        passwordHash,
        role: 'BASE_COMMANDER',
        baseId: bases[0].id,
      },
    }),
    prisma.user.upsert({
      where: { username: 'logistics_officer' },
      update: {},
      create: {
        username: 'logistics_officer',
        passwordHash,
        role: 'LOGISTICS_OFFICER',
      },
    }),
  ]);

  await prisma.purchase.createMany({
    data: [
      { baseId: bases[0].id, equipmentTypeId: equipmentTypes[0].id, quantity: 500 },
      { baseId: bases[0].id, equipmentTypeId: equipmentTypes[2].id, quantity: 10000 },
      { baseId: bases[1].id, equipmentTypeId: equipmentTypes[1].id, quantity: 50 },
      { baseId: bases[2].id, equipmentTypeId: equipmentTypes[0].id, quantity: 300 },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completed.');
  console.log('Demo accounts (password: password123):');
  console.log('  admin - ADMIN');
  console.log('  commander_fort - BASE_COMMANDER (Fort Liberty)');
  console.log('  logistics_officer - LOGISTICS_OFFICER');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
