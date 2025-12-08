import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const connectionString = process.env.DATABASE_URL;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.client.deleteMany();

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-1001',
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      client: {
        create: {
          name: 'Cliente Exemplo A',
          document: '11122233344',
        },
      },
      deliveryAddress: {
        create: {
          street: 'Rua das Flores',
          number: '123',
          district: 'Jardim',
          complement: 'Apto 101',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
      },
      items: {
        create: [
          { description: 'Produto A1', price: 49.9 },
          { description: 'Produto A2', price: 19.5 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      orderNumber: 'ORD-1002',
      estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deliveryDate: null,
      client: {
        create: {
          name: 'Cliente Exemplo B',
          document: '55566677788',
        },
      },
      deliveryAddress: {
        create: {
          street: 'Avenida Central',
          number: '500',
          district: 'Centro',
          complement: null,
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000-000',
        },
      },
      items: {
        create: [{ description: 'Produto B1', price: 99.99 }],
      },
    },
  });

  console.log('Seed de orders concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
