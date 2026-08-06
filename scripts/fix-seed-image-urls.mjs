import fs from "fs";

let code = fs.readFileSync("prisma/seed.ts", "utf8");

// Reabilita todos os caminhos de imagens em modalidade e produtos
const modalityImages = {
  "prata": "/images/modalities/esportes-prata.webp",
  "ouro": "/images/modalities/esportes-ouro.webp",
  "profissional": "/images/modalities/esportes-profissional.webp",
  "escolinha": "/images/modalities/esportes-escolinha.webp",
  "basquete-prata": "/images/modalities/basquete-prata.webp",
  "basquete-ouro": "/images/modalities/basquete-ouro.webp",
  "basquete-profissional": "/images/modalities/basquete-profissional.webp",
  "colete-aberto": "/images/modalities/colete-aberto.webp",
  "colete-fechado": "/images/modalities/colete-fechado.webp",
  "colete-dupla": "/images/modalities/colete-dupla.webp",
  "passeio-comissao": "/images/modalities/passeio-comissao.webp",
  "passeio-torcida": "/images/modalities/passeio-torcida.webp",
  "agasalhos": "/images/modalities/agasalho.webp",
  "calcas": "/images/modalities/calca.webp",
  "acessorios": "/images/modalities/acessorio.webp"
};

const productImages = {
  "kit-futebol-campo": "/images/products/kit-futebol-campo.webp",
  "kit-futebol-society": "/images/products/kit-futebol-society.webp",
  "camisa-futebol-premium": "/images/products/camisa-futebol-premium.webp",
  "uniforme-goleiro": "/images/products/uniforme-goleiro.webp",
  "kit-volei-quadra": "/images/products/kit-volei-quadra.webp",
  "bermuda-volei-praia": "/images/products/bermuda-volei-praia.webp",
  "kit-basquete": "/images/products/kit-basquete.webp",
  "regata-basquete": "/images/products/regata-basquete.webp",
  "kit-handebol": "/images/products/kit-handebol.webp",
  "camisa-polo-comissao": "/images/products/camisa-polo-comissao.webp",
  "camisa-passeio-delegacao": "/images/products/camisa-passeio-delegacao.webp",
  "agasalho-esportivo": "/images/products/agasalho-esportivo.webp",
  "jaqueta-corta-vento": "/images/products/jaqueta-corta-vento.webp",
  "colete-treino": "/images/products/colete-treino.webp",
  "meiao-esportivo": "/images/products/meiao-esportivo.webp",
  "camisa-social": "/images/products/camisa-social.webp",
  "polo-profissional": "/images/products/polo-profissional.webp",
  "jaleco-operacional": "/images/products/jaleco-operacional.webp",
  "uniforme-brim": "/images/products/uniforme-brim.webp",
  "camiseta-promocional": "/images/products/camiseta-promocional.webp",
  "kit-evento": "/images/products/kit-evento.webp"
};

for (const [key, url] of Object.entries(modalityImages)) {
  const regex = new RegExp(`lineId:\\s*["']${key}["'].*?imageUrl:\\s*["'][^"']*["']`, "s");
  code = code.replace(regex, (match) => {
    return match.replace(/imageUrl:\s*["'][^"']*["']/, `imageUrl: "${url}"`);
  });
}

for (const [slug, url] of Object.entries(productImages)) {
  const regex = new RegExp(`slug:\\s*["']${slug}["'].*?url:\\s*["'][^"']*["']`, "s");
  code = code.replace(regex, (match) => {
    return match.replace(/url:\s*["'][^"']*["']/, `url: "${url}"`);
  });
}

fs.writeFileSync("prisma/seed.ts", code, "utf8");
console.log("prisma/seed.ts restaurado com os caminhos das imagens WebP!");
