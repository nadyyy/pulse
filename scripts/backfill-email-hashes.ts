import { PrismaClient } from "@prisma/client";

import { hashEmail, normalizeEmail } from "../lib/crypto-security";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, emailHash: true },
  });

  let updated = 0;
  for (const user of users) {
    const normalized = normalizeEmail(user.email);
    const nextHash = hashEmail(normalized);
    if (user.email !== normalized || user.emailHash !== nextHash) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: normalized,
          emailHash: nextHash,
        },
      });
      updated += 1;
    }
  }

  console.log(`Backfilled ${updated} user records.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

