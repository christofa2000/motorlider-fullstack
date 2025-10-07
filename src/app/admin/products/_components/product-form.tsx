"use client";

import { useToast } from "@/hooks/useToast";
import { slugify } from "@/lib/slugify"; // <- default import (más común)
import {
  ProductCreateData,
  productCreateSchema,
} from "@/lib/validators/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Product } from "@prisma/client";
import Image from "next/image";
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
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="name"
            {...register("name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700"
          >
            Slug
          </label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              id="slug"
              {...register("slug")}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] sm:text-sm"
            />
          </div>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label
            htmlFor="brand"
            className="block text-sm font-medium text-gray-700"
          >
            Brand
          </label>
          <input
            id="brand"
            {...register("brand")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] sm:text-sm"
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="categoryId"
            {...register("categoryId")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
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
            className="block text-sm font-medium text-gray-700"
          >
            Price (in currency unit)
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] sm:text-sm"
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
            className="block text-sm font-medium text-gray-700"
          >
            Stock
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] sm:text-sm"
              />
            )}
          />
          {errors.stock && (
            <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Image */}
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700"
        >
          Image URL
        </label>
        <input
          id="image"
          {...register("image")}
          placeholder="/images/products/example.jpg"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[var(--color-accent)] focus:ring-[var(--color-accent)] sm:text-sm"
        />

        {/* Vista previa con Next/Image + fallback */}
        <div className="mt-4">
          <Image
            src={watchedImage?.trim() || FALLBACK_IMAGE}
            alt="Vista previa del producto"
            width={128}
            height={128}
            className="h-32 w-32 rounded-md object-cover border border-gray-200"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.src.endsWith(FALLBACK_IMAGE)) {
                img.src = FALLBACK_IMAGE;
              }
            }}
          />
        </div>

        <label className="block text-sm font-medium text-gray-700 mt-4">
          Subir imagen
        </label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {uploading && <p className="text-sm text-gray-500 mt-1">Subiendo...</p>}
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={() => router.back()} className="btn">
          Cancel
        </button>
        <button type="submit" disabled={isPending} className="btn btn-primary">
          {isPending
            ? product
              ? "Updating..."
              : "Creating..."
            : product
            ? "Update Product"
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}
