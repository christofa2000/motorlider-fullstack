import { redirect } from "next/navigation";

async function CategoryPage({
  params,
}: { params: { slug: string } | Promise<{ slug: string }> }) {
  const { slug } = params instanceof Promise ? await params : params;

  redirect(`/?cat=${encodeURIComponent(slug)}`);
}

export default CategoryPage as unknown as (props: { params: Promise<{ slug: string }> }) => ReturnType<typeof CategoryPage>;
