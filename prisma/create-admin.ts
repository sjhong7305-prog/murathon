import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [, , email, password] = process.argv;
  if (!email || !password) {
    console.error("사용법: npx tsx prisma/create-admin.ts <email> <password>");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { isAdmin: true, passwordHash, failedLoginCount: 0, lockedUntil: null },
    create: { email, passwordHash, isAdmin: true, nickname: email.split("@")[0] },
  });

  console.log(`admin ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
