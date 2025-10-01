"use client";

import { Category, Product } from "@/generated/prisma";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema, productUpdateSchema } from "@/lib/validators/product";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { slugify } from "@/lib/slugify";

interface ProductFormProps {
  product?: Product;
  categories: Category[];
}

type ProductFormData = z.infer<typeof productCreateSchema>;

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch } = useForm<ProductFormData>({
    resolver: zodResolver(product ? productUpdateSchema : productCreateSchema),
    defaultValues: product
      ? { ...product, price: product.price / 100 }
      : { stock: 0 },
  });

  const name = watch("name");

  const onSubmit = async (data: ProductFormData) => {
    try {
      const response = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, price: Math.round(data.price * 100) }),
        }
      );

      const responseData = await response.json();

      if (responseData.ok) {
        toast({
          title: "Success",
          description: `Product ${product ? "updated" : "created"} successfully`,
        });
        router.push("/admin/products");
        router.refresh();
      } else {
        toast({ title: "Error", description: responseData.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          {...register("name")}
          className="input input-bordered w-full focus:ring-[var(--color-accent)]"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Slug</span>
        </label>
        <input
          {...register("slug")}
          readOnly
          className="input input-bordered w-full bg-gray-100"
          value={slugify(name || "")}
        />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Brand</span>
        </label>
        <input
          {...register("brand")}
          className="input input-bordered w-full focus:ring-[var(--color-accent)]"
        />
        {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Price (in pesos)</span>
          </label>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                step="0.01"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                className="input input-bordered w-full focus:ring-[var(--color-accent)]"
              />
            )}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Stock</span>
          </label>
          <Controller
            name="stock"
            control={control}
            render={({ field }) => (
              <input
                type="number"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
                className="input input-bordered w-full focus:ring-[var(--color-accent)]"
              />
            )}
          />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Image URL</span>
        </label>
        <input
          {...register("image")}
          className="input input-bordered w-full focus:ring-[var(--color-accent)]"
        />
        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Category</span>
        </label>
        <select
          {...register("categoryId")}
          className="select select-bordered w-full focus:ring-[var(--color-accent)]"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}