import { fireEvent, render, screen } from "@testing-library/react";

import ProductImage from "@/components/ProductImage";

const FALLBACK_SRC = "/images/products/placeholder.png";

describe("ProductImage", () => {
  it("renders the provided image src and alt text", () => {
    render(
      <ProductImage
        src="/images/products/Filtro%20de%20aceite%20premium.jpg"
        alt="Filtro de aceite premium"
        width={120}
        height={120}
      />
    );

    const image = screen.getByRole("img", { name: /filtro de aceite premium/i });

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "/images/products/Filtro%20de%20aceite%20premium.jpg"
    );
  });

  it("falls back to the placeholder when the image fails to load", () => {
    render(
      <ProductImage
        src="/images/products/broken.jpg"
        alt="Broken part"
        width={120}
        height={120}
      />
    );

    const image = screen.getByRole("img", { name: /broken part/i });

    expect(image).toHaveAttribute("src", "/images/products/broken.jpg");

    fireEvent.error(image);

    expect(image).toHaveAttribute("src", FALLBACK_SRC);
  });

  it("does not loop when already using the fallback image", () => {
    render(
      <ProductImage
        src=""
        alt="Fallback"
        width={120}
        height={120}
      />
    );

    const image = screen.getByRole("img", { name: /fallback/i });

    expect(image).toHaveAttribute("src", FALLBACK_SRC);

    fireEvent.error(image);

    expect(image).toHaveAttribute("src", FALLBACK_SRC);
  });
});
