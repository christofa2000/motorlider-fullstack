"use client";

import SafeNextImage from "@/components/ui/SafeNextImage";
import { useToast } from "@/hooks/useToast";
import { slugify } from "@/lib/slugify"; // ✅ default import correcto
import {
  ProductCreateData,
  productCreateSchema,
} from "@/lib/validators/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

type ProductFormValues = z.input<typeof productCreateSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

const FALLBACK_IMAGE = "/images/prueba.jpeg"; // usa la que tengas en /public

export default function ProductForm({ product, categories }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const defaultValues: ProductFormValues = product
    ? {
        name: product.name,
        slug: product.slug,
        price: product.price / 100, // cents -> unidad
        stock: product.stock,
        image: product.image ?? "",
        categoryId: product.categoryId,
        brand: product.brand ?? undefined,
      }
    : {
        name: "",
        slug: "",
        price: 0,
        stock: 0,
        image: "",
        categoryId: "",
        brand: undefined,
      };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productCreateSchema),
    defaultValues,
  });

  const watchedName = watch("name");
  const watchedImage = watch("image");
  const watchedCategoryId = watch("categoryId");

  // Autogenerar slug al tipear nombre
  useEffect(() => {
    if (watchedName) {
      setValue("slug", slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, setValue]);

  // Si NO hay product y NO hay categoryId pero sí hay categorías, selecciona la primera
  useEffect(() => {
    if (!product && !watchedCategoryId && categories.length > 0) {
      setValue("categoryId", categories[0].id, { shouldValidate: true });
    }
  }, [product, watchedCategoryId, categories, setValue]);

  const previewSrc = useMemo(
    () => (watchedImage && watchedImage.trim() ? watchedImage : FALLBACK_IMAGE),
    [watchedImage]
  );

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 10MB para coincidir con el backend)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Crear FormData correctamente
      const formData = new FormData();
      formData.append("file", file);

      console.log(
        `Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`
      );

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        // NO agregar Content-Type manualmente - fetch lo maneja automáticamente para FormData
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Upload failed:", data);

        // Manejar errores específicos de configuración
        if (
          res.status === 500 &&
          data.error?.includes("Variables de entorno")
        ) {
          throw new Error(
            "Error de configuración: faltan variables de entorno de Cloudinary. Contacta al administrador."
          );
        }

        throw new Error(data.error || `Error ${res.status}: ${res.statusText}`);
      }

      if (data.ok && data.url) {
        setValue("image", data.url, { shouldValidate: true });
        toast({
          title: "Imagen subida",
          description: "Se vinculó al producto correctamente.",
        });
        console.log("Upload successful:", data.url);
      } else {
        throw new Error(data.error || "No se pudo subir la imagen");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      const message =
        error instanceof Error ? error.message : "No se pudo subir la imagen";
      toast({
        title: "Error al subir imagen",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      try {
        const apiPath = product
          ? `/api/products/${product.id}`
          : "/api/products";
        const method = product ? "PATCH" : "POST";

        const parsedData: ProductCreateData = productCreateSchema.parse(data);

        const payload = {
          ...parsedData,
          price: Math.round((parsedData.price ?? 0) * 100), // unidad -> cents
          // El validador ya maneja el fallback de imagen
        };

        const res = await fetch(apiPath, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const resData = await res.json();
          throw new Error(
            resData.error || `HTTP ${res.status}: ${res.statusText}`
          );
        }

        const resData = await res.json();
        if (!resData.ok) {
          throw new Error(resData.error || "Error del servidor");
        }

        toast({
          title: "¡Listo!",
          description: `Producto ${
            product ? "actualizado" : "creado"
          } correctamente.`,
        });
        router.push("/admin/products");
        router.refresh();
      } catch (error) {
        console.error("Error submitting product:", error);
        const message =
          error instanceof Error
            ? error.message
            : `No se pudo ${product ? "actualizar" : "crear"} el producto.`;
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 text-slate-900"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Nombre del producto
          </label>
          <input
            id="name"
            {...register("name")}
            className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="Ej: Amortiguador delantero"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-slate-700"
          >
            Slug (URL)
          </label>
          <input
            id="slug"
            {...register("slug")}
            className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="amortiguador-delantero"
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-slate-700"
          >
            Marca
          </label>
          <input
            id="brand"
            {...register("brand")}
            className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            placeholder="Ej: Bosch, NGK, etc."
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-slate-700"
          >
            Categoría
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {categories.length === 0 ? (
              <option value="">
                (No hay categorías — corré `npm run db:seed`)
              </option>
            ) : (
              <>
                <option value="">Selecciona una categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-slate-700"
          >
            Precio (en pesos)
          </label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <input
                id="price"
                type="number"
                inputMode="decimal"
                value={Number.isFinite(field.value as number) ? field.value : 0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                  )
                }
                step="0.01"
                className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="0.00"
              />
            )}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-slate-700"
          >
            Stock disponible
          </label>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <input
                id="stock"
                type="number"
                inputMode="numeric"
                value={Number.isFinite(field.value as number) ? field.value : 0}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === ""
                      ? 0
                      : parseInt(e.target.value, 10) || 0
                  )
                }
                className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                placeholder="0"
              />
            )}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="rounded-lg border border-[var(--color-neutral-200)] bg-white p-4">
        <label
          htmlFor="image"
          className="block text-sm font-medium text-slate-700"
        >
          URL de la imagen
        </label>
        <input
          id="image"
          {...register("image")}
          placeholder="/images/products/example.jpg o https://..."
          className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />

        {/* Vista previa */}
        <div className="mt-4">
          <SafeNextImage
            src={previewSrc}
            alt="Vista previa del producto"
            width={128}
            height={128}
            className="h-32 w-32 rounded-md object-cover border border-[var(--color-neutral-200)]"
            fallbackSrc={FALLBACK_IMAGE}
          />
        </div>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Subir imagen desde archivo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 w-full rounded-md border border-[var(--color-neutral-200)] bg-white px-3 py-2 text-sm text-slate-900 file:mr-4 file:rounded-md file:border-0 file:bg-[var(--color-secondary)] file:px-3 file:py-2 file:text-[var(--color-contrast)] hover:file:brightness-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        {uploading && (
          <p className="mt-1 text-sm text-slate-500">Subiendo...</p>
        )}
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending
            ? product
              ? "Actualizando..."
              : "Creando..."
            : product
            ? "Actualizar Producto"
            : "Crear Producto"}
        </button>
      </div>
    </form>
  );
}
