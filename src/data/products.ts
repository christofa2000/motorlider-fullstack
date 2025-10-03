import type { Product } from "@/types";

const toCents = (value: number): number => Math.round(value * 100);

export const mockProducts: Product[] = [
  {
    id: "prd-1",
    name: "Filtro de aceite premium",
    slug: "filtro-aceite-premium",
    price: toCents(15999),
    brand: "Bosch",
    image: "/images/products/Filtro-de-aceite-premium.jpg",
    categoryId: "cat_motor",
    stock: 25,
  },
  {
    id: "prd-2",
    name: "Pastillas de freno ceramicas",
    slug: "pastillas-freno-ceramicas",
    price: toCents(34999),
    brand: "Brembo",
    image: "/images/products/Pastillas-de-freno-ceramicas.jpg",
    categoryId: "cat_frenos",
    stock: 12,
  },
  {
    id: "prd-3",
    name: "Amortiguador delantero",
    slug: "amortiguador-delantero",
    price: toCents(59999),
    brand: "Monroe",
    image: "/images/products/Amortiguador-delantero.jpg",
    categoryId: "cat_suspension",
    stock: 15,
  },
  {
    id: "prd-4",
    name: "Bomba de agua reforzada",
    slug: "bomba-agua-reforzada",
    price: toCents(45999),
    brand: "SKF",
    image: "/images/products/Bomba-de-agua-reforzada.jpg",
    categoryId: "cat_motor",
    stock: 8,
  },
  {
    id: "prd-5",
    name: "Kit de distribucion",
    slug: "kit-distribucion",
    price: toCents(74999),
    brand: "Gates",
    image: "/images/products/Kit-de-distribucion.jpg",
    categoryId: "cat_motor",
    stock: 10,
  },
  {
    id: "prd-6",
    name: "Discos de freno ventilados",
    slug: "discos-freno-ventilados",
    price: toCents(52999),
    brand: "TRW",
    image: "/images/products/Discos-de-freno-ventilados.jpg",
    categoryId: "cat_frenos",
    stock: 14,
  },
  {
    id: "prd-7",
    name: "Juego de bujias iridio",
    slug: "bujias-iridio",
    price: toCents(31999),
    brand: "NGK",
    image: "/images/products/Juego-de-bujias-iridio.jpg",
    categoryId: "cat_motor",
    stock: 30,
  },
  {
    id: "prd-8",
    name: "Barra estabilizadora delantera",
    slug: "barra-estabilizadora-delantera",
    price: toCents(64999),
    brand: "Moog",
    image: "/images/products/Barra-estabilizadora-delantera.jpg",
    categoryId: "cat_suspension",
    stock: 6,
  },
];

export const getMockProductById = (id: string): Product | undefined =>
  mockProducts.find((product) => product.id === id);

export const getMockPriceById = (id: string): number =>
  getMockProductById(id)?.price ?? 0;
