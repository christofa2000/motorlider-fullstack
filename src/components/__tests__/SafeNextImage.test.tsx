import SafeNextImage from "@/components/ui/SafeNextImage";
import { render, screen } from "@testing-library/react";

// Mock de next/image más específico para este test
jest.mock("next/image", () => {
  return function MockImage({
    unoptimized,
    priority,
    fill,
    loader,
    quality,
    sizes,
    placeholder,
    blurDataURL,
    onLoadingComplete,
    ...rest
  }: any) {
    // Eliminamos props que <img> no entiende
    return <img {...rest} />;
  };
});

describe("SafeNextImage", () => {
  it("debe renderizar imagen con src válida", () => {
    render(
      <SafeNextImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("debe usar fallback cuando src está vacío", () => {
    render(<SafeNextImage src="" alt="Test image" width={100} height={100} />);

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "/images/placeholder.png");
  });

  it("debe usar fallback cuando src es null", () => {
    render(
      <SafeNextImage src={null} alt="Test image" width={100} height={100} />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "/images/placeholder.png");
  });

  it("debe usar fallback cuando src es undefined", () => {
    render(
      <SafeNextImage
        src={undefined}
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "/images/placeholder.png");
  });

  it("debe usar fallback cuando src es inválida (no empieza con / o http)", () => {
    render(
      <SafeNextImage
        src="invalid-url"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "/images/placeholder.png");
  });

  it("debe aceptar URLs relativas que empiecen con /", () => {
    render(
      <SafeNextImage
        src="/images/products/test.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "/images/products/test.jpg");
  });

  it("debe aceptar URLs de Cloudinary", () => {
    render(
      <SafeNextImage
        src="res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg"
        alt="Test image"
        width={100}
        height={100}
      />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute(
      "src",
      "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg"
    );
  });

  it("debe usar fallbackSrc personalizado", () => {
    render(
      <SafeNextImage
        src="invalid-url"
        alt="Test image"
        width={100}
        height={100}
        fallbackSrc="/custom-fallback.jpg"
      />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "/custom-fallback.jpg");
  });

  it("debe propagar todas las props de Image", () => {
    render(
      <SafeNextImage
        src="https://example.com/image.jpg"
        alt="Test image"
        width={200}
        height={150}
        className="custom-class"
        priority
      />
    );

    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("width", "200");
    expect(img).toHaveAttribute("height", "150");
    expect(img).toHaveClass("custom-class");
  });
});
