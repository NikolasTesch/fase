import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const OLD = "https://d61882a27815ff704e50a14c4d1b1855.r2.cloudflarestorage.com/fase";
const NEW = "https://pub-8527c7f1798646e28d4279e70d4b901e.r2.dev";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const images = await prisma.productImage.findMany({
    where: { url: { startsWith: OLD } },
    include: { product: { select: { name: true } } },
  });

  console.log(`\n🔄 ${images.length} registro(s) para atualizar\n`);

  for (const img of images) {
    const newUrl = img.url.replace(OLD, NEW);
    await prisma.productImage.update({ where: { id: img.id }, data: { url: newUrl } });
    console.log(`   ✅ [${img.product.name}]\n      ${newUrl}`);
  }

  console.log(`\n✔ Concluído — ${images.length} URL(s) atualizadas para r2.dev\n`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
