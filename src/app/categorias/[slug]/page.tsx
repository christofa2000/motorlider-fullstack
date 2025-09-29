import { redirect } from "next/navigation";

type PageProps = {
  params: { slug: string };
};

const CategoryRedirectPage = ({ params }: PageProps) => {
  redirect('/?cat=' + encodeURIComponent(params.slug));
  return null;
};

export default CategoryRedirectPage;
