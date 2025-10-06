"use client";

import { useToast } from "@/hooks/useToast";
import { slugify } from "@/lib/slugify";
import {
  ProductCreateData,
  productCreateSchema,
} from "@/lib/validators/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductCreateData>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          price: product.price / 100, // Convert cents to currency unit
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
        },
  });

  const watchedName = watch("name");

  useEffect(() => {
    if (watchedName) {
      setValue("slug", slugify(watchedName), { shouldValidate: true });
    }
  }, [watchedName, setValue]);

  const onSubmit = (data: ProductCreateData) => {
    startTransition(async () => {
      try {
        const apiPath = product
          ? `/api/products/${product.id}`
          : "/api/products";
        const method = product ? "PATCH" : "POST";

        const payload = {
          ...data,
          price: Math.round(data.price * 100), // Convert to cents
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
        router.refresh(); // Refetch server-side data
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
