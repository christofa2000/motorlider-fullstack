import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  brand: z.string().optional(),
  price: z.number().int().min(0, "Price must be a positive integer"),
  stock: z.number().int().min(0, "Stock must be a positive integer"),
  image: z.union([z.string().url(), z.string().startsWith("/images/"), z.literal("")]).default(""),
  categoryId: z.string().min(1, "Category is required"),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateData = z.infer<typeof productCreateSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;