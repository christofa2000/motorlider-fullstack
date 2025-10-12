"use client";

import SafeNextImage from "@/components/ui/SafeNextImage";
import { useToast } from "@/hooks/useToast";
import { slugify } from "@/lib/slugify"; // <- default import (más común)
import {
    ProductCreateData,
    productCreateSchema,
} from "@/lib/validators/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import type { z } from "zod";

type ProductFormValues = z.input<typeof productCreateSchema>;

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

const FALLBACK_IMAGE = "/images/prueba.jpeg"; // usa la que tenés en public/

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

  useEffect(() => {
    if (watchedName) {
      setValue("slug", slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, setValue]);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      setUploading(false);

      if (res.ok && data.ok && data.url) {
        setValue("image", data.url, { shouldValidate: true });
        toast({
          title: "Imagen subida",
          description: "Se vinculó al producto.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error ?? "No se pudo subir la imagen",
          variant: "destructive",
        });
      }
    } catch (error) {
      setUploading(false);
      const message =
        error instanceof Error ? error.message : "No se pudo subir la imagen";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
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
          price: Math.round(parsedData.price * 100), // unidad -> cents
          // si viene vacío, el API también tiene fallback, pero aseguramos acá
          image: parsedData.image?.trim() || FALLBACK_IMAGE,
        };

        const res = await fetch(apiPath, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await res.json();

        if (!res.ok) {
          throw new Error(resData.error || "Something went wrong");
        }

        toast({
          title: "Success!",
          description: `Product ${
            product ? "updated" : "created"
          } successfully.`,
        });
        router.push("/admin/products");
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : `Could not ${product ? "update" : "create"} product.`;
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="admin-label"
          >
            Nombre del producto
          </label>
          <input
            id="name"
            {...register("name")}
            className="admin-input"
            placeholder="Ej: Amortiguador delantero"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="admin-label"
          >
            Slug (URL)
          </label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              id="slug"
              {...register("slug")}
              className="admin-input"
              placeholder="amortiguador-delantero"
            />
          </div>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-400">{errors.slug.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label
            htmlFor="brand"
            className="admin-label"
          >
            Marca
          </label>
          <input
            id="brand"
            {...register("brand")}
            className="admin-input"
            placeholder="Ej: Bosch, NGK, etc."
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-400">{errors.brand.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="categoryId"
            className="admin-label"
          >
            Categoría
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className="admin-input"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-400">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="admin-label"
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
                {...field}
                onChange={(e) =>
                  field.onChange(parseFloat(e.target.value) || 0)
                }
                step="0.01"
                className="admin-input"
                placeholder="0.00"
              />
            )}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
          )}
        </div>

        {/* Stock */}
        <div>
          <label
            htmlFor="stock"
            className="admin-label"
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
                {...field}
                onChange={(e) =>
                  field.onChange(parseInt(e.target.value, 10) || 0)
                }
                className="admin-input"
                placeholder="0"
              />
            )}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-400">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="admin-panel">
        <label
          htmlFor="image"
          className="admin-label"
        >
          URL de la imagen
        </label>
        <input
          id="image"
          {...register("image")}
          placeholder="/images/products/example.jpg o https://..."
          className="admin-input"
        />

        {/* Vista previa con SafeNextImage */}
        <div className="mt-4">
          <SafeNextImage
            src={watchedImage}
            alt="Vista previa del producto"
            width={128}
            height={128}
            className="h-32 w-32 rounded-md object-cover border border-white/10"
            fallbackSrc={FALLBACK_IMAGE}
          />
        </div>

        <label className="admin-label mt-4">
          Subir imagen desde archivo
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="admin-input"
        />
        {uploading && <p className="text-sm text-zinc-400 mt-1">Subiendo...</p>}
        {errors.image && (
          <p className="mt-1 text-sm text-red-400">{errors.image.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">
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
