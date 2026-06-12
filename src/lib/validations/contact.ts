import { z } from "zod";

export const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  city: z.string().max(100).optional(),
  sport: z.enum([
    "futebol",
    "volei",
    "basquete",
    "handebol",
    "passeio",
    "agasalho",
    "colete",
    "acessorios",
  ]),
  quantity: z.number().int().min(1).optional(),
  details: z.string().max(1000).optional(),
  productSlug: z.string().optional(),
  source: z.enum(["form", "whatsapp", "simulator"]).default("form"),
});

export type ContactInput = z.infer<typeof ContactSchema>;
