import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaults = [
    { name: "Motor", slug: "motor" },
    { name: "Suspension", slug: "suspension" },
    { name: "Frenos", slug: "frenos" },
  ];

  for (const c of defaults) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, slug: c.slug },
    });
  }
}

main().finally(() => prisma.$disconnect());
