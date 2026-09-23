import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const DEVELOPMENT_USER_ID = "00000000-0000-4000-8000-000000000001";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  await prisma.user.upsert({
    where: { id: DEVELOPMENT_USER_ID },
    update: {},
    create: {
      id: DEVELOPMENT_USER_ID,
      email: "level1@example.com",
      passwordHash: "authentication-disabled-for-level-1",
      profile: {
        create: {
          name: "Level 1 User",
        },
      },
    },
  });
} finally {
  await prisma.$disconnect();
}
