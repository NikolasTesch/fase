/**
 * migrate-images-to-r2.ts
 *
 * - Faz upload das imagens de public/images/products/ para o Cloudflare R2
 * - Faz match por slug (nome-do-arquivo = slug do produto)
 * - Atualiza os registros ProductImage do banco (substituindo URLs de placeholder)
 *
 * Uso:
 *   npx tsx scripts/migrate-images-to-r2.ts              (execução real)
 *   npx tsx scripts/migrate-images-to-r2.ts --dry-run    (simulação)
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");

// ── R2 client ──────────────────────────────────────────────────────────────
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "fase";
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_URL ?? "";

// ── Prisma ─────────────────────────────────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Helpers ────────────────────────────────────────────────────────────────
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return (
    { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }[
      ext
    ] ?? "application/octet-stream"
  );
}

async function objectExists(key: string): Promise<boolean> {
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Migração de imagens: public/ → R2`);
  if (DRY_RUN) console.log("   ⚠️  DRY-RUN — nenhum dado será alterado\n");
  else console.log("");

  const imagesDir = path.join(process.cwd(), "public", "images", "products");
  const files = fs.readdirSync(imagesDir).filter((f) =>
    [".png", ".jpg", ".jpeg", ".webp"].includes(path.extname(f).toLowerCase())
  );

  console.log(`📁 ${files.length} arquivo(s) em public/images/products/`);

  // Busca todos os produtos com suas imagens
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      images: { select: { id: true, url: true, isPrimary: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  // Índice slug → produto
  const slugMap = new Map(products.map((p) => [p.slug, p]));
  console.log(`🗄️  ${products.length} produto(s) no banco\n`);

  let uploaded = 0;
  let updated = 0;
  let skipped = 0;

  for (const filename of files) {
    const slug = path.basename(filename, path.extname(filename)); // ex: kit-futebol-campo
    const product = slugMap.get(slug);
    const key = `products/seed/${filename}`;
    const r2Url = `${R2_PUBLIC_URL}/${key}`;
    const contentType = getMimeType(filename);

    if (!product) {
      console.log(`   ⚠️  ${filename} → nenhum produto com slug "${slug}" no banco`);
      skipped++;
      continue;
    }

    // ── Upload para R2 ────────────────────────────────────────────────────
    const alreadyOnR2 = !DRY_RUN && (await objectExists(key));
    if (alreadyOnR2) {
      console.log(`   ⏭️  R2 já tem: ${key}`);
    } else if (!DRY_RUN) {
      const buffer = fs.readFileSync(path.join(imagesDir, filename));
      await r2.send(
        new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType })
      );
      console.log(`   ✅ upload: ${filename} → ${key}`);
      uploaded++;
    } else {
      console.log(`   [DRY] upload → ${key}`);
      uploaded++;
    }

    // ── Atualizar banco ───────────────────────────────────────────────────
    // Pega a imagem primária atual (provavelmente o placeholder)
    const primaryImage = product.images.find((i) => i.isPrimary) ?? product.images[0];

    if (!primaryImage) {
      // Produto sem nenhuma imagem — cria novo registro
      if (!DRY_RUN) {
        await prisma.productImage.create({
          data: { productId: product.id, url: r2Url, isPrimary: true, sortOrder: 0 },
        });
      }
      console.log(`   ${DRY_RUN ? "[DRY] " : ""}🔗 [${product.name}] criado registro de imagem`);
      updated++;
    } else if (primaryImage.url.includes("placehold.co") || primaryImage.url.startsWith("/images/")) {
      // Substitui placeholder pela URL real do R2
      if (!DRY_RUN) {
        await prisma.productImage.update({
          where: { id: primaryImage.id },
          data: { url: r2Url },
        });
      }
      console.log(
        `   ${DRY_RUN ? "[DRY] " : ""}🔗 [${product.name}]\n       ${primaryImage.url}\n     → ${r2Url}`
      );
      updated++;
    } else {
      console.log(`   ℹ️  [${product.name}] já tem imagem real: ${primaryImage.url}`);
      skipped++;
    }
  }

  console.log(`
─────────────────────────────────────────────────────────────
📊 Resultado:
   ✅ Uploads:     ${uploaded}
   🔗 Atualizações: ${updated}
   ⏭️  Pulados:     ${skipped}
─────────────────────────────────────────────────────────────
📋 Próximos passos:
   1. Verifique as imagens no admin: /admin/produtos
   2. ${DRY_RUN ? "Execute sem --dry-run para aplicar" : "Delete a pasta local:"}
      ${DRY_RUN ? "npx tsx scripts/migrate-images-to-r2.ts" : "Remove-Item -Recurse -Force public\\images\\products"}
   3. Adicione ao .gitignore: public/images/products/
`);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
