import { z } from "zod";

/**
 * Valida URLs de imagen con soporte para:
 * - URLs absolutas (http/https)
 * - Rutas relativas que empiecen con /
 * - URLs de Cloudinary
 * - Valores vacíos (se convierten en placeholder)
 */
const imageUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((val) => {
    // Si está vacío después del trim, usar placeholder
    if (!val || val.length === 0) return "/images/products/placeholder.png";
    return val;
  })
  .refine(
    (val) => {
      // Validar que sea una URL válida
      return (
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.includes("cloudinary.com")
      );
    },
    {
      message:
        "La URL debe iniciar con / o http(s)://, o ser una URL de Cloudinary válida.",
    }
  );

export const productCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  brand: z.string().optional(),
  price: z.number().min(0, "El precio debe ser un número positivo"),
  stock: z.number().int().min(0, "El stock debe ser un número entero positivo"),
  image: imageUrlSchema,
  categoryId: z.string().min(1, "La categoría es requerida"),
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateData = z.infer<typeof productCreateSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;
