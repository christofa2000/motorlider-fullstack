import { productCreateSchema } from "@/lib/validators/product";

describe("Product Schema Validation", () => {
  describe("imageUrl validation", () => {
    it("debe aceptar URLs válidas que empiecen con /", () => {
      const validData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: "/images/products/test.jpg"
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBe("/images/products/test.jpg");
      }
    });

    it("debe aceptar URLs válidas que empiecen con http://", () => {
      const validData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: "http://example.com/image.jpg"
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBe("http://example.com/image.jpg");
      }
    });

    it("debe aceptar URLs válidas que empiecen con https://", () => {
      const validData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: "https://example.com/image.jpg"
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBe("https://example.com/image.jpg");
      }
    });

    it("debe aceptar URLs de Cloudinary", () => {
      const validData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: "res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg"
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBe("res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg");
      }
    });

    it("debe convertir strings vacíos a undefined", () => {
      const validData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: ""
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBeUndefined();
      }
    });

    it("debe convertir strings con solo espacios a undefined", () => {
      const validData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: "   "
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBeUndefined();
      }
    });

    it("debe rechazar URLs inválidas", () => {
      const invalidData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: "invalid-url"
      };

      const result = productCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("La URL debe iniciar con / o http(s)://");
      }
    });

    it("debe rechazar URLs que no empiecen con / o http", () => {
      const invalidData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1",
        image: "ftp://example.com/image.jpg"
      };

      const result = productCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("La URL debe iniciar con / o http(s)://");
      }
    });

    it("debe permitir image como undefined", () => {
      const validData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1"
        // image no está presente
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.image).toBeUndefined();
      }
    });
  });

  describe("otros campos", () => {
    it("debe validar datos completos válidos", () => {
      const validData = {
        name: "Amortiguador Delantero",
        slug: "amortiguador-delantero",
        brand: "Bosch",
        price: 15000,
        stock: 25,
        categoryId: "cat-1",
        image: "/images/products/amortiguador.jpg"
      };

      const result = productCreateSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("debe rechazar cuando falta name", () => {
      const invalidData = {
        slug: "test-product",
        price: 100,
        stock: 10,
        categoryId: "cat-1"
      };

      const result = productCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid input: expected string, received undefined");
      }
    });

    it("debe rechazar cuando falta categoryId", () => {
      const invalidData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: 10
      };

      const result = productCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Invalid input: expected string, received undefined");
      }
    });

    it("debe rechazar precio negativo", () => {
      const invalidData = {
        name: "Test Product",
        slug: "test-product",
        price: -100,
        stock: 10,
        categoryId: "cat-1"
      };

      const result = productCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("El precio debe ser un número positivo");
      }
    });

    it("debe rechazar stock negativo", () => {
      const invalidData = {
        name: "Test Product",
        slug: "test-product",
        price: 100,
        stock: -10,
        categoryId: "cat-1"
      };

      const result = productCreateSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("El stock debe ser un número entero positivo");
      }
    });
  });
});
