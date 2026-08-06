import fs from "fs";
import path from "path";
import sharp from "sharp";

const modalities = [
  "esportes-prata.webp",
  "esportes-ouro.webp",
  "esportes-profissional.webp",
  "esportes-escolinha.webp",
  "basquete-prata.webp",
  "basquete-ouro.webp",
  "basquete-profissional.webp",
  "colete-aberto.webp",
  "colete-fechado.webp",
  "colete-dupla.webp",
  "passeio-comissao.webp",
  "passeio-torcida.webp",
  "agasalho.webp",
  "calca.webp",
  "acessorio.webp",
];

const products = [
  "kit-futebol-campo.webp",
  "kit-futebol-society.webp",
  "camisa-futebol-premium.webp",
  "uniforme-goleiro.webp",
  "kit-volei-quadra.webp",
  "bermuda-volei-praia.webp",
  "kit-basquete.webp",
  "regata-basquete.webp",
  "kit-handebol.webp",
  "camisa-polo-comissao.webp",
  "camisa-passeio-delegacao.webp",
  "agasalho-esportivo.webp",
  "jaqueta-corta-vento.webp",
  "colete-treino.webp",
  "meiao-esportivo.webp",
  "camisa-social.webp",
  "polo-profissional.webp",
  "jaleco-operacional.webp",
  "uniforme-brim.webp",
  "camiseta-promocional.webp",
  "kit-evento.webp",
];

const categories = [
  "futebol-hero.webp",
  "volei-hero.webp",
  "basquete-hero.webp",
  "handebol-hero.webp",
  "passeio-hero.webp",
  "agasalhos-hero.webp",
  "coletes-hero.webp",
  "empresarial-hero.webp",
  "eventos-hero.webp",
];

const sizeGuides = [
  "tabela-camisa.webp",
  "tabela-short-masc.webp",
  "tabela-short-fem.webp",
  "tabela-short-suplex.webp",
  "tabela-regata.webp",
  "tabela-bermuda.webp",
];

function formatTitle(filename) {
  const name = filename.replace(/\.(png|jpg|jpeg|webp)$/, "").replace(/-/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function createSvgPlaceholder(title, width = 800, height = 600, isHero = false) {
  const bgStart = isHero ? "#0f172a" : "#1e293b";
  const bgEnd = isHero ? "#1e1b4b" : "#0f172a";
  const accent = "#ea580c";

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgStart}" />
        <stop offset="100%" stop-color="${bgEnd}" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#ea580c" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    
    <!-- Pattern decorative lines -->
    <path d="M 0,${height * 0.8} Q ${width * 0.5},${height * 0.6} ${width},${height * 0.9}" stroke="${accent}" stroke-opacity="0.15" stroke-width="40" fill="none" />
    <path d="M 0,${height * 0.3} Q ${width * 0.5},${height * 0.5} ${width},${height * 0.2}" stroke="${accent}" stroke-opacity="0.1" stroke-width="20" fill="none" />
    
    <!-- Centered content -->
    <g transform="translate(${width / 2}, ${height / 2 - 30})">
      <!-- Shirt Icon -->
      <path d="M -40,-40 L -20,-50 L 0,-35 L 20,-50 L 40,-40 L 30,-10 L 20,-10 L 20,40 L -20,40 L -20,-10 L -30,-10 Z" fill="none" stroke="url(#accentGrad)" stroke-width="4" stroke-linejoin="round" />
    </g>
    
    <!-- Title Text -->
    <text x="${width / 2}" y="${height / 2 + 35}" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="1">
      ${title.toUpperCase()}
    </text>
    <text x="${width / 2}" y="${height / 2 + 65}" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="${accent}" text-anchor="middle" letter-spacing="2">
      FASE SPORT
    </text>
  </svg>`;
}

async function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function generateGroup(files, targetDir, width = 800, height = 600, isHero = false) {
  await ensureDir(targetDir);
  for (const filename of files) {
    const filePath = path.join(targetDir, filename);
    const title = formatTitle(filename);
    const svg = createSvgPlaceholder(title, width, height, isHero);

    // Converte para WebP de alta eficiência e peso mínimo
    await sharp(Buffer.from(svg))
      .webp({ quality: 80, effort: 6 })
      .toFile(filePath);

    console.log(`✓ Gerada imagem WebP: ${filePath}`);
  }
}

async function main() {
  const basePublic = path.resolve("public", "images");
  console.log("Iniciando geração de imagens WebP super leve...");

  await generateGroup(modalities, path.join(basePublic, "modalities"), 800, 600);
  await generateGroup(products, path.join(basePublic, "products"), 800, 800);
  await generateGroup(categories, path.join(basePublic, "categories"), 1200, 600, true);
  await generateGroup(sizeGuides, path.join(basePublic, "size-guides"), 800, 600);

  console.log("\n🎉 Todas as imagens WebP foram geradas com sucesso!");
}

main().catch(err => {
  console.error("Erro ao gerar imagens:", err);
  process.exit(1);
});
