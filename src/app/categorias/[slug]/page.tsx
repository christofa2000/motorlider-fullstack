import { redirect } from "next/navigation";

export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  redirect(`/?cat=${encodeURIComponent(slug)}`);
}
