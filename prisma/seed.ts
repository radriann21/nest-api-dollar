/* eslint-disable @typescript-eslint/no-unsafe-call */
import { PrismaClient } from '../src/prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.sources.createMany({
    data: [{ name: 'BCV' }, { name: 'Binance' }],
    skipDuplicates: true,
  });

  console.log('Seeds creadas exitosamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
