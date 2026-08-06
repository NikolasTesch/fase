import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const UserCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(8),
  role: z.enum(["T1_GERENCIA", "T2_VENDEDOR"]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["T1_GERENCIA", "T2_VENDEDOR"]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
