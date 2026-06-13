import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ categoria: string; produto: string }>;
}) {
  const { produto, categoria } = await params;

  const product = await prisma.product.findUnique({
    where: { slug: produto },
    select: {
      name: true,
      category: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1, select: { url: true } },
    },
  });

  const name = product?.name ?? produto;
  const categoryName = product?.category?.name ?? categoria;
  const imageUrl = product?.images[0]?.url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#111827",
        }}
      >
        {/* Metade esquerda — texto */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "56px 56px",
            width: imageUrl ? "50%" : "100%",
            position: "relative",
          }}
        >
          {/* Barra vermelha */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 8,
              background: "#CD3438",
            }}
          />

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: "#CD3438",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                color: "#ffffff",
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "system-ui",
                letterSpacing: "0.15em",
              }}
            >
              FASE SPORT
            </span>
          </div>

          {/* Nome do produto e categoria */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span
              style={{
                color: "#CD3438",
                fontSize: 24,
                fontFamily: "system-ui",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {categoryName}
            </span>
            <span
              style={{
                color: "#ffffff",
                fontSize: imageUrl ? 52 : 72,
                fontWeight: 800,
                fontFamily: "system-ui",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {name}
            </span>
          </div>

          {/* Badge */}
          <span
            style={{
              color: "#6B7280",
              fontSize: 18,
              fontFamily: "system-ui",
            }}
          >
            fasesport.com.br
          </span>
        </div>

        {/* Metade direita — imagem do produto ou fallback vermelho */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            style={{
              width: "50%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: "50%",
              height: "100%",
              background: "#CD3438",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 96,
                fontFamily: "system-ui",
              }}
            >
              ⚽
            </span>
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
