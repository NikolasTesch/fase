import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Admin ───────────────────────────────────────────────────────────────
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD são obrigatórios");
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: hash, name: "Admin Fase" },
  });
  console.log(`✓ Admin: ${email}`);

  // ─── Vendedor (T2) ────────────────────────────────────────────────────────
  const sellerEmail = process.env.SELLER_SEED_EMAIL;
  const sellerPassword = process.env.SELLER_SEED_PASSWORD;
  if (sellerEmail && sellerPassword) {
    const sellerHash = await bcrypt.hash(sellerPassword, 12);
    await prisma.adminUser.upsert({
      where: { email: sellerEmail },
      update: { role: "T2_VENDEDOR", isActive: true },
      create: { email: sellerEmail, passwordHash: sellerHash, name: "Vendedor Fase", role: "T2_VENDEDOR" },
    });
    console.log(`✓ Vendedor (T2): ${sellerEmail}`);
  } else {
    console.log("⚠ Vendedor (T2): SELLER_SEED_EMAIL/SELLER_SEED_PASSWORD ausentes — pulando");
  }

  // ─── Tags de arte ─────────────────────────────────────────────────────────
  const artTags = ["Escudo", "Mascote", "Patrocinador", "Futebol", "Vôlei", "Basquete", "Handebol", "Número", "Time"];
  for (const name of artTags) {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.artTag.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  console.log(`✓ ${artTags.length} tags de arte`);

  // ─── Categorias ──────────────────────────────────────────────────────────
  const categoriesData = [
    {
      slug: "futebol",
      name: "Futebol",
      sortOrder: 1,
      description:
        "Uniformes de futebol personalizados com tecidos de alta performance, estampas exclusivas e acabamento profissional. Kits completos para seu time.",
      seoTitle: "Uniformes de Futebol Personalizados | Fase Sport Colatina",
      seoDesc:
        "Uniformes de futebol sob medida em Colatina-ES. Camisas, calções e meias com sublimação total. Mínimo de 10 peças. Solicite seu orçamento.",
      subcategories: [
        { slug: "infantil", name: "Infantil", sortOrder: 1 },
        { slug: "adulto", name: "Adulto", sortOrder: 2 },
        { slug: "goleiro", name: "Goleiro", sortOrder: 3 },
      ],
      products: [
        {
          slug: "kit-futebol-campo",
          name: "Kit Futebol Campo",
          description:
            "Kit completo para futebol de campo com camisa, calção e meião. Tecido dry-fit com sublimação total, cores vibrantes e resistentes a lavagens.",
          fabric: "Dry-fit 100% poliéster",
          minQty: 10,
          isFeatured: true,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Kit futebol campo Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        {
          slug: "kit-futebol-society",
          name: "Kit Futebol Society",
          description:
            "Kit para futebol society. Design moderno, conforto térmico e durabilidade. Disponível em qualquer combinação de cores.",
          fabric: "Dry-fit 100% poliéster",
          minQty: 10,
          isFeatured: false,
          sortOrder: 2,
          images: [
            {
              url: "",
              altText: "Kit futebol society Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        {
          slug: "camisa-futebol-premium",
          name: "Camisa Futebol Premium",
          description:
            "Camisa de futebol linha premium com tecido respirável de dupla camada, gola personalizada e detalhes em relevo. Ideal para clubes e times profissionais.",
          fabric: "Premium dry-fit bicolour",
          minQty: 10,
          isFeatured: true,
          sortOrder: 3,
          images: [
            {
              url: "",
              altText: "Camisa futebol premium Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        {
          slug: "uniforme-goleiro",
          name: "Uniforme Goleiro",
          description:
            "Uniforme especial para goleiros com camisa de manga longa ou curta, calção reforçado e meião. Proteção e estilo em campo.",
          fabric: "Dry-fit com proteção UV",
          minQty: 5,
          isFeatured: false,
          sortOrder: 4,
          images: [
            {
              url: "",
              altText: "Uniforme de goleiro Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [
        {
          question: "Qual o mínimo de peças para uniformes de futebol?",
          answer:
            "O mínimo é de 10 peças por pedido. Para kits completos (camisa + calção + meião), o mínimo se aplica ao conjunto.",
          sortOrder: 1,
        },
        {
          question: "Posso personalizar com nome e número dos jogadores?",
          answer:
            "Sim! Numeração e nomes são incluídos gratuitamente nos uniformes. Você nos envia a lista e nós cuidamos de tudo.",
          sortOrder: 2,
        },
        {
          question: "Qual o prazo de entrega?",
          answer:
            "O prazo padrão é de 15 a 20 dias úteis após aprovação da arte. Consulte disponibilidade de prazo expresso.",
          sortOrder: 3,
        },
      ],
    },
    {
      slug: "volei",
      name: "Vôlei",
      sortOrder: 2,
      description:
        "Uniformes de vôlei personalizados para quadra e praia. Camisas, shorts e bermudas com tecido leve e confortável para máxima performance.",
      seoTitle: "Uniformes de Vôlei Personalizados | Fase Sport",
      seoDesc:
        "Uniformes de vôlei sob medida em Colatina-ES. Sublimação total, entrega rápida. Mínimo 10 peças.",
      subcategories: [
        { slug: "quadra", name: "Quadra", sortOrder: 1 },
        { slug: "praia", name: "Vôlei de Praia", sortOrder: 2 },
      ],
      products: [
        {
          slug: "kit-volei-quadra",
          name: "Kit Vôlei Quadra",
          description:
            "Kit completo para vôlei de quadra com camisa e shorts de compressão. Tecido leve e respirável para máxima mobilidade.",
          fabric: "Dry-fit respirável",
          minQty: 10,
          isFeatured: true,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Kit vôlei de quadra Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        {
          slug: "bermuda-volei-praia",
          name: "Bermuda Vôlei de Praia",
          description:
            "Bermuda para vôlei de praia com tecido secagem rápida, resistente a água salgada e sol. Personalização total de cores e estampas.",
          fabric: "Nylon secagem rápida",
          minQty: 10,
          isFeatured: false,
          sortOrder: 2,
          images: [
            {
              url: "",
              altText: "Bermuda vôlei de praia Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [
        {
          question: "Posso pedir só camisas sem o shorts?",
          answer:
            "Sim! Você pode pedir as peças separadamente. O mínimo de 10 peças se aplica a cada item individualmente.",
          sortOrder: 1,
        },
      ],
    },
    {
      slug: "basquete",
      name: "Basquete",
      sortOrder: 3,
      description:
        "Uniformes de basquete com corte americano, tecido respirável e personalização completa. Kits com regata e shorts para seu time.",
      seoTitle: "Uniformes de Basquete Personalizados | Fase Sport",
      seoDesc:
        "Uniformes de basquete sob medida. Regatas e shorts com sublimação total em Colatina-ES.",
      subcategories: [],
      products: [
        {
          slug: "kit-basquete",
          name: "Kit Basquete",
          description:
            "Kit completo de basquete com regata e shorts. Corte americano amplo para liberdade de movimento, tecido dry-fit com sublimação total.",
          fabric: "Dry-fit 100% poliéster",
          minQty: 10,
          isFeatured: true,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Kit basquete Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        {
          slug: "regata-basquete",
          name: "Regata Basquete",
          description:
            "Regata de basquete com numeração e nome personalizados. Disponível em corte regular e slim.",
          fabric: "Dry-fit respirável",
          minQty: 10,
          isFeatured: false,
          sortOrder: 2,
          images: [
            {
              url: "",
              altText: "Regata basquete Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [],
    },
    {
      slug: "handebol",
      name: "Handebol",
      sortOrder: 4,
      description:
        "Uniformes de handebol com tecido de alta performance e personalização completa para seu time.",
      seoTitle: "Uniformes de Handebol Personalizados | Fase Sport",
      seoDesc:
        "Uniformes de handebol sob medida em Colatina-ES. Qualidade e entrega rápida.",
      subcategories: [],
      products: [
        {
          slug: "kit-handebol",
          name: "Kit Handebol",
          description:
            "Kit completo de handebol com camisa e calção. Tecido resistente e confortável para a dinâmica do esporte.",
          fabric: "Dry-fit 100% poliéster",
          minQty: 10,
          isFeatured: false,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Kit handebol Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [],
    },
    {
      slug: "passeio",
      name: "Passeio / Comissão",
      sortOrder: 5,
      description:
        "Camisas sociais e polos personalizadas para comissões técnicas, torcidas organizadas e eventos esportivos. Visual profissional para toda a delegação.",
      seoTitle: "Camisas de Passeio e Comissão Personalizadas | Fase Sport",
      seoDesc:
        "Camisas polo e de passeio personalizadas para comissão técnica e delegação. Fase Sport Colatina-ES.",
      subcategories: [],
      products: [
        {
          slug: "camisa-polo-comissao",
          name: "Camisa Polo Comissão",
          description:
            "Camisa polo personalizada para comissão técnica e staff. Tecido piquet de qualidade com bordado ou estampa em silk. Visual profissional para toda a delegação.",
          fabric: "Piquet 100% algodão ou dry-fit",
          minQty: 10,
          isFeatured: true,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Camisa polo comissão Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        {
          slug: "camisa-passeio-delegacao",
          name: "Camisa Passeio Delegação",
          description:
            "Camisa manga longa ou curta para delegação e torcida organizada. Personalização completa com nome e número opcionais.",
          fabric: "Malha 100% algodão penteado",
          minQty: 10,
          isFeatured: false,
          sortOrder: 2,
          images: [
            {
              url: "",
              altText: "Camisa passeio delegação Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [],
    },
    {
      slug: "agasalho",
      name: "Agasalho",
      sortOrder: 6,
      description:
        "Agasalhos esportivos personalizados com jaqueta e calça. Ideal para aquecimento, viagens e identificação do time fora de campo.",
      seoTitle: "Agasalhos Esportivos Personalizados | Fase Sport",
      seoDesc:
        "Agasalhos esportivos sob medida em Colatina-ES. Jaqueta e calça personalizados para seu time.",
      subcategories: [],
      products: [
        {
          slug: "agasalho-esportivo",
          name: "Agasalho Esportivo",
          description:
            "Agasalho completo com jaqueta e calça. Tecido moletom ou helanca com forro, ideal para aquecimento e viagens do time.",
          fabric: "Moletom / Helanca com forro",
          minQty: 10,
          isFeatured: true,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Agasalho esportivo Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        {
          slug: "jaqueta-corta-vento",
          name: "Jaqueta Corta-Vento",
          description:
            "Jaqueta corta-vento leve e resistente, ideal para treinos em dias frios. Personalização total de cores e logomarcas.",
          fabric: "Tactel impermeável",
          minQty: 10,
          isFeatured: false,
          sortOrder: 2,
          images: [
            {
              url: "",
              altText: "Jaqueta corta-vento Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [],
    },
    {
      slug: "colete",
      name: "Colete",
      sortOrder: 7,
      description:
        "Coletes esportivos personalizados para treinos, identificação de equipes e arbitragem. Práticos e duráveis.",
      seoTitle: "Coletes Esportivos Personalizados | Fase Sport",
      seoDesc:
        "Coletes esportivos sob medida em Colatina-ES. Para treinos e identificação de times.",
      subcategories: [],
      products: [
        {
          slug: "colete-treino",
          name: "Colete Treino",
          description:
            "Colete leve para separação de times em treinos. Tecido dry-fit respirável, disponível em diversas cores. Fácil de vestir e lavar.",
          fabric: "Dry-fit 100% poliéster",
          minQty: 10,
          isFeatured: false,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Colete treino Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [],
    },
    {
      slug: "acessorios",
      name: "Acessórios",
      sortOrder: 8,
      description:
        "Acessórios esportivos personalizados: meiões, tornozeleiras, headbands e mais. Complete o visual do seu time.",
      seoTitle: "Acessórios Esportivos Personalizados | Fase Sport",
      seoDesc:
        "Acessórios esportivos sob medida em Colatina-ES. Meiões, tornozeleiras e headbands personalizados.",
      subcategories: [],
      products: [
        {
          slug: "meiao-esportivo",
          name: "Meião Esportivo",
          description:
            "Meião esportivo personalizado com as cores e logomarca do seu time. Tecido confortável e durável para uso em jogos e treinos.",
          fabric: "Algodão com elastano",
          minQty: 10,
          isFeatured: false,
          sortOrder: 1,
          images: [
            {
              url: "",
              altText: "Meião esportivo Fase Sport",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      ],
      faqs: [],
    },
  ];

  for (const catData of categoriesData) {
    const { subcategories, products, faqs, ...catFields } = catData;

    const category = await prisma.category.upsert({
      where: { slug: catFields.slug },
      update: catFields,
      create: catFields,
    });

    for (const sub of subcategories) {
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
        update: {},
        create: { ...sub, categoryId: category.id },
      });
    }

    for (const faq of faqs) {
      const existing = await prisma.faq.findFirst({
        where: { categoryId: category.id, question: faq.question },
      });
      if (!existing) {
        await prisma.faq.create({ data: { ...faq, categoryId: category.id } });
      }
    }

    for (const prod of products) {
      const { images, ...prodFields } = prod;
      const product = await prisma.product.upsert({
        where: { slug: prodFields.slug },
        update: { ...prodFields, categoryId: category.id },
        create: { ...prodFields, categoryId: category.id },
      });

      const existingImages = await prisma.productImage.count({
        where: { productId: product.id },
      });
      if (existingImages === 0) {
        await prisma.productImage.createMany({
          data: images.map((img) => ({ ...img, productId: product.id })),
        });
      }
    }

    console.log(`✓ Categoria: ${catFields.name} (${products.length} produtos)`);
  }

  // ─── Depoimentos ─────────────────────────────────────────────────────────
  const testimonials = [
    {
      clientName: "Carlos Mendonça",
      teamName: "Atlético Colatina FC",
      sport: "Futebol",
      text: "Excelente qualidade! Encomendamos 22 kits completos para nosso time e ficaram perfeitos. Entrega no prazo e as cores ficaram exatamente como pedimos.",
      rating: 5,
      sortOrder: 1,
      materialImageUrl: null,
    },
    {
      clientName: "Fernanda Lima",
      teamName: "Colatina Vôlei Clube",
      sport: "Vôlei",
      text: "Atendimento incrível e produto de qualidade. Os uniformes de vôlei ficaram lindos, tecido leve e confortável. Toda a equipe adorou!",
      rating: 5,
      sortOrder: 2,
      materialImageUrl: null,
    },
    {
      clientName: "Ricardo Souza",
      teamName: "Basquete Norte ES",
      sport: "Basquete",
      text: "Já é a terceira vez que fazemos uniformes na Fase Sport. Qualidade constante, preço justo e equipe muito atenciosa. Recomendo sem dúvida.",
      rating: 5,
      sortOrder: 3,
      materialImageUrl: null,
    },
    {
      clientName: "Patrícia Rocha",
      teamName: "Escola Estadual J. Pessoa",
      sport: "Futebol",
      text: "Fizemos os kits para os jogos estudantis e ficaram incríveis. As crianças amaram! Prazo cumprido e arte aprovada rapidamente.",
      rating: 5,
      sortOrder: 4,
      materialImageUrl: null,
    },
    {
      clientName: "André Martinelli",
      teamName: "Society Amigos FC",
      sport: "Futebol",
      text: "Pedimos para nosso grupo de friends e o resultado superou as expectativas. Material de qualidade, pessoal muito prestativo no WhatsApp.",
      rating: 5,
      sortOrder: 5,
      materialImageUrl: null,
    },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { clientName: t.clientName, teamName: t.teamName },
    });
    if (!existing) {
      await prisma.testimonial.create({ data: t });
    }
  }
  console.log(`✓ ${testimonials.length} depoimentos`);

  // ─── FAQs globais ────────────────────────────────────────────────────────
  const globalFaqs = [
    {
      question: "Como funciona o processo de personalização?",
      answer:
        "Você nos envia suas ideias (cores, logomarca, números), nossa equipe cria a arte gratuitamente e envia para aprovação. Após aprovação, produzimos e entregamos.",
      sortOrder: 1,
    },
    {
      question: "Qual o prazo de entrega?",
      answer:
        "O prazo padrão é de 15 a 20 dias úteis após aprovação da arte. Temos opção de prazo expresso mediante consulta.",
      sortOrder: 2,
    },
    {
      question: "Vocês entregam em todo o Brasil?",
      answer:
        "Sim! Entregamos para todo o Brasil via transportadora ou Correios. Clientes de Colatina-ES e região podem retirar na loja.",
      sortOrder: 3,
    },
    {
      question: "Qual o mínimo de peças?",
      answer:
        "O mínimo é de 10 peças por pedido. Para alguns acessórios, o mínimo pode variar — consulte nossa equipe.",
      sortOrder: 4,
    },
    {
      question: "O frete é por conta do cliente?",
      answer:
        "Sim, o frete é por conta do cliente. Calculamos o valor após a aprovação do pedido e informamos antes de fechar.",
      sortOrder: 5,
    },
  ];

  for (const faq of globalFaqs) {
    const existing = await prisma.faq.findFirst({
      where: { question: faq.question, categoryId: null },
    });
    if (!existing) {
      await prisma.faq.create({ data: faq });
    }
  }
  console.log(`✓ ${globalFaqs.length} FAQs globais`);

  // ─── Categoria Empresarial ────────────────────────────────────────────────
  const empresarialCategory = await prisma.category.upsert({
    where: { slug: "empresarial" },
    update: {},
    create: {
      slug: "empresarial",
      name: "Empresarial",
      sortOrder: 9,
      description:
        "Uniformes corporativos e profissionais para empresas, equipes administrativas e eventos. Confecção personalizada com bordado, silk ou sublimação.",
      seoTitle: "Uniformes Empresariais Personalizados | Fase Sport",
      seoDesc:
        "Uniformes corporativos sob medida para empresas em Teixeira de Freitas-BA. Polos, camisas sociais e operacionais personalizados.",
      subcategories: {
        create: [
          { slug: "social", name: "Administrativo / Social", sortOrder: 1 },
          { slug: "polo", name: "Polo Profissional", sortOrder: 2 },
          { slug: "operacional", name: "Operacional / Oficinas", sortOrder: 3 },
          { slug: "promocional", name: "Eventos / Promocional", sortOrder: 4 },
        ],
      },
    },
    include: { subcategories: true },
  });

  const socialSub = empresarialCategory.subcategories.find(
    (s) => s.slug === "social"
  );
  const poloSub = empresarialCategory.subcategories.find(
    (s) => s.slug === "polo"
  );
  const operacionalSub = empresarialCategory.subcategories.find(
    (s) => s.slug === "operacional"
  );
  const promocionalSub = empresarialCategory.subcategories.find(
    (s) => s.slug === "promocional"
  );

  const empresarialProducts = [
    {
      slug: "camisa-social-administrativa",
      name: "Camisa Social Administrativa",
      description:
        "Camisa social de botão personalizada com logomarca bordada ou sublimada para equipe administrativa e staff. Tecido resistente e confortável para o dia a dia corporativo.",
      fabric: "Microfibra premium com elastano",
      minQty: 10,
      isFeatured: false,
      sortOrder: 1,
      subcategoryId: socialSub?.id,
      images: [{ url: "", altText: "Camisa social administrativa Fase Sport", isPrimary: true, sortOrder: 0 }],
    },
    {
      slug: "camisa-polo-profissional",
      name: "Camisa Polo Profissional",
      description:
        "Polo corporativa de alta qualidade com bordado de logomarca e número identificador. Ideal para equipes de atendimento, vendas e suporte técnico.",
      fabric: "Piquet 100% algodão",
      minQty: 10,
      isFeatured: false,
      sortOrder: 2,
      subcategoryId: poloSub?.id,
      images: [{ url: "", altText: "Polo profissional Fase Sport", isPrimary: true, sortOrder: 0 }],
    },
    {
      slug: "jaleco-operacional",
      name: "Jaleco Operacional",
      description:
        "Jaleco personalizado com bordado ou silk para equipes de campo, técnicos e profissionais de saúde. Tecido resistente com bolsos funcionais.",
      fabric: "Brim 100% algodão",
      minQty: 10,
      isFeatured: false,
      sortOrder: 3,
      subcategoryId: operacionalSub?.id,
      images: [{ url: "", altText: "Jaleco operacional Fase Sport", isPrimary: true, sortOrder: 0 }],
    },
    {
      slug: "uniforme-brim-pesado",
      name: "Uniforme Brim Pesado",
      description:
        "Conjunto calça + camisa em brim pesado para ambientes industriais e oficinas. Alta durabilidade com logomarca bordada ou silk.",
      fabric: "Brim pesado com tratamento anti-chama opcional",
      minQty: 10,
      isFeatured: false,
      sortOrder: 4,
      subcategoryId: operacionalSub?.id,
      images: [{ url: "", altText: "Uniforme brim pesado Fase Sport", isPrimary: true, sortOrder: 0 }],
    },
    {
      slug: "camiseta-promocional-dry-fit",
      name: "Camiseta Promocional Dry-Fit",
      description:
        "Camiseta dry-fit personalizada com sublimação total para eventos corporativos, confraternizações e campanhas de marketing. Disponível em qualquer cor.",
      fabric: "Dry-fit 100% poliéster",
      minQty: 20,
      isFeatured: false,
      sortOrder: 5,
      subcategoryId: promocionalSub?.id,
      images: [{ url: "", altText: "Camiseta promocional dry-fit Fase Sport", isPrimary: true, sortOrder: 0 }],
    },
    {
      slug: "kit-evento-corporativo",
      name: "Kit Evento Corporativo",
      description:
        "Kit completo para eventos: camiseta, boné e ecobag personalizados com identidade visual da empresa. Pedido mínimo para grupos a partir de 20 kits.",
      fabric: "Dry-fit + algodão + não-tecido",
      minQty: 20,
      isFeatured: false,
      sortOrder: 6,
      subcategoryId: promocionalSub?.id,
      images: [{ url: "", altText: "Kit evento corporativo Fase Sport", isPrimary: true, sortOrder: 0 }],
    },
  ];

  for (const p of empresarialProducts) {
    const exists = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (!exists) {
      const { images, ...productData } = p;
      await prisma.product.create({
        data: {
          ...productData,
          categoryId: empresarialCategory.id,
          images: { create: images },
        },
      });
    }
  }
  console.log(`✓ Categoria: Empresarial (${empresarialProducts.length} produtos)`);

  // ─── Modalidades (seção da Homepage) ──────────────────────────────────────
  const modalitySeed = [
    { sectionTitle: "Esportes", sectionSubtitle: "Futebol, Vôlei, Handebol e Escolinha", sectionOrder: 1, lineId: "prata", name: "Linha Prata", description: "Excelente custo-benefício para times amadores com tecido dry-fit de qualidade.", imageUrl: "", sortOrder: 1, catalogLinkLabel: "Ver Futebol", catalogLinkHref: "/futebol" },
    { sectionTitle: "Esportes", sectionSubtitle: "Futebol, Vôlei, Handebol e Escolinha", sectionOrder: 1, lineId: "ouro", name: "Linha Ouro", description: "Sublimação total em alta definição e modelagem atlética.", imageUrl: "", sortOrder: 2, catalogLinkLabel: "Ver Vôlei", catalogLinkHref: "/volei" },
    { sectionTitle: "Esportes", sectionSubtitle: "Futebol, Vôlei, Handebol e Escolinha", sectionOrder: 1, lineId: "profissional", name: "Profissional", description: "Tecidos tecnológicos combinados, gola personalizada e recortes dry.", imageUrl: "", sortOrder: 3, catalogLinkLabel: "Ver Handebol", catalogLinkHref: "/handebol" },
    { sectionTitle: "Esportes", sectionSubtitle: "Futebol, Vôlei, Handebol e Escolinha", sectionOrder: 1, lineId: "escolinha", name: "Escolinha", description: "Kits duráveis com foco em mobilidade e conforto para jovens atletas.", imageUrl: "", sortOrder: 4, catalogLinkLabel: "Ver Escolinha", catalogLinkHref: "/futebol?sub=infantil" },
    { sectionTitle: "Basquete", sectionSubtitle: null, sectionOrder: 2, lineId: "basquete-prata", name: "Linha Prata", description: "Modelagem tradicional americana com tecido respirável.", imageUrl: "", sortOrder: 1 },
    { sectionTitle: "Basquete", sectionSubtitle: null, sectionOrder: 2, lineId: "basquete-ouro", name: "Linha Ouro", description: "Design moderno com sublimação completa, gola diferenciada.", imageUrl: "", sortOrder: 2 },
    { sectionTitle: "Basquete", sectionSubtitle: null, sectionOrder: 2, lineId: "basquete-profissional", name: "Profissional", description: "Linha profissional com recortes dry, bordas elásticas e alta ventilação.", imageUrl: "", sortOrder: 3 },
    { sectionTitle: "Coletes", sectionSubtitle: null, sectionOrder: 3, lineId: "colete-aberto", name: "Colete Aberto", description: "Ajuste por fitas elásticas nas laterais, alta praticidade.", imageUrl: "", sortOrder: 1 },
    { sectionTitle: "Coletes", sectionSubtitle: null, sectionOrder: 3, lineId: "colete-fechado", name: "Fechado Simples", description: "Fechamento clássico lateral, caimento leve para treinos.", imageUrl: "", sortOrder: 2 },
    { sectionTitle: "Coletes", sectionSubtitle: null, sectionOrder: 3, lineId: "colete-dupla", name: "Dupla Face", description: "Um colete com duas cores totalmente usáveis, agilidade na divisão de equipes.", imageUrl: "", sortOrder: 3 },
    { sectionTitle: "Passeio", sectionSubtitle: null, sectionOrder: 4, lineId: "passeio-comissao", name: "Passeio Comissão", description: "Polos e camisas de botão para staff e equipe técnica.", imageUrl: "", sortOrder: 1 },
    { sectionTitle: "Passeio", sectionSubtitle: null, sectionOrder: 4, lineId: "passeio-torcida", name: "Torcida", description: "Camisetas casuais sublimadas e personalizadas para apoiadores e famílias.", imageUrl: "", sortOrder: 2 },
    { sectionTitle: "Agasalhos, Calças e Acessórios", sectionSubtitle: null, sectionOrder: 5, lineId: "agasalhos", name: "Agasalhos", description: "Jaquetas corta-vento ou de helanca com zíper e bolsos.", imageUrl: "", sortOrder: 1 },
    { sectionTitle: "Agasalhos, Calças e Acessórios", sectionSubtitle: null, sectionOrder: 5, lineId: "calcas", name: "Calças", description: "Calças de treino flexíveis com ajuste elástico.", imageUrl: "", sortOrder: 2 },
    { sectionTitle: "Agasalhos, Calças e Acessórios", sectionSubtitle: null, sectionOrder: 5, lineId: "acessorios", name: "Acessórios", description: "Meiões, tornozeleiras e headbands para fechar o uniforme do time.", imageUrl: "", sortOrder: 3 },
  ];

  for (const item of modalitySeed) {
    await prisma.modalityItem.upsert({
      where: { lineId: item.lineId },
      update: { sectionTitle: item.sectionTitle, sectionSubtitle: item.sectionSubtitle, sectionOrder: item.sectionOrder, name: item.name, description: item.description, imageUrl: item.imageUrl, sortOrder: item.sortOrder, catalogLinkLabel: item.catalogLinkLabel ?? null, catalogLinkHref: item.catalogLinkHref ?? null },
      create: item,
    });
  }
  console.log(`✓ ${modalitySeed.length} modalidades`);

  // ─── Tabelas de Medidas ─────────────────────────────────────────────────

  const sizeChartSeed = [
    { type: "camisa", title: "Camisa", columns: ["Peito (cm)", "Cintura (cm)", "Comprimento (cm)", "Manga (cm)"], rows: [{ label: "P", values: ["64", "54", "70", "20"] }, { label: "M", values: ["68", "58", "74", "21"] }, { label: "G", values: ["72", "62", "78", "22"] }, { label: "GG", values: ["76", "66", "82", "23"] }] },
    { type: "short-masc", title: "Short Masculino", columns: ["Cintura (cm)", "Comprimento (cm)"], rows: [{ label: "P", values: ["40", "42"] }, { label: "M", values: ["44", "44"] }, { label: "G", values: ["48", "46"] }, { label: "GG", values: ["52", "48"] }] },
    { type: "short-fem", title: "Short Feminino", columns: ["Cintura (cm)", "Quadril (cm)", "Comprimento (cm)"], rows: [{ label: "P", values: ["36", "46", "38"] }, { label: "M", values: ["38", "48", "40"] }, { label: "G", values: ["40", "52", "42"] }, { label: "GG", values: ["44", "56", "44"] }] },
    { type: "short-suplex", title: "Short Suplex", columns: ["Cintura (cm)", "Comprimento (cm)"], rows: [{ label: "P", values: ["38", "40"] }, { label: "M", values: ["42", "42"] }, { label: "G", values: ["46", "44"] }, { label: "GG", values: ["50", "46"] }] },
    { type: "regata", title: "Regata", columns: ["Peito (cm)", "Cintura (cm)", "Comprimento (cm)"], rows: [{ label: "P", values: ["62", "52", "68"] }, { label: "M", values: ["66", "56", "72"] }, { label: "G", values: ["70", "60", "76"] }, { label: "GG", values: ["74", "64", "80"] }] },
    { type: "bermuda", title: "Bermuda", columns: ["Cintura (cm)", "Comprimento (cm)", "Barra (cm)"], rows: [{ label: "P", values: ["40", "48", "28"] }, { label: "M", values: ["44", "50", "30"] }, { label: "G", values: ["48", "52", "32"] }] },
    { type: "agasalho", title: "Agasalho", columns: ["Peito (cm)", "Cintura (cm)", "Comprimento (cm)", "Manga (cm)"], rows: [{ label: "P", values: ["66", "56", "72", "21"] }, { label: "M", values: ["70", "60", "76", "22"] }, { label: "G", values: ["74", "64", "80", "23"] }, { label: "GG", values: ["78", "68", "84", "24"] }] },
    { type: "colete", title: "Colete", columns: ["Peito (cm)", "Cintura (cm)", "Comprimento (cm)"], rows: [{ label: "P", values: ["60", "50", "66"] }, { label: "M", values: ["64", "54", "70"] }, { label: "G", values: ["68", "58", "74"] }, { label: "GG", values: ["72", "62", "78"] }] },
  ];

  for (const item of sizeChartSeed) {
    await prisma.sizeChart.upsert({
      where: { type: item.type },
      update: { title: item.title, columns: item.columns, rows: item.rows },
      create: item,
    });
  }
  console.log(`✓ ${sizeChartSeed.length} tabelas de medidas`);

  console.log("\n✅ Seed concluído com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
