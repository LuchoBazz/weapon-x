// prisma/seed.ts
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  const superAdminRole = await prisma.role.upsert({
    where: {
      id: '290cae0c-fd55-41ed-9667-467fe45140f7',
    },
    update: {
      // In case we need to update properties on re-run, consistent with seed data
      name: 'SUPER_ADMIN',
      permissions: [
        'projects:read',
        'projects:write',
        'roles:read',
        'roles:write',
        'authentications:read',
        'authentications:write',
        'configs:read',
        'configs:write',
        'rules:write',
      ],
    },
    create: {
      id: '290cae0c-fd55-41ed-9667-467fe45140f7',
      name: 'SUPER_ADMIN',
      permissions: [
        'projects:read',
        'projects:write',
        'roles:read',
        'roles:write',
        'authentications:read',
        'authentications:write',
        'configs:read',
        'configs:write',
        'rules:write',
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  console.log('✅ SUPER_ADMIN role seeded:', superAdminRole.name);
  console.log('🏁 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
