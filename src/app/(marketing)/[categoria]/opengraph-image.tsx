import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = await prisma.category.findUnique({
    where: { slug: categoria },
    select: { name: true },
  });

  const name = category?.name?.toUpperCase() ?? categoria.toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#111827",
          position: "relative",
        }}
      >
        {/* Barra lateral vermelha */}
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

        {/* Conteúdo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 80px",
            flex: 1,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: "#CD3438",
                borderRadius: "50%",
              }}
            />
            <span
              style={{
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "system-ui",
                letterSpacing: "0.15em",
              }}
            >
              FASE SPORT
            </span>
          </div>

          {/* Nome da categoria */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span
              style={{
                color: "#ffffff",
                fontSize: 88,
                fontWeight: 800,
                fontFamily: "system-ui",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {name}
            </span>
            <span
              style={{
                color: "#9CA3AF",
                fontSize: 32,
                fontFamily: "system-ui",
                fontWeight: 400,
              }}
            >
              Uniformes Personalizados
            </span>
          </div>

          {/* Badge rodapé */}
          <span
            style={{
              color: "#6B7280",
              fontSize: 20,
              fontFamily: "system-ui",
              alignSelf: "flex-end",
            }}
          >
            fasesport.com.br
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
