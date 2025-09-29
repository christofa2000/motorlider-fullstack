import type { Product } from "../types";

export const products: Product[] = [
  {
    id: "prd-1",
    name: "Filtro de aceite premium",
    slug: "filtro-aceite-premium",
    price: 15999,
    brand: "Bosch",
    image: "/images/products/oil-filter.jpg",
    categoryId: "cat_motor",
    stock: 25,
  },
  {
    id: "prd-2",
    name: "Pastillas de freno ceramicas",
    slug: "pastillas-freno-ceramicas",
    price: 34999,
    brand: "Brembo",
    image: "/images/products/brake-pads.jpg",
    categoryId: "cat_frenos",
    stock: 12,
  },
  {
    id: "prd-3",
    name: "Amortiguador delantero",
    slug: "amortiguador-delantero",
    price: 59999,
    brand: "Monroe",
    image: "/images/products/front-shock.jpg",
    categoryId: "cat_suspension",
    stock: 15,
  },
  {
    id: "prd-4",
    name: "Bomba de agua reforzada",
    slug: "bomba-agua-reforzada",
    price: 45999,
    brand: "SKF",
    image: "/images/products/water-pump.jpg",
    categoryId: "cat_motor",
    stock: 8,
  },
  {
    id: "prd-5",
    name: "Kit de distribucion",
    slug: "kit-distribucion",
    price: 74999,
    brand: "Gates",
    image: "/images/products/timing-kit.jpg",
    categoryId: "cat_motor",
    stock: 10,
  },
  {
    id: "prd-6",
    name: "Discos de freno ventilados",
    slug: "discos-freno-ventilados",
    price: 52999,
    brand: "TRW",
    image: "/images/products/brake-discs.jpg",
    categoryId: "cat_frenos",
    stock: 14,
  },
  {
    id: "prd-7",
    name: "Juego de bujias iridio",
    slug: "bujias-iridio",
    price: 31999,
    brand: "NGK",
    image: "/images/products/spark-plugs.jpg",
    categoryId: "cat_motor",
    stock: 30,
  },
  {
    id: "prd-8",
    name: "Barra estabilizadora delantera",
    slug: "barra-estabilizadora-delantera",
    price: 64999,
    brand: "Moog",
    image: "/images/products/stabilizer-bar.jpg",
    categoryId: "cat_suspension",
    stock: 6,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getPriceById(id: string): number {
  const product = getProductById(id);
  return product?.price ?? 0;
}
