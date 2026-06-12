import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD são obrigatórios");
  }

  const hash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: hash,
      name: "Admin Fase",
    },
  });

  console.log(`Admin criado: ${email}`);

  // Categorias padrão
  const categories = [
    { slug: "futebol", name: "Futebol", sortOrder: 1 },
    { slug: "volei", name: "Vôlei", sortOrder: 2 },
    { slug: "basquete", name: "Basquete", sortOrder: 3 },
    { slug: "handebol", name: "Handebol", sortOrder: 4 },
    { slug: "passeio", name: "Passeio / Comissão", sortOrder: 5 },
    { slug: "agasalho", name: "Agasalho", sortOrder: 6 },
    { slug: "colete", name: "Colete", sortOrder: 7 },
    { slug: "acessorios", name: "Acessórios", sortOrder: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log("Categorias criadas.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
